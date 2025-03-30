import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from './entities/users.entity';

import allowedUserFields from './conf/allowedFields';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(Users) private repo: Repository<Users>) {}

  createUsers(email: string, password: string, name: string) {
    const newUsr = this.repo.create({ email, password, name });

    return this.repo.save(newUsr);
  }

  findUserByEmail(email: string): Promise<Users | null> {
    // this already returns a promise
    return this.repo.findOneBy({ email });
  }

  findUserById(id: string): Promise<Users | null> {
    return this.repo.findOneBy({ id });
  }

  // from this updateUser please specify which fields are allowed to be updated both at dto and at service layer
  async updateUser(id: string, updateFields: Partial<Users>) {
    const user = await this.findUserById(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const filteredObj = Object.keys(updateFields).reduce((acc, field) => {
      if (allowedUserFields.includes(field)) {
        acc[field] = updateFields[field];
      }
      return acc;
    }, {});

    await this.repo.update(id, filteredObj);
  }
}
