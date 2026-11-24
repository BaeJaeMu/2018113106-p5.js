let canvasW=800,canvasH=600,unit,game;
let sounds=[],soundFiles=["catch.mp3","burst.mp3","claps.mp3"];

function setup(){
  createCanvas(canvasW,canvasH);
  imageMode(CENTER);
  textAlign(CENTER,CENTER);
  unit=width;
  if(height<unit) unit=height;
  game=new Game();
  game.reset();
  for(let i=0;i<soundFiles.length;i++) loadEffect(i);
}

function draw(){
  game.update();
  game.display();
}

function mousePressed(){
  game.click(mouseX,mouseY);
}

function keyPressed(){
  game.press(key);
  return false;
}

async function loadEffect(i){
  sounds[i]=await loadSound(soundFiles[i]);
}

class Background {
  constructor(){
    this.sky=0;
    this.colors=[[80,215,235],[180,120,230],[235,120,190]];
    this.bg=[[67,68,145],[78,55,143],[43,38,100]];
    this.c=color(80,215,235);
    this.xx=[.029,.121,.214,.314,.459,.6,.7,.8,.9];
    this.ww=[.079,.083,.079,.083,.083,.083,.079,.083,.071];
    this.hh=[.218,.273,.236,.264,.373,.255,.227,.282,.209];
    this.sx=[.05,.107,.164,.229,.3,.364,.65,.714,.879,.943];
    this.sy=[.1,.164,.082,.142,.191,.113,.105,.167,.136,.091];
    this.floor=height*.62;
    this.lineW=unit*.003;
  }

  change(){
    this.sky=(this.sky+1)%this.bg.length;
    let c=this.colors[this.sky];
    this.c=color(c[0],c[1],c[2]);
  }

  display(){
    let b=this.bg[this.sky];
    background(b[0],b[1],b[2]);
    noStroke();
    fill(205,110,185);
    ellipse(width*.807,height*.23,unit*.25);
    fill(222,142,202);
    ellipse(width*.807,height*.23,unit*.22);
    if(this.sky==2){
      fill(b[0],b[1],b[2]);
      ellipse(width*.85,height*.22,unit*.19);
    }
    stroke(238);
    strokeWeight(this.lineW);
    for(let i=0;i<this.sx.length;i++) point(this.sx[i]*width,this.sy[i]*height);
    noFill();
    arc(width*.136,height*.25,width*.079,height*.045,PI,PI*2);
    for(let i=0;i<this.xx.length;i++) this.construction(i);
    noStroke();
    fill(15,17,31);
    rect(0,this.floor,width,height-this.floor);
    stroke(this.c);
    fill(22,24,42);
    beginShape();
    vertex(width*.16,height*.67);
    vertex(width*.84,height*.67);
    vertex(width*.97,game.bottom);
    vertex(width*.03,game.bottom);
    endShape(CLOSE);
  }

  construction(i){
    let x=this.xx[i]*width,w=this.ww[i]*width;
    let h=this.hh[i]*height,y=this.floor-h;
    let side=width*.012,gap=height*.04;
    stroke(20,21,50);
    fill(27,29,68);
    if(game.repaired[i]) fill(55,70,105);
    rect(x,y,w,h);
    stroke(this.c);
    if(game.repaired[i]) stroke(255,225,100);
    for(let wy=y+gap;wy<this.floor-gap/2;wy+=gap) line(x+side,wy,x+w-side,wy);
  }
}

class Player {
  constructor(){
    this.baseW=width*.17;
    this.maxW=width*.27;
    this.growth=width*.025;
    this.h=height*.025;
    this.minY=height*.22;
    this.maxY=height*.86;
    this.speed=width*.01;
    this.accel=width*.0025;
    this.friction=.8;
    this.gunSize=unit*.018;
    this.gunLength=unit*.055;
    this.minAngle=-PI+.1;
    this.maxAngle=-.1;
  }

