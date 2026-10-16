 // 주제명: NIGHT CITY - ENERGY RELAY
 // 주제설명: 떨어지는 에너지 공을 받아 중계기에 전달하고, 장애물을 피해 출구에 도달하는 3단계 게임
 // 학번: 2018113106
 // 이름: 배재무
let canvasW=800,canvasH=600;
let sky=0,c,unit,floorY,groundY;
let stage=1,lastStage=3,state=-1;
let px,py,pw,ph,headR,speedX=0,speedY=0;
let accel,maxSpeed,friction=.86,gravity,jumpPower;
let angle,angleStep=.035,armLength;
let bx,by,br,bvx,bvy,shotSpeed,ballMode;
let targetX,targetY,targetSize,tx,ty,rate,opened=false;
let obstacleX=[],obstacleSize,obstacleSpeed,obstacleCount;
let exitX,exitW,exitH;
let ballImg,targetImg,obstacleImg;
let catchSound,burstSound,clapSound;
let stageName=["FIRST DELIVERY","MOVING RELAY","NIGHT CROSSING"];
let bg=[[67,68,145],[78,55,143],[43,38,100]];
let colors=[[80,215,235],[180,120,230],[235,120,190]];
let sx=[.05,.107,.164,.229,.3,.364,.65,.714,.879,.943];
let sy=[.1,.164,.082,.142,.191,.113,.105,.167,.136,.091];
let xx=[.029,.121,.214,.314,.459,.6,.7,.8,.9];
let ww=[.079,.083,.079,.083,.083,.083,.079,.083,.071];
let hh=[.218,.273,.236,.264,.373,.255,.227,.282,.209];

let moonX,moonY,moonSize,moonInner,coverX;
let coverY,coverSize,cloudX1,cloudX2,cloudY;
let cloudW1,cloudW2,cloudH1,cloudH2,windowTop;
let windowBottom,windowGap,windowSide,courtLeftTop,courtRightTop;
let courtLeftBottom,courtRightBottom,courtOffsetY,startX,startTargetX;
let startTargetY,ballMinX,ballMaxX,ballStartY,ballStartSpeed;
let relayMinX,relayRangeX,relayMinY,relayRangeY,randomTargetMinX;
let randomTargetMaxX,randomTargetMinY,randomTargetMaxY,obstacleMinGap,obstacleMaxGap;
let obstacleStartX,obstacleGap,obstacleBaseSpeed,obstacleSpeedStep,baseTargetSize;
let targetSizeStep,centerX,centerY,titleY,stageY;
let missionY,controlsY,messageY,guideY,themeLimitY;
let panelX,panelY,panelW,panelH,nameSize;
let stageTextSize,controlsSize,messageSize,guideSize,starLine;
let normalLine,windowLine,courtLine,armLine,relayLine;
let armOffset,doorInnerW,doorInnerH,ballGravity,startAngle;
let rateStep=.0065;

