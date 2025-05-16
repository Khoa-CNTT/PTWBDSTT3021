import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import isAdmin from "../middleware/isAdmin.js";
import { getAllUsers, deleteUser, getAllPosts, approvePost, deletePost, getAllAdmins } from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/", verifyToken, isAdmin, getAllAdmins);
router.get("/users", verifyToken, isAdmin, getAllUsers);
router.delete("/users/:id", verifyToken, isAdmin, deleteUser);
router.get("/posts", verifyToken, isAdmin, getAllPosts);
router.put("/posts/approve/:id", verifyToken, isAdmin, approvePost);
router.delete("/posts/:id", verifyToken, isAdmin, deletePost);

export default router;