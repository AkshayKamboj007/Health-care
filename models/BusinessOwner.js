const mongoose = require('mongoose');

const phlebotomistSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    hiredDate: { type: Date, default: Date.now },
});

const businessOwnerSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    companyName: { type: String, required: true },
    companyLogoUrl: { type: String },
    companyEmail: { type: String, required: true, unique: true },
    companyPhoneNumber: { type: String, required: true },
    companyAddress: { type: String, required: true },
    companyPostalCode: { type: String, required: true },
    email: { type: String, required: true, unique: true }, // Personal email of business owner
    otp: { type: String }, // Store OTP
    phlebotomists: [phlebotomistSchema], // Embedded sub-documents for phlebotomists    
    invitedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BusinessOwner', businessOwnerSchema);
