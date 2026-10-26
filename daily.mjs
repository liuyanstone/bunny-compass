import {initialAngle,safeAngle} from './rotation.mjs?v=extra-v3';
import {generateMaze} from './maze.mjs?v=extra-v3';
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
export function emptyDay(){return{results:[],active:null,extras:[],practice:null};}
export function createState(){return{version:1,days:{}};}
export function dayData(state,day){return state.days[day]||emptyDay();}
export function bestByLevel(state,day){const data=dayData(state,day),best=[null,null,null];for(const row of data.results){const level=Math.min(row.slot,2);if(!best[level]||row.total>best[level].total)best[level]={...row,level};}for(const row of data.extras||[])if(!best[row.level]||row.total>best[row.level].total)best[row.level]={...row};return best;}
export function dailyTotal(state,day){const data=dayData(state,day);return data.results.length>DAILY_COUNT?data.results.reduce((sum,r)=>sum+r.total,0):bestByLevel(state,day).reduce((sum,r)=>sum+(r?.total||0),0);}
function statsRow(maze,stats){const elapsed=Math.floor(stats.elapsed),score=scoreMaze(maze,elapsed);return{elapsed,hops:Math.max(0,Math.floor(stats.hops||0)),turns:Math.max(0,Math.floor(stats.turns||0)),...score};}
export function finishDailyMaze(state,day,slot,stats){const data=dayData(state,day);if(slot!==data.results.length||slot>=DAILY_COUNT)throw Error('Daily maze already scored or out of order');const row={slot,...statsRow(dailyPlan(day)[slot].maze,stats)};return{version:1,days:{...state.days,[day]:{...data,results:[...data.results,row],active:null}}};}
export function extraMaze(day,level,attempt){if(!Number.isInteger(level)||level<0||level>2||!Number.isSafeInteger(attempt)||attempt<0)throw Error('Invalid extra maze');return generateMaze(level,100000+hash(day)%90000+level*10000+attempt*37);}
export function beginExtraMaze(state,day,level){const data=dayData(state,day);if(data.results.length<DAILY_COUNT||data.practice)throw Error('Finish current challenge before choosing another maze');const attempt=(data.extras||[]).length,maze=extraMaze(day,level,attempt);return{version:1,days:{...state.days,[day]:{...data,practice:{kind:'extra',level,attempt,pos:maze.start,elapsed:0,hops:0,turns:0,angle:initialAngle(level),started:false}}}};}
export function finishExtraMaze(state,day,stats){const data=dayData(state,day),p=data.practice;if(data.results.length<DAILY_COUNT||!p)throw Error('No active extra maze');const row={level:p.level,attempt:p.attempt,...statsRow(extraMaze(day,p.level,p.attempt),stats)};return{version:1,days:{...state.days,[day]:{...data,practice:null,extras:[...(data.extras||[]),row]}}};}
export function saveCheckpoint(state,day,checkpoint){const data=dayData(state,day);if(checkpoint.kind==='extra'){if(!data.practice||checkpoint.level!==data.practice.level||checkpoint.attempt!==data.practice.attempt)return state;return{version:1,days:{...state.days,[day]:{...data,practice:{...data.practice,...checkpoint,angle:safeAngle(checkpoint.level,checkpoint.angle)}}}};}if(data.results.length>=DAILY_COUNT||checkpoint.slot!==data.results.length)return state;return{version:1,days:{...state.days,[day]:{...data,active:{...checkpoint,angle:safeAngle(checkpoint.slot,checkpoint.angle)}}}};}
function validCheckpoint(a,maze){return a&&Number.isFinite(a.elapsed)&&a.elapsed>=0&&maze.cells.some(c=>c.key===a.pos)&&a.pos!==maze.goal;}
function checkpointStats(a,level){return{pos:a.pos,elapsed:a.elapsed,hops:Math.max(0,Math.floor(a.hops||0)),turns:Math.max(0,Math.floor(a.turns||0)),angle:safeAngle(level,a.angle),started:!!a.started};}
export function restoreState(raw,today=localDay()){const state=createState();if(raw?.version!==1||!raw.days||typeof raw.days!=='object')return state;
 for(const [day,value]of Object.entries(raw.days)){if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||!Array.isArray(value?.results)||value.results.length>4)continue;let data=emptyDay();try{for(const [slot,row]of (day>=today?value.results.slice(0,DAILY_COUNT):value.results).entries()){if(row.slot!==slot||!Number.isFinite(row.elapsed)||row.elapsed<0)throw Error('Invalid saved result');data.results.push({slot,...statsRow(legacyDailyPlan(day)[slot].maze,row)});}
 const a=value.active;if(a&&data.results.length<DAILY_COUNT&&a.slot===data.results.length){const maze=dailyPlan(day)[a.slot].maze;if(validCheckpoint(a,maze))data.active={slot:a.slot,...checkpointStats(a,maze.level)};}
 if(data.results.length>=DAILY_COUNT){for(const [attempt,row]of (Array.isArray(value.extras)?value.extras:[]).entries()){if(row.attempt!==attempt||!Number.isInteger(row.level)||row.level<0||row.level>2||!Number.isFinite(row.elapsed)||row.elapsed<0)break;data.extras.push({level:row.level,attempt,...statsRow(extraMaze(day,row.level,attempt),row)});}const p=value.practice;if(p&&p.attempt===data.extras.length&&Number.isInteger(p.level)&&p.level>=0&&p.level<3){const maze=extraMaze(day,p.level,p.attempt);if(validCheckpoint(p,maze))data.practice={kind:'extra',level:p.level,attempt:p.attempt,...checkpointStats(p,p.level)};}}
 state.days[day]=data;}catch{}}
 return state;
}
