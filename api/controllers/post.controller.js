import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";

export const getPosts = async (req, res) => {
  const query = req.query;

  try {
    const posts = await prisma.post.findMany({
      where: {
        approved: true, // Chỉ lấy các bài đã được duyệt
        city: query.city || undefined,
        type: query.type ? query.type.toLowerCase() : undefined,
        property: query.property || undefined,
        bedroom: parseInt(query.bedroom) || undefined,
        price: {
          gte: parseInt(query.minPrice) || 0,
          lte: parseInt(query.maxPrice) || 10000000,
        },
      },
    });
    res.status(200).json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get posts" });
  }
};

export const getPost = async (req, res) => {
  const id = req.params.id;

  try {
    // Lấy bài viết từ database
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        postDetail: true,
        user: {
          select: {
            username: true,
            avatar: true,
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (!post.approved) {
      return res.status(403).json({ message: "Bài viết đang chờ admin duyệt." });
    }

    const token = req.cookies?.token;

    if (token) {
      jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
        if (err) {
          console.log("Invalid token:", err);
          return res.status(401).json({ message: "Invalid token" }); // Dừng luồng xử lý tại đây
        }

        try {
          // Kiểm tra xem bài viết đã được lưu hay chưa
          const saved = await prisma.savedPost.findUnique({
            where: {
              userId_postId: {
                postId: id,
                userId: payload.id,
              },
            },
          });

          return res.status(200).json({ ...post, isSaved: saved ? true : false }); // Dừng luồng xử lý tại đây
        } catch (err) {
          console.error("Error checking saved post:", err);
          return res.status(500).json({ message: "Failed to check saved post" }); // Dừng luồng xử lý tại đây
        }
      });

      // Thêm `return` để đảm bảo luồng xử lý không tiếp tục sau khi `jwt.verify` được gọi
      return;
    }

    // Nếu không có token, trả về bài viết với isSaved = false
    return res.status(200).json({ ...post, isSaved: false });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to get post" });
  }
};

export const addPost = async (req, res) => {
  const body = req.body;
  const tokenUserId = req.userId;

  try {
    const newPost = await prisma.post.create({
      data: {
        ...body.postData,
        userId: tokenUserId,
        approved: false, // Luôn set approved = false khi user đăng bài
        postDetail: {
          create: body.postDetail,
        },
      },
    });
    res.status(200).json({ ...newPost, pending: true }); // Thêm trường pending để client biết bài đang chờ duyệt
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create post" });
  }
};

export const updatePost = async (req, res) => {
  try {
    // Update logic here
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update post" });
  }
};

export const deletePost = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;

  try {
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (post.userId !== tokenUserId) {
      return res.status(403).json({ message: "Not Authorized" });
    }

    await prisma.post.delete({
      where: { id },
    });

    res.status(200).json({ message: "Post deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete post" });
  }
};

export const approvePost = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await prisma.post.update({
      where: { id },
      data: { status: "approved" }, // Cập nhật trạng thái bài viết
    });
    res.status(200).json({ message: "Post approved successfully!", post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to approve post!" });
  }
};
