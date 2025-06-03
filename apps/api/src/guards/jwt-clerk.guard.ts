import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { JwksClient } from 'jwks-rsa';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class JWTClerkGuard implements CanActivate {
  // JWKS client used to fetch public keys from Clerk's JWKS endpoint
  private jwksClient: JwksClient;

  constructor(private readonly userService: UsersService) {
    // Initialize the JWKS client with the Clerk-provided endpoint
    this.jwksClient = new JwksClient({
      jwksUri: process.env.JWKS_URI!, // make sure this is defined in your .env
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    // Extract JWT from cookies or Authorization header
    const token = this.getToken(req);

    try {
      // Attach user info to request based on your JWT template
      interface DecodedToken {
        sub: string;
        user_email?: string;
        [key: string]: unknown;
      }

      // Verify the token signature and claims
      const decodedToken: DecodedToken = await this.verifyToken(token);
      if (!decodedToken.user_email) {
        throw new UnauthorizedException('Invalid token');
      }

      const user = await this.userService.findOneByEmail(
        decodedToken.user_email,
      );

      req['user'] = user; // Attach user to request object
      return true; // Allow request to proceed
    } catch (error) {
      console.error('JWT verification error:', error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  // Helper to get JWT token from request cookies or Bearer authorization header
  private getToken(req: Request): string {
    const cookieToken =
      req.cookies && typeof req.cookies['jwt'] === 'string'
        ? req.cookies['jwt']
        : undefined;
    const authHeader = req.headers['authorization'];
    const headerToken =
      typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : undefined;
    const token = cookieToken || headerToken;

    if (!token) {
      throw new UnauthorizedException('Missing JWT token');
    }

    return token;
  }

  // Verify JWT token using Clerk's JWKS and validate claims
  private async verifyToken(
    token: string,
  ): Promise<{ sub: string; email?: string; [key: string]: unknown }> {
    // Decode token header to get key id (kid)
    const decodedHeader = jwt.decode(token, { complete: true })?.header;
    if (!decodedHeader || !decodedHeader.kid) {
      throw new UnauthorizedException('Token missing kid (key id)');
    }
    // Fetch the matching public key from JWKS
    const key = await this.getKey(decodedHeader.kid);

    // Verify token signature and claims with the public key
    return jwt.verify(token, key, {
      algorithms: ['RS256'], // RS256 algorithm expected
      //   audience:
      // process.env.JWT_AUDIENCE || 'https://leading-gnu-88.clerk.accounts.dev', // Audience must match Clerk issuer
      issuer:
        process.env.JWT_ISSUER || 'https://leading-gnu-88.clerk.accounts.dev', // Issuer must be Clerk URL
    }) as { sub: string; email?: string; [key: string]: unknown };
  }
  // Fetch the public key from Clerk's JWKS endpoint by key id (kid)
  private async getKey(kid: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.jwksClient.getSigningKey(kid, (err, key) => {
        if (err || !key) {
          return reject(new UnauthorizedException('Unable to get signing key'));
        }
        // Return the public key in PEM format
        const publicKey = key.getPublicKey();
        resolve(publicKey);
      });
    });
  }
}
