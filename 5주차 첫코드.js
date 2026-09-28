let sky=1,nr=80,ng=215,nb=235,floorY=340;
let lx=150,rx=525,playerY=395;
let bx=350,by=430,br=11,vx=3.4,vy=-2,g=.2,f=.88;

let sx=[35,75,115,160,210,255,455,500,615,660];
let sy=[55,90,45,78,105,62,58,92,75,50];
let xx=[20,85,150,220,321,420,490,560,630];
let ww=[55,58,55,58,58,58,55,58,50];
let hh=[120,150,130,145,205,140,125,155,115];

function setup(){
  createCanvas(700,550);
}

function draw(){
  control();
  mode();
  city();
  ground();
  goal(55,1);
  goal(645,-1);
  player(lx);
  player(rx);
  ball();
}

function city(){
  let bg=skyColor();
  background(bg[0],bg[1],bg[2]);

  noStroke();
  fill(205,110,185);
  ellipse(565,112,148);

  fill(222,142,202);
  ellipse(565,112,132);

  if(sky==3){
    fill(43,38,100);
    ellipse(598,108,103);
  }

  stroke(238);
  strokeWeight(3);

  for(let i=0;i<sx.length;i++){
    point(sx[i],sy[i]);
  }

  noFill();
  strokeWeight(2);
  arc(95,130,55,25,PI,PI*2);
  arc(135,130,70,34,PI,PI*2);

  fill(245);
  noStroke();
  textAlign(CENTER);
  textSize(18);
  text("NIGHT CITY",350,34);

  for(let i=0;i<xx.length;i++){
    building(i);
  }
}

function skyColor(){
  let bg=[
    [67,68,145],
    [78,55,143],
    [43,38,100]
  ];

  return bg[sky-1];
}

function building(i){
  let y=floorY-hh[i];

  if(i==4){
    fill(38,35,88);
  }else{
    fill(27,29,68);
  }

  stroke(20,21,50);
  rect(xx[i],y,ww[i],hh[i]);

  neon(1);

  for(let y2=y+16;y2<floorY-10;y2+=22){
    line(xx[i]+9,y2,xx[i]+ww[i]-9,y2);
  }
}

function ground(){
  noStroke();
  fill(15,17,31);
  rect(0,floorY,width,height-floorY);

  fill(22,24,42);
  neon(2);

  beginShape();
  vertex(135,378);
  vertex(565,378);
  vertex(650,530);
  vertex(50,530);
  endShape(CLOSE);

  line(350,395,350,515);
  ellipse(350,455,100,70);
}

function goal(x,d){
  neon(5);
  line(x,405,x,485);
  line(x,405,x+55*d,405);
}

function player(x){
  let c=color(nr,ng,nb);

  fill(c);
  noStroke();
  ellipse(x+10,380,28);

  fill(31,35,66);
  neon(2);
  rect(x,playerY,20,90);
}

function neon(w){
  stroke(nr,ng,nb);
  strokeWeight(w);
}

function mode(){
  switch(sky){
    case 1:
      nr=80;
      ng=215;
      nb=235;
      break;

    case 2:
      nr=180;
      ng=120;
      nb=230;
      break;

    case 3:
      nr=235;
      ng=120;
      nb=190;
      break;
  }
}

function control(){
  if(mouseIsPressed){
    if(mouseX>80 && mouseX<300){
      lx=mouseX;
    }
  }

  if(keyIsDown(LEFT_ARROW)){
    if(rx>400){
      rx=rx-4;
    }
  }

  if(keyIsDown(RIGHT_ARROW)){
    if(rx<600){
      rx=rx+4;
    }
  }
}

function mousePressed(){
  if(sky==1){
    sky=2;
  }else if(sky==2){
    sky=3;
  }else{
    sky=1;
  }
}

function keyPressed(){
  if(key=='r' || key=='R'){
    bx=350;
    by=430;
    vx=3.4;
    vy=-2;
  }
}

function ball(){
  vy=vy+g;
  bx=bx+vx;
  by=by+vy;

  if(by+br>505){
    by=505-br;
    vy=-vy*f;
    vx=vx*f;
  }

  if(vx<0 && hitPlayer(lx)){
    bx=lx+20+br;
    vx=3.6;
    vy=-3.2;
  }

  if(vx>0 && hitPlayer(rx)){
    bx=rx-br;
    vx=-3.6;
    vy=-3.2;
  }

  noFill();
  stroke(60,150,170);
  ellipse(bx,by,br*2+7);

  fill(nr,ng,nb);
  stroke(245);
  ellipse(bx,by,br*2);
}

function hitPlayer(x){
  if(bx+br<=x) return false;
  if(bx-br>=x+20) return false;
  if(by+br<=playerY) return false;
  if(by-br>=playerY+90) return false;

  return true;
}
