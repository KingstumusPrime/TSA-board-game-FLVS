var shellGameInit;
var shellGameUpdate;
var shellGameEnd;

(function() {
    let game; 
    let cups;
    let cB;
    let ball;
    let select;

    function switchCups(a, b, endFunc){
        let s = cups[a].pos.x;
        let o = cups[b].pos.x;
        game.addTween(cups[a].pos.x, cups[b].pos.x, (v, t)=>{
            cups[a].pos.x = v;
            cups[b].pos.x = lerp(o, s, t);
        }, constantSpeed, ()=>{
            let p = cups[a];
            cups[a] = cups[b];
            cups[b] = p; 
            if(endFunc){
                endFunc();
            }

        }, 0.015); // 0.3 (hard even for me) (0.1) (simple)
    }

    function switchRand(endFunc){
        let a = randInRange(0, 3);
        let b = a;
        while(b == a){
            b = randInRange(0, 3);
        }
        switchCups(a, b, endFunc);
    }


    function done(sel){
        ball.scale.x = cups[0].scale.x * 0.8;
        ball.scale.y = cups[0].scale.x * 0.8;
        ball.pos.x = cB.pos.x + cB.scale.x/2 - ball.scale.x/2;

        game.addTween(cups[0].pos.y, canvas.height * 0.05, (v, t)=>{
            cups.forEach(cup => {
                cup.pos.y = v;
            });
        }, constantSpeed,  ()=>{
            cups.forEach((cup, i) => {

                if(cup.name == "cupB"){
                    console.log(sel, i);
                    if(sel == i){
                        console.log("YAY!");
                        shellGameEnd();
                    }else{
                        console.log("BOO!");
                        shellGameEnd();
                    }
                }
            });
        });
    }

    function selectUpdate(){
        select.pos.x = cups[select.cup].pos.x + cups[select.cup].scale.x/2 - select.scale.x/2; 
    }

    function run(n){
        if(n == 0){
            select = game.addActor("s", new BoxGeometry(cups[0].scale.x * 0.5, "yellow"));
            select.cup = 0;
            selectUpdate();
            select.pos.y = cups[0].pos.y - select.scale.y * 2;

            game.input.onKeyPressed("a", ()=>{
                select.cup--;
                if(select.cup < 0){
                    select.cup = 2;
                }
                selectUpdate();
            })

            game.input.onKeyPressed("d", ()=>{
                select.cup++;
                if(select.cup > 2){
                    select.cup = 0;
                }
                selectUpdate();
            })

            game.input.onKeyPressed("space", ()=>{
                game.input.clearKeys(["space", "a", "d"]);
                done(select.cup);
                game.destroy(select);
            })
            return;
        }
        switchRand(()=>{run(n - 1)});
    }

    shellGameInit = function (ctx){
        game = new Game(canvas, ctx, new InputController());
        let cup = new RectGeometry(150, 200, "red");
        let cA = game.addActor("cupA", cup);
        cB = game.addActor("cupB", cup);
        let cC = game.addActor("cupC", cup);
        cups = [cA, cB, cC];

        for(let i = 0; i < 3; i++){
            cups[i].pos.x = (canvas.width/3)/3 + ((canvas.width/3) * i);
            cups[i].pos.y = canvas.height * 0.05;
        }

        ball = game.addActor("ball", new CircleGeometry(cA.scale.x * 0.8, "blue"), {bottom: true});
        ball.pos.x = cB.pos.x + cB.scale.x/2 - ball.scale.x/2;
        ball.pos.y = cA.pos.y + cA.scale.y + ball.scale.y;  

        game.addTween(cA.pos.y, ball.pos.y - (cA.scale.y - ball.scale.y ), (v, t)=>{
            cups.forEach(cup => {
                cup.pos.y = v;
            });
        }, constantSpeed,()=>{
            // hide the ball
            ball.scale.x = 0;
            ball.scale.y = 0;
            going = true;
            run(10);
        });

    }




    shellGameUpdate = function (){

        game.update();
    }

    shellGameEnd = function(){
        cups.forEach((cup)=>{
            game.destroy(cup);
        })
        cups = [];
        delete game.input;
        delete game;

        game_running = false;
    }


})()