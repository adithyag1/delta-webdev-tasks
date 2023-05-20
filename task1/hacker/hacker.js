const leaderboard_div=document.querySelector(".leaderboard_div");
const score_element = document.querySelector(".score");
const highscore_element = document.querySelector(".high-score");
const wrapper=document.querySelector(".wrapper");
const board = document.querySelector(".play-board");
const controls = document.querySelectorAll(".controls i");
const time_element=document.querySelector(".time");
const word_div=document.querySelector(".word");
const words=["DELTA","SNAKE","HACKER","HTML","SCORE","TASK","GITHUB","WEB","DEV","TRICHY","STYLE","SCRIPT","CODE","NOKIA","COBRA","KINGCOBRA","GRID","GAME","LIVES","PYTHON","VSCODE","TIMER"];
const start_button=document.getElementById("start");
const pause_button=document.getElementById("pause");
const view_button=document.getElementById("view-leaderboard");
const lives_element=document.querySelector(".lives");
const sizeform=document.getElementById("sizeform");

let gameover = false;
let lives=3;
let headx = 5, heady = 5;
let xdirection=0, ydirection=0;
let first_run=true;
let snake = [[3,5],[4,5],[5,5]];
let game_interval, time_interval;
let score = 0;
let foods_positions=[];
let word="";
let eaten=0;
let time=151;
let html,html1,html_spawn=``;
let msg;
let speed_time=200;
let board_size;
let spawnx, spawny;
let playing=false;
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

sizeform.addEventListener("submit",function(event){
    event.preventDefault();
    board_size=document.getElementById("grid-size").value;
    board.style.gridTemplate=`repeat(${board_size}, 1fr) / repeat(${board_size}, 1fr)`;
}
)


//add this data to the table
let htm=`<table class="leaderboard" border><tr><th>Rank</th><th>Score</th></tr>`;
for(let i=0;rank(intscores[i])<=10;i++){
    htm+=`<tr><td>${rank(intscores[i])}</td><td>${intscores[i]}</td></tr>`;
}
htm+=`</table>`;
leaderboard_div.innerHTML=htm;

//.includes() doesnt work for checking array in 2darrays
function contains(arr2d,arr){
    for(let i=0;i<arr2d.length;i++){
        if(arr2d[i][0]==arr[0]&&arr2d[i][1]==arr[1]) return true;
    }
    return false;
}

//timer
const clock = () => {
    time--;
    display(time);
    if(time==-1){
        msg="Time over!";
        gameover=true;
        clearInterval(time_interval);
        return fngameover();
    }
}

function display(time){
    let mins=Math.floor(time/60);
    let secs=Math.floor(time%60);
    time_element.innerHTML=`${mins<10?"0":""}${mins}:${secs<10?"0":""}${secs}`;
}
let spawn_times=[];
while(spawn_times.length<=8){ //appear 8 random times
    let random_time=Math.floor(Math.random()*120)+1; //can appear at 1 to 120 seconds
    if(!spawn_times.includes(random_time)){
        spawn_times.push(random_time);
    }
}

//setting up random food positions
const newfoods = () => {
    eaten=0;
    let index=Math.floor(Math.random()*words.length);
    word=words[index];
    word_div.innerHTML=`${word}`;
    foods_positions=[];
    while(foods_positions.length<word.length){
        let foodX = Math.floor(Math.random() * board_size) + 1;
        let foodY = Math.floor(Math.random() * board_size) + 1;
        if(!(contains(foods_positions,[foodX,foodY])||contains(snake,[foodX,foodY])||(Math.abs(headx-foodX)<=3&&Math.abs(heady-foodY)<=3)||!playing&&foodY===5)){
            foods_positions.push([foodX,foodY]);
        }
    }
    recolour();
}

function updatelives() {
    lives--;
    lives_element.innerText = `${lives}`;
    headx = 5; heady = 5;
    xdirection = 0; ydirection = 0;
    snake = [[3,5],[4,5],[5,5]];
    first_run = true;
    if (lives>0) {
        clearInterval(time_interval);
        if (confirm(msg + "\nLives: " + lives + "\nPress Play to continue")) {
            playing = false;
            play_game();
        }
        else {
            gameover = true;
            fngameover();
        }
    }
    else{
        gameover = true;
        msg = "You lost 3 lives!"
        return fngameover();        
    }
}

