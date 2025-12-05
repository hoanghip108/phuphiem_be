/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Order } from '../database/entities/orders/order.entity';
import { OrderDetail } from '../database/entities/orders/order-detail.entity';
import { ProductVariant } from '../database/entities/products/product-variant.entity';
import { OrderStatus } from '../../constants/order';
import { CreateOrderDto, OrderItemDto } from './dto/create-order.dto';

interface CreateOrderResult {
  order: Order;
  orderDetails: OrderDetail[];
  totalAmount: number;
}

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderDetail)
    private readonly orderDetailRepository: Repository<OrderDetail>,
    @InjectRepository(ProductVariant)
    private readonly productVariantRepository: Repository<ProductVariant>,
  ) {}

  /**
   * Tạo order kèm orderDetails từ DTO thanh toán.
   * Trả về order đã lưu, danh sách orderDetails và tổng tiền.
   */
  async createOrderFromPaymentDto(
    dto: CreateOrderDto,
    userId?: number,
  ): Promise<CreateOrderResult> {
    const items: OrderItemDto[] = Array.isArray(dto.items)
      ? dto.items.map((item) => {
          if (
            typeof item?.variantId !== 'number' ||
            typeof item?.quantity !== 'number'
          ) {
            throw new BadRequestException('Invalid order item');
          }
          return {
            variantId: item.variantId,
            quantity: item.quantity,
            note: item.note,
          };
        })
      : [];
    const variantIds = items.map((v) => v.variantId);
    const productVariants = await this.productVariantRepository.find({
      where: { id: In(variantIds) },
    });
    if (productVariants.length !== variantIds.length) {
      throw new BadRequestException('Some product variants not found');
    }

    const order = this.orderRepository.create({
      status: OrderStatus.PENDING,
      ...(userId ? { user: { id: userId } as Order['user'] } : {}),
    });
    const savedOrder = await this.orderRepository.save(order);

    const orderDetails = productVariants.map((variant) =>
      this.orderDetailRepository.create({
        order: savedOrder,
        variant,
        quantity: items.find((v) => v.variantId === variant.id)?.quantity ?? 0,
        unitPrice: variant.price,
        note: items.find((v) => v.variantId === variant.id)?.note ?? null,
      }),
    );
    await this.orderDetailRepository.save(orderDetails);

    const totalAmount = orderDetails.reduce(
      (acc, detail) => acc + detail.unitPrice * detail.quantity,
      0,
    );

    return { order: savedOrder, orderDetails, totalAmount };
  }
  async getOrdersByUserId(userId: number): Promise<Order[]> {
    return this.orderRepository.find({
      where: { user: { id: userId } },
      relations: ['orderDetails', 'orderDetails.variant'],
    });
  }
}
