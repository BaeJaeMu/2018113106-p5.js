let canvasW=800,canvasH=600,unit,game;
let sounds=[];
let soundFiles=["catch.mp3","burst.mp3","claps.mp3"];

function setup(){
  createCanvas(canvasW,canvasH);
  imageMode(CENTER);
  textAlign(CENTER,CENTER);
  unit=width;
  if(height<unit) unit=height;
  game=new Game();
  game.resetStage();
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
    this.bg=[[67,68,145],[78,55,143],[43,38,100]];
    this.colors=[[80,215,235],[180,120,230],[235,120,190]];
    this.c=color(80,215,235);
    this.sx=[.05,.107,.164,.229,.3,.364,.65,.714,.879,.943];
    this.sy=[.1,.164,.082,.142,.191,.113,.105,.167,.136,.091];
    this.xx=[.029,.121,.214,.314,.459,.6,.7,.8,.9];
    this.ww=[.079,.083,.079,.083,.083,.083,.079,.083,.071];
    this.hh=[.218,.273,.236,.264,.373,.255,.227,.282,.209];
    this.cloudX=[.136,.193];
    this.cloudW=[.079,.1];
    this.cloudH=[.045,.062];
    this.floorY=height*.62;
    this.groundY=height*.92;
    this.thinLine=unit*.0015;
    this.normalLine=unit*.003;
    this.themeY=height*.075;
  }

  change(){
    this.sky=(this.sky+1)%this.bg.length;
    this.c=color(this.colors[this.sky][0],this.colors[this.sky][1],this.colors[this.sky][2]);
  }

  neon(w){
    stroke(this.c);
    strokeWeight(w);
  }

  display(){
    let b=this.bg[this.sky];
    background(b[0],b[1],b[2]);
    let mx=width*.807,my=height*.23,moonSize=unit*.25;
    noStroke();
    fill(205,110,185);
    ellipse(mx,my,moonSize);
    fill(222,142,202);
    ellipse(mx,my,moonSize*.88);
    if(this.sky==this.bg.length-1){
      fill(b[0],b[1],b[2]);
      ellipse(width*.85,height*.22,unit*.19);
    }
    stroke(238);
    strokeWeight(this.normalLine);
    for(let i=0;i<this.sx.length;i++) point(this.sx[i]*width,this.sy[i]*height);
    noFill();
    for(let i=0;i<this.cloudX.length;i++){
      arc(this.cloudX[i]*width,height*.25,this.cloudW[i]*width,this.cloudH[i]*height,PI,PI*2);
    }
    for(let i=0;i<this.xx.length;i++) this.construction(i);
    this.ground();
  }

  construction(i){
    let x=this.xx[i]*width,w=this.ww[i]*width,h=this.hh[i]*height,y=this.floorY-h;
    let side=width*.012,top=height*.025,bottom=height*.015,gap=height*.04;
    fill(27,29,68);
    if(i==4) fill(38,35,88);
    stroke(20,21,50);
    strokeWeight(this.normalLine);
    rect(x,y,w,h);
    this.neon(this.thinLine);
    for(let wy=y+top;wy<this.floorY-bottom;wy+=gap) line(x+side,wy,x+w-side,wy);
  }

  ground(){
    let top=this.floorY+height*.05;
    noStroke();
    fill(15,17,31);
    rect(0,this.floorY,width,height-this.floorY);
    fill(22,24,42);
    this.neon(this.normalLine);
    beginShape();
    vertex(width*.16,top);
    vertex(width*.84,top);
    vertex(width*.97,this.groundY);
    vertex(width*.03,this.groundY);
    endShape(CLOSE);
    line(0,this.groundY,width,this.groundY);
  }
}

class Player {
  constructor(){
    this.w=width*.19;
    this.h=height*.025;
    this.minY=height*.22;
    this.maxY=height*.87;
    this.accel=width*.0025;
    this.speed=width*.01;
    this.friction=.8;
    this.reset();
  }

  reset(){
    this.x=width/2;
    this.y=this.maxY;
    this.vx=0;
    this.vy=0;
    this.oldMouseX=mouseX;
    this.oldMouseY=mouseY;
  }

