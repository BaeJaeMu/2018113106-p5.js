let canvasW=800,canvasH=600,unit;
let sky=0,c,stage=1,lastStage=3,state=-1;
let images=[],sounds=[],effect=-1;
let imageFiles=["circle1.png","square.png","bomb.png","card.png"];
let soundFiles=["catch.mp3","burst.mp3","claps.mp3"];
let bg=[[67,68,145],[78,55,143],[43,38,100]];
let colors=[[80,215,235],[180,120,230],[235,120,190]];
let sx=[.05,.107,.164,.229,.3,.364,.65,.714,.879,.943];
let sy=[.1,.164,.082,.142,.191,.113,.105,.167,.136,.091];
let xx=[.029,.121,.214,.314,.459,.6,.7,.8,.9];
let ww=[.079,.083,.079,.083,.083,.083,.079,.083,.071];
let hh=[.218,.273,.236,.264,.373,.255,.227,.282,.209];
let cloudX=[.136,.193],cloudW=[.079,.1],cloudH=[.045,.062];
let floorY,groundY,centerX,thinLine,normalLine,windowGap;
let paddle,accel,speed,friction=.8,minY,maxY,oldMouseX,oldMouseY;
let bx,by,br,vx,vy,oldBallY,gravity,ballSpeed;
let ballRate=.45,reboundBoost=1.1,bounceSpeed;
let launchVY,angleLimit,ballActive=false,serve=false;
let blastX,blastY,blastSize;
let gx=[],gy=[],baseX=[],baseY=[],on=[],goneTime=[],gt=[],gv=[];
let goalCount,goalSize,goalRange,goalSpeed,noiseRange,noiseRate=.008;
let restoreTime=1800,noiseSeedRange=100;
let ex=[],ey=[],enemyCount,enemyR,enemySpeed,patrolSpeed,patrolY;
let energy=0,energyBase=3,energyStep=3,energyNeed,dice=0,diceSides=3;
let cardStage=0,bombIndex,cardCount=3,cardX=[],cardY,cardW,cardH,cardGap;
let routeX=0,routeY=0,gridX,gridY,gridSize;
let circuit=[[0,0,1,0,0],[1,0,1,0,1],[0,0,0,0,0],[0,1,1,1,0],[0,0,1,0,0]];
let titleY,infoY,noticeY,helpY,titleSize,smallSize,bigSize;
let panelX,panelY,panelW,panelH,messageY,guideY;
let barX,barY,barW,barH,themeY,notice="";
let messages=["ENTER: 시작","","카드 선택","공이 폭탄에 닿았습니다","ALL CLEAR","미로 탈출"];
let guides=["공 반사 → 에너지 충전 → 카드 → 미로","","폭탄 카드: 다시 충전 / 정상 카드: 미로 이동","ENTER 또는 R: 같은 스테이지 재시작","R: 처음부터","방향키로 노란 출구에 도착하세요"];

function setup(){
  createCanvas(canvasW,canvasH);
  imageMode(CENTER);
  textAlign(CENTER,CENTER);
  unit=width;
  if(height<unit) unit=height;
  floorY=height*.62; groundY=height*.92; centerX=width/2;
  thinLine=unit*.0015; normalLine=unit*.003; windowGap=height*.04;
  minY=height*.22; maxY=height*.87;
  paddle={x:centerX,y:maxY,w:width*.19,h:height*.025,vx:0,vy:0};
  accel=width*.0025; speed=width*.01;
  br=unit*.018; gravity=height*.00055*ballRate*ballRate;
  ballSpeed=width*.004*ballRate; launchVY=-height*.025*ballRate;
  bounceSpeed=height*.03*ballRate*reboundBoost;
  blastSize=unit*.14;
  angleLimit=PI/4;
  goalSize=unit*.085; goalRange=width*.025;
  goalSpeed=width*.00025; noiseRange=height*.012;
  enemyR=unit*.05; patrolSpeed=width*.001;
  patrolY=height*.44;
  cardY=height*.53; cardW=unit*.16; cardH=unit*.23; cardGap=width*.21;
  gridSize=unit*.055; gridX=centerX-circuit[0].length*gridSize/2; gridY=height*.4;
  titleY=height*.045; infoY=height*.1; noticeY=height*.19;
  helpY=height*.96; themeY=height*.075;
  titleSize=unit*.035; smallSize=unit*.025; bigSize=unit*.045;
  panelX=width*.07; panelY=height*.28; panelW=width*.86; panelH=height*.48;
  messageY=height*.34; guideY=height*.71;
  barX=width*.25; barY=height*.14; barW=width*.5; barH=height*.018;
  c=color(colors[sky][0],colors[sky][1],colors[sky][2]);
  for(let i=0;i<cardCount;i++) cardX[i]=centerX+(i-(cardCount-1)/2)*cardGap;
  resetStage();
  for(let i=0;i<imageFiles.length;i++) loadPicture(i);
  for(let i=0;i<soundFiles.length;i++) loadEffect(i);
}

function draw(){
  if(state==0){
    mouseControl();
    keyboardControl();
    inertia();
    restoreGoals();
    driftGoals();
    moveTargets();
    serveBall();
    moveBall();
    if(ballActive){
      bounceBall();
      chaseBomb();
      patrolBomb();
      checkBomb();
      if(state==0) checkTargets();
    }
  }
  city();
  ground();
  objects();
  displayText();
  if(effect>=0){
    if(sounds[effect]) sounds[effect].play();
    effect=-1;
  }
}

function city(){
  let b=skyColor();
  background(b[0],b[1],b[2]);
  let mx=width*.807,my=height*.23,moonSize=unit*.25;
  noStroke();
  fill(205,110,185);
  ellipse(mx,my,moonSize);
  fill(222,142,202);
  ellipse(mx,my,moonSize*.88);
  if(sky==bg.length-1){
    fill(b[0],b[1],b[2]);
    ellipse(width*.85,height*.22,unit*.19);
  }
  stroke(238);
  strokeWeight(normalLine);
  for(let i=0;i<sx.length;i++) point(sx[i]*width,sy[i]*height);
  noFill();
  for(let i=0;i<cloudX.length;i++){
    arc(cloudX[i]*width,height*.25,cloudW[i]*width,cloudH[i]*height,PI,PI*2);
  }
  for(let i=0;i<xx.length;i++) building(i);
}

function skyColor(){
  return bg[sky];
}

function requiredEnergy(level){
  return level*energyStep+energyBase;
}

function building(i){
  let x=xx[i]*width,w=ww[i]*width,h=hh[i]*height,y=floorY-h;
  let side=width*.012,top=height*.025,bottom=height*.015;
  fill(27,29,68);
  if(i==4) fill(38,35,88);
  stroke(20,21,50);
  strokeWeight(normalLine);
  rect(x,y,w,h);
  neon(thinLine);
  for(let wy=y+top;wy<floorY-bottom;wy+=windowGap) line(x+side,wy,x+w-side,wy);
}

function ground(){
  let top=floorY+height*.05;
  noStroke();
  fill(15,17,31);
  rect(0,floorY,width,height-floorY);
  fill(22,24,42);
  neon(normalLine);
  beginShape();
  vertex(width*.16,top);
  vertex(width*.84,top);
  vertex(width*.97,groundY);
  vertex(width*.03,groundY);
  endShape(CLOSE);
  line(0,groundY,width,groundY);
}

function neon(w){
  stroke(c);
  strokeWeight(w);
}

function picture(i,x,y,w,h){
  if(images[i]){
    image(images[i],x,y,w,h);
  }else{
    noStroke();
    fill(c);
    if(i==0 || i==2){
      if(i==2) fill(235,90,110);
      ellipse(x,y,w,h);
    }else{
      if(i==1) fill(80,200,130);
      if(i==3) fill(35,45,70);
      rect(x-w/2,y-h/2,w,h);
    }
  }
}

function objects(){
  for(let i=0;i<goalCount;i++){
    if(on[i]) picture(1,gx[i],gy[i],goalSize,goalSize);
  }
  if(state!=2) picture(0,bx,by,br*2,br*2);
  if(state==2){
    noStroke();
    fill(255,110,50,180);
    ellipse(blastX,blastY,blastSize);
  }
  for(let i=0;i<enemyCount;i++){
    picture(2,ex[i],ey[i],enemyR*2,enemyR*2);
    noFill();
    stroke(235,90,110);
    strokeWeight(thinLine);
    ellipse(ex[i],ey[i],enemyR*2);
  }
  fill(31,35,66);
  neon(normalLine);
  rect(paddle.x-paddle.w/2,paddle.y-paddle.h/2,paddle.w,paddle.h);
}

function displayText(){
  noStroke();
  fill(245);
  textSize(titleSize);
  text("NIGHT CITY - POWER MAZE",centerX,titleY);
  textSize(smallSize);
  text("STAGE "+stage+" / "+lastStage+"   충전 "+energy+" / "+energyNeed+"   최근 획득 +"+dice,centerX,infoY);
  fill(45,48,70);
  rect(barX,barY,barW,barH);
  fill(c);
  rect(barX,barY,barW*energy/energyNeed,barH);
  fill(245);
  text(notice,centerX,noticeY);
  text("판: 마우스·방향키 / 클릭: 공 출발 / R: 현재 단계 재시작",centerX,helpY);
  if(state==0) return;
  fill(15,17,31,240);
  rect(panelX,panelY,panelW,panelH);
  fill(c);
  textSize(bigSize);
  text(messages[state+1],centerX,messageY);
  if(state==1){
    for(let i=0;i<cardCount;i++){
      picture(3,cardX[i],cardY,cardW,cardH);
      noFill();
      neon(normalLine);
      rect(cardX[i]-cardW/2,cardY-cardH/2,cardW,cardH);
      noStroke();
      fill(245);
      text("?",cardX[i],cardY);
    }
  }
  if(state==4) displayMaze();
  noStroke();
  fill(245);
  textSize(smallSize);
  text(guides[state+1],centerX,guideY);
}

async function loadPicture(i){
  images[i]=await loadImage(imageFiles[i]);
}

async function loadEffect(i){
  sounds[i]=await loadSound(soundFiles[i]);
}

function resetStage(){
  paddle.x=centerX; paddle.y=maxY; paddle.vx=0; paddle.vy=0;
  oldMouseX=mouseX; oldMouseY=mouseY;
  goalCount=stage+1;
  for(let i=0;i<goalCount;i++){
    baseX[i]=width*(i+1)/(goalCount+1);
    baseY[i]=height*(.28+(i%2)*.065);
    gx[i]=baseX[i]; gy[i]=baseY[i]; on[i]=true;
    gt[i]=random(noiseSeedRange); gv[i]=goalSpeed;
  }
  enemyCount=stage-1;
  enemySpeed=unit*(.00055+stage*.0001);
  for(let i=0;i<enemyCount;i++){
    ex[i]=width*(.78-i*.56);
    ey[i]=patrolY;
  }
  energyNeed=requiredEnergy(stage);
  energy=0; dice=0; notice="";
  if(cardStage!=stage){
    bombIndex=int(random(cardCount));
    cardStage=stage;
  }
  startBall();
}

function mousePressed(){
  if(state==1){
    for(let i=0;i<cardCount;i++){
      if(mouseX>=cardX[i]-cardW/2 && mouseX<=cardX[i]+cardW/2 &&
         mouseY>=cardY-cardH/2 && mouseY<=cardY+cardH/2){
        chooseCard(i);
        break;
      }
    }
  }else if(state==0 && !ballActive && mouseX>=0 && mouseX<width &&
           mouseY>=minY && mouseY<=groundY){
    serve=true;
  }else if(mouseX>=0 && mouseX<width && mouseY>=0 && mouseY<themeY){
    sky=(sky+1)%bg.length;
    c=color(colors[sky][0],colors[sky][1],colors[sky][2]);
  }
}

function keyPressed(){
  if(key==LEFT_ARROW || key==RIGHT_ARROW || key==UP_ARROW || key==DOWN_ARROW){
    if(state==4) moveMaze();
    return false;
  }
  switch(key){
    case "Enter":
      if(state==-1 || state==2){ resetStage(); state=0; }
      return false;
    case "r":
    case "R":
      if(state!=-1){
        if(state==3){ stage=1; cardStage=0; }
        resetStage();
        state=0;
      }
      return false;
  }
}

function mouseControl(){
  if(mouseX>=0 && mouseX<=width && mouseY>=0 && mouseY<=height){
    if(mouseIsPressed || mouseX!=oldMouseX || mouseY!=oldMouseY){
      paddle.x=mouseX; paddle.y=mouseY;
      paddle.vx=0; paddle.vy=0;
    }
  }
  oldMouseX=mouseX; oldMouseY=mouseY;
}

function restoreGoals(){
  let now=millis();
  for(let i=0;i<goalCount;i++){
    if(!on[i] && now-goneTime[i]>=restoreTime){
      on[i]=true;
      gx[i]=baseX[i]+random(-goalRange,goalRange);
    }
  }
}

function driftGoals(){
  for(let i=0;i<goalCount;i++){
    gt[i]+=noiseRate;
    gy[i]=baseY[i]+(noise(gt[i])-.5)*noiseRange;
  }
}

function inertia(){
  paddle.vx=constrain(paddle.vx*friction,-speed,speed);
  paddle.vy=constrain(paddle.vy*friction,-speed,speed);
  paddle.x=constrain(paddle.x+paddle.vx,paddle.w/2,width-paddle.w/2);
  paddle.y=constrain(paddle.y+paddle.vy,minY,maxY);
}

function reflectAngle(){
  let offset=constrain((bx-paddle.x)/(paddle.w/2),-1,1);
  let angle=-PI/2+offset*angleLimit;
  vx=bounceSpeed*cos(angle);
  vy=bounceSpeed*sin(angle);
}

function patrolBomb(){
  if(enemyCount<2) return;
  ex[1]-=patrolSpeed;
  if(ex[1]+enemyR<0) ex[1]=width+enemyR;
}

function startBall(){
  bx=paddle.x; by=paddle.y-(paddle.h+normalLine)/2-br;
  vx=0; vy=0;
  ballActive=false; serve=false;
}

function moveBall(){
  if(!ballActive){
    bx=paddle.x;
    by=paddle.y-(paddle.h+normalLine)/2-br;
    return;
  }
  oldBallY=by;
  vy+=gravity;
  setBounceSpeed(false);
  bx+=vx;
  by+=vy;
  if(bx<br || bx>width-br){
    bx=constrain(bx,br,width-br);
    vx=-vx;
    setBounceSpeed(true);
  }
  if(by<br){
    by=br;
    vy=-vy;
    setBounceSpeed(true);
  }
  if(by-br>groundY) startBall();
}

function setBounceSpeed(force){
  let velocity=dist(0,0,vx,vy);
  if(velocity>0 && (force || velocity>bounceSpeed)){
    vx=vx/velocity*bounceSpeed;
    vy=vy/velocity*bounceSpeed;
  }
}

function bounceBall(){
  let top=paddle.y-(paddle.h+normalLine)/2;
  let half=(paddle.w+normalLine)/2;
  let crossing=oldBallY+br<=top && by+br>=top;
  let touching=by+br>=top && by-br<=paddle.y+(paddle.h+normalLine)/2;
  if(vy>0 && bx+br>=paddle.x-half && bx-br<=paddle.x+half && (crossing || touching)){
    by=top-br;
    reflectAngle();
  }
}

function chaseBomb(){
  if(enemyCount<1) return;
  let d=dist(ex[0],ey[0],bx,by);
  if(d>0){
    ex[0]+=(bx-ex[0])/d*enemySpeed;
    ey[0]+=(by-ey[0])/d*enemySpeed;
  }
}

function charge(){
  dice=int(random(diceSides))+1;
  energy+=dice;
  effect=0;
  notice="과녁 명중! +"+dice;
  if(energy>=energyNeed){ energy=energyNeed; state=1; }
}

function chooseCard(i){
  if(i==bombIndex){
    resetStage();
    state=0;
    notice="폭탄 카드! 다시 충전하세요 · 카드 위치 유지";
    effect=1;
  }else{
    routeX=0; routeY=0;
    state=4;
    effect=0;
  }
}

function moveTargets(){
  for(let i=0;i<goalCount;i++){
    gx[i]+=gv[i];
    if(gx[i]<baseX[i]-goalRange || gx[i]>baseX[i]+goalRange){
      gx[i]=constrain(gx[i],baseX[i]-goalRange,baseX[i]+goalRange);
      gv[i]=-gv[i];
    }
  }
}

function serveBall(){
  if(serve){
    serve=false;
    if(!ballActive){
      bx=paddle.x;
      by=paddle.y-(paddle.h+normalLine)/2-br;
      vx=ballSpeed;
      if(random(1)<.5) vx=-ballSpeed;
      vy=launchVY;
      ballActive=true;
    }
  }
}

function keyboardControl(){
  if(keyIsDown(LEFT_ARROW)) paddle.vx-=accel;
  if(keyIsDown(RIGHT_ARROW)) paddle.vx+=accel;
  if(keyIsDown(UP_ARROW)) paddle.vy-=accel;
  if(keyIsDown(DOWN_ARROW)) paddle.vy+=accel;
}

function checkBomb(){
  for(let i=0;i<enemyCount;i++){
    if(dist(bx,by,ex[i],ey[i])<br+enemyR){
      blastX=bx; blastY=by;
      ballActive=false;
      state=2;
      effect=1;
      return;
    }
  }
}

function checkTargets(){
  for(let i=0;i<goalCount;i++){
    if(on[i] && bx+br>=gx[i]-goalSize/2 && bx-br<=gx[i]+goalSize/2 &&
       by+br>=gy[i]-goalSize/2 && by-br<=gy[i]+goalSize/2){
      on[i]=false;
      goneTime[i]=millis();
      vy=-vy;
      charge();
      break;
    }
  }
}

function displayMaze(){
  for(let y=0;y<circuit.length;y++){
    for(let x=0;x<circuit[y].length;x++){
      fill(15,25,40);
      if(circuit[y][x]==1) fill(70,85,110);
      if(x==circuit[0].length-1 && y==circuit.length-1) fill(255,210,80);
      stroke(80);
      rect(gridX+x*gridSize,gridY+y*gridSize,gridSize,gridSize);
    }
  }
  noStroke();
  fill(c);
  ellipse(gridX+(routeX+.5)*gridSize,gridY+(routeY+.5)*gridSize,gridSize*.5);
}

function moveMaze(){
  let x=routeX,y=routeY;
  if(key==LEFT_ARROW) x--;
  if(key==RIGHT_ARROW) x++;
  if(key==UP_ARROW) y--;
  if(key==DOWN_ARROW) y++;
  x=constrain(x,0,circuit[0].length-1);
  y=constrain(y,0,circuit.length-1);
  if(circuit[y][x]==0){ routeX=x; routeY=y; }
  if(routeX==circuit[0].length-1 && routeY==circuit.length-1){
    if(stage<lastStage){
      stage++;
      resetStage();
      state=0;
      notice="미로 통과! STAGE "+stage;
    }else{
      state=3;
    }
    effect=2;
  }
}
