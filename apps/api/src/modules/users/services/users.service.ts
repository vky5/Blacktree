import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../entities/users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(Users) private repo: Repository<Users>) {}

  createUser(email: string, password: string, username: string) {
    // this is going to create a promise that can be used to save the data that we want to save in the db
    const newUser = this.repo.create({ email, password, username });
    return this.repo.save(newUser); // this is going to return a promise that is going to save the data in the db
  }

  saveEmail(email: string) {
    const savedEmail = this.repo.create({ email });
    return this.repo.save(savedEmail);
  }

  findOneById(id: string): Promise<Users | null> {
    return this.repo.findOneBy({ id });
  }

  findOneByEmail(email: string): Promise<Users | null> {
    // this already returns a promise
    return this.repo.findOneBy({ email });
  }

  // we could verify if the id is correct or not here and then return appropriate errors but remember
  async updateUser(
    id: string,
    updateFields: Partial<Users>,
  ): Promise<Users | null> {
    const user = await this.findOneById(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    Object.assign(user, updateFields);
    const updatedUser = this.repo.create({ ...user, ...updateFields });

    // Save and trigger hooks
    return this.repo.save(updatedUser);
  }
}
