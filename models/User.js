import mongoose from "mongoose"

const UserSchema = new mongoose.Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    password: { type: String, required: true },
    email: { 
        type: String, 
        required: true, 
        match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        unique: true 
    },
    agreeToTerms: { type: Boolean, required: true },
    WhatPriceOrWillingToPay: { type: Number, required: true },
    DoYouOwnOrRentalProperty: { type: String, required: true },
    DoYouOwnStockesOrBoundsOrCrypto: { type: Boolean, required: true },
    Typeofemployeement: { type: String, required: true },
    zipcode: { type: String, required: true }
})


const UserModel = mongoose.model("User",UserSchema)

export {UserModel as User}