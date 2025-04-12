import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  createUser(email: string, password: string, name: string) {
    const newUser = this.repo.create({ email, password, name });
    return this.repo.save(newUser); // this is going to return a promise that is going to save the data in the db
  }

  findOneById(id: string): Promise<User | null> {
    return this.repo.findOneBy({ id });
  }

  findOneByEmail(email: string): Promise<User | null> {
    return this.repo.findOneBy({ email });
  }

  async updateUser(
    id: string,
    updateFields: Partial<User>,
  ): Promise<User | null> {
    const user = await this.repo.findOneBy({ id });

    // even tho I will ensure not to call this method until it passed throw jwt but just to be sure I will leave this cehck here because
    // if the user doesnt exist and somewhere we can update this we can create user without signup method...
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = this.repo.merge(user, updateFields);
    return this.repo.save(updatedUser);
  }
}
