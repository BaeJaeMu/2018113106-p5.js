let canvasW=800,canvasH=600;
let sky=1,nr=80,ng=215,nb=235,c;

let floorY,groundY,unit;
let startLX,startRX,lx,rx,ly,ry;
let lvy=0,rvy=0;

let playerW,playerH,headR;
let moveSpeed,jumpSpeed,playerG;

let goalInset,goalW,goalTop,goalThick;
let leftGoal,rightGoal,minX,maxX;

let startX,startY,startVX,startVY;
let bx,by,br,vx,vy,g,kickX,kickY;
let stopSpeed,stopBounce;
let bounce=.88,friction=.98;

let ls=0,rs=0,winScore=5;
let goalPause=false,goalTime=0,waitTime=2000;

let sx=[.05,.107,.164,.229,.3,.364,.65,.714,.879,.943];
let sy=[.1,.164,.082,.142,.191,.113,.105,.167,.136,.091];
let xx=[.029,.121,.214,.314,.459,.6,.7,.8,.9];
let ww=[.079,.083,.079,.083,.083,.083,.079,.083,.071];
let hh=[.218,.273,.236,.264,.373,.255,.227,.282,.209];
let buildingScale=1.2,specialBuilding=4;

let moonX,moonY,moonSize,moonInner;
let coverX,coverY,coverSize;
let cloudX,cloudW,cloudH,cloudY;

let titleY,titleSize,scoreY,scoreSize;
let leftScoreX,rightScoreX;
let messageY,goalSize,winSize;

let windowTop,windowBottom,windowSide,windowGap;
let courtTop,centerTop,circleY,circleW,circleH;
let thinLine,normalLine,starLine;

let bg=[
  [67,68,145],
  [78,55,143],
  [43,38,100]
];

let colors=[
  [80,215,235],
  [180,120,230],
  [235,120,190]
];

let teams=[
  [80,220,255],
  [255,130,170]
];

let moonOuterColor=[205,110,185];
let moonInnerColor=[222,142,202];
let buildingColor=[27,29,68];
let specialColor=[38,35,88];
let buildingBorder=[20,21,50];
let groundColor=[15,17,31];
let courtColor=[22,24,42];

let starColor=238,textColor=245,ballBorder=245;

let titleText="NIGHT CITY - NEON SOCCER";
let goalText="GOAL!";
let leftWinText="LEFT WIN!  R: RESTART";
let rightWinText="RIGHT WIN!  R: RESTART";
let scoreDivider=":";

let resetKey="r",resetKeyUpper="R";
let jumpKey="w",jumpKeyUpper="W";

function setup(){
  createCanvas(canvasW,canvasH);

  unit=min(width,height);
  floorY=height*.62;
  groundY=height*.92;

  startLX=width*.225;
  startRX=width*.775;

  playerW=width*.025;
  playerH=height*.12;
  headR=unit*.025;

  moveSpeed=width*.01;
  jumpSpeed=-height*.015;
  playerG=height*.0005;

  goalInset=width*.056;
  goalW=width*.075;
  goalTop=groundY-height*.22;
  goalThick=unit*.016;

  leftGoal=goalInset+goalW;
  rightGoal=width-goalInset-goalW;
  minX=leftGoal+max(headR,playerW/2);
  maxX=rightGoal-max(headR,playerW/2);

  startX=width/2;
  startY=height*.717;
  startVX=width*.005625;
  startVY=-height*.00333;

  br=unit*.019;
  g=height*.000333;
  kickX=width*.006875;
  kickY=-height*.006667;
  stopSpeed=width*.0001;
  stopBounce=g*2;

  moonX=width*.807;
  moonY=height*.204;
  moonSize=unit*.28;
  moonInner=unit*.25;

  coverX=moonX+moonSize*.22;
  coverY=moonY-moonSize*.028;
  coverSize=moonSize*.7;

  cloudX=[width*.136,width*.193];
  cloudW=[width*.079,width*.1];
  cloudH=[height*.045,height*.062];
  cloudY=height*.236;

  titleY=height*.055;
  titleSize=unit*.04;
  scoreY=height*.14;
  scoreSize=unit*.067;
  leftScoreX=width*.45;
  rightScoreX=width*.55;

  messageY=height*.5;
  goalSize=unit*.1;
  winSize=unit*.05;

  windowTop=height*.029;
  windowBottom=height*.018;
  windowSide=width*.013;
  windowGap=height*.04;

  courtTop=floorY+height*.058;
  centerTop=floorY+height*.075;
  circleY=(goalTop+groundY)/2;
  circleW=width*.125;
  circleH=height*.117;

  thinLine=unit*.00167;
  normalLine=thinLine*2;
  starLine=thinLine*3;

  c=color(nr,ng,nb);
  resetRound();
}

