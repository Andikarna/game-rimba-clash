import assert from 'node:assert/strict';
import {GameAudio} from '../dist/audio.js';
class Param{constructor(v=0){this.value=v}setValueAtTime(v){assert(Number.isFinite(v));this.value=v}exponentialRampToValueAtTime(v){assert(v>0&&Number.isFinite(v));this.value=v}setTargetAtTime(v){assert(Number.isFinite(v));this.value=v}}
class Node{constructor(){this.gain=new Param();this.frequency=new Param();this.pan=new Param();this.Q=new Param();for(const p of ['threshold','knee','ratio','attack','release'])this[p]=new Param();}connect(n){this.target=n}disconnect(){}start(t){assert(t>=0);this.started=true}stop(t){this.end=t;if(t===undefined)this.onended?.()}}
class Context{constructor(){this.currentTime=1;this.sampleRate=44100;this.state='suspended';this.nodes=[];this.destination={}}node(){const n=new Node();this.nodes.push(n);return n}createGain(){return this.node()}createDynamicsCompressor(){return this.node()}createOscillator(){return this.node()}createStereoPanner(){return this.node()}createBufferSource(){return this.node()}createBiquadFilter(){return this.node()}createBuffer(ch,n){return {getChannelData:()=>new Float32Array(n)}}async resume(){this.state='running'}close(){this.state='closed'}}
const saved={};const storage={getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v};const c=new Context();const audio=new GameAudio({contextFactory:()=>c,storage});
assert.equal(audio.unlocked,false);audio.sfx('hit');assert.equal(c.nodes.length,0);
assert(await audio.unlock());assert(audio.interval);const interval=audio.interval;audio.startMusic();assert.equal(audio.interval,interval,'only one scheduler');
audio.setScene('fight');for(let step=0;step<256;step++)audio.musicStep(step,1+step*.114);
for(const type of ['select','jump','swing','hit','block','guardbreak','special','ultimate','summon','round','fight','result'])for(let element=0;element<4;element++){c.currentTime+=.1;audio.sfx(type,{element,kind:'kick',combo:4,winner:element===0?0:1})}
assert(audio.voices.size>0);audio.setVolume('music',0);assert.equal(audio.musicBus.gain.value,0);assert.equal(audio.effectsBus.gain.value,.75);audio.setVolume('effects',.2);assert.equal(audio.effectsBus.gain.value,.2);
audio.setScene('paused');assert.equal(audio.interval,null);assert.equal(audio.voices.size,0);const count=c.nodes.length;audio.sfx('hit');assert.equal(c.nodes.length,count);
c.currentTime+=.1;audio.sfx('hit',{preview:true});assert(c.nodes.length>count,'preview effect works in pause');
audio.setScene('fight');assert(audio.interval);audio.setEnabled(false);assert.equal(audio.interval,null);assert.equal(audio.voices.size,0);assert.equal(audio.master.gain.value,0);
audio.setEnabled(true);assert(audio.interval);audio.setScene('hidden');assert.equal(audio.voices.size,0);assert.equal(audio.interval,null);
audio.setScene('fight');audio.setScene('roundEnd');assert.equal(audio.interval,null);c.currentTime+=.1;audio.sfx('result',{winner:0});assert(audio.voices.size>0);
const copy=new GameAudio({contextFactory:()=>new Context(),storage});assert.equal(copy.settings.music,0);assert.equal(copy.settings.effects,.2);
audio.dispose();assert.equal(c.state,'closed');assert.equal(audio.voices.size,0);
const denied=new GameAudio({contextFactory:()=>{throw Error('unsupported')},storage});assert.equal(await denied.unlock(),false);
console.log('PASS: complete 16-bar score; layered effects; independent volumes; single scheduler; pause/hidden/mute cleanup; resume; fanfare; storage; denied audio fallback.');

