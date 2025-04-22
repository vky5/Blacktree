import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/users.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos/create-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  /**
   * Create a user from Clerk data after OAuth sign-in
   */
  async createFromClerk({
    email,
    firstName,
    lastName,
    imgUrl,
    clerkUserid,
  }: CreateUserDto) {
    const newUser = this.repo.create({
      email,
      firstName,
      lastName,
      imageUrl: imgUrl,
      clerkUserId: clerkUserid,
    });
    return this.repo.save(newUser);
  }

  findOneById(id: string): Promise<User | null> {
    return this.repo.findOneBy({ id });
  }

  findOneByEmail(email: string): Promise<User | null> {
    return this.repo.findOneBy({ email });
  }

  findOneByClerkId(clerkUserId: string): Promise<User | null> {
    return this.repo.findOneBy({ clerkUserId });
  }

  async updateUser(
    id: string,
    updateFields: Partial<User>,
  ): Promise<User | null> {
    const user = await this.repo.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = this.repo.merge(user, updateFields);
    return this.repo.save(updatedUser);
  }
}
