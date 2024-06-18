import { Router ,Request,Response,NextFunction} from "express";
import { registerUser,loginUser } from "../Controllers/user.controller.js";

const router = Router();

router.route("/register").post(registerUser);

router.route("/login").get(loginUser);

export default router;