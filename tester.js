const player_num = document.querySelector("#player_num");
const player_quote = document.querySelector("#piece_quote");
const help_text = document.querySelector("#help_text");
const next_text = document.querySelector("#next_text");


player_num.innerHTML = "";
player_quote.innerHTML = "";
next_text.innerHTML = "";
help_text.innerHTML = "";

// get canvas
const canvas = document.querySelector("#game");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");
let r = 0;
let game_running = true;

let client;
let broadcasting = false;
let PIDS = [];
let cp = 0; // current player 0-3

// net_controller.onKeyPressed("a", ()=>{
//     if(client && broadcasting == false){
//         console.log("HERE!\n");
//         client.broadcastAll("a");
//     }
// })


function run(){
    if(r == 0){
        shellGameInit(ctx);
        r = 1;
    }

    shellGameUpdate();
    if(game_running){
        window.requestAnimationFrame(run);
    }else{
        window.requestAnimationFrame(run);
        game_running = true;
        r = 0;
    }
}

async function initClient(client) {
    await client.init();
    Object.keys(client.conns).forEach((pid)=>{
        PIDS.push(pid);
    })

    PIDS.push(client.pid);
    client.handleData = (d)=>{
        broadcasting = true;
        document.dispatchEvent(new KeyboardEvent('keydown', {'key': d, 'code': 'server'}));
        document.dispatchEvent(new KeyboardEvent('keyup', {'key': d, 'code': 'server'}));
        broadcasting = false;
    }

    client.onConnect = (c)=>{
        PIDS.push(c.peer);
    }

    document.addEventListener('keydown', (e) => {
        if(broadcasting){return}
        if(client.pid != PIDS[cp]){return;}
        client.broadcastAll(e.key); 
    });
    
    
    
    document.onkeydown = function(e) {
        if(e.code == 'server'){
            CROWN_DISABLE_INPUT = false;
        }else if(PIDS[cp] != client.pid){
            CROWN_DISABLE_INPUT = true;
            return;
        }
    };
}

client = new Client();
initClient(client);
run();
