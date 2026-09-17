import {ROSTER,RULES} from './roster.js';
// Frame rectangles preserve authored PNGs; the renderer selects poses at runtime.
export const ATLAS={
 irma:{top:210,bottom:810,x:[0,355,785,1100,1536],anchor:[175,540,900,1285]},
 lukman:{top:255,bottom:745,x:[0,345,770,1090,1536],anchor:[170,535,900,1275]},
 fahrudin:{top:205,bottom:780,x:[0,330,775,1110,1536],anchor:[165,535,910,1300]},
 raka:{top:240,bottom:790,x:[0,345,750,1090,1536],anchor:[170,520,880,1275]},
 nadira:{top:245,bottom:835,x:[0,390,775,1090,1536],anchor:[180,530,905,1280]},
 bayu:{top:255,bottom:812,x:[0,330,755,1070,1536],anchor:[165,520,880,1280]},
 sekar:{top:270,bottom:805,x:[0,385,775,1130,1536],anchor:[185,555,910,1310]},
 guntur:{top:250,bottom:785,x:[0,345,775,1100,1536],anchor:[175,535,910,1305]},
 lala:{top:20,bottom:1010,x:[0,384,768,1152,1536],anchor:[192,560,910,1330]}
};
export class Renderer{
 constructor(canvas,engine){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.engine=engine;this.images={};this.clock=0;this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;}
 async load(onProgress=()=>{}){
  const names=[...ROSTER.map(f=>f.id),'fx','arena'];let count=0;
  await Promise.all(names.map(id=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{this.images[id]=img;onProgress(++count,names.length);resolve()};img.onerror=()=>reject(Error('Gagal memuat '+id+'.png'));img.src='assets/'+id+'.png'})));
 }
 sprite(context,id,pose,x,y,height,dir=1,opts={}){
  const image=this.images[id];if(!image)return;
  const a=ATLAS[id],left=a.x[pose],right=a.x[pose+1],sourceHeight=a.bottom-a.top,scale=height/sourceHeight;
  context.save();context.translate(x,y);context.scale(dir*(opts.sx||1),opts.sy||1);if(opts.rotate)context.rotate(opts.rotate);if(opts.alpha!==undefined)context.globalAlpha=opts.alpha;
  if(opts.flash)context.filter='brightness(1.7)';
  const dx=(left-a.anchor[pose])*scale,dy=-height,w=(right-left)*scale;
  // Kick poses have a broad upper silhouette but a narrow supporting leg.
  if(pose===2){context.beginPath();context.moveTo(dx,dy);context.lineTo(dx+w,dy);context.lineTo(dx+w,dy+height*.35);context.lineTo(dx+w*.77,dy+height*.7);context.lineTo(dx+w*.77,0);context.lineTo(dx,0);context.closePath();context.clip();}
  context.drawImage(image,left,a.top,right-left,sourceHeight,dx,dy,w,height);
  context.restore();
 }
 portrait(canvas,id){const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);this.sprite(c,id,0,canvas.width*.5,canvas.height*1.55,canvas.height*1.45);}
 fx(x,y,index,size,alpha=1,rotate=0){
  const c=this.ctx,im=this.images.fx;if(!im)return;c.save();c.translate(x,y);c.rotate(rotate);c.globalAlpha=alpha;c.globalCompositeOperation='screen';c.drawImage(im,index*384,180,384,650,-size*.5,-size*.6,size,size*1.2);c.restore();
 }
 draw(dt,picks=[0,2]){
  this.clock+=dt;const c=this.ctx,e=this.engine;const w=1280,h=720;c.clearRect(0,0,w,h);
  if(this.images.arena)c.drawImage(this.images.arena,0,0,w,h);
  else{const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#302939');g.addColorStop(1,'#6c5143');c.fillStyle=g;c.fillRect(0,0,w,h);}
  c.fillStyle='#17122225';c.fillRect(0,0,w,h);
  if(e.phase==='select'){
   this.sprite(c,ROSTER[picks[1]].id,0,985,615,340,-1,{alpha:.85});
   return;
  }
  c.save();if(e.shake>0&&!this.reduced)c.translate(Math.sin(this.clock*180)*e.shake*22,Math.cos(this.clock*155)*e.shake*12);
  for(const f of e.fighters){
   const altitude=RULES.floor-f.y;
   c.save();c.globalAlpha=.32;c.fillStyle='#07070e';c.beginPath();c.ellipse(f.x,RULES.floor+5,80-altitude*.06,13,0,0,Math.PI*2);c.fill();c.restore();
   let pose=0,sy=1,rotate=0;
   if(f.attack){pose=f.attack.kind==='punch'?1:f.attack.kind==='kick'?2:3;if(f.attack.t<f.attack.startup*.6)pose=0;}
   if(f.blocking){sy=.94;rotate=-.08}
   if(f.stun>0){rotate=-.12;pose=0}
   if(f.hp<=0){rotate=-1.35;sy=.9;}
   let bob=this.reduced||e.phase==='paused'?0:Math.sin(this.clock*(f.vx?16:4)+f.index)* (f.vx?4:2);
   if(f.shield>0){c.save();c.strokeStyle='#e9ce90bb';c.lineWidth=4;c.beginPath();c.ellipse(f.x,f.y-130,93,148,0,0,Math.PI*2);c.stroke();c.restore();}
   if(f.blocking){c.save();c.strokeStyle=f.guard<30?'#ff806b':'#a4eaff';c.lineWidth=4;c.beginPath();c.arc(f.x,f.y-120,88,f.dir>0?-1.2:1.95,f.dir>0?1.2:4.3);c.stroke();c.restore();}
   this.sprite(c,f.data.id,pose,f.x,f.y+bob,e.height(f),f.dir,{sy,rotate,flash:f.flash>0});
   if(f.burn>0)this.fx(f.x,f.y-60,1,75,.45);
   if(f.slow>0)this.fx(f.x,f.y-30,2,90,.4);
   if(f.summon>0){
    const sx=f.x-f.dir*110;this.fx(sx,f.y-30,0,100,.35);this.sprite(c,'lukman',f.summonTick<.22?3:0,sx,f.y,132,f.dir,{alpha:.85});
    c.fillStyle='#ccefb2';c.font='bold 12px Barlow, sans-serif';c.textAlign='center';c.fillText('LUKMAN',sx,f.y-145);
   }
   if(f.combo>=2){c.fillStyle=f.index?'#ffac90':'#e5ff62';c.font='800 italic 41px "Barlow Condensed",sans-serif';c.textAlign=f.index?'right':'left';c.fillText(f.combo+' HIT',f.index?1200:80,240);c.font='14px Barlow,sans-serif';c.fillText(Math.round(f.comboDamage)+' DAMAGE',f.index?1200:80,265);}
  }
  for(const p of e.projectiles){this.fx(p.x,p.y,p.fx,p.big?180:p.ground?120:85,1,p.ground?Math.PI*.15:Math.sin(this.clock*8)*.1);}
  for(const effect of e.effects){const progress=1-effect.life/effect.max;this.fx(effect.x,effect.y,effect.fx,effect.size*(.6+progress*.7),Math.min(1,effect.life*5),effect.angle);}
  c.restore();
  const shade=c.createLinearGradient(0,0,0,170);shade.addColorStop(0,'#08081399');shade.addColorStop(1,'#08081300');c.fillStyle=shade;c.fillRect(0,0,w,170);
 }
}

