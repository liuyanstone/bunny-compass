export const DIRECTIONS = [[0,-1],[1,0],[0,1],[-1,0]];
export const LEVELS = [
 {name:'Meadow',label:'Easy',size:7,min:11000,max:16000},
 {name:'Woodland',label:'Medium',size:9,min:7000,max:11000},
 {name:'Moonlight',label:'Hard',size:11,min:4000,max:7000}
];
export const SHAPES=['Square','Rectangle','Circle','Diamond','Clover'];
function random(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
export function generateMaze(level,index){
 const config=LEVELS[level],n=config.size,shape=index%5,rng=random(281730+level*100003+index*7919),mid=(n-1)/2;
 const active=(x,y)=>{
  if(shape===1)return y>=1&&y<n-1;
  if(shape===2)return Math.hypot(x-mid,y-mid)<=n/2;
  if(shape===3)return Math.abs(x-mid)+Math.abs(y-mid)<=mid+1;
  if(shape===4)return Math.abs(x-mid)<=Math.floor(n/4)||Math.abs(y-mid)<=Math.floor(n/4);
  return true;
 };
 const cells=[]; const map=new Map();
 for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(active(x,y)){const c={x,y,key:y*n+x,walls:[true,true,true,true]};cells.push(c);map.set(c.key,c);}
 const neighbor=(c,d)=>{const[dx,dy]=DIRECTIONS[d],x=c.x+dx,y=c.y+dy;return x>=0&&x<n&&y>=0&&y<n?map.get(y*n+x):undefined;};
 const boundary=c=>DIRECTIONS.some((_,d)=>!neighbor(c,d));
 const boundaries=cells.filter(boundary),start=boundaries[Math.floor(rng()*boundaries.length)].key;
 const seen=new Set([start]),stack=[map.get(start)];
 while(stack.length){const c=stack[stack.length-1],options=[0,1,2,3].filter(d=>{const q=neighbor(c,d);return q&&!seen.has(q.key);});if(!options.length){stack.pop();continue;}const d=options[Math.floor(rng()*options.length)],q=neighbor(c,d);c.walls[d]=false;q.walls[(d+2)%4]=false;seen.add(q.key);stack.push(q);}
 if(seen.size!==cells.length)throw Error('Disconnected maze mask');
 const maze={level,index,n,shape:SHAPES[shape],cells,start,goal:start};
 const paths=distances(maze,start);let far=-1;
 for(const c of boundaries)if(paths.get(c.key)>far){far=paths.get(c.key);maze.goal=c.key;}
 maze.exitDirection=[0,1,2,3].find(d=>!neighbor(map.get(maze.goal),d));
 maze.solution=solveMaze(maze,start);return maze;
}
export function distances(maze,start){const dist=new Map([[start,0]]),queue=[start],map=new Map(maze.cells.map(c=>[c.key,c]));for(let i=0;i<queue.length;i++){const c=map.get(queue[i]);for(let d=0;d<4;d++)if(!c.walls[d]){const[dx,dy]=DIRECTIONS[d],k=(c.y+dy)*maze.n+c.x+dx;if(!dist.has(k)){dist.set(k,dist.get(c.key)+1);queue.push(k);}}}return dist;}
export function solveMaze(maze,start=maze.start){const map=new Map(maze.cells.map(c=>[c.key,c])),prev=new Map([[start,null]]),queue=[start];for(let i=0;i<queue.length;i++){const k=queue[i];if(k===maze.goal)break;const c=map.get(k);for(let d=0;d<4;d++)if(!c.walls[d]){const[dx,dy]=DIRECTIONS[d],q=(c.y+dy)*maze.n+c.x+dx;if(!prev.has(q)){prev.set(q,k);queue.push(q);}}}if(!prev.has(maze.goal))return[];const result=[];for(let k=maze.goal;k!==null;k=prev.get(k))result.unshift(k);return result;}
export function nextCell(maze,key,d){const c=maze.cells.find(c=>c.key===key);if(!c||c.walls[d])return key;const[dx,dy]=DIRECTIONS[d];return(c.y+dy)*maze.n+c.x+dx;}
