import { z } from "zod";
import mongoose from "mongoose";


const userZodSchema = z.object({
    email : z.string()
        .email(
          {
            message : "Invalid Email Address"
          }
        ),
    password : z.string()
        .regex(
            /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{6,20}$/g,
            {
                message : "Password isn't strong enough"
            }
        ),

    name : z.string()
        .min(3,{ message : "Name must be atleast 3 characters long" }),

    username : z.string()
        .regex(
            /^(?=.*[A-Z])(?=.*\d).{3,20}/g,
            {
                message : "Username format is invalid"
            }
        ),
    avatar : z.string().url().optional(),

    bio : z.string().optional(),

    refreshToken : z.string().optional(),

    viewHistory : z.array(
        z.string()
        .refine(
            (data) => mongoose.Types.ObjectId.isValid(data),
            (data) =>({
             message :  ` Invalid reference ${data} to post in viewHistory array `
            }
            )
        )
        ).optional(),
    createdAt : z.date().optional(),
    updatedAt : z.date().optional(),    
})

export default userZodSchema;