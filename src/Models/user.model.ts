import mongoose,{ Schema,model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

interface IUser {
    name : string;
    username : string;
    email : string;
    password : string;
    avatar? : string;
    bio? : string;
    refereshToken? : string;
    viewHistory? : string[];

}
const userSchema = new Schema<IUser>({
name : {
    type : String,
    required : [true,"Name is required to register a user"],
    trim : true,    
},
username : {
    type : String,
    required : [true, "Username is required"],
    trim : true, 
    unique : true,
    sparse : true,
    immutable : true, 
},
email : {
    type : String,
    required : [true, "Email is required"],
    trim : true,
    unique : true,
    immutable : true,
},
password : {
    type : String,
    required : [true, "Password is required"],
    trim : true,
},
avatar : {
    type : String,//cloudinary url 
    default : process.env.CLOUDINARY_DEFAULT_AVATAR,
},
bio : {
    type : String,
    default : "",
},
refereshToken : {
    type : String
},
viewHistory : [
    {
        type : Schema.Types.ObjectId,
        ref : "Post"
    }
]
},{
    timestamps: true,
});

//pre hook runs before saving,editinh the doc 
//mongoose know this is type of mongoose.document & User
userSchema.pre("save", async function(next){
    if(!this.isModified("password")) next() ; 
    // bcrypt.hash(this.password, 10, (err, hash) => {
    //     if(err) next(err);
    //     this.password = hash; //declared like callbackfn in type declaration with error of type Error (from types file )
    //     next();
    // });
try {
    const pass  =  await bcrypt.hash(this.password, 10);
    this.password = pass;
}catch(err){
    next(err as Error);
}});

userSchema.methods.verifyPassword = async function(plainPassword : string){
    console.log(typeof userSchema);
    return await bcrypt.compare(plainPassword, this.password);
}

userSchema.methods.generateRefreshToken = async function(){
    const refreshToken = await jwt.sign({
        _id : this._id,
    },
    (process.env.JWT_REFRESH_TOKEN_SECRET!),
    {
        expiresIn : process.env.JWT_REFRESH_TOKEN_EXPIRY,
    });
}

userSchema.methods.generateAccessToken = async function(){
    const accessToken = await jwt.sign({
        _id : this._id,
        email : this.email,
        username : this.username,
        avatar : this.avatar,
        name : this.name,
    },
    (process.env.JWT_ACCESS_TOKEN_SECRET!),
    {
        expiresIn : process.env.JWT_ACCESS_TOKEN_EXPIRY,
    });
}

export const User = model<IUser>("User", userSchema);