  update(){
    if(mouseX>=0 && mouseX<=width && mouseY>=0 && mouseY<=height){
      if(mouseIsPressed || mouseX!=this.oldMouseX || mouseY!=this.oldMouseY){
        this.x=mouseX;
        this.y=mouseY;
        this.vx=0;
        this.vy=0;
      }
    }
    this.oldMouseX=mouseX;
    this.oldMouseY=mouseY;
    if(keyIsDown(LEFT_ARROW)) this.vx-=this.accel;
    if(keyIsDown(RIGHT_ARROW)) this.vx+=this.accel;
    if(keyIsDown(UP_ARROW)) this.vy-=this.accel;
    if(keyIsDown(DOWN_ARROW)) this.vy+=this.accel;
    this.vx=constrain(this.vx*this.friction,-this.speed,this.speed);
    this.vy=constrain(this.vy*this.friction,-this.speed,this.speed);
    this.x=constrain(this.x+this.vx,this.w/2,width-this.w/2);
    this.y=constrain(this.y+this.vy,this.minY,this.maxY);
  }

  display(){
    fill(31,35,66);
    game.background.neon(game.background.normalLine);
    rect(this.x-this.w/2,this.y-this.h/2,this.w,this.h);
  }
}

class Ball {
  constructor(){
    this.imageFile="circle1.png";
    this.img=null;
    this.loadPicture();
    this.r=unit*.018;
    this.rate=.45;
    this.gravity=height*.00066*this.rate*this.rate;
    this.speed=width*.004*this.rate;
    this.launchVY=-height*.025*this.rate;
    this.bounceSpeed=height*.03*this.rate*1.1;
    this.angleLimit=PI/4;
    this.spinRate=.35;
    this.blastSize=unit*.14;
  }

  async loadPicture(){
    this.img=await loadImage(this.imageFile);
  }

  reset(){
    this.x=game.player.x;
    this.y=game.player.y-(game.player.h+game.background.normalLine)/2-this.r;
    this.vx=0;
    this.vy=0;
    this.angle=0;
    this.active=false;
    this.serve=false;
  }

  setSpeed(force){
    let velocity=dist(0,0,this.vx,this.vy);
    if(velocity>0 && (force || velocity>this.bounceSpeed)){
      this.vx=this.vx/velocity*this.bounceSpeed;
      this.vy=this.vy/velocity*this.bounceSpeed;
    }
  }

  update(){
    if(!this.active){
      this.x=game.player.x;
      this.y=game.player.y-(game.player.h+game.background.normalLine)/2-this.r;
    }
    if(this.serve){
      this.serve=false;
      if(!this.active){
        this.vx=this.speed;
        if(random(1)<.5) this.vx=-this.speed;
        this.vy=this.launchVY;
        this.active=true;
      }
    }
    if(!this.active) return;
    this.vy+=this.gravity;
    this.setSpeed(false);
    this.x+=this.vx;
    this.y+=this.vy;
    this.angle=(this.angle+this.vx/this.r*this.spinRate)%(PI*2);
    if(this.x<this.r || this.x>width-this.r){
      this.x=constrain(this.x,this.r,width-this.r);
      this.vx=-this.vx;
      this.setSpeed(true);
    }
    if(this.y<this.r){
      this.y=this.r;
      this.vy=-this.vy;
      this.setSpeed(true);
    }
    if(this.y-this.r>game.background.groundY) this.reset();
  }

  bounce(p){
    let top=p.y-(p.h+game.background.normalLine)/2;
    let half=(p.w+game.background.normalLine)/2;
    let touching=this.y+this.r>=top && this.y-this.r<=p.y+(p.h+game.background.normalLine)/2;
    if(this.vy>0 && this.x+this.r>=p.x-half && this.x-this.r<=p.x+half && touching){
      this.y=top-this.r;
      let offset=constrain((this.x-p.x)/(p.w/2),-1,1);
      let angle=-PI/2+offset*this.angleLimit;
      this.vx=this.bounceSpeed*cos(angle);
      this.vy=this.bounceSpeed*sin(angle);
    }
  }

