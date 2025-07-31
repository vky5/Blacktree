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

  @ManyToOne(() => User, (user) => user.deployments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' }) // it means create a foregin key of userId and typeorm by default uses uuid as foreign key that referes to primary key (here the primary key is user's uuid)
  user: User;

  @OneToMany(() => Endpoint, (endpoint) => endpoint.deployment)
  endpoints: Endpoint[];

  @Column({ type: 'varchar', nullable: true })
  portNumber: string;

  @Column({ type: 'jsonb', nullable: true })
  envVars: Record<string, string>;

  @OneToMany(() => DeploymentVersion, (ver) => ver.deployment, {
    // removed eager:true a lot of changes needed in backend
    // cascade: true, // we dont want that whenever a deploymnet is deleted all the created deploymnets from user account also gets deleted
    nullable: true,
    onDelete: 'CASCADE',
  })
  version: DeploymentVersion[];

  @Column({
    type: 'enum',
    enum: ResourceVersion,
    default: ResourceVersion.BASIC,
  })
  resourceVersion: ResourceVersion;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @Column({ type: 'text', array: true, nullable: true })
  tags: string[];

  @Column({ type: 'boolean', default: false }) // if other users can access that repo or not
  private: boolean;

  @Column({ type: 'varchar' })
  webhookid: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
