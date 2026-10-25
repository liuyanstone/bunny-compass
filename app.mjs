import {createGameAudio} from './audio.mjs';
import './i18n.mjs';
import {LEVELS,generateMaze,solveMaze,nextCell,DIRECTIONS} from './maze.mjs';
const $=s=>document.querySelector(s),NS='http://www.w3.org/2000/svg';
const sound=createGameAudio('bunny-compass-sound');
function renderSound(){ $('#soundBtn').setAttribute('aria-pressed',String(sound.enabled)); $('#soundLabel').textContent=sound.enabled?'Sound on':'Sound off'; }
$('#soundBtn').onclick=()=>{sound.setEnabled(!sound.enabled);renderSound();if(sound.enabled)sound.step();};
renderSound();
let progress={};try{progress=JSON.parse(localStorage.getItem('bunny-compass-progress')||'{}')||{};}catch{}
let level=0,index=0,maze,pos,hopCount=0,turnCount=0,angle=0,active=false,started=false,finished=false,spinning=false,elapsed=0,startedAt=0,spinTimer,spinFinishTimer,toastTimer,hintTimer,repeatTimer,repeatDelay,helpWasActive=false;
const names=['A fresh beginning','The winding way','Around the bend','A different angle','Clover’s crossroads','A quiet detour','Follow the sun','A curious little trail'];
function svg(tag,attrs={},parent=$('#maze')){const el=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))el.setAttribute(k,v);parent.append(el);return el;}
function announce(text){$('#live').textContent=text;}
function time(ms){const s=Math.floor(ms/1000);return`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;}
function currentTime(){return elapsed+(active?performance.now()-startedAt:0);}
function save(){try{localStorage.setItem('bunny-compass-progress',JSON.stringify(progress));}catch{$('#saved').textContent='Progress is available for this session';}}
function renderMenu(){
 $('#difficulties').innerHTML='';
 LEVELS.forEach((l,i)=>{const b=document.createElement('button');b.className='difficulty-card'+(i===level?' active':'');b.setAttribute('aria-pressed',i===level);b.innerHTML=`<span class="difficulty-icon">${['✿','♧','☾'][i]}</span><span><b>${l.name}</b><small>${l.label} · 40 mazes</small></span><span class="radio"></span>`;b.onclick=()=>select(i,0);$('#difficulties').append(b);});
 $('#mazeButtons').innerHTML='';let count=0;
 for(let i=0;i<40;i++){const done=!!progress[`${level}-${i}`];if(done)count++;const b=document.createElement('button');b.textContent=String(i+1).padStart(2,'0');b.className=(i===index?'current ':'')+(done?'done':'');b.setAttribute('aria-label',`Maze ${i+1}${done?', completed':''}`);if(i===index)b.setAttribute('aria-current','true');b.onclick=()=>select(level,i);$('#mazeButtons').append(b);}
 $('#completed').textContent=`${count} / 40`;$('#trailfill').style.width=`${count/40*100}%`;
}
function enablePad(enabled){document.querySelectorAll('[data-dir]').forEach(b=>b.disabled=!enabled);}
function stopHeld(){clearTimeout(repeatDelay);clearInterval(repeatTimer);document.querySelectorAll('[data-dir]').forEach(b=>b.classList.remove('pressed'));}
function cancelTimers(){clearTimeout(spinTimer);clearTimeout(spinFinishTimer);clearTimeout(toastTimer);clearTimeout(hintTimer);stopHeld();spinning=false;$('#rotationToast').classList.remove('show');}
function select(l,i,auto=false){
 cancelTimers();enablePad(false);level=l;index=i;maze=generateMaze(l,i);pos=maze.start;hopCount=turnCount=angle=elapsed=0;active=started=finished=false;
 $('#rotor').style.transition='none';$('#rotor').style.transform='rotate(0deg)';requestAnimationFrame(()=>requestAnimationFrame(()=>$('#rotor').style.transition=''));
 $('#arena').dataset.level=level;$('#pausedCover').hidden=true;$('#startCover').hidden=false;$('#pauseBtn').disabled=$('#hintBtn').disabled=true;
 $('#chapter').textContent=`THE ${LEVELS[level].name.toUpperCase()} · MAZE ${String(index+1).padStart(2,'0')}`;
 $('#mazeName').textContent=names[index%names.length];$('#shape').textContent=`${['▦','▤','◯','◇','✣'][index%5]} ${maze.shape}`;
 $('#spinStatus').textContent='Ready when you are';$('#time').textContent='0:00';$('#hops').textContent='0';$('#turns').textContent='0';
 renderMenu();renderMaze();if(auto)start();
}
let cellSize=0,offset=0;
function center(k){const c=maze.cells.find(c=>c.key===k);return[offset+(c.x+.5)*cellSize,offset+(c.y+.5)*cellSize];}
function renderMaze(){
 const root=$('#maze');root.innerHTML='';cellSize=400/maze.n;offset=20;const map=new Map(maze.cells.map(c=>[c.key,c]));
 const floors=svg('g');for(const c of maze.cells)svg('rect',{x:offset+c.x*cellSize-1,y:offset+c.y*cellSize-1,width:cellSize+2,height:cellSize+2,rx:3,class:'cell-floor'},floors);
 const[startX,startY]=center(maze.start);svg('circle',{cx:startX,cy:startY,r:cellSize*.13,class:'start-dot'});
 const[gx,gy]=center(maze.goal);svg('circle',{cx:gx,cy:gy,r:cellSize*.43,class:'goal-glow'});
 // A carrot gate at the open edge of the maze.
 const goal=svg('g',{transform:`translate(${gx},${gy}) scale(${cellSize/50})`});
 svg('path',{d:'M-9-7Q0-14 9-7L1 17Q0 20-2 16Z',fill:'#df925c',stroke:'#c77e48','stroke-width':1.5},goal);svg('path',{d:'M0-10Q-12-24-10-14L0-7Q-2-26 3-22L2-7Q17-24 12-12L3-5',fill:'#69946c'},goal);svg('path',{d:'M-4-2L1 0M-1 6L3 7',stroke:'#bd7147','stroke-width':1.5,'stroke-linecap':'round'},goal);
 const walls=svg('g',{'aria-hidden':'true'});for(const c of maze.cells){const x=offset+c.x*cellSize,y=offset+c.y*cellSize;const edges=[[x,y,x+cellSize,y],[x+cellSize,y,x+cellSize,y+cellSize],[x,y+cellSize,x+cellSize,y+cellSize],[x,y,x,y+cellSize]];for(let d=0;d<4;d++){
  if(!c.walls[d]||(c.key===maze.goal&&d===maze.exitDirection))continue;
  const[dx,dy]=DIRECTIONS[d],exists=map.has((c.y+dy)*maze.n+c.x+dx)&&c.x+dx>=0&&c.x+dx<maze.n;
  if(exists&&(d===0||d===3))continue;
  const[a,b,e,f]=edges[d];svg('line',{x1:a,y1:b,x2:e,y2:f,class:exists?'wall':'outer-wall'},walls);
 }}
 svg('path',{id:'hintPath',class:'hint-path',hidden:'true'});
 svg('image',{href:'rabbit.svg',id:'rabbit',width:cellSize*1.1,height:cellSize*1.2,class:'rabbit'});updateRabbit();
}
function updateRabbit(){const[x,y]=center(pos);$('#rabbit').setAttribute('x',x-cellSize*.55);$('#rabbit').setAttribute('y',y-cellSize*.67);}
function scheduleSpin(){clearTimeout(spinTimer);if(!active||finished)return;const c=LEVELS[level],delay=c.min+Math.random()*(c.max-c.min);spinTimer=setTimeout(rotate,delay);}
function rotate(){if(!active||finished)return;stopHeld();spinning=true;angle+=(Math.random()<.5?-90:90);turnCount++;$('#turns').textContent=turnCount;$('#rotor').style.transform=`rotate(${angle}deg)`;$('#spinStatus').textContent='A new perspective';$('#rotationToast').classList.add('show');announce('The maze turned 90 degrees. Up follows the coral compass arrow.');clearTimeout(spinFinishTimer);spinFinishTimer=setTimeout(()=>{spinning=false;if(active)$('#spinStatus').textContent='The world is turning…';},760);clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#rotationToast').classList.remove('show'),1800);scheduleSpin();}
function start(){if(finished)return;sound.unlock();started=active=true;enablePad(true);startedAt=performance.now();$('#startCover').hidden=true;$('#pausedCover').hidden=true;$('#pauseBtn').disabled=$('#hintBtn').disabled=false;$('#spinStatus').textContent='The world is turning…';scheduleSpin();announce('Guide Clover to the carrot gate. The coral arrow marks maze up.');}
function pause(){if(!active)return;elapsed+=performance.now()-startedAt;active=false;enablePad(false);clearTimeout(spinTimer);stopHeld();$('#pausedCover').hidden=false;$('#spinStatus').textContent='Taking a breather';announce('Game paused.');}
function resume(){if(!started||finished)return;active=true;enablePad(true);startedAt=performance.now();$('#pausedCover').hidden=true;$('#spinStatus').textContent='The world is turning…';scheduleSpin();}
function step(d){if(!active||spinning||finished)return;const next=nextCell(maze,pos,d);if(next===pos){sound.bump();$('#arena').classList.remove('blocked');void $('#arena').offsetWidth;$('#arena').classList.add('blocked');return;}pos=next;sound.step();hopCount++;$('#hops').textContent=hopCount;updateRabbit();$('#hintPath').setAttribute('hidden','true');if(pos===maze.goal)complete();}
function complete(){elapsed+=performance.now()-startedAt;active=false;finished=true;enablePad(false);cancelTimers();sound.success();$('#time').textContent=time(elapsed);$('#spinStatus').textContent='Clover found the way!';$('#pauseBtn').disabled=$('#hintBtn').disabled=true;const key=`${level}-${index}`,old=progress[key];progress[key]={ms:old?Math.min(old.ms||Infinity,elapsed):elapsed,hops:old?Math.min(old.hops||Infinity,hopCount):hopCount};save();renderMenu();$('#winStats').innerHTML=`<div><b>${time(elapsed)}</b><span>TIME</span></div><div><b>${hopCount}</b><span>HOPS</span></div><div><b>${turnCount}</b><span>TURNS</span></div>`;const allDone=Object.keys(progress).length===120;$('#winMessage').textContent=allDone?'All 120 mazes explored. What a wonderful sense of direction!':'Clover is home, and the carrots are waiting.';$('#nextBtn').textContent=index===39?(level===2?'Explore again →':'Next difficulty →'):'Next maze →';$('#win').showModal();announce(`Maze complete in ${time(elapsed)}, with ${hopCount} hops and ${turnCount} turns.`);}
function hint(){if(!active||spinning)return;const path=solveMaze(maze,pos).slice(0,4);$('#hintPath').setAttribute('d',path.map((k,i)=>`${i?'L':'M'}${center(k).join(' ')}`).join(' '));$('#hintPath').removeAttribute('hidden');clearTimeout(hintTimer);hintTimer=setTimeout(()=>$('#hintPath').setAttribute('hidden','true'),3500);announce('The next three steps are highlighted in coral.');}
$('#startBtn').onclick=start;$('#pauseBtn').onclick=pause;$('#resumeBtn').onclick=resume;$('#restartBtn').onclick=()=>select(level,index);$('#hintBtn').onclick=hint;
$('#nextBtn').onclick=()=>{$('#win').close();if(index<39)select(level,index+1,true);else if(level<2)select(level+1,0,true);else select(0,0);};$('#stayBtn').onclick=()=>$('#win').close();
$('#helpBtn').onclick=()=>{helpWasActive=active;if(active)pause();$('#help').showModal();};document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$('#help').close());$('#help').addEventListener('close',()=>{if(helpWasActive){helpWasActive=false;resume();}});
const keys={ArrowUp:0,ArrowRight:1,ArrowDown:2,ArrowLeft:3,w:0,d:1,s:2,a:3,W:0,D:1,S:2,A:3};
document.addEventListener('keydown',e=>{if($('#help').open||$('#win').open||e.target.closest('select,input,textarea'))return;if(e.target.closest('button,select,input,textarea')&&!e.target.matches('[data-dir]')){if(e.key==='Enter'||e.key===' ')return;}if(e.key in keys){e.preventDefault();step(keys[e.key]);}if(e.key==='Escape'){if(active)pause();else if(started&&!finished)resume();}});
for(const b of document.querySelectorAll('[data-dir]')){b.addEventListener('pointerdown',e=>{e.preventDefault();stopHeld();b.classList.add('pressed');try{b.setPointerCapture(e.pointerId);}catch{}step(+b.dataset.dir);repeatDelay=setTimeout(()=>{repeatTimer=setInterval(()=>step(+b.dataset.dir),150);},300);});b.addEventListener('pointerup',stopHeld);b.addEventListener('pointercancel',stopHeld);b.addEventListener('lostpointercapture',stopHeld);b.addEventListener('click',e=>{if(e.detail===0)step(+b.dataset.dir);});}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&active)pause();});window.addEventListener('blur',()=>{stopHeld();if(active)pause();});
setInterval(()=>{if(active)$('#time').textContent=time(currentTime());},200);
select(0,0);
