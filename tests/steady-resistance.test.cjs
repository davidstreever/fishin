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
assert.equal(steady.hint.textContent,'');
assert.equal(steady.line.children[0].className,'lineDot effort-steady');

// True rests retain full retrieval and the existing small recovery.
const rest=context();setup(rest);
vm.runInContext('fishStamina=maxFishStamina/2;fishSteadyResistance=false;isReeling=true;fightTick();',rest);
close(vm.runInContext('fishDistance',rest),10-4.5*0.1);
close(vm.runInContext('fishStamina/maxFishStamina',rest),0.5+0.0075*0.1);
close(vm.runInContext('fightRestSeconds',rest),0.1);
assert.equal(vm.runInContext('getFightState()',rest),'rest');
assert.equal(rest.hint.textContent,'');
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

// Strong surges cost more released line and reeling tension, with a gradual
// increase through the strong band. Pressure and reeling distance stay intact.
for(const gear of ['old','aluminum','carbon','titanium']){
  const rodId={old:'old_rod',aluminum:'fiberglass_rod',carbon:'graphite_rod',titanium:'boron_rod'}[gear];
  const reelId=gear+'_reel';
  for(const [effort,lineBonus,tensionBonus] of [[0.4,1,1],[0.65,1,1],[0.8,1,1],[0.9,1.15,1.075],[1,1.3,1.15],[1.25,1.3,1.15]]){
    for(const action of ['release','reel','pressure']){
      const c=context();setup(c);
      vm.runInContext(`getEquippedRod=()=>rods[${JSON.stringify(rodId)}];getEquippedReel=()=>reels[${JSON.stringify(reelId)}];startSurge(currentFish.fightProfile,1,false,${effort});fightRemaining=99;isReeling=${action==='reel'};isHoldingPressure=${action==='pressure'};tension=50;`,c);
      const before=vm.runInContext('({distance:fishDistance,stamina:fishStamina})',c);
      vm.runInContext('fightTick();',c);
      const after=vm.runInContext('({distance:fishDistance,stamina:fishStamina,tension,rod:getEquippedRod(),reel:getEquippedReel()})',c);
      const power=0.25+effort*0.75;
      const run=(0.7+4*0.12)*3*power;
      if(action==='release'){
        close(after.distance-before.distance,run*0.1*lineBonus);
        close(after.tension,47.8);
      }else if(action==='reel'){
        close(after.tension-50,(20+4*4.2)*3*power*after.rod.tensionMultiplier*0.1*tensionBonus);
        close(after.distance-before.distance,(run-4.5*after.reel.reelPower*(1-Math.min(power*0.55,0.75)))*0.1);
      }else{
        close(after.distance-before.distance,run*after.reel.pressureRunMultiplier*0.1);
        close(after.tension,49.35);
      }
      const pressureDrain=action==='pressure'?1.55*after.rod.pressureStaminaMultiplier:1;
      close(before.stamina-after.stamina,(7+4*0.45)*0.82*(0.45+effort*1.1)*pressureDrain*0.1);
      assert.equal(vm.runInContext('state',c),'reeling');
    }
  }
}

// Crossing into strong effort has no sudden jump in distance or tension.
function surgeOutcome(effort,action){
  const c=context();setup(c);
  vm.runInContext(`startSurge(currentFish.fightProfile,1,false,${effort});fightRemaining=99;isReeling=${action==='reel'};tension=50;fightTick();`,c);
  return vm.runInContext('({distance:fishDistance,tension})',c);
}
for(const action of ['release','reel']){
  const below=surgeOutcome(0.8-1e-6,action),above=surgeOutcome(0.8+1e-6,action);
  assert.ok(Math.abs(above.distance-below.distance)<1e-4);
  assert.ok(Math.abs(above.tension-below.tension)<1e-4);
}

