import { IsString, IsOptional, IsEnum } from 'class-validator';
import { Expose } from 'class-transformer';
import { EndpointMethod } from 'src/utils/enums/endpoint-method.enum';

export class CreateEndpointDto {
  @Expose()
  @IsString()
  route: string;

  @Expose()
  @IsEnum(EndpointMethod)
  method: EndpointMethod;

  @Expose()
  @IsOptional()
  @IsString()
  description?: string;
}
