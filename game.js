const c=document.getElementById('game'),ctx=c.getContext('2d');
const menu=document.getElementById('menu'),hud=document.getElementById('hud'),result=document.getElementById('result');
const scoreEl=document.getElementById('score'),timerEl=document.getElementById('timer'),hpEl=document.getElementById('hp'),ammoEl=document.getElementById('ammo');
let W,H,playing=false,last=0,time=120,blue=0,red=0,keys={},mouse={x:0,y:0,down:false},player,bots=[],bullets=[];
function resize(){W=c.width=innerWidth;H=c.height=innerHeight}addEventListener('resize',resize);resize();
function reset(){time=120;blue=red=0;bullets=[];player={x:W/2,y:H/2,hp:100,ammo:30,reload:0,cool:0};bots=[];
for(let i=0;i<4;i++)bots.push({x:120+Math.random()*(W-240),y:100+Math.random()*(H-220),team:'blue',hp:100,cool:0});
for(let i=0;i<5;i++)bots.push({x:120+Math.random()*(W-240),y:100+Math.random()*(H-220),team:'red',hp:100,cool:0});
}
function start(){reset();menu.classList.add('hidden');result.classList.add('hidden');hud.classList.remove('hidden');playing=true;last=performance.now();requestAnimationFrame(loop)}
document.getElementById('start').onclick=start;document.getElementById('again').onclick=start;
addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=1;if(e.key==='r')reload()});addEventListener('keyup',e=>keys[e.key.toLowerCase()]=0);
c.addEventListener('pointermove',e=>{mouse.x=e.clientX;mouse.y=e.clientY});c.addEventListener('pointerdown',()=>mouse.down=true);addEventListener('pointerup',()=>mouse.down=false);
document.getElementById('fire').onpointerdown=()=>mouse.down=true;document.getElementById('fire').onpointerup=()=>mouse.down=false;document.getElementById('reload').onclick=reload;
function reload(){if(player.ammo<30)player.reload=1.2}
function shoot(){if(player.reload>0||player.cool>0)return;if(player.ammo<=0){reload();return}player.ammo--;player.cool=.12;
let a=Math.atan2(mouse.y-player.y,mouse.x-player.x);bullets.push({x:player.x,y:player.y,vx:Math.cos(a)*720,vy:Math.sin(a)*720,life:1,team:'blue'})}
function loop(now){if(!playing)return;let dt=Math.min(.04,(now-last)/1000);last=now;time-=dt;if(time<=0||blue>=50||red>=50)return end();
update(dt);draw();requestAnimationFrame(loop)}
function update(dt){
if(player.reload>0){player.reload-=dt;if(player.reload<=0)player.ammo=30}
player.cool-=dt;
let sp=260,dx=(keys.d?1:0)-(keys.a?1:0),dy=(keys.s?1:0)-(keys.w?1:0);let l=Math.hypot(dx,dy)||1;
player.x=Math.max(25,Math.min(W-25,player.x+dx/l*sp*dt));player.y=Math.max(70,Math.min(H-25,player.y+dy/l*sp*dt));
if(mouse.down)shoot();
for(const b of bots){if(b.hp<=0){b.hp=100;b.x=80+Math.random()*(W-160);b.y=90+Math.random()*(H-140);continue}
let target=b.team==='red'?player: bots.find(q=>q.team==='red'&&q.hp>0)||player;let a=Math.atan2(target.y-b.y,target.x-b.x);b.x+=Math.cos(a)*55*dt;b.y+=Math.sin(a)*55*dt;b.cool-=dt;
if(b.team==='red'&&b.cool<=0&&Math.hypot(target.x-b.x,target.y-b.y)<520){b.cool=.8;if(Math.random()<.55)player.hp-=8}
}
for(const q of bullets){q.x+=q.vx*dt;q.y+=q.vy*dt;q.life-=dt;for(const b of bots){if(q.team!==b.team&&b.hp>0&&Math.hypot(q.x-b.x,q.y-b.y)<20){b.hp=0;blue++;q.life=0}}}
bullets=bullets.filter(q=>q.life>0&&q.x>-20&&q.x<W+20&&q.y>40&&q.y<H+20);
if(player.hp<=0){red++;player.hp=100;player.x=W/2;player.y=H/2}
scoreEl.textContent=`VEGAS ${blue} — ${red} ROGUE`;timerEl.textContent=`${Math.max(0,Math.ceil(time/60)).toString().padStart(2,'0')}:${Math.floor(Math.max(0,time)%60).toString().padStart(2,'0')}`;hpEl.textContent=`${player.hp} HP`;ammoEl.textContent=player.reload>0?'RECARGANDO':`${player.ammo} / 120`;
}
function draw(){
ctx.clearRect(0,0,W,H);ctx.fillStyle='#1b2529';ctx.fillRect(0,0,W,H);
ctx.strokeStyle='#34474d';ctx.lineWidth=2;for(let x=0;x<W;x+=70){ctx.beginPath();ctx.moveTo(x,55);ctx.lineTo(x,H);ctx.stroke()}for(let y=70;y<H;y+=70){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
ctx.fillStyle='#34434a';for(let i=0;i<18;i++){let x=(i*137)%W,y=90+(i*83)%(Math.max(1,H-150));ctx.fillRect(x,y,55,32)}
for(const b of bots){if(b.hp<=0)continue;ctx.fillStyle=b.team==='blue'?'#3aa8ff':'#ff4545';ctx.beginPath();ctx.arc(b.x,b.y,16,0,7);ctx.fill();ctx.fillStyle='#111';ctx.fillRect(b.x-18,b.y-25,36,4);ctx.fillStyle='#72ff72';ctx.fillRect(b.x-18,b.y-25,36*b.hp/100,4)}
ctx.fillStyle='#65bfff';ctx.beginPath();ctx.arc(player.x,player.y,18,0,7);ctx.fill();ctx.fillStyle='#111';ctx.fillRect(player.x-5,player.y-5,25,7);
for(const q of bullets){ctx.fillStyle='#ffd35a';ctx.beginPath();ctx.arc(q.x,q.y,4,0,7);ctx.fill()}
}
function end(){playing=false;hud.classList.add('hidden');result.classList.remove('hidden');let win=blue>red;document.getElementById('resultTitle').textContent=win?'VICTORIA':'DERROTA';document.getElementById('resultScore').textContent=`VEGAS ${blue} — ${red} ROGUE`;document.getElementById('mvp').textContent=win?'MVP: JUNIOR VEGAS':'OPERACIÓN FALLIDA'}
