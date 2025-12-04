import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ProductVariant } from '../database/entities/products/product-variant.entity';
import { Product } from '../database/entities/products/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { OrderStatus } from 'src/constants/order';
import { Order } from '../database/entities/orders/order.entity';
import { OrderDetail } from '../database/entities/orders/order-detail.entity';
import { VnpayIpnDto } from './dto/vnpay-ipn.dto';
import { Cart } from '../database/entities/carts/cart.entity';
import { CartItem } from '../database/entities/carts/cart-item.entity';
@Injectable()
export class PaymentService {
  private readonly vnpTmnCode: string;
  private readonly vnpHashSecret: string;
  private readonly vnpUrl: string;
  private readonly vnpReturnUrl: string;
  private readonly vnpIpnUrl: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(ProductVariant)
    private readonly productVariantRepository: Repository<ProductVariant>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderDetail)
    private readonly orderDetailRepository: Repository<OrderDetail>,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
  ) {
    this.vnpTmnCode = this.configService.get<string>('VNPAY_TMN_CODE') ?? '';
    this.vnpHashSecret =
      this.configService.get<string>('VNPAY_HASH_SECRET') ?? '';
    this.vnpUrl =
      this.configService.get<string>('VNPAY_URL') ??
      'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    this.vnpReturnUrl =
      this.configService.get<string>('VNPAY_RETURN_URL') ?? '';
    this.vnpIpnUrl = this.configService.get<string>('VNPAY_IPN_URL') ?? '';

    if (!this.vnpTmnCode || !this.vnpHashSecret || !this.vnpReturnUrl) {
      throw new InternalServerErrorException(
        'VNPay configuration is missing. Please check environment variables.',
      );
    }
  }

  async createPaymentUrl(
    dto: CreatePaymentDto,
    clientIp: string,
    userId?: number,
  ) {
    const productVariants = await this.productVariantRepository.find({
      where: { id: In(dto.productVariants.map((v) => v.variantId)) },
    });
    if (productVariants.length !== dto.productVariants.length) {
      throw new BadRequestException('Some product variants not found');
    }
    const order = this.orderRepository.create({
      status: OrderStatus.PENDING,
      note: dto.note,
      ...(userId ? { user: { id: userId } as Order['user'] } : {}),
    });
    const savedOrder = await this.orderRepository.save(order);
    const orderDetails = productVariants.map((variant) =>
      this.orderDetailRepository.create({
        order,
        variant,
        quantity: dto.productVariants.find((v) => v.variantId === variant.id)
          ?.quantity,
        unitPrice: variant.price,
      }),
    );
    await this.orderDetailRepository.save(orderDetails);
    const totalOrderAmount = orderDetails.reduce(
      (acc, detail) => acc + detail.unitPrice * detail.quantity,
      0,
    );
    const vnpParams: Record<string, string> = this.buildBaseParams(
      dto,
      clientIp,
      totalOrderAmount,
      savedOrder.id,
      userId ?? 0,
    );

    if (dto.bankCode) {
      vnpParams['vnp_BankCode'] = dto.bankCode;
    }

    const signData = this.buildSignData(vnpParams);
    const secureHash = this.sign(signData);

    vnpParams['vnp_SecureHash'] = secureHash;
    const sortedParams = this.sortObject(vnpParams);
    const paymentUrl = `${this.vnpUrl}?${this.buildQueryString(sortedParams)}`;

    return { paymentUrl };
  }

  handleReturn(query: Record<string, string>) {
    const { isValid, data } = this.verifySignature(query);

    return {
      isValid,
      responseCode: data?.vnp_ResponseCode,
      orderId: data?.vnp_TxnRef,
      transactionNo: data?.vnp_TransactionNo,
      amount: data?.vnp_Amount ? Number(data.vnp_Amount) / 100 : undefined,
    };
  }

  async handleIpn(query: VnpayIpnDto) {
    const { isValid, data } = this.verifySignature(
      query as unknown as Record<string, string>,
    );

    if (!isValid || !data) {
      console.log('Invalid signature');
      return { RspCode: '97', Message: 'Invalid signature' };
    }

    const responseCode = data.vnp_ResponseCode;

    if (responseCode === '00') {
      console.log('decoded txn ref:', this.decodeTxnRef(data.vnp_TxnRef));
      // TODO: update order status here
      const { orderId } = this.decodeTxnRef(data.vnp_TxnRef);
      const order = await this.orderRepository.findOne({
        where: { id: orderId },
      });
      if (!order) {
        console.log('Order not found');
        return { RspCode: '98', Message: 'Order not found' };
      }
      order.status = OrderStatus.PAID;
      await this.orderRepository.save(order);
      const orderDetails = await this.orderDetailRepository.find({
        where: { order: { id: orderId } },
      });
      for (const orderDetail of orderDetails) {
        const cartItem = await this.cartItemRepository.findOne({
          where: {
            cart: { user: { id: order.user.id } },
            variant: { id: orderDetail.variant.id },
          },
        });
        if (cartItem) {
          const newQuantity = cartItem.quantity - orderDetail.quantity;
          if (newQuantity > 0) {
            cartItem.quantity = newQuantity;
            await this.cartItemRepository.save(cartItem);
          } else {
            await this.cartItemRepository.remove(cartItem);
          }
          await this.cartItemRepository.save(cartItem);
        }
      }
      return { RspCode: '00', Message: 'Success' };
    }

    console.log('Payment failed');
    return { RspCode: responseCode ?? '01', Message: 'Payment failed' };
  }

  private buildBaseParams(
    dto: CreatePaymentDto,
    clientIp: string,
    totalAmount: number,
    orderId: number,
    userId: number,
  ) {
    const now = new Date();
    const expireDate = new Date(now.getTime() + 15 * 60 * 1000); // +15 minutes

    const vnpCreateDate = this.formatDate(now);
    const vnpExpireDate = this.formatDate(expireDate);
    const vnp_TxnRef = this.encodeTxnRef(userId, orderId);
    const baseParams: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.vnpTmnCode,
      vnp_Amount: (totalAmount * 100).toString(),
      vnp_CurrCode: 'VND',
      vnp_TxnRef,
      vnp_OrderInfo: `Order ${orderId} - ${totalAmount} VND`,
      vnp_OrderType: 'other',
      vnp_Locale: dto.locale ?? 'vn',
      vnp_ReturnUrl: this.vnpReturnUrl,
      vnp_IpAddr: clientIp, // IP address of customer
      vnp_CreateDate: vnpCreateDate,
      vnp_ExpireDate: vnpExpireDate,
    };

    return baseParams;
  }

  private formatDate(date: Date) {
    // Sử dụng giờ local của môi trường chạy (nên cấu hình TZ=Asia/Ho_Chi_Minh trên server)
    const pad = (n: number) => n.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  private sortObject(obj: Record<string, string>) {
    const sorted: Record<string, string> = {};
    const keys = Object.keys(obj);
    keys.sort();
    keys.forEach((key) => {
      sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, '+');
    });
    return sorted;
  }

  private buildSignData(params: Record<string, string>) {
    const sorted = this.sortObject(params);
    return this.buildQueryString(sorted);
  }

  private sign(signData: string) {
    return crypto
      .createHmac('sha512', this.vnpHashSecret)
      .update(signData, 'utf-8')
      .digest('hex');
  }

  private buildQueryString(params: Record<string, string>) {
    return Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join('&');
  }

  private verifySignature(query: Record<string, string>) {
    const data = { ...query };
    const receivedSecureHash = data['vnp_SecureHash'];
    delete data['vnp_SecureHash'];
    delete data['vnp_SecureHashType'];

    const sorted = this.sortObject(data as Record<string, string>);
    const signData = this.buildQueryString(sorted);
    const calculatedHash = this.sign(signData);
    const isValid =
      (receivedSecureHash ?? '').toLowerCase() === calculatedHash.toLowerCase();

    return { isValid, data };
  }

  public encodeTxnRef(userId: number, orderId: number): string {
    const payload = `${userId}:${orderId}`;
    return Buffer.from(payload, 'utf8').toString('base64');
  }

  public decodeTxnRef(ref: string): {
    userId: number;
    orderId: number;
  } {
    try {
      const decoded = Buffer.from(ref, 'base64').toString('utf8');
      console.log('decoded:', decoded);
      const [userIdStr, orderIdStr] = decoded.split(':');
      const userId = Number(userIdStr);
      const orderId = Number(orderIdStr);

      if (!userId || !orderId) {
        throw new Error('Invalid ids');
      }

      return { userId, orderId };
    } catch {
      throw new BadRequestException('Invalid transaction reference');
    }
  }
}
