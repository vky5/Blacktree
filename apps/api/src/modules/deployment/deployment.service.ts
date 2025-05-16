import { InjectRepository } from '@nestjs/typeorm';
import { Deployment } from './entities/deployment.entity';
import { Repository } from 'typeorm';

export class DeploymentService {
  constructor(
    @InjectRepository(Deployment) private repo: Repository<Deployment>,
  ) {}

  saveInfo() {
    

  }
}

/*
Requirements for the service
1. First save the info about the API 

2. 

*/
