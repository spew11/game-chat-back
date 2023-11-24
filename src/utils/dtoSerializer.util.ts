import { plainToInstance } from 'class-transformer';
import { ClassConstructor } from 'src/interceptors/serializer.interceptor';

export function dtoSerializer(dtoClass: ClassConstructor, rawData: any) {
  const serializedData = plainToInstance(dtoClass, rawData, {
    excludeExtraneousValues: true,
    enableImplicitConversion: true,
  });

  return serializedData;
}
