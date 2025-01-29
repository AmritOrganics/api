import express from "express"
import { createPost, getBlog, getBlogById } from "../controllers/blogController.js";
import { adminAuth } from "../controllers/authController.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/getposts", getBlog);
router.get("/getpost/:id", getBlogById);
router.post("/create", adminAuth, upload.single("image"), createPost);

export default router;