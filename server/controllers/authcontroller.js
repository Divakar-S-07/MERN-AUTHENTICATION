
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/usermodel.js";


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
        })
        
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

    export const logout = async (res , req)=>{
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