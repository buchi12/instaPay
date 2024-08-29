import express from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/User.js';  
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import mongoose from 'mongoose';
const router = express.Router();

router.post('/signup', async (req, res) => {
    try {
        const {
            firstname,
            lastname,
            password,
            email,
            agreeToTerms,
            WhatPriceOrWillingToPay,
            DoYouOwnOrRentalProperty,
            DoYouOwnStockesOrBoundsOrCrypto,
            Typeofemployeement,
            zipcode
        } = req.body;

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user with the provided data
        const newUser = new User({
            firstname,
            lastname,
            password: hashedPassword,
            email,
            agreeToTerms,
            WhatPriceOrWillingToPay,
            DoYouOwnOrRentalProperty,
            DoYouOwnStockesOrBoundsOrCrypto,
            Typeofemployeement,
            zipcode
        });

        // Save the new user to the database
        await newUser.save();

        // Return success response
        return res.json({ message: 'User registered successfully' });

    } catch (error) {
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

    const token = jwt.sign({username: user.username},process.env.KEY,{expiresIn:'3h'})
    res.cookie('token',token,{httpOnly:true,maxAge:6000000})
    return res.json({message:"login sucessfull"})

})

//*************forgot password API *******************



router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "No user found" });
    }

    const token = jwt.sign({ username: user.username }, process.env.KEY, { expiresIn: '3h' });

    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'buchichowdary02@gmail.com',
        pass: 'axqf zzdo qfwe ldjv'
      }
    });

    var mailOptions = {
      from: 'buchichowdary02@gmail.com',
      to: email,
      subject: 'Reset password',
      text: `http://localhost:3000/resetpassword/${token}`
    };

    // Wrap sendMail in a Promise
    const sendMailPromise = () => {
      return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            reject(error);
          } else {
            resolve(info);
          }
        });
      });
    };

    // Await the result of sendMailPromise
    await sendMailPromise();

    res.status(200).json({ message: "Password reset email sent" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


router.get("/reset-password/:id/:token", async (req, res) => {
  const { id, token } = req.params;

  // Debugging output
  console.log("ID:", id);
  console.log("Token:", token);

  const oldUser = await User.findById(id); // Use findById for simplicity
  if (!oldUser) {
      return res.json({ status: "User Not Exists!!" });
  }
  const secret = process.env.KEY + oldUser.password;
  try {
      const verify = jwt.verify(token, secret);
      res.render("index", { email: verify.email, status: "Not Verified" });
  } catch (error) {
      console.log(error);
      res.send("Not Verified");
  }
});

// POST /reset-password/:token

router.post('/reset-password/:token', async (req, res) => {

  const {token}= req.params;
  
  const {password} = req.body
  
  try {
  
  const decoded= await jwt.verify(token, process.env.KEY);
  
  const id= decoded.id;
  
  const hashPassword =await bcryt.hash (password, 10)
  
  await User.findByIdAndUpdate({_id: id}, {password: hashPassword})
  
  return res.json({status: true, message: " updated password"})
  
  
  } catch(err)
  
  {
  
  return res.json("invalid token")
  
  }
  
  })
  
  
  
  


   

export { router as UserRouter };