  display(){
    if(game.state==2){
      noStroke();
      fill(255,110,50,180);
      ellipse(this.x,this.y,this.blastSize);
    }else{
      push();
      translate(this.x,this.y);
      rotate(this.angle);
      if(this.img) image(this.img,0,0,this.r*2,this.r*2);
      else{
        noStroke();
        fill(game.background.c);
        ellipse(0,0,this.r*2);
      }
      stroke(245);
      strokeWeight(game.background.normalLine);
      line(-this.r*.6,0,this.r*.6,0);
      pop();
    }
  }
}

class Target {
  constructor(x,y){
    this.imageFile="square.png";
    this.img=null;
    this.loadPicture();
    this.x=x;
    this.y=y;
    this.baseX=x;
    this.baseY=y;
    this.size=unit*.085;
    this.speed=width*.00025;
    this.range=width*.025;
    this.noiseRange=height*.012;
    this.noiseRate=.008;
    this.noiseTime=random(100);
    this.restoreTime=1800;
    this.active=true;
    this.goneTime=0;
  }

  async loadPicture(){
    this.img=await loadImage(this.imageFile);
  }

  display(){
    if(!this.active) return;
    if(this.img) image(this.img,this.x,this.y,this.size,this.size);
    else{
      noStroke();
      fill(80,200,130);
      rect(this.x-this.size/2,this.y-this.size/2,this.size,this.size);
    }
  }

  update(){
    if(!this.active && millis()-this.goneTime>=this.restoreTime){
      this.active=true;
      this.x=this.baseX+random(-this.range,this.range);
    }
    this.noiseTime+=this.noiseRate;
    this.y=this.baseY+(noise(this.noiseTime)-.5)*this.noiseRange;
    this.x+=this.speed;
    if(this.x<this.baseX-this.range || this.x>this.baseX+this.range){
      this.x=constrain(this.x,this.baseX-this.range,this.baseX+this.range);
      this.speed=-this.speed;
    }
  }

  check(x,y,r){
    if(this.active && x+r>=this.x-this.size/2 && x-r<=this.x+this.size/2 &&
       y+r>=this.y-this.size/2 && y-r<=this.y+this.size/2){
      this.active=false;
      this.goneTime=millis();
      game.ball.vy=-game.ball.vy;
      game.charge(int(random(game.diceSides))+1);
    }
  }
}

class Bomb {
  constructor(i,stage){
    this.imageFile="bomb.png";
    this.img=null;
    this.loadPicture();
    this.type=i;
    this.x=width*(.78-i*.56);
    this.y=height*.44;
    this.r=unit*.05;
    this.chaseSpeed=unit*(.00055+stage*.0001);
    this.patrolSpeed=width*.001;
  }

  async loadPicture(){
    this.img=await loadImage(this.imageFile);
  }

  update(){
    if(this.type==0){
      let d=dist(this.x,this.y,game.ball.x,game.ball.y);
      if(d>0){
        this.x+=(game.ball.x-this.x)/d*this.chaseSpeed;
        this.y+=(game.ball.y-this.y)/d*this.chaseSpeed;
      }
    }else{
      this.x-=this.patrolSpeed;
      if(this.x+this.r<0) this.x=width+this.r;
    }
  }

  check(x,y,r){
    if(dist(x,y,this.x,this.y)<r+this.r){
      game.ball.active=false;
      game.state=2;
      game.effect=1;
    }
  }

  display(){
    if(this.img) image(this.img,this.x,this.y,this.r*2,this.r*2);
    else{
      noStroke();
      fill(235,90,110);
      ellipse(this.x,this.y,this.r*2);
    }
    noFill();
    stroke(235,90,110);
    strokeWeight(game.background.thinLine);
    ellipse(this.x,this.y,this.r*2);
  }
}

class Cards {
  constructor(){
    this.imageFile="card.png";
    this.img=null;
    this.loadPicture();
    this.stage=0;
    this.count=3;
    this.x=[];
    this.y=height*.53;
    this.w=unit*.16;
    this.h=unit*.23;
    this.gap=width*.21;
    for(let i=0;i<this.count;i++) this.x[i]=width/2+(i-(this.count-1)/2)*this.gap;
  }

  async loadPicture(){
    this.img=await loadImage(this.imageFile);
  }

  reset(stage){
    if(this.stage!=stage){
      this.bombIndex=int(random(this.count));
      this.stage=stage;
    }
  }

