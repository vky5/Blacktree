import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  HttpException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

import { Endpoints } from '@octokit/types';

export type CreateWebhookResponse =
  Endpoints['POST /repos/{owner}/{repo}/hooks']['response']['data'];

@Injectable()
export class AuthService {
  // This service can be used to handle authentication logic, such as verifying tokens,
  // managing user sessions, etc. Currently, it is empty but can be expanded as needed.

  constructor(private readonly configService: ConfigService) {}

  // auth logic for getting github access token
  async getGithubAccessToken(code: string): Promise<string> {
    const payload = {
      client_id: this.configService.get<string>('GITHUB_CLIENT_ID'),
      client_secret: this.configService.get<string>('GITHUB_CLIENT_SECRET'),
      code,
    };

    interface GithubAccessTokenResponse {
      access_token: string;
      token_type: string;
      scope: string;
    }

    const res = await axios.post<GithubAccessTokenResponse>(
      'https://github.com/login/oauth/access_token',
      payload,
      {
        headers: { Accept: 'application/json' },
      },
    );

    console.log(res.status);
    if (res.data?.access_token === undefined) {
      throw new UnauthorizedException(
        'Failed to retrieve access token from GitHub',
      );
    }

    return res.data.access_token;
  }

  // get the user info from the access token
  async getGithubUserInfo(token: string): Promise<any> {
    interface GithubUser {
      login: string; // GitHub username
      id: number;
      avatar_url: string;
      html_url: string;
      email: string | null;
      name: string | null;
    }

    const res = await axios.get('http://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    if (res.status !== 200) {
      throw new BadRequestException('Failed to retrieve user info from GitHub');
    }
    if (!res.data || typeof res.data !== 'object') {
      throw new BadRequestException('Unexpected response format from GitHub');
    }
    return res.data; // getting the user info from the response.
  }

  // auth logic for getting repositories
  async getGithubRepositories(token: string): Promise<string[]> {
    const res = await axios.get('https://api.github.com/user/repos', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (res.status !== 200) {
      throw new BadRequestException(
        'Failed to retrieve repositories from GitHub',
      );
    }

    // Ensure type safety by mapping repository names to string[]
    if (!Array.isArray(res.data)) {
      throw new BadRequestException('Unexpected response format from GitHub');
    }
    return res.data.map((repo: { name: string }) => repo.name);
  }

  // repository should be in the format "owner/repo"
  async createWebhookForRepo(
    repoFullName: string,
    webhookUrl: string,
    accessToken: string,
  ): Promise<CreateWebhookResponse> {
    const [owner, repo] = repoFullName.split('/');
    const githubApiUrl = `https://api.github.com/repos/${owner}/${repo}/hooks`;

    const webhookSecret = this.configService.get<string>(
      'GITHUB_WEBHOOK_SECRET',
    );

    const payload = {
      name: 'web',
      active: true,
      events: ['push'],
      config: {
        url: webhookUrl,
        content_type: 'json',
        secret: webhookSecret,
        insecure_ssl: '0',
      },
    };

    try {
      const response = await axios.post<CreateWebhookResponse>(
        githubApiUrl,
        payload,
        {
          headers: {
            Authorization: `token ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
        },
      );

      return response.data;
    } catch (error: unknown) {
      const message =
        axios.isAxiosError(error) && error.response?.data
          ? JSON.stringify(error.response.data)
          : (error as Error).message;

      console.error('[GITHUB_WEBHOOK_ERROR]', message);

      throw new HttpException('Failed to create GitHub webhook', 500);
    }
  }
}
