import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { EndpointMethod } from 'src/utils/enums/endpoint-method.enum'; // Assuming you have an enum for HTTP methods
import { Deployment } from './deployment.entity';

/*
Data that can be stored 
- id: string;
- route: string; // The route or path of the endpoint
- method: string; 
- description: string; // A brief description of the endpoint
- deploymentId: string; // Foreign key to the deployment this endpoint belongs to
*/
@Entity('endpoint')
export class Endpoint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  route: string; // The route or path of the endpoint

  @Column({ type: 'enum', enum: EndpointMethod, default: EndpointMethod.GET })
  method: EndpointMethod; // HTTP method (GET, POST, etc.)

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string; // A brief description of the endpoint

  @ManyToOne(() => Deployment, (deployment) => deployment.endpoints, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'deploymentId' })
  deployment: Deployment;
}
