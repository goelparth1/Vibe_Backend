import type { Request,Response,NextFunction,RequestHandler } from "express";


const asynHandler = ( handler:RequestHandler ) => {
    return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req,res,next))
    .catch((err) => {
        next(err);
    });
    
} }

export default asynHandler;