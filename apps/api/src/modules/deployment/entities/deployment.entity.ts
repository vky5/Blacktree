import {
  Column,
  PrimaryGeneratedColumn,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { DeploymentStatus } from 'src/utils/enums/deployment-status.enum';
import { User } from 'src/modules/users/entities/users.entity';

@Entity('deployment')
export class Deployment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  repositoryUrl: string;

  @Column({ type: 'varchar' })
  dockerFilePath: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  deployedUrl: string;

  @Column({
    type: 'enum',
    enum: DeploymentStatus,
    default: DeploymentStatus.PENDING,
  })
  deploymentStatus: string;

  @ManyToOne(() => User, (user) => user.deployments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