function draw(){
  updateGame();

  city();
  ground();
  goal(leftGoal,-1);
  goal(rightGoal,1);
  player(lx,ly,0);
  player(rx,ry,1);
  ball();
  score();
}

function city(){
  let b=skyColor();
  background(b[0],b[1],b[2]);

  noStroke();
  fill(moonOuterColor[0],moonOuterColor[1],moonOuterColor[2]);
  ellipse(moonX,moonY,moonSize);

  fill(moonInnerColor[0],moonInnerColor[1],moonInnerColor[2]);
  ellipse(moonX,moonY,moonInner);

  if(sky==bg.length){
    fill(b[0],b[1],b[2]);
    ellipse(coverX,coverY,coverSize);
  }

  stroke(starColor);
  strokeWeight(starLine);

  for(let i=0;i<sx.length;i++){
    point(sx[i]*width,sy[i]*height);
  }

  noFill();
  strokeWeight(normalLine);

  for(let i=0;i<cloudX.length;i++){
    arc(cloudX[i],cloudY,cloudW[i],cloudH[i],PI,TWO_PI);
  }

  for(let i=0;i<xx.length;i++){
    building(i);
  }

  noStroke();
  fill(textColor);
  textAlign(CENTER);
  textSize(titleSize);
  text(titleText,width/2,titleY);
}

function skyColor(){
  return bg[sky-1];
}

function building(i){
  let x=xx[i]*width;
  let w=ww[i]*width;
  let h=hh[i]*height*buildingScale;
  let y=floorY-h;
  let b=buildingColor;

  if(i==specialBuilding){
    b=specialColor;
  }

  fill(b[0],b[1],b[2]);
  stroke(buildingBorder[0],buildingBorder[1],buildingBorder[2]);
  strokeWeight(normalLine);
  rect(x,y,w,h);

  neon(thinLine);

  for(let y2=y+windowTop;y2<floorY-windowBottom;y2+=windowGap){
    line(x+windowSide,y2,x+w-windowSide,y2);
  }
}

function ground(){
  noStroke();
  fill(groundColor[0],groundColor[1],groundColor[2]);
  rect(0,floorY,width,height-floorY);

  fill(courtColor[0],courtColor[1],courtColor[2]);
  neon(normalLine);

  beginShape();
  vertex(leftGoal,courtTop);
  vertex(rightGoal,courtTop);
  vertex(width-goalInset,groundY);
  vertex(goalInset,groundY);
  endShape(CLOSE);

  line(width/2,centerTop,width/2,groundY);
  ellipse(width/2,circleY,circleW,circleH);
  line(0,groundY,width,groundY);
}

function neon(w){
  stroke(c);
  strokeWeight(w);
}

function goal(x,d){
  let backX=x+goalW*d;

  noStroke();
  fill(c);

  rect(
    min(x,backX)-goalThick/2,
    goalTop-goalThick/2,
    goalW+goalThick,
    goalThick
  );

  rect(
    backX-goalThick/2,
    goalTop-goalThick/2,
    goalThick,
    groundY-goalTop+goalThick/2
  );
}

function player(x,y,i){
  let team=teams[i];

  fill(team[0],team[1],team[2]);
  neon(normalLine);
  rect(x-playerW/2,y-playerH,playerW,playerH);
  ellipse(x,y-playerH-headR,headR*2);
}

function ball(){
  fill(c);
  stroke(ballBorder);
  strokeWeight(normalLine);
  ellipse(bx,by,br*2);
}

function control(){
  if(mouseIsPressed && mouseY>floorY && mouseY<height){
    let target=constrain(mouseX,minX,maxX);
    lx+=constrain(target-lx,-moveSpeed,moveSpeed);
  }

  if(keyIsDown(LEFT_ARROW)){
    rx-=moveSpeed;
  }

  if(keyIsDown(RIGHT_ARROW)){
    rx+=moveSpeed;
  }

  rx=constrain(rx,minX,maxX);
}

function moveBall(){
  vy+=g;
  bx+=vx;
  by+=vy;

  if(hitPlayer(lx,ly)){
    bouncePlayer(lx,ly);
  }

  if(hitPlayer(rx,ry)){
    bouncePlayer(rx,ry);
  }

  hitGoal(leftGoal,-1);
  hitGoal(rightGoal,1);

  if(by+br>=groundY){
    by=groundY-br;
    vy=-abs(vy)*bounce;

    if(abs(vy)<stopBounce){
      vy=0;
    }

    vx*=friction;

    if(abs(vx)<stopSpeed){
      vx=0;
    }
  }

  if(by<br){
    by=br;
    vy=abs(vy)*bounce;
  }

  if(bx<br){
    bx=br;
    vx=abs(vx)*bounce;
  }

  if(bx>width-br){
    bx=width-br;
    vx=-abs(vx)*bounce;
  }
}

