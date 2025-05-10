import prisma from "../lib/prisma.js";

export const isAdmin = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
        });

        if (!user || user.role !== "admin") {
            return res.status(403).json({ message: "Access denied! Admins only." });
        }

        next();
    } catch (error) {
        console.error("Error in isAdmin middleware:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};