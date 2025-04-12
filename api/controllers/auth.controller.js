import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

export const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Kiểm tra email trùng lặp
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const hashedPass = await bcrypt.hash(password, 10);
    console.log("Hashed Password:", hashedPass);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPass,
        createdAt: new Date(), // Thêm nếu schema yêu cầu
      },
    });

    console.log("New User:", newUser);

    // Trả về response
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Register Error:", error);

    if (error.code === "P2002") {
      // Lỗi unique constraint (ví dụ: email đã tồn tại)
      return res.status(400).json({ message: "Email already exists" });
    }

    res.status(500).json({ message: "Error registering user" });
  } finally {
    await prisma.$disconnect(); // Đóng kết nối Prisma
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Validation
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    // Kiểm tra biến môi trường JWT_SECRET_KEY
    if (!process.env.JWT_SECRET_KEY) {
      return res.status(500).json({ message: "JWT_SECRET_KEY is not defined" });
    }

    // CHECK IF THE USER EXISTS
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials!" });
    }

    // CHECK IF THE PASSWORD IS CORRECT
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid Credentials!" });
    }

    // GENERATE COOKIE TOKEN AND SEND TO THE USER
    const age = 1000 * 60 * 60 * 24 * 7; // 7 ngày

    const token = jwt.sign(
      {
        id: user.id,
        isAdmin: false,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: age }
    );

    const { password: userPassword, ...userInfo } = user;

    res
      .cookie("token", token, {
        httpOnly: true,
        // secure: true, // Bật nếu dùng HTTPS
        maxAge: age,
      })
      .status(200)
      .json(userInfo);
  } catch (error) {
    console.error("Login Error:", error.message);
    console.error("Stack:", error.stack);
    res.status(500).json({ message: "Failed to login!" });
  } finally {
    await prisma.$disconnect(); // Đóng kết nối Prisma
  }
};

export const logout = (req, res) => {
  // Kiểm tra xem cookie token có tồn tại không
  if (!req.cookies.token) {
    return res.status(400).json({ message: "No token found, already logged out" });
  }

  res.clearCookie("token").status(200).json({ message: "Logout Successful" });
};