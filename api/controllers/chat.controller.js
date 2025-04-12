import prisma from "../lib/prisma.js";

//lâys thanh chat toàn bộbộ
export const getChats = async (req, res) => {
  const tokenUserId = req.userId;

  try {
    const chats = await prisma.chat.findMany({
      where: {
        userIDs: {
          hasSome: [tokenUserId], //mảng id
        },
      },
    });
    
    //lay id hai user trongc chatchat
    for (const chat of chats) {
      const receiverId = chat.userIDs.find((id) => id !== tokenUserId);

      const receiver = await prisma.user.findUnique({
        where: {
          id: receiverId,
        },
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      });
      chat.receiver = receiver;
    }

    res.status(200).json(chats);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get chats!" });
  }
};

export const getChat = async (req, res) => {
  const tokenUserId = req.userId;

  try {
    const chat = await prisma.chat.findUnique({
      where: {
        id: req.params.id,
        userIDs: {
          hasSome: [tokenUserId],
        },
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    await prisma.chat.update({
      where: {
        id: req.params.id,
      },
      data: {
        seenBy: {
          push: [tokenUserId],
        },
      },
    });
    res.status(200).json(chat);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get chat!" });
  }
};

// export const addChat = async (req, res) => {
//   const tokenUserId = req.userId;
//   try {
//     const newChat = await prisma.chat.create({
//       data: {
//         userIDs: [tokenUserId, req.body.receiverId],
//       },
//     });
//     res.status(200).json(newChat);
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: "Failed to add chat!" });
//   }
// };

// export const addChat = async (req, res) => {
//   const tokenUserId = req.userId;
//   const { receiverId } = req.body;

//   // Kiểm tra dữ liệu đầu vào
//   if (!tokenUserId || typeof tokenUserId !== "string") {
//     return res.status(400).json({ message: "Invalid user ID" });
//   }
//   if (!receiverId || typeof receiverId !== "string") {
//     return res.status(400).json({ message: "Invalid receiver ID" });
//   }

//   // Kiểm tra user tồn tại
//   try {
//     const sender = await prisma.user.findUnique({
//       where: { id: tokenUserId },
//     });
//     const receiver = await prisma.user.findUnique({
//       where: { id: receiverId },
//     });

//     if (!sender) {
//       return res.status(404).json({ message: "Sender not found" });
//     }
//     if (!receiver) {
//       return res.status(404).json({ message: "Receiver not found" });
//     }

//     const newChat = await prisma.chat.create({
//       data: {
//         userIDs: [tokenUserId, receiverId],
//       },
//     });
//     res.status(200).json(newChat);
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: "Failed to add chat!", error: err.message });
//   }
// };

export const addChat = async (req, res) => {
  const tokenUserId = req.userId;
  const { receiverId } = req.body;

  if (!tokenUserId || typeof tokenUserId !== "string") {
    return res.status(400).json({ message: "Invalid user ID" });
  }
  if (!receiverId || typeof receiverId !== "string") {
    return res.status(400).json({ message: "Invalid receiver ID" });
  }

  if (tokenUserId === receiverId) {
    return res.status(400).json({ message: "Cannot create a chat with yourself" });
  }

  try {
    const sender = await prisma.user.findUnique({
      where: { id: tokenUserId },
    });
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!sender) {
      return res.status(404).json({ message: "Sender not found" });
    }
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    // Kiểm tra xem chat đã tồn tại chưa
    const existingChat = await prisma.chat.findFirst({
      where: {
        userIDs: {
          hasEvery: [tokenUserId, receiverId],
        },
      },
    });

    if (existingChat) {
      return res.status(200).json(existingChat);
    }

    // Tạo chat mới
    const newChat = await prisma.chat.create({
      data: {
        userIDs: [tokenUserId, receiverId],
        seenBy: [tokenUserId],
      },
    });

    // Cập nhật chatIDs của sender và receiver trong transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: tokenUserId },
        data: {
          chatIDs: {
            push: newChat.id,
          },
        },
      }),
      prisma.user.update({
        where: { id: receiverId },
        data: {
          chatIDs: {
            push: newChat.id,
          },
        },
      }),
    ]);

    res.status(200).json(newChat);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to add chat!", error: err.message });
  }
};

export const readChat = async (req, res) => {
  const tokenUserId = req.userId;

  
  try {
    const chat = await prisma.chat.update({
      where: {
        id: req.params.id,
        userIDs: {
          hasSome: [tokenUserId],
        },
      },
      data: {
        seenBy: {
          set: [tokenUserId],
        },
      },
    });
    res.status(200).json(chat);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to read chat!" });
  }
};