// import mongoose from "mongoose";

// const blogSchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     description: {
//       type: String,
//       required: true,
//     },
//     content: {
//       type: String,
//       required: true,
//     },
//     author: {
//       type: String,
//       required: true,
//     },
//     image: {
//       url: {
//         type: String,
//         required: true,
//         default: 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fclimate.copernicus.eu%2Fglobal-agriculture-project&psig=AOvVaw0R9F6k_xR2y7IfqyCRZrZm&ust=1735921866007000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCOj69YO714oDFQAAAAAdAAAAABAE'
//       },
//       publicId: {
//         type: String,
//         required: true,
//         default: 'default_public_id',
//       },
//     },
//     category:{
//       type: String,
//       required: true,
//       default: 'No category'
//     },
//     createdAt: {
//       type: Date,
//       default: Date.now,
//     },
//   }
// );

// const Blog = mongoose.model("Blog", blogSchema);

// export default Blog;

// models/blogModel.js


import { pool } from '../config/db.js';

class Blog {
  static async findAll() {
    const [rows] = await pool.execute(
      'SELECT * FROM blog_posts ORDER BY created_at DESC'
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM blog_posts WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async create(data) {
    const { title, description, content, author, image, category } = data;
    const [result] = await pool.execute(
      `INSERT INTO blog_posts (title, description, content, author, image_url, image_public_id, category) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description,
        content,
        author || 'Anonymous',
        image?.url || 'default-image-url',
        image?.publicId || 'default_public_id',
        category || 'Uncategorized'
      ]
    );
    return result.insertId;
  }
}

export default Blog;
