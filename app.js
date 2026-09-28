(() => {
  'use strict';
  // Đổi nội dung trong ngoặc kép để sửa dòng chữ chạy dưới đám mây.
  const MESSAGE = "Bà ơi, hôm nay vất vả rồi 🌙 Trước khi nhắm mắt, thả hết muộn phiền xuống đây nha ✨ Chuyện còn lại, để mai tính 💗 Ngủ thật ngon, mơ thật yên nha bà 💤";
  const TEXT_SPEED = 104; // pixel mỗi giây trên khung chuẩn 720 × 1280
  const W = 720, H = 1280;
  const $ = id => document.getElementById(id);
  const canvas = $('canvas'), ctx = canvas.getContext('2d', {alpha: false});
  const scene = $('scene'), track = $('message-track'), music = $('music');
  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const colors = ['#d6009f','#ee009e','#ad007b','#f59b00','#ffe13c','#ec201c','#c6e7fa','#89d226'];
  let reduced = motionQuery.matches, paused = false, ready = false, soundOn = false;
  let scale = .5, dpr = 1, time = 0, last = 0, frame = 0, textX = 470, textWidth = 3200;
  let pointerX = 0, viewX = 0, audioWasPlaying = false;
  let hearts = [], dust = [], floorHearts = [];
  const sprites = new Map();
  const cloudLayer = document.createElement('canvas');
  cloudLayer.width = W; cloudLayer.height = H;
  const cloudCtx = cloudLayer.getContext('2d');

  $('message-text').textContent = MESSAGE;
  $('accessible-message').textContent = MESSAGE;
  music.volume = .32;

  function roundedRect(c, x, y, w, h, r) {
    c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);
    c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();
  }
  // Dáng mây và tỉ lệ lấy theo khung hình của video mẫu.
  function cloudPath(c) {
    c.beginPath();c.moveTo(194,570);
    c.bezierCurveTo(160,570,134,542,134,511);
    c.bezierCurveTo(134,480,158,453,190,451);
    c.bezierCurveTo(195,451,201,452,205,452);
    c.bezierCurveTo(218,426,244,411,273,411);
    c.bezierCurveTo(282,411,291,412,299,415);
    c.bezierCurveTo(314,361,357,326,414,326);
    c.bezierCurveTo(478,326,531,381,537,451);
    c.bezierCurveTo(560,460,577,483,577,511);
    c.bezierCurveTo(577,544,552,570,519,570);c.closePath();
  }
  function prepareCloud() {
    const c = cloudCtx;
    c.clearRect(0,0,W,H);
    for (const blur of [48,24,11]) {
      c.shadowColor = blur === 48 ? '#ff00b8b3' : '#ff00c5b0';c.shadowBlur = blur;
      c.fillStyle = '#d000a3';cloudPath(c);c.fill();
    }
    c.shadowBlur = 0;
    const fill = c.createLinearGradient(200,326,500,570);
    fill.addColorStop(0,'#d800ab');fill.addColorStop(.7,'#cf009e');fill.addColorStop(1,'#d600a8');
    c.fillStyle=fill;cloudPath(c);c.fill();
    for (const blur of [35,18]) {
      c.shadowColor='#ff05c9';c.shadowBlur=blur;c.fillStyle='#d100a6';
      roundedRect(c,125,596,470,70,20);c.fill();
    }
    c.shadowBlur=0;
    const band=c.createLinearGradient(0,596,0,666);
    band.addColorStop(0,'#dc19b7');band.addColorStop(.45,'#c900a0');band.addColorStop(1,'#ca009e');
    c.fillStyle=band;roundedRect(c,125,596,470,70,20);c.fill();
    c.strokeStyle='#f879db50';c.lineWidth=1.4;c.stroke();
  }
  function heartPath(c) {
    c.beginPath();c.moveTo(0,13);
    c.bezierCurveTo(-4,8,-17,-1,-17,-10);
    c.bezierCurveTo(-17,-21,-5,-23,0,-14);
    c.bezierCurveTo(5,-23,17,-21,17,-10);
    c.bezierCurveTo(17,-1,4,8,0,13);c.closePath();
  }
  function heartSprite(color, glossy) {
    const key=color+(glossy?'gloss':'flat');if(sprites.has(key))return sprites.get(key);
    const s=document.createElement('canvas');s.width=112;s.height=112;
    const c=s.getContext('2d');c.translate(56,59);c.scale(1.7,1.7);
    c.fillStyle=color;c.shadowColor=color;c.shadowBlur=glossy?6:3;heartPath(c);c.fill();c.shadowBlur=0;
    if(glossy){
      const light=c.createLinearGradient(-17,-21,15,13);light.addColorStop(0,'#ffffff91');light.addColorStop(.25,'#ffffff00');light.addColorStop(1,'#00000035');c.fillStyle=light;heartPath(c);c.fill();
    }
    sprites.set(key,s);return s;
  }
  function makeHeart(initial=false) {
    const z=Math.random();
    return {x:155+Math.random()*410,y:initial?668+Math.random()*404:663,
      z,size:11+z*21,speed:52+z*75,phase:Math.random()*6.28,
      wobble:8+Math.random()*20,rotation:(Math.random()-.5)*.5,
      spin:(Math.random()-.5)*1.7,color:colors[Math.random()<.68?Math.floor(Math.random()*3):3+Math.floor(Math.random()*5)],
      glossy:Math.random()>.64,flip:Math.random()*6.28,drift:(Math.random()-.5)*16};
  }
  function initParticles() {
    hearts=Array.from({length:48},()=>makeHeart(true)).sort((a,b)=>a.z-b.z);
    dust=Array.from({length:42},()=>({x:Math.random()*W,y:Math.random()*H,size:Math.random()*2.7+.7,speed:3+Math.random()*8,alpha:.05+Math.random()*.15,color:['#c19451','#a47090','#a1b4c5'][Math.floor(Math.random()*3)],phase:Math.random()*6.28}));
    floorHearts=Array.from({length:22},()=>({x:48+Math.random()*625,y:1085+Math.random()*27,z:Math.random(),size:12+Math.random()*22,color:colors[Math.random()<.8?0:Math.floor(Math.random()*colors.length)],phase:Math.random()*6.28}));
  }
  function resize() {
    const rect=scene.getBoundingClientRect();scale=rect.width/W;dpr=Math.min(devicePixelRatio||1,1.7);
    canvas.width=Math.max(1,Math.round(rect.width*dpr));canvas.height=Math.max(1,Math.round(rect.height*dpr));
    ctx?.setTransform(scale*dpr,0,0,scale*dpr,0,0);
    document.documentElement.style.setProperty('--scale',String(scale));
    textWidth=$('message-text').getBoundingClientRect().width/scale;
    draw(0);updateText(0);
  }
  function drawHeart(h,ground=false) {
    const x=h.x+(ground?Math.sin(time*.3+h.phase)*7:Math.sin(time*1.25+h.phase)*h.wobble)+viewX*(h.z-.5)*13;
    ctx.save();ctx.translate(x,h.y);
    ctx.rotate(ground?Math.sin(time*.7+h.phase)*.12:h.rotation+Math.sin(time+h.phase)*.16);
    const flip=ground?.18+Math.abs(Math.sin(time*.35+h.phase))*.12:Math.cos(time*(h.spin||.5)+(h.flip||0));
    ctx.scale(ground?1:Math.max(.14,Math.abs(flip)),ground?flip:.78+.22*Math.abs(Math.sin(time*.6+h.phase)));
    ctx.globalAlpha=ground?.58:Math.min(1,(h.y-650)/35)*(.45+h.z*.55);
    const sprite=heartSprite(h.color,h.glossy);
    const size=h.size*2.8;ctx.drawImage(sprite,-size/2,-size/2,size,size);ctx.restore();
  }
  function draw(dt) {
    if(!ctx)return;
    ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);
    viewX+=(pointerX-viewX)*Math.min(1,dt*3);
    for(const p of dust){
      if(dt){p.y+=p.speed*dt;if(p.y>H+15)p.y=-15;}
      ctx.globalAlpha=p.alpha*(.7+.2*Math.sin(time*.5+p.phase));ctx.fillStyle=p.color;
      ctx.beginPath();ctx.arc(p.x+Math.sin(time*.12+p.phase)*14,p.y,p.size,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;
    for(const h of floorHearts)drawHeart(h,true);
    for(let i=0;i<hearts.length;i++){
      let h=hearts[i];
      if(dt){h.y+=h.speed*dt;h.x+=h.drift*dt;if(h.y>1105){h=makeHeart();hearts[i]=h;}}
      drawHeart(h);
    }
    ctx.globalAlpha=1;
    ctx.save();ctx.translate(viewX*2,reduced?0:Math.sin(time*.7)*1.5);ctx.drawImage(cloudLayer,0,0);ctx.restore();
  }
  function updateText(dt) {
    if(reduced)return;
    textX-=TEXT_SPEED*dt;
    if(textX<-textWidth-45)textX=490;
    document.documentElement.style.setProperty('--message-offset',`${textX*scale}px`);
  }
  function loop(now) {
    frame=requestAnimationFrame(loop);
    if(!ready||paused||reduced||document.hidden){last=now;return;}
    const elapsed=now-last;
    if(elapsed<22)return;
    const dt=Math.min(elapsed/1000,.065);last=now;time+=dt;
    draw(dt);updateText(dt);
  }
  function setPaused(value) {
    paused=value;$('pause').setAttribute('aria-pressed',String(paused));
    $('pause').setAttribute('aria-label',paused?'Tiếp tục chuyển động':'Tạm dừng chuyển động');
    $('pause').title=paused?'Tiếp tục':'Tạm dừng';
    if(paused)music.pause();else if(soundOn)music.play().catch(()=>{});
    last=performance.now();
  }
  async function setSound(value) {
    if(value){try{await music.play();soundOn=true;}catch{soundOn=false;}}
    else{music.pause();soundOn=false;}
    $('sound').setAttribute('aria-pressed',String(soundOn));
    $('sound').setAttribute('aria-label',soundOn?'Tắt nhạc':'Bật nhạc');
    $('sound').title=soundOn?'Tắt nhạc':'Bật nhạc';
  }
  $('pause').addEventListener('click',()=>setPaused(!paused));
  $('sound').addEventListener('click',()=>setSound(!soundOn));
  let soundAttempted=false;
  scene.addEventListener('pointerdown',()=>{if(!soundAttempted){soundAttempted=true;setSound(true);}});
  scene.addEventListener('pointermove',event=>{const r=scene.getBoundingClientRect();pointerX=((event.clientX-r.left)/r.width-.5)*2;});
  scene.addEventListener('pointerleave',()=>{pointerX=0;});
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){audioWasPlaying=!music.paused;music.pause();cancelAnimationFrame(frame);}
    else{last=performance.now();cancelAnimationFrame(frame);frame=requestAnimationFrame(loop);if(audioWasPlaying&&soundOn&&!paused)music.play().catch(()=>{});}
  });
  window.addEventListener('resize',resize);
  window.addEventListener('pagehide',()=>{cancelAnimationFrame(frame);music.pause();});
  window.addEventListener('pageshow',event=>{if(event.persisted){last=performance.now();cancelAnimationFrame(frame);frame=requestAnimationFrame(loop);}});
  motionQuery.addEventListener?.('change',event=>{reduced=event.matches;resize();});
  prepareCloud();initParticles();resize();
  const fontReady=document.fonts?.load('38px Lobster')||Promise.resolve();
  const minLoading=new Promise(resolve=>setTimeout(resolve,900));
  Promise.all([Promise.race([fontReady.catch(()=>{}),new Promise(resolve=>setTimeout(resolve,2500))]),minLoading]).then(()=>{
    ready=true;resize();document.body.classList.add('ready');$('loading').setAttribute('aria-hidden','true');last=performance.now();
  });
  frame=requestAnimationFrame(loop);
})();