  reset(){
    this.w=this.baseW;
    this.x=width/2;
    this.y=this.maxY;
    this.oldY=this.y;
    this.vx=0;
    this.vy=0;
    this.mx=mouseX;
    this.my=mouseY;
    this.angle=-PI/2;
  }

  update(){
    this.oldY=this.y;
    if(mouseX>=0 && mouseX<=width &&
       mouseY>=0 && mouseY<=height &&
       (mouseX!=this.mx || mouseY!=this.my)){
      this.x=mouseX;
      this.y=mouseY;
      this.vx=0;
      this.vy=0;
    }
    if(keyIsDown(LEFT_ARROW)) this.vx-=this.accel;
    if(keyIsDown(RIGHT_ARROW)) this.vx+=this.accel;
    if(keyIsDown(UP_ARROW)) this.vy-=this.accel;
    if(keyIsDown(DOWN_ARROW)) this.vy+=this.accel;
    this.vx=constrain(this.vx*this.friction,-this.speed,this.speed);
    this.vy=constrain(this.vy*this.friction,-this.speed,this.speed);
    this.x=constrain(this.x+this.vx,this.w/2,width-this.w/2);
    this.y=constrain(this.y+this.vy,this.minY,this.maxY);
    this.mx=mouseX;
    this.my=mouseY;
  }

  grow(){
    this.w=constrain(this.w+this.growth,this.baseW,this.maxW);
    this.x=constrain(this.x,this.w/2,width-this.w/2);
  }

  turn(amount){
    this.angle=constrain(this.angle+amount,this.minAngle,this.maxAngle);
  }

  display(){
    stroke(game.background.c);
    strokeWeight(game.background.lineW);
    fill(31,35,66);
    rect(this.x-this.w/2,this.y-this.h/2,this.w,this.h);
    if(game.shooting){
      push();
      translate(this.x,this.y-this.h/2);
      rotate(this.angle);
      stroke(255,220,100);
      line(0,0,this.gunLength,0);
      translate(this.gunLength,0);
      noStroke();
      fill(255,220,100);
      beginShape();
      vertex(this.gunSize,0);
      vertex(0,-this.gunSize/2);
      vertex(0,this.gunSize/2);
      endShape(CLOSE);
      pop();
    }
  }
}

class Ball {
  constructor(){
    this.img=null;
    this.loadPicture();
    this.r=unit*.018;
    this.gravity=height*.000134;
    this.startVX=width*.0018;
    this.startVY=-height*.01125;
    this.speed=height*.01485;
  }

  async loadPicture(){
    this.img=await loadImage("circle1.png");
  }

  reset(){
    this.x=game.player.x;
    this.y=game.player.y-game.player.h/2-this.r;
    this.vx=0;
    this.vy=0;
    this.active=false;
  }

  launch(){
    this.reset();
    this.vx=this.startVX;
    if(random(1)<.5) this.vx=-this.vx;
    this.vy=this.startVY;
    this.active=true;
  }

  limit(force){
    let s=dist(0,0,this.vx,this.vy);
    if(s>0 && (force || s>this.speed)){
      this.vx=this.vx/s*this.speed;
      this.vy=this.vy/s*this.speed;
    }
  }

  update(){
    if(!this.active){ this.reset(); return; }
    this.vy+=this.gravity;
    this.limit(false);
    this.x+=this.vx;
    this.y+=this.vy;
    if(this.x<this.r || this.x>width-this.r){
      this.x=constrain(this.x,this.r,width-this.r);
      this.vx=-this.vx;
      this.limit(true);
    }
    if(this.y-this.r<game.top){
      this.y=game.top+this.r;
      this.vy=-this.vy;
      this.limit(true);
    }
    if(this.y-this.r>game.bottom) this.reset();
  }

