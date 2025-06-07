import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

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

  // auth logic for getting repositories
  async getGithubRepositories(token: string): Promise<string[]> {
    const res = await axios.get('https://api.github.com/user/repos', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    console.log(res);

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
}
