// Quiet, locally synthesized cues. No downloads, microphone, or autoplay required.
export const SOUND_PATTERNS={
 success:[{frequency:523.25,at:.08,duration:.21,volume:.22},{frequency:659.25,at:.22,duration:.21,volume:.22},{frequency:783.99,at:.36,duration:.23,volume:.22},{frequency:1046.5,at:.52,duration:.38,volume:.18}],
 failure:[{frequency:392,at:.08,duration:.22,volume:.17},{frequency:329.63,at:.28,duration:.23,volume:.17},{frequency:261.63,at:.49,duration:.34,volume:.15}]
};
export function createGameAudio(storageKey,options={}){
 let storage=options.storage;try{storage??=globalThis.localStorage;}catch{}
 let enabled=true;try{enabled=storage?.getItem(storageKey)!=='off';}catch{}
 let context=null,master=null,lastStep=-Infinity,lastBump=-Infinity;const voices=new Set();
 function unlock(){if(!enabled)return null;try{if(!context){const Context=options.AudioContextClass||globalThis.AudioContext||globalThis.webkitAudioContext;if(!Context)return null;context=new Context();master=context.createGain();master.gain.setValueAtTime(.22,context.currentTime);master.connect(context.destination);}if(context.state==='suspended')context.resume()?.catch(()=>{});return context;}catch{return null;}}
 function tone(frequency,at=0,duration=.1,volume=.2,slide){const c=unlock();if(!c)return;const start=c.currentTime+at,osc=c.createOscillator(),gain=c.createGain();osc.type='sine';osc.frequency.setValueAtTime(frequency,start);if(slide)osc.frequency.exponentialRampToValueAtTime(slide,start+duration);gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(volume,start+.012);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);osc.connect(gain);gain.connect(master);voices.add(osc);osc.onended=()=>{voices.delete(osc);osc.disconnect();gain.disconnect();};osc.start(start);osc.stop(start+duration+.025);}
 function step(){const c=unlock();if(!c||c.currentTime-lastStep<.065)return;lastStep=c.currentTime;tone(460,0,.085,.18,340);}
 function bump(){const c=unlock();if(!c||c.currentTime-lastBump<.14)return;lastBump=c.currentTime;tone(220,0,.09,.12,180);}
 function stop(){for(const voice of voices){try{voice.stop();}catch{}}voices.clear();lastStep=lastBump=-Infinity;}
 function play(pattern){if(!enabled)return;for(const note of pattern)tone(note.frequency,note.at,note.duration,note.volume);}
 return{get enabled(){return enabled;},unlock,step,bump,success:()=>play(SOUND_PATTERNS.success),failure:()=>play(SOUND_PATTERNS.failure),stop,setEnabled(value){enabled=!!value;try{storage?.setItem(storageKey,enabled?'on':'off');}catch{}if(!enabled)stop();else unlock();return enabled;}};
}