  bounce(p){
    let top=p.y-(p.h+game.background.lineW)/2;
    let half=(p.w+game.background.lineW)/2;
    if(this.vy>0 && this.x+this.r>=p.x-half && this.x-this.r<=p.x+half &&
       this.y+this.r>=top && this.y-this.r<=p.y+p.h/2){
      this.y=top-this.r;
      let a=-PI/2+constrain((this.x-p.x)/(p.w/2),-1,1)*PI/4;
      this.vx=this.speed*cos(a);
      this.vy=this.speed*sin(a);
    }
  }

  display(){
    noStroke();
    if(game.state==2){ fill(255,100,70,160); ellipse(this.x,this.y,this.r*6); }
    if(this.img) image(this.img,this.x,this.y,this.r*2,this.r*2);
    else{ fill(245); ellipse(this.x,this.y,this.r*2); }
  }
}

class Target {
  constructor(x,y){
    this.img=null;
    this.loadPicture();
    this.x=x;
    this.y=y;
    this.active=true;
    this.yellow=false;
    this.size=unit*.075;
    this.left=x-width*.045;
    this.right=x+width*.045;
    this.top=height*.26;
    this.bottom=height*.4;
    this.falling=false;
    this.fallVY=0;
    this.gravity=height*.00008;
    this.fallSpeed=height*.003;
    let s=unit*(.00045+game.stage*.00012);
    this.vx=random(-s,s);
    this.vy=random(-s,s);
  }

  async loadPicture(){ this.img=await loadImage("square.png"); }

  turnYellow(){
    this.active=true;
    this.yellow=true;
    this.size=unit*.035;
    this.homeX=this.x;
    this.homeY=this.y;
    this.oldY=this.y;
  }

  update(){
    if(!this.active) return;
    this.oldY=this.y;
    if(this.falling){
      this.fallVY=constrain(this.fallVY+this.gravity,0,this.fallSpeed);
      this.y+=this.fallVY;
    }else{
      this.x+=this.vx;
      this.y+=this.vy;
      if(this.x<this.left || this.x>this.right){
        this.x=constrain(this.x,this.left,this.right);
        this.vx=-this.vx;
      }
      if(this.y<this.top || this.y>this.bottom){
        this.y=constrain(this.y,this.top,this.bottom);
        this.vy=-this.vy;
      }
    }
  }

  hit(b){
    let x=constrain(b.x,this.x-this.size/2,this.x+this.size/2);
    let y=constrain(b.y,this.y-this.size/2,this.y+this.size/2);
    return this.active && !this.falling && dist(b.x,b.y,x,y)<=b.r;
  }

  restore(){
    this.x=this.homeX;
    this.y=this.homeY;
    this.oldY=this.y;
    this.fallVY=0;
    this.falling=false;
  }

  land(p){
    let top=p.y-p.h/2,oldTop=p.oldY-p.h/2;
    return this.falling && this.x+this.size/2>=p.x-p.w/2 && this.x-this.size/2<=p.x+p.w/2 &&
           this.oldY+this.size/2<=oldTop && this.y+this.size/2>=top;
  }

  display(){
    if(!this.active) return;
    if(this.yellow){
      stroke(255,240,160);
      fill(255,185,65);
      rect(this.x-this.size/2,this.y-this.size/2,this.size,this.size);
    }else if(this.img) image(this.img,this.x,this.y,this.size,this.size);
    else{ fill(80,220,170); rect(this.x-this.size/2,this.y-this.size/2,this.size,this.size); }
  }
}

class Bomb {
  constructor(type){
    this.img=null;
    this.loadPicture();
    this.type=type;
    this.r=unit*.045;
    this.x=width*(.76-type*.52);
    this.y=height*.45;
    this.speed=unit*(.0015+game.stage*.00015);
    this.fallSpeed=height*.001;
  }

  async loadPicture(){ this.img=await loadImage("bomb.png"); }

