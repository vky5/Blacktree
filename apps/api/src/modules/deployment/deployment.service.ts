import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deployment } from './entities/deployment.entity';
import { CreateDeploymentDTO } from './dto/deployment.dto';

@Injectable()
export class DeploymentService {
  constructor(
    @InjectRepository(Deployment)
    private deploymentRepo: Repository<Deployment>,
  ) {}

  // for creating a new deployment
  async createDeployment(
    deploymentData: CreateDeploymentDTO,
    userId: string,
  ): Promise<Deployment> {
    const res = await this.deploymentRepo.findOne({
      where: {
        branch: deploymentData.branch,
        repository: deploymentData.repository,
      },
    });

    if (res) {
      throw new BadRequestException(
        'Deployment of similar data already exists',
      );
    }

    const newDeployment = this.deploymentRepo.create({
      name: deploymentData.name,
      repository: deploymentData.repository,
      dockerFilePath: deploymentData.dockerFilePath,
      branch: deploymentData.branch,
      contextDir: deploymentData.contextDir,
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

  findByIdWithUser(deploymentId: string): Promise<Deployment | null> {
    return this.deploymentRepo.findOne({
      where: { id: deploymentId },
      relations: ['user'], // Include user relation
      select: {
        id: true,
      },
    });
  }

  // getting a deployment info
  async deploymentInfo(id: string) {
    const deployment = await this.deploymentRepo.findOneBy({ id });

    if (!deployment) {
      throw new NotFoundException('No deployment of this id found');
    }

    return deployment;
  }
}
