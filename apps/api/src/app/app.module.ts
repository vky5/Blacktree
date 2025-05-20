import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';

// importing various module
import { ConfigModule } from '@nestjs/config';

// importing entites
import { User } from 'src/modules/users/entities/users.entity';
import { Deployment } from 'src/modules/deployment/entities/deployment.entity';

// importing modules
import { UsersModule } from 'src/modules/users/users.module';
import { DeploymentModule } from 'src/modules/deployment/deployment.module';

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
      entities: [User, Deployment],
      synchronize: true,
    }),

    // importing different modules
    UsersModule,
    DeploymentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
