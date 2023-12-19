import { BadRequestException, Injectable } from '@nestjs/common';
import { MulterModuleOptions } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Injectable()
export class MulterConfigService {
  static createMulterOptions(): MulterModuleOptions {
    return {
      storage: diskStorage({
        destination: '/app/uploads', // 파일이 저장될 경로
        filename: (req, file, callback) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const extension = file.originalname.split('.').pop();
          const filename = `${uniqueSuffix}.${extension}`;
          callback(null, filename);
        },
      }),
      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedMimeTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(
            new BadRequestException('jpeg, png, gif 확장자를 가진 파일만 가능합니다.'),
            false,
          );
        }
      },
      limits: {
        fileSize: 1600000, // 1600KB (1.6MB) 이하만 허용
      },
    };
  }
}
