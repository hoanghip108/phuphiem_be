import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('upload-test')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  // Use `any` type here to avoid dependency on Express.Multer typings for this simple sample
  // You can replace `any` with `Express.Multer.File` if you have the proper types installed.
  async upload(@UploadedFile() file: any) {
    return this.uploadService.uploadFile(file);
  }
}
