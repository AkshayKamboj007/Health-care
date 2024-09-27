const SuperAdmin = require('../models/SuperAdmin');
const User = require('../models/User');
const BusinessOwner = require('../models/BusinessOwner');
const Service = require('../models/serviceModel');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const twilio = require('twilio');
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// ======================= Super Admin Operations =======================

// 1. Super Admin Registration
exports.registerSuperAdmin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingAdmin = await SuperAdmin.findOne({ email });
        if (existingAdmin) {
            console.error(`Admin with email ${email} already exists`);
            return res.status(400).json({ message: 'Admin already exists' });
        }

        const newAdmin = new SuperAdmin({ email, password });
        await newAdmin.save();
        res.status(201).json({ message: 'Super Admin registered successfully' });
    } catch (error) {
        console.error('Error during Super Admin registration:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// 2. Super Admin Login
exports.loginSuperAdmin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const admin = await SuperAdmin.findOne({ email });
        if (!admin || !(await bcrypt.compare(password, admin.password))) {
            console.error(`Invalid login attempt for admin: ${email}`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: admin._id, email: admin.email }, process.env.JWT_SECRET, { expiresIn: '5h' });
        res.json({ token });
    } catch (error) {
        console.error('Error during Super Admin login:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// ======================= User Operations =======================

// 3. Create User (Business Owner)
exports.registeredBusinessOwner = async (req, res) => {
    console.log("Request received for creating user", req.body);
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await SuperAdmin.findOne({ email: decoded.email });
        if (!admin) {
            return res.status(401).json({ message: 'Admin not found' });
        }

        const { name, email } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const newUser = new User({ name, email });
        await newUser.save();
        res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        console.error('Error during user creation:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// 4. Get Users
exports.users = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await SuperAdmin.findOne({ email: decoded.email });
        if (!admin) {
            return res.status(401).json({ message: 'Admin not found' });
        }

        const existingUsers = await User.find();
        const businessOwners = await BusinessOwner.find();
        res.status(200).json({ existingUsers, businessOwners });
    } catch (error) {
        console.error('Error fetching users:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// ======================= Business Owner Operations =======================

// 5. Invite Business Owner
exports.inviteBusinessOwner = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await SuperAdmin.findOne({ email: decoded.email });
        if (!admin) {
            return res.status(401).json({ message: 'Admin not found' });
        }

        const {
            firstName, lastName, companyName, companyLogoUrl, companyEmail,
            companyPhoneNumber, companyAddress, companyPostalCode, email
        } = req.body;

        const existingOwner = await BusinessOwner.findOne({ email });
        if (existingOwner) {
            return res.status(400).json({ message: 'Business owner already exists' });
        }

        const uniqueId = crypto.randomBytes(16).toString("hex");
        const newBusinessOwner = new BusinessOwner({
            firstName, lastName, companyName, companyLogoUrl, companyEmail,
            companyPhoneNumber, companyAddress, companyPostalCode, email
        });

        await newBusinessOwner.save();
        console.log('New business owner saved successfully:', newBusinessOwner);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const platformLink = `https://your-platform.com/register/${uniqueId}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Business Owner Invitation',
            text: `Dear ${firstName} ${lastName},\n\nYou have been invited to join our platform as a business owner for ${companyName}.\n\nPlease register using the following link: ${platformLink}\n\nBest regards,\nYour Company Name`
        };

        await transporter.sendMail(mailOptions);
        console.log(`Invitation email sent to ${email} with link: ${platformLink}`);

        res.status(200).json({ message: 'Invitation sent successfully with unique link' });

    } catch (error) {
        console.error('Error sending invitation email:', error.message);
        res.status(500).json({ message: 'Error sending invitation email' });
    }
};

// ======================= Phlebotomist Operations =======================

// 6. Add a Phlebotomist
exports.addPhlebotomist = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await SuperAdmin.findOne({ email: decoded.email });
        if (!admin) {
            return res.status(401).json({ message: 'Admin not found' });
        }

        const { businessOwnerId, name, email, phoneNumber } = req.body;
        const businessOwner = await BusinessOwner.findById(businessOwnerId);
        if (!businessOwner) {
            return res.status(404).json({ message: 'Business owner not found' });
        }

        const existingPhlebotomist = businessOwner.phlebotomists.find(p => p.email === email);
        if (existingPhlebotomist) {
            return res.status(400).json({ message: 'Phlebotomist already exists' });
        }

        businessOwner.phlebotomists.push({ name, email, phoneNumber });
        await businessOwner.save();

        res.status(201).json({ message: 'Phlebotomist added successfully', phlebotomist: { name, email, phoneNumber } });
    } catch (error) {
        console.error('Error adding phlebotomist:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// 7. List Phlebotomists
exports.listPhlebotomists = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await SuperAdmin.findOne({ email: decoded.email });
        if (!admin) {
            return res.status(401).json({ message: 'Admin not found' });
        }

        const { businessOwnerId } = req.params;
        const businessOwner = await BusinessOwner.findById(businessOwnerId);
        if (!businessOwner) {
            return res.status(404).json({ message: 'Business owner not found' });
        }

        res.status(200).json({ phlebotomists: businessOwner.phlebotomists });
    } catch (error) {
        console.error('Error listing phlebotomists:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// 8. Remove Phlebotomist
exports.removePhlebotomist = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await SuperAdmin.findOne({ email: decoded.email });
        if (!admin) {
            return res.status(401).json({ message: 'Admin not found' });
        }

        const { businessOwnerId, phlebotomistId } = req.params;
        const businessOwner = await BusinessOwner.findById(businessOwnerId);
        if (!businessOwner) {
            return res.status(404).json({ message: 'Business owner not found' });
        }

        businessOwner.phlebotomists = businessOwner.phlebotomists.filter(p => p._id.toString() !== phlebotomistId);
        await businessOwner.save();

        res.status(200).json({ message: 'Phlebotomist removed successfully' });
    } catch (error) {
        console.error('Error removing phlebotomist:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// ======================= Service Operations =======================

// 9. Create Service
exports.createService = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];
    try {
        jwt.verify(token, process.env.JWT_SECRET);
        const { name, description, image, price } = req.body;

        const newService = new Service({ name, description, image, price });
        await newService.save();

        res.status(201).json({ message: 'Service created successfully', service: newService });
    } catch (error) {
        console.error('Error creating service:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// 10. List Services
exports.listServices = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];
    try {
        jwt.verify(token, process.env.JWT_SECRET);
        const services = await Service.find();
        res.status(200).json(services);
    } catch (error) {
        console.error('Error fetching services:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// ======================= Email & Mobile Validation =======================

// 11. Validate Email
exports.validateEmail = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        const verificationToken = crypto.randomBytes(20).toString('hex');
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const verificationLink = `https://your-platform.com/verify-email/${verificationToken}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Email Verification',
            text: `Please verify your email by clicking on the following link: ${verificationLink}`,
            html: `<p>Please verify your email by clicking on the following link:</p>
                   <a href="${verificationLink}">Verify Email</a>`
        };

        await transporter.sendMail(mailOptions);
        return res.status(200).json({
            message: 'Verification email sent successfully',
            verificationLink
        });
    } catch (error) {
        console.error('Error sending verification email:', error);
        return res.status(500).json({ message: 'Error sending verification email' });
    }
};

// 12. Validate Mobile
const validateMobileNumberFormat = (mobileNumber) => {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(mobileNumber);
};

exports.validateMobile = async (req, res) => {
    const { mobileNumber } = req.body;
    if (!mobileNumber) {
        return res.status(400).json({ message: 'Mobile number is required' });
    }

    if (!validateMobileNumberFormat(mobileNumber)) {
        return res.status(400).json({ message: 'Invalid mobile number format' });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    try {
        const message = await twilioClient.messages.create({
            body: `Your OTP for mobile verification is ${otp}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: `+91${mobileNumber}`,
        });

        console.log('OTP sent successfully:', message.sid);
        return res.status(200).json({
            message: 'OTP sent successfully',
            otp // Don't send this in production
        });
    } catch (error) {
        console.error('Error sending OTP:', error);
        return res.status(500).json({
            message: 'Error sending OTP',
            error: error.message,
        });
    }
};
