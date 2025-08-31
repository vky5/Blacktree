import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Deployment } from './deployment.entity';
import { DeploymentStatus } from 'src/utils/enums/deployment-status.enum';
import { User } from 'src/modules/users/entities/users.entity';

@Entity('deployversion')
export class DeploymentVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Deployment, (deployment) => deployment.version)
  deployment: Deployment;

  @ManyToOne(() => User, (user) => user.hosted, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  /*deploymentVersion.userId; // foreign key (if you select it)
deploymentVersion.user;   // full User entity (if relation loaded)
*/

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string | null;

  @Column({ type: 'varchar', nullable: true })
  taskDefinitionArn: string | null; // this is where we should store the register task definition ARN. And NOTE one ARN per deployment

  @Column({ type: 'varchar', nullable: true })
  taskArn: string | null;

  @Column({ type: 'boolean', default: true })
  autoDeploy: boolean;

  @Column({ type: 'varchar', nullable: true })
  deploymentUrl: string;

  @Column({
    type: 'enum',
    enum: DeploymentStatus,
    default: DeploymentStatus.PENDING,
  })
  deploymentStatus: DeploymentStatus;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'varchar', nullable: true })
  buildLogsUrl: string | null;

  @Column({ type: 'varchar', nullable: true })
  runTimeLogsUrl: string | null;
}