  display(){
    for(let i=0;i<this.count;i++){
      if(this.img) image(this.img,this.x[i],this.y,this.w,this.h);
      else{
        noStroke();
        fill(35,45,70);
        rect(this.x[i]-this.w/2,this.y-this.h/2,this.w,this.h);
      }
      noFill();
      game.background.neon(game.background.normalLine);
      rect(this.x[i]-this.w/2,this.y-this.h/2,this.w,this.h);
      noStroke();
      fill(245);
      text("?",this.x[i],this.y);
    }
  }

  select(x,y){
    for(let i=0;i<this.count;i++){
      if(x>=this.x[i]-this.w/2 && x<=this.x[i]+this.w/2 &&
         y>=this.y-this.h/2 && y<=this.y+this.h/2){
        if(i==this.bombIndex){
          game.resetStage();
          game.state=0;
          game.notice="폭탄 카드! 다시 충전하세요 · 카드 위치 유지";
          game.effect=1;
        }else{
          game.maze.reset();
          game.state=4;
          game.effect=0;
        }
        break;
      }
    }
  }
}

class Maze {
  constructor(){
    this.map=[[0,0,1,0,0],[1,0,1,0,1],[0,0,0,0,0],[0,1,1,1,0],[0,0,1,0,0]];
    this.size=unit*.055;
    this.x=width/2-this.map[0].length*this.size/2;
    this.y=height*.4;
    this.reset();
  }

  reset(){
    this.routeX=0;
    this.routeY=0;
  }

  display(){
    for(let y=0;y<this.map.length;y++){
      for(let x=0;x<this.map[y].length;x++){
        fill(15,25,40);
        if(this.map[y][x]==1) fill(70,85,110);
        if(x==this.map[0].length-1 && y==this.map.length-1) fill(255,210,80);
        stroke(80);
        rect(this.x+x*this.size,this.y+y*this.size,this.size,this.size);
      }
    }
    noStroke();
    fill(game.background.c);
    ellipse(this.x+(this.routeX+.5)*this.size,this.y+(this.routeY+.5)*this.size,this.size*.5);
  }

  move(k){
    let x=this.routeX,y=this.routeY;
    if(k==LEFT_ARROW) x--;
    if(k==RIGHT_ARROW) x++;
    if(k==UP_ARROW) y--;
    if(k==DOWN_ARROW) y++;
    x=constrain(x,0,this.map[0].length-1);
    y=constrain(y,0,this.map.length-1);
    if(this.map[y][x]==0){ this.routeX=x; this.routeY=y; }
    if(this.routeX==this.map[0].length-1 && this.routeY==this.map.length-1){
      if(game.stage<game.lastStage){
        game.stage++;
        game.resetStage();
        game.state=0;
        game.notice="미로 통과! STAGE "+game.stage;
      }else game.state=3;
      game.effect=2;
    }
  }
}

class Game {
  constructor(){
    this.stage=1;
    this.lastStage=3;
    this.state=-1;
    this.effect=-1;
    this.energyBase=3;
    this.energyStep=3;
    this.diceSides=3;
    this.background=new Background();
    this.player=new Player();
    this.ball=new Ball();
    this.cards=new Cards();
    this.maze=new Maze();

    this.targets=[];
    this.bombs=[];

    this.titleY=height*.045;
    this.infoY=height*.1;
    this.noticeY=height*.19;
    this.helpY=height*.96;
    this.titleSize=unit*.035;
    this.smallSize=unit*.025;
    this.bigSize=unit*.045;
    this.panelX=width*.07;
    this.panelY=height*.28;
    this.panelW=width*.86;
    this.panelH=height*.48;
    this.messageY=height*.34;
    this.guideY=height*.71;
    this.barX=width*.25;
    this.barY=height*.14;
    this.barW=width*.5;
    this.barH=height*.018;
    this.messages=["ENTER: 시작","","카드 선택","공이 폭탄에 닿았습니다","ALL CLEAR","미로 탈출"];
    this.guides=["공 반사 → 에너지 충전 → 카드 → 미로","","폭탄 카드: 다시 충전 / 정상 카드: 미로 이동","ENTER 또는 R: 같은 스테이지 재시작","R: 처음부터","방향키로 노란 출구에 도착하세요"];
  }

