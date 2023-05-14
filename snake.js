const leaderboard_div=document.querySelector(".leaderboard_div");
const score_element = document.querySelector(".score");
const highscore_element = document.querySelector(".high-score");
const wrapper=document.querySelector(".wrapper");
const board = document.querySelector(".play-board");
const controls = document.querySelectorAll(".controls i");
const time_element=document.querySelector(".time");
const food1 = document.querySelector(".food1");
const food2 = document.querySelector(".food2");
const food3 = document.querySelector(".food3");
const food4 = document.querySelector(".food4");
const food_elements=[food1,food2,food3,food4];
const colours = ["red","orange","yellow","green","blue","indigo","violet","lightseagreen","aqua"];
const start_button=document.getElementById("start");
const view_button=document.getElementById("view-leaderboard");

let gameover = false;
let headx = 5, heady = 5;
let bodyx1=4, bodyy1=5;
let bodyx2=3, bodyy2=5;
let xdirection=0, ydirection=0;
let first_run=1;
let snake = [];
let game_interval;
let score = 0;
let foods_positions=[];
let foods_colours=[];
let eaten=0;
let time=151;
let html1;
let msg;
let leaderboard = localStorage.getItem('leaderboard')||"";
if(leaderboard[0]===",") leaderboard.shift();
if(leaderboard[leaderboard.length-1]===",") leaderboard.pop();
let scores = leaderboard.split(',');
let highScore = localStorage.getItem("high-score") || 0;

highscore_element.innerText = `${highScore}`;
let intscores=scores.map(intscores => parseInt(intscores));
intscores.sort((a,b) => b-a);


function rank(ele){
    ind=intscores.indexOf(ele);
    if(ind!==-1){
        if(intscores[ind-1]===ele){
            return rank(intscores[ind-1]);//for repeated scores gives same rank
        }
        return ind+1;//rank starts from 1 so rank=ind+1;
    }
}

//add this data to the table
let htm=`<table class="leaderboard" border><tr><th>Rank</th><th>Score</th></tr>`;
for(let i=0;rank(intscores[i])<=10;i++){
    htm+=`<tr><td>${rank(intscores[i])}</td><td>${intscores[i]}</td></tr>`;
}
htm+=`</table>`;
leaderboard_div.innerHTML=htm;

//timer
const countdown = () => {
    time--;
    display(time);
    if(time==-1){
        msg="Time over!";
        gameover=true;
        clearInterval(countdown);
        return fngameover();
    }
}

function display(time){
    let mins=Math.floor(time/60);
    let secs=Math.floor(time%60);
    time_element.innerHTML=`${mins<10?"0":""}${mins}:${secs<10?"0":""}${secs}`;
}

//setting up random food positions
const newfoods = () => {
    eaten=0;
    foods_colours=[];
    while(foods_colours.length<4){
        let random_colour=colours[Math.floor(Math.random()*colours.length)];
        if(!foods_colours.includes(random_colour)){
            foods_colours.push(random_colour);
        }
    }


    foods_positions=[];
    while(foods_positions.length<4){
        let foodX = Math.floor(Math.random() * 20) + 1;
        let foodY = Math.floor(Math.random() * 20) + 1;
        //position should not be repeated or on the snake or immediate next to the head while starting
        if(!((foods_positions.includes([foodX,foodY]))||snake.includes([foodX,foodY])||(first_run&&foodY===5))){
            foods_positions.push([foodX,foodY]);
        }
    }
    recolour();
}

const fngameover = () => {
    // clearing the timer and reloading the page
    clearInterval(game_interval);
    if (!leaderboard) {
        leaderboard = '';
    }
    scores.push(score.toString());
    leaderboard = scores.join(',');
    localStorage.setItem('leaderboard', leaderboard);
    alert(msg+"\nYour score: "+score+"\nPress OK to replay");
    location.reload();
    
}

const change_direction = e => {
    // changing direction
    if(!first_run){
        if(e.key === "ArrowUp" && ydirection != 1) {
            xdirection = 0;
            ydirection = -1;
        } else if(e.key === "ArrowDown" && ydirection != -1) {
            xdirection = 0;
            ydirection = 1;
        } else if(e.key === "ArrowLeft" && xdirection != 1) {
            xdirection = -1;
            ydirection = 0;
        } else if(e.key === "ArrowRight" && xdirection != -1) {
            xdirection = 1;
            ydirection = 0;
        }
    }
}

const recolour = () => {
    html1=``;
    for(let i=eaten;i<4;i++){
        html1+= `<div class="food" style="grid-area: ${foods_positions[i][1]} / ${foods_positions[i][0]}; background-color: ${foods_colours[i]};"></div>`;
    }
}

// calling change_direction on each key click and passing key dataset value as an object
controls.forEach(button => button.addEventListener("click", () => change_direction({ key: button.dataset.key })));

const start_game = () => {
    //initially it will start going towards right
    if(first_run) xdirection=1;
    first_run=0;

    if(gameover) return fngameover();

    let html=``;
    for(let i=0;i<4;i++){
       food_elements[i].style.color = foods_colours[i]; //colours the "eat in this order" sentence
    }
    bodyx2=bodyx1;
    bodyy2=bodyy1;
    bodyx1=headx;
    bodyy1=heady;
    headx += xdirection;
    heady += ydirection;

    snake[0] = [bodyx2, bodyy2]; 
    snake[1] = [bodyx1, bodyy1];
    snake[2] = [headx, heady];

    for(let i=0;i<4;i++){
        if(headx === foods_positions[i][0] && heady === foods_positions[i][1]) {
            if(i===eaten){
                eaten++;
                recolour();
                if(eaten===4){//the sequence of colours is fully eaten
                    
                    newfoods();
                    time+=6; //give time bonus for completing sequence
                    score++; 
                    highScore = score >= highScore ? score : highScore;
                    localStorage.setItem("high-score", highScore);
                    score_element.innerText = `${score}`;
                    highscore_element.innerText = `${highScore}`;
                }
            }
            else if(i>eaten){
                msg="You tried to eat the wrong colour!";
                gameover=true;
                return fngameover();
            }
        }
    }

    //positioning the snake head and body
    html += `<div class="head" style="grid-area: ${snake[2][1]} / ${snake[2][0]}"></div>`;
    for (let i = 0; i<2; i++) {
        html += `<div class="body" style="grid-area: ${snake[i][1]} / ${snake[i][0]}"></div>`;
    }

    //out if it hits a wall
    if(headx <= 0 || headx > 20 || heady <= 0 || heady > 20) {
        msg="You hit a wall!";
        return gameover = true;
    }

    board.innerHTML = html+html1;
}


start_button.onclick = function () {
        start_button.onclick = null; //pressing start after it is started will not affect the game.
        newfoods();
        setInterval(countdown, 1000);
        document.addEventListener("keyup", change_direction);
        game_interval = setInterval(start_game, 200);
    
}

view_button.onclick = function() {
    if(leaderboard_div.style.display==="none"){
        leaderboard_div.style.display="block";
        wrapper.style.display="none";
    }
    else{
        leaderboard_div.style.display="none";
        wrapper.style.display="flex";
    }
}
