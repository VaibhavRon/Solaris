import express from "express";
import { signup ,login,logout,verify,forgot,reset,checkAuth} from "../controllers/auth_controllers.js";
import {verifyToken} from "../Middlewares/verifyToken.js"
const router=express.Router();

router.get("/check-auth",verifyToken,checkAuth)
router.post("/login",login)
router.post("/signup",signup);
router.post("/logout",logout)

router.post("/verify",verify);
router.post("/forgot-password",forgot)
router.post("/reset-password/:token",reset)

export default router;