import ApiError from '@/Utils/ApiError.js';
import {Request, Response, NextFunction} from 'express';
import jwt, { JsonWebTokenError, JwtPayload, TokenExpiredError } from 'jsonwebtoken';
import { User } from "../Models/user.model.js"
import type { authRequest } from "../types.js";
import { HydratedDocument } from 'mongoose';
 


const authMiddleware = (req:Request, _ : Response, next:NextFunction) => {
   if(!req){
    throw new ApiError("No request found in authMiddleware", 489 ,null);
   }

    const Atoken : string  = req.cookies?.accessToken;
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
    const decodedAtoken = jwt.verify(Atoken ,process.env.JWT_ACCESS_TOKEN_SECRET as string);
    

}

export default authMiddleware;
