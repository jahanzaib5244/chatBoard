const express = require('express');
const userRoutes = require('./Routes/userRoutes');
const chatRoutes = require('./Routes/chatRoutes');
const mongoose = require('mongoose');
const config = require('./config/keys');
const Chat = require('./Models/ChatModel');
const path = require('path');
const Cryptr = require('cryptr');
const cryptr = new Cryptr(config.crptrSecret);
const app = express();

const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: "/*",
    }
}
);



/******************************************MiddleWares  ********************************************/
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(__dirname + '/uploads'));
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);

/******************************************MongoDb Connection********************************************/

mongoose.connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    
  
}).then(() => console.log('MongoDb Connected')).catch(err => console.log(err));

if (process.env.NODE_ENV === 'production') { // For running frontend if you are hosting both frontend and backend on the server. The server will serve the static build file in frontend/build
    app.use(express.static('./frontend/build'));

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));

    });
}

const sessionsMap = {};
io.on('connection', socket => {
    console.log('New Connection');
    socket.on("join", ({ userId, username }) => {
        sessionsMap[userId] = socket.id;
        console.log(sessionsMap);
        socket.on("Get Online Status", (online) => {
            const receiverId = sessionsMap[online.receiver];
            if (receiverId) {
                socket.emit('Outputting Online Status', `Online`);
              
            } else {
                socket.emit("Outputting Online Status", `Offline`);
               
            }
        });

        socket.on("Input Chat Message", (msg) => {
            const encryptedMessage = cryptr.encrypt(msg.message);
            let chat = new Chat({
                message: encryptedMessage,
                cloudinary_id: msg.cloudinary_id,
                sender: msg.userId,
                receiver: msg.receiver,
                timeOfSending: msg.nowTime,
                type: msg.type
            });

            chat.save((error, doc) => {
                if (error) {
                    console.log(error);
                }
                Chat.find({ "$or": [{ "sender": msg.userId, "receiver": msg.receiver }, { "sender": msg.receiver, "receiver": msg.userId }] })
                    .populate("sender")
                    .exec((err, result) => {
                        if (err) {
                            console.log(error);
                        }
                        result.map(r => r.message = cryptr.decrypt(r.message));
                        const receiverId = sessionsMap[msg.receiver];
                        socket.broadcast.to(receiverId).emit('Output Chat Message', result);
                        socket.emit("Output Chat Message", result);

                    });
            });
        });

    });

});

server.listen(process.env.PORT || 8000, () => console.log('Listening to port 8000'));
