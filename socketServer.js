require('dotenv').config()
let clientSide

if (process.env.CLIENT_HOSTED === "production") {
    clientSide = "https://whats-up-zihad.netlify.app"
} else {
    clientSide = "http://localhost:3000"
}

console.log(clientSide);

const io = require("socket.io")(process.env.PORT || 7000, {
    cors: {
        origin: "https://whats-up-zihad.netlify.app",
        methods: ["GET", "POST"]
    }
})

let users = []

const addUser = (userId, socketId) => {
    !users.some((user) => user.userId === userId) && users.push({ userId, socketId })
}

const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
    return users.find((user) => user.userId === userId);
};


io.on("connection", (socket) => {
    console.log("socket server conn");
    // when connected
    socket.on("addUser", (authUserId) => {
        addUser(authUserId, socket.id)
        socket.emit("getUsers", users)
    })

    // messages
    socket.on("sendMessage", ({ senderId, receiverId, text, senderName, senderPic }) => {
        const user = getUser(receiverId);
        io.to(user?.socketId).emit("getMessage", {
            senderPic,
            senderName,
            sender: senderId,
            message: text,
        });
    })

    // notification
    socket.on("sendNotification", ({ receiver, name, profilePic, messages }) => {
        console.log({ receiver, name, messages });
        const sendingUser = getUser(receiver)
        console.log(sendingUser);
        io.to(sendingUser?.socketId).emit("getNotification", {
            name,
            profilePic,
            messages
        })
    })


    // when disconnect
    socket.on("disconnect", () => {
        console.log("a user disconnect");
        removeUser(socket.id)
        io.emit("getUsers", users)
    })

})