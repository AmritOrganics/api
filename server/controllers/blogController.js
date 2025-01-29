import Blog from "../models/blogModel.js";

export const getBlog = async (req, res) => {
  //console.log("Entering to fetch the blogs");
  try {
    // const blogs = await Blog.find()
    //   .sort({ createdAt: -1 })
    //   .select("-_v")
    //   .lean();
    const blogs = await Blog.findAll();

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
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        message: "Blog not found",
      });
    }
    res.json({ status: "success", blog });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Error fetching blog details",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

export const createPost = async (req, res) => {
  try {
    const { title, description, content, author, category } = req.body;

    if (!title || !description || !content) {
      return res.status(400).json({ message: "Please fill in all fields." });
    }

    const imageData = req.file ? {
      url: req.file.path,
      publicId: req.file.filename
    } : null;

    const newPost = new Blog({
      title,
      description,
      content,
      author: author || "Anonymous",
      category: category || "Uncategorised",
      image: imageData
    });

    await newPost.save();
    res.json({
      status: "success",
      message: "Blog created successfully",
      post: newPost,
      id: newPost._id,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Error creating blog post",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

