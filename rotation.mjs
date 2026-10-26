export function initialAngle(level,rng=Math.random){return level===2?(1+Math.floor(rng()*3))*90:0;}
export function safeAngle(level,value){const angle=Number.isFinite(value)&&value%90===0?value:0;if(level!==2)return angle;const normalized=((angle%360)+360)%360;return normalized||90;}
export function nextAngle(level,current,rng=Math.random){if(level!==2)return current+(rng()<.5?-90:90);const normalized=safeAngle(level,current),options=[90,180,270].filter(a=>a!==normalized);return options[Math.floor(rng()*options.length)];}
