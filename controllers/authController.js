const {validationResult} = require("express-validator");
const User = require("../models/user");

const crypto = require("crypto");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const nodemailer = require("nodemailer");

const user = require("../models/user");

exports.signUp = (req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error(errors.errors[0].msg);
        error.statusCode = 422;
        throw error;
    }

    let {firstName,lastName,email,password,role} = req.body;

    // CHECK IF USER IS TRYING TO REGISTER AS ADMIN

    if(!role) role = "BASIC";

    User.findOne({role:"ADMIN"})
    .then(user=>{
        if(user && role==='ADMIN'){
            const error = new Error("Can't register as admin");
            error.statusCode = 403;
            throw error;
        }

        // NORMAL REGISTRATION CONTINUES
        return User.findOne({email:email});
    })
    .then(user=>{
        if(user){
            const error = new Error("E-mail address already exists");
            error.statusCode = 422;
            throw error;
        }
        return bcrypt.hash(password,10);
    })
    .then(hashedPassword=>{
        const newUser = new User({
            firstName,
            lastName,
            email,
            role,
            password: hashedPassword
        });
        return newUser.save();
    })
    .then(result=>{
        res.status(201).json({"message": "success"});
    })
    .catch(err=>{
        console.log(err);
        err.statusCode = err.statusCode || 500;
        next(err);
    })
    }


exports.logIn = (req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty){
        const error = new Error(errors.errors[0].msg);
        error.statusCode = 422;
        throw error;
    }

    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;

    User.findOne({
        email:email
    })
    .then(user=>{
        if(!user){
            const error = new Error("Email does not exist");
            error.statusCode = 401;
            throw error;
        }
        loadedUser = user;
        return bcrypt.compare(password,user.password);
    })
    .then(isMatch =>{
        if(!isMatch){
            const error = new Error("Incorrect password");
            error.statusCode = 401;
            throw error;
        }

        const signedUser = {
            firstName: loadedUser.firstName,
            lastName: loadedUser.lastName,
            email: loadedUser.email,
            role: loadedUser.role,
            id: loadedUser._id 
        }

        let expiresIn = (1000*60*60*2).toString();

        const accessToken = jwt.sign(signedUser,"secret",{expiresIn: expiresIn}); //TODO: USE ENV VARIABLE FOR SECRET AND USE SECURE SECRET

        res.status(200).json({
            accessToken,
            expiresIn,
            user: signedUser
        });
    })
    .catch(error=>{
        error.statusCode = error.statusCode || 500;
        next(error);
    })
}

exports.reset = (req,res,next) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty){
        const error = new Error(errors.errors[0].msg);
        error.statusCode = 422;
        throw error;
    }

    const email = req.body.email;
    let resetLink;

    User.findOne({
        email: email
    })
    .then(user =>{
        if(!user){
            const error = new Error("Email does not exist");
            error.statusCode = 422;
            throw error;
        }
        const resetToken = crypto.randomBytes(32).toString('hex');
        resetLink = process.env.DOMAIN + `/auth/update-password/${resetToken}`;

        console.log(`Generated reseToken is: ${resetToken}`);

        user.resetToken = resetToken;
        user.resetExp = Date.now() + 1000*60*30;

        return user.save();

    })
    .then(user =>{
        return nodemailer.createTestAccount();
    })
    .then(testAccount =>{
        let transporter = nodemailer.createTransport({
            host:"smtp.ethereal.email",
            port:587,
            secure: false,
            auth:{
                user: testAccount.user,
                pass: testAccount.pass
            }
        })

        return transporter.sendMail({
            from: "nodeecommerce.com",
            to:email,
            subject:"Password Reset",
            html: `<h2> Click <a href='${resetLink}'>here </a> to reset your password</h2>
            <br><p>Do not share this link with anyone</p>`
        })
    })
    .then(result =>{
        console.log(result);
        res.json({
            "message":"success"
        })
    })
    .catch(err =>{
        err.statusCode = err.statusCode || 500;
        return next(err);
    })
}

exports.updatePassword = (req,res,next) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty){
        const error = new Error(errors.errors[0].msg);
        error.statusCode = 422;
        throw error;
    }
    const password = req.body.password;
    const resetToken = req.params.resetToken;
    let resetUser;

    if(!resetToken){
        console.log(resetToken);
        const error = new Error("Not found");
        error.statusCode = 404;
        throw error;
    }

    if(password !== req.body.confirmPassword){
        console.log(req.body.confirmPassword);
        const error = new Error("Passwords do not match");
        error.statusCode = 422;
        throw error;
    }

    User.findOne({
        resetToken:resetToken
    })
    .then(user =>{
        if(!user){
            const error = new Error("Not found");
            error.statusCode = 404;
            throw error;
        }
        if(Date.now() > user.resetExp){
            const error = new Error("Link expired");
            error.statusCode = 403;
            throw error;
        }

        resetUser = user;

        return bcrypt.hash(password,12);
    })
    .then(hashedPassword =>{
        resetUser.password = hashedPassword;
        resetUser.resetExp = null;
        resetUser.resetToken = null;

        return resetUser.save();
    })
    .then(user =>{
        res.status(200).json({
            "message": "Password updated successfully"
        })
    })
    .catch(err =>{
        err.statusCode = err.statusCode || 500;
        return next(err);
    })
}

exports.checkUserRole = (req,res,next) =>{
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
        res.status(200).json({
            "role": user.role
        })
    })
    .catch(err=>{
        err.statusCode = err.statusCode || 500;
        next(err);
    })
}