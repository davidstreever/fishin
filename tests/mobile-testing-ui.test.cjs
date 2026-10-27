const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');

// Load the actual HTML IDs and all game scripts with a small DOM fixture.
// This checks UI wiring and lifecycle behavior, not browser layout geometry.
class Element{
  constructor(tag='div'){
    this.tagName=tag.toUpperCase();this.children=[];this.events={};this.attributes={};this.dataset={};
    this.style={setProperty(name,value){this[name]=value;}};this.value='';this.textContent='';this.className='';
    this.disabled=false;this.hidden=false;this.open=false;this.offsetParent={};this.clientWidth=300;
    this.classList={add:(name)=>{if(!this.matches('.'+name))this.className+=' '+name;},remove:(name)=>{this.className=this.className.split(' ').filter(x=>x!==name).join(' ');},toggle:(name,on)=>{on??=!this.matches('.'+name);this.classList[on?'add':'remove'](name);}};
  }
  set innerHTML(value){this.html=value;this.children=[];}
  get innerHTML(){return this.html||'';}
  append(...nodes){nodes.forEach(n=>this.appendChild(n));}
  appendChild(node){this.children.push(node);node.parentElement=this;return node;}
  matches(selector){return selector[0]==='.'?this.className.split(' ').includes(selector.slice(1)):this.tagName.toLowerCase()===selector;}
  closest(selector){for(let node=this;node;node=node.parentElement)if(node.matches(selector))return node;return null;}
  querySelectorAll(selector){return this.children.flatMap(n=>[...(n.matches(selector)?[n]:[]),...n.querySelectorAll(selector)]);}
  setAttribute(key,value){this.attributes[key]=String(value);}
  setPointerCapture(id){(this.capturedPointers??=new Set()).add(id);}
  hasPointerCapture(id){return this.capturedPointers?.has(id)||false;}
  releasePointerCapture(id){this.capturedPointers?.delete(id);}
  addEventListener(name,callback){(this.events[name]??=[]).push(callback);}
  async dispatch(name,event={}){
    event.target??=this;event.defaultPrevented??=false;
    event.preventDefault??=function(){this.defaultPrevented=true;};
    for(const f of this.events[name]||[])await f(event);
  }
  click(){if(!this.disabled)return this.dispatch('click');}
  focus(options){this.focusOptions=options;}
  select(){this.selectionStart=0;this.selectionEnd=this.value.length;}
  setSelectionRange(start,end){this.selectionStart=start;this.selectionEnd=end;}
  showModal(){this.open=true;}
  close(){this.open=false;}
  getContext(){return {measureText:text=>({width:text.length*8})};}
}
function fixture(storage=new Map(),device={}){
  const elements={};const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  for(const match of html.matchAll(/<([a-z][a-z0-9]*)\b[^>]*\bid="([^"]+)"[^>]*>/g))elements[match[2]]=Object.assign(new Element(match[1]),{id:match[2],className:match[0].match(/\bclass="([^"]*)"/)?.[1]||''});
  const document=new Element('document');
  document.getElementById=id=>{assert.ok(elements[id],`Missing HTML ID: ${id}`);return elements[id];};
  document.createElement=tag=>new Element(tag);document.createTextNode=text=>Object.assign(new Element('#text'),{textContent:text});
  const copies=[],intervals=[],windowEvents=new Element('window');
  let reloads=0;
  const c=vm.createContext({console,document,navigator:{clipboard:{writeText:async text=>copies.push(text)},...device},innerWidth:393,innerHeight:851,
    localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)},
    setInterval:(callback,delay)=>{intervals.push({callback,delay});return intervals.length;},setTimeout:()=>1,clearInterval(){},clearTimeout(){},confirm:()=>false,
    location:{reload(){reloads++;}},
    addEventListener:windowEvents.addEventListener.bind(windowEvents),
    getComputedStyle:()=>({font:'13px monospace',fontSize:'13px',fontFamily:'monospace',fontWeight:'normal'})});
  for(const match of html.matchAll(/<script src="([^"]+)"/g))vm.runInContext(fs.readFileSync(path.join(root,match[1]),'utf8'),c,{filename:match[1]});
  return {c,e:elements,copies,storage,document,intervals,windowEvents,get reloads(){return reloads;},run:code=>vm.runInContext(code,c)};
}
async function main(){
  // Reproduce an autosave firing while reset's asynchronous reload is pending.
  const reset=fixture();
  reset.run('finishIntro();world.seasonDay=4;player.money=100;player.meta.obsession=5;saveGame();');
  const existing=fixture(reset.storage);
  assert.equal(existing.run('world.seasonDay'),4);
  assert.equal(existing.run('world.introSeen'),true);
  reset.c.confirm=()=>true;
  await reset.e.debugResetButton.click();
  assert.equal(reset.reloads,1);
  reset.intervals.find(timer=>timer.delay===5000).callback();
  reset.run('saveGame();saveMetaProgress();');
  assert.equal(reset.storage.has('fishinSave'),false);
  assert.equal(reset.storage.has('fishinMeta'),false);
  const fresh=fixture(reset.storage);
  assert.equal(fresh.run('world.seasonDay'),1);
  assert.equal(fresh.run('world.introSeen'),false);
  assert.equal(fresh.run('player.money'),0);
  assert.equal(fresh.run('player.meta.obsession'),0);
  assert.equal(fresh.e.introOverlay.style.display,'flex');
  assert.match(fresh.e.introText.innerHTML,/Your father died/);
  fresh.intervals.find(timer=>timer.delay===5000).callback();
  const refreshed=fixture(fresh.storage);
  assert.equal(refreshed.run('world.seasonDay'),1);
  assert.equal(refreshed.e.introOverlay.style.display,'flex');
  refreshed.run('finishIntro();saveGame();');
  assert.equal(JSON.parse(refreshed.storage.get('fishinSave')).world.introSeen,true);

  // Prestige preserves meta once, but cannot resave the old run during reload.
  const prestige=fixture();
  prestige.run('finishIntro();world.seasonDay=4;player.meta.obsession=7;saveGame();prestigeResetWithAmulet();');
  const preservedMeta=prestige.storage.get('fishinMeta');
  prestige.intervals.find(timer=>timer.delay===5000).callback();
  prestige.run('player.meta.obsession=99;saveMetaProgress();');
  assert.equal(prestige.reloads,1);
  assert.equal(prestige.storage.has('fishinSave'),false);
  assert.equal(prestige.storage.get('fishinMeta'),preservedMeta);
  const reborn=fixture(prestige.storage);
  assert.equal(reborn.run('world.seasonDay'),1);
  assert.equal(reborn.run('player.meta.obsession'),7);
  assert.equal(reborn.run('player.meta.hasAmulet'),true);
  assert.equal(reborn.e.introOverlay.style.display,'flex');

  const f=fixture();const {e,run,copies}=f;
  assert.equal(e.testLogTools.hidden,true);
  run('finishIntro();player.meta.learnedTechniques=["hold_pressure","twitch"];setTestingMode(true);');
  assert.equal(e.testLogTools.hidden,false);assert.equal(e.copyLatestTestButton.disabled,true);
  const normalSave=f.storage.get('fishinSave');
  run('currentFish=fishTypes.find(f=>f.id==="smallmouth_bass");currentWeight=6.89;nibbleDepth=12;beginTestingEncounter();state="bite";hookFish();');
  assert.equal(run('state'),'reeling');assert.equal(e.normalControls.style.display,'none');assert.equal(e.fightControls.style.display,'flex');
  assert.match(e.fightPanel.innerHTML,/Smallmouth Bass/);
  run('fightElapsed=27.1;fightSteadySeconds=2.3;fightRestSeconds=14;landFish();');
  assert.equal(run('state'),'finished');assert.equal(e.fightControls.style.display,'none');assert.equal(e.normalControls.style.display,'block');
  assert.equal(e.fightPanel.innerHTML,'');
  const entry=run('gameLogEntries.find(e=>e.type==="test")');
  const expected=`[${entry.season} ${entry.day} / ${entry.time}]\n${entry.text}`;
  await e.copyLatestTestButton.click();assert.equal(copies.at(-1),expected);
  assert.match(copies.at(-1),/FULL RESULT — .*steady_resistance_55/);
  assert.equal(e.testCopyStatus.textContent,'Copied test.');
  const row=e.gameLog.children.find(n=>n.className.includes('logTest'));
  await row.querySelectorAll('button')[0].click();assert.equal(copies.at(-1),expected);
  // Latest result must skip the newer ordinary "Caught" log entry.
  assert.equal(run('gameLogEntries.at(-1).type'),'catch');
  run('resetFishing();currentFish=fishTypes.find(f=>f.id==="largemouth_bass");currentWeight=4;nibbleDepth=10;beginTestingEncounter();state="bite";hookFish();loseFish("The line snaps.");');
  assert.equal(e.fightPanel.innerHTML,'');
  const second=run('gameLogEntries.filter(e=>e.type==="test").at(-1)');
  const expectedSecond=`[${second.season} ${second.day} / ${second.time}]\n${second.text}`;
  await e.copyLatestTestButton.click();assert.equal(copies.at(-1),expectedSecond);
  await e.copyAllTestsButton.click();assert.equal(copies.at(-1),expected+'\n\n'+expectedSecond);
  assert.equal(e.testCopyStatus.textContent,'Copied 2 tests.');
  assert.equal(f.storage.get('fishinSave'),normalSave,'Testing must not alter the normal save.');

  // Denied and absent clipboards leave complete, selected text for manual copying.
  f.c.navigator.clipboard.writeText=async()=>{throw Error('Permission denied');};
  await e.copyLatestTestButton.click();assert.equal(e.testCopyDialog.open,true);
  assert.equal(e.testCopyText.value,expectedSecond);assert.equal(e.testCopyText.selectionEnd,expectedSecond.length);
  assert.equal(e.testCopyText.focusOptions.preventScroll,true);
  // Keyboard game shortcuts must not start a cast behind the copy dialog.
  await f.document.dispatch('keydown',{code:'Space',key:' ',target:e.closeTestCopyButton,preventDefault(){throw Error('Game shortcut ran');}});
  assert.equal(run('state'),'finished');
  await e.closeTestCopyButton.click();assert.equal(e.testCopyDialog.open,false);
  delete f.c.navigator.clipboard;
  await row.querySelectorAll('button')[0].click();assert.equal(e.testCopyText.value,expected);
  await e.selectTestCopyButton.click();assert.equal(e.testCopyText.selectionStart,0);
  await e.closeTestCopyButton.click();

  // Persisted results remain individually and collectively copyable after reload.
  const reloaded=fixture(f.storage);reloaded.run('setTestingMode(true);');
  await reloaded.e.copyAllTestsButton.click();assert.equal(reloaded.copies.at(-1),expected+'\n\n'+expectedSecond);
  reloaded.run('setTestingMode(false);');assert.equal(reloaded.e.testLogTools.hidden,true);
  run('resetFishing();');assert.equal(e.fightPanel.innerHTML,'');

  // Mobile hardware and actual methods are independent: record mixed controls.
  const mobile=fixture(new Map(),{userAgent:'Mozilla/5.0 (Linux; Android 17) Mobile',userAgentData:{mobile:true},maxTouchPoints:5});
  mobile.run('finishIntro();player.meta.learnedTechniques=["hold_pressure","twitch"];setTestingMode(true);debugForcedFishId="brook_trout";');
  await mobile.document.dispatch('pointerdown',{target:mobile.e.fishButton,pointerType:'touch'});
  await mobile.e.fishButton.click();
  assert.equal(mobile.run('testingEncounter.device.mobile'),true);
  assert.equal(mobile.run('testingEncounter.device.viewportWidth'),393);
  assert.deepEqual([...mobile.run('testingEncounter.inputMethods')],['touch']);
  mobile.run('clearFishingTimers();state="bite";updateFishingControls();');
  await mobile.document.dispatch('pointerdown',{target:mobile.e.fishButton,pointerType:'mouse'});
  await mobile.e.fishButton.click();
  await mobile.document.dispatch('keydown',{key:'ArrowRight',target:mobile.e.fightPressureButton,preventDefault(){}});
  await mobile.document.dispatch('keydown',{key:'ArrowUp',target:mobile.e.fightReelButton,preventDefault(){}});
  assert.deepEqual([...mobile.run('testingEncounter.inputMethods')],['touch','mouse','keyboard']);
  // Clicking copy and setup buttons must not count as fishing mouse input.
  await mobile.document.dispatch('pointerdown',{target:mobile.e.copyLatestTestButton,pointerType:'pen'});
  assert.deepEqual([...mobile.run('testingEncounter.inputMethods')],['touch','mouse','keyboard']);
  mobile.run('landFish();');
  const mobileLog=mobile.run('gameLogEntries.find(e=>e.type==="test")');
  assert.match(mobileLog.text,/DEVICE — Mobile \(393 × 851\)/);
  assert.match(mobileLog.text,/CONTROLS — touch, mouse, keyboard/);
  assert.equal(mobileLog.testResult.device.touchCapable,true);

  // A new encounter must not inherit the previous encounter's input methods.
  mobile.run('resetFishing();');
  await mobile.document.dispatch('pointerdown',{target:mobile.e.fishButton,pointerType:'mouse'});
  await mobile.e.fishButton.click();
  assert.deepEqual([...mobile.run('testingEncounter.inputMethods')],['mouse']);
  // Touch-capable desktop hardware is still desktop; keyboard-only play is explicit.
  const desktop=fixture(new Map(),{userAgent:'Mozilla/5.0 (X11; CrOS)',userAgentData:{mobile:false},maxTouchPoints:5});
  desktop.run('finishIntro();setTestingMode(true);debugForcedFishId="brook_trout";');
  await desktop.document.dispatch('keydown',{code:'Space',key:' ',target:desktop.e.fishButton,preventDefault(){}});
  assert.equal(desktop.run('testingEncounter.device.mobile'),false);
  assert.deepEqual([...desktop.run('testingEncounter.inputMethods')],['keyboard']);
  desktop.run('clearFishingTimers();state="bite";updateFishingControls();');
  await desktop.document.dispatch('keydown',{key:'h',target:desktop.e.fishButton,preventDefault(){}});
  assert.equal(desktop.run('state'),'reeling');
  assert.deepEqual([...desktop.run('testingEncounter.inputMethods')],['keyboard']);
  // UA fallback handles a phone and an iPad that reports a desktop-like UA.
  delete desktop.c.navigator.userAgentData;desktop.c.navigator.userAgent='Mozilla/5.0 (iPhone)';
  assert.equal(desktop.run('getTestingDeviceInfo().mobile'),true);
  desktop.c.navigator.userAgent='Mozilla/5.0 (Macintosh)';
  assert.equal(desktop.run('getTestingDeviceInfo().mobile'),true);
  desktop.c.navigator.userAgent='';
  assert.equal(desktop.run('getTestingDeviceInfo().mobile'),null);
  // Fishing arrows and Space own their browser defaults, including every
  // repeated keydown. Inputs, copy tools, and non-fishing panels keep theirs.
  const keys=fixture();
  keys.run('finishIntro();player.meta.learnedTechniques=["hold_pressure"];setTestingMode(true);');
  function keyEvent(key,extra={}){return {key,code:key===' '?'Space':key,repeat:false,target:keys.e.fishButton,defaultPrevented:false,preventDefault(){this.defaultPrevented=true;},...extra};}
  function prepareBite(){keys.run('resetFishing();currentFish=fishTypes.find(f=>f.id==="landlocked_salmon");currentWeight=10;nibbleDepth=12;beginTestingEncounter();state="bite";updateFishingControls();');}
  prepareBite();
  assert.equal(keys.e.fishButton.textContent,'HOOK [↑]');
  const baitBefore=keys.run('player.gear.bait[player.selectedBait]');
  const hookUp=keyEvent('ArrowUp');await keys.document.dispatch('keydown',hookUp);
  assert.equal(hookUp.defaultPrevented,true);
  assert.equal(keys.run('state'),'reeling');
  assert.equal(keys.run('isReeling'),true,'One Up press must hook and start reeling.');
  assert.equal(keys.run('fightHoldOwner.key'),'ArrowUp');
  assert.equal(keys.run('player.gear.bait[player.selectedBait]'),baitBefore-1);
  const repeatUp=keyEvent('ArrowUp',{repeat:true});await keys.document.dispatch('keydown',repeatUp);
  assert.equal(repeatUp.defaultPrevented,true);
  assert.equal(keys.run('player.gear.bait[player.selectedBait]'),baitBefore-1,'Repeat must not hook again.');
  const pressureRight=keyEvent('ArrowRight');await keys.document.dispatch('keydown',pressureRight);
  assert.equal(pressureRight.defaultPrevented,true);
  assert.equal(keys.run('!isReeling&&isHoldingPressure'),true);
  assert.equal(keys.e.fightPressureButton.textContent,'HOLDING... [→]');
  await keys.document.dispatch('keyup',keyEvent('ArrowUp'));
  assert.equal(keys.run('isHoldingPressure'),true,'Up release cannot cancel Right.');
  const oldDown=keyEvent('ArrowDown');await keys.document.dispatch('keydown',oldDown);
  assert.equal(oldDown.defaultPrevented,true);
  await keys.document.dispatch('keyup',keyEvent('ArrowDown'));
  assert.equal(keys.run('isHoldingPressure'),true,'Down is no longer the pressure key.');
  const releaseRight=keyEvent('ArrowRight');await keys.document.dispatch('keyup',releaseRight);
  assert.equal(releaseRight.defaultPrevented,true);
  assert.equal(keys.run('isReeling||isHoldingPressure'),false);
  assert.equal(keys.e.fightPressureButton.textContent,'HOLD PRESSURE [→]');
  await keys.document.dispatch('keydown',keyEvent('ArrowDown'));
  assert.equal(keys.run('isHoldingPressure'),false);

  // Repeats stay consumed through cast, bite, fight and landing transitions.
  // An Up key held before a bite must not auto-hook when the bite appears.
  for(const phase of ['ready','waiting','nibble','bite','reeling','finished']){
    keys.run(`clearFightHold();state=${JSON.stringify(phase)};`);
    for(const key of ['ArrowUp','ArrowRight','ArrowDown','ArrowLeft',' ']){
      const repeat=keyEvent(key,{repeat:true});await keys.document.dispatch('keydown',repeat);
      assert.equal(repeat.defaultPrevented,true,`${phase}: ${key} repeat could scroll.`);
      assert.equal(keys.run('state'),phase);
      assert.equal(keys.run('isReeling||isHoldingPressure'),false);
      const up=keyEvent(key);await keys.document.dispatch('keyup',up);
      assert.equal(up.defaultPrevented,true);
    }
  }
  keys.run('resetFishing();updateFishingControls();');
  const castSpace=keyEvent(' ');await keys.document.dispatch('keydown',castSpace);
  assert.equal(castSpace.defaultPrevented,true);assert.equal(keys.run('state'),'casting');
  const castRepeat=keyEvent(' ',{repeat:true});await keys.document.dispatch('keydown',castRepeat);
  assert.equal(castRepeat.defaultPrevented,true);assert.equal(keys.run('state'),'casting');

  prepareBite();
  const editableTargets=['input','textarea','select'].map(tag=>new Element(tag));
  editableTargets.push(Object.assign(new Element('span'),{isContentEditable:true}));
  editableTargets.push(keys.e.copyLatestTestButton);
  for(const target of editableTargets)for(const key of ['ArrowUp','ArrowRight','ArrowDown','ArrowLeft',' ']){
    const event=keyEvent(key,{target});await keys.document.dispatch('keydown',event);
    assert.equal(event.defaultPrevented,false,`${target.tagName} ${target.id||''}: ${key}`);assert.equal(keys.run('state'),'bite');
  }
  for(const modifier of ['altKey','ctrlKey','metaKey','shiftKey']){
    const modified=keyEvent('ArrowUp',{[modifier]:true});await keys.document.dispatch('keydown',modified);
    assert.equal(modified.defaultPrevented,false);assert.equal(keys.run('state'),'bite');
  }
  keys.e.pierPanel.style.display='none';
  const elsewhere=keyEvent('ArrowUp');await keys.document.dispatch('keydown',elsewhere);
  assert.equal(elsewhere.defaultPrevented,false);assert.equal(keys.run('state'),'bite');
  keys.e.pierPanel.style.display='block';keys.e.testCopyDialog.open=true;
  const dialogUp=keyEvent('ArrowUp');await keys.document.dispatch('keydown',dialogUp);
  assert.equal(dialogUp.defaultPrevented,false);assert.equal(keys.run('state'),'bite');
  keys.e.testCopyDialog.open=false;

  // Focus changes and interruptions release the held key without a stale
  // repeat reactivating it. H remains a compatibility alias for hooking.
  await keys.document.dispatch('keydown',keyEvent('ArrowUp'));
  const editableRelease=keyEvent('ArrowUp',{target:editableTargets[1]});
  await keys.document.dispatch('keyup',editableRelease);
  assert.equal(editableRelease.defaultPrevented,false);assert.equal(keys.run('isReeling'),false);
  await keys.document.dispatch('keydown',keyEvent('ArrowRight'));
  await keys.windowEvents.dispatch('blur');
  const afterBlur=keyEvent('ArrowRight',{repeat:true});await keys.document.dispatch('keydown',afterBlur);
  assert.equal(afterBlur.defaultPrevented,true);assert.equal(keys.run('isHoldingPressure'),false);
  await keys.document.dispatch('keydown',keyEvent('ArrowUp'));
  keys.e.pierPanel.style.display='none';await keys.document.dispatch('keyup',keyEvent('ArrowUp'));
  assert.equal(keys.run('isReeling'),false);keys.e.pierPanel.style.display='block';
  prepareBite();await keys.document.dispatch('keydown',keyEvent('h'));
  assert.equal(keys.run('state'),'reeling');assert.equal(keys.run('isReeling'),false);

  // Held controls must survive thumb drift, and only the owning input may end
  // the hold. Test capture, fallback release, interruptions and fight lifecycle.
  const holds=fixture(new Map(),{maxTouchPoints:5});
  holds.run('finishIntro();player.meta.learnedTechniques=["hold_pressure"];setTestingMode(true);');
  function startHeldFight(){holds.run('resetFishing();currentFish=fishTypes.find(f=>f.id==="landlocked_salmon");currentWeight=10;nibbleDepth=12;beginTestingEncounter();state="bite";hookFish();');}
  function pointer(id,extra={}){return {pointerId:id,pointerType:'touch',button:0,defaultPrevented:false,preventDefault(){this.defaultPrevented=true;},...extra};}
  function released(){
    assert.equal(holds.run('isReeling||isHoldingPressure'),false);
    assert.equal(holds.run('fightHoldOwner'),null);
    for(const button of [holds.e.fightReelButton,holds.e.fightPressureButton]){
      assert.equal(button.attributes['aria-pressed'],'false');
      assert.equal(button.matches('.is-held'),false);
    }
  }
  startHeldFight();
  const reelDown=pointer(1);
  await holds.e.fightReelButton.dispatch('pointerdown',reelDown);
  assert.equal(reelDown.defaultPrevented,true);
  assert.equal(holds.run('isReeling'),true);
  assert.equal(holds.e.fightReelButton.hasPointerCapture(1),true);
  assert.equal(holds.e.fightReelButton.attributes['aria-pressed'],'true');
  assert.equal(holds.e.fightReelButton.matches('.is-held'),true);
  await holds.e.fightReelButton.dispatch('pointerleave',pointer(1));
  assert.equal(holds.run('isReeling'),true,'Thumb drift must not end a hold.');
  await holds.document.dispatch('pointerup',pointer(1));
  released();assert.equal(holds.e.fightReelButton.hasPointerCapture(1),false);

  for(const event of ['pointercancel','lostpointercapture']){
    await holds.e.fightPressureButton.dispatch('pointerdown',pointer(2));
    await holds.e.fightPressureButton.dispatch(event,pointer(2));
    released();
  }
  // Newest press wins; releasing an old finger cannot cancel the new action.
  await holds.e.fightReelButton.dispatch('pointerdown',pointer(3));
  await holds.e.fightPressureButton.dispatch('pointerdown',pointer(4));
  assert.equal(holds.e.fightReelButton.hasPointerCapture(3),false);
  assert.equal(holds.run('!isReeling&&isHoldingPressure'),true);
  for(const event of ['pointerup','pointercancel','lostpointercapture'])await holds.e.fightReelButton.dispatch(event,pointer(3));
  assert.equal(holds.run('isHoldingPressure'),true);
  await holds.e.fightPressureButton.dispatch('pointerup',pointer(4));released();

  // Pointer and keyboard releases likewise cannot clear each other's holds.
  await holds.e.fightReelButton.dispatch('pointerdown',pointer(5));
  await holds.document.dispatch('keydown',{key:'ArrowRight',target:holds.e.fightPressureButton,preventDefault(){}});
  await holds.e.fightReelButton.dispatch('pointerup',pointer(5));
  assert.equal(holds.run('isHoldingPressure'),true);
  await holds.e.fightReelButton.dispatch('pointerdown',pointer(6));
  await holds.document.dispatch('keyup',{key:'ArrowRight'});
  assert.equal(holds.run('isReeling'),true);
  await holds.e.fightReelButton.dispatch('pointerup',pointer(6));released();
  await holds.document.dispatch('keydown',{key:'ArrowUp',target:holds.e.fightReelButton,preventDefault(){}});
  await holds.document.dispatch('keyup',{key:'ArrowUp'});released();

  // If capture is unavailable, an outside lift still releases the hold.
  const capture=holds.e.fightReelButton.setPointerCapture;
  holds.e.fightReelButton.setPointerCapture=()=>{throw Error('Capture unavailable');};
  await holds.e.fightReelButton.dispatch('pointerdown',pointer(7));
  assert.equal(holds.run('isReeling'),true);
  await holds.document.dispatch('pointerup',pointer(7));released();
  holds.e.fightReelButton.setPointerCapture=capture;
  await holds.e.fightReelButton.dispatch('pointerdown',pointer(8,{button:2,pointerType:'mouse'}));released();

  for(const event of ['contextmenu','selectstart','dragstart']){
    const gesture=pointer(9);await holds.e.fightControls.dispatch(event,gesture);
    assert.equal(gesture.defaultPrevented,true);
  }
  for(const interrupt of ['blur','hidden']){
    await holds.e.fightPressureButton.dispatch('pointerdown',pointer(10));
    if(interrupt==='blur')await holds.windowEvents.dispatch('blur');
    else{holds.document.hidden=true;await holds.document.dispatch('visibilitychange');holds.document.hidden=false;}
    released();
  }
  for(const finish of ['landFish();','loseFish("The line snaps.");','resetFishing();','startFight();']){
    startHeldFight();
    await holds.e.fightPressureButton.dispatch('pointerdown',pointer(11));
    holds.run(finish);released();
    assert.equal(holds.e.fightPressureButton.hasPointerCapture(11),false);
    startHeldFight();
    await holds.e.fightReelButton.dispatch('pointerdown',pointer(12));
    await holds.e.fightPressureButton.dispatch('lostpointercapture',pointer(11));
    assert.equal(holds.run('isReeling'),true,'Late capture loss must not affect a new fight.');
    await holds.document.dispatch('pointercancel',pointer(12));released();
  }
  startHeldFight();holds.run('player.meta.learnedTechniques=[];');
  await holds.e.fightPressureButton.dispatch('pointerdown',pointer(13));released();
  holds.e.testCopyDialog.open=true;
  await holds.e.fightReelButton.dispatch('pointerdown',pointer(14));released();
  console.log('UI/copying, save isolation, keyboard/device tracking, captured holds, thumb drift, pointer/keyboard handoffs, cancellation, blur/visibility, gesture suppression, and fight lifecycle checks passed.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
