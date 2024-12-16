// helpers graphical and mathematical
const wipe = document.createElement("div"); // the whipe that these function control

function blackWipe(speed, endfunc){
    let x = 1;
    document.querySelector("#wrapper").appendChild(wipe);

    wipe.style.background = "black";
    wipe.style.color = "white";
    wipe.style.position = "absolute";
    wipe.style.height = canvas.height + "px";
    game.addTween(1, canvas.width, (v, t) => {
        wipe.style.width = v + "px";
        
    }, constantSpeed, endfunc, speed)
    
}


function unWipe(speed, endfunc){
    game.addTween(parseInt(wipe.style.width, 10), 0, (v, t) => {
        wipe.style.width = v + "px";
        console.log(v);
    }, constantSpeed, () => {
        destroyWipe();
        endfunc();
    }, speed)
    
}

function destroyWipe(){
    document.querySelector("#wrapper").removeChild(wipe);
}