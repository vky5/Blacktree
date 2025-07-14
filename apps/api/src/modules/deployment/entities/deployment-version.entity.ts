import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Deployment } from './deployment.entity';
import { DeploymentStatus } from 'src/utils/enums/deployment-status.enum';

@Entity('deployversion')
export class DeploymentVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Deployment, (deployment) => deployment.versions)
  deployment: Deployment;

  @Column()
  imageUrl: string;

  @Column()
  taskArn: string;

  @Column({
    type: 'enum',
    enum: DeploymentStatus,
    default: DeploymentStatus.PENDING,
  })
  deploymentStatus: DeploymentStatus;

  @Column({ nullable: true })
  buildLogsUrl: string;

  @Column({ nullable: true })
  runTimeLogsUrl: string;
}
