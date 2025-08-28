import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Razorpay from "razorpay";
import nodemailer from "nodemailer";
import admin from "firebase-admin";
import crypto from "crypto";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" })); // allow large payloads for uploads if needed
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// ----------------- MONGOOSE SETUP -----------------
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.warn("Warning: MONGO_URI not set in env.");
}
mongoose
  .connect(MONGO_URI, { })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err.message));

// ----------------- USER MODEL -----------------
import { Schema } from "mongoose";
const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  // add more fields (phone, address, bookings reference) as needed
});
const User = mongoose.model("User", userSchema);

// ----------------- JWT AUTH MIDDLEWARE -----------------
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });
  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // contains user id or email
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// ----------------- RAZORPAY SETUP -----------------
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Razorpay order
app.post("/api/razorpay/create-order", authMiddleware, async (req, res) => {
  try {
    const { amount, currency = "INR", receipt } = req.body;
    if (!amount) return res.status(400).json({ message: "Amount is required (IN paise)" });

    const options = {
      amount: amount, // in paise: e.g., ₹100 => 10000
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1 // auto-capture
    };

    const order = await razorpay.orders.create(options);
    return res.json(order);
  } catch (err) {
    console.error("Razorpay create order error:", err);
    return res.status(500).json({ message: "Razorpay order creation failed", error: err.message });
  }
});

// Verify payment (client should POST razorpay_payment_id, razorpay_order_id, razorpay_signature)
app.post("/api/razorpay/verify", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isValid = generated_signature === razorpay_signature;
    if (isValid) {
      // TODO: mark order as paid in DB, create booking record etc.
      return res.json({ success: true, message: "Payment verified" });
    } else {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (err) {
    console.error("Razorpay verify error:", err);
    return res.status(500).json({ message: "Verification failed", error: err.message });
  }
});

// ----------------- NODEMAILER (EMAIL) SETUP -----------------
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// simple send-email route
app.post("/api/email/send", async (req, res) => {
  try {
    const { to, subject, text, html } = req.body;
    if (!to || (!text && !html)) return res.status(400).json({ message: "Missing params" });

    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: subject || "Notification from CarSe-Chalo",
      text,
      html
    });

    return res.json({ message: "Email sent", info });
  } catch (err) {
    console.error("Email send error:", err);
    return res.status(500).json({ message: "Email failed", error: err.message });
  }
});

// ----------------- FIREBASE ADMIN SETUP (Storage) -----------------
/*
  Two ways to configure:
  1) Use FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, FIREBASE_PROJECT_ID in env vars (shown below)
  2) Use a service account JSON file and admin.credential.cert(require('./serviceAccount.json'))

  NOTE: FIREBASE_PRIVATE_KEY should contain newline escapes like \n; make sure to replace literal \n with actual newlines when loading from env.
*/
if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"); // fix newline chars
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
  console.log("✅ Firebase admin initialized");
} else {
  console.warn("⚠️ Firebase not configured: FIREBASE_* env variables missing");
}

// file upload to Firebase Storage
app.post("/api/upload", authMiddleware, async (req, res) => {
  try {
    if (!admin.apps.length) return res.status(500).json({ message: "Firebase not configured" });

    const { filename, base64 } = req.body;
    if (!filename || !base64) return res.status(400).json({ message: "filename and base64 required" });

    const bucket = admin.storage().bucket();
    const file = bucket.file(`uploads/${Date.now()}_${filename}`);

    const buffer = Buffer.from(base64, "base64");
    await file.save(buffer, {
      metadata: { contentType: "application/octet-stream" },
      public: true // set to true if you want public URL (caveats)
    });

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
    return res.json({ message: "File uploaded", url: publicUrl });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

// ----------------- AUTH ROUTES (REGISTER / LOGIN) -----------------
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Missing fields" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = new User({ name, email, passwordHash });
    await user.save();

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

    return res.json({ message: "User registered", user: { id: user._id, name: user.name, email: user.email }, token });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Registration failed", error: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Missing fields" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

    return res.json({ message: "Login successful", user: { id: user._id, name: user.name, email: user.email }, token });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Login failed", error: err.message });
  }
});

// Protected example route
app.get("/api/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ user });
  } catch (err) {
    console.error("Profile error:", err);
    return res.status(500).json({ message: "Failed to fetch profile", error: err.message });
  }
});

// Default root
app.get("/", (req, res) => res.send("CarSe-Chalo backend running"));

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