async function setup(){
  createCanvas(canvasW,canvasH);
  ballImg=await loadImage("circle1.png");
  targetImg=await loadImage("square.png");
  obstacleImg=await loadImage("bomb.png");
  catchSound=await loadSound("catch.mp3");
  burstSound=await loadSound("burst.mp3");
  clapSound=await loadSound("claps.mp3");
  imageMode(CENTER);
  unit=width;
  if(height<unit) unit=height;
  floorY=height*.62;
  groundY=height*.88;
  pw=width*.028;
  ph=height*.09;
  headR=unit*.018;
  accel=width*.0007;
  maxSpeed=width*.006;
  gravity=height*.00055;
  jumpPower=-height*.014;
  armLength=unit*.05;
  br=unit*.018;
  shotSpeed=unit*.019;
  obstacleSize=unit*.055;
  exitX=width*.92;
  exitW=width*.055;
  exitH=height*.16;
  moonX=width*.807;
  moonY=height*.23;
  moonSize=unit*.25;
  moonInner=unit*.22;
  coverX=width*.85;
  coverY=height*.22;
  coverSize=unit*.19;
  cloudX1=width*.136;
  cloudX2=width*.193;
  cloudY=height*.25;
  cloudW1=width*.079;
  cloudW2=width*.1;
  cloudH1=height*.045;
  cloudH2=height*.062;
  windowTop=height*.025;
  windowBottom=height*.015;
  windowGap=height*.04;
  windowSide=width*.012;
  courtLeftTop=width*.16;
  courtRightTop=width*.84;
  courtLeftBottom=width*.03;
  courtRightBottom=width*.97;
  courtOffsetY=height*.05;
  startX=width*.2;
  startTargetX=width*.73;
  startTargetY=height*.61;
  ballMinX=width*.14;
  ballMaxX=width*.3;
  ballStartY=height*.2;
  ballStartSpeed=height*.001;
  relayMinX=width*.512;
  relayRangeX=width*.156;
  relayMinY=height*.44;
  relayRangeY=height*.12;
  
  randomTargetMinX=width*.6;
  randomTargetMaxX=width*.8;
  randomTargetMinY=height*.5;
  randomTargetMaxY=height*.67;
  obstacleMinGap=width*.15;
  obstacleMaxGap=width*.4;
  obstacleStartX=width*1.05;
  obstacleGap=width*.6;
  obstacleBaseSpeed=width*.001;
  obstacleSpeedStep=width*.0007;
  baseTargetSize=unit*.12;
  targetSizeStep=unit*.02;
  centerX=width/2;
  centerY=height/2;
  titleY=height*.045;
  stageY=height*.095;
  missionY=height*.145;
  controlsY=height*.95;
  messageY=height*.44;
  guideY=height*.56;
  themeLimitY=height*.17;
  panelX=width*.08;
  panelY=height*.32;
  panelW=width*.84;
  panelH=height*.36;
  nameSize=unit*.035;
  stageTextSize=unit*.026;
  controlsSize=unit*.023;
  messageSize=unit*.05;
  guideSize=unit*.025;
  starLine=unit*.004;
  normalLine=unit*.002;
  windowLine=unit*.0015;
  courtLine=unit*.003;
  armLine=unit*.009;
  relayLine=unit*.005;
  armOffset=ph*.65;
  doorInnerW=exitW*.6;
  doorInnerH=exitH*.9;
  ballGravity=gravity*.18;
  startAngle=-PI/5;
  c=color(colors[sky][0],colors[sky][1],colors[sky][2]);
  resetStage();
}

function playEffect(sound){
  if(sound){
    sound.play();
  }
}

function draw(){
  if(state==0){
    control();
    moveTarget();
    moveObstacles();
    if(state==0) moveBall();
    if(state==0 && opened && px>exitX-exitW/2 && py>=groundY){
      if(stage<lastStage) state=1;
      else state=3;
      playEffect(clapSound);
    }
  }
  city();
  ground();
  displayObjects();
  player(px,py);
  displayText();
}

function city(){
  let b=skyColor();
  background(b[0],b[1],b[2]);
  noStroke();
  fill(205,110,185);
  ellipse(moonX,moonY,moonSize);
  fill(222,142,202);
  ellipse(moonX,moonY,moonInner);
  if(sky==2){
    fill(b[0],b[1],b[2]);
    ellipse(coverX,coverY,coverSize);
  }
  stroke(238);
  strokeWeight(starLine);
  for(let i=0;i<sx.length;i++) point(sx[i]*width,sy[i]*height);
  noFill();
  strokeWeight(normalLine);
  arc(cloudX1,cloudY,cloudW1,cloudH1,PI,PI*2);
  arc(cloudX2,cloudY,cloudW2,cloudH2,PI,PI*2);
  for(let i=0;i<xx.length;i++) building(i);
}

function skyColor(){
  return bg[sky];
}

function building(i){
  let x=xx[i]*width,w=ww[i]*width;
  let h=hh[i]*height,y=floorY-h;
  if(i==4) fill(38,35,88);
  else fill(27,29,68);
  stroke(20,21,50);
  strokeWeight(normalLine);
  rect(x,y,w,h);
  neon(windowLine);
  for(let y2=y+windowTop;y2<floorY-windowBottom;y2+=windowGap){
    line(x+windowSide,y2,x+w-windowSide,y2);
  }
}

