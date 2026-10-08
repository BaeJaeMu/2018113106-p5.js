let canvasW=700,canvasH=550;
let floorY=340;
let sky=1;

let skyColors=[
  [67,68,145],
  [78,55,143],
  [43,38,100]
];

let neonColors=[
  [80,215,235],
  [180,120,230],
  [235,120,190]
];

let skyCount=skyColors.length;
let crescentSky=skyCount;
let nr=neonColors[sky-1][0];
let ng=neonColors[sky-1][1];
let nb=neonColors[sky-1][2];
let c;

let moonX=565,moonY=112;
let moonOuterSize=148,moonInnerSize=132;
let moonOuterColor=[205,110,185];
let moonInnerColor=[222,142,202];
let moonCoverX=598,moonCoverY=108;
let moonCoverSize=103;

let sx=[35,75,115,160,210,255,455,500,615,660];
let sy=[55,90,45,78,105,62,58,92,75,50];
let starColor=238,starWeight=3;

let cloudX=[95,135];
let cloudY=130;
let cloudW=[55,70];
let cloudH=[25,34];
let cloudWeight=2;

let titleText="NIGHT CITY";
let titleX=canvasW/2,titleY=34;
let titleSize=18,titleColor=245;

let xx=[20,85,150,220,321,420,490,560,630];
let ww=[55,58,55,58,58,58,55,58,50];
let hh=[120,150,130,145,205,140,125,155,115];

let specialBuilding=4;
let buildingColor=[27,29,68];
let specialBuildingColor=[38,35,88];
let buildingLineColor=[20,21,50];
let buildingLineWeight=2;

let windowTop=16,windowBottom=10;
let windowSide=9,windowGap=22;
let windowWeight=1;

let groundColor=[15,17,31];
let courtColor=[22,24,42];
let courtWeight=2;

let courtX=[135,565,650,50];
let courtY=[378,378,530,530];

let centerX=canvasW/2;
let centerLineTop=395,centerLineBottom=515;
let centerCircleY=455;
let centerCircleW=100,centerCircleH=70;

let leftGoalX=55,rightGoalX=645;
let goalTop=405,goalBottom=485;
let goalWidth=55,goalWeight=5;
let leftGoalDirection=1,rightGoalDirection=-1;

let lx=150,rx=525,playerY=395;
let playerW=20,playerH=90;
let headY=380,headSize=28;
let bodyColor=[31,35,66];
let playerWeight=2;

let leftMin=80,leftMax=300;
let rightMin=400,rightMax=600;
let moveSpeed=4;

let ballStartX=350,ballStartY=430;
let ballStartVX=3.4,ballStartVY=-2;

let bx=ballStartX,by=ballStartY;
let vx=ballStartVX,vy=ballStartVY;

let br=11,g=.2,f=.88;
let ballFloor=505;
let hitSpeedX=3.6,hitSpeedY=-3.2;

let ballGlowColor=[60,150,170];
let ballLineColor=245;
let ballGlowExtra=7,ballLineWeight=2;

let resetKey="r";

function setup(){
  createCanvas(canvasW,canvasH);
  c=color(nr,ng,nb);
}

function draw(){
  control();
  city();
  ground();
  goal(leftGoalX,leftGoalDirection);
  goal(rightGoalX,rightGoalDirection);
  player(lx);
  player(rx);
  ball();
}

function city(){
  let bg=skyColors[sky-1];
  background(bg[0],bg[1],bg[2]);

  noStroke();

  fill(
    moonOuterColor[0],
    moonOuterColor[1],
    moonOuterColor[2]
  );
  ellipse(moonX,moonY,moonOuterSize);

  fill(
    moonInnerColor[0],
    moonInnerColor[1],
    moonInnerColor[2]
  );
  ellipse(moonX,moonY,moonInnerSize);

  if(sky==crescentSky){
    fill(bg[0],bg[1],bg[2]);
    ellipse(moonCoverX,moonCoverY,moonCoverSize);
  }

  stroke(starColor);
  strokeWeight(starWeight);

  for(let i=0;i<sx.length;i++){
    point(sx[i],sy[i]);
  }

  noFill();
  strokeWeight(cloudWeight);

  for(let i=0;i<cloudX.length;i++){
    arc(
      cloudX[i],cloudY,
      cloudW[i],cloudH[i],
      PI,TWO_PI
    );
  }

  fill(titleColor);
  noStroke();
  textAlign(CENTER);
  textSize(titleSize);
  text(titleText,titleX,titleY);

  for(let i=0;i<xx.length;i++){
    building(i);
  }
}

