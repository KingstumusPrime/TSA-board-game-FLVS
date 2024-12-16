// Has basic game logic for the board
// FUNCTIONS
// board_init((players): called when the players have been selected
// spin(pNum): spins/rolls
// goto(pNum, space) : sends a player to that space
// move(pNum) : moves the player X spaces
// gameSelect : starts a minigame and calls minigame start, update, end
// endTurn() : transitions and puts next player

// each spaces:
// X : X position of the space
// Y : Y position of the space
// func : a function called when landing on this space


let spaceNum = 0;
let playerNum = 0; // current player number between 3 & 4
let pCount = 4;

function bridge_shortcut(pNum, endFunc){
    sleep(300).then(()=>{
    goto(pNum, 9, ()=>{
        sleep(100).then(()=>{
            endFunc();
        });
    });
    playersArr.space = 9;
    });
}

function log_shortcut(pNum, endFunc){
    sleep(300).then(()=>{
    goto(pNum, 32, endFunc);
    playersArr.space = 9;
    });
}

function jumpBack(pNum, endFunc){
    sleep(300).then(()=>{moveBy(pNum, -1, endFunc);});
}

function jumpBack2(pNum, endFunc){
    sleep(300).then(()=>{moveBy(pNum, -2, endFunc);});
}

function jumpExtra(pNum, endFunc){
    sleep(300).then(()=>{moveBy(pNum, 1, endFunc);});

}


function jumpExtra2(pNum, endFunc){
    sleep(300).then(()=>{moveBy(pNum, 2, endFunc);});

}



let spaces = [
    {
        "x": 288,
        "y": 638.5,
        "func": null
    },
    {
        "x": 293,
        "y": 543.5,
        "func": null
    },
    {
        "x": 273,
        "y": 458.5,
        "func": bridge_shortcut
    },
    {
        "x": 233,
        "y": 368.5,
        "func": null
    },
    {
        "x": 228,
        "y": 283.5,
        "func": null
    },
    {
        "x": 273,
        "y": 208.5,
        "func": null
    },
    {
        "x": 383,
        "y": 173.5,
        "func": null
    },
    {
        "x": 488,
        "y": 203.5,
        "func": null
    },
    {
        "x": 513,
        "y": 298.5,
        "func": null
    },
    {
        "x": 488,
        "y": 393.5,
        "func": null
    },
    {
        "x": 468,
        "y": 473.5,
        "func": jumpBack
    },
    {
        "x": 468,
        "y": 573.5,
        "func": null
    },
    {
        "x": 523,
        "y": 653.5,
        "func": null
    },
    {
        "x": 628,
        "y": 663.5,
        "func": jumpExtra
    },
    {
        "x": 653,
        "y": 563.5,
        "func": null
    },
    {
        "x": 648,
        "y": 483.5,
        "func": null
    },
    {
        "x": 633,
        "y": 408.5,
        "func": null
    },
    {
        "x": 633,
        "y": 333.5,
        "func": null
    },
    {
        "x": 658,
        "y": 253.5,
        "func": null
    },
    {
        "x": 728,
        "y": 203.5,
        "func": null
    },
    {
        "x": 808,
        "y": 178.5,
        "func": null
    },
    {
        "x": 908,
        "y": 178.5,
        "func": null
    },
    {
        "x": 998,
        "y": 208.5,
        "func": null
    },
    {
        "x": 1033,
        "y": 283.5,
        "func": jumpBack2
    },
    {
        "x": 1033,
        "y": 373.5,
        "func": null
    },
    {
        "x": 1003,
        "y": 453.5,
        "func": log_shortcut
    },
    {
        "x": 978,
        "y": 548.5,
        "func": null
    },
    {
        "x": 958,
        "y": 643.5,
        "func": null
    },
    {
        "x": 1013,
        "y": 748.5,
        "func": jumpExtra2
    },
    {
        "x": 1148,
        "y": 678.5,
        "func": null
    },
    {
        "x": 1163,
        "y": 588.5,
        "func": null
    },
    {
        "x": 1163,
        "y": 513.5,
        "func": null
    },
    {
        "x": 1153,
        "y": 438.5,
        "func": null
    },
    {
        "x": 1138,
        "y": 358.5,
        "func": null
    },
    {
        "x": 1168,
        "y": 268.5,
        "func": null
    },
    {
        "x": 1228,
        "y": 223.5,
        "func": null
    },
    {
        "x": 1323,
        "y": 213.5,
        "func": null
    },
    {
        "x": 1388,
        "y": 273.5,
        "func": null
    },
    {
        "x": 1398,
        "y": 348.5,
        "func": null
    },
    {
        "x": 1393,
        "y": 423.5,
        "func": jumpBack
    },
    {
        "x": 1378,
        "y": 513.5,
        "func": null
    },
    {
        "x": 1363,
        "y": 593.5,
        "func": null
    },
    {
        "x": 1333,
        "y": 733.5,
        "func": null
    }
];


function gameSelect(){

    if(mainRequestID != undefined){
        game.pauseInput();
        console.log(i.paused)

        pause();
        minigames[randFromArr(Object.keys(minigames))].start(ctx);
    }

    minigames[randFromArr(Object.keys(minigames))].update();
    if(game_running){
        window.requestAnimationFrame(gameSelect);
    }else{
        unpause();
        game.resumeInput();
        startTurn();
        //game.input.paused = false;
    }
}

let mask = document.querySelector("#mask");
let disableSpace = 0;

