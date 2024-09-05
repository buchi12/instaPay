import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import crypto from 'crypto';
import { User } from '../models/User.js';  

const router = express.Router();

router.post('/signup', async (req, res) => {
    try {
        const {
            firstname,
            lastname,
            password,
            email,
            zipcode,
            agreeToTerms,
            WhatPriceOrWillingToPay,
            DoYouOwnOrRentalProperty,
            DoYouOwnStockesOrBoundsOrCrypto,
            Typeofemployeement,
        } = req.body;

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        const token = jwt.sign({username: firstname},process.env.KEY,{expiresIn:'3h'})
       

        // Create a new user with the provided data
        const newUser = new User({
            firstname,
            lastname,
            password: hashedPassword,
            email,
            zipcode,
            agreeToTerms,
            WhatPriceOrWillingToPay,
            DoYouOwnOrRentalProperty,
            DoYouOwnStockesOrBoundsOrCrypto,
            Typeofemployeement,
            token
        });

        // Save the new user to the database
        await newUser.save();

        // Return success response
        return res.json({ message: 'User registered successfully' });

    } catch (error) {
        if (error.name === 'ValidationError') {
      const errors = Object.keys(error.errors).reduce((acc, key) => {
        acc[key] = error.errors[key].message;
        return acc;
      }, {});

      return res.status(400).json({ errors });
    }
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
});




//Login API  

router.post("/login",async (req,res)=>{
    const {email, password}= req.body;
    const user = await User.findOne({ email});
    if(!user){
        return res.status(400).json({message:'user is not register'})
    }
    const validationpassword = await bcrypt.compare(password, user.password)

    if (!validationpassword){
        return res.status(400).json({message:"password is incorrect"})
    }

    const token = jwt.sign({username: user.firstname},process.env.KEY,{expiresIn:'3h'})
    res.cookie('token',token,{httpOnly:true,maxAge:6000000})
    return res.json({message:"login sucessfull"})

})



//*************forgot password API *******************

router.post("/forgot-password", async (req, res) => {
  crypto.randomBytes(32,(err,buffer)=>{
    if(err){
        console.log(err)
    }
    const token = buffer.toString("hex")
    User.findOne({email:req.body.email})
    .then(user=>{
        if(!user){
            return res.status(422).json({error:"User dont exists with that email"})
        }
        user.resetToken = token
        user.expireToken = Date.now() + 3600000
        user.save().then((result)=>{
            const transporter = nodemailer.createTransport( {
                  service: 'gmail',
                  auth: {
                    user: process.env.MAIL_USERNAME,
                    pass: process.env.MAIL_PASSWORD
                  }
                });
                var mailOptions = {
                to: req.body.email,
                from:process.env.MAIL_USERNAME,
                subject:"password reset",
                html:`
                <h2>'You are receiving this because you (or someone else) have requested the reset of the password for your account.</br> Please click on the following link, or paste this into your browser to complete the process'</h2>
                <a style="background-color: #f44336; color: white; padding: 14px 25px; text-align: center; text-decoration: none; display: inline-block;" href=http://localhost:3001/resetpassword/${token}>Reset Password</a>
                `
                };
                transporter.sendMail(mailOptions, function(error, info) {
                    if(error) {
                        console.log(error);
                    }
                    else {
                        console.log('Email sent:' + info.response)
                    }
                  });
            res.json({message:"check your email"})
        })

    })
})
});



//*************reset password API *******************
router.post('/reset-password/:token', async (req, res) => {

  const newPassword = req.body.password
    const sentToken = req.params.token
    User.findOne({resetToken:sentToken,expireToken:{$gt:Date.now()}})
    .then(user=>{
        if(!user){
            return res.status(422).json({error:"Try again session expired"})
        }
        bcrypt.genSalt(10, (err, salt) =>{
        bcrypt.hash(newPassword,salt).then(hashedpassword=>{
           user.password = hashedpassword
           user.resetToken = ''
           user.expireToken = ''
           user.save().then((saveduser)=>{
               res.json({message:"password updated success"})
           })
        })
        })
    }).catch(err=>{
        console.log(err)
    })
  
  })
  

export { router as UserRouter };