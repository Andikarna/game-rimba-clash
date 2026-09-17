import { ROSTER, RULES, BASIC } from './roster.js';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
/**
 * Deterministic combat model. Rendering and DOM are deliberately separate.
 * Coordinates use feet position; y decreases while airborne.
 * update() accepts elapsed seconds and actions, permitting headless balance tests.
 */
export class FightEngine {
 constructor(random=Math.random){this.random=random;this.phase='select';this.fighters=[];this.events=[];this.effects=[];this.projectiles=[];this.time=0;this.wins=[0,0];this.round=1;this.difficulty='normal';this.freeze=0;this.shake=0;this.result=null;}
 emit(type,data={}){this.events.push({type,...data})}
 start(p1,p2,difficulty='normal'){
  if(!Number.isInteger(p1)||!Number.isInteger(p2)||!ROSTER[p1]||!ROSTER[p2])throw Error('Petarung tidak valid');
  if(!['easy','normal','hard'].includes(difficulty))throw Error('Kesulitan tidak valid');
  this.picks=[p1,p2];this.difficulty=difficulty;this.wins=[0,0];this.round=1;this.newRound();
 }
 createFighter(id,index){const d=ROSTER[id];return{data:d,index,x:index?940:340,y:RULES.floor,vy:0,vx:0,dir:index?-1:1,hp:d.hp,energy:25,guard:100,guardBreak:0,blocking:false,stun:0,invul:0,slow:0,burn:0,shield:0,summon:0,summonTick:0,cooldown:0,attack:null,combo:0,comboTime:0,comboDamage:0,flash:0,aiTimer:.5,aiInput:{},buffer:null,bufferTime:0};}
 newRound(){
  this.fighters=this.picks.map((id,i)=>this.createFighter(id,i));this.time=RULES.roundSeconds;this.phase='countdown';this.countdown=2.5;this.projectiles=[];this.effects=[];this.events=[];this.freeze=0;this.shake=0;this.result=null;this.emit('round',{round:this.round});
 }
 pause(){if(['fight','countdown'].includes(this.phase)){this.beforePause=this.phase;this.phase='paused';return true}return false}
 resume(){if(this.phase==='paused'){this.phase=this.beforePause;return true}return false}
 nextRound(){if(this.phase==='roundEnd'){if(this.result?.winner!==null)this.round++;this.newRound()}else if(this.phase==='matchEnd')this.start(...this.picks,this.difficulty)}
 select(){this.phase='select';this.events=[];this.effects=[];this.projectiles=[]}
 grounded(f){return f.y>=RULES.floor-.1}
 height(f){return f.data.id==='fahrudin'?265:f.data.id==='lukman'?172:235}
 canAct(f){return !f.attack&&f.stun<=0&&f.guardBreak<=0&&f.hp>0}
 tryAttack(f,kind){
  if(this.phase!=='fight'||!this.canAct(f))return false;
  const basic=BASIC[kind],ultimate=kind==='ultimate',skill=kind==='special';
  if(!basic&&!ultimate&&!skill)return false;
  if((skill&&(f.energy<RULES.specialCost||f.cooldown>0))||(ultimate&&f.energy<RULES.ultimateCost))return false;
  const spec=basic?{...basic,type:'melee'}:{...(ultimate?f.data.ultimate:f.data.special),startup:ultimate?.22:.19,active:.12,recovery:ultimate?.5:.33,range:230,stun:ultimate?.35:.25,gain:0};
  if(skill){f.energy-=RULES.specialCost;f.cooldown=f.data.special.cooldown}
  if(ultimate){f.energy=0;this.emit('ultimate',{index:f.index,name:spec.name});this.shake=.22;}
  f.attack={...spec,kind,t:0,hit:false,fired:false,pulse:0,nextPulse:0,ultimate};
  f.blocking=false;
  this.emit('attack',{index:f.index,kind});
  return true;
 }
 ai(f,o,dt){
  f.aiTimer-=dt;if(f.aiTimer>0)return f.aiInput;
  const cfg={easy:{reaction:.46,block:.16,skill:.3},normal:{reaction:.27,block:.45,skill:.55},hard:{reaction:.15,block:.72,skill:.8}}[this.difficulty];
  f.aiTimer=cfg.reaction+this.random()*.18;
  const distance=Math.abs(f.x-o.x),toward=Math.sign(o.x-f.x),r=this.random(),input={move:distance>135?toward:0};
  const threat=o.attack||this.projectiles.some(p=>p.owner!==f.index&&Math.abs(p.x-f.x)<280);
  if(threat&&this.grounded(f)&&r<cfg.block){input.block=true;input.move=0;}
  else if(this.canAct(f)){
   if(f.energy>=100&&distance<430)input.attack='ultimate';
   else if(f.energy>=25&&f.cooldown<=0&&r<cfg.skill)input.attack='special';
   else if(distance<177)input.attack=r<.55?'punch':'kick';
   if(distance<230&&r>.85)input.jump=true;
   if(f.data.role==='ZONER'&&distance<270&&r>.35)input.move=-toward;
   if(this.projectiles.some(p=>p.ground&&p.owner!==f.index&&Math.abs(p.x-f.x)<260))input.jump=true;
  }
  f.aiInput=input;return input;
 }
 update(dt,input={}){
  dt=clamp(dt,0,.04);if(['paused','select','roundEnd','matchEnd'].includes(this.phase))return;
  if(this.phase==='countdown'){this.countdown-=dt;if(this.countdown<=0){this.phase='fight';this.emit('fight')}return}
  this.shake=Math.max(0,this.shake-dt);
  // Short hit-stop affects animation and physics equally, never wall-clock timers.
  if(this.freeze>0){this.freeze-=dt;return}
  this.time=Math.max(0,this.time-dt);
  const a=this.fighters[0],b=this.fighters[1];
  const inputs=[input,this.ai(b,a,dt)];
  for(const f of this.fighters){
   const o=this.fighters[1-f.index],control=inputs[f.index];
   for(const key of ['stun','invul','slow','shield','cooldown','comboTime','flash','guardBreak','bufferTime'])f[key]=Math.max(0,f[key]-dt);
   if(!f.comboTime){f.combo=0;f.comboDamage=0}
   f.energy=clamp(f.energy+RULES.energyPerSecond*dt,0,100);
   if(f.burn>0){f.burn=Math.max(0,f.burn-dt);f.hp=Math.max(0,f.hp-12*dt)}
   if(!f.attack)f.dir=o.x>=f.x?1:-1;
   f.blocking=!!control.block&&this.canAct(f)&&this.grounded(f);
   if(!f.blocking)f.guard=clamp(f.guard+20*dt,0,100);
   if(control.attack){f.buffer=control.attack;f.bufferTime=.12}
   if(f.bufferTime>0&&this.canAct(f)&&!f.blocking){if(this.tryAttack(f,f.buffer))f.bufferTime=0}
   f.vx=0;
   if(this.canAct(f)&&!f.blocking){
    f.vx=(control.move||0)*f.data.speed*(f.slow>0?.55:1);
    if(control.jump&&this.grounded(f)){f.vy=-750;this.emit('jump',{index:f.index})}
   }
   f.x=clamp(f.x+f.vx*dt,RULES.left,RULES.right);
   f.vy+=RULES.gravity*dt;f.y=Math.min(RULES.floor,f.y+f.vy*dt);if(this.grounded(f))f.vy=0;
   if(f.summon>0){f.summon=Math.max(0,f.summon-dt);f.summonTick-=dt;if(f.summonTick<=0){f.summonTick=.72;this.projectile(f,{damage:f.data.special.damage,speed:570,ally:true,x:f.x-f.dir*65,y:f.y-95,fx:3});}}
   if(f.attack)this.updateAttack(f,o,dt);
  }
  // Pushboxes keep grounded fighters apart while jumps and teleports can cross sides.
  if(Math.abs(a.x-b.x)<85&&Math.abs(a.y-b.y)<85){
   const sign=a.x<=b.x?-1:1,overlap=(85-Math.abs(a.x-b.x))/2;
   a.x=clamp(a.x+sign*overlap,RULES.left,RULES.right);b.x=clamp(b.x-sign*overlap,RULES.left,RULES.right);
  }
  for(const p of this.projectiles){
   p.life-=dt;p.x+=p.vx*dt;p.y+=(p.vy??0)*dt;if((p.vy??0)>0)p.vy=Math.min(p.vy+350*dt,950);
   const o=this.fighters[1-p.owner],f=this.fighters[p.owner];
   const hitY=p.ground?this.grounded(o):p.y>=o.y-this.height(o)&&p.y<=o.y+30;
   if(p.life>0&&Math.abs(p.x-o.x)<p.radius+38&&hitY){this.hit(f,o,p.damage,{status:p.status,stun:.25,knock:p.big?45:18,origin:p.x,ultimate:p.big});p.life=0;this.effect(p.x,p.y,p.fx,p.big?230:110);}
  }
  this.projectiles=this.projectiles.filter(p=>p.life>0&&p.x>-150&&p.x<1430&&p.y<RULES.floor+60);
  for(const e of this.effects)e.life-=dt;this.effects=this.effects.filter(e=>e.life>0);
  if(a.hp<=0||b.hp<=0||this.time<=0)this.finishRound();
 }
  projectile(f,s={}){
   this.projectiles.push({owner:f.index,x:s.x??f.x+f.dir*65,y:s.y??f.y-125,vx:s.vx!==undefined?s.vx:f.dir*(s.speed??530),vy:s.vy??0,life:s.life??3,damage:s.damage??60,status:s.status,ground:s.ground??false,ally:s.ally??false,fx:s.fx??f.data.effect,radius:s.big?95:s.radius??26,big:s.big??false,isRisol:s.isRisol??false});
  }
 effect(x,y,fx,size=130){this.effects.push({x,y,fx,size,life:.36,max:.36,angle:(this.random()-.5)*.4})}
 updateAttack(f,o,dt){
  const at=f.attack;at.t+=dt;
  if(at.type==='melee'){
   if(at.t>=at.startup&&at.t<at.startup+at.active&&!at.hit){
    if((o.x-f.x)*f.dir>=-20&&Math.abs(o.x-f.x)<at.range*f.data.reach&&Math.abs(o.y-f.y)<145){at.hit=true;this.hit(f,o,at.damage,{stun:at.stun,gain:at.gain,knock:at.kind==='kick'?26:14});}
   }
  }else if(at.t>=at.startup&&!at.fired){
   at.fired=true;this.effect(f.x+f.dir*60,f.y-120,f.data.effect,at.ultimate?210:115);
   if(at.type==='summon'){f.summon=6;f.summonTick=.25;this.emit('skill',{index:f.index,name:'LUKMAN DIPANGGIL'});}
   if(at.type==='shield'){f.shield=4;this.emit('skill',{index:f.index,name:'PERISAI BUMI'});}
   if(at.type==='projectile'||at.type==='beam')this.projectile(f,{damage:at.damage,status:at.status,big:at.type==='beam',speed:at.type==='beam'?690:530,isRisol:f.data.id==='lala'});
   if(at.type==='teleport'||(at.type==='flurry'&&f.data.id==='sekar')){f.x=clamp(o.x-o.dir*105,RULES.left,RULES.right);f.dir=Math.sign(o.x-f.x)||1;f.invul=.15;this.effect(f.x,f.y-120,3,200);}
   if(at.type==='teleport'&&Math.abs(f.x-o.x)<200&&Math.abs(f.y-o.y)<180)this.hit(f,o,at.damage,{stun:.3,knock:18});
   if(at.type==='slam'&&Math.abs(f.x-o.x)<300&&Math.abs(f.y-o.y)<220){this.hit(f,o,at.damage,{stun:.55,knock:110,ultimate:true});this.shake=.35;}
   if(at.type==='barrage'&&f.data.id==='irma')f.hp=clamp(f.hp+100,0,f.data.hp);
  }
  if(at.fired&&at.type==='dash'&&at.t<at.startup+.28){
   f.x=clamp(f.x+f.dir*760*dt,RULES.left,RULES.right);
   if(!at.hit&&Math.abs(f.x-o.x)<140&&Math.abs(f.y-o.y)<170){at.hit=true;this.hit(f,o,at.damage,{status:at.status,stun:.3,knock:45});}
  }
  if(at.fired&&['flurry','barrage','quake','rain'].includes(at.type)){
   at.nextPulse-=dt;
   const total=at.type==='flurry'?6:at.type==='barrage'?5:at.type==='rain'?5:at.ultimate?3:1;
   if(at.type==='flurry'&&Math.abs(f.x-o.x)>105)f.x=clamp(f.x+f.dir*520*dt,RULES.left,RULES.right);
   if(at.nextPulse<=0&&at.pulse<total){
    at.nextPulse=at.type==='flurry'?.14:.22;at.pulse++;
    if(at.type==='flurry'&&Math.abs(f.x-o.x)<190&&Math.abs(f.y-o.y)<175)this.hit(f,o,at.damage,{stun:.15,knock:4,ultimate:true});
    if(at.type==='barrage')this.projectile(f,{damage:at.damage,status:at.status??f.data.ultimate?.status,y:f.y-100-(at.pulse%2)*30,speed:620});
    if(at.type==='quake'){this.projectile(f,{damage:at.damage,ground:true,y:RULES.floor-15,speed:440,big:at.ultimate});this.shake=.14;}
    if(at.type==='rain'){const spreadX=(at.pulse-3)*55+(this.random()-.5)*90;this.projectile(f,{damage:at.damage,status:f.data.ultimate?.status,x:o.x+spreadX,y:-70,vx:0,vy:600,isRisol:true,radius:32,life:2});this.shake=.06;}
   }
   if(at.pulse<total||at.nextPulse>0)return;
  }
  const duration=at.startup+at.active+at.recovery;
  if(at.t>=duration)f.attack=null;
 }
 hit(f,o,raw,options={}){
  if(o.invul>0||o.hp<=0)return false;
  const facing=(options.origin??f.x)-o.x;
  const blocked=o.blocking&&Math.sign(facing)===o.dir&&this.grounded(o)&&o.guardBreak<=0;
  let damage=raw*f.data.power*o.data.armor*(o.shield>0?.45:1);
  if(blocked){
   damage*=RULES.guardReduction;o.guard=Math.max(0,o.guard-raw*.8);
   this.emit('block',{index:o.index});this.effect(o.x+o.dir*35,o.y-125,2,90);
   if(o.guard<=0){o.guardBreak=.9;o.stun=.9;o.blocking=false;this.emit('guardbreak',{index:o.index})}
  }else{
   // Combo scaling limits repeated specials while allowing readable hit confirms.
   damage*=Math.max(.55,1-f.combo*.065);
   o.stun=Math.max(o.stun,options.stun??.22);o.attack=null;o.bufferTime=0;o.vy=Math.min(o.vy,0);
   f.combo=f.comboTime>0?f.combo+1:1;f.comboTime=.72;f.comboDamage+=Math.round(damage);
   o.flash=.14;this.effect(o.x,o.y-120,f.data.effect,options.ultimate?170:105);
   if(options.status==='burn')o.burn=2;
   if(options.status==='slow')o.slow=2.5;
   if(options.status==='stun')o.stun=Math.max(o.stun,.42);
   this.emit('hit',{index:f.index,damage:Math.round(damage),combo:f.combo,kind:options.kind??f.attack?.kind??'special'});
  }
  o.hp=clamp(o.hp-damage,0,o.data.hp);o.invul=.065;
  o.x=clamp(o.x+Math.sign(o.x-f.x)*(options.knock??18)*(blocked?.4:1),RULES.left,RULES.right);
  f.energy=clamp(f.energy+(options.gain??5),0,100);o.energy=clamp(o.energy+damage*.065,0,100);
  this.freeze=blocked?.025:.045;this.shake=Math.max(this.shake,blocked?.04:.09);
  return true;
 }
 finishRound(){
  const [a,b]=this.fighters,ratio=a.hp/a.data.hp-b.hp/b.data.hp;
  const winner=Math.abs(ratio)<.00001?null:ratio>0?0:1;
  if(winner!==null)this.wins[winner]++;
  const complete=this.wins.some(n=>n>=RULES.winsToMatch);
  this.result={winner,reason:this.time<=0?'TIME UP':'K.O.',complete};
  this.phase=complete?'matchEnd':'roundEnd';this.emit('result',this.result);
 }
 snapshot(){return{phase:this.phase,round:this.round,time:Math.ceil(this.time),wins:[...this.wins],fighters:this.fighters.map(f=>({id:f.data.id,hp:Math.ceil(f.hp),maxHp:f.data.hp,energy:Math.floor(f.energy),cooldown:Number(f.cooldown.toFixed(1)),combo:f.combo,shield:f.shield>0,summon:f.summon>0}))};}
}