  update(ball){
    if(this.type==0){
      this.y+=this.fallSpeed;
      if(this.y-this.r>game.bottom){
        this.y=game.top-this.r;
        this.x=random(this.r,width-this.r);
      }
    }else{
      let d=dist(this.x,this.y,ball.x,ball.y);
      if(d>0){
        this.x+=(ball.x-this.x)/d*this.speed;
        this.y+=(ball.y-this.y)/d*this.speed;
      }
    }
  }

  hit(b){ return dist(this.x,this.y,b.x,b.y)<this.r+b.r; }

  display(){
    noStroke();
    if(this.img) image(this.img,this.x,this.y,this.r*2,this.r*2);
    else{ fill(240,90,100); ellipse(this.x,this.y,this.r*2); }
  }
}

class Bullet {
  constructor(p){
    this.r=unit*.008;
    this.x=p.x;
    this.y=p.y-p.h/2;
    this.speed=unit*.012;
    this.vx=this.speed*cos(p.angle);
    this.vy=this.speed*sin(p.angle);
  }

  update(){ this.x+=this.vx; this.y+=this.vy; }

  outside(){ return this.x<-this.r || this.x>width+this.r || this.y<-this.r || this.y>height+this.r; }

  display(){ noStroke(); fill(255,220,100); ellipse(this.x,this.y,this.r*2); }
}

class Game {
  constructor(){
    this.stage=1;
    this.lastStage=3;
    this.state=-1;
    this.effects=[false,false,false];
    this.repaired=[];
    this.repairOrder=[1,7,0,4,2,6,3,5,8];
    this.background=new Background();
    this.player=new Player();
    this.ball=new Ball();
    this.top=height*.2;
    this.bottom=height*.92;
    this.turn=PI/18;
    this.title="CITY REPAIR";
    this.ballTask="공으로 초록 과녁을 모두 맞히세요";
    this.shootTask="노란 네모를 쏜 뒤 떨어지는 부품을 판으로 받으세요";
    this.messages=["ENTER: 시작","","","공이 폭탄에 닿았습니다","ALL CLEAR"];
  }

  reset(){
    this.shooting=false;
    this.ammo=3;
    this.count=this.stage+1;
    this.collected=0;
    this.targets=[];
    this.bombs=[];
    this.bullets=[];
    this.player.reset();
    this.ball.reset();
    let first=0;
    for(let s=1;s<this.stage;s++) first+=s+1;
    this.first=first;
    for(let i=0;i<this.count;i++){
      let id=this.repairOrder[first+i];
      this.repaired[id]=false;
      this.targets[i]=new Target(width*(i+1)/(this.count+1),height*(.28+(i%2)*.065));
    }
    for(let i=0;i<this.stage-1;i++) this.bombs[i]=new Bomb(i);
  }

  update(){
    if(this.state!=0) return;
    this.player.update();
    if(this.shooting){
      this.updateBullets();
      this.collectParts();
      if(this.targets.length==0) this.nextStage();
      return;
    }
    for(let i=0;i<this.targets.length;i++) this.targets[i].update();
    this.ball.update();
    if(!this.ball.active) return;
    for(let i=0;i<this.bombs.length;i++){
      this.bombs[i].update(this.ball);
      if(this.bombs[i].hit(this.ball)){
        this.state=2;
        this.play(1);
        return;
      }
    }
    this.ball.bounce(this.player);
    for(let i=0;i<this.targets.length;i++){
      if(this.targets[i].hit(this.ball)){
        this.ball.vy=-this.ball.vy;
        this.targets[i].active=false;
        this.play(0);
        break;
      }
    }
    let remaining=0;
    for(let i=0;i<this.targets.length;i++){
      if(this.targets[i].active) remaining++;
    }
    if(remaining==0) this.startShooting();
  }