// The stronger released run reaches the existing line limit; reeling still
// snaps at the existing tension limit. Neither route adds a new loss rule.
for(const action of ['release','reel']){
  const c=context();setup(c);
  vm.runInContext(`loseFish=reason=>{state="finished";globalThis.lossReason=reason;};startSurge(currentFish.fightProfile,1,false,1);fightRemaining=99;isReeling=${action==='reel'};fishDistance=maxFightDistance-0.4;tension=${action==='reel'?90:50};fightTick();`,c);
  assert.equal(c.lossReason,action==='reel'?'The line snaps.':'The fish runs out your line.');
}

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

// Largemouth gets one Last Gasp at <=35%, at its next scheduled fight check.
const gasp=context();setup(gasp);
assert.equal(vm.runInContext('fishHasSpecialAbility("last_gasp")',gasp),true);
assert.equal(vm.runInContext('tryLastGasp(0.350001,currentFish.fightProfile)',gasp),false);
assert.equal(vm.runInContext('tryLastGasp(0.35,currentFish.fightProfile)',gasp),true);
assert.equal(vm.runInContext('fightEffort',gasp),1);
assert.equal(vm.runInContext('tryLastGasp(0.25,currentFish.fightProfile)',gasp),false);
vm.runInContext('resetFishing();',gasp);setup(gasp);
assert.equal(vm.runInContext('lastGaspUsed',gasp),false);
vm.runInContext('fishStamina=maxFishStamina*0.34;fightCooldown=0;fishSteadyResistance=true;fightTick();',gasp);
assert.equal(vm.runInContext('lastGaspUsed',gasp),true);
assert.equal(vm.runInContext('debugLastFightCheck',gasp),'LAST GASP');
assert.equal(vm.runInContext('getFightState()',gasp),'strong');
assert.equal(vm.runInContext('fishSteadyResistance',gasp),false);
// A low-stamina active pull finishes normally; it is not interrupted by Last Gasp.
const active=context();setup(active);
vm.runInContext('fishStamina=maxFishStamina*0.34;startSurge(currentFish.fightProfile,1,false,0.6);fightRemaining=99;fightTick();',active);
assert.equal(vm.runInContext('lastGaspUsed',active),false);
assert.equal(vm.runInContext('fishFighting',active),true);
const smallmouth=context();setup(smallmouth,'smallmouth_bass');
assert.equal(vm.runInContext('tryLastGasp(0.2,currentFish.fightProfile)',smallmouth),false);

// Brook Trout still recovers once at an eligible pull end in the steady model.
const recovery=context();setup(recovery,'brook_trout');
assert.equal(vm.runInContext('tryQuickRecovery(0.700001)',recovery),false);
vm.runInContext('fishStamina=maxFishStamina*0.65;startSurge(currentFish.fightProfile,1,false,0.6);fightRemaining=0.05;',recovery);
let stamina=vm.runInContext('fishStamina',recovery);
const drain=(7+4*0.45)*0.9*(0.45+0.6*1.1)*0.1;
const max=vm.runInContext('maxFishStamina',recovery);
vm.runInContext('fightTick();',recovery);
close(vm.runInContext('fishStamina',recovery),stamina-drain+max*0.25);
assert.equal(vm.runInContext('quickRecoveryUsed',recovery),true);
assert.equal(vm.runInContext('debugLastContinueCheck',recovery),'QUICK RECOVERY +25%');
assert.equal(vm.runInContext('getFightState()',recovery),'steady');
vm.runInContext('fishStamina=maxFishStamina*0.6;startSurge(currentFish.fightProfile,1,false,0.6);fightRemaining=0.05;',recovery);
stamina=vm.runInContext('fishStamina',recovery);
vm.runInContext('fightTick();',recovery);
close(vm.runInContext('fishStamina',recovery),stamina-drain);

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

