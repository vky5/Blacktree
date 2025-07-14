import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Deployment } from './deployment.entity';
import { DeploymentStatus } from 'src/utils/enums/deployment-status.enum';

@Entity('deployversion')
export class DeploymentVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Deployment, (deployment) => deployment.version)
  deployment: Deployment;

  @Column({ nullable: true })
  imageUrl: string | null;

  @Column({ nullable: true })
  taskDefinitionArn: string | null; // this is where we should store the register task definition ARN. And NOTE one ARN per deployment

  @Column({ nullable: true })
  taskArn: string | null;

  @Column({
    type: 'enum',
    enum: DeploymentStatus,
    default: DeploymentStatus.PENDING,
  })
  deploymentStatus: DeploymentStatus;

  @Column({ nullable: true })
  buildLogsUrl: string | null;

  @Column({ nullable: true })
  runTimeLogsUrl: string | null;
}
