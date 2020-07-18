const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.isLoggedIn = (req,res,next) =>{
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token){
        const error = new Error("Not authenticated");
        error.statusCode = 401;
        throw error;
    }

    let decodedToken;
    try{
         decodedToken = jwt.verify(token,"secret"); //TODO: USE ENV VARIABLE FOR SECRET
    }
    catch(err){
        err.statusCode = 500;
        next(err); // next or throw ?
    }

    if(!decodedToken){
        const error = new Error("Not authenticated");
        error.statusCode = 401;
        throw error;
    }

    User.findById(decodedToken.id)
    .then(user=>{
        if(!user){
            const error = new Error("Not authenticated");
            error.statusCode = 401;
            throw error;
        }
        req.user = user;
        next();
    })
    .catch(err=>{
        err.statusCode = err.statusCode || 500;
         next(err);
    })

}

exports.isAdmin = (req,res,next) =>{
    if(req.user){           // Modify this logic (user is now an mongoose instance)
        User.findById(req.user._id)
        .then(user=>{
            if(!user){
                const error = new Error("Not authenticated");
                error.statusCode = 401;
                throw error;
            }

            if(user.role !== "ADMIN"){
                const error = new Error("Not authorized to perform this action");
                error.statusCode = 403;
                throw error;
            }

            next();
        })
        .catch(err=>{
            err.statusCode = err.statusCode || 500;
            next(err);
        })
    }
}