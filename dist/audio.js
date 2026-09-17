/**
 * Original procedural soundtrack and layered fighting SFX.
 * Web Audio scheduling: 25ms lookahead tick, 120ms audio horizon.
 * No external music files or network requests. Audio unlock requires user input.
 */
const clamp=n=>Math.max(0,Math.min(1,Number(n)||0));
const hz=m=>440*2**((m-69)/12);
export class GameAudio {
 constructor({contextFactory,storage}={}){
  this.factory=contextFactory||(()=>new(window.AudioContext||window.webkitAudioContext)());
  this.storage=storage;try{this.storage??=globalThis.localStorage}catch{}
  this.settings={enabled:true,music:.38,effects:.75};
  try{const p=JSON.parse(this.storage?.getItem('rimba-clash-audio')||'null');if(p){this.settings.enabled=p.enabled!==false;this.settings.music=clamp(p.music??.38);this.settings.effects=clamp(p.effects??.75)}}catch{}
  this.ctx=null;this.unlocked=false;this.scene='select';this.voices=new Set();this.interval=null;this.step=0;this.nextTime=0;this.urgent=false;this.lastFx=new Map();
 }
 save(){try{this.storage?.setItem('rimba-clash-audio',JSON.stringify(this.settings))}catch{}}
 async unlock(){
  try{
   if(!this.ctx){
    this.ctx=this.factory();const c=this.ctx;
    this.master=c.createGain();this.master.gain.value=.7;
    this.limiter=c.createDynamicsCompressor();this.limiter.threshold.value=-12;this.limiter.knee.value=12;this.limiter.ratio.value=8;this.limiter.attack.value=.003;this.limiter.release.value=.2;
    this.musicBus=c.createGain();this.effectsBus=c.createGain();this.musicBus.connect(this.master);this.effectsBus.connect(this.master);this.master.connect(this.limiter);this.limiter.connect(c.destination);
    this.noiseBuffer=c.createBuffer(1,c.sampleRate*2,c.sampleRate);const samples=this.noiseBuffer.getChannelData(0);for(let i=0;i<samples.length;i++)samples[i]=Math.random()*2-1;
   }
   if(this.ctx.state!=='running')await this.ctx.resume();
   this.unlocked=this.ctx.state==='running';this.applyVolume();this.startMusic();return this.unlocked;
  }catch{return false}
 }
 applyVolume(){
  if(!this.ctx)return;const now=this.ctx.currentTime;
  this.master.gain.setTargetAtTime(this.settings.enabled?.7:0,now,.025);
  this.musicBus.gain.setTargetAtTime(this.settings.music*(this.scene==='select'?.48:1),now,.05);
  this.effectsBus.gain.setTargetAtTime(this.settings.effects,now,.02);
 }
 setEnabled(value){this.settings.enabled=!!value;this.save();this.applyVolume();if(!value)this.stopAll();else this.startMusic()}
 setVolume(kind,value){if(!['music','effects'].includes(kind))return;this.settings[kind]=clamp(value);this.save();this.applyVolume()}
 setScene(scene,urgent=false){
  this.urgent=urgent;if(this.scene===scene)return;
  const previous=this.scene;this.scene=scene;
  if(['paused','hidden'].includes(scene)){this.stopAll();}
  else if(['roundEnd','matchEnd'].includes(scene))this.stopMusic();
  else{if(scene==='countdown'&&previous!=='paused'){this.stopMusic();this.step=0;}this.startMusic();}
  this.applyVolume();
 }
 startMusic(){
  if(!this.unlocked||!this.settings.enabled||!['select','countdown','fight'].includes(this.scene)||this.interval)return;
  this.nextTime=this.ctx.currentTime+.04;
  this.interval=setInterval(()=>this.schedule(),25);this.schedule();
 }
 stopMusic(){
  if(this.interval){clearInterval(this.interval);this.interval=null;}
  for(const voice of [...this.voices])if(voice.bus==='music'){try{voice.node.stop()}catch{}}
 }
 stopAll(){this.stopMusic();for(const voice of [...this.voices]){try{voice.node.stop()}catch{}}}
 dispose(){this.stopAll();this.ctx?.close?.();this.unlocked=false}
 voice(node,gain,extra,bus,end){
  const voice={node,bus};this.voices.add(voice);
  node.onended=()=>{this.voices.delete(voice);node.disconnect();gain.disconnect();for(const n of extra)n.disconnect()};
  node.stop(end);
 }
 tone(freq,when,duration,type='sine',volume=.15,bus='effects',endFreq=freq,pan=0){
  if(!this.ctx||!this.unlocked||!this.settings.enabled)return;
  const c=this.ctx,o=c.createOscillator(),g=c.createGain(),p=c.createStereoPanner();o.type=type;o.frequency.setValueAtTime(Math.max(20,freq),when);o.frequency.exponentialRampToValueAtTime(Math.max(20,endFreq),when+duration);
  g.gain.setValueAtTime(.0001,when);g.gain.exponentialRampToValueAtTime(Math.max(.0001,volume),when+.006);g.gain.exponentialRampToValueAtTime(.0001,when+duration);
  p.pan.value=Math.max(-.75,Math.min(.75,pan));o.connect(g);g.connect(p);p.connect(bus==='music'?this.musicBus:this.effectsBus);o.start(when);this.voice(o,g,[p],bus,when+duration+.015);
 }
 noise(when,duration,volume=.15,filter='bandpass',frequency=1200,bus='effects',pan=0){
  if(!this.ctx||!this.unlocked||!this.settings.enabled)return;
  const c=this.ctx,n=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain(),p=c.createStereoPanner();n.buffer=this.noiseBuffer;f.type=filter;f.frequency.value=frequency;f.Q.value=.8;p.pan.value=pan;
  g.gain.setValueAtTime(Math.max(.0001,volume),when);g.gain.exponentialRampToValueAtTime(.0001,when+duration);
  n.connect(f);f.connect(g);g.connect(p);p.connect(bus==='music'?this.musicBus:this.effectsBus);n.start(when);this.voice(n,g,[f,p],bus,when+duration+.01);
 }
 kick(t,bus='music',strength=.45){this.tone(155,t,.22,'sine',strength,bus,42);this.noise(t,.025,.08,'lowpass',1400,bus)}
 snare(t,bus='music'){this.noise(t,.14,.22,'highpass',1700,bus);this.tone(180,t,.09,'triangle',.12,bus,80)}
 bell(note,t,volume=.08,bus='music'){this.tone(hz(note),t,.32,'sine',volume,bus);this.tone(hz(note)*2.76,t,.16,'sine',volume*.22,bus)}
 schedule(){
  if(!this.ctx||this.ctx.state!=='running')return;
  if(this.nextTime<this.ctx.currentTime-.2)this.nextTime=this.ctx.currentTime+.025;
  let count=0;
  while(this.nextTime<this.ctx.currentTime+.12&&count++<8){
   this.musicStep(this.step,this.nextTime);this.step=(this.step+1)%256;this.nextTime+=60/132/4;
  }
 }
 musicStep(step,t){
  // "Candi Senja": 16-bar original A-minor arcade/gamelan-inspired theme, 132 BPM.
  const bar=Math.floor(step/16),s=step%16,root=[45,41,48,43,38,41,40,40][bar%8];
  const lines=[
   [69,72,76,79,76,72,74,76],[69,72,77,76,72,69,67,69],
   [67,72,76,79,84,79,76,72],[67,71,74,79,74,71,69,67],
   [69,74,77,81,77,74,72,69],[69,72,77,81,79,77,76,72],
   [68,71,76,80,83,80,76,71],[76,74,72,71,68,71,74,76]
  ];
  if(s%2===0){let note=lines[bar%8][s/2];if(bar>=8&&s>=8)note+=12;this.bell(note,t,s%4===0?.09:.055);}
  if(s===0||s===8){for(const offset of [0,7,12])this.tone(hz(root+12+offset),t,.72,'triangle',.028,'music')}
  if(this.scene==='select')return;
  if([0,3,6,8,11,14].includes(s)){const note=root+(s===6||s===14?7:0);this.tone(hz(note),t,.14,'sawtooth',.075,'music');this.tone(hz(note)/2,t,.18,'sine',.10,'music')}
  if([0,6,8].includes(s)||this.urgent&&s===14)this.kick(t);
  if(s===4||s===12)this.snare(t);
  if(s%2===0||this.urgent)this.noise(t,s===14?.095:.033,.055,'highpass',6500,'music');
  if(bar%4===3&&s>=14)this.noise(t,.075,.08,'bandpass',2400,'music');
 }
 sfx(type,{kind='punch',element=0,pan=0,combo=1,winner=0,preview=false}={}){
  if(!this.unlocked||!this.settings.enabled||(!preview&&['paused','hidden'].includes(this.scene)))return;
  const now=this.ctx.currentTime,last=this.lastFx.get(type)??-99;
  if(now-last<.035)return;this.lastFx.set(type,now);
  const tone=(f,d,v=.16,wave='sine',end=f,delay=0)=>this.tone(f,now+delay,d,wave,v,'effects',end,pan);
  const noise=(d,v=.15,filter='bandpass',freq=1200,delay=0)=>this.noise(now+delay,d,v,filter,freq,'effects',pan);
  if(type==='select'){tone(620,.055,.06,'sine',850);return}
  if(type==='jump'){noise(.12,.12,'highpass',1600);tone(180,.13,.07,'sine',540);return}
  if(type==='swing'){noise(kind==='kick'?.17:.09,.18,'bandpass',kind==='kick'?650:1600);return}
  if(type==='hit'){
   tone(kind==='kick'?105:160,.16,.38,'sine',38);noise(.085,.28,'bandpass',850);
   if(combo>=3)tone(650+combo*55,.075,.08,'triangle',400);
   return;
  }
  if(type==='block'){noise(.06,.23,'highpass',2700);tone(960,.16,.14,'triangle',480);tone(1510,.09,.055);return}
  if(type==='guardbreak'){noise(.45,.30,'highpass',1500);[900,650,430].forEach((f,i)=>tone(f,.2,.12,'square',f*.5,i*.05));return}
  if(type==='special'||type==='ultimate'){
   const strong=type==='ultimate',base=[330,90,620,220][element]||330;
   if(element===0){[0,7,12,19].forEach((n,i)=>this.bell(64+n,now+i*.045,strong?.22:.13,'effects'));tone(90,.4,.15,'sine',360)}
   if(element===1){noise(strong?.8:.35,strong?.45:.3,'lowpass',900);tone(130,.4,.38,'sawtooth',30)}
   if(element===2){[0,1,2,3].forEach(i=>tone(base+i*180,.11,.12,'square',180,i*.035));noise(.22,.15,'highpass',4500)}
   if(element===3){noise(.3,.3,'bandpass',1900);tone(650,.27,.18,'sawtooth',95)}
   if(strong){this.kick(now,'effects',.6);tone(55,.65,.38,'sine',28);this.noise(now+.1,.6,.2,'highpass',3000,'effects',pan)}
   return;
  }
  if(type==='summon'){[69,72,76,81].forEach((n,i)=>this.bell(n,now+i*.07,.13,'effects'));return}
  if(type==='round'){[57,64,69].forEach((n,i)=>tone(hz(n),.14,.12,'triangle',hz(n),i*.22));return}
  if(type==='fight'){this.kick(now,'effects',.5);tone(440,.25,.15,'square',220);return}
  if(type==='result'){
   const notes=winner===0?[69,72,76,81,84]:winner===null?[69,72,69]:[69,67,64,60,57];
   notes.forEach((n,i)=>{this.bell(n,now+i*.15,.20,'effects');tone(hz(n-12),.3,.1,'triangle',hz(n-12),i*.15)});
   this.kick(now,'effects',.4);
  }
 }
}

