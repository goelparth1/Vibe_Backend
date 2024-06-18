import mongoose,{ Schema,model,HydratedDocument,Document,Model} from "mongoose";
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
interface IUserMethods extends  Document{
    generateRefreshToken : () => Promise<string>;
    verifyPassword : (plainPassword : string) => Promise<boolean>;
    generateAccessToken : () => Promise<string>;
}
type IUserModel = Model<IUser,{},IUserMethods>;
const userSchema = new Schema<IUser,IUserModel>({
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
    default : "Hey there! I am using Vibe.",
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


userSchema.methods.generateRefreshToken = async function(){
    // console.log(process.env.JWT_REFRESH_TOKEN_EXPIRY,typeof process.env.JWT_REFRESH_TOKEN_EXPIRY)
    // console.log(this._id,typeof this._id)
    const payload = {
        name : "random",
        _id : this._id,
        
    }
    return await  jwt.sign(
        {
            _id : this._id
        },
        process.env.JWT_REFRESH_TOKEN_SECRET!,
        {
            expiresIn : process.env.JWT_REFRESH_TOKEN_EXPIRY
        }
     );
}

//pre hook runs before saving,editinh the doc 
//mongoose know this is type of mongoose.document & User
userSchema.pre("save", async function( this:HydratedDocument<IUser,IUserMethods>,next){
    if(!this.isModified("password")) next() ; 
    // bcrypt.hash(this.password, 10, (err, hash) => {
    //     if(err) next(err);
    //     this.password = hash; //declared like callbackfn in type declaration with error of type Error (from types file )
    //     next();
    // });
try {
    const pass  =  await bcrypt.hash(this.password, 10);
    this.password = pass;
    if(!this.isNew) next();
    this.refereshToken =  await this.generateRefreshToken();
    next();
}catch(err){
    next(err as Error);
}});

userSchema.methods.verifyPassword = async function(plainPassword : string){
    console.log(typeof userSchema);
    return await bcrypt.compare(plainPassword, this.password);
}



userSchema.methods.generateAccessToken = async function(){
    const accessToken = await jwt.sign({
        _id : this._id,
        email : this.email,
        username : this.username,
        avatar : this.avatar,
        name : this.name,
    },
    process.env.JWT_ACCESS_TOKEN_SECRET!,
    {
        expiresIn : process.env.JWT_REFRESH_TOKEN_EXPIRY
    }
    );
}

export const User = model<IUser,IUserModel>("User", userSchema);