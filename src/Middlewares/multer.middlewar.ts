import multer from "multer";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ApiError from "../Utils/ApiError.js";

const storage = multer.diskStorage( 
    {
   destination : ( _, __, cb ) => { 
    const dest  = "./public/temp/" 
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
            if( typeOfUpload === "image" && ( ext === ".jpg" || ext === ".jpeg" || ext === ".png" ||".svg") ) {
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