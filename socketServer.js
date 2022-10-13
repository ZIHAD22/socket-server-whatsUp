let clientSide

if (process.env.NODE_ENV === "production") {
    clientSide = "https://whats-up-zihad.netlify.app/"
} else {
    clientSide = "http://localhost:3000"
}

console.log(clientSide);

const io = require("socket.io")(7000, {
    cors: {
        origin: clientSide,
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
    socket.on("sendMessage", ({ senderId, receiverId, text }) => {
        const user = getUser(receiverId);
        io.to(user.socketId).emit("getMessage", {
            sender: senderId,
            message: text,
        });
    })


    // when disconnect
    socket.on("disconnect", () => {
        console.log("a user disconnect");
        removeUser(socket.id)
        io.emit("getUsers", users)
    })

})