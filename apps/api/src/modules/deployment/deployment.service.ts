import { Injectable, InternalServerErrorException } from '@nestjs/common';
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

  // for creating a new deployment

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

  // for updating an existing deployment
  async updateDeployment(
    deploymentId: string,
    updateData: Partial<CreateDeploymentDTO>,
  ): Promise<Deployment> {
    const deployment = await this.deploymentRepo.findOneBy({
      id: deploymentId,
    });

    if (!deployment) {
      throw new Error('Deployment not found');
    }

    const updateDeployment = this.deploymentRepo.merge(deployment, updateData);
    return this.deploymentRepo.save(updateDeployment);
  }

  // for deleting a deployment
  async deleteDeployment(deploymentId: string): Promise<void> {
    try {
      await this.deploymentRepo.delete(deploymentId);
    } catch (error) {
      console.error('Error deleting deployment:', error);
      throw new InternalServerErrorException('Failed to delete deployment');
    }
  }
}
