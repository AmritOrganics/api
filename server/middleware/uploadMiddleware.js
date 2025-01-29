import multer from "multer";
import { cloudinaryUpload } from "../config/config.js";

const upload = multer({ storage: cloudinaryUpload });

export default upload;
