import "dotenv/config";
import dotenv from "dotenv";
import Admin from "../models/adminModel.js";
dotenv.config({ path: "../.env" });
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
// import {pool} from "../config/db.js";

// TODO:  It is added just for default. Need to remove
import mysql from "mysql2/promise";
const pool = mysql.createPool({
  host: 'localhost',
  user: 'amritorg_root',
  password: 'Amrit@1234',
  database: 'amritorg_db',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
const addAdmins = async () => {
  try {
    const admins = [
      { email: "admin@abc.com", password: "abc@Admin" },
      
    ];

    for (const admin of admins) {
      // Check if admin already exists
      const [rows] = await pool.query(
        "SELECT email FROM admins WHERE email = ?",
        [admin.email]
      );

      if (rows.length > 0) {
        console.log(`Admin with email ${admin.email} already exists.`);
        continue;
      }

      console.log("admin password : ", admin.password);
      // Hash the password
      const hashedPassword = await bcrypt.hash(admin.password, 10);


      // Insert new admin
      await pool.query("INSERT INTO admins (email, password) VALUES (?, ?)", [
        admin.email,
        hashedPassword,
      ]);
      console.log(`Admin with email ${admin.email} added successfully.`);
    }
  } catch (err) {
    console.error("Error adding admins: ", err);
  }
};
addAdmins();
