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
  addEventListener(name,callback){(this.events[name]??=[]).push(callback);}
  async dispatch(name,event={}){for(const f of this.events[name]||[])await f(event);}
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
  for(const match of html.matchAll(/<([a-z][a-z0-9]*)\b[^>]*\bid="([^"]+)"[^>]*>/g))elements[match[2]]=Object.assign(new Element(match[1]),{id:match[2]});
  const document=new Element('document');
  document.getElementById=id=>{assert.ok(elements[id],`Missing HTML ID: ${id}`);return elements[id];};
  document.createElement=tag=>new Element(tag);document.createTextNode=text=>Object.assign(new Element('#text'),{textContent:text});
  const copies=[];
  const c=vm.createContext({console,document,navigator:{clipboard:{writeText:async text=>copies.push(text)},...device},innerWidth:393,innerHeight:851,
    localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)},
    setInterval:()=>1,setTimeout:()=>1,clearInterval(){},clearTimeout(){},confirm:()=>false,
    getComputedStyle:()=>({font:'13px monospace',fontSize:'13px',fontFamily:'monospace',fontWeight:'normal'})});
  for(const match of html.matchAll(/<script src="([^"]+)"/g))vm.runInContext(fs.readFileSync(path.join(root,match[1]),'utf8'),c,{filename:match[1]});
  return {c,e:elements,copies,storage,document,run:code=>vm.runInContext(code,c)};
}
async function main(){
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
  await mobile.document.dispatch('keydown',{key:'ArrowDown',target:mobile.e.fightPressureButton,preventDefault(){}});
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
  console.log('UI/copying, saved-result reload, normal-save isolation, device detection, touch/mouse/keyboard mixing, keyboard cast/hook, and per-encounter input reset checks passed.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
