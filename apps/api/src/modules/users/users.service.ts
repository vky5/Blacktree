import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/users.entity';
import { UserDto } from './dtos/user.dto';

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
    // fixed naming for consistency
  }: UserDto) {
    // Optional: Prevent duplicate users by email
    // const existing = await this.repo.findOneBy({ email });
    // if (existing) return existing;

    const newUser = this.repo.create({
      email,
      firstName,
      lastName,
      imageUrl: imgUrl,
      clerkUserId: clerkUserid,
    });
    return this.repo.save(newUser);
  }

  /**
   * Find a user by their UUID
   */
  findOneById(id: string): Promise<User | null> {
    return this.repo.findOneBy({ id });
  }

  /**
   * Find a user by their email address
   */
  findOneByEmail(email: string): Promise<User | null> {
    return this.repo.findOneBy({ email });
  }

  /**
   * Find a user by Clerk user ID (used for auth integration)
   */
  findOneByClerkId(clerkUserId: string): Promise<User | null> {
    return this.repo
      .createQueryBuilder('user') // this initilazies a query for the user entity and from now on we refer to this entity using user as alias
      .addSelect('user.clerkUserId') // this tells typeorm explicitly to include clerk in the result
      .where('user.clerkUserId = :clerkUserId', { clerkUserId }) //
      .getOne(); // returns null if no match returns one if one matches
  }

  /**
   * Update a user with partial fields (safe merge)
   */
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
