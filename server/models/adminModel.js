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