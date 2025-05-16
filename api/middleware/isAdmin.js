import prisma from "../lib/prisma.js";

// Middleware kiểm tra quyền admin
const isAdmin = async (req, res, next) => {
    if (req.userRole !== "admin") {
        return res.status(403).json({ message: "Not Authorized! Admins only." });
    }
    next();
};

export default isAdmin;