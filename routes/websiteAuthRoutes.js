const express = require('express');
const axios = require("axios");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const WebsiteUser = require('../models/WebsiteUser');
const router = express.Router();


// const webhookUrl = "https://hook.eu2.make.com/81agu3rgxopwp2slod2vrzi9kxr8wkjo";
// const webhookUrl = "https://n8n.srv1051234.hstgr.cloud/webhook-test/5f651680-d892-46a0-ac67-cc5c0363867b";
// const webhookUrl = "https://n8n.srv1051234.hstgr.cloud/webhook/5f651680-d892-46a0-ac67-cc5c0363867b";
// const webhookUrl = "https://n8n.srv1051234.hstgr.cloud/webhook/77bb8416-2b6e-42c3-8503-d27cb9ff1fbe"
const webhookUrl = "https://hook.us2.make.com/midowsmy7mryxl9keleeqvybrliz0c9w"


/**
 * @swagger
 * tags:
 *   name: Website Authentication
 *   description: Website user registration and login
 */

/**
 * @swagger
 * /api/website/register:
 *   post:
 *     summary: Register a new website user
 *     tags: [Website Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - brandName
 *               - category
 *               - subCategory
 *               - username
 *               - password
 *             properties:
 *               brandName:
 *                 type: string
 *                 example: FitFlow Yoga
 *               tagline:
 *                 type: string
 *                 example: Flow into your best self
 *               logo:
 *                 type: string
 *                 example: https://example.com/logo.png
 *               differentiator:
 *                 type: string
 *                 example: Morning-only yoga classes
 *               targetAudience:
 *                 type: string
 *                 example: Working professionals
 *               location:
 *                 type: string
 *                 example: New York
 *               tone:
 *                 type: string
 *                 example: Calming
 *               category:
 *                 type: string
 *                 example: Wellness
 *               subCategory:
 *                 type: string
 *                 example: Yoga
 *               username:
 *                 type: string
 *                 example: fitflow_admin
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       201:
 *         description: Website user registered successfully
 *       400:
 *         description: User already exists
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "Name, email, phone and password are required." });
    }

    // Derive username from email
    const username = email.split('@')[0].toLowerCase();

    // Check if already exists
    let user = await WebsiteUser.findOne({ email });
    if (user) return res.status(400).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert record with placeholders for future onboarding update
    user = new WebsiteUser({
      name,
      email,
      phone,
      username,
      password: hashedPassword,

      // Temporary placeholder values:
      brandName: "Not Set",
      tagline: "Not Set",
      logo: "",
      differentiator: "Not Set",
      targetAudience: "Not Set",
      location: "Not Set",
      tone: "Not Set",
      category: "Not Set",
      subCategory: "Not Set"
    });

    await user.save();

    res.status(201).json({
      message: "Registered successfully. Continue onboarding.",
      userId: user._id
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


/**
 * @swagger
 * /api/website/login:
 *   post:
 *     summary: Login website user
 *     tags: [Website Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: fitflow_admin
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       200:
 *         description: Successful login
 *       400:
 *         description: Invalid credentials
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await WebsiteUser.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/website/generate-prompt:
 *   post:
 *     summary: Generate AI image prompt and send data to Make webhook
 *     tags: [Website API's]
 *     description: Takes brand details and returns a creative AI image prompt. Also forwards the same data to a Make.com webhook for automation workflows.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - brandName
 *               - differentiator
 *               - targetAudience
 *               - toneMood
 *               - category
 *               - subCategory
 *             properties:
 *               brandName:
 *                 type: string
 *                 example: "FitZen Yoga Studio"
 *               tagline:
 *                 type: string
 *                 example: "Find your calm, every morning"
 *               differentiator:
 *                 type: string
 *                 example: "Morning-only yoga classes with Ayurvedic touch"
 *               targetAudience:
 *                 type: string
 *                 example: "Working professionals and homemakers"
 *               location:
 *                 type: string
 *                 example: "Bangalore, India"
 *               toneMood:
 *                 type: string
 *                 example: "Calming"
 *               category:
 *                 type: string
 *                 example: "Health & Wellness"
 *               subCategory:
 *                 type: string
 *                 example: "Yoga Studio"
 *               logoUrl:
 *                 type: string
 *                 example: "https://example.com/logo.png"
 *               platform:
 *                 type: string
 *                 example: "Landscape"
 *     responses:
 *       200:
 *         description: Successfully generated prompt and sent to Make
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Prompt generated and sent to Make successfully"
 *                 prompt:
 *                   type: string
 *                   example: "A serene yoga studio in Bangalore with calming natural light, minimalist decor, and a peaceful morning vibe inspired by Ayurveda — perfect for working professionals seeking relaxation. Brand: FitZen Yoga Studio."
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */
/**
 * @swagger
 * /api/website/generate-prompt:
 *   post:
 *     summary: Generate AI image prompt and send data to Make webhook
 *     tags: [Website API's]
 *     description: Takes brand details and returns a creative AI image prompt. Also forwards the same data to a Make.com webhook for automation workflows.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - brandName
 *               - differentiator
 *               - targetAudience
 *               - toneMood
 *               - category
 *               - subCategory
 *             properties:
 *               brandName:
 *                 type: string
 *                 example: "FitZen Yoga Studio"
 *               tagline:
 *                 type: string
 *                 example: "Find your calm, every morning"
 *               differentiator:
 *                 type: string
 *                 example: "Morning-only yoga classes with Ayurvedic touch"
 *               targetAudience:
 *                 type: string
 *                 example: "Working professionals and homemakers"
 *               location:
 *                 type: string
 *                 example: "Bangalore, India"
 *               toneMood:
 *                 type: string
 *                 example: "Calming"
 *               category:
 *                 type: string
 *                 example: "Health & Wellness"
 *               subCategory:
 *                 type: string
 *                 example: "Yoga Studio"
 *               logoUrl:
 *                 type: string
 *                 example: "https://example.com/logo.png"
 *               platform:
 *                 type: string
 *                 example: "Landscape"
 *     responses:
 *       200:
 *         description: Successfully generated prompt and sent to Make
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Prompt generated and sent to Make successfully"
 *                 prompt:
 *                   type: string
 *                   example: "A serene yoga studio in Bangalore with calming natural light, minimalist decor, and a peaceful morning vibe inspired by Ayurveda — perfect for working professionals seeking relaxation. Brand: FitZen Yoga Studio."
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */

router.post("/generate-prompt", async (req, res) => {
  try {
    const {
      brandName,
      tagline,
      differentiator,
      targetAudience,
      location,
      toneMood,
      category,
      subCategory,
      logoUrl,
      platform, // optional
    } = req.body;

    // Validation
    if (
      !brandName ||
      !differentiator ||
      !targetAudience ||
      !toneMood ||
      !category ||
      !subCategory
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Build AI image generation prompt dynamically
    const prompt = `
Create a high-quality, visually appealing ${toneMood.toLowerCase()} themed image for a brand named "${brandName}".
Category: ${category}, Subcategory: ${subCategory}.
Tagline: "${tagline || "No tagline provided"}".
Differentiator: ${differentiator}.
Target Audience: ${targetAudience}.
Location: ${location || "Not specified"}.
Make sure the image reflects the brand’s tone and connects emotionally with the audience.
`;

    // Send data to Make webhook
    const webhookData = {
      category,
      subcategory: subCategory,
      brandName,
      tagline,
      logoUrl: logoUrl || "",
      differentiator,
      targetAudience,
      location,
      tone: toneMood,
      platform: platform || "Landscape",
      generatedPrompt: prompt.trim(),
    };

    const webhookResponse = await axios.post(webhookUrl, webhookData);

    // Respond back to client
    res.status(200).json({
      message: "Prompt generated and sent to Make successfully",
      prompt: prompt.trim(),
      webhookResponse: webhookResponse.data,
    });
  } catch (err) {
    console.error("❌ Error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/website/logout:
 *   post:
 *     summary: Logout Website User
 *     tags: [Website API's]
 *     description: Ends the current session for a website user (client-side logout for JWT).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 message: "Website user logged out successfully"
 *       401:
 *         description: Unauthorized
 */
router.post('/logout', (req, res) => {
  try {
    res.status(200).json({ message: 'Website user logged out successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error during logout' });
  }
});

// ===============================
// 🖼️ Website Image Management APIs
// ===============================

const WebsiteImage = require('../models/WebsiteImage');

/**
 * @swagger
 * tags:
 *   - name: Generated Image
 *     description: APIs for storing and retrieving user-generated images
 */

/**
 * @swagger
 * /api/website/images:
 *   post:
 *     summary: Store user-generated image information
 *     tags: [Generated Image]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - prompt
 *               - imageUrl
 *             properties:
 *               userId:
 *                 type: string
 *                 example: 671ec4b7e50f0c32d9a98f54
 *               prompt:
 *                 type: string
 *                 example: A modern yoga studio in the forest
 *               imageUrl:
 *                 type: string
 *                 example: https://cdn.mysite.com/images/generated-yoga.png
 *     responses:
 *       201:
 *         description: Image saved successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */
router.post('/images', async (req, res) => {
  try {
    const { userId, prompt, imageUrl } = req.body;

    if (!userId || !prompt || !imageUrl) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newImage = new WebsiteImage({ userId, prompt, imageUrl });
    await newImage.save();

    res.status(201).json({ message: 'Image saved successfully', image: newImage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/website/images/{userId}:
 *   get:
 *     summary: Retrieve all user-generated images
 *     tags: [Generated Image]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user's MongoDB ObjectId
 *     responses:
 *       200:
 *         description: Successfully retrieved images
 *       404:
 *         description: No images found for this user
 *       500:
 *         description: Server error
 */
router.get('/images/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const images = await WebsiteImage.find({ userId }).sort({ createdAt: -1 });

    if (!images.length) {
      return res.status(404).json({ message: 'No images found' });
    }

    res.status(200).json(images);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});


const razorpay = require('../config/razorpay');
const WebsitePayment = require('../models/WebsitePayment');

/**
 * @swagger
 * tags:
 *   name: Website Payment
 *   description: APIs for plan selection and payment
 */

/**
 * @swagger
 * /api/website/payment/create-order:
 *   post:
 *     summary: Create a Razorpay order for selected plan
 *     tags: [Website Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - planName
 *               - amount
 *             properties:
 *               userId:
 *                 type: string
 *                 example: 671ea38e82cd9b0012e9c45a
 *               planName:
 *                 type: string
 *                 example: Premium Plan
 *               amount:
 *                 type: number
 *                 example: 499
 *     responses:
 *       200:
 *         description: Razorpay order created successfully
 */
router.post('/payment/create-order', async (req, res) => {
  try {
    const { userId, planName, amount } = req.body;

    const options = {
      amount: amount * 100, // Razorpay uses paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // Save order info in DB
    const payment = new WebsitePayment({
      userId,
      planName,
      amount,
      currency: 'INR',
      razorpayOrderId: order.id,
      paymentStatus: 'pending',
    });
    await payment.save();

    res.json({ orderId: order.id, currency: order.currency, amount: order.amount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/website/payment/verify:
 *   post:
 *     summary: Verify Razorpay payment signature and update status
 *     tags: [Website Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - razorpayOrderId
 *               - razorpayPaymentId
 *               - razorpaySignature
 *             properties:
 *               razorpayOrderId:
 *                 type: string
 *                 example: order_NXf67K2Fh5Dk1
 *               razorpayPaymentId:
 *                 type: string
 *                 example: pay_NXf7HTyI4BhbvH
 *               razorpaySignature:
 *                 type: string
 *                 example: 5c6e36e6ab1a2f88b07c8c97e3f013cd17ad1e67
 *     responses:
 *       200:
 *         description: Payment verified successfully
 *       400:
 *         description: Invalid signature
 */
router.post('/payment/verify', async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpaySignature;

    if (isAuthentic) {
      await WebsitePayment.findOneAndUpdate(
        { razorpayOrderId },
        {
          razorpayPaymentId,
          razorpaySignature,
          paymentStatus: 'success',
        }
      );

      res.json({ message: 'Payment verified successfully' });
    } else {
      await WebsitePayment.findOneAndUpdate(
        { razorpayOrderId },
        { paymentStatus: 'failed' }
      );
      res.status(400).json({ message: 'Invalid signature, payment failed' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/website/payment/history/{userId}:
 *   get:
 *     summary: Get all payments made by a user
 *     tags: [Website Payment]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Website user ID
 *     responses:
 *       200:
 *         description: Returns user's payment history
 */
router.get('/payment/history/:userId', async (req, res) => {
  try {
    const payments = await WebsitePayment.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
