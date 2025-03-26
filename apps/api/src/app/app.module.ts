import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

// importing different controllers and services
import { AppController } from './app.controller';
import { AppService } from './app.service';

// importing modules

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: './config.env',
      isGlobal: true,
    }),

    // created local db for faster development and testing
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: 'postgresql://vky5:passwd@localhost:5432/blacktree',
      entities: [],
      synchronize: true,
      logging: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
