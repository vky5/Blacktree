import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Endpoint } from './entities/endpoint.entity';
import { CreateEndpointDto } from './dto/endpoint.dto';

@Injectable()
export class EndpointService {
  constructor(
    @InjectRepository(Endpoint)
    private readonly repo: Repository<Endpoint>,
  ) {}

  /**
   * Create a new endpoint under a given deployment
   */
  async createEndpoint(
    endpointData: CreateEndpointDto,
    deploymentId: string,
  ): Promise<Endpoint> {
    const newEndpoint = this.repo.create({
      route: endpointData.route,
      method: endpointData.method,
      description: endpointData.description,
      deployment: { id: deploymentId },
    });

    return this.repo.save(newEndpoint);
  }

  // delete an endpoint by its ID
  async deleteEndpoint(endpointId: string): Promise<void> {
    const result = await this.repo.delete(endpointId);
    if (result.affected === 0) {
      throw new Error(`Endpoint with id ${endpointId} not found`);
    }
  }

  // update an endpoint by its ID
  async updateEndpoint(
    endpointId: string,
    updateData: Partial<CreateEndpointDto>,
  ): Promise<Endpoint> {
    const endpoint = await this.repo.findOneBy({ id: endpointId });
    if (!endpoint) {
      throw new Error(`Endpoint with id ${endpointId} not found`);
    }
    const updatedEndpoint = this.repo.merge(endpoint, updateData);
    return this.repo.save(updatedEndpoint);
  }

  // get all endpoints of a deployment id
  async getEndpointsByDeploymentId(deploymentId: string): Promise<Endpoint[]> {
    return this.repo.find({
      where: { deployment: { id: deploymentId } },
      relations: ['deployment'], // Include deployment relation if needed
      select: {
        route: true,
        method: true,
        description: true,
      },
    });
  }

  // for finding the endpoint by its ID with deployment and user relations
  async findByIdWithDeploymentAndUser(
    endpointId: string,
  ): Promise<Endpoint | null> {
    return this.repo.findOne({
      where: { id: endpointId },
      relations: ['deployment', 'deployment.user'],
    });
  }
}