  display(){
    for(let i=0;i<this.effects.length;i++){
      if(this.effects[i] && sounds[i]) sounds[i].play();
      this.effects[i]=false;
    }
    this.background.display();
    for(let i=0;i<this.targets.length;i++) this.targets[i].display();
    for(let i=0;i<this.bombs.length;i++) this.bombs[i].display();
    for(let i=0;i<this.bullets.length;i++) this.bullets[i].display();
    this.player.display();
    if(!this.shooting) this.ball.display();
    noStroke(); fill(245); textSize(unit*.033);
    text("NIGHT CITY - "+this.title,width/2,height*.04);
    textSize(unit*.024);
    let restored=0;
    for(let i=0;i<this.repaired.length;i++){
      if(this.repaired[i]) restored++;
    }
    text("STAGE "+this.stage+" / "+this.lastStage+"    복구 "+restored+" / "+this.background.xx.length+"    탄약 "+this.ammo,width/2,height*.09);
    let task=this.ballTask;
    if(this.shooting) task=this.shootTask;
    text(task,width/2,height*.135);
    text("판: 마우스·방향키 / 클릭: 공 출발·사격 / SPACE: 사격 / R: 현재 단계 재시작",width/2,height*.95);
    let mode="초록 과녁을 모두 없애면 사격 단계로 전환";
    if(this.shooting) mode="마우스로 판 이동 / A·D: 각도 조절 / 클릭·SPACE: 사격";
    text(mode,width/2,height*.98);
    if(this.state!=0){
      fill(15,17,31,240); rect(width*.08,height*.39,width*.84,height*.2);
      fill(this.background.c); textSize(unit*.045);
      text(this.messages[this.state+1],width/2,height*.46);
      fill(245); textSize(unit*.025);
      text("ENTER: 시작·재도전 / R: 재시작 / 단계 이동은 자동",width/2,height*.54);
    }
  }

  play(i){ this.effects[i]=true; }

  click(x,y){
    if(x<0 || x>width || y<0 || y>height) return;
    if(y<height*.065){ this.background.change(); return; }
    if(this.state!=0) return;
    this.player.update();
    if(this.shooting) this.fire();
    else if(!this.ball.active) this.ball.launch();
  }

  press(k){
    switch(k){
      case "Enter":
        if(this.state==-1 || this.state==2){ this.reset(); this.state=0; }
        break;
      case "r": case "R":
        if(this.state==-1) break;
        if(this.state==3){ this.stage=1; this.repaired=[]; }
        this.reset(); this.state=0;
        break;
      case "a": case "A":
        if(this.state!=0 || !this.shooting) break;
        this.player.turn(-this.turn);
        break;
      case "d": case "D":
        if(this.state!=0 || !this.shooting) break;
        this.player.turn(this.turn);
        break;
      case " ": this.fire(); break;
    }
  }

  startShooting(){
    this.shooting=true;
    this.ball.reset();
    this.bombs=[];
    for(let i=0;i<this.targets.length;i++){
      this.targets[i].turnYellow();
    }
  }

  collectParts(){
    for(let i=this.targets.length-1;i>=0;i--){
      let part=this.targets[i];
      part.update();
      if(part.land(this.player)){
        this.collected++;
        let id=this.repairOrder[this.first+this.collected-1];
        this.repaired[id]=true;
        this.ammo++;
        this.player.grow();
        this.targets.splice(i,1);
        this.play(0);
      }else if(part.y-part.size/2>this.bottom){
        part.restore();
      }
    }
  }

  fire(){
    if(this.state!=0 || !this.shooting || this.ammo<=0) return;
    this.bullets.push(new Bullet(this.player));
    this.ammo--;
  }

  updateBullets(){
    for(let i=this.bullets.length-1;i>=0;i--){
      this.bullets[i].update();
      if(this.bullets[i].outside()) this.bullets.splice(i,1);
      else{
        for(let j=this.targets.length-1;j>=0;j--){
          if(this.targets[j].hit(this.bullets[i])){
            this.targets[j].falling=true;
            this.bullets.splice(i,1);
            this.play(1);
            break;
          }
        }
      }
    }
  }

  nextStage(){
    this.play(2);
    if(this.stage<this.lastStage){ this.stage++; this.reset(); }
    else this.state=3;
  }
}
