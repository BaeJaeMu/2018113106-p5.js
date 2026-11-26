let canvasW=800,canvasH=600,unit,game;
let READY=-1,PLAY=0,SHOOT=1,DELIVER=2,LOSE=3,CLEAR=4;
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
  game.control();
  game.update();
  game.display();
}
function mousePressed(){ game.click(mouseX,mouseY); }
function mouseDragged(){
  if(game.state==DELIVER) game.delivery.build(mouseX,mouseY);
}
function keyPressed(){ game.press(key); return false; }
async function loadEffect(i){ sounds[i]=await loadSound(soundFiles[i]); }
function hitRectangle(ball,x,y,w,h){
  let nearX=constrain(ball.x,x-w/2,x+w/2);
  let nearY=constrain(ball.y,y-h/2,y+h/2);
  return dist(ball.x,ball.y,nearX,nearY)<=ball.r;
}
class Background {
  constructor(){
    this.sky=0; this.colors=[[80,215,235],[180,120,230],[235,120,190]];
    this.bg=[[67,68,145],[78,55,143],[43,38,100]]; this.c=color(80,215,235);
    this.xx=[.029,.121,.214,.314,.459,.6,.7,.8,.9];
    this.ww=[.079,.083,.079,.083,.083,.083,.079,.083,.071];
    this.hh=[.218,.273,.236,.264,.373,.255,.227,.282,.209];
    this.sx=[.05,.107,.164,.229,.3,.364,.65,.714,.879,.943];
    this.sy=[.1,.164,.082,.142,.191,.113,.105,.167,.136,.091]; this.floor=height*.62;
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
    this.baseW=width*.17; this.maxW=width*.27;
    this.growth=width*.025; this.h=height*.025;
    this.minY=height*.22; this.maxY=height*.86;
    this.speed=width*.01; this.accel=width*.0025;
    this.friction=.8; this.gunSize=unit*.018;
    this.gunLength=unit*.055; this.minAngle=-PI+.1;
    this.maxAngle=-.1;
  }
  reset(){
    this.w=this.baseW; this.x=width/2;
    this.y=this.maxY; this.oldY=this.y;
    this.vx=0; this.vy=0;
    this.mx=mouseX; this.my=mouseY;
    this.angle=-PI/2;
  }
  update(){
    this.oldY=this.y;
    if(mouseX>=0 && mouseX<=width &&
       mouseY>=0 && mouseY<=height &&
       (mouseX!=this.mx || mouseY!=this.my)){
      this.x=mouseX; this.y=mouseY;
      this.vx=0; this.vy=0;
    }
    if(keyIsDown(LEFT_ARROW)) this.vx-=this.accel;
    if(keyIsDown(RIGHT_ARROW)) this.vx+=this.accel;
    if(keyIsDown(UP_ARROW)) this.vy-=this.accel;
    if(keyIsDown(DOWN_ARROW)) this.vy+=this.accel;
    this.vx=constrain(this.vx*this.friction,-this.speed,this.speed);
    this.vy=constrain(this.vy*this.friction,-this.speed,this.speed);
    this.x=constrain(this.x+this.vx,this.w/2,width-this.w/2);
    this.y=constrain(this.y+this.vy,this.minY,this.maxY); this.mx=mouseX;
    this.my=mouseY;
  }
  grow(){
    this.w=constrain(this.w+this.growth,this.baseW,this.maxW);
    this.x=constrain(this.x,this.w/2,width-this.w/2);
  }
  turn(amount){ this.angle=constrain(this.angle+amount,this.minAngle,this.maxAngle); }
  display(){
    stroke(game.background.c);
    strokeWeight(game.background.lineW);
    fill(31,35,66);
    rect(this.x-this.w/2,this.y-this.h/2,this.w,this.h);
    if(game.state==SHOOT){
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
    this.r=unit*.018; this.gravity=height*.000134;
    this.startVX=width*.0018; this.startVY=-height*.01125;
    this.speed=height*.01485;
  }
  async loadPicture(){ this.img=await loadImage("circle1.png"); }
  reset(){
    this.x=game.player.x; this.y=game.player.y-game.player.h/2-this.r;
    this.vx=0; this.vy=0;
    this.active=false;
  }
  launch(){
    this.reset();
    this.vx=this.startVX;
    if(random(1)<.5) this.vx=-this.vx;
    this.vy=this.startVY; this.active=true;
  }
  limit(force){
    let s=dist(0,0,this.vx,this.vy);
    if(s>0 && (force || s>this.speed)){
      this.vx=this.vx/s*this.speed; this.vy=this.vy/s*this.speed;
    }
  }
  update(){
    if(!this.active){ this.reset(); return; }
    this.vy+=this.gravity;
    this.limit(false);
    this.x+=this.vx; this.y+=this.vy;
    if(this.x<this.r || this.x>width-this.r){
      this.x=constrain(this.x,this.r,width-this.r); this.vx=-this.vx;
      this.limit(true);
    }
    if(this.y-this.r<game.top){
      this.y=game.top+this.r; this.vy=-this.vy;
      this.limit(true);
    }
    if(this.y-this.r>game.bottom){ game.damage(1); this.reset(); }
  }
  bounce(p){
    let top=p.y-(p.h+game.background.lineW)/2;
    let half=(p.w+game.background.lineW)/2;
    if(this.vy>0 && this.x+this.r>=p.x-half && this.x-this.r<=p.x+half &&
       this.y+this.r>=top && this.y-this.r<=p.y+p.h/2){
      this.y=top-this.r;
      let a=-PI/2+constrain((this.x-p.x)/(p.w/2),-1,1)*PI/4;
      this.vx=this.speed*cos(a); this.vy=this.speed*sin(a);
    }
  }
  display(){
    noStroke();
    if(game.state==LOSE){ fill(255,100,70,160); ellipse(this.x,this.y,this.r*6); }
    if(this.img) image(this.img,this.x,this.y,this.r*2,this.r*2);
    else{ fill(245); ellipse(this.x,this.y,this.r*2); }
  }
}
class Target {
  constructor(x,y){
    this.img=null;
    this.loadPicture();
    this.x=x; this.y=y; this.active=true; this.yellow=false;
    this.size=unit*.075; this.left=x-width*.045; this.right=x+width*.045;
    this.top=height*.26; this.bottom=height*.4;
    this.falling=false; this.fallVY=0;
    this.gravity=height*.00008; this.fallSpeed=height*.003;
    let speed=unit*(.00045+game.stage*.00012);
    this.vx=random(-speed,speed); this.vy=random(-speed,speed);
  }
  async loadPicture(){ this.img=await loadImage("square.png"); }
  turnYellow(){
    this.active=true; this.yellow=true; this.size=unit*.035;
    this.homeX=this.x; this.homeY=this.y; this.oldY=this.y;
  }
  update(){
    if(!this.active) return;
    this.oldY=this.y;
    if(this.falling){
      this.fallVY=constrain(this.fallVY+this.gravity,0,this.fallSpeed);
      this.y+=this.fallVY;
    }else{
      this.x+=this.vx; this.y+=this.vy;
      if(this.x<this.left || this.x>this.right){
        this.x=constrain(this.x,this.left,this.right); this.vx=-this.vx;
      }
      if(this.y<this.top || this.y>this.bottom){
        this.y=constrain(this.y,this.top,this.bottom); this.vy=-this.vy;
      }
    }
  }
  hit(ball){
    return this.active && !this.falling && hitRectangle(ball,this.x,this.y,this.size,this.size);
  }
  restore(){
    this.x=this.homeX; this.y=this.homeY; this.oldY=this.y;
    this.fallVY=0; this.falling=false;
  }
  land(p){
    return this.falling && this.x+this.size/2>=p.x-p.w/2 && this.x-this.size/2<=p.x+p.w/2 &&
      this.oldY+this.size/2<=p.oldY-p.h/2 && this.y+this.size/2>=p.y-p.h/2;
  }
  display(){
    if(!this.active) return;
    if(!this.yellow && this.img) image(this.img,this.x,this.y,this.size,this.size);
    else{
      stroke(255,240,160); fill(80,220,170);
      if(this.yellow) fill(255,185,65);
      rect(this.x-this.size/2,this.y-this.size/2,this.size,this.size);
    }
  }
}
class Bomb {
  constructor(type){
    this.img=null;
    this.loadPicture();
    this.type=type; this.r=unit*.045;
    this.x=width*(.76-type*.52); this.y=height*.45;
    this.speed=unit*(.0015+game.stage*.00015); this.fallSpeed=height*.001;
  }
  async loadPicture(){ this.img=await loadImage("bomb.png"); }
  update(ball){
    if(this.type==0){
      this.y+=this.fallSpeed;
      if(this.y-this.r>game.bottom){
        this.y=game.top-this.r; this.x=random(this.r,width-this.r);
      }
    }else{
      let d=dist(this.x,this.y,ball.x,ball.y);
      if(d>0){
        this.x+=(ball.x-this.x)/d*this.speed; this.y+=(ball.y-this.y)/d*this.speed;
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
    this.r=unit*.008; this.x=p.x;
    this.y=p.y-p.h/2; this.speed=unit*.012;
    this.vx=this.speed*cos(p.angle); this.vy=this.speed*sin(p.angle);
  }
  update(){ this.x+=this.vx; this.y+=this.vy; }
  outside(){ return this.x<-this.r || this.x>width+this.r || this.y<-this.r || this.y>height+this.r; }
  display(){ noStroke(); fill(255,220,100); ellipse(this.x,this.y,this.r*2); }
}
class Game {
  constructor(){
    this.stage=1; this.lastStage=3; this.state=READY;
    this.repaired=[]; this.repairOrder=[1,7,0,4,2,6,3,5,8];
    this.background=new Background(); this.player=new Player(); this.ball=new Ball();
    this.top=height*.2; this.bottom=height*.92; this.turn=PI/18;
    this.maxLife=3; this.startAmmo=3;
    this.effects=[false,false,false]; this.soundFrame=[-1,-1,-1];
  }
  reset(){
    this.life=this.maxLife; this.ammo=this.startAmmo;
    this.count=this.stage+1; this.remaining=this.count; this.first=0;
    this.targets=[]; this.bombs=[]; this.bullets=[];
    this.delivery=null;
    this.player.reset(); this.ball.reset();
    for(let s=1;s<this.stage;s++) this.first+=s+1;
    for(let i=0;i<this.count;i++){
      let id=this.repairOrder[this.first+i];
      this.repaired[id]=false;
      this.targets.push(new Target(width*(i+1)/(this.count+1),height*(.28+i%2*.065)));
    }
    for(let i=0;i<this.stage-1;i++) this.bombs.push(new Bomb(i));
  }
  control(){
    if(this.state==PLAY || this.state==SHOOT) this.player.update();
    else if(this.state==DELIVER) this.delivery.control();
  }
  update(){
    switch(this.state){
      case PLAY: this.updateBall(); break;
      case SHOOT: this.updateShooting(); break;
      case DELIVER: this.delivery.update(); break;
    }
  }
  updateBall(){
    for(let i=0;i<this.targets.length;i++) this.targets[i].update();
    this.ball.update();
    if(!this.ball.active || this.state!=PLAY) return;
    for(let i=0;i<this.bombs.length;i++){
      this.bombs[i].update(this.ball);
      if(this.bombs[i].hit(this.ball)){
        this.damage(1); this.ball.reset(); return;
      }
    }
    this.ball.bounce(this.player);
    for(let i=0;i<this.targets.length;i++){
      if(this.targets[i].hit(this.ball)){
        this.targets[i].active=false; this.remaining--; this.ball.vy=-this.ball.vy;
        this.play(0); break;
      }
    }
    if(this.remaining==0){
      this.bombs=[]; this.ball.reset();
      for(let i=0;i<this.targets.length;i++) this.targets[i].turnYellow();
      this.state=SHOOT;
    }
  }
  updateShooting(){
    for(let i=this.targets.length-1;i>=0;i--){
      let part=this.targets[i];
      part.update();
      if(part.land(this.player)){
        this.targets.splice(i,1); this.ammo++;
        this.player.grow(); this.play(0);
      }else if(part.y-part.size/2>this.bottom) part.restore();
    }
    for(let i=this.bullets.length-1;i>=0;i--){
      let bullet=this.bullets[i];
      bullet.update();
      if(bullet.outside()) this.bullets.splice(i,1);
      else{
        for(let j=0;j<this.targets.length;j++){
          if(this.targets[j].hit(bullet)){
            this.targets[j].falling=true;
            this.bullets.splice(i,1); this.play(1); break;
          }
        }
      }
    }
    if(this.targets.length==0){
      this.delivery=new Delivery(this.count);
      this.bullets=[];
      this.state=DELIVER;
    }else if(this.ammo==0 && this.bullets.length==0){
      let falling=false;
      for(let i=0;i<this.targets.length;i++) if(this.targets[i].falling) falling=true;
      if(!falling){ this.damage(1); this.ammo=this.startAmmo; }
    }
  }
  fire(){
    if(this.state!=SHOOT || this.ammo<=0) return;
    this.bullets.push(new Bullet(this.player)); this.ammo--;
  }
  damage(amount){
    this.life=constrain(this.life-amount,0,this.life); this.play(1);
    if(this.life<=0) this.state=LOSE;
  }
  nextStage(){
    this.play(2);
    if(this.stage<this.lastStage){ this.stage++; this.reset(); this.state=PLAY; }
    else this.state=CLEAR;
  }
  click(x,y){
    if(x<0 || x>width || y<0 || y>height) return;
    if(y<height*.065){ this.background.change(); return; }
    if(this.state==PLAY && !this.ball.active){ this.player.update(); this.ball.launch(); }
    else if(this.state==SHOOT) this.fire();
    else if(this.state==DELIVER) this.delivery.open(x,y);
  }
  press(k){
    switch(k){
      case "Enter":
        if(this.state==READY || this.state==LOSE){ this.reset(); this.state=PLAY; }
        break;
      case "r": case "R":
        if(this.state==READY) break;
        if(this.state==CLEAR){ this.stage=1; this.repaired=[]; }
        this.reset(); this.state=PLAY; break;
      case "a": case "A":
        if(this.state==SHOOT) this.player.turn(-this.turn);
        break;
      case "d": case "D":
        if(this.state==SHOOT) this.player.turn(this.turn);
        break;
      case " ": this.fire(); break;
    }
  }
  play(i){ this.effects[i]=true; }
  show(objects){
    for(let i=0;i<objects.length;i++) objects[i].display();
  }
  display(){
    this.background.display();
    if(this.delivery!=null){
      this.delivery.display();
    }else{
      this.show(this.targets); this.show(this.bombs); this.show(this.bullets);
      this.player.display();
      if(this.state!=SHOOT) this.ball.display();
    }
    let restored=0;
    for(let i=0;i<this.repaired.length;i++) if(this.repaired[i]) restored++;
    noStroke(); fill(245); textSize(unit*.033);
    text("NIGHT CITY - CITY REPAIR",width/2,height*.04);
    textSize(unit*.024);
    text("STAGE "+this.stage+" / 3    복구 "+restored+" / 9    탄약 "+this.ammo+"    LIFE "+this.life,width/2,height*.09);
    let task="공으로 초록 과녁을 모두 맞히세요";
    let help="마우스: 판 이동 / 클릭: 공 출발 / R: 현재 단계 재시작";
    if(this.state==SHOOT){
      task="노란 과녁을 쏘고 떨어지는 부품을 판으로 받으세요";
      help="마우스: 판 이동 / A·D: 각도 / 클릭·SPACE: 발사";
    }else if(this.state==DELIVER){
      task="빈 구간에 발판을 놓고 오른쪽 배송 지점으로 이동하세요";
      help="← →: 이동 / ↑: 점프 / 마우스 드래그: 발판 배치";
    }
    text(task,width/2,height*.135);
    text(help,width/2,height*.95);
    text("ENTER: 시작·재도전 / R: 재시작",width/2,height*.985);
    if(this.state==READY || this.state==LOSE || this.state==CLEAR){
      fill(15,17,31,235); rect(width*.08,height*.39,width*.84,height*.2);
      fill(this.background.c); textSize(unit*.045);
      let message="ENTER: 시작";
      if(this.state==LOSE) message="생명력 소진 · ENTER: 재도전";
      else if(this.state==CLEAR) message="ALL CLEAR · R: 처음부터";
      text(message,width/2,height*.49);
    }
    for(let i=0;i<this.effects.length;i++){
      if(this.effects[i] && sounds[i] && frameCount>this.soundFrame[i]){
        sounds[i].play(); this.soundFrame[i]=frameCount;
      }
      this.effects[i]=false;
    }
  }
}
class Platform {
  constructor(x,y,w,speed){
    this.x=x; this.y=y; this.w=w; this.h=height*.018;
    this.speed=speed; this.oldX=x;
  }
  update(){ this.oldX=this.x; this.x+=this.speed; }
  land(p){
    let top=this.y-this.h/2;
    if(p.vy>=0 && p.x+p.r>this.x-this.w/2 && p.x-p.r<this.x+this.w/2 &&
       p.oldY+p.r<=top && p.y+p.r>=top){
      p.y=top-p.r; p.vy=0; p.grounded=true;
      p.x+=this.x-this.oldX;
      return true;
    }
    return false;
  }
  display(){
    stroke(110,230,255); fill(40,100,140);
    if(this.speed!=0) fill(150,100,190);
    rect(this.x-this.w/2,this.y-this.h/2,this.w,this.h);
  }
}
class SupplyTile {
  constructor(x,y,size){
    this.x=x; this.y=y; this.size=size; this.bomb=false; this.revealed=false;
  }
  contain(x,y){ return x>this.x && x<this.x+this.size && y>this.y && y<this.y+this.size; }
  display(){
    stroke(170,220,240); fill(45,70,110);
    rect(this.x,this.y,this.size,this.size);
    noStroke(); fill(255); textSize(this.size*.45);
    let label="?";
    if(this.revealed){
      label="+";
      if(this.bomb) label="X";
    }
    text(label,this.x+this.size/2,this.y+this.size/2);
  }
}
class Delivery {
  constructor(count){
    this.cargo=count; this.total=count; this.tail=[];
    this.r=unit*.018; this.speed=width*.004;
    this.gravity=height*.00045; this.jumpPower=-height*.0115;
    this.energyMax=7200; this.energy=this.energyMax;
    this.clock=0; this.period=300; this.rows=2; this.cols=2; this.dock=0; this.dockPeriod=20;
    this.stepX=width*.025; this.stepY=height*.025;
    this.gapLeft=width*.28; this.gapRight=width*.73;
    this.buildTop=height*.47; this.buildBottom=height*.8;
    this.startX=width*.14; this.startY=height*.76;
    this.goalX=width*.86; this.goalY=height*.5;
    this.platforms=[new Platform(this.startX,this.startY,width*.22,0),
      new Platform(width*.56,height*.61,width*.14,0),
      new Platform(this.goalX,this.goalY,width*.22,0)];
    this.bridges=[]; this.bridgeReady=[]; this.selectedBridge=0;
    for(let i=0;i<game.stage;i++){
      this.bridges.push(new Platform(width*(.38+i*.12),height*(.7-i*.05),width*.16,0));
      this.bridgeReady.push(false);
    }
    this.movers=[]; this.enemies=[]; this.grid=[];
    this.respawn();
    for(let row=0;row<this.rows;row++){
      this.grid[row]=[];
      for(let col=0;col<this.cols;col++){
        this.grid[row][col]=new SupplyTile(width*.75+col*height*.055,height*.81+row*height*.055,height*.05);
      }
    }
    this.grid[int(random(this.rows))][int(random(this.cols))].bomb=true;
    for(let i=0;i<game.stage;i++) this.enemies.push(new DeliveryHazard(i));
  }
  respawn(){
    this.x=this.startX; this.y=this.startY-height*.009-this.r;
    this.oldY=this.y; this.vy=0; this.grounded=true;
    this.jumpHeld=false; this.tail=[];
  }
  build(x,y){
    if(x<this.gapLeft || x>this.gapRight || y<this.buildTop || y>this.buildBottom) return;
    if(this.selectedBridge<0) return;
    let bridge=this.bridges[this.selectedBridge];
    bridge.x=int(x/this.stepX)*this.stepX;
    bridge.y=int(y/this.stepY)*this.stepY;
    bridge.oldX=bridge.x; this.bridgeReady[this.selectedBridge]=true;
  }
  control(){
    if(keyIsDown(LEFT_ARROW)) this.x-=this.speed;
    if(keyIsDown(RIGHT_ARROW)) this.x+=this.speed;
    let jump=keyIsDown(UP_ARROW);
    if(jump && !this.jumpHeld && this.grounded) this.vy=this.jumpPower;
    this.jumpHeld=jump;
  }
  update(){
    this.clock++; this.energy--;
    if(this.energy<=0){ game.damage(1); this.energy=this.energyMax; }
    if(game.state!=DELIVER) return;
    this.oldY=this.y;
    this.vy+=this.gravity; this.y+=this.vy;
    this.grounded=false;
    for(let i=0;i<this.platforms.length;i++) this.platforms[i].land(this);
    for(let i=0;i<this.bridges.length;i++){
      if(this.bridgeReady[i]) this.bridges[i].land(this);
    }
    if(this.clock%this.period==0 && this.movers.length==0){
      this.movers.push(new Platform(width,height*.68,width*.15,-width*.001));
    }
    for(let i=this.movers.length-1;i>=0;i--){
      this.movers[i].update(); this.movers[i].land(this);
      if(this.movers[i].x+this.movers[i].w/2<0) this.movers.splice(i,1);
    }
    this.x=constrain(this.x,this.r,width-this.r);
    if(this.y-this.r>game.bottom){ game.damage(1); this.respawn(); return; }
    for(let i=0;i<this.enemies.length;i++){
      this.enemies[i].update();
      if(this.enemies[i].hit(this)){ game.damage(1); this.respawn(); return; }
    }
    if(this.clock%5==0){
      this.tail.push(new Trail(this.x,this.y));
      if(this.tail.length>this.cargo*4) this.tail.shift();
    }
    if(this.grounded && this.x>this.goalX-width*.08 && this.y+this.r<this.goalY){
      this.dock++;
      if(this.dock%this.dockPeriod==0){
        let id=game.repairOrder[game.first+this.total-this.cargo];
        game.repaired[id]=true; this.cargo--; this.tail=[];
        game.play(0);
        if(this.cargo==0) game.nextStage();
      }
    }else this.dock=0;
  }
  open(x,y){
    this.selectedBridge=-1;
    for(let row=0;row<this.rows;row++){
      for(let col=0;col<this.cols;col++){
        let cell=this.grid[row][col];
        if(!cell.revealed && cell.contain(x,y)){
          cell.revealed=true;
          if(cell.bomb){
            game.ammo=constrain(game.ammo-2,0,game.ammo);
            game.damage(2);
          }else{
            game.ammo++; game.life++;
            this.energy=this.energyMax;
          }
          return;
        }
      }
    }
    let nearest=width+height;
    for(let i=0;i<this.bridges.length;i++){
      let bridge=this.bridges[i];
      let distance=dist(x,y,bridge.x,bridge.y);
      if(distance<nearest){ nearest=distance; this.selectedBridge=i; }
    }
    this.build(x,y);
  }
  display(){
    game.show(this.platforms);
    for(let i=0;i<this.bridges.length;i++){
      let bridge=this.bridges[i];
      if(this.bridgeReady[i]) bridge.display();
      else{
        noFill(); stroke(100,200,230);
        rect(bridge.x-bridge.w/2,bridge.y-bridge.h/2,bridge.w,bridge.h);
      }
      noStroke(); fill(210); textSize(unit*.022);
      if(this.bridges.length>1) text(i+1,bridge.x,bridge.y-height*.025);
    }
    if(!this.bridgeReady[0]){
      text("여기에 드래그해 발판 설치",this.bridges[0].x,this.bridges[0].y+height*.04);
    }
    game.show(this.movers);
    noStroke(); fill(100,240,170,160);
    rect(this.goalX-width*.08,this.goalY-height*.09,width*.16,height*.08);
    fill(245); textSize(unit*.023);
    text("배송",this.goalX,this.goalY-height*.055);
    for(let i=0;i<this.tail.length;i+=4){
      fill(255,200,80);
      ellipse(this.tail[i].x,this.tail[i].y,this.r*1.2);
    }
    fill(90,230,255); ellipse(this.x,this.y,this.r*2);
    game.show(this.enemies);
    for(let row=0;row<this.rows;row++){
      game.show(this.grid[row]);
    }
    noStroke(); fill(245); textSize(unit*.024);
    text("배송 부품 "+this.cargo+" / 보급칸 →",width*.5,height*.85);
    fill(30,45,70); rect(width*.08,height*.89,width*.5,height*.012);
    fill(100,240,170); rect(width*.08,height*.89,width*.5*this.energy/this.energyMax,height*.012);
  }
}
class Trail {
  constructor(x,y){ this.x=x; this.y=y; }
}
class DeliveryHazard {
  constructor(i){
    this.size=unit*.035; this.x=width*(.85-i*.18);
    this.y=height*(.57-i*.09); this.speed=width*(.0006+game.stage*.00012);
    if(i%2==1) this.speed=-this.speed;
  }
  update(){
    this.x+=this.speed;
    if(this.x>width+this.size) this.x=-this.size;
    else if(this.x<-this.size) this.x=width+this.size;
  }
  hit(p){
    return hitRectangle(p,this.x,this.y,this.size,this.size);
  }
  display(){
    noStroke(); fill(255,90,110);
    rect(this.x-this.size/2,this.y-this.size/2,this.size,this.size);
  }
}
