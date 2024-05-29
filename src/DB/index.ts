import  mongoose  from 'mongoose';
import constants from '../constants.js';

const connectDB = async ()  => {
try {
    const conn = await mongoose.connect(
    process.env.MONGODB_URI!,
    {
     dbName : constants.dbName,
    }
     );
    // console.log("conn this from connect method" , conn);
    // console.log(mongoose.connection)
    // if(conn.connection === mongoose.connection) {
    //     console.log("DB connection successfull");
    // } conn and moongoose are same 
    console.log( "DB connection successfull  to :: " , conn.connection.host );

    //error event listens to error which occurs after connection is established
    conn.connection.on('error', (error) => { 
        console.log("something wrong with DB connection :: " , error)
     
    });
} catch ( error  ) {

  console.log( "DB connection failed :: " , error )
  //if Db connection failed stop deployement 
  process.exit(1);
}
}

export default connectDB;

