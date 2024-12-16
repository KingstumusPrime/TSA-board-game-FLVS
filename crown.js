let CROWN_DISABLE_INPUT = false;
class Actor {
    constructor(name, sprite, context){
        this.name = name;
        // sprite is a reference to any class with a render function
        this.sprite = sprite;
        this.pos = {x: 0, y: 0};
        this.sprSz = {x: 1, y: 1};
        // how many degrees of rotation
        this.rot = 0;
        this.scale = this.sprite.scale;
        this.ctx = context;
        this.culled = false;
 
        // update scale wih loaded sprite
        this.sprite.onload = () => {
            this.scale = this.sprite.scale;
            this.onSpriteLoaded();
        }
    }


    // for the user to fill out
    update(cam){
        if(actorsCollides(this, cam) || (cam.culling == false)){
            this.culled = false;
            this.ctx.save();
            this.ctx.setTransform(this.sprSz.x, 0, 0, this.sprSz.y, ((this.pos.x - cam.pos.x)+ this.scale.x/2) * (1 - this.sprSz.x), ((this.pos.y - cam.pos.y) + this.scale.y/2) * (1 - this.sprSz.y));
            this.sprite.render(this.ctx, VecSub(this.pos, cam.pos));
            this.ctx.restore();
        }else{
            this.culled = true;
        }
        
        this.onUpdate();
    };

    // scale it and its sprite
    scaleBy(num){
        this.sprite.scale.x =  this.sprite.scale.x * num;
        this.sprite.scale.y =  this.sprite.scale.y * num;
        this.scale.x = this.scale.x * num;
        this.scale.y = this.scale.y * num;
    }
    
    onUpdate(){};
    onSpriteLoaded(){};
    onCreate(func){func()};
}
class Camera {
    constructor(x, y, canvas){
        this.pos = {x: x, y: y};
        this.scale = {x: canvas.width,y: canvas.height}
        this.canvas = canvas; 
        this.shakeStrength = 0;
        this.dampening = 3;
        this.target = {x: 0, y: 0};
        this.excel = {x: 0, y: 0};
        this.drag = 0.3;
        this.culling = true;
    }

    update(){
        
        this.excel.x = (this.target.x - this.pos.x) * this.drag;
        this.excel.y = (this.target.y - this.pos.y) * this.drag;

        if(this.shakeStrength > 0){
            // get a random amount to add to exceleration
            const randX = Math.random() * 2 * this.shakeStrength - this.shakeStrength;
            const randY = Math.random() * 2 * this.shakeStrength - this.shakeStrength;
            this.excel.x += randX;
            this.excel.y += randY;
            this.shakeStrength -= this.dampening;
        }


       this.pos.x += this.excel.x;
       this.pos.y += this.excel.y;


    }

    shake(amount) {
        this.shakeStrength = amount;    
    }
}// game holds the whole world and updates everything
class Game {
    constructor(canvas, ctx, input){
        this.canvas = canvas;
        this.ctx = ctx;
        // a lookup of all of the objects internal use only
        this.objMap = {};
        // keeps hold of all groups
        this.groupMap = {};
        // all updatable object internal use only
        this.updaters = [];
        // stores all paused actors by name
        this.pauseList = {};
        // tween list
        this.tweenList = [];
        // background color
        this.backgroundColor = "white";
        // optimzed off screen canvas
        this.offScreenCanvas = document.createElement("canvas");
        this.offScreenCanvas.width = canvas.width;
        this.offScreenCanvas.height = canvas.height;
        this.offCtx = this.offScreenCanvas.getContext("2d");
        this.input = input;
        // camera a 0, 0
        this.camera = new Camera(0, 0, canvas);
    }

    addActor(name, sprite, params={}){
        const act = new Actor(name, sprite, this.ctx);
        if("bottom" in params && params["bottom"] == true){
            this.updaters.unshift(act);
        }else{
            this.updaters.push(act);
        }

        this.objMap[name] = act;
        if("group" in params){
            this.addToGroup(params["group"], act);
        }
        return act;
    }

