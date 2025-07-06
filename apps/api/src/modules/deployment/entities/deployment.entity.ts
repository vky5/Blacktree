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
  repository: string; // GitHub URL

  @Column({ type: 'varchar', length: 100, default: 'main' })
  branch: string;

  @Column({ type: 'varchar', nullable: false })
  dockerFilePath: string; // Path to Dockerfile

  @Column({ type: 'varchar', nullable: true })
  composeFilePath: string; // Path to docker-compose.yml (optional)

  @Column({ type: 'varchar', nullable: false, default: '.' })
  contextDir: string; // Context directory for Docker build

  @Column({ type: 'varchar', length: 255, nullable: true })
  deployedUrl: string;

  @Column({
    type: 'enum',
    enum: DeploymentStatus,
    default: DeploymentStatus.PENDING,
  })
  deploymentStatus: DeploymentStatus;

  @ManyToOne(() => User, (user) => user.deployments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Endpoint, (endpoint) => endpoint.deployment)
  endpoints: Endpoint[];

  @Column({ type: 'varchar', nullable: true })
  portNumber: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
