import mongoose from "mongoose";
import mysql from "mysql2/promise";
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envPath = join(__dirname, '../../.env');
if (!fs.existsSync(envPath)) {
  console.error('.env file not found at:', envPath);
  process.exit(1);
}

dotenv.config({ path: envPath });

// Validate required environment variables
const requiredEnvVars = [
  'DBURI',
  'DBPASSWORD',
  'DB_HOST',
  'DB_USERNAME',
  'DB_PASSWORD',
  'DB_NAME'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please check your .env file and ensure all required variables are set.');
  process.exit(1);
}

// Initialize MongoDB connection string
const DB = process.env.DBURI.replace("<PASSWORD>", process.env.DBPASSWORD);

const migrationScript = async () => {
  let mongoConnection;
  let mysqlConnection;

  try {
    // MongoDB Connection
    mongoConnection = await mongoose.connect(DB);
    console.log("Connected to MongoDB");

    // MySQL Connection
    mysqlConnection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    console.log("Connected to MySQL");

    // Get MongoDB collections
    const db = mongoose.connection.db;

    // Migrate Admins
    console.log("Starting admin migration...");
    const adminCollection = db.collection("admins");
    const admins = await adminCollection.find({}).toArray();

    let successfulAdminMigrations = 0;
    let failedAdminMigrations = 0;

    for (const admin of admins) {
      try {
        await mysqlConnection.execute(
          "INSERT INTO admins (email, password, created_at) VALUES (?, ?, ?)",
          [admin.email, admin.password, admin.createdAt || new Date()]
        );
        successfulAdminMigrations++;
        console.log(`✓ Migrated admin: ${admin.email}`);
      } catch (err) {
        failedAdminMigrations++;
        console.error(`✗ Failed to migrate admin ${admin.email}:`, err.message);
      }
    }

    // Migrate Blogs
    console.log("\nStarting blog migration...");
    const blogCollection = db.collection("blogs");
    const blogs = await blogCollection.find({}).toArray();

    let successfulBlogMigrations = 0;
    let failedBlogMigrations = 0;

    for (const blog of blogs) {
      try {
        await mysqlConnection.execute(
          `INSERT INTO blog_posts (
            title, description, content, author, 
            image_url, image_public_id, category, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            blog.title,
            blog.description,
            blog.content,
            blog.author || "Anonymous",
            blog.image?.url || "default-image-url",
            blog.image?.publicId || "default_public_id",
            blog.category || "Uncategorized",
            blog.createdAt || new Date(),
          ]
        );
        successfulBlogMigrations++;
        console.log(`✓ Migrated blog: ${blog.title}`);
      } catch (err) {
        failedBlogMigrations++;
        console.error(`✗ Failed to migrate blog ${blog.title}:`, err.message);
      }
    }

    console.log("\nMigration Summary:");
    console.log("------------------");
    console.log(`Admins:`);
    console.log(`  ✓ Successfully migrated: ${successfulAdminMigrations}`);
    console.log(`  ✗ Failed migrations: ${failedAdminMigrations}`);
    console.log(`Blogs:`);
    console.log(`  ✓ Successfully migrated: ${successfulBlogMigrations}`);
    console.log(`  ✗ Failed migrations: ${failedBlogMigrations}`);

  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    // Clean up connections
    if (mongoConnection) {
      await mongoose.disconnect();
      console.log("MongoDB connection closed");
    }
    if (mysqlConnection) {
      await mysqlConnection.end();
      console.log("MySQL connection closed");
    }
  }
};

// Run the migration
migrationScript().catch(error => {
  console.error("Fatal error during migration:", error);
  process.exit(1);
});