import assert from 'node:assert/strict';
import {generateMaze,solveMaze,nextCell,distances,DIRECTIONS,LEVELS} from './maze.mjs';
let count=0,min=Infinity,max=0;const signatures=new Set();
for(let l=0;l<3;l++)for(let i=0;i<40;i++){
 const m=generateMaze(l,i),map=new Map(m.cells.map(c=>[c.key,c]));
 assert.equal(distances(m,m.start).size,m.cells.length,'Every cell must be reachable');
 const signature=JSON.stringify(m.cells.map(c=>[c.key,c.walls]));assert(!signatures.has(signature),'Every maze must be unique');signatures.add(signature);
 let openEdges=0;
 for(const c of m.cells)for(let d=0;d<4;d++)if(!c.walls[d]){const[dx,dy]=DIRECTIONS[d],q=map.get((c.y+dy)*m.n+c.x+dx);assert(q,'Passage must lead to a cell');assert.equal(q.walls[(d+2)%4],false,'Passages must be reciprocal');openEdges++;}
 assert.equal(openEdges/2,m.cells.length-1,'Maze is a spanning tree');
 const path=solveMaze(m);assert(path.length>1);assert.equal(path[0],m.start);assert.equal(path.at(-1),m.goal);
 let pos=m.start;
 for(const k of path.slice(1)){const c=map.get(pos),q=map.get(k),d=DIRECTIONS.findIndex(([dx,dy])=>q.x-c.x===dx&&q.y-c.y===dy);assert(d>=0);assert.equal(nextCell(m,pos,d),k);pos=k;}
 assert.equal(pos,m.goal);for(let d=0;d<4;d++)if(map.get(m.start).walls[d])assert.equal(nextCell(m,m.start,d),m.start,'Walls block movement');
 assert.deepEqual(generateMaze(l,i),m,'Mazes must be reproducible');
 min=Math.min(min,path.length-1);max=Math.max(max,path.length-1);count++;
}
assert.equal(count,120);assert.equal(signatures.size,120);for(const l of LEVELS){assert(l.min>760);assert(l.max>l.min);}
console.log(`PASS: ${count} unique solvable mazes; every cell reachable; reciprocal walls; no paths outside maze; complete solutions replayed. Solution lengths: ${min}–${max} hops.`);
