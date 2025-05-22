import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe, Logger } from '@nestjs/common';

import * as cookieparser from 'cookie-parser';
import { AllExceptionsFilter } from './common/filters/allexcetion.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  }); // Enable logging at different levels

  app.use(cookieparser());

  app.enableCors({
    origin: process.env.FRONTEND_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, //credentials option is used to allow cookies, authorization headers, or TLS client certificates to be included in cross-origin HTTP requests.
  });

  // when sending cookie express is enough but when reading cookie we do need cookie parser and for next application we need new Cookies to setup cookies
  app.use(cookieparser());

  // creating the global prefix for the backend
  const globalPrefix = 'api/v1';
  app.setGlobalPrefix(globalPrefix);

  // setting the global pipe to validate all incoming request to match the instance of their DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // this option strips out any extra incoming data that comes along with the bo1dy for example admin: true if not defined in dto it will strip it out
      transform: true, // automatically transform object to dto instance
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  // seting up default port to listen
  const port = process.env.PORT || 3000;
  await app.listen(port);

  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

void bootstrap();
