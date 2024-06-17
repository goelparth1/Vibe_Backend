import { User } from "../Models/user.model.js";
import { Request, Response, NextFunction , } from 'express';

type expressMethodParams = {
    req : Request,
    res : Response,
    next : NextFunction
    // error ? : Error
    
}

const registerUser = async ({ req , res , next } : expressMethodParams ) => {
    const { name, username, email, password } = req.body || {} ;
    //optional empty object if req.body is undefined will save us from error
}