function goto(pNum, space, endFunc=null){

    let xDone = false;
    let yDone = false;

    game.addTween(playersArr[pNum].pos.x, spaces[space].x, (v, t) => {
        playersArr[pNum].pos.x = v;
    }, squareRoot, () =>{
        xDone = true;
        if(yDone && endFunc){
            endFunc();
        }
    }, 0.085);



    game.addTween(playersArr[pNum].pos.y, spaces[space].y, (v, t) => {
        playersArr[pNum].pos.y = v;
    }, squareRoot, () => {
        yDone = true;
        if(xDone && endFunc){
            endFunc();
        }
    }, 0.085);

    playersArr[pNum].space = space;
}

function moveBy(pNum, x, endFunc=null){
    if(x == 0){
        if(endFunc){
        
            endFunc();
        }
        return;
    }
    if(x > 0){
        goto(pNum, playersArr[pNum].space + 1, ()=>{

            moveBy(pNum, x - 1, endFunc)
        }); 
    }
    else{
        goto(pNum, playersArr[pNum].space - 1, ()=>{

            moveBy(pNum, x + 1, endFunc)
        }); 
    }
    
    // game.camera.target.x = spaces[playersArr[pNum].space].x - canvas.width/2;
    // game.camera.target.y = spaces[playersArr[pNum].space].y - canvas.height/2;

}

function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

function startTurn(){

    // clear the space bar
    disableSpace = 1;
    playerNum++;
    if(playerNum%pCount == 0){
        playerNum = 0;
    }


    let mask = game.addActor("mask", new RectGeometry(canvas.width + 200,canvas.height + 200));

    mask.sprite.opacity = 0.5;
    let dummy = game.addActor("dummy", playersArr[playerNum].sprite);
    mask.pos.x = game.camera.target.x - 100;
    mask.pos.y = game.camera.target.y - 100;

    help_text.innerHTML = "Next Turn";
    dummy.pos.x = game.camera.target.x + canvas.width/2 - dummy.sprite.scale.x/2;
    dummy.pos.y = game.camera.target.y + canvas.height/2 - dummy.sprite.scale.y/2;

    help_text.style.left =  (player.pos.x + player.scale.x/2 - help_text.clientWidth/2)+'px';
    help_text.style.top = help_text.clientHeight + 'px';

    next_text.innerHTML = "Press Enter...";
    next_text.style.left =  (player.pos.x + player.scale.x/2 - next_text.clientWidth/2)+'px';

    player_num.innerHTML = "P" + (playerNum + 1);
    cp = playerNum;
    client.broadcastAll(`cp${cp}`);
    switch(playerNum){
        case 0:
            player_num.style.color = red;
            break;
        case 1:
            player_num.style.color = blue;
            break;
        case 2:
            player_num.style.color = green;
            break;
        case 3:
            player_num.style.color = orange;
            break;
    }


    i.onKeyPressed("Enter", () => {
        game.destroy(mask);
        game.destroy(dummy);
        help_text.innerHTML = "";
        next_text.innerHTML = "";
        player_num.innerHTML = "";
        disableSpace = 0;
    })

}

function move(){
    if(game.input.paused || disableSpace != 0){return;}
    disableSpace = 1;
    //spaces.push({x: test.pos.x, y: test.pos.y, func: null});
    game.camera.target.x = playersArr[playerNum].pos.x - canvas.width/2;
    game.camera.target.y = playersArr[playerNum].pos.y - canvas.height/2;

    let space = playersArr[playerNum].space;
    let r = randInRange(1,6);
    // allow camera to reach player
    sleep(750).then(() => {
        goto(playerNum, playersArr[playerNum].space, ()=>{
            game.camera.drag = 0.07;
            game.camera.target.x = spaces[space + r].x - canvas.width/2;
            game.camera.target.y = spaces[space + r].y - canvas.height/2;

            moveBy(playerNum, r, ()=>{
                game.camera.target.x = playersArr[playerNum].pos.x - canvas.width/2;
                game.camera.target.y = playersArr[playerNum].pos.y - canvas.height/2;

                if(spaces[playersArr[playerNum].space].func != null){

                    spaces[playersArr[playerNum].space].func(playerNum, ()=>{
                        sleep(1000).then(()=>{
                            gameSelect();
                        })
                    });

                }else{
                    sleep(1000).then(()=>{
                        gameSelect();
                    })

                }

        
            });
        });

    })
}

function board_init(){
    // tester
    //let test = game.addActor("test", new CircleGeometry(10, "red"));
    test = playersArr[0];
    test.pos.x = canvas.width/2;
    test.pos.y = canvas.height/2;
    //hide menu
    document.querySelector("#menu").style.display = "none";
    let s = new Sprite("./assets/board.png");
    s.onload = () =>{
        console.log(s.scale);
        s.scale.x = s.scale.x * 2;
        s.scale.y = s.scale.y * 2;
        console.log(s.scale);
        // bottom = true : display it below all previous actors;
        game.addActor("board", s, {"bottom": true}); // cant use static actors because it will be culled


        // loop over and set each players space
        playersArr.forEach((p, i) => {
            p.space = 0;
            goto(i, p.space);
        })

        game.camera.target.x = playersArr[0].pos.x - canvas.width/2;
        game.camera.target.y = playersArr[1].pos.y - canvas.height/2;

        startTurn();

        unWipe(0.1, () => {}); 
    }



    game.input.onKeyPressedRepeat("s", () => {
        game.camera.target.y += 5;
        //test.pos.y += 5;
    })

    game.input.onKeyPressedRepeat("w", () => {
        game.camera.target.y -= 5;
        //test.pos.y -= 5;
    })

    game.input.onKeyPressedRepeat("d", () => {
        game.camera.target.x += 5;
        //test.pos.x += 5;
    })

    game.input.onKeyPressedRepeat("a", () => {
        game.camera.target.x -= 5;
        //test.pos.x -= 5;
    })


    i.onKeyPressed("space", move);
}

