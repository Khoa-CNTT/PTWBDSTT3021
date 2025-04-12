import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany();

        res.status(200).json(users);
    }catch(err){
        console.log(err)
        res.status(500).json({message:"Failed to get users"})
    }
}

export const getUser = async (req, res) => {
    const id = req.params.id;
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    res.status(200).json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get user!" });
  }
}

export const updateUser = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;
  const { password, avatar, ...inputs } = req.body;

  if (id !== tokenUserId) {
    return res.status(403).json({ message: "Not Authorized!" });
  }

  let updatedPassword = null;
  try {
    if (password) {
      updatedPassword = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...inputs,
        ...(updatedPassword && { password: updatedPassword }),
        ...(avatar && { avatar }),
      },
    });

    const { password: userPassword, ...rest } = updatedUser;

    res.status(200).json(rest);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to update users!" });
  }
}

export const deleteUser = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;

  if (id !== tokenUserId) {
    return res.status(403).json({ message: "Not Authorized!" });
  }

  try {
    await prisma.user.delete({
      where: { id },
    });
    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to delete users!" });
  }
}

export const savePost = async (req, res) => {
  const postId = req.body.postId;
  const tokenUserId = req.userId;

  try {
    // Kiểm tra đã lưu chưa
    const savePost = await prisma.savePost.findUnique({
      where: {
        userId_postId: {
          userId: tokenUserId,
          postId,
        },
      },
    });

    if (savePost) {
      // Nếu đã lưu thì xoá (bỏ lưu)
      await prisma.savePost.delete({
        where: {
          id: savePost.id,
        },
      });
      res.status(200).json({ message: "Post removed from saved list" });
    } else {
      // Nếu chưa lưu thì tạo mới
      await prisma.savePost.create({
        data: {
          userId: tokenUserId,
          postId,
        },
      });
      res.status(200).json({ message: "Post saved" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to toggle save post" });
  }
};

export const profilePosts = async (req, res) => {
  const tokenUserId = req.userId; 

  try {
    const userPosts = await prisma.post.findMany({
      where: { userId: tokenUserId },
    });

    const saved = await prisma.savePost.findMany({
      where: { userId: tokenUserId },
      include: { post: true },
    });

    const savePosts = saved.map((item) => item.post);
    res.status(200).json({ userPosts, savePosts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get user posts" });
  }
};

export const getNotificationNumber = async (req, res) => {
  const tokenUserId = req.userId;
  try {
    const number = await prisma.chat.count({
      where: {
        userIDs: {
          hasSome: [tokenUserId],
        },
        NOT: {
          seenBy: {
            hasSome: [tokenUserId],
          },
        },
      },
    });
    res.status(200).json(number);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get profile posts!" });
  }
};