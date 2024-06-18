import { Router ,Request,Response,NextFunction} from "express";
import { registerUser,loginUser,logOut } from "../Controllers/user.controller.js";
import authMiddleware from "../Middlewares/auth.middleware.js";
import asyncHandler from "@/Utils/asyncHandler.js";

const router = Router();

router.route("/register").post(registerUser);

router.route("/login").get(loginUser);

router.route("/logout").get(asyncHandler(authMiddleware),logOut);

export default router;