import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Deployment } from './deployment.entity';
import { DeploymentStatus } from 'src/utils/enums/deployment-status.enum';

@Entity('deployversion')
export class DeploymentVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Deployment, (deployment) => deployment.version)
  deployment: Deployment;

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string | null;

  @Column({ type: 'varchar', nullable: true })
  taskDefinitionArn: string | null; // this is where we should store the register task definition ARN. And NOTE one ARN per deployment

  @Column({ type: 'varchar', nullable: true })
  taskArn: string | null;

  @Column({
    type: 'enum',
    enum: DeploymentStatus,
    default: DeploymentStatus.PENDING,
  })
  deploymentStatus: DeploymentStatus;

  @Column({ type: 'varchar', nullable: true })
  buildLogsUrl: string | null;

  @Column({ type: 'varchar', nullable: true })
  runTimeLogsUrl: string | null;
}
