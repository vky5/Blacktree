import { NextFunction } from 'express';

type fnType = (req: Request, res: Response, next: NextFunction) => Promise<any>;

export default function (fn: fnType) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}
