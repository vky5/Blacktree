import {
  Column,
  PrimaryGeneratedColumn,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';

import { User } from 'src/modules/users/entities/users.entity';
import { Endpoint } from './endpoint.entity';
import { DeploymentVersion } from './deployment-version.entity';
import { ResourceVersion } from 'src/utils/enums/resource-version.enum';

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

  @Column({ type: 'varchar', nullable: false, default: '.' })
  contextDir: string; // Context directory for Docker build

  @Column({ type: 'varchar', length: 255, nullable: true })
  deployedUrl: string;

  @ManyToOne(() => User, (user) => user.deployments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Endpoint, (endpoint) => endpoint.deployment)
  endpoints: Endpoint[];

  @Column({ type: 'varchar', nullable: true })
  portNumber: string;

  @Column({ type: 'jsonb', nullable: true })
  envVars: Record<string, string>;

  @OneToOne(() => DeploymentVersion, (ver) => ver.deployment, {
    cascade: true,
    eager: true,
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'versionId' }) // Makeing this the owning side of the relation
  version: DeploymentVersion;

  @Column({ type: 'boolean', default: true })
  autoDeploy: boolean;

  @Column({
    type: 'enum',
    enum: ResourceVersion,
    default: ResourceVersion.BASIC,
  })
  resourceVersion: ResourceVersion;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
