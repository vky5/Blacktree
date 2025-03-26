import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';

@Entity('Users')
export class Users {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 15, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 60, nullable: true }) // because when someone login with github they wont need password unless they set it up manually (for Oauth)
  password: string;
}
