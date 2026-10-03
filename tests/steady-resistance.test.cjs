const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

function element(){
  const el={children:[],textContent:'',style:{},classList:{add(){},remove(){},toggle(){}},appendChild(child){this.children.push(child);}};
  Object.defineProperty(el,'innerHTML',{get(){return this.html||'';},set(value){this.html=value;this.children=[];}});
  return el;
}
function context(){
  const store=new Map();
  const c=vm.createContext({assert,Math:Object.create(Math),setInterval:()=>0,clearInterval(){},setTimeout:()=>0,clearTimeout(){},knowsTechnique:()=>true,document:{createElement:element},gameLogEntries:[],localStorage:{getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)},getTimeLabel:()=> 'Dawn',renderCreel(){},renderGearInventory(){},updateDisplays(){},updateTimeControls(){},tensionGrid:null,tensionFillLayer:null,tensionInstrument:null});
  for(const name of ['fightPanel','normalControls','fightControls','fightPressureButton','message','hint','fightReelButton','pullUpButton','line','lineStage'])c[name]=element();
  c.lineStage.clientHeight=240;
  c.addLog=(type,text,result)=>c.gameLogEntries.push({type,text,result});
  for(const file of ['data.js','state.js','fishing.js','testing.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../js',file),'utf8'),c,{filename:file});
  vm.runInContext(`activeTackleId=()=>"bobber";landFish=()=>{state="finished";};loseFish=()=>{state="finished";};`,c);
  return c;
}
function setup(c,id='largemouth_bass'){
  vm.runInContext(`Math.random=()=>0.9;currentFish=fishTypes.find(f=>f.id===${JSON.stringify(id)});currentWeight=4;nibbleDepth=10;startFight();fightCooldown=999;`,c);
}
function close(a,b){assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);}

// Safe resistance gives less distance, no added tension and no recovery.
const steady=context();setup(steady);
vm.runInContext('fishStamina=maxFishStamina/2;isReeling=true;fightTick();',steady);
close(vm.runInContext('fishDistance',steady),10-4.5*0.55*0.1);
close(vm.runInContext('fishStamina/maxFishStamina',steady),0.5);
close(vm.runInContext('tension-baselineTension',steady),0);
assert.equal(vm.runInContext('getFightState()',steady),'steady');
close(vm.runInContext('fightSteadySeconds',steady),0.1);
assert.match(steady.hint.textContent,/STEADY RESISTANCE/);
assert.equal(steady.line.children[0].className,'lineDot effort-steady');

// True rests retain full retrieval and the existing small recovery.
const rest=context();setup(rest);
vm.runInContext('fishStamina=maxFishStamina/2;fishSteadyResistance=false;isReeling=true;fightTick();',rest);
close(vm.runInContext('fishDistance',rest),10-4.5*0.1);
close(vm.runInContext('fishStamina/maxFishStamina',rest),0.5+0.0075*0.1);
close(vm.runInContext('fightRestSeconds',rest),0.1);
assert.equal(vm.runInContext('getFightState()',rest),'rest');
assert.match(rest.hint.textContent,/RESTING/);
assert.equal(rest.line.children[0].className,'lineDot effort-rest');

// Fatigue increases real rest opportunities; active pulls clear resistance.
const fatigue=context();setup(fatigue);
for(const [fraction,chance] of [[1,0.15],[0.5,0.5],[0,0.85]]){
  vm.runInContext(`fishStamina=maxFishStamina*${fraction};`,fatigue);
  close(vm.runInContext('getTrueRestChance()',fatigue),chance);
  vm.runInContext(`Math.random=()=>${chance-0.01};chooseFightQuietState();`,fatigue);
  assert.equal(vm.runInContext('fishSteadyResistance',fatigue),false);
  vm.runInContext(`Math.random=()=>${chance+0.01};chooseFightQuietState();`,fatigue);
  assert.equal(vm.runInContext('fishSteadyResistance',fatigue),true);
}
vm.runInContext('fishStamina=maxFishStamina;startSurge(currentFish.fightProfile);',fatigue);
assert.equal(vm.runInContext('fishSteadyResistance',fatigue),false);
assert.notEqual(vm.runInContext('getFightState()',fatigue),'steady');

// Existing pressure physics and rod/reel upgrades remain active during pulls.
const pressure=context();setup(pressure);
vm.runInContext('startSurge(currentFish.fightProfile,1,false,1);fightRemaining=99;isHoldingPressure=true;isReeling=false;',pressure);
const initial=vm.runInContext('({stamina:fishStamina,distance:fishDistance})',pressure);
vm.runInContext('fightTick();',pressure);
close(initial.stamina-vm.runInContext('fishStamina',pressure),(7+4*0.45)*0.82*(0.45+1.1)*1.55*0.1);
close(vm.runInContext('fishDistance',pressure)-initial.distance,(0.7+4*0.12)*3*0.3*0.1);

// Feint is still a scripted true rest and starts its follow-up surge.
const feint=context();setup(feint,'chain_pickerel');
vm.runInContext('Math.random=()=>0;assert.equal(tryStartFeint(1),true);isReeling=true;fightSwingTargetTimer=0.05;fightTick();',feint);
assert.equal(vm.runInContext('fishFighting',feint),true);
assert.equal(vm.runInContext('fishSteadyResistance',feint),false);

// Perch opening runs and Brook Trout recovery remain functional.
for(const id of ['yellow_perch','white_perch']){
  const c=context();setup(c,id);
  assert.equal(vm.runInContext('fishFighting',c),true);
  assert.ok(vm.runInContext('fightRemaining',c)>=2.1);
  assert.equal(vm.runInContext('fishSteadyResistance',c),false);
}
const brook=context();setup(brook,'brook_trout');
vm.runInContext('fishStamina=maxFishStamina*0.6;Math.random=()=>0;assert.equal(tryQuickRecovery(0.6),true);',brook);
close(vm.runInContext('fishStamina/maxFishStamina',brook),0.85);

// Reset logs the actual quiet state and counters before clearing them.
const logs=context();
vm.runInContext('debugTestingMode=true;Math.random=()=>0.9;currentFish=fishTypes.find(f=>f.id==="largemouth_bass");currentWeight=4;nibbleDepth=10;beginTestingEncounter();startFight();fightCooldown=999;isReeling=true;fightTick();resetFishing();',logs);
const result=logs.gameLogEntries[0].result;
assert.equal(result.outcome,'aborted');
assert.equal(result.fight.state,'steady');
assert.equal(result.fight.model,'steady_resistance_55');
close(result.fight.steadySeconds,0.1);
assert.match(logs.gameLogEntries[0].text,/QUIET TIME/);
assert.equal(vm.runInContext('fishSteadyResistance',logs),false);
close(vm.runInContext('fightSteadySeconds+fightRestSeconds',logs),0);

console.log('Steady resistance, true rest, pressure, special abilities, display and logging checks passed.');
