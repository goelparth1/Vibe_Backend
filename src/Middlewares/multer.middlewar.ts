import multer from "multer";
import path from "node:path";
import ApiError from "../Utils/ApiError.js";

const storage = multer.diskStorage( 
    {
   destination : ( _, __, cb ) => { 
    const dest  = path.join( __dirname , "../../public/temp/uploads" ); 
    console.log("dest :: ", dest)
    cb(null, dest);
   },
   filename : ( _ , file, cb ) => { 
    cb( null, `${Date.now()}_${file.originalname}` );
   }
 } 
 );

const multerUpload = function( typeOfUpload : "image" | "video" | "raw" ) {
    return multer({
        storage,
        fileFilter : ( _, file, cb ) => {
            const ext = path.extname(file.originalname);
            if( typeOfUpload === "image" && ( ext === ".jpg" || ext === ".jpeg" || ext === ".png" ) ) {
                cb(null, true);
            } else if( typeOfUpload === "video" && ( ext === ".mp4" || ext === ".mov" || ext === ".avi" ) ) {
                cb(null, true);
            } else if( typeOfUpload === "raw" ) {
                cb(null, true);
            } else {
                cb(new ApiError(
                    "Invalid file type uploaded",
                    431,
                    null ));
            }
        },
        // limits : will add limit in future if necessary 

    })
}

export default multerUpload;