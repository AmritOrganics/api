// import mongoose from "mongoose";
// import bcrypt from "bcryptjs";

// const adminSchema = new mongoose.Schema({
//     email: {
//         type: String,
//         required: true,
//         unique: true
//     },
//     password: {
//         type: String,
//         required: true
//     }
// });

// adminSchema.pre("save", async function (next) {
//     if (!this.isModified("password")) {
//       return next();
//     }
//     try{
//       const salt = await bcrypt.genSalt(10);
//       this.password = await bcrypt.hash(this.password, salt);
//       next();
//     }catch(err){
//       next(err);
//     }
//   });

// const Admin = mongoose.model('Admin', adminSchema);

// export default Admin;

// models/adminModel.js
import { pool } from '../config/db.js';

class Admin {
  static async findByEmail(email) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM admins WHERE email = ?',
        [email]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error in findByEmail:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM admins WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error in findById:', error);
      throw error;
    }
  }
}

export default Admin;