const fngameover = () => {
    // clearing the timer and reloading the page
    if (!leaderboard) {
        leaderboard = '';
    }
    scores.push(score.toString());
    leaderboard = scores.join(',');
    localStorage.setItem('leaderboard', leaderboard);
    alert("Game Over\n"+msg+"\nYour score: "+score+"\nPress OK to start new game");
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

const atespawn = () => {
    let lucky= Math.floor(Math.random()*2);
    if(lucky==0&&snake.length<=5) lucky=1;
    switch(lucky){
        case 0://make the snake shorter my removing tail
            snake.shift();
            snake.shift();
            break;
        case 1:
            speed_time+=20; //this reduces the speed by increasing interval
            break;
    }
    spawnx = -1;
    spawny = -1;
    //if spawn x,y positions are kept unchanged then even after eating it if it crosses that coordinate the if will get power up
    html_spawn=``;
}

const recolour = () => {
    html1=``;
    for(let i=eaten;i<word.length;i++){
        html1+= `<div class="food" style="grid-area: ${foods_positions[i][1]}/${foods_positions[i][0]}; font-size: calc(65vmin/${board_size});">${word[i]}</div>`;
    }
}

// calling change_direction on each key click and passing key dataset value as an object
controls.forEach(button => button.addEventListener("click", () => change_direction({ key: button.dataset.key })));

const start_game = () => {
    //initially it will start going towards right
    if(first_run) xdirection=1;
    first_run=false;
    if(gameover) return fngameover();

    html=``;

    for(let i=0;i<word.length;i++){
        if(headx === foods_positions[i][0] && heady === foods_positions[i][1]) {
            if(i===eaten){
                eaten++;
                recolour();
                //increase length of the snake by adding a coordinate.
                
                if(eaten===word.length){//the sequence of colours is fully eaten
                    //remove the previous tail end as all the coordinates move in xdirection and ydirection 
                    snake.push([foods_positions[i][0],foods_positions[i][1]]);
                    newfoods();
                    time+=6; //give time bonus for completing sequence
                    score++; 
                    highScore = score >= highScore ? score : highScore;
                    localStorage.setItem("high-score", highScore);
                    score_element.innerText = `${score}`;
                    highscore_element.innerText = `${highScore}`;
                    sound();
                }
            }
            else if(i>eaten){
                msg="You ate the wrong letter!";
                return updatelives();
            }
        }
    }

    if(headx==spawnx&&heady==spawny){
        atespawn();
    }

    if(spawn_times.includes(time)){
        spawnx = Math.floor(Math.random() * board_size) + 1;
        spawny = Math.floor(Math.random() * board_size) + 1;
        html_spawn = `<div style="grid-area: ${spawny}/${spawnx}; background-color: aqua; color: blue; font-size: calc(65vmin/${board_size}">+</div>`
    }

    pause_button.onclick = function () {
        playing = false;
        clearInterval(time_interval);
        play_game();
    }

    snake.shift();//remove the previous tail end as all the coordinates move in xdirection and ydirection
    //to maintain constant length since new head position is pushed at one end end tail is shifted from other ends

    headx += xdirection;
    heady += ydirection;
    snake.push([headx,heady]);

    //positioning the snake head and body
    //the last element is head remaining all body

    //out if it hits a wall
    if(headx <= 0 || headx > board_size || heady <= 0 || heady > board_size) {
        msg="You hit a wall!";
        return updatelives();
    }
    
    html += `<div class="head" style="grid-area: ${snake[snake.length-1][1]} / ${snake[snake.length-1][0]}"></div>`;
    for (let i = 0; i<snake.length-1; i++) {
        html += `<div class="body" style="grid-area: ${snake[i][1]} / ${snake[i][0]}"></div>`;
        //head should not hit the body
        if(snake[i][0]===headx&&snake[i][1]===heady){
            msg="Your snake hit itself!";
            return updatelives();
        }
    }

    board.innerHTML = html+html1+html_spawn;
    speed_time*=0.999;//makes the delay smaller each time so snake moves faster
    if(playing){
        setTimeout(start_game,speed_time);
    }
}

function sound(){
    const audio_context=new(window.AudioContext||window.webkitAudioContext)();
    const oscillator = audio_context.createOscillator();
    oscillator.connect(audio_context.destination);
    oscillator.type="sine";
    oscillator.start();
    oscillator.stop(audio_context.currentTime+0.1);//stops in 1 second
}

const play_game = () => {
    start_button.onclick = function () {
        if(board_size>=15&&board_size<=50){
            if(first_run){
                newfoods();
                document.addEventListener("keyup", change_direction);
            }
            if(!playing){
                //game_interval = setInterval(start_game, 200);
                time_interval=setInterval(clock, 1000);
                playing=true;
                start_game();
                //while playing if user presses play nothing will happen.
            }
        }
        else{
            alert("Enter grid size");
        }
    }
}

if(lives===3) play_game();

view_button.onclick = function() {
    if(leaderboard_div.style.display==="none"){
        leaderboard_div.style.display="block";
        wrapper.style.display="none";
        sizeform.style.display="none";
    }
    else{
        leaderboard_div.style.display="none";
        wrapper.style.display="flex";
        sizeform.style.display="flex";
    }
}