  resetStage(){
    this.player.reset();
    this.ball.reset();

    this.targets=[];
    let count=this.stage+1;

    for(let i=0;i<count;i++){
      let x=width*(i+1)/(count+1),y=height*(.28+(i%2)*.065);
      this.targets[i]=new Target(x,y);
    }

    this.bombs=[];

    for(let i=0;i<this.stage-1;i++){
      this.bombs[i]=new Bomb(i,this.stage);
    }

    this.energyNeed=this.stage*this.energyStep+this.energyBase;
    this.energy=0;
    this.dice=0;
    this.notice="";
    this.cards.reset(this.stage);
  }

  update(){
    if(this.state!=0) return;

    this.player.update();

    for(let i=0;i<this.targets.length;i++){
      this.targets[i].update();
    }

    this.ball.update();
    if(!this.ball.active) return;

    this.ball.bounce(this.player);

    for(let i=0;i<this.bombs.length;i++){
      this.bombs[i].update();
    }

    for(let i=0;i<this.bombs.length;i++){
      this.bombs[i].check(this.ball.x,this.ball.y,this.ball.r);
      if(this.state==2) return;
    }

    for(let i=0;i<this.targets.length;i++){
      if(this.targets[i].active){
        this.targets[i].check(this.ball.x,this.ball.y,this.ball.r);
        if(!this.targets[i].active) break;
      }
    }
  }

  display(){
    this.background.display();

    for(let i=0;i<this.targets.length;i++){
      this.targets[i].display();
    }

    this.ball.display();

    for(let i=0;i<this.bombs.length;i++){
      this.bombs[i].display();
    }

    this.player.display();
    this.displayText();

    if(this.effect>=0){
      if(sounds[this.effect]) sounds[this.effect].play();
      this.effect=-1;
    }
  }

  displayText(){
    noStroke();
    fill(245);
    textSize(this.titleSize);
    text("NIGHT CITY - POWER MAZE",width/2,this.titleY);
    textSize(this.smallSize);
    text("STAGE "+this.stage+" / "+this.lastStage+"   충전 "+this.energy+" / "+this.energyNeed+"   최근 획득 +"+this.dice,width/2,this.infoY);
    fill(45,48,70);
    rect(this.barX,this.barY,this.barW,this.barH);
    fill(this.background.c);
    rect(this.barX,this.barY,this.barW*this.energy/this.energyNeed,this.barH);
    fill(245);
    text(this.notice,width/2,this.noticeY);
    text("판: 마우스·방향키 / 클릭: 공 출발 / R: 현재 단계 재시작",width/2,this.helpY);
    if(this.state==0) return;
    fill(15,17,31,240);
    rect(this.panelX,this.panelY,this.panelW,this.panelH);
    fill(this.background.c);
    textSize(this.bigSize);
    text(this.messages[this.state+1],width/2,this.messageY);
    if(this.state==1) this.cards.display();
    if(this.state==4) this.maze.display();
    noStroke();
    fill(245);
    textSize(this.smallSize);
    text(this.guides[this.state+1],width/2,this.guideY);
  }

  charge(amount){
    this.dice=amount;
    this.energy+=amount;
    this.effect=0;
    this.notice="과녁 명중! +"+amount;
    if(this.energy>=this.energyNeed){
      this.energy=this.energyNeed;
      this.state=1;
    }
  }

  click(x,y){
    if(this.state==1) this.cards.select(x,y);
    else if(this.state==0 && !this.ball.active && x>=0 && x<width &&
            y>=this.player.minY && y<=this.background.groundY){
      this.ball.serve=true;
    }else if(x>=0 && x<width && y>=0 && y<this.background.themeY){
      this.background.change();
    }
  }

  press(k){
    if(k==LEFT_ARROW || k==RIGHT_ARROW || k==UP_ARROW || k==DOWN_ARROW){
      if(this.state==4) this.maze.move(k);
      return;
    }
    switch(k){
      case "Enter":
        if(this.state==-1 || this.state==2){ this.resetStage(); this.state=0; }
        break;
      case "r":
      case "R":
        if(this.state!=-1){
          if(this.state==3){ this.stage=1; this.cards.stage=0; }
          this.resetStage();
          this.state=0;
        }
        break;
    }
  }
}
