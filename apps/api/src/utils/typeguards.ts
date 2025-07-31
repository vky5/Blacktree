import { Request } from 'express';
import { RequestWithUser } from 'src/utils/types/RequestWithUser.interface';

export function isRequestWithUser(
  req: Request,
): req is RequestWithUser & Request {
  return (req as unknown as RequestWithUser).user !== undefined;
}
