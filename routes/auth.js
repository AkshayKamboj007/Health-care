const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * @swagger
 * /api/auth/superadmin/register:
 *   post:
 *     summary: Register a Super Admin
 *     description: Creates a new Super Admin account.
 *     tags: [SuperAdmin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: Super Admin registered successfully
 *       400:
 *         description: Admin already exists
 *       500:
 *         description: Internal server error
 */
router.post('/superadmin/register', authController.registerSuperAdmin);

/**
 * @swagger
 * /api/auth/superadmin/login:
 *   post:
 *     summary: Super Admin Login
 *     description: Authenticates a Super Admin and returns a JWT token.
 *     tags: [SuperAdmin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Successful login with JWT token
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */
router.post('/superadmin/login', authController.loginSuperAdmin);
/**
 * @swagger
 * /api/auth/superadmin/invite-business-owner:
 *   post:
 *     summary: Invite a Business Owner
 *     description: Sends an invitation to a business owner via email and SMS with an OTP.
 *     tags: [SuperAdmin]
 *     security:
 *       - BearerAuth: []  # Apply security to this endpoint
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               companyName:
 *                 type: string
 *                 example: MyCompany
 *               companyEmail:
 *                 type: string
 *                 example: contact@mycompany.com
 *               companyPhoneNumber:
 *                 type: string
 *                 example: 1234567890
 *               email:
 *                 type: string
 *                 example: owner@example.com
 *     responses:
 *       200:
 *         description: Invitation sent successfully
 *       400:
 *         description: Business owner already exists
 *       500:
 *         description: Error sending invitation email
 */
router.post('/superadmin/invite-business-owner', authController.inviteBusinessOwner);
/**
 * @swagger
 * /api/auth/validate-email:
 *   post:
 *     summary: Validate Email
 *     description: Sends a verification email to validate the email address.
 *     tags: [Validation]
 *     security:
 *       - BearerAuth: []  # Apply security to this endpoint
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@example.com
 *     responses:
 *       200:
 *         description: Verification email sent successfully
 *       400:
 *         description: Email is required
 *       500:
 *         description: Error sending verification email
 */
router.post('/validate-email', authController.validateEmail);
/**
 * @swagger
 * /api/auth/validate-mobile:
 *   post:
 *     summary: Validate Mobile Number
 *     description: Sends an OTP to the given mobile number for verification.
 *     tags: [Validation]
 *     security:
 *       - BearerAuth: []  # Apply security to this endpoint
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mobileNumber:
 *                 type: string
 *                 example: 9876543210
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Mobile number is required or invalid format
 *       500:
 *         description: Error sending OTP
 */
router.post('/validate-mobile', authController.validateMobile);

/**
 * @swagger
 * /api/auth/superadmin/users:
 *   get:
 *     summary: Get all Users
 *     description: Retrieves a list of all users and business owners.
 *     tags: [SuperAdmin]
 *     security:
 *       - BearerAuth: []  # Apply security to this endpoint
 *     responses:
 *       200:
 *         description: List of users and business owners
 *       401:
 *         description: Authorization header missing or invalid
 *       500:
 *         description: Internal server error
 */
router.get('/superadmin/users', authController.users);

/**
 * @swagger
 * /api/auth/registered-businessOwner:
 *   post:
 *     summary: Register a new Business Owner
 *     description: Allows a Super Admin to create a new user.
 *     tags: [Registered a businessOwner]
 *     security:
 *       - BearerAuth: []  # Apply security to this endpoint
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Jane Doe
 *               email:
 *                 type: string
 *                 example: jane@example.com
 *     responses:
 *       201:
 *         description: Registered business owner successfully
 *       400:
 *         description: Business owner already exists
 *       500:
 *         description: Internal server error
 */
router.post('/registered-businessOwner', authController.registeredBusinessOwner);
/**
 * @swagger
 * /api/auth/add-phlebotomist:
 *   post:
 *     summary: Add a Phlebotomist
 *     description: Allows a Super Admin to add a phlebotomist to a business owner's account.
 *     tags: [BusinessOwner]
 *     security:
 *       - BearerAuth: []  # Apply security to this endpoint
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               businessOwnerId:
 *                 type: string
 *                 example: 60d0fe4f5311236168a109ca
 *               name:
 *                 type: string
 *                 example: John Smith
 *               email:
 *                 type: string
 *                 example: john.smith@healthcare.com
 *               phoneNumber:
 *                 type: string
 *                 example: 9876543210
 *     responses:
 *       201:
 *         description: Phlebotomist added successfully
 *       400:
 *         description: Phlebotomist already exists
 *       401:
 *         description: Authorization header missing or invalid
 *       500:
 *         description: Internal server error
 */
router.post('/add-phlebotomist', authController.addPhlebotomist);
/**
 * @swagger
 * /api/auth/list-phlebotomists/{businessOwnerId}:
 *   get:
 *     summary: List Phlebotomists
 *     description: Retrieves a list of phlebotomists for a specified business owner.
 *     tags: [BusinessOwner]
 *     parameters:
 *       - in: path
 *         name: businessOwnerId
 *         required: true
 *         description: The ID of the business owner whose phlebotomists to retrieve.
 *         schema:
 *           type: string
 *           example: 60d0fe4f5311236168a109ca
 *     security:
 *       - BearerAuth: []  # Apply security to this endpoint
 *     responses:
 *       200:
 *         description: List of phlebotomists
 *       401:
 *         description: Authorization header missing or invalid
 *       404:
 *         description: Business owner not found
 *       500:
 *         description: Internal server error
 */
router.get('/list-phlebotomists/:businessOwnerId', authController.listPhlebotomists);

/**
 * @swagger
 * /api/auth/remove-phlebotomist/{businessOwnerId}/{phlebotomistId}:
 *   delete:
 *     summary: Remove a Phlebotomist
 *     description: Allows a Super Admin to remove a phlebotomist from a business owner's account.
 *     tags: [BusinessOwner]
 *     parameters:
 *       - in: path
 *         name: businessOwnerId
 *         required: true
 *         description: The ID of the business owner.
 *         schema:
 *           type: string
 *           example: 60d0fe4f5311236168a109ca
 *       - in: path
 *         name: phlebotomistId
 *         required: true
 *         description: The ID of the phlebotomist to be removed.
 *         schema:
 *           type: string
 *           example: 60d0fe4f5311236168a109cb
 *     security:
 *       - BearerAuth: []  # Apply security to this endpoint
 *     responses:
 *       200:
 *         description: Phlebotomist removed successfully
 *       401:
 *         description: Authorization header missing or invalid
 *       404:
 *         description: Business owner or phlebotomist not found
 *       500:
 *         description: Internal server error
 */

router.delete('/remove-phlebotomist/:businessOwnerId/:phlebotomistId', authController.removePhlebotomist);


// Create a new service
/**
 * @swagger
 * /api/services:
 *   post:
 *     summary: Create a new service
 *     description: Adds a new service with authorization.
 *     tags: [Services]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Cleaning Service
 *               description:
 *                 type: string
 *                 example: A professional cleaning service for homes and offices.
 *               image:
 *                 type: string
 *                 example: https://example.com/image.jpg
 *               price:
 *                 type: number
 *                 example: 50.00
 *     responses:
 *       201:
 *         description: Service created successfully
 *       401:
 *         description: Authorization header missing or invalid
 *       500:
 *         description: Internal server error
 */
router.post('/services', authController.createService);

// List all services
/**
 * @swagger
 * /api/services:
 *   get:
 *     summary: List all services
 *     description: Retrieves a list of all services with authorization.
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: List of services
 *       401:
 *         description: Authorization header missing or invalid
 *       500:
 *         description: Internal server error
 */
router.get('/services', authController.listServices);



module.exports = router;
