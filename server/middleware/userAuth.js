import jwt from 'jsonwebtoken';

const userAuth = async (req,res,next) => {
    const token = req.cookies.token;

    if(!token) {
        return res.json({success: false, message: "Not Authorized . Login again"});
    }

    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
        req.body = req.body || {};
        if(tokenDecode.id) {
             req.body.userId = tokenDecode.id;
        } else {
            res.json({success: false, message: "Not Authorized . Login again"});
        }
       next();

        
    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}
export default userAuth;