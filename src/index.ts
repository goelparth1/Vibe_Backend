import { dot } from "node:test/reporters";
import connectDB from "./DB/index.js";
import app from "./app.js";

import 'dotenv/config'
connectDB()
.then( () => {
  app.on( "error" , ( error ) => {
    console.log("Error in connection between express and database :: ", error);
  })
  app.listen ( process.env.PORT||8000 , () => {
    console.log( `Server started at port :: ${process.env.PORT||8000} `) ;
})
})
.catch( (error) => {
    console.log("Error in connecting to database :: ", error);
    process.exit(1);
})