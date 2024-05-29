import  mongoose  from 'mongoose';

import constants from '../constants';

const connectDB = async ()  => {
try {
    const conn = await mongoose.connect(
    process.env.MONGODB_URI!,
    {
     dbName : constants.dbName,
    }
     );
    console.log("conn this from connect method" , conn);
    console.log(mongoose.connection)
    
} catch ( error ) {

}
}

