import {generateMaze} from './maze.mjs?v=daily-three-v2';
export const DAILY_COUNT=3;
export const STORAGE_KEY='bunny-compass-daily-v1';
export function localDay(date=new Date()){return`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
function hash(text){let h=2166136261;for(const ch of text){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
export function mazeComplexity(maze){const steps=maze.solution.length-1,map=new Map(maze.cells.map(c=>[c.key,c]));const junctions=maze.solution.filter(k=>map.get(k).walls.filter(w=>!w).length>=3).length;const base=(maze.level+1)*100+steps*5+junctions*10;return{steps,junctions,base};}
export function scoreMaze(maze,milliseconds){if(!Number.isFinite(milliseconds)||milliseconds<0)throw Error('Invalid completion time');const {base,steps,junctions}=mazeComplexity(maze);const bonus=Math.floor(base*60000/(60000+milliseconds));return{base,bonus,total:base+bonus,steps,junctions};}
const plans=new Map();
function legacyDailyPlan(day){if(plans.has(day))return plans.get(day);const seed=hash(day)%90000;
 const easy=generateMaze(0,seed),easyBase=mazeComplexity(easy).base;
 const mediumPool=Array.from({length:24},(_,i)=>generateMaze(1,seed+100+i*13)).filter(m=>mazeComplexity(m).base>easyBase).sort((a,b)=>mazeComplexity(a).base-mazeComplexity(b).base);
 if(!mediumPool.length)throw Error('No progressive medium maze');const medium=mediumPool[Math.floor(mediumPool.length/3)],mediumBase=mazeComplexity(medium).base;
 const hardPool=Array.from({length:64},(_,i)=>generateMaze(2,seed+1000+i*13)).filter(m=>mazeComplexity(m).base>mediumBase).sort((a,b)=>mazeComplexity(a).base-mazeComplexity(b).base);
 const distinct=[...new Map(hardPool.map(m=>[mazeComplexity(m).base,m])).values()];if(distinct.length<2)throw Error('No progressive hard mazes');
 const hard=distinct[Math.floor((distinct.length-1)/3)],final=distinct.at(-1);
 const plan=[easy,medium,hard,final].map((maze,slot)=>({slot,maze,complexity:mazeComplexity(maze)}));plans.set(day,plan);return plan;
}
export function dailyPlan(day){return legacyDailyPlan(day).slice(0,DAILY_COUNT);}
export function emptyDay(){return{results:[],active:null};}
export function createState(){return{version:1,days:{}};}
export function dayData(state,day){return state.days[day]||emptyDay();}
export function dailyTotal(state,day){return dayData(state,day).results.reduce((sum,r)=>sum+r.total,0);}
export function finishDailyMaze(state,day,slot,stats){const data=dayData(state,day);if(slot!==data.results.length||slot>=DAILY_COUNT)throw Error('Daily maze already scored or out of order');const maze=dailyPlan(day)[slot].maze,elapsed=Math.floor(stats.elapsed),score=scoreMaze(maze,elapsed);const row={slot,elapsed,hops:Math.max(0,Math.floor(stats.hops||0)),turns:Math.max(0,Math.floor(stats.turns||0)),...score};return{version:1,days:{...state.days,[day]:{results:[...data.results,row],active:null}}};}
export function saveCheckpoint(state,day,checkpoint){const data=dayData(state,day);if(data.results.length>=DAILY_COUNT||checkpoint.slot!==data.results.length)return state;return{version:1,days:{...state.days,[day]:{...data,active:{...checkpoint}}}};}
export function restoreState(raw,today=localDay()){const state=createState();if(raw?.version!==1||!raw.days||typeof raw.days!=='object')return state;
 for(const [day,value]of Object.entries(raw.days)){if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||!Array.isArray(value?.results)||value.results.length>4)continue;let data=emptyDay();try{for(const [slot,row]of (day>=today?value.results.slice(0,DAILY_COUNT):value.results).entries()){if(row.slot!==slot||!Number.isFinite(row.elapsed)||row.elapsed<0)throw Error('Invalid saved result');const score=scoreMaze(legacyDailyPlan(day)[slot].maze,row.elapsed);data.results.push({slot,elapsed:row.elapsed,hops:Math.max(0,Math.floor(row.hops||0)),turns:Math.max(0,Math.floor(row.turns||0)),...score});}
 const a=value.active;if(a&&data.results.length<DAILY_COUNT&&a.slot===data.results.length&&Number.isFinite(a.elapsed)&&a.elapsed>=0){const maze=dailyPlan(day)[a.slot].maze;if(maze.cells.some(c=>c.key===a.pos)&&a.pos!==maze.goal)data.active={slot:a.slot,pos:a.pos,elapsed:a.elapsed,hops:Math.max(0,Math.floor(a.hops||0)),turns:Math.max(0,Math.floor(a.turns||0)),angle:Number.isFinite(a.angle)&&a.angle%90===0?a.angle:0,started:!!a.started};}
 state.days[day]=data;}catch{}}
 return state;
}
