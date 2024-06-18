import { Request } from 'express';
import  mongoose ,{HydratedDocument} from 'mongoose';


export type authRequest  = Request & {
  user : Partial<HydratedDocument<IUser,{},IUserMethods>>|undefined;
}

interface Request {
  name : string;
  username : string;
  email : string;
  password : string;
  avatar? : string;
  bio? : string;
  refereshToken? : string;
  viewHistory? : string[];

}
interface IUserMethods extends  Document{
  generateRefreshToken : () => Promise<string>;
  verifyPassword : (plainPassword : string) => Promise<boolean>;
  generateAccessToken : () => Promise<string>;
}