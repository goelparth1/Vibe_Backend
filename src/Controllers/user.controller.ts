import { User } from "../Models/user.model.js";
import { Types } from "mongoose";
import { Request, Response, NextFunction , } from 'express';
import userZodSchema from "../Validation/user.validation.js";
import { z } from "zod";
import ApiResponse from "../Utils/ApiResponse.js";
import ApiError from "../Utils/ApiError.js";
import jwt from "jsonwebtoken";

export type frontEndUser = {
        _id : Types.ObjectId;
        name : string,
        username : string,
        email: string,
        avatar : string,
        bio : string, 
}

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
    console.log("hello");

    res.status(200)
    .cookie("refreshToken", refreshToken, {
        domain : "http://localhost:5173",
        sameSite : "none",
        secure : true,
        path : "/signUP",
        maxAge : 1000*60*60*24*30,
    })
    .cookie("accessToken", accessToken,{
        sameSite:"lax",
        path : "/signUp",
        domain: "http://localhost:5173",
        maxAge : 1000*60*60*24*30,
    })
    .json( new ApiResponse("User successfully registered", 200, { user : savedUser , accessToken} ))

    
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
        // httpOnly : true,
        // secure : true,
         sameSite : "None",
         secure : false,
        
    }

    searchedUser.password = "";
    searchedUser.refereshToken = undefined;

    res.status(200)
    .cookie("refreshToken", refereshToken, {
        sameSite : "none",
        secure : false,

    })
    .cookie("accessToken", accessToken, {
        sameSite : "none",
        secure : false,
        path: "/",
        maxAge : 1000*60*60*24*7,
    })
    .json( new ApiResponse("User successfully logged in", 200, { user : searchedUser , accessToken} ))

}

const logOut = async ( req :Request, res :Response , next : NextFunction  ) => {
    const userId = req.user?._id;
    if(!userId){
        throw new ApiError("Unauthorised request", 489, null);
    }

    //By default, findOneAndUpdate() returns the document as it was before update was applied. If you set new: true, findOneAndUpdate() will instead give you the object after update was applied.
    //unset will unset the field from the document
    const user = await User.findByIdAndUpdate({
        _id : userId
    },{
       $unset : {
              refereshToken : 1
         }
    },{
        new : true
    }).catch(err => {
        throw new ApiError("Error in logging out", 489, err);
    });
    
     const cookieOptions = {
        httpOnly : true,
        secure : true
     }

     res.status(200)
     .clearCookie("refreshToken", cookieOptions)
     .clearCookie("accessToken", cookieOptions)
     .json( new ApiResponse("User successfully logged out", 200, null ))

}

const getUser = async ( req :Request, res :Response , next : NextFunction  ) => {
    const userId = req.user?._id;
    if(!userId){
        throw new ApiError("Unauthorised request", 489, null);
    }

    const user = await User.findById(userId).catch(err => {
        throw new ApiError("Error in getting user", 489, err);
    });
    if(!user){
        throw new ApiError("User not found", 489, null);
    }
    const userToSend : frontEndUser = {
        _id : user._id as Types.ObjectId,
        name : user.name,
        username : user.username,
        email : user.email,
        avatar : user.avatar!,
        bio : user.bio!
    
    }
    console.log("userToSend",userToSend)

    res.status(200)
    .json( new ApiResponse("User successfully fetched", 200, userToSend  ))
}

const getNewAccessToken = async ( req :Request, res :Response , next : NextFunction  ) => {
    const refereshToken = req.cookies?.refreshToken;
    if(!refereshToken){
        throw new ApiError("Unauthorised Request", 401, null);
    }
    try{
    const decodedRtoken = jwt.verify(refereshToken, process.env.JWT_REFRESH_TOKEN_SECRET as string);
    
    const user  = await  (User.findById((decodedRtoken as {_id:Types.ObjectId})._id)).catch(err =>{ throw err })
    // console.log("we are at user",user.generateAccessToken);
    const newAccessToken = await  user!.generateAccessToken();
    // console.log("newAccessToken",newAccessToken)

    const cookieOptions = {
        // httpOnly : true,
        // // secure : true,  client will send back cookie only if conn is https
        // secure : true,
    } 
    res.status(200).cookie("accessToken", newAccessToken, cookieOptions)
    .json(new ApiResponse("New Access Token generated", 200, {accessToken : newAccessToken}));
    }catch(err){
        throw new ApiError("Error in getting new access token", 489, err);
    } //if ye error throw karta hain to front end se logout kardenge 
}

const updateUser = async ( req :Request, res :Response , next : NextFunction  ) => {
    const userId = req.user?._id;
    if(!userId){
        throw new ApiError("Unauthorised request", 489, null);
    }

    const { name, username, email, bio, avatar } = req.body || {} ;
    //optional empty object if req.body is undefined will save us from error
    const updateUserZodSchema = userZodSchema.partial();
    
    //safeParsing our data 
    const safeParsedUpdateUserZodSchema = updateUserZodSchema.safeParse({name, username, email, bio, avatar})
    if(!safeParsedUpdateUserZodSchema.success){
        //console.log(safeParsedRegisterZodSchema.error);
      new ApiError(safeParsedUpdateUserZodSchema.error.errors[0].message, 489, safeParsedUpdateUserZodSchema.error)
    }
    //now data validation ho gyi 
    //update user 
    const user = await User.findByIdAndUpdate(userId,{
        name, username, email, bio, avatar
    },{
        new : true
    }).catch(err => {
        throw new ApiError("Error in updating user", 489, err);
    });
    if(!user){
        throw new ApiError("Something went wrong while updating", 489, null);
    }
    const userToSend : frontEndUser = {
        _id : user._id as Types.ObjectId,
        name : user.name,
        username : user.username,
        email : user.email,
        avatar : user.avatar as string,
        bio : user.bio!
    }

    res.status(200).json(new ApiResponse("User successfully updated", 200, userToSend));

}



    export {
        registerUser,
        loginUser,
        logOut,
        getUser,
        updateUser,
        getNewAccessToken
    }
