import "dotenv/config";
import dotenv from "dotenv";
import Admin from "../models/adminModel.js";
dotenv.config({ path: "../.env" });
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const DB = process.env.DBURI.replace("<PASSWORD>", process.env.DBPASSWORD);
mongoose
  .connect(DB, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
    process.exit(1);
  });

const addAdmins = async () => {
  try {
    const admins = [
      { email: process.env.EMAIL1, password: process.env.PASSWORD1 },
      { email: process.env.EMAIL2, password: process.env.PASSWORD2 },
      { email: process.env.EMAIL3, password: process.env.PASSWORD3 },
    ];

    for (const admin of admins) {
      const existingAdmin = await Admin.findOne({ email: admin.email });
      if (existingAdmin) {
        console.log(`Admin with email ${admin.email} already exists.`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(admin.password, 10);
      await Admin.create({
        email: admin.email,
        password: hashedPassword,
      });
      console.log(`Admin with email ${admin.email} added successfully.`);
    }
  } catch (err) {
    console.log("Error adding admins: ", err);
  }
};



addAdmins();
