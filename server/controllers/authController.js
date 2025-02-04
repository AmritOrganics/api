import Admin from "../models/adminModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { errorHandler } from "../middleware/error.js";

export const adminAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return next(errorHandler(401, "Authentication required"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return next(errorHandler(401, "Invalid token"));
    }
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return next(errorHandler(401, "Invalid token"));
    }

    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(errorHandler(401, "Token expired"));
    }
    next(errorHandler(401, "Invalid token"));
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      next(errorHandler(400, "All Fields are required"));
    }

    // const validAdmin = await Admin.findOne({ email });
    console.log("Email : ", email);
    console.log(`"${password}"`);
   

    const admin = await Admin.findByEmail(email);
    console.log("Admin details: ", admin);
    if (!admin) {
      
      return next(errorHandler(404, "Admin not found"));
    }
    console.log("Admin password", admin.password);

    // Verify password
    const validPassword = await bcrypt.compare(password, admin.password);
    console.log("Valid Password : ", validPassword);
    if (!validPassword) {
      return next(errorHandler(401, "Invalid password"));
    }
    

    // Generate JWT
    const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const { password: _, ...adminWithoutPassword } = admin;

    res
      .status(200)
      .cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 3600000,
      })
      .json({
        message: "Login successful",
        token,
        admin: adminWithoutPassword,
      });
  } catch (error) {
    console.error("Login error:", error);
    next(errorHandler(500, "Internal Server error"));
  }
};

export const logOut = async (req, res, next) => {
  try {
    res
      .clearCookie("access_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      })
      .status(200)
      .json("User Logout Successfully");
  } catch (err) {
    next(errorHandler(500, "Internal Server error"));
  }
};

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return next(errorHandler(401, "No token provided"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return next(errorHandler(401, "Invalid Token"));
    }

    res.status(200).json({ valid: true });
  } catch (err) {
    next(errorHandler(401, "Invalid Token"));
  }
};
