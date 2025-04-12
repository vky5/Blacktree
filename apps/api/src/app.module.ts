import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';

// importing various module
import { ConfigModule } from '@nestjs/config';

// importing entites
import { User } from './modules/users/entities/users.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: './.env',
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE as
        | 'postgres'
        | 'mysql'
        | 'sqlite'
        | 'mariadb'
        | 'mongodb',
      url: process.env.DB_URL,
      entities: [User],
      synchronize: true,
      // logging: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
