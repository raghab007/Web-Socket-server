import { WebSocketServer } from 'ws';
import axios from 'axios'; // You'll need to install axios

const wss = new WebSocketServer({ port: 8086 });
let user = 0;
const allUsers = [];

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);
  console.log("user connected"+ user);
  
  ws.on('message', async function message(data) {
    try {
      const payload = JSON.parse(data.toString());
      console.log(payload);
      
      if(payload.type === "join"){
        allUsers.push({
          roomcode: payload.roomcode,
          socket: ws,
          userName: payload.userName
        });
        console.log(allUsers);
      } else if (payload.type === "message") {
        // Forward message to all clients in the same room
        allUsers.forEach(user => {
          if(user.roomcode === payload.roomcode && user.socket !== ws && user.userName !== payload.userName){
            user.socket.send(JSON.stringify({
              message: payload.message,
              username: payload.userName
            }));
          }
        });
        
        // Save message to database via HTTP API
        try {
          await axios.post('http://localhost:8085/messages', {
            courseId: payload.roomcode,
            userName: payload.userName,
            message: payload.message,
            date: new Date()
          });
          console.log('Message saved to database');
        } catch (error) {
          console.error('Failed to save message to database:', error.message);
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });
});