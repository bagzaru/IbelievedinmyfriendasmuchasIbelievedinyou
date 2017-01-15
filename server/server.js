let server = require('socket.io')(9999);
if (server) {
    console.log('게임 서버 대기중');
}

let clientInfos = {};
let playerCount = 0;

server.on('connection', client => {
    console.log(`[클라이언트 접속] ${client.id}`);
    playerCount++;
    let defaultNickname = `User${client.id.substr(0, 5)}`;
    clientInfos[client.id] = {
        socket: client,
        nickname: defaultNickname,
        num: playerCount
    };

    client.emit('welcome', {
        nickname: defaultNickname,
        playerNum: playerCount
    });

    client.on('userIn', data => {
        server.emit('userIn', {
            PlayerCount: playerCount
        })
    })

    client.on('userOutCheck',data=>{
        clientInfos[client.id].num=data.nownum;
    })

    client.on('playerCountRe', data => {
        server.emit('playerCountRe', {
            PlayerCount: playerCount
        })
    })

    client.on('disconnect', () => {
        console.log(`[클라이언트 접속 종료] ${client.id}`);
        playerCount--;

        server.emit('userOut', {
            outPlayerNum: clientInfos[client.id].num,
            nowPlayerCount:playerCount
        })
        delete clientInfos[client.id];
    });
})