    addStaticActor(name, sprite, pos, params={}){
        
        const act = new Actor(name, sprite, this.ctx);
        act.pos = pos;
        this.objMap[name] = act;

        if(sprite.img !== undefined && sprite.loaded == false){
            let prev = sprite.img.onload;
            sprite.img.onload = () => {
                prev();
                act.sprite.render(this.offCtx, act.pos, act.scale);
            }
        }else{
            act.sprite.render(this.offCtx, act.pos, act.scale);
        }

        if("group" in params){
            this.addToGroup(params["group"], act);
        }
        return act;
    }

    findActor(name){
        return this.objMap[name];
    }

    update(){
        // clear screen
        this.ctx.save();
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
        // update the input controller
        this.input.update();
        // update the camera
        this.camera.update();
        this.ctx.drawImage(this.offScreenCanvas, -this.camera.pos.x, -this.camera.pos.y);
        // render all the static objects
        this.tweenList.forEach((tween, i) => {
            tween.step();
            if(tween.finished == true){
                delete this.tweenList[i];
            }
        }) 

        this.updaters.forEach((updater => {
            if(updater.sprite.loaded != false){
                updater.update(this.camera);
            }
        }))
    }

    destroy(obj){
        this.updaters = this.updaters.filter((updater) => {
            return updater.name != obj.name;
        });
        delete this.objMap[obj.name];
    }
    
    pauseInput(){
        this.input.paused = true;
    }

    resumeInput(){
        this.input.paused = false;
    }


    destroyGroup(name){
        this.groupMap[name].forEach(item => {
            this.destroy(item)
        })
        this.groupMap[name] = [];
    }

    addToGroup(g, item){
        if(!(g in this.groupMap)){
            this.groupMap[g] = [];
        }
        this.groupMap[g].push(item);
    }

    getGroup(name){
        return this.groupMap[name] != undefined ? this.groupMap[name] : [];
    }
    
    addTween(start, end, func, algo, endfunc, speed){
        this.tweenList.push(new TWEEN(start, end, func, algo, endfunc, speed));
    }
}class BoxGeometry {
    constructor(scale, color="black"){
        this.loaded = true;
        this.opacity = 1;
        this.scale = {x: scale, y:scale};
        this.color = color;
    }

    render(ctx, pos){
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.fillRect(pos.x, pos.y, this.scale.x, this.scale.y);
        ctx.restore();
    }
}

class RectGeometry {
    constructor(x, y, color="black"){
        this.loaded = true;
        this.opacity = 1;
        this.scale = {x: x, y:y};
        this.rot = 0;
        this.color = color;
    }

    render(ctx, pos){
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.translate( pos.x , pos.y);
        ctx.rotate(this.rot*Math.PI/180);
        ctx.fillRect(0, 0, this.scale.x, this.scale.y);
        ctx.globalAlpha = 1;
        ctx.restore();
    }
}

class Line{
    constructor(length, width){
        this.length = length;
        this.width = width;
        this.loaded = true;
        this.opacity = 1;
        this.scale = {x: length, y:width};
        this.rot = 0;
        this.start  = {x: 0, y: 0};
        this.end  = {x: 0, y: 0};
        this.color = "black";
    }

    render(ctx, pos){
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        console.log(this.rot);
        const angle = this.rot*Math.PI/180;
        this.start = pos;
        this.end = {x: pos.x + this.length * Math.cos(angle), y: pos.y + this.length * Math.sin(angle)}
        ctx.lineTo(this.end.x, this.end.y);
        ctx.stroke();
        ctx.restore();
    }
}
class CircleGeometry {
    constructor(scale, color="black"){
        this.loaded = true;
        this.opacity = 1;
        this.scale = {x: scale, y:scale};
        this.color = color;
    }

    render(ctx, pos){
        
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.translate(pos.x + this.scale.x/2, pos.y + this.scale.y/2);
        ctx.arc(0, 0, this.scale.x/2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.restore();
    }
}


class Sprite {
    constructor(src, scale={x:0,y:0}){
        this.img = new Image();
        this.img.src = src;
        this.scale = scale;
        this.opacity = 1;
        this.loaded = false;
        this.img.addEventListener('load', () => {
            if(this.scale.x == 0 || this.scale.y == 0){
                this.scale.x = this.img.width;
                this.scale.y = this.img.height;
            }
            this.loaded = true;
            this.onload();
        });
    }

