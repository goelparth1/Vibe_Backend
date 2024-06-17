import { User } from "../Models/user.model.js";
import { Request, Response, NextFunction , } from 'express';
import userZodSchema from "../Validation/user.validation.js";
import { z } from "zod";
import ApiResponse from "@/Utils/ApiResponse.js";
import ApiError from "@/Utils/ApiError.js";
import { HydratedDocument } from "mongoose";
import { isInt8Array } from "util/types";

type expressMethodParams = {
    req : Request,
    res : Response,
    next : NextFunction
    // error ? : Error
    
}

const registerUser = async ({ req , res , next } : expressMethodParams ) => {
    const { name, username, email, password } = req.body || {} ;
    //optional empty object if req.body is undefined will save us from error
    const registerZodSchema = userZodSchema.pick({name : true,username : true, email : true, password : true});
    
    //safeParsing our data 
    const safeParsedRegisterZodSchema = registerZodSchema.safeParse({name, username, email, password})
    if(!safeParsedRegisterZodSchema.success){
        //console.log(safeParsedRegisterZodSchema.error);
      new ApiError(safeParsedRegisterZodSchema.error.errors[0].message, 489, safeParsedRegisterZodSchema.error)
    }
    //now data validation successfull
    //check if user already exists
    let mongoUserSearched;
      try{
        mongoUserSearched = await User.find({ //coz both could be found as well 
        $or:[
            {email},
            {username}
        ]
     })}catch(err){
            throw new ApiError("Error in finding user while registering User", 489, err);
           //if error is found execution will be stopped
     }
     //find returns a empty array if no user found findOne returns null
     if(mongoUserSearched.length != 0){
        //mongoUserSearched will have max 2 elements
       if(mongoUserSearched.length == 2){
          throw new ApiError("Email and Username both taken", 489 , mongoUserSearched[0]);
       }else{
        if(mongoUserSearched[0].email == email && mongoUserSearched[0].username == username){
            throw new ApiError("User with same email and username already exists", 489 , mongoUserSearched[0]);
       }else if (mongoUserSearched[0].email == email){
            throw new ApiError("User with same email already exists", 489 , mongoUserSearched[0]);
       }else{
            throw new ApiError("User with same username already exists", 489 , mongoUserSearched[0]);
       } } };
    //now we can create a new user  
    //generate refereshToken before creating 

    const savedUser  = await User.create({
        name, username, email, password
    }).catch(err => {
        throw new ApiError("Error in saving new User", 492, err);
    });
    //savedUser will have refreshToken and password hashed
    const accessToken = await savedUser.generateAccessToken();
    const refreshToken = savedUser.refereshToken;
    
    savedUser.refereshToken = undefined;
    savedUser.password = "";
    const cookieOptions = {
        httpOnly : true,
        secure : true,
    }

    res.status(200)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .cookie("accessToken", accessToken, cookieOptions)
    .json( new ApiResponse("User successfully registered", 200, {accessToken, refreshToken, user : savedUser} ))

    
    };