function hitPlayer(x,y){
  let headY=y-playerH-headR;
  let headHit=dist(bx,by,x,headY)<br+headR;

  let bodyHit=bx+br>x-playerW/2 &&
              bx-br<x+playerW/2 &&
              by+br>y-playerH &&
              by-br<y;

  return headHit || bodyHit;
}

function bouncePlayer(x,y){
  let top=y-playerH-headR*2;
  let halfW=max(headR,playerW/2);

  if(by<top && vy>0){
    by=top-br;
  }else if(by>y){
    by=y+br;
    vy=abs(kickY);
    return;
  }else if(bx<x){
    bx=x-halfW-br;
    vx=-kickX;
  }else{
    bx=x+halfW+br;
    vx=kickX;
  }

  vy=kickY;
}

function hitGoal(x,d){
  let backX=x+goalW*d;

  hitRect(
    min(x,backX)-goalThick/2,
    goalTop-goalThick/2,
    goalW+goalThick,
    goalThick
  );

  hitRect(
    backX-goalThick/2,
    goalTop-goalThick/2,
    goalThick,
    groundY-goalTop+goalThick/2
  );
}

function hitRect(x,y,w,h){
  let dx=bx-(x+w/2);
  let dy=by-(y+h/2);
  let overlapX=w/2+br-abs(dx);
  let overlapY=h/2+br-abs(dy);

  if(overlapX<=0 || overlapY<=0){
    return;
  }

  if(overlapX<overlapY){
    if(dx<0){
      bx=x-br;
      vx=-abs(vx)*bounce;
    }else{
      bx=x+w+br;
      vx=abs(vx)*bounce;
    }
  }else{
    if(dy<0){
      by=y-br;
      vy=-abs(vy)*bounce;
    }else{
      by=y+h+br;
      vy=abs(vy)*bounce;
    }
  }
}

function mousePressed(){
  if(mouseY>=0 && mouseY<floorY &&
     mouseX>=0 && mouseX<width){
    sky=sky%bg.length+1;

    nr=colors[sky-1][0];
    ng=colors[sky-1][1];
    nb=colors[sky-1][2];

    c=color(nr,ng,nb);
  }
}

function updateGame(){
  if(goalPause){
    if(millis()-goalTime>=waitTime){
      resetRound();
      goalPause=false;
    }
  }else if(ls<winScore && rs<winScore){
    control();
    jumpPlayers();
    moveBall();
    checkGoal();
  }
}

function jumpPlayers(){
  if(keyIsDown(UP_ARROW) && ry>=groundY){
    rvy=jumpSpeed;
  }

  lvy+=playerG;
  rvy+=playerG;
  ly+=lvy;
  ry+=rvy;

  if(ly>=groundY){
    ly=groundY;
    lvy=0;
  }

  if(ry>=groundY){
    ry=groundY;
    rvy=0;
  }
}

function checkGoal(){
  if(by-br>goalTop+goalThick/2){
    if(bx+br<leftGoal && bx-br>goalInset){
      rs++;
      pauseGoal();
    }else if(bx-br>rightGoal && bx+br<width-goalInset){
      ls++;
      pauseGoal();
    }
  }
}

function pauseGoal(){
  goalPause=true;
  goalTime=millis();
}

function score(){
  noStroke();
  textAlign(CENTER);
  textSize(scoreSize);

  fill(teams[0][0],teams[0][1],teams[0][2]);
  text(ls,leftScoreX,scoreY);

  fill(textColor);
  text(scoreDivider,width/2,scoreY);

  fill(teams[1][0],teams[1][1],teams[1][2]);
  text(rs,rightScoreX,scoreY);

  fill(textColor);

  if(goalPause){
    textSize(goalSize);
    text(goalText,width/2,messageY);
  }else if(ls>=winScore || rs>=winScore){
    textSize(winSize);

    if(ls>=winScore){
      text(leftWinText,width/2,messageY);
    }else{
      text(rightWinText,width/2,messageY);
    }
  }
}

function resetRound(){
  bx=startX;
  by=startY;
  vx=startVX;
  vy=startVY;

  lx=startLX;
  rx=startRX;
  ly=groundY;
  ry=groundY;
  lvy=0;
  rvy=0;
}

function keyPressed(){
  switch(key){
    case resetKey:
    case resetKeyUpper:
      ls=0;
      rs=0;
      goalPause=false;
      resetRound();
      break;

    case jumpKey:
    case jumpKeyUpper:
      if(!goalPause &&
         ls<winScore && rs<winScore && ly>=groundY){
        lvy=jumpSpeed;
      }
      break;
  }

  if(keyCode==LEFT_ARROW ||
     keyCode==RIGHT_ARROW ||
     keyCode==UP_ARROW){
    return false;
  }
}
