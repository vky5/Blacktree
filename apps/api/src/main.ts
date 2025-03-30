import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // creating the global prefix for the backend
  const globalPrefix = 'api/v1';
  app.setGlobalPrefix(globalPrefix);

  // setting the global pipe to validate all incoming request to match the instance of their DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // setting up global unique key constraints for DB...
  // app.useGlobalFilters(new UniqueCons)

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
