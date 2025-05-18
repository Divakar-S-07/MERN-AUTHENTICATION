import express from 'express'
import { login, logout, register, sendVerifyOTP, verifyOtp } from '../controllers/authcontroller.js';
import userAuth from '../middleware/userAuth.js';

const authRouter = express.Router();

authRouter.post('/register' , register);
authRouter.post('/login' , login);
authRouter.post('/logout' , logout);
authRouter.post('/send-verify' , userAuth, sendVerifyOTP);
authRouter.post('/verify-account' , userAuth, verifyOtp);


export default authRouter;