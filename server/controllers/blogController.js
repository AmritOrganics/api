import Blog from "../models/blogModel.js";
import { pool } from "../config/db.js";

export const getBlog = async (req, res) => {
  try {
    const [blogs] = await pool.query(
      "SELECT * FROM blog ORDER BY created_at DESC"
    );

    if (!blogs || blogs.length === 0) {
      return res.status(404).json({ message: "No blogs found" });
    }

    res.json({ status: "success", results: blogs.length, blogs });
  } catch (err) {
    res.status(500).json({
      message: err.message,
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

export const getBlogById = async (req, res) => {
  try {
    // const blog = await Blog.findById(req.params.id).select("-__v").lean();
    const [blog] = await pool.query("SELECT * FROM blog WHERE id = ?", [
      req.params.id,
    ]);

    if (!blog || blog.length === 0) {
      return res.status(404).json({
        message: "Blog not found",
      });
    }
    res.json({ status: "success", blog: blog[0] });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Error fetching blog details",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

export const createPost = async (req, res) => {
  console.log("create")
  try {
    const { title, description, content, author, category } = req.body;

    if (!title || !description || !content) {
      return res.status(400).json({ message: "Please fill in all fields." });
    }

    const imageData = req.file
      ? {
          url: req.file.path,
          publicId: req.file.filename,
        }
      : null;
    const [result] = await pool.query(
      "INSERT INTO blog (title, description, content, author, category, image_url, image_public_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
      [
        title,
        description,
        content,
        author || "Anonymous",
        category || "Uncategorised",
        imageData?.url || null,
        imageData?.publicId || null,
      ]
    );
    console.log("res", result);

    res.json({
      status: "success",
      message: "Blog created successfully",
      post: {
        id: result.insertId,
        title,
        description,
        content,
        author: author || "Anonymous",
        category: category || "Uncategorised",
        image: imageData,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.log("Error catch : ", err);
    res.status(500).json({
      status: "error",
      message: "Error creating blog post",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};
