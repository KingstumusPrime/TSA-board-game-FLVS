var carInit;
var carUpdate;
var carEnd;

(function() {
    let game; 
    let player;
    let startTime;
    let timeActor;
    let GRID_SIZE; // how far the player moves
    let TID = 0;

    let cars = [];
    function spawnCar(){
        let c = game.addActor("p", new RectGeometry(GRID_SIZE * 2, GRID_SIZE), {bottom: true});
        c.pos.y = canvas.height - (GRID_SIZE * (randInRange(0, 4) + 3));
        c.pos.x = canvas.width + c.scale.x;
        c.sprite.color = "red";
        c.speed = 5;
        c.dir = -1;
        cars.push(c);

        TID = setTimeout(spawnCar, randInRange(2000, 3000));
    }

    carInit = function (ctx){
        GRID_SIZE = canvas.height/8;
        game = new Game(canvas, ctx, new InputController());
        game.camera.culling = false;
        timeActor = game.addActor("z", new TextSprite("9.9", "bold 48px Arial"));
        //center the text
        timeActor.pos.x = canvas.width/2 - timeActor.scale.x/2; 
        timeActor.pos.y = canvas.height/4 - timeActor.scale.y/2;

        player = game.addActor("player", new BoxGeometry(GRID_SIZE, "purple"));
        player.pos.x = canvas.width/6;
        player.pos.y =  canvas.height - (GRID_SIZE * 4);

        startTime = new Date().getTime();

        game_running = true; // when set to false the game will end

        game.input.onKeyPressed("w", () =>{
            if(player.pos.y - (GRID_SIZE * 3) < 0){return;}
            player.pos.y -= GRID_SIZE;
        })

        game.input.onKeyPressed("s", () =>{
            if(player.pos.y + GRID_SIZE * 2 > canvas.height - (GRID_SIZE * 2)){return;}
            player.pos.y += GRID_SIZE;
        })

        let grass = new RectGeometry(canvas.width, GRID_SIZE * 2 + canvas.height * 0.00092);
        grass.color = "green";
        let road = new RectGeometry(canvas.width, GRID_SIZE * 2 + canvas.height * 0.00092);
        road.color = "black";

        game.addStaticActor("act", new RectGeometry(canvas.width, GRID_SIZE * 2, "green"),{x: 0, y: canvas.height - (GRID_SIZE * 2)} );


        game.addStaticActor("act", grass, {x: 0, y: (canvas.height - (GRID_SIZE * 4))} );
        let spr = road;
        for(let i = 2; i <= 6; i++){
            spr = road;
            game.addStaticActor("act", spr, {x: 0, y: (canvas.height - (GRID_SIZE * (2 * i)))} );
        }
        // game.addStaticActor("act", grass, {x: 0, y: 0} );
        game.addStaticActor("act", grass, {x: 0, y: 0} );


        spawnCar();
        spawnCar();
    }


    carUpdate = function (){
        if(game_running == false){return;}
        //let time = 12 - ((new Date().getTime() - startTime )/1000 );
        let time = 15  - ((new Date().getTime() - startTime )/1000 );
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
                    car.pos.x = canvas.width + car.scale.x * randFloatInRange(2, 4);
                }
 
            }

            if(actorsCollides(player, car)){
                carEnd();
            }
        });

        if(game_running){
            game.update();
        }

        if(time <= 0){
            carEnd();
        }

    }

    carEnd = function(){
        cars.forEach((car)=>{
            game.destroy(car);
            delete car;
        })
        cars = [];
        clearTimeout(TID);
        game.input.clearKeys(["w", "a", "s", "d"]);
        delete game.input;
        delete game;
        game_running = false;
    }


})()