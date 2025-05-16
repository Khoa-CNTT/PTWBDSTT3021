import prisma from "../lib/prisma.js";

// Lấy danh sách admin
export const getAllAdmins = async (req, res) => {
    try {
        const admins = await prisma.user.findMany({ where: { role: "admin" } });
        res.status(200).json(admins);
    } catch (err) {
        console.error("Failed to fetch admins:", err);
        res.status(500).json({ message: "Failed to fetch admins" });
    }
};

// Fetch all users
export const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({ where: { role: { not: "admin" } } });
        res.status(200).json(users);
    } catch (err) {
        console.error("Failed to fetch users:", err);
        res.status(500).json({ message: "Failed to fetch users" });
    }
};

// Delete a user
export const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        // Xóa các saved post liên quan
        await prisma.savedPost.deleteMany({ where: { userId } });
        // Lấy tất cả postId của user
        const posts = await prisma.post.findMany({ where: { userId } });
        const postIds = posts.map(post => post.id);
        // Xóa postDetail liên quan đến các post
        await prisma.postDetail.deleteMany({ where: { postId: { in: postIds } } });
        // Xóa các post của user
        await prisma.post.deleteMany({ where: { userId } });
        // Xóa user
        await prisma.user.delete({ where: { id: userId } });
        res.status(200).json({ message: "User deleted successfully!" });
    } catch (err) {
        console.error("Failed to delete user:", err);
        res.status(500).json({ message: "Failed to delete user!", error: err.message });
    }
};

// Fetch all posts
export const getAllPosts = async (req, res) => {
    try {
        const posts = await prisma.post.findMany();
        res.status(200).json(posts);
    } catch (err) {
        console.error("Failed to fetch posts:", err);
        res.status(500).json({ message: "Failed to fetch posts" });
    }
};

// Approve a post
export const approvePost = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.post.update({
            where: { id: id },
            data: { approved: true },
        });
        res.status(200).json({ message: "Post approved successfully" });
    } catch (err) {
        console.error("Failed to approve post:", err);
        res.status(500).json({ message: "Failed to approve post" });
    }
};

// Delete a post
export const deletePost = async (req, res) => {
    try {
        // Delete related PostDetail first
        await prisma.postDetail.deleteMany({ where: { postId: req.params.id } });
        // Then delete the Post
        await prisma.post.delete({ where: { id: req.params.id } });
        res.status(200).json({ message: "Post deleted successfully!" });
    } catch (err) {
        console.error("Failed to delete post:", err);
        res.status(500).json({ message: "Failed to delete post!" });
    }
};
