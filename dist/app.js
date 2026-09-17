import {ROSTER} from './roster.js';
import {FightEngine} from './engine.js';
import {Renderer} from './render.js';
import {GameAudio} from './audio.js';
const soundtrack=new GameAudio();
const $=id=>document.getElementById(id);
const engine=new FightEngine(),renderer=new Renderer($('fight'),engine);
let selected=0,target=0,picks=[0,2],ready=false,keys={},jump=false,last=0,acc=0,notice='',noticeUntil=0;
let portraitCanvas=document.createElement('canvas');
portraitCanvas.width=540;portraitCanvas.height=330;$('portrait').append(portraitCanvas);
const isActive=()=>!['select','roundEnd','matchEnd'].includes(engine.phase);
function notify(text,seconds=1.5){notice=text;noticeUntil=performance.now()+seconds*1000;}
function select(i){
 if(engine.phase!=='select')return;
 selected=i;picks[target]=i;const f=ROSTER[i];document.documentElement.style.setProperty('--accent',f.color);
 $('fighter-class').textContent=f.role;$('fighter-number').textContent=String(i+1).padStart(2,'0')+' / '+String(ROSTER.length).padStart(2,'0');$('fighter-name').textContent=f.name;$('fighter-title').textContent=f.title.toUpperCase();$('fighter-story').textContent=f.story;
 $('selected-p1').textContent=ROSTER[picks[0]].short;$('selected-p2').textContent=ROSTER[picks[1]].short;
 $('stats').innerHTML=['POWER','SPEED','DEFENSE'].map((s,j)=>'<div><div class="stat-label">'+s+'<span>'+f.stats[j]+'/5</span></div><div class="stat-bars">'+[0,1,2,3,4].map(n=>'<i class="'+(n<f.stats[j]?'on':'')+'"></i>').join('')+'</div></div>').join('');
 $('skills').innerHTML='<div class="skill-row"><span>J/K</span><div><b>Pukul & Tendang</b><p>Serangan dasar · Combo jarak dekat</p></div></div><div class="skill-row"><span>L</span><div><b>'+f.special.name+'</b><p>'+f.special.description+'</p></div></div><div class="skill-row"><span>I</span><div><b>'+f.ultimate.name+'</b><p>'+f.ultimate.description+'</p></div></div>';
 renderRoster();if(ready)renderer.portrait(portraitCanvas,f.id);soundtrack.sfx('select');
}
function renderRoster(){
 $('roster').innerHTML=ROSTER.map((f,i)=>'<button class="fighter-card '+(i===picks[0]?'selected':'')+' '+(i===picks[1]?'opponent':'')+'" style="--fighter-color:'+f.color+'" data-index="'+i+'" aria-label="Pilih '+f.name+'" '+(engine.phase!=='select'?'disabled':'')+'><span class="card-index">0'+(i+1)+'</span><canvas class="card-portrait" width="220" height="270"></canvas><span class="card-label"><strong>'+f.short+'</strong><small>'+f.role+'</small></span>'+(i===picks[0]?'<span class="card-badge">P1</span>':i===picks[1]?'<span class="card-badge cpu">CPU</span>':'')+'</button>').join('');
 document.querySelectorAll('.fighter-card').forEach(b=>{const i=Number(b.dataset.index);b.onclick=()=>select(i);if(ready)renderer.portrait(b.querySelector('canvas'),ROSTER[i].id)});
}
function setTarget(value){
 if(engine.phase!=='select')return;target=value;$('select-p1').classList.toggle('active',target===0);$('select-p2').classList.toggle('active',target===1);$('selection-target').textContent=target?'MEMILIH: LAWAN AI':'MEMILIH: PLAYER 01';select(picks[target]);
}
function lockSelection(lock){for(const id of ['select-p1','select-p2','difficulty','play-btn'])$(id).disabled=lock;renderRoster()}
function begin(){
 if(!ready||engine.phase!=='select')return;
 engine.start(...picks,$('difficulty').value);keys={};jump=false;acc=0;notice='';$('arena-intro').hidden=true;$('fight-hud').hidden=false;$('meter-hud').hidden=false;$('match-modal').hidden=true;$('pause-btn').disabled=false;lockSelection(true);$('fight').focus();$('arena').scrollIntoView({block:'center',behavior:'smooth'});void soundtrack.unlock().then(ok=>{if(!ok)notify('Ketuk tombol Audio untuk mengaktifkan suara',2)});
}
function pause(){
 if(engine.phase==='paused'){resume();return}
 if(engine.pause()){soundtrack.setScene('paused');keys={};jump=false;$('result-tag').textContent='ISTIRAHAT SEJENAK';$('result-title').textContent='PAUSED';$('result-text').textContent='Tekan Esc atau Lanjutkan untuk kembali ke pertarungan.';$('continue-btn').textContent='Lanjutkan →';$('match-modal').hidden=false;$('pause-btn').textContent='▶';}
}
function resume(){void soundtrack.unlock();engine.resume();$('match-modal').hidden=true;$('pause-btn').textContent='Ⅱ';$('fight').focus();acc=0;last=performance.now();}
function backToRoster(){
 engine.select();keys={};jump=false;notice='';$('match-modal').hidden=true;$('fight-hud').hidden=true;$('meter-hud').hidden=true;$('arena-intro').hidden=false;$('pause-btn').disabled=true;$('pause-btn').textContent='Ⅱ';lockSelection(false);setTarget(0);
}
function onEvent(ev){
 const fighter=engine.fighters[ev.index??0];
 const options={pan:((fighter?.x??640)-640)/850,element:fighter?.data.effect??0,kind:ev.kind||'punch',combo:ev.combo||1};
 if(ev.type==='attack'){
  if(ev.kind==='special')soundtrack.sfx('special',options);
  else if(ev.kind!=='ultimate')soundtrack.sfx('swing',options);
 }
 if(['hit','block','jump','round'].includes(ev.type))soundtrack.sfx(ev.type,options);
 if(ev.type==='fight'){notify('FIGHT!',.75);soundtrack.sfx('fight');}
 if(ev.type==='ultimate'){notify(ev.name.toUpperCase(),1.1);soundtrack.sfx('ultimate',options);}
 if(ev.type==='skill'){notify(ev.name,1);if(ev.name.includes('LUKMAN'))soundtrack.sfx('summon',options);}
 if(ev.type==='guardbreak'){notify('GUARD BREAK',.7);soundtrack.sfx('guardbreak',options);}
 if(ev.type==='result'){
  keys={};$('pause-btn').disabled=true;
  const win=ev.winner,character=win===null?null:engine.fighters[win].data;
  $('result-tag').textContent=ev.reason+' · '+engine.wins[0]+' — '+engine.wins[1];
  $('result-title').textContent=win===null?'DRAW':ev.complete?(win===0?'VICTORY':'DEFEAT'):(win===0?'RONDE DIMENANGKAN':'RONDE KALAH');
  $('result-text').textContent=win===null?'Kekuatan seimbang. Ronde diulang tanpa menambah skor.':ev.complete?character.ending:character.name+' memenangkan ronde ini. Siapkan strategi untuk ronde berikutnya.';
  $('continue-btn').textContent=ev.complete?'Tanding ulang →':win===null?'Ulangi ronde →':'Ronde berikutnya →';
  $('match-modal').hidden=false;soundtrack.sfx('result',{winner:win});
 }
}
function updateUI(){
 const active=engine.fighters.length&&engine.phase!=='select';
 if(active){
  engine.fighters.forEach((f,i)=>{const pre='p'+(i+1);$(pre+'-name').textContent=f.data.name;$(pre+'-health').style.width=Math.max(0,f.hp/f.data.hp*100)+'%';$(pre+'-health').parentElement.setAttribute('aria-label',Math.ceil(f.hp)+' / '+f.data.hp+' HP');$(pre+'-rounds').textContent=engine.wins[i]===0?'○ ○':engine.wins[i]===1?'● ○':'● ●';$(pre+'-energy').style.width=f.energy+'%';$(pre+'-energy').style.background=f.energy>=100?'#e5ff62':'#84d6ff';$(pre+'-energy-label').textContent=Math.floor(f.energy)+'%';$(pre+'-status').textContent=f.guardBreak>0?'GUARD PECAH':f.shield>0?'PERISAI '+f.shield.toFixed(1)+'s':f.summon>0?'LUKMAN '+f.summon.toFixed(1)+'s':f.cooldown>0?'SKILL '+f.cooldown.toFixed(1)+'s':f.energy>=100?'I · ULTIMATE SIAP':f.energy>=25?'L · '+f.data.special.name.toUpperCase():'ENERGI BELUM CUKUP';});
  $('timer').textContent=Math.ceil(engine.time);$('round-label').textContent='ROUND '+String(engine.round).padStart(2,'0');
 }
 let message='';
 if(engine.phase==='countdown')message=engine.countdown>1?'ROUND '+engine.round:'READY';
 else if(engine.phase==='fight'&&performance.now()<noticeUntil)message=notice;
 $('battle-message').textContent=message;
 $('caption').textContent=engine.phase==='select'?'▪ Pilih petarung dan lawanmu':engine.phase==='paused'?'▪ Pertarungan dijeda':engine.phase==='fight'?'▪ '+ROSTER[picks[0]].short+' VS '+ROSTER[picks[1]].short+' · '+$('difficulty').selectedOptions[0].textContent:'▪ Arena para legenda';
}
function input(){return{move:(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),jump,block:!!(keys.s||keys.arrowdown),attack:keys.i?'ultimate':keys.l?'special':keys.k?'kick':keys.j?'punch':undefined}}
function frame(now){
 const dt=Math.min((now-last)/1000||0,.08);last=now;acc+=dt;let guard=0;
 while(acc>=1/120&&guard++<12){engine.update(1/120,input());jump=false;acc-=1/120;}
 soundtrack.setScene(document.hidden?'hidden':engine.phase,engine.phase==='fight'&&engine.time<=15);
 for(const event of engine.events.splice(0))onEvent(event);
 renderer.draw(engine.phase==='paused'?0:dt,picks);updateUI();requestAnimationFrame(frame);
}
function keyDown(key){
 if(key==='escape'){pause();return}
 if(!isActive()||engine.phase==='paused')return;
 if(['w','arrowup',' '].includes(key)&&!keys[key])jump=true;
 if((key==='l'||key==='i')&&!keys[key]&&engine.phase==='fight'){
  const f=engine.fighters[0];if(key==='l'&&(f.energy<25||f.cooldown>0))notify(f.cooldown>0?'SKILL MASIH PULIH':'BUTUH 25 ENERGI',.7);
  if(key==='i'&&f.energy<100)notify('ULTIMATE: BUTUH 100 ENERGI',.7);
 }
 keys[key]=true;
}
const gameKeys=['a','d','w','s','j','k','l','i',' ','arrowleft','arrowright','arrowup','arrowdown','escape'];
window.addEventListener('keydown',event=>{const key=event.key.toLowerCase();if($('help').open||$('audio-settings').open)return;if(gameKeys.includes(key)&&isActive()){event.preventDefault();if(!event.repeat)keyDown(key)}});
window.addEventListener('keyup',event=>{keys[event.key.toLowerCase()]=false;});
window.addEventListener('blur',()=>{keys={};jump=false;if(['fight','countdown'].includes(engine.phase))pause()});
document.addEventListener('visibilitychange',()=>{if(document.hidden)soundtrack.setScene('hidden');if(document.hidden&&['fight','countdown'].includes(engine.phase))pause()});
document.querySelectorAll('[data-key]').forEach(button=>{
 button.addEventListener('pointerdown',event=>{event.preventDefault();button.setPointerCapture(event.pointerId);keyDown(button.dataset.key)});
 for(const name of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(name,()=>{keys[button.dataset.key]=false});
});
$('select-p1').onclick=()=>setTarget(0);$('select-p2').onclick=()=>setTarget(1);
$('play-btn').onclick=begin;$('pause-btn').onclick=pause;$('roster-btn').onclick=backToRoster;
$('continue-btn').onclick=()=>{if(engine.phase==='paused'){resume();return}engine.nextRound();$('match-modal').hidden=true;$('pause-btn').disabled=false;notice='';keys={};jump=false;$('fight').focus()};
$('help-btn').onclick=()=>{if(['fight','countdown'].includes(engine.phase))pause();$('help').showModal()};$('help-close').onclick=()=>$('help').close();
function audioUI(){
 const settings=soundtrack.settings;
 $('audio-enabled').checked=settings.enabled;
 $('music-volume').value=Math.round(settings.music*100);$('effects-volume').value=Math.round(settings.effects*100);
 $('music-value').textContent=Math.round(settings.music*100)+'%';$('effects-value').textContent=Math.round(settings.effects*100)+'%';
 $('audio-btn').innerHTML='♪ <span>'+ (settings.enabled?'Audio':'Audio mati')+'</span>';
 $('audio-btn').setAttribute('aria-label','Pengaturan audio'+(settings.enabled?'':' — suara dimatikan'));
}
$('audio-btn').onclick=()=>{
 if(['fight','countdown'].includes(engine.phase))pause();
 void soundtrack.unlock().then(ok=>{$('audio-note').textContent=ok?'Musik dan efek memakai volume terpisah.':'Audio belum aktif. Coba tombol Tes suara.'});
 $('audio-settings').showModal();audioUI();
};
$('audio-close').onclick=()=>$('audio-settings').close();
$('audio-enabled').onchange=event=>{soundtrack.setEnabled(event.target.checked);if(event.target.checked)void soundtrack.unlock();audioUI()};
for(const channel of ['music','effects'])$(channel+'-volume').oninput=event=>{soundtrack.setVolume(channel,Number(event.target.value)/100);audioUI()};
$('audio-test').onclick=async()=>{const ok=await soundtrack.unlock();if(ok)soundtrack.sfx('hit',{preview:true});$('audio-note').textContent=!soundtrack.settings.enabled?'Aktifkan suara untuk mencoba efek.':ok?'Efek pukulan diputar.':'Browser belum mengizinkan audio. Ketuk lagi untuk mencoba.'};
window.addEventListener('pagehide',()=>soundtrack.setScene('hidden'));
audioUI();
$('fullscreen-btn').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if($('arena').requestFullscreen)await $('arena').requestFullscreen();else notify('Layar penuh tidak didukung',2)}catch{notify('Layar penuh tidak tersedia',2)}};
select(0);$('play-btn').disabled=true;
renderer.load((n,total)=>{$('play-btn').textContent='MEMUAT ASET '+n+' / '+total}).then(()=>{ready=true;select(selected);$('play-btn').disabled=false;$('play-btn').innerHTML='MASUK ARENA <span>↗</span>'}).catch(error=>{$('caption').textContent=error.message+'. Muat ulang halaman untuk mencoba lagi.';$('play-btn').textContent='Muat ulang';$('play-btn').disabled=false;$('play-btn').onclick=()=>location.reload()});
requestAnimationFrame(frame);
// Optional WebMCP actions share the same UI actions and validate all inputs.
if(document.modelContext?.registerTool){
 const tools=[
 {name:'read_fight_state',description:'Read selected fighters and current round state.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>({selected:picks.map(i=>ROSTER[i].id),...engine.snapshot()})},
 {name:'select_fighters',description:'Choose player and AI fighters before a match.',inputSchema:{type:'object',properties:{player:{type:'string',enum:ROSTER.map(f=>f.id)},opponent:{type:'string',enum:ROSTER.map(f=>f.id)}},required:['player','opponent'],additionalProperties:false},annotations:{readOnlyHint:false},execute:args=>{if(engine.phase!=='select')throw Error('Kembali ke pilihan petarung dahulu');if(!args||Object.keys(args).some(k=>!['player','opponent'].includes(k)))throw Error('Argumen tidak valid');const a=ROSTER.findIndex(f=>f.id===args.player),b=ROSTER.findIndex(f=>f.id===args.opponent);if(a<0||b<0)throw Error('Petarung tidak valid');picks=[a,b];target=0;select(a);return{player:args.player,opponent:args.opponent}}},
 {name:'start_fight',description:'Start the currently selected duel against AI.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:false},execute:args=>{if(args&&Object.keys(args).length)throw Error('Tanpa argumen');if(!ready||engine.phase!=='select')throw Error('Arena belum siap');begin();return engine.snapshot()}}
 ];
 for(const tool of tools){try{Promise.resolve(document.modelContext.registerTool(tool)).catch(()=>{})}catch{}}
}

