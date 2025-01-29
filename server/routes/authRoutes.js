import express from 'express';
import { adminAuth, login, logOut, verifyToken } from '../controllers/authController.js';
 

const router = express.Router();

router.post('/login', login);
router.post('/logout', adminAuth, logOut);
router.get("/verify", adminAuth, verifyToken);

export default router;
