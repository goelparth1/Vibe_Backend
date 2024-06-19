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


router.route("/register").post(asyncHandler(registerUser));

router.route("/login").get(asyncHandler(loginUser));

router.route("/logout").get(errorsafeAuth,asyncHandler(logOut));

router.route("/getNewAccessToken").post(asyncHandler(getNewAccessToken));

router.route("/getUser").get(errorsafeAuth,asyncHandler(getUser));

router.route("/updateUser").patch(errorsafeAuth,asyncHandler(updateUser));


export default router;