import ApiError from '../Utils/ApiError.js';
import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import { User } from "../Models/user.model.js"
import type { authRequest } from "../types.js";
import { Types } from 'mongoose';
// import { IUser } from '../';
 
type accessTokenPayload = {
    name : string ,
    username : string,
    email : string,
    avatar? : string,
    bio? : string,
    viewHistory? : Types.ObjectId[],
    _id : Types.ObjectId,
}


const authMiddleware = (req:Request, _ : Response, next:NextFunction) => {
   if(!req){
    throw new ApiError("No request found in authMiddleware", 489 ,null);
   }

   console.log("This is ReqHeaders ",req.headers);

    const Atoken : string  = req.header("Authorization")?.replace("Bearer ", "")||req.cookies?.accessToken 
    if(!Atoken){
        throw new ApiError("No Access Token found", 401, null);
    }
    // const Rtoken : string = req.cookies?.refreshToken;
    // if((!Atoken) && (!Rtoken)){
    //     //now no access to  token so unauthorized req 
    //     throw new ApiError("Unauthorized Request", 401, null);
    // }
    // //now we have atleast Rtoken
    // //now we need to verify Atoken
    // //if Atoken is not present then we need to generate new Atoken
    // //if Atoken is present and working will continue 
    // try{
    // const decodedAtoken = jwt.verify(Atoken, process.env.JWT_ACCESS_TOKEN_SECRET as string);
    // }catch(err){
    //     console.log(err);
    //     if(err instanceof TokenExpiredError){
    //         //if err in decoding is only because of token expiry ,only then we will regenrate access token aur else acess Token can be malacious
    //         //now we need to verify Rtoken
    //         try{
    //         const decodedRtoken = jwt.verify(Rtoken, process.env.JWT_REFRESH_TOKEN_SECRET as string);
    //         //now we have decoded Rtoken
    //         //now we need to generate new Atoken
    //         const user:any = (User.findById((decodedRtoken as JwtPayload)._id))
    //         .catch(err =>{
    //              throw new ApiError("Error in finding user in authMiddleware", 401, err);
    //         });  
    //         const newAccessToken = user.generateAccessToken!();
    //         //will work on this later 
    //         next();
    //         }catch(err){
    //             if(err instanceof TokenExpiredError){
    //                 throw new ApiError("Refresh Token Expired", 401, err);
    //             }else if(err instanceof JsonWebTokenError){
    //                 throw new ApiError("Refresh Token is malacious", 401, err);
    //             }else{
    //                 throw new ApiError("Error in verifying Refresh Token", 401, err);
    //             }
    //             //if fronted gets 401 req then it will relogin     
    //         }
    // }
    // }
    //we have to extract user from cookie
    try{
    const decodedAtoken = jwt.decode(Atoken)
    req.user = decodedAtoken as accessTokenPayload;
    next();
    }catch(err){
        if(err instanceof jwt.TokenExpiredError){
            throw new ApiError("Access Token Expired", 403, err);
        }else if(err instanceof jwt.JsonWebTokenError){
            throw new ApiError("Access Token is malacious", 401, err);
        }else{
            throw new ApiError("Error in verifying Access Token", 401, err);
        }
    }


    //on frontend if 401 is received and accessToken is expired we will regenerate accessToken and refreshToken ,else at all 401 requests we will relogin
    


}

export default authMiddleware;