function ground(){
  noStroke();
  fill(15,17,31);
  rect(0,floorY,width,height-floorY);
  fill(22,24,42);
  neon(courtLine);
  beginShape();
  vertex(courtLeftTop,floorY+courtOffsetY);
  vertex(courtRightTop,floorY+courtOffsetY);
  vertex(courtRightBottom,groundY);
  vertex(courtLeftBottom,groundY);
  endShape(CLOSE);
  line(0,groundY,width,groundY);
  noStroke();
  fill(45,48,70);
  if(opened) fill(c);
  rect(exitX-exitW/2,groundY-exitH,exitW,exitH);
  fill(15,17,31);
  rect(exitX-doorInnerW/2,groundY-doorInnerH,doorInnerW,doorInnerH);
}

function neon(w){
  stroke(c);
  strokeWeight(w);
}

function player(x,y){
  fill(31,35,66);
  neon(courtLine);
  rect(x-pw/2,y-ph,pw,ph);
  fill(c);
  ellipse(x,y-ph-headR,headR*2);
  push();
  translate(x,y-armOffset);
  rotate(angle);
  neon(armLine);
  line(0,0,armLength,0);
  pop();
  if(ballMode==1){
    if(ballImg) image(ballImg,x+armLength*cos(angle),y-armOffset+armLength*sin(angle),br*2,br*2);
    else{
      noStroke();
      fill(80,215,235);
      ellipse(x+armLength*cos(angle),y-armOffset+armLength*sin(angle),br*2);
    }
  }
}

function displayObjects(){
  if(!opened){
    if(targetImg) image(targetImg,targetX,targetY,targetSize,targetSize);
    else{
      noStroke();
      fill(100,220,130);
      rect(targetX-targetSize/2,targetY-targetSize/2,targetSize,targetSize);
    }
  }else{
    noFill();
    neon(relayLine);
    ellipse(targetX,targetY,targetSize);
    line(targetX,targetY,exitX,groundY-exitH);
  }
  if(ballMode==0 || ballMode==2){
    if(ballImg) image(ballImg,bx,by,br*2,br*2);
    else{
      noStroke();
      fill(80,215,235);
      ellipse(bx,by,br*2);
    }
  }
  for(let i=0;i<obstacleCount;i++){
    if(obstacleImg) image(obstacleImg,obstacleX[i],groundY-obstacleSize/2,obstacleSize,obstacleSize);
    else{
      noStroke();
      fill(235,90,90);
      ellipse(obstacleX[i],groundY-obstacleSize/2,obstacleSize);
    }
  }
}

function control(){
  if(keyIsDown(LEFT_ARROW)) speedX-=accel;
  if(keyIsDown(RIGHT_ARROW)) speedX+=accel;
  if(keyIsDown("a") || keyIsDown("A")) angle-=angleStep;
  if(keyIsDown("d") || keyIsDown("D")) angle+=angleStep;
  speedX*=friction;
  speedX=constrain(speedX,-maxSpeed,maxSpeed);
  px=constrain(px+speedX,pw,width-pw);
  angle=constrain(angle,-PI,0);
  speedY+=gravity;
  py+=speedY;
  if(py>=groundY){
    py=groundY;
    speedY=0;
  }
}

function hitPlayer(x,y,w,h){
  return px+pw/2>x-w/2 && px-pw/2<x+w/2 &&
         py>y-h/2 && py-ph-headR*2<y+h/2;
}

function moveTarget(){
  if(stage>1 && !opened){
    targetX=relayMinX+(sin(tx)+1)*relayRangeX/2;
    targetY=relayMinY+(cos(ty)+1)*relayRangeY/2;
    tx+=rate;
    ty+=rate*.8;
  }
}

function moveObstacles(){
  for(let i=0;i<obstacleCount;i++){
    obstacleX[i]-=obstacleSpeed;
    if(obstacleX[i]<-obstacleSize){
      obstacleX[i]=width+random(obstacleMinGap,obstacleMaxGap);
    }
    if(state==0 && hitPlayer(obstacleX[i],groundY-obstacleSize/2,obstacleSize,obstacleSize)){
      state=2;
      playEffect(burstSound);
    }
  }
}

