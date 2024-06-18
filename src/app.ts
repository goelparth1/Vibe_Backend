import express from "express";
import cors from "cors";
import cookieparser from "cookie-parser";

const app = express();

app.use(cors( {
    origin : process.env.CORS_ORIGIN,
    credentials : true,
} ));

//to get body obj 
app.use(express.json());

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


export default app;