import express from "express";
// import mongoose from "mongoose";
import "dotenv/config";
import path from "path";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import authRoutes from "./routes/authRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import cookieParser from "cookie-parser";
const router = express.Router();
import {pool} from "./config/db.js"
//Test database connection
async function testConnection() {
  try{
    const connection = await pool.getConnection();
    console.log("Database connection successful");
    connection.release();
  }catch(err){
    console.error("Database connection failed : ", err);
    process.exit(1);
  }
}

testConnection();
// const DB = process.env.DBURI.replace("<PASSWORD>", process.env.DBPASSWORD);

// mongoose
//   .connect(DB, {
//     // useNewUrlParser: true,
//     // useCreateIndex: true,
//     // useFindAndModify: false,
//     // useUnifiedTopology: true,
//   })
//   .then((con) => {
//     console.log("DB connection is successful");
//   })
//   .catch((err) => {
//     console.log(err);
//     process.exit(1);
//   });

const port = process.env.PORT || 3000;

const __dirname = path.resolve();

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "client/dist")));

app.use("/", router);

const contactEmail = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

contactEmail.verify((error) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Ready to Send");
  }
});

router.post("/api/contact", (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const subject = req.body.subject;
  const phone = req.body.phone;
  const message = req.body.message;

  if (!name || !email || !message) {
    return res.status(400).json({
      code: 400,
      status: "Missing required fields",
    });
  }
  const mail = {
    from: `"Amrit Organics Contact Form" <sales@amritorganics.in>`,
    to: process.env.EMAIL_USER,
    replyTo: `"${name}" <${email}>`,
    subject: `Contact From Submission - Amrit Organics`,
    html: `<p>Name: ${name}</p>
           <p>Email: ${email}</p>
           <p>Subject: ${subject}</p>
           <p>Phone: ${phone}</p>
           <p>Message: ${message}</p>`,
  };
  contactEmail.sendMail(mail, (error) => {
    if (error) {
      console.log("Email error : ", error);
      res
        .status(500)
        .json({ code: 500, status: "Error sending message", error });
    } else {
      res.json({ code: 200, status: "Message Sent" });
    }
  });
});

app.use("/api/admin", authRoutes);
app.use("/api/post", blogRoutes);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
