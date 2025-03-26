import { Global, Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './entities/users.entity';

// importing controllers
import { UsersController } from './controllers/users.controller';

// importing services
import { UsersService } from './services/users.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Users])],
  providers: [
    {
      // this is another way to create Providers
      provide: UsersService, // injection token
      useClass: UsersService, // provider instance
    },
  ],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
