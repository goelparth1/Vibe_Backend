import { User } from "../Models/user.model.js";
import { Request, Response, NextFunction , } from 'express';
import userZodSchema from "../Validation/user.validation.js";
import { z } from "zod";
import ApiResponse from "../Utils/ApiResponse.js";
import ApiError from "../Utils/ApiError.js";
import { HydratedDocument } from "mongoose";
import { isInt8Array } from "util/types";

type expressMethodParams = {
    req : Request,
    res : Response,
    next : NextFunction
    // error ? : Error
    
}

const registerUser = async ( req :Request, res :Response , next : NextFunction  ) => {

    // console.log("in the req ",req.body)
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
    .json( new ApiResponse("User successfully registered", 200, { user : savedUser} ))

    
    };

const loginUser = async ( req :Request, res :Response , next : NextFunction  ) => {
    const { email, password ,username } = req.body || {} ;
    //optional empty object if req.body is undefined will save us from error

    //now we need to find which of email or username is provided
    if((!email)&&(!username)){
        throw new ApiError("Email or Username is required", 421, null);
    }
    let loginUserZodSchema;
    let safeParsedLoginUserZodSchema;
    let searchedUser;
    if(email){
        loginUserZodSchema = userZodSchema.pick({email : true, password : true});
        safeParsedLoginUserZodSchema = loginUserZodSchema.safeParse({email, password});
        if(!safeParsedLoginUserZodSchema.success){
            throw new ApiError(safeParsedLoginUserZodSchema.error.errors[0].message, 489, safeParsedLoginUserZodSchema.error)
        }
        searchedUser = await User.findOne({email}).catch(err => {
            throw new ApiError("Error in finding user while logging in", 489, err);
        });
    }else{
        loginUserZodSchema = userZodSchema.pick({username : true, password : true});
        safeParsedLoginUserZodSchema = loginUserZodSchema.safeParse({ password, username})
        if(!safeParsedLoginUserZodSchema.success){
            throw new ApiError(safeParsedLoginUserZodSchema.error.errors[0].message, 489, safeParsedLoginUserZodSchema.error)
        };
        searchedUser = await User.findOne({username}).catch(err => {
            throw new ApiError("Error in finding user while logging in", 489, err);
        });
    };

    if(!searchedUser){
        throw new ApiError("User do not exists", 492, null);
    };
    //now we have user
    //check password
    const passwordMatch = await searchedUser.verifyPassword(password);

    if(!passwordMatch){
        throw new ApiError("Password do not match", 493, null);
    }
    //password match
    //generate new accessToken and refreshToken
    const accessToken = await searchedUser.generateAccessToken();
    const refereshToken = await searchedUser.generateRefreshToken();
    // console.log("searchedUserOldRefereshToken",searchedUser.refereshToken);
     searchedUser.refereshToken = refereshToken;
    await  searchedUser.save({
        validateBeforeSave : false
    }).catch((err)=>{
        throw new ApiError("Error in saving refreshToken to DB in LoginController", 494, err);
    });
 // new referesh token is stored in DB
    const cookieOptions = {
        httpOnly : true,
        secure : true,
    }

    searchedUser.password = "";
    searchedUser.refereshToken = undefined;

    res.status(200)
    .cookie("refreshToken", refereshToken, cookieOptions)
    .cookie("accessToken", accessToken, cookieOptions)
    .json( new ApiResponse("User successfully logged in", 200, { user : searchedUser} ))

}





    export {
        registerUser,
        loginUser,
    }