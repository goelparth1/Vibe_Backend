import { Router ,Request,Response,NextFunction} from "express";
import { registerUser,
    loginUser,
    logOut,
    getUser,
    updateUser,
    getNewAccessToken } from "../Controllers/user.controller.js";
import authMiddleware from "../Middlewares/auth.middleware.js";
import asyncHandler from "../Utils/asyncHandler.js";

const router = Router();

const errorsafeAuth = asyncHandler(authMiddleware);

router.route("/register").post(registerUser);

router.route("/login").get(loginUser);

router.route("/logout").get(errorsafeAuth,logOut);

router.route("/getNewAccessToken").post(getNewAccessToken);

router.route("/getUser").get(errorsafeAuth,getUser);

router.route("/updateUser").patch(errorsafeAuth,updateUser);


export default router;