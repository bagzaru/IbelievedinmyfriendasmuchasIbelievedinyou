(function () {
    let socket = io.connect('http://localhost:9999');
    var mycount = 0;
    var servercount = 0;
    var isGaming = false;
    var waitCount = 0;
    var isReady = false;
    var p2name = '';
    var p2char = 1;
    socket.on('welcome', data => {
        mycount = data.playerNum;
        servercount = data.playerNum;
        socket.emit('userIn', {});
    });
    socket.on('userIn', data => {
        servercount = data.PlayerCount;
    });
    socket.on('userOut', data => {
        if (data.outPlayerNum < mycount) {
            mycount--;
        }
        servercount = data.nowPlayerCount;
        socket.emit('userOutCheck', {
            nownum: mycount
        })
    });
    socket.on('gotojoin', data => {
        isReady = true;
    });
    socket.on('gameStart', data => {
        if (isReady) {
            if (mycount == 1) {
                p2char = data.p2c;
                p2name = data.p2n;
            }
            if (mycount == 2) {
                p2char = data.p1c;
                p2name = data.p1n;
            }
            isGaming = true;

        } else {
            alert('게임이 시작되었습니다. 잠시만 기다려주세요');
        }
    })
    socket.on('wind',data=>{
        if(mycount!=data.num){
            windto=data.to;
            makewind=true;
        }
    })
     socket.on('player1pos', data => {
        p1x=data.x;
        p1y=data.y;
    });
    socket.on('player2pos', data => {
        p2x=data.x;
        p2y=data.y;
    });
    var p1x=0;
    var p1y=0;
    var p2x=0;
    var p2y=0;
    var windto='d';
    var makewind=false;
    var game = new Light.Game('game', 800, 600, '#E3F2FD', function (asset) {
        asset.loadImage('c1', 'resources/digda.png');
        asset.loadImage('c2', 'resources/hndlpoongson.png');
        asset.loadImage('c3', 'resources/JunSeokTheUnityMaster.png');
        asset.loadImage('c4', 'resources/metamong.png');
        asset.loadImage('c5', 'resources/slime.png');
        asset.loadImage('laserH', 'resources/laser.png');
        asset.loadImage('laserV', 'resources/laser2.png');
        asset.loadImage('warningH', 'resources/warning.png');
        asset.loadImage('warningV', 'resources/warning2.png');
        asset.loadImage('exlaserH', 'resources/warningl.png');
        asset.loadImage('exlaserV', 'resources/warningl2.png');
        asset.loadImage('mywind', 'resources/wind.png');
        asset.loadImage('ewind', 'resources/Ewind.png');
        asset.loadImage('cursor', 'resources/cursor.png');
        asset.loadImage('ball', 'resources/ballBB.png');
        asset.loadImage('intro', 'resources/intro.png');
        asset.loadImage('gameboard', 'resources/gameboard.png');
    });

    var introState = new Light.State(game);
    var loadState = new Light.State(game);
    var gameState = new Light.State(game);
    var endState = new Light.State(game);

    var myname = '';
    var mycharacter = 0;
    var cursor;
    var titleText;
    var loadingText;
    var isCanStart = false;

    var ballAngle = 0;
    var ballPosX = 0;
    var ballPosY = 0;
    var ballSpeed = 0;
    var isBallCanShoot = false;

    var isLaserPointX = false;
    var laserPoint = 0;
    var isLaserCanShoot = false;

    var windlist=[];
    var laserlist=[];
    var bulletlist=[];

    Unit = function (imgSrc, speed) {
        Light.EntityContainer.call(this);
        this.sprite = new Light.Sprite(imgSrc);
        this.addChild(this.sprite);
        game.physics.add(this);
        this.body.maxVelocity.x = speed;
        this.body.maxVelocity.y = speed * 2;
        this.speed = speed;

        this.width = this.sprite.width;
        this.height = this.sprite.height;
    };
    Unit.prototype = Object.create(Light.EntityContainer.prototype);
    Unit.prototype.constructor = Unit;

    Player = function () {
        var cname = '';
        switch (mycharacter) {
            case 1:
                cname = 'c1';
                break;
            case 2:
                cname = 'c2';
                break;
            case 3:
                cname = 'c3';
                break;
            case 4:
                cname = 'c4';
                break;
            case 5:
                cname = 'c5';
                break;
        }
        Unit.call(this, game.asset.getImage(cname), 75);
        this.body.friction.x = 0.95;
        this.sprite.scaleCenter.x = this.width / 2;
        this.hp = 300;
    };
    Player.prototype = Object.create(Unit.prototype);
    Player.prototype.constructor = Player;

    Player2 = function () {
        var pname = '';
        switch (p2char) {
            case 1:
                pname = 'c1';
                break;
            case 2:
                pname = 'c2';
                break;
            case 3:
                pname = 'c3';
                break;
            case 4:
                pname = 'c4';
                break;
            case 5:
                pname = 'c5';
                break;
        }
        Unit.call(this, game.asset.getImage(pname), 75);
        this.body.friction.x = 0.95;
        this.sprite.scaleCenter.x = this.width / 2;
        this.hp = 300;
    };
    Player2.prototype = Object.create(Unit.prototype);
    Player2.prototype.constructor = Player2;

    Ball = function () {
        Unit.call(this, game.asset.getImage('player'), 25);
        this.body.friction.x = 0.95;
        this.sprite.scaleCenter.x = this.width / 2;
        this.hp = 300;
    };
    Ball.prototype = Object.create(Unit.prototype);
    Ball.prototype.constructor = Ball;

    LaserShadowV = function () {
        Unit.call(this, game.asset.getImage('player'), 25);
        this.body.friction.x = 0.95;
        this.sprite.scaleCenter.x = this.width / 2;
        this.hp = 300;
    };
    LaserShadowV.prototype = Object.create(Unit.prototype);
    LaserShadowV.prototype.constructor = LaserShadowV;

    LaserV = function () {
        Unit.call(this, game.asset.getImage('player'), 25);
        this.body.friction.x = 0.95;
        this.sprite.scaleCenter.x = this.width / 2;
        this.hp = 300;
    };
    LaserV.prototype = Object.create(Unit.prototype);
    LaserV.prototype.constructor = LaserV;

    LaserShadowH = function () {
        Unit.call(this, game.asset.getImage('player'), 25);
        this.body.friction.x = 0.95;
        this.sprite.scaleCenter.x = this.width / 2;
        this.hp = 300;
    };
    LaserShadowH.prototype = Object.create(Unit.prototype);
    LaserShadowH.prototype.constructor = LaserShadowH;

    LaserH = function () {
        Unit.call(this, game.asset.getImage('player'), 25);
        this.body.friction.x = 0.95;
        this.sprite.scaleCenter.x = this.width / 2;
        this.hp = 300;
    };
    LaserH.prototype = Object.create(Unit.prototype);
    LaserH.prototype.constructor = LaserH;

    MyWind = function () {
        Unit.call(this, game.asset.getImage('mywind'), 25);
        this.body.friction.x = 0.95;
        this.sprite.scaleCenter.x = this.width / 2;
        this.hp = 300;
    };
    MyWind.prototype = Object.create(Unit.prototype);
    MyWind.prototype.constructor = MyWind;

    EWind = function (to) {
        Unit.call(this, game.asset.getImage('ewind'), 25);
        this.body.friction.x = 0.95;
        this.sprite.scaleCenter.x = this.width / 2;
        this.hp = 300;
        this.to = to;
    };
    EWind.prototype = Object.create(Unit.prototype);
    EWind.prototype.constructor = EWind;

    introState.onInit = function () {
        game.input.keyboard.keyCapturing = [
            Light.Keyboard.CONTROL, Light.Keyboard.ALTERNATE, Light.Keyboard.ESCAPE,
            Light.Keyboard.RIGHT, Light.Keyboard.LEFT, Light.Keyboard.ENTER
        ];
        this.addChild(new Light.Sprite(game.asset.getImage('intro')));
        cursor = new Light.Sprite(game.asset.getImage('cursor'));
        cursor.x = 21;
        cursor.y = 380;
        this.addChild(cursor);
    };

    introState.onUpdate = function (elapsed) {
        if (myname != document.getElementById('input').value) {
            myname = document.getElementById('input').value;
        }
        if (game.input.keyboard.isJustPressed(Light.Keyboard.LEFT)) {
            if (cursor.x > 21)
                cursor.x -= 154;
        }
        if (game.input.keyboard.isJustPressed(Light.Keyboard.RIGHT)) {
            if (cursor.x < 637)
                cursor.x += 154;
        }
        if (!isCanStart && game.input.keyboard.isJustPressed(Light.Keyboard.ENTER)) {
            isCanStart = true;
            titleText = new Light.TextField();
            titleText.font = "25px 궁서";
            titleText.fillStyle = "#ff0000";
            titleText.position.set(120, 100);
            if (myname == '')
                titleText.text = '이름이 없습니다. Enter키를 다시 눌러주세요'
            else
                titleText.text = '이름 : ' + myname + ', Enter키를 입력하면 시작합니다';
            this.addChild(titleText);
        }
        if (isCanStart && game.input.keyboard.isJustPressed(Light.Keyboard.ENTER)) {
            if (myname == '') {
                isCanStart = false;
                this.removeChild(titleText);
            } else {
                mycharacter = (cursor.x - 21) / 154 + 1;
                socket.emit('playerjoin', {
                    pname: myname,
                    pchar: mycharacter
                })
                game.states.change('loading');

            }
        }

        if (isCanStart && game.input.keyboard.isJustPressed(Light.Keyboard.ESCAPE)) {
            isCanStart = false;
            this.removeChild(titleText);
        }
    }

    loadState.onInit = function () {
        //나중에 서버 추가할 때 수정하기
        //socket.emit('playerCountRe', {});
        //socket.on('playerCountRe',data=>{
        //    mycount=data.PlayerCount;
        //})
        loadText = new Light.TextField();
        loadText.font = "25px 궁서";
        loadText.fillStyle = "#ff0000";
        loadText.position.set(120, 100);
        loadText.text = '대기열 ' + (mycount - 2) + '번째';
        this.addChild(loadText);
    }

    loadState.onUpdate = function (elapsed) {
        //나중에 서버 추가할 때 수정하기
        loadText.text = '대기열 ' + (mycount - 2) + '번';
        if (isGaming) {
            game.states.change('game');
        }
        if (mycount < 3 && waitCount == 30 && !isReady) {
            socket.emit('wantjoin', {
                name: myname,
                cha: mycharacter
            });
            waitCount = 0;
        }
        if (waitCount == 30) {
            waitCount = 0;
        }
        waitCount++;
    }

    gameState.onInit = function () {
        this.bullets=[];
        this.winds=[];
        this.lasers=[];
        this.addChild(new Light.Sprite(game.asset.getImage('gameboard')));
        game.input.keyboard.keyCapturing = [Light.Keyboard.A, Light.Keyboard.D, Light.Keyboard.W,
            Light.Keyboard.CONTROL, Light.Keyboard.ALTERNATE, Light.Keyboard.ESCAPE,
            Light.Keyboard.RIGHT, Light.Keyboard.LEFT, Light.Keyboard.ENTER, Light.Keyboard.UP,
            Light.Keyboard.DOWN, Light.Keyboard.S, Light.Keyboard.SPACE
        ];
        this.spawnDelay = 2.0;

        this.unitLayer = new Light.EntityContainer();
        this.addChild(this.unitLayer);

        this.player = new Player();
        this.unitLayer.addChild(this.player);
        this.player2 = new Player2();
        this.unitLayer.addChild(this.player2);

        if (mycount == 1) {
            this.player.x = 100;
            this.player.y = 300;
            this.player2.x = 600;
            this.player2.y = 300;
            p2x=600;
            p2y=300;
        } else {
            this.player.x = 600;
            this.player.y = 300;
            this.player2.x = 100;
            this.player2.y = 300;
            p1x=600;
            p1y=300;
        }


    }

    gameState.onUpdate = function (elapsed) {
        for(var i=0;i<this.winds.length;i++){
            var wi = this.winds[i];
            if(wi.to=='w'){
                wi.y-=this.player.speed * elapsed*6;
            }
            if(wi.to=='s'){
                wi.y+=this.player.speed * elapsed*6;
            }
            if(wi.to=='a'){
                wi.x-=this.player.speed * elapsed*6;
            }
            if(wi.to=='d'){
                wi.x+=this.player.speed * elapsed*6;
            }
        }


        if (game.input.keyboard.isPressed(Light.Keyboard.A) || game.input.keyboard.isPressed(Light.Keyboard.LEFT)) {
            this.player.x -= this.player.speed * elapsed*2;
        }
        if (game.input.keyboard.isPressed(Light.Keyboard.D) || game.input.keyboard.isPressed(Light.Keyboard.RIGHT)) {
            this.player.x += this.player.speed * elapsed*2;
        }
        if (game.input.keyboard.isPressed(Light.Keyboard.W) || game.input.keyboard.isPressed(Light.Keyboard.UP)) {
            this.player.y -= this.player.speed * elapsed*2;
        }
        if (game.input.keyboard.isPressed(Light.Keyboard.S) || game.input.keyboard.isPressed(Light.Keyboard.DOWN)) {
            this.player.y += this.player.speed * elapsed*2;
        }
        if (game.input.keyboard.isJustPressed(Light.Keyboard.SPACE)) {
            var toto;
            if (game.input.keyboard.isPressed(Light.Keyboard.A) || game.input.keyboard.isPressed(Light.Keyboard.LEFT)) {
                socket.emit('wind', {
                    num: mycount,
                    to: 'a'
                })
                toto='a';
            } else if (game.input.keyboard.isPressed(Light.Keyboard.D) || game.input.keyboard.isPressed(Light.Keyboard.RIGHT)) {
                socket.emit('wind', {
                    num: mycount,
                    to: 'd'
                })
                toto='d';
            } else if (game.input.keyboard.isPressed(Light.Keyboard.W) || game.input.keyboard.isPressed(Light.Keyboard.UP)) {
                socket.emit('wind', {
                    num: mycount,
                    to: 'w'
                })
                toto='w';
            } else if (game.input.keyboard.isPressed(Light.Keyboard.S) || game.input.keyboard.isPressed(Light.Keyboard.DOWN)) {
                socket.emit('wind', {
                    num: mycount,
                    to: 's'
                })
                toto='s';
            } else {
                socket.emit('wind', {
                    num: mycount,
                    to: 'd'
                })
                toto='d';
            }
            var b = new EWind(toto);
            if(toto=='w'){
                b.x=this.player.x;
                b.y=this.player.y-101;
            }
            if(toto=='a'){
                b.x=this.player.x-51;
                b.y=this.player.y;
                b.scale.y=-1;
            }
            if(toto=='s'){
                b.x=this.player.x;
                b.y=this.player.y+151;
            }
            if(toto=='d'){
                b.x=this.player.x+101;
                b.y=this.player.y;
            }
            this.winds.push(b);
            this.addChild(b);
        }
        if (mycount == 1) {
            socket.emit('player1pos', {
                x: this.player.x,
                y: this.player.y
            })
            this.player2.x=p2x;
            this.player2.y=p2y;
        }
        if (mycount == 2) {
            socket.emit('player2pos', {
                x: this.player.x,
                y: this.player.y
            })
            this.player2.x=p1x;
            this.player2.y=p1y;
        }
        if(makewind){
            var b = new EWind(windto);
            if(windto=='w'){
                b.x=this.player2.x;
                b.y=this.player2.y-101;
            }
            if(windto=='a'){
                b.x=this.player2.x-101;
                b.y=this.player2.y;
            }
            if(windto=='s'){
                b.x=this.player2.x;
                b.y=this.player2.y+51;
            }
            if(windto=='d'){
                b.x=this.player2.x+51;
                b.y=this.player2.y;
            }
            this.winds.push(b);
            this.addChild(b);
            makewind=false;
        }

    }

    game.states.add('intro', introState);
    game.states.add('loading', loadState);
    game.states.add('game', gameState);
    game.states.add('end', endState);
    game.states.change('intro');
}());