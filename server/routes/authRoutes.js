import express from 'express'
import { isAuthenticated, login, logout, register, sendVerifyOTP, verifyOtp } from '../controllers/authcontroller.js';
import userAuth from '../middleware/userAuth.js';

const authRouter = express.Router();

authRouter.post('/register' , register);
authRouter.post('/login' , login);
authRouter.post('/logout' , logout);
authRouter.post('/send-verify' , userAuth, sendVerifyOTP);
authRouter.post('/verify-account' , userAuth, verifyOtp);
authRouter.post('/is-Auth' , userAuth, isAuthenticated);


export default authRouter;