import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deployment } from './entities/deployment.entity';
import { CreateDeploymentDTO } from './dto/deployment.dto';
import { DeploymentStatus } from 'src/utils/enums/deployment-status.enum';

@Injectable()
export class DeploymentService {
  constructor(
    @InjectRepository(Deployment)
    private deploymentRepo: Repository<Deployment>,
  ) {}

  createDeployment(
    deploymentData: CreateDeploymentDTO,
    userId: string,
  ): Promise<Deployment> {
    const newDeployment = this.deploymentRepo.create({
      name: deploymentData.name,
      repositoryUrl: deploymentData.repositoryUrl,
      dockerFilePath: deploymentData.dockerFilePath,
      deploymentStatus: DeploymentStatus.PENDING, // Default status
      user: { id: userId },
    });

    return this.deploymentRepo.save(newDeployment);
  }
}