    render(ctx, pos){
        ctx.globalAlpha = this.opacity;
        ctx.drawImage(this.img, pos.x, pos.y, this.scale.x, this.scale.y);
        ctx.globalAlpha = 1;
    }

    // used to update actors when the image loads
    onload(){}
}

class TextSprite {
    constructor(text, font="bold 16px Arial"){

        this.text = text;
        console.log(this.text);
        this.color = "black";
        this.opacity = 1;
        this.font = font;
        this.scale = {x: 100, y: 100};
    }
    render(ctx, pos){
        ctx.globalAlpha = this.opacity;
        ctx.font = this.font;
    
        let sz = ctx.measureText(this.text);
        this.scale.y = sz.fontBoundingBoxAscent + sz.fontBoundingBoxDescent;  
        this.scale.x = sz.width; 
        ctx.fillText(this.text, pos.x, pos.y);
    }
}

class InputController {
    constructor(){
        this.keyRepeatListeners = {};
        this.keyListeners = {};
        this.keys = {};
        this.funcs = {};
        this.mouse = {x: 0, y: 0};
        this.mousePrev;
        this.prevKeys = null;
        this.paused = false;
        document.addEventListener("keydown", (e) => this.onkeyDown(e), false);
        document.addEventListener("keyup", (e) => this.onkeyUp(e), false);
        document.addEventListener("mousemove", (e) => {
            this.mouse = {x: e.clientX, y: e.clientY};
            this.onMouseMove();
        });

    }

    onMouseDown(func){
        document.body.onmousedown = func;
    };

    onMouseMove(){};

    onKeyPressed(key, func){
        if(key == "space"){
            key = " ";
        }
        const e = new CustomEvent(key);
        document.addEventListener(key,func)
        this.funcs[key] = func;
        this.keyListeners[key] = e;
    }

    clearKey(key){
        document.removeEventListener(key, this.funcs[key]);
        this.keyListeners[key] = null;
    }
    clearKeys(keys){
        keys.forEach((key)=>{
            this.clearKey(key);
        })

    }

    onKeyPressedRepeat(key, func){
        if(key == "space"){
            key = " ";
        }
        const e = new CustomEvent(key);
        document.addEventListener(key,func)
        this.keyRepeatListeners[key] = e;
    }

    onkeyUp(e){
        this.keys[e.key] = false;
    }

    onkeyDown(e){
        this.keys[e.key] = true;
        if(this.keys[e.key] && !this.prevKeys[e.key] && !this.paused && !CROWN_DISABLE_INPUT){
            if(this.keyListeners[e.key] != null){
                document.dispatchEvent(this.keyListeners[e.key]);
            }
        }
    }

