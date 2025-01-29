// migration.js
import mongoose from "mongoose";
import Blog from "../models/blogModel.js";
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const DB = process.env.DBURI.replace("<PASSWORD>", process.env.DBPASSWORD);
const migrateBlogData = async () => {
  try {
    await mongoose.connect(DB);
    console.log("Connected to database");

    // Find all blogs
    const blogs = await Blog.find();

    // Update each blog
    for (const blog of blogs) {
      // Only update if the field doesn't exist
      const updates = {};
      
      if (!blog.category) updates.category = 'No category';
      if (!blog.author) updates.author = 'Anonymous';
      if (!blog.image || typeof blog.image === 'string') {
        updates.image = {
          url: blog.image,
          publicId: 'default_public_id'
        };
      }
      if (!blog.createdAt) updates.createdAt = new Date();
      

      if (Object.keys(updates).length > 0) {
        await Blog.findByIdAndUpdate(blog._id, updates);
        console.log(`Updated blog: ${blog._id}`);
      }
    }

    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await mongoose.disconnect();
  }
};

migrateBlogData();