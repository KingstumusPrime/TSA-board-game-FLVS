var testGameInit;
var testGameUpdate;
var testGameEnd;

(function() {
    let game; 
    let player;
    let pipes = [];
    let startTime;
    let timeActor;
    let TID = 0;


    function spawnPipe(){
        let rate = randFloatInRange(0.09, 0.5); // the size of the first pipe

        let gap = randFloatInRange(0.6, 0.7); // gap between the pipe (used for the bottom pipe)

        let p = game.addActor("p", new RectGeometry(60, canvas.height * rate), {bottom: true});
        p.sprite.color = "red";
        p.pos.x = canvas.width;
        pipes.push(p);

        p = game.addActor("p", new RectGeometry(60, canvas.height * (gap - rate)), {bottom: true});
        p.sprite.color = "red";
        p.pos.x = canvas.width;
        p.pos.y = canvas.height - p.sprite.scale.y;
        pipes.push(p);
        TID = setTimeout(spawnPipe, randInRange(2000, 3000));

    }

    testGameInit = function (ctx){
        game = new Game(canvas, ctx, new InputController());
        timeActor = game.addActor("z", new TextSprite("9.9", "bold 48px Arial"));

        //center the text
        timeActor.pos.x = canvas.width/2 - timeActor.scale.x/2; 
        timeActor.pos.y = canvas.height/4 - timeActor.scale.y/2;

        player = game.addActor("player", new BoxGeometry(35, "purple"));
        player.vel = {x: 0, y: 0};
        player.pos.x = canvas.width * 0.3;
        game.input.onKeyPressed("space", () =>{
            player.vel.y = -10;
        })

        startTime = new Date().getTime();
        spawnPipe();

        game_running = true; // when set to false the game will end
        console.log("GAME BEGIN!");
    }


    testGameUpdate = function (){

        if(player.vel.y < 5){
            player.vel.y += 0.5;
        }
        if((player.pos.y + player.vel.y >= 0) 
            && (player.pos.y + player.vel.y <= canvas.height - player.scale.y)  ){
            player.pos.y += player.vel.y;
        }else{
            player.vel.y = 0;
        }

        
        pipes.forEach(pipe => {
            pipe.pos.x -= 2;
            if(actorsCollides(player, pipe)){
                console.log("HIT!");
                testGameEnd();

            }
        });
        
        let time = 20 - ((new Date().getTime() - startTime )/1000 );
        timeActor.sprite.text = `${time < 10 ? '0' : ''}${time.toFixed(1)}`;
        if(game_running && game){
            game.update();
        }

        if(time <= 0){
            testGameEnd();
        }

    }

    testGameEnd = function(){
        pipes.forEach((pipe)=>{
            game.destroy(pipe);
            delete pipe;
        })
        clearTimeout(TID);
        pipes = [];
        delete game.input;
        delete game;

        game_running = false;
    }


})()