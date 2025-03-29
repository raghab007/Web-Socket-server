import { WebSocketServer } from 'ws';
const wss = new WebSocketServer({ port: 8086 });
let user = 0;
const allUsers = [];
console.log(JSON.parse('{"message":"hello world"}'))
wss.on('connection', function connection(ws) {
  ws.on('error', console.error);
  console.log("user connected"+ user)
  ws.on('message', function message(data) {
    const payload = JSON.parse(data.toString())
    console.log(payload)
    if(payload.type=="join"){
        allUsers.push({
            roomcode:payload.roomcode,
            socket:ws,
            userName: payload.userName
        })
        console.log(allUsers)
    }else if (payload.type=="message"){
        allUsers.forEach(user=>{
            if(user.roomcode==payload.roomcode && user.socket!=ws && user.userName!=payload.userName){
                //user.socket.send(JSON.stringify({message:payload.message, username:payload.username}))
                user.socket.send(payload.message)
            }
        })
    }
  });
 
});
