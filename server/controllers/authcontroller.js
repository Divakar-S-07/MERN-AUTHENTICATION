
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/usermodel.js";
import transporter from "../config/nodemailer.js";
import { text } from "express";


//Register Controller
export const register = async (req,res)=>{
    const  {name ,  email , password} = req.body;  
    // const name = req.body;
    // const email=req.body;
    // const password = req.body;


    if (!name || !email || !password){
        return res.json({success:false  , message:'Missing Details'})
    }
    try {
        //existing user check
        const existinguser = await userModel.findOne({email})
        if(existinguser){
            return res.json({success : false , message :'User already exists'} )
        }

        //encrypting password to DB
        const hasshedPassword = await bcrypt.hash(password , 10)
        

        const user = new userModel ({name , email , password:hasshedPassword});  //new user auth
        await user.save(); // save this user in database

        //generate tooken for auth to cookies
       const token = jwt.sign({id: user._id}, process.env.JWT_SECRET , { expiresIn: '7days'});

        res.cookie('token', token , {
            httpOnly:true , 
            secure: process.env.NODE_ENV === "production" , 
            sameSite: process.env.NODE_ENV === "production" ? 'none' : 'strict' , 
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        //sending welcome email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "Welcome to our website",
            text: `your website has been created with the email id ${email}`
        }

        await transporter.sendMail(mailOptions);

        
        
        
        return res.json ({success:true });

    } catch (error) {
        res.json({success: false , message: error.message})
    }

    }
    export const login = async (req,res)=>{

    const {email,password} = req.body;

    if(!email || !password){
        return res.json({success:false , message:'email and password are required'})
    }
    try {
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success:false , message:'Invalid email'})
        }
        const isMatch = await bcrypt.compare(password,user.password)
        if(!isMatch){
            return res.json({success:false , message:'Invalid password'})
        }
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET , { expiresIn: '7days'});

        res.cookie('token', token , {
            httpOnly:true , 
            secure: process.env.NODE_ENV === "production" , 
            sameSite: process.env.NODE_ENV === "production" ? 'none' : 'strict' , 
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.json ({success:true });
        
        
    } catch (error) {
        return res.json({success: false , message: error.message})
    }

    }

    export const logout = async (req,res)=>{
        try {
            res.clearCookie('token', {
               httpOnly:true , 
            secure: process.env.NODE_ENV === "production" , 
            sameSite: process.env.NODE_ENV === "production" ? 'none' : 'strict' , 
            })

            return res.json ({success:true , message:'Logged Out'})
        } catch (error) {
            
            return res.json({success: false , message: error.message})
        }
    }

    //send otp to users email 

    export const sendVerifyOTP = async (req, res) => {
  try {
    const { userId } = req.body;
    // console.log(userId);
    
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.isAccountVerified) {
      return res.json({ success: false, message: "Account already verified" });
    }

    // Generate a 6-digit random OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.verifyOtp = otp;
    user.verifyOtpExpiredAt = Date.now() + 24 * 60 * 60 * 1000; // Expires in 24 hours

    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account Verification OTP",
      text: `Your OTP is ${otp}. Verify your account using this OTP.`
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "Verification OTP sent to email" });

  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


    export const verifyOtp = async (req,res) => {
        const {userId, otp} = req.body;

        if(!userId){
            return res.json({success: false, message: "Missing Details"})
        }
        try {
            const user = await userModel.findById(userId);

            if(!user){
                return res.json({success: false, message: "user not found"});

            }

            // the user.verifyOtp that is stored in the database is equal to empty string or the user.verifyOtp that is stored in the database is not equal to the otp entered by user
            if(user.verifyOtp === '' || user.verifyOtp!==otp){
                return res.json({success: false, message: "Invalid OTP"})

            }

            if(user.verifyOtpExpiredAt < Date.now()){
                return res.json({success: false, message: "OTP is Expired"})
            }

            user.isAccountVerified = true;
            user.verifyOtp = '';
            user.verifyOtpExpiredAt = 0;
            await user.save();

            return res.json({success: true, message: "Email verified successfully"})
            
        } catch (error) {
            res.json({success: false, message: error.message});
        }
    }

    