var froggerInit;
var froggerUpdate;
var froggerEnd;

(function() {
    let game; 
    let player;
    let startTime;
    let timeActor;
    let GRID_SIZE; // how far the player moves
    let maps = [
        ["g", "r", "r", "r", "r", "r"],
    ];
    let carPatterns = [
        {num: 2, speed: 4, dir: 1},
        {num: 3, speed: 4, dir: 1},
        {num: 4, speed: 3, dir: 1},
        {num: 2, speed: 5, dir: -1},
        {num: 5, speed: 2, dir: 1},
        {num: 3, speed: 3, dir: 1},
        {num: 3, speed: 3, dir: -1},
        {num: 1, speed: 8.5, dir: 1},
    ];
    let cars = [];
    function spawnCars(){
        for(let row = 0; row < 8; row++){
            for(let i = 0; i < carPatterns[row].num;i++){
                let c = game.addActor("p", new RectGeometry(GRID_SIZE * 2, GRID_SIZE), {bottom: true});
                c.pos.y = canvas.height - (GRID_SIZE * (5 + row));
                c.pos.x = canvas.width/(carPatterns[row].num)/2 + (canvas.width/(carPatterns[row].num )) * i;
                c.sprite.color = "red";
                c.speed = (carPatterns[row].speed/1366) * canvas.width;
                c.dir = carPatterns[row].dir;
                cars.push(c);
            }
        }

    }

    froggerInit = function (ctx){
        GRID_SIZE = canvas.height/16;
        game = new Game(canvas, ctx, new InputController());
        game.camera.culling = false;
        timeActor = game.addActor("z", new TextSprite("9.9", "bold 48px Arial"));
        //center the text
        timeActor.pos.x = canvas.width/2 - timeActor.scale.x/2; 
        timeActor.pos.y = canvas.height/4 - timeActor.scale.y/2;

        player = game.addActor("player", new BoxGeometry(GRID_SIZE, "purple"));
        player.pos.x = canvas.width/2;
        player.pos.y =  canvas.height - (GRID_SIZE * 2);

        startTime = new Date().getTime();

        game_running = true; // when set to false the game will end

        game.input.onKeyPressed("w", () =>{
            if(player.pos.y - GRID_SIZE < 0){return;}
            player.pos.y -= GRID_SIZE;
        })

        game.input.onKeyPressed("s", () =>{
            if(player.pos.y + GRID_SIZE * 2 > canvas.height){return;}
            player.pos.y += GRID_SIZE;
        })

        game.input.onKeyPressed("a", () =>{
            if(player.pos.x - GRID_SIZE < 0){return;}
            player.pos.x -= GRID_SIZE;
            
        })

        game.input.onKeyPressed("d", () =>{
            if(player.pos.x + GRID_SIZE * 2 >   canvas.width){return;}
            player.pos.x += GRID_SIZE;
        })

        let grass = new RectGeometry(canvas.width, GRID_SIZE * 2 + canvas.height * 0.00092);
        grass.color = "green";
        let road = new RectGeometry(canvas.width, GRID_SIZE * 2 + canvas.height * 0.00092);
        road.color = "black";

        game.addStaticActor("act", new RectGeometry(canvas.width, GRID_SIZE * 2, "green"),{x: 0, y: canvas.height - (GRID_SIZE * 2)} );


        game.addStaticActor("act", grass, {x: 0, y: (canvas.height - (GRID_SIZE * 4))} );
        let spr = road;
        for(let i = 2; i <= 6; i++){
            if(maps[0][i - 2] == "g"){
                spr = grass;
            }else{
                spr = road;
            }
            game.addStaticActor("act", spr, {x: 0, y: (canvas.height - (GRID_SIZE * (2 * i)))} );
        }
        game.addStaticActor("act", grass, {x: 0, y: 0} );
        game.addStaticActor("act", grass, {x: 0, y: GRID_SIZE * 2} );


        spawnCars();

    }


    froggerUpdate = function (){
        if(game_running == false){return;}
        let time = 12 - ((new Date().getTime() - startTime )/1000 );
        timeActor.sprite.text = `${time < 10 ? '0' : ''}${time.toFixed(1)}`;
        cars.forEach(car => {
            if(car.dir == 1){
                car.pos.x += car.speed;
                if(car.pos.x > canvas.width * 1.1){
                    car.pos.x = GRID_SIZE * -1;
                }
            }else{
                car.pos.x -= car.speed;
                if(car.pos.x < 0 - (canvas.width * 0.1)){
                    car.pos.x = canvas.width + GRID_SIZE * 2;
                }
            }

            if(actorsCollides(player, car)){
                froggerEndClient();
            }
        });
        if(player.pos.y <= GRID_SIZE * 2){
            froggerEndClient();
        }
        if(game_running){
            game.update();
        }

        if(time <= 0){
            froggerEndClient();
        }

    }

    function froggerEndClient(){
        if(PIDS[cp] != client.pid){return;}else{
            client.broadcastAll("frogger");
            froggerEnd();
        }
    }

    froggerEnd = function(){

        cars.forEach((car)=>{
            game.destroy(car);
            delete car;
        })
        cars = [];
        game.input.clearKeys(["w", "a", "s", "d"]);
        delete game.input;
        delete game;
        game_running = false;
    }


})()