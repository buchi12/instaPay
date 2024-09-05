import mongoose from "mongoose";

// Define custom validation functions

const minPriceValidator = {
    validator: function(value) {
        // Ensure the price is at least 200 dollars
        return value >= 200;
    },
    message: 'The minimum price willing to pay must be at least $200.'
};

const UserSchema = new mongoose.Schema({
    firstname: { type: String, required: [true, 'First name is required'] },
    lastname: { type: String, required: [true, 'Last name is required'] },
    password: { 
        type: String, 
        required: [true, 'Password is required'],
        match: [/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_])[0-9a-zA-Z\W_]{8,}$/, 'Password must be at least 8 characters long, include at least one digit, one lowercase letter, one uppercase letter, and one special character.']
    },
    email: { 
        type: String, 
        required: [true, 'Email is required'],
        match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w{2,3})+$/,
        unique: true 
    },
    resetToken: { type: String },
    expireToken: Date,
    agreeToTerms: { type: Boolean, required: [true, 'Agreeing to terms is required'] },
    WhatPriceOrWillingToPay: { 
        type: Number, 
        required: [true, 'Willingness to pay is required'],
        validate: minPriceValidator
    },
    DoYouOwnOrRentalProperty: { type: String, required: [true, 'Ownership or rental status is required'] },
    DoYouOwnStockesOrBoundsOrCrypto: { type: Boolean, required: [true, 'Stock ownership is required'] },
    Typeofemployeement: { type: String, required: [true, 'Type of employment is required'] },
    zipcode: { type: String, required: [true, 'Zipcode is required'] }
});

const UserModel = mongoose.model("User", UserSchema);

export { UserModel as User };
