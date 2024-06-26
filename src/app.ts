import express from "express";
import cors from "cors";
import cookieparser from "cookie-parser";
import { Types } from "mongoose";
import path from "node:path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename);

const app = express();

declare global {
    namespace Express {
      interface Request {
        user : {
        name : string ,
        username : string,
        email : string,
        avatar? : string,
        bio? : string,
        viewHistory? : Types.ObjectId[],
        _id : Types.ObjectId,
        }
      }
    }
  }
app.use(cors({
  origin : "http://localhost:5173",
  credentials : true,
  allowedHeaders : ["Content-Type","Authorization"],
}));

//to get body obj 
app.use(express.json({
    limit : "16kb",
}));

//to excess info from urls 

app.use(express.urlencoded({
    extended : true,
    limit : "16kb"
}));

app.use(cookieparser());

app.use(express.static("public"));

//import userRouter
import userRouter from "./Routes/user.route.js";
app.use("/api/v1/user",userRouter);
//import postRouter
import postRouter from "./Routes/post.route.js";
app.use("/api/v1/post",postRouter);



app.get("/public/temp/:id",(req,res)=>{
  res.sendFile(`${__dirname}/temp/${req.params.id}`);
})
//global catches 
// app.use((req:Request,res:Response,next:,err) =>{

export default app;