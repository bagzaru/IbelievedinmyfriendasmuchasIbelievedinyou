let server = require('socket.io')(9999);
if (server) {
    console.log('게임 서버 대기중');
}

let clientInfos = {};
let playerCount = 0;
let readyCount = 0;

let p1name = '';
let p1char = 1;
let p2name = '';
let p2char = 1;

server.on('connection', client => {
    console.log(`[클라이언트 접속] ${client.id}`);
    playerCount++;
    let defaultNickname = `User${client.id.substr(0, 5)}`;
    clientInfos[client.id] = {
        socket: client,
        nickname: defaultNickname,
        num: playerCount,
        cnum: 1
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

    client.on('userOutCheck', data => {
        clientInfos[client.id].num = data.nownum;
    })

    client.on('playerjoin', data => {
        clientInfos[client.id].nickname = data.pname;
        clientInfos[client.id].cnum = data.pchar;
    })

    client.on('wantjoin', data => {
        if (playerCount >= 2) {
            client.emit('gotojoin', {});
            if (clientInfos[client.id].num == 1) {
                p1char = data.cha;
                p1name = data.name;
            }
            if (clientInfos[client.id].num == 2) {
                p2char = data.cha;
                p2name = data.name;
            }
            if (readyCount == 1) {

                server.emit('gameStart', {
                    p1n: p1name,
                    p1c: p1char,
                    p2n: p2name,
                    p2c: p2char
                })
            }
            readyCount++;
        }

    })

    client.on('disconnect', () => {
        console.log(`[클라이언트 접속 종료] ${client.id}`);
        playerCount--;

        server.emit('userOut', {
            outPlayerNum: clientInfos[client.id].num,
            nowPlayerCount: playerCount
        })
        delete clientInfos[client.id];
    });
})