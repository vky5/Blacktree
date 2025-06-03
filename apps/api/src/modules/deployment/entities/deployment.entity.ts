import {
  Column,
  PrimaryGeneratedColumn,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

import { DeploymentStatus } from 'src/utils/enums/deployment-status.enum';
import { User } from 'src/modules/users/entities/users.entity';
import { Endpoint } from './endpoint.entity';

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

  @Column({ type: 'varchar' })
  branch: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  deployedUrl: string;

  @Column({
    type: 'enum',
    enum: DeploymentStatus,
    default: DeploymentStatus.PENDING,
  })
  deploymentStatus: DeploymentStatus;

  @ManyToOne(() => User, (user) => user.deployments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' }) // by default @primarygeneratedcolumn will be use as foreign key but referencedColumnName can be passed
  user: User;

  @OneToMany(() => Endpoint, (endpoint) => endpoint.deployment)
  endpoints: Endpoint[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
