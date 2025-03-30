import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';

// importing various module
import { UsersModule } from './module/users/users.module';
import { AuthModule } from './module/auth/auth.module';
import { ConfigModule } from '@nestjs/config';

// importing entities
import { Users } from './module/users/entities/users.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: './config.env',
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      url: 'postgresql://vky5:passwd@localhost:5432/blacktree',
      entities: [Users],
      synchronize: true,
      logging: true,
    }),

    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