// Ability-use flags survive later state checks in the completed test report.
const abilityLog=context();
vm.runInContext('debugTestingMode=true;currentFish=fishTypes.find(f=>f.id==="largemouth_bass");currentWeight=4;nibbleDepth=10;beginTestingEncounter();startFight();fishStamina=maxFishStamina*0.34;fishSteadyResistance=true;fightCooldown=0;fightTick();debugLastFightCheck="later check";recordTestingResult("lost","The fish runs out your line.");',abilityLog);
assert.equal(abilityLog.gameLogEntries[0].result.fight.abilitiesUsed.lastGasp,true);
assert.equal(abilityLog.gameLogEntries[0].result.fight.abilitiesUsed.quickRecovery,false);
assert.match(abilityLog.gameLogEntries[0].text,/ABILITIES USED — Last Gasp/);
const brookLog=context();
vm.runInContext('debugTestingMode=true;currentFish=fishTypes.find(f=>f.id==="brook_trout");currentWeight=4;nibbleDepth=10;beginTestingEncounter();startFight();fishStamina=maxFishStamina*0.6;tryQuickRecovery(0.6);recordTestingResult("caught","Landed the fish.");',brookLog);
assert.equal(brookLog.gameLogEntries[0].result.fight.abilitiesUsed.quickRecovery,true);
assert.match(brookLog.gameLogEntries[0].text,/ABILITIES USED — Quick Recovery/);

// Count Feints even if later debug text changes, and keep a saved copy after reset.
const feintLog=context();
vm.runInContext('debugTestingMode=true;currentFish=fishTypes.find(f=>f.id==="chain_pickerel");currentWeight=4;nibbleDepth=10;beginTestingEncounter();startFight();Math.random=()=>0.9;assert.equal(tryStartFeint(1),false);Math.random=()=>0;for(let i=0;i<3;i++)assert.equal(tryStartFeint(1),true);debugLastContinueCheck="later debug text";recordTestingResult("caught","Landed the fish.");',feintLog);
const feintReport=feintLog.gameLogEntries[0];
assert.equal(feintReport.result.fight.abilitiesUsed.feint,true);
assert.equal(feintReport.result.fight.abilityUseCounts.feint,3);
assert.match(feintReport.text,/ABILITIES USED — Feint ×3/);
vm.runInContext('resetFishing();',feintLog);
assert.equal(vm.runInContext('Object.keys(fightAbilityUseCounts).length',feintLog),0);
assert.equal(feintReport.result.fight.abilityUseCounts.feint,3);
setup(feintLog,'chain_pickerel');
assert.equal(vm.runInContext('Object.keys(fightAbilityUseCounts).length',feintLog),0);
// Perch Quick Reaction must appear in summaries; failed activation remains absent.
for(const roll of [0,0.999]){
  const perchLog=context();
  vm.runInContext(`debugTestingMode=true;Math.random=()=>${roll};currentFish=fishTypes.find(f=>f.id==="yellow_perch");currentWeight=2;nibbleDepth=10;beginTestingEncounter();startFight();recordTestingResult("lost","The line snaps.");`,perchLog);
  assert.equal(perchLog.gameLogEntries[0].result.fight.abilitiesUsed.quickReaction,roll===0);
  assert.match(perchLog.gameLogEntries[0].text,roll===0?/ABILITIES USED — Quick Reaction/:/ABILITIES USED — None/);
}
// Aborted encounters report their actual activations before reset clears them.
const abortedFeint=context();
vm.runInContext('debugTestingMode=true;currentFish=fishTypes.find(f=>f.id==="chain_pickerel");currentWeight=4;nibbleDepth=10;beginTestingEncounter();startFight();Math.random=()=>0;tryStartFeint(1);resetFishing();',abortedFeint);
assert.equal(abortedFeint.gameLogEntries[0].result.outcome,'aborted');
assert.equal(abortedFeint.gameLogEntries[0].result.fight.abilityUseCounts.feint,1);
assert.match(abortedFeint.gameLogEntries[0].text,/ABILITIES USED — Feint/);

console.log('Fight mechanics, Last Gasp, Brook Trout recovery, Feint counts, Quick Reaction activation/nonactivation, saved ability snapshots, and reset/abort logging checks passed.');

