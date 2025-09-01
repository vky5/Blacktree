import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deployment } from '../entities/deployment.entity';
import { CreateDeploymentDTO } from '../dto/deployment.dto';
import { AuthService } from 'src/modules/users/auth.service';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/modules/users/users.service';
import { DeploymentVersion } from '../entities/deployment-version.entity';
import { repoNameFormatter } from 'src/utils/repoNameFormatter';

@Injectable()
export class DeploymentService {
  constructor(
    @InjectRepository(Deployment)
    private deploymentRepo: Repository<Deployment>,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    @InjectRepository(DeploymentVersion)
    private deploymentVersionRepo: Repository<DeploymentVersion>,
  ) {}

  // for creating a new deployment
  async createDeployment(
    deploymentData: CreateDeploymentDTO,
    userId: string,
  ): Promise<Deployment> {
    const existingDeployment = await this.deploymentRepo.findOne({
      where: {
        branch: deploymentData.branch,
        repository: deploymentData.repository,
        user: { id: userId },
      },
    });

    if (existingDeployment) {
      throw new BadRequestException(
        'A deployment with this branch and repository already exists',
      );
    }

    const webhookUrl = this.configService.get<string>('WEBHOOK_URL');
    if (!webhookUrl) {
      throw new InternalServerErrorException('WEBHOOK_URL is not configured');
    }

    const userInfo = await this.usersService.findById(userId);
    if (!userInfo?.token) {
      throw new BadRequestException(
        'User has not connected their GitHub account',
      );
    }

    const formattedRepoName = repoNameFormatter(
      userInfo.githubUsername,
      deploymentData.repository,
    );

    try {
      const webhookInfo = (await this.authService.createWebhookForRepo(
        formattedRepoName,
        webhookUrl,
        userInfo.token,
      )) as { id: number };

      const newDeployment = this.deploymentRepo.create({
        name: deploymentData.name,
        repository: formattedRepoName,
        dockerFilePath: deploymentData.dockerFilePath,
        branch: deploymentData.branch,
        contextDir: deploymentData.contextDir,
        user: { id: userId },
        webhookid: webhookInfo.id.toString(),
        private: deploymentData.private,
      });

      return await this.deploymentRepo.save(newDeployment);
    } catch (error: unknown) {
      console.error('[CREATE_DEPLOYMENT_WEBHOOK_ERROR]', error);
      throw new InternalServerErrorException('Failed to create GitHub webhook');
    }
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

  // get the entire deployment data with user data
  findByIdWithUser(deploymentId: string): Promise<Deployment | null> {
    return this.deploymentRepo.findOne({
      where: { id: deploymentId },
      relations: ['user'], // Include user relation
      select: {
        id: true,
      },
    });
  }

  // get the deployment info with uuid of users
  findById(deploymentId: string) {
    return this.deploymentRepo.findOne({
      where: { id: deploymentId },
      select: {
        id: true,
        name: true,
        repository: true,
        userId: true,
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

  // find the repo with same repo name and branch
  async findByRepoAndBranch(repo: string, branch: string) {
    return this.deploymentRepo.findOne({
      where: {
        repository: repo,
        branch: branch,
      },
      relations: ['deployversion'],
      select: {
        id: true,
        version: {
          id: true,
          autoDeploy: true,
        },
      },
    });
  }

  getAllDeploymnetVersions(userId: string) {
    return this.deploymentVersionRepo.find({
      where: { user: { id: userId } },
      relations: ['deployment'],
    });
  }

  getAllDeploymentVersionIDFromDeployment(
    userId: string,
    deploymentId: string,
  ) {
    return this.deploymentVersionRepo.find({
      where: { deployment: { id: deploymentId }, user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  // latest deployemnet version for all projects
  async getAllLatestDeploymentVersionOfProject(userId: string) {
    // Fetch all deployment versions for this user including deployment relation
    const allVersions = await this.deploymentVersionRepo.find({
      where: { user: { id: userId } },
      relations: ['deployment'],
      order: { createdAt: 'DESC' }, // latest first
    });

    // Pick latest version per deployment
    const latestVersionsMap = new Map<string, DeploymentVersion>();
    allVersions.forEach((version) => {
      const deploymentId = version.deployment.id;
      if (!latestVersionsMap.has(deploymentId)) {
        latestVersionsMap.set(deploymentId, version);
      }
    });

    return Array.from(latestVersionsMap.values());
  }

  getDeploymentsCreatedByUser(userId: string) {
    return this.deploymentRepo.find({
      where: { user: { id: userId } },
    });
  }

  getAllPublicDeployment() {
    return this.deploymentRepo.find({
      where: { private: false },
    });
  }

  async updateBuildLogs(deploymentVersionId: string, log: string) {
    const deplversion = await this.deploymentVersionRepo.findOne({
      where: { id: deploymentVersionId },
    });

    if (!deplversion) {
      throw new Error(`DeploymentVersion ${deploymentVersionId} not found`);
    }

    // Append the new log line with a newline separator
    let buildLogs = deplversion.buildLogsUrl || '';
    buildLogs += (buildLogs ? '\n' : '') + log;

    // Save back into DB
    deplversion.buildLogsUrl = buildLogs;
    await this.deploymentVersionRepo.save(deplversion);

    return deplversion;
  }
}