    update(){
        if(this.paused){return;}
        this.prevKeys = {...this.keys};
        this.mousePrev = {...this.mouse};
        Object.keys(this.keyRepeatListeners).forEach(key => {
            // fire repeat events
            if(this.keyRepeatListeners[key] != null && this.keys[key] && !this.paused && !CROWN_DISABLE_INPUT){
                document.dispatchEvent(this.keyRepeatListeners[key]);
            }
        })
    }

}class Sound{
    constructor(src, loop=false, onFinished=undefined){

        this.sound = new Audio(src);
        this.sound.loop = loop;
        if(typeof onFinished === "function"){
            this.sound.addEventListener("ended", function (){
                onFinished();
            });
        }
    }

    play(){
        const playPromise = this.sound.play();
        if (playPromise !== undefined) {
            playPromise.then(function() {
              // Automatic playback started!
            }).catch(function(error) {
                console.log(error)
              // Automatic playback failed.
              // Show a UI element to let the user manually start playback.
            });
        }
    }

    pause(restart=false){
        this.sound.pause();
        if(restart){
            this.sound.currentTime = 0;
        }
    }

}

let CROWN_RANDOM_FUNC = Math.random;

function actorsCollides(act1, act2){
    return act1.pos.y + act1.scale.y > act2.pos.y && act1.pos.y < act2.pos.y + act2.scale.y
    && act1.pos.x + act1.scale.x > act2.pos.x && act1.pos.x < act2.pos.x + act2.scale.x;
}


function VecSub(v1, v2){
    return {x: v1.x - v2.x, y: v1.y - v2.y};
}

function randFromArr(arr){
    return arr[Math.floor(CROWN_RANDOM_FUNC()* arr.length)];
}

function randInRange(min, max){
    return Math.floor(CROWN_RANDOM_FUNC() * (max - min)) + min;
}

function randFloatInRange(min, max){
    return CROWN_RANDOM_FUNC() * (max - min) + min;
}

// creates a variable of name with a on update event
function addPointer(name, value, onChange){
    this[value + "@#$tbgxjktdhivyo drgtrhyuj"] = value;
    Object.defineProperty(this, name, {
        get: function () { return this[value + "@#$tbgxjktdhivyo drgtrhyuj"]; },
        set: function (v) {
            this[value + "test"] = v;
            this[value + "@#$tbgxjktdhivyo drgtrhyuj"] = v;
            onChange(v);
        }
    });
}

// cleans number like this 10 = 010 or 1000 = 00001000 ect...
function numWithLength(num, len){
    return "0".repeat(len - num.toString().length) + num;
}


function lerp(a, b, t){
    return a + (b-a)*t;
}


let TWEENS = [];

class TWEEN {
    constructor(start, end, func, algo, afterFunc=undefined, rate=0.01){
        this.t = 0;
        this.start = start;
        this.end = end;
        this.func = func;
        this.algo = algo;
        this.finished = false;
        this.afterFunc = afterFunc;
        this.rate = rate;
        TWEENS.push(this);

    }

    step(){
        if(!this.finished){
            if(this.t < 1){
                this.t += this.rate; 
                const fixedT = this.algo(this.t);
                // lerp the values
                const v = lerp(this.start, this.end, fixedT);
                // call the user defined function
                this.func(v, fixedT);
                // use a built in or user defined function to modify t
                // example ease in, elastic, constantRate, whatever else i add

                
            }else if(!this.finished){
                this.finished = true;
                TWEENS.splice(TWEENS.indexOf(this), 1)
                if(typeof this.afterFunc === "function"){
                    this.afterFunc();
                }
    
            }
        }

    }
}

function TWEEN_step_all(){
    TWEENS.forEach(element => {
        element.step();
    });
}
// tween function
// credit to simon dev for most of the math: https://www.youtube.com/watch?v=YJB1QnEmlTs
function constantSpeed(t){
    return t;
}

function squared(t){
    return t*t;
}

function easeInCubic(t){
    return t*t*t;
}

function squareRoot(t){
    return Math.sqrt(t);
}

function quadEaseOut(t){
    return 1 - (1 - t) * (1 - t);
}

function parabola(t){
    return Math.pow(4 * t * (1 - t), 4)
}

function triangle(t){
    return 1 -2 * Math.abs(t - 0.5);
}

function elasticOut(t){
    return Math.sin(-13 * (t + 1) * (Math.PI/2)) * Math.pow(2, -10 * t) + 1;
}

function bounceOut(t){
    const nl  = 7.5625;
    const dl = 2.75;
    if(t < 1/dl){
        return nl * t * t;
    }else if (t < 2/dl){
        t -= 1.5/dl;
        return nl * t * t + 0.75;
    } else if (t < 2.5/dl){
        t -= 2.25/dl;
        return nl * t * t + 0.9375;
    } else{
        t -= 2.625 / dl;
        return nl * t * t + 0.984375;
    }
}

function smoothstep(t){
    return lerp(squareRoot(t), squared(t), t);
}

function easeOutQuint(t){
    return 1 - Math.pow(1 - t, 5);
}

function easeInBounce(t){
    return 1 - bounceOut(1-t);
}

function elasticIn(t){
    return 1 - elasticOut(1-t);
}