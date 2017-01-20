let server = require('socket.io')(9999);
if (server) {
    console.log('게임 서버 대기중');
}

let clientInfos = {};
let playerCount = 0;
let readyCount = 0;

var bulletAngles = [];
var bulletFroms = [];
var bulletPos = [];

let p1name = '';
let p1char = 1;
let p2name = '';
let p2char = 1;

var canShoot = false;

server.on('connection', client => {
    console.log(`[클라이언트 접속] ${client.id}`);
    playerCount++;
    let defaultNickname = `User${client.id.substr(0, 5)}`;
    clientInfos[client.id] = {
        socket: client,
        nickname: defaultNickname,
        num: playerCount,
        cnum: 1,
        isCounted: false
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
    client.on('player1pos', data => {
        server.emit('player1pos', {
            x: data.x,
            y: data.y
        })
    })
    client.on('player2pos', data => {
        server.emit('player2pos', {
            x: data.x,
            y: data.y
        })
    })

    client.on('wind', data => {
        server.emit('wind', {
            num: data.num,
            to: data.to
        })
    })

    client.on('gameover', data => {
        server.emit('gameover', {
            num: data.num
        })
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
                console.log('gamestart');
                for(var i=0;i<1500;i++){
                    bulletAngles[i]=Math.floor(Math.random()*100)/100;
                    bulletPos[i]=Math.random()*750;
                    if(bulletAngles[i]>=0.125&&bulletAngles[i]<0.375){
                        bulletFroms[i]=0.25;

                    }
                    else if(bulletAngles[i]>=0.375&&bulletAngles[i]<0.625){
                        bulletFroms[i]=0.5;
                    }
                    else if(bulletAngles[i]>=0.625&&bulletAngles[i]<0.875){
                        bulletFroms[i]=0.75;
                    }
                    else{
                        bulletFroms[i]=0.0;
                    }
                }

               

                server.emit('gameStart', {
                    p1n: p1name,
                    p1c: p1char,
                    p2n: p2name,
                    p2c: p2char,
                    bulletangles : bulletAngles,
                    bulletfroms:bulletFroms,
                    bulletpos:bulletPos
                    
                })
            }
            readyCount++;
        }

    })

    client.on('disconnect', () => {
        console.log(`[클라이언트 접속 종료] ${client.id}`);
        if (clientInfos[client.id].isCounted == false) {
            playerCount--;

            server.emit('userOut', {
                outPlayerNum: clientInfos[client.id].num,
                nowPlayerCount: playerCount
            })
        }
        delete clientInfos[client.id];
    });

    client.on('gameout', () => {
        console.log('gameover');
        playerCount--;
        clientInfos[client.id].isCounted = true;
        readyCount=0;
        server.emit('userOut', {
            outPlayerNum: clientInfos[client.id].num,
            nowPlayerCount: playerCount
        })
    });
})