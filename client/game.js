(function () {
    let socket = io.connect('http://localhost:9999');
    var mycount = 0;
    var servercount = 0;
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
        servercount=data.nowPlayerCount;
        socket.emit('userOutCheck', {
            nownum:mycount
        })
    });
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
    var player2character = 1; //서버에서 받아온 캐릭터
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
        switch (player2character) {
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

    EWind = function () {
        Unit.call(this, game.asset.getImage('ewind'), 25);
        this.body.friction.x = 0.95;
        this.sprite.scaleCenter.x = this.width / 2;
        this.hp = 300;
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
                alert(mycharacter);
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
        // if(mycount<3){
        //     game.states.change('game');
        // }
    }

    gameState.onInit = function () {
        this.addChild(new Light.Sprite(game.asset.getImage('gameboard')));
        game.input.keyboard.keyCapturing = [Light.Keyboard.A, Light.Keyboard.D, Light.Keyboard.W,
            Light.Keyboard.CONTROL, Light.Keyboard.ALTERNATE, Light.Keyboard.ESCAPE,
            Light.Keyboard.RIGHT, Light.Keyboard.LEFT, Light.Keyboard.ENTER, Light.Keyboard.UP,
            Light.Keyboard.DOWN, Light.Keyboard.S
        ];
        this.spawnDelay = 2.0;

        this.unitLayer = new Light.EntityContainer();
        this.addChild(this.unitLayer);

        this.player = new Player();
        this.player.x = 400;
        this.player.y = 300;
        this.unitLayer.addChild(this.player);
        this.player2 = new Player2();
        this.player2.x = 400;
        this.player2.y = 300;
        this.unitLayer.addChild(this.player2);


    }

    gameState.onUpdate = function (elapsed) {
        if (game.input.keyboard.isPressed(Light.Keyboard.A) || game.input.keyboard.isPressed(Light.Keyboard.LEFT)) {
            this.player.x -= this.player.speed * elapsed;
        }
        if (game.input.keyboard.isPressed(Light.Keyboard.D) || game.input.keyboard.isPressed(Light.Keyboard.RIGHT)) {
            this.player.x += this.player.speed * elapsed;
        }
        if (game.input.keyboard.isPressed(Light.Keyboard.W) || game.input.keyboard.isPressed(Light.Keyboard.UP)) {
            this.player.y -= this.player.speed * elapsed;
        }
        if (game.input.keyboard.isPressed(Light.Keyboard.S) || game.input.keyboard.isPressed(Light.Keyboard.DOWN)) {
            this.player.y += this.player.speed * elapsed;
        }


    }

    game.states.add('intro', introState);
    game.states.add('loading', loadState);
    game.states.add('game', gameState);
    game.states.add('end', endState);
    game.states.change('intro');
}());