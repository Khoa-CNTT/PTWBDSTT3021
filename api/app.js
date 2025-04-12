import express from "express";
import postRoute from "./routes/post.route.js";
import authRoute from "./routes/auth.route.js";
import userRoute from "./routes/user.route.js";
import testRoute from "./routes/test.route.js";
import chatRoute from "./routes/chat.route.js";
import messageRoute from "./routes/message.route.js";
//import postRoute from "./routes/post.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";

// Load biến môi trường từ file .env
dotenv.config();

const app = express();

// Cấu hình CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173", // Đảm bảo origin khớp với frontend
    credentials: true,
  })
);

// Middleware
app.use(express.json());
app.use(cookieParser());

// Debug log
console.log("CLIENT_URL:", process.env.CLIENT_URL);
console.log("Hello World");

// Routes
app.use("/api/auth", authRoute);
app.use("/api/test", testRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/chats", chatRoute);
app.use("/api/messages", messageRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Start server
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});