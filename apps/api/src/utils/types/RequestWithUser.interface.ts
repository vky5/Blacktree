export interface RequestWithUser extends Request {
  user: {
    id: string;
    [key: string]: any;
  };
}