function moveBall(){
  if(ballMode==0){
    bvy+=ballGravity;
    by+=bvy;
    if(hitPlayer(bx,by,br*2,br*2)){
      ballMode=1;
      playEffect(catchSound);
    }else if(by+br>=groundY){
      state=2;
      playEffect(burstSound);
    }
  }else if(ballMode==2){
    bx+=bvx;
    by+=bvy;
    if(bx+br>targetX-targetSize/2 && bx-br<targetX+targetSize/2 &&
       by+br>targetY-targetSize/2 && by-br<targetY+targetSize/2){
      opened=true;
      ballMode=3;
    }else if(bx<-br || bx>width+br || by<-br || by>groundY){
      dropBall();
      if(stage==1){
        targetX=random(randomTargetMinX,randomTargetMaxX);
        targetY=random(randomTargetMinY,randomTargetMaxY);
      }
    }
  }
}

function dropBall(){
  bx=random(ballMinX,ballMaxX);
  by=ballStartY;
  bvx=0;
  bvy=ballStartSpeed;
  ballMode=0;
}

function resetStage(){
  px=startX;
  py=groundY;
  speedX=0;
  speedY=0;
  angle=startAngle;
  opened=false;
  targetX=startTargetX;
  targetY=startTargetY;
  tx=random(10);
  ty=random(10,20);
  targetSize=baseTargetSize-stage*targetSizeStep;
  rate=rateStep*stage;
  obstacleCount=stage-1;
  obstacleSpeed=obstacleBaseSpeed+stage*obstacleSpeedStep;
  for(let i=0;i<obstacleCount;i++){
    obstacleX[i]=obstacleStartX+i*obstacleGap;
  }
  dropBall();
}

function displayText(){
  noStroke();
  fill(245);
  textAlign(CENTER,CENTER);
  textSize(nameSize);
  text("NIGHT CITY - ENERGY RELAY",centerX,titleY);
  textSize(stageTextSize);
  text("STAGE "+stage+" / "+lastStage+"   "+stageName[stage-1],centerX,stageY);
  let mission="떨어지는 파란 에너지를 받으세요";
  if(opened) mission="출구가 열렸습니다! 오른쪽 문으로 이동하세요";
  else if(ballMode==1) mission="A / D로 방향 조절 → 화면 클릭으로 중계기에 전달";
  else if(ballMode==2) mission="에너지 이동 중 — 장애물을 피하세요";
  text(mission,centerX,missionY);
  textSize(controlsSize);
  text("← → 이동   SPACE 점프   A / D 조준   클릭 발사   R 현재 단계 재시작",centerX,controlsY);
  if(state!==0){
    fill(15,17,31,235);
    rect(panelX,panelY,panelW,panelH);
    fill(c);
    textSize(messageSize);
    let message="ENERGY RELAY";
    let guide="에너지를 받아 중계기를 켜고 출구로 이동하세요. ENTER 시작";
    if(state==1){
      message="STAGE CLEAR";
      guide="N 키로 다음 스테이지";
    }else if(state==2){
      message="TRY AGAIN";
      guide="에너지를 놓쳤거나 장애물에 닿았습니다. R 재시작";
    }else if(state==3){
      message="ALL CLEAR";
      guide="도시의 중계기를 모두 연결했습니다. R 처음부터";
    }
    text(message,centerX,messageY);
    textSize(guideSize);
    fill(245);
    text(guide,centerX,guideY);
  }
}

function mousePressed(){
  if(mouseX>=0 && mouseX<width && mouseY>=0 && mouseY<height){
    if(mouseY<themeLimitY){
      sky=(sky+1)%bg.length;
      c=color(colors[sky][0],colors[sky][1],colors[sky][2]);
    }else if(state==0 && ballMode==1){
      bx=px+armLength*cos(angle);
      by=py-armOffset+armLength*sin(angle);
      bvx=shotSpeed*cos(angle);
      bvy=shotSpeed*sin(angle);
      ballMode=2;
    }
  }
}

function keyPressed(){
  switch(key){
    case "Enter":
      if(state==-1){
        resetStage();
        state=0;
        playEffect(catchSound);
      }
      break;
    case " ":
      if(state==0 && py>=groundY) speedY=jumpPower;
      break;
    case "n":
    case "N":
      if(state==1){
        stage++;
        resetStage();
        state=0;
      }
      break;
    case "r":
    case "R":
      if(state==3) stage=1;
      resetStage();
      state=0;
      break;
  }
}
