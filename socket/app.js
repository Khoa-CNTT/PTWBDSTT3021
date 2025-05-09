import {Server, Socket} from "socket.io";

const io = new Server({
    cors: {
        origin: "http://localhost:5173/",
    },
});

// Cấu hình OpenAI API
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

let onlineUser = [];

const addUser = (userId, socketId) => {
    const userExist = onlineUser.find((user) => user.userId === userId);
    if (!userExist) {
        onlineUser.push({ userId, socketId });
    }
};

const removeUser = (socketId) => {
    onlineUser = onlineUser.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
    return onlineUser.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
    socket.on("newUser", (userId) => {
        addUser(userId, socket.id);
        console.log(onlineUser)
    });

    socket.on("sendMessage", ({ receiverId, data }) => {
        const receiver = getUser(receiverId)
        io.to(receiver.socketId).emit("getMessage", data);
    });

    socket.on("userMessage", async (message) => {
        try {
          const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: message,
            max_tokens: 150,
          });
    
          const reply = response.data.choices[0].text.trim();
          socket.emit("aiReply", reply);
        } catch (err) {
          console.error("Error with AI chat:", err);
          socket.emit("aiReply", "Sorry, I couldn't process your message.");
        }
      });

    socket.on("disconnect", () => {
        removeUser(socket.id);
    })
});

io.listen("4000")