function building(i){
  let y=floorY-hh[i];

  if(i==specialBuilding){
    fill(
      specialBuildingColor[0],
      specialBuildingColor[1],
      specialBuildingColor[2]
    );
  }else{
    fill(
      buildingColor[0],
      buildingColor[1],
      buildingColor[2]
    );
  }

  stroke(
    buildingLineColor[0],
    buildingLineColor[1],
    buildingLineColor[2]
  );
  strokeWeight(buildingLineWeight);
  rect(xx[i],y,ww[i],hh[i]);

  neon(windowWeight);

  for(
    let y2=y+windowTop;
    y2<floorY-windowBottom;
    y2+=windowGap
  ){
    line(
      xx[i]+windowSide,y2,
      xx[i]+ww[i]-windowSide,y2
    );
  }
}

function ground(){
  noStroke();
  fill(groundColor[0],groundColor[1],groundColor[2]);
  rect(0,floorY,width,height-floorY);

  fill(courtColor[0],courtColor[1],courtColor[2]);
  neon(courtWeight);

  beginShape();

  for(let i=0;i<courtX.length;i++){
    vertex(courtX[i],courtY[i]);
  }

  endShape(CLOSE);

  line(centerX,centerLineTop,centerX,centerLineBottom);
  ellipse(centerX,centerCircleY,centerCircleW,centerCircleH);
}

function goal(x,d){
  neon(goalWeight);
  line(x,goalTop,x,goalBottom);
  line(x,goalTop,x+goalWidth*d,goalTop);
}

function neon(w){
  stroke(c);
  strokeWeight(w);
}

function ball(){
  vy=vy+g;
  bx=bx+vx;
  by=by+vy;

  if(by+br>ballFloor){
    by=ballFloor-br;
    vy=-vy*f;
    vx=vx*f;
  }

  if(vx<0 && hitPlayer(lx)){
    bx=lx+playerW+br;
    vx=hitSpeedX;
    vy=hitSpeedY;
  }

  if(vx>0 && hitPlayer(rx)){
    bx=rx-br;
    vx=-hitSpeedX;
    vy=hitSpeedY;
  }

  noFill();
  stroke(
    ballGlowColor[0],
    ballGlowColor[1],
    ballGlowColor[2]
  );
  strokeWeight(ballLineWeight);
  ellipse(bx,by,br*2+ballGlowExtra);

  fill(c);
  stroke(ballLineColor);
  ellipse(bx,by,br*2);
}

function hitPlayer(x){
  if(bx+br<=x) return false;
  if(bx-br>=x+playerW) return false;
  if(by+br<=playerY) return false;
  if(by-br>=playerY+playerH) return false;

  return true;
}

function player(x){
  fill(c);
  noStroke();
  ellipse(x+playerW/2,headY,headSize);

  fill(bodyColor[0],bodyColor[1],bodyColor[2]);
  neon(playerWeight);
  rect(x,playerY,playerW,playerH);
}

function control(){
  if(mouseIsPressed){
    if(mouseX>leftMin && mouseX<leftMax){
      lx=mouseX;
    }
  }

  if(keyIsDown(LEFT_ARROW)){
    rx=rx-moveSpeed;
  }

  if(keyIsDown(RIGHT_ARROW)){
    rx=rx+moveSpeed;
  }

  if(rx<rightMin){
    rx=rightMin;
  }

  if(rx>rightMax){
    rx=rightMax;
  }
}

function mousePressed(){
  sky=sky%skyCount+1;

  nr=neonColors[sky-1][0];
  ng=neonColors[sky-1][1];
  nb=neonColors[sky-1][2];

  c=color(nr,ng,nb);
}

function keyPressed(){
  if(key==resetKey || key==resetKey.toUpperCase()){
    bx=ballStartX;
    by=ballStartY;
    vx=ballStartVX;
    vy=ballStartVY;
  }
}
