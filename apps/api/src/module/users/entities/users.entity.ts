import { BeforeInsert, Column, PrimaryGeneratedColumn } from 'typeorm';
import * as bcrypt from 'bcryptjs';

export class Users {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  // Hash password before inserting a new user
  @BeforeInsert()
  async hashPassword(): Promise<void> {
    this.password = await bcrypt.hash(this.password, 12);
  }

  async setPassword(rawPassword: string): Promise<void> {
    if (rawPassword) {
      this.password = await bcrypt.hash(rawPassword, 12);
    }
  }

  async verifyPassword(rawPassword: string): Promise<boolean> {
    if (!this.password) {
      return false;
    }

    return await bcrypt.compare(rawPassword, this.password);
  }
}
