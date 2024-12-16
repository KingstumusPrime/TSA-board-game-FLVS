function start(){
    createPlayer();
    score = 0;
}

function update(){
    updatePlayer();
    updateEnemies();
    if(score == 1000){
        end();
    }
}

function end(){
    destroyPlayer();
    return false // if you lose
    return true // you won
}