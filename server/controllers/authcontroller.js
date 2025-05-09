
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/usermodel.js";


//Register Controller
export const register = async (req,res)=>{
    // const  {name ,  email , password} = req.body;  ||
    const name = req.body;
    const email=req.body;
    const password = req.body;


    if (!name || !email || !password){
        return res.json({success:false  , message:'Missing Detials'})
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


    } catch (error) {
        res.json({success: false , message: error.message})
    }
    
}