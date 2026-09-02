// Fishin' — fishing.js
const TROPHY_VALUE_MULTIPLIER=1.20;

function gainObsession(amount,reason){
  if(!amount || amount<=0) return;
  const before=player.meta.obsession||0;
  player.meta.obsession=Math.max(0,before+amount);
  const after=player.meta.obsession;
  const thresholds=[[10,"Fishing is becoming more than a hobby."],[20,"You think about fishing even when you're asleep."],[25,"Everything else is starting to feel like time away from the water."],[30,"You can't remember the last day you didn't think about fishing."],[35,"Maybe you don't need the job."]];
  for(const [threshold,text] of thresholds){ if(before<threshold && after>=threshold) addLog("world",text); }
  saveMetaProgress();
}

function isPrimeFishingTime(){ return ["Dawn","Twilight"].includes(getTimeLabel()); }
function obsessionForCatch(fish,weight,isNewSpecies,isPersonalBest){ let gain=0.2;if(isNewSpecies)gain+=1;if(isPersonalBest)gain+=0.5;if(weight>=5)gain+=1;if(isPrimeFishingTime())gain+=0.2;return gain; }
function obsessionForLoss(weight){ let gain=0;if(weight>=7)gain+=4;else if(weight>=5)gain+=2;if(isPrimeFishingTime())gain+=0.2;return gain; }
function getEquippedRod(){ return rods[player.gear.rod]||rods.old_rod; }
function getEquippedReel(){ return reels[player.gear.reel]||reels.old_reel; }
function getInventoryLimit(){ const v=vehicles[player.gear.vehicle]||vehicles.old_truck; return player.baseInventoryLimit+(v.creelBonus||0)+((player.gear.truckCreels||0)*10); }

function handleMainButton(){
  // Once a cast has started, its fishing action always wins over a newly
  // reached Work/Sleep boundary. The cast already paid for this time unit.
  // Work/Sleep can only take over after the encounter has fully ended.
  if((state==="waiting" || state==="nibble") && knowsTechnique("twitch")){ twitchLine(); return; }
  if(state==="bite"){ hookFish(); return; }
  if(state==="junk"){ landJunk(); return; }

  if(state==="ready" || state==="finished"){
    if(isWorkDue()){ goToWork(); return; }
    if(isSleepChoice()){ if(canNightFish()) keepFishingAtNight(); return; }
  }

  if(state==="finished"){ clearTimeout(resetTimer);resetFishing();if(!fishButton.disabled)castLine();return; }
  if(state==="ready") castLine();
}

function handleSecondaryFishingButton(){
  if(state==="junk"){landJunk();return;}
  if(state==="waiting"){earlyPull();return;}
  if(state==="nibble"||state==="bite")pullUpAtNibble();
}

function getAvailableDepths(){ return locations[world.location]?.availableDepths||["shallow"]; }
function getAdjacentDepth(depth,availableDepths=DEPTHS){
  const i=DEPTHS.indexOf(depth); if(i<0) return depth;
  const candidates=[];
  if(i>0 && availableDepths.includes(DEPTHS[i-1]))candidates.push(DEPTHS[i-1]);
  if(i<DEPTHS.length-1 && availableDepths.includes(DEPTHS[i+1]))candidates.push(DEPTHS[i+1]);
  return candidates.length?candidates[randomNumber(0,candidates.length-1)]:depth;
}
function weightedKey(weights){
  const entries=Object.entries(weights).filter(([,v])=>v>0);const total=entries.reduce((s,[,v])=>s+v,0);if(!total)return entries[0]?.[0]||null;
  let roll=Math.random()*total;for(const [key,w] of entries){roll-=w;if(roll<=0)return key;}return entries[entries.length-1][0];
}
function hasTackle(id){ return (player.gear.ownedTackle||[]).includes(id); }
function canTargetDepth(depth){
  if(hasTackle("adjustable_dual_diver")) return true;
  return (depth==="shallow"&&hasTackle("surface_float")) || (depth==="mid"&&hasTackle("split_shot_kit")) || (depth==="deep"&&hasTackle("egg_sinker"));
}
function tackleForDepth(depth){
  if(hasTackle("adjustable_dual_diver")) return "adjustable_dual_diver";
  return depth==="shallow"?"surface_float":depth==="mid"?"split_shot_kit":"egg_sinker";
}
function determineCastProfile(){
  const loc=locations[world.location];
  const available=loc.availableDepths;
  if(player.selectedDepth!=="random" && available.includes(player.selectedDepth) && canTargetDepth(player.selectedDepth)){
    const target=player.selectedDepth;
    const tackleId=tackleForDepth(target);
    const accuracy=TARGET_DEPTH_ACCURACY[tackleId]??0.95;
    if(Math.random()<accuracy) return {depth:target,speciesDepth:target,forcedOffDepth:false};
    const miss=getAdjacentDepth(target,available);
    return {depth:target,speciesDepth:miss,forcedOffDepth:miss!==target};
  }
  const validOdds=Object.fromEntries(Object.entries(loc.starterDepthOdds).filter(([d])=>available.includes(d)));
  const depth=weightedKey(validOdds)||available[0];
  return {depth,speciesDepth:depth,forcedOffDepth:false};
}

function rollEncounterType(){
  const rates=locations[world.location].encounterRates;
  // Mid-water has less junk available to snag. Treat encounter rates as weights
  // and normalize after applying the depth modifier, so less junk modestly raises
  // the relative chance of both fish and nothing rather than reallocating it directly.
  const junkModifier=currentCastProfile?.depth==="mid"?0.5:1;
  const fishWeight=rates.fish,nothingWeight=rates.nothing,junkWeight=rates.junk*junkModifier;
  const total=fishWeight+nothingWeight+junkWeight;
  let r=Math.random()*total;
  if((r-=fishWeight)<0)return "fish";
  if((r-=nothingWeight)<0)return "nothing";
  return "junk";
}
function pickJunk(){ return junkItems[randomNumber(0,junkItems.length-1)]; }
function getPrimaryDepth(fish){
  return Object.entries(fish.depthPreferences||{}).sort((a,b)=>b[1]-a[1])[0]?.[0]||"shallow";
}
function isFishOffDepth(fish,actualDepth){ return getPrimaryDepth(fish)!==actualDepth && (fish.depthPreferences?.[actualDepth]??0)<0.55; }

function getDebugForcedFish(){
  if(!debugSpecifyFish||!debugForcedFishId)return null;
  const base=locationFishWeights[world.location]||{};
  if((base[debugForcedFishId]||0)<=0)return null;
  return fishTypes.find(f=>f.id===debugForcedFishId)||null;
}
function generateDebugWeight(fish,weightClass=2){
  const min=fish.minWeight,max=fish.maxWeight,trophy=Math.min(max,fish.trophyWeight);
  const normalSpan=Math.max(0.001,trophy-min);
  const bands=[
    [min,min+normalSpan*0.22],
    [min+normalSpan*0.15,min+normalSpan*0.42],
    [min+normalSpan*0.32,min+normalSpan*0.62],
    [min+normalSpan*0.52,min+normalSpan*0.82],
    [min+normalSpan*0.72,Math.max(min+normalSpan*0.90,trophy-0.001)],
    [trophy,max]
  ];
  const band=bands[Math.max(0,Math.min(5,Number(weightClass)||0))];
  return randomDecimal(Math.min(band[0],band[1]),Math.max(band[0],band[1]));
}
function setupEncounterForCurrentCast(){
  const forcedFish=getDebugForcedFish();
  currentEncounterType=forcedFish?"fish":rollEncounterType();currentFish=null;currentJunk=null;currentWeight=0;currentOffDepth=false;
  if(currentEncounterType==="fish"){
    currentFish=forcedFish||chooseFish(currentCastProfile.speciesDepth);
    currentOffDepth=forcedFish?false:(currentCastProfile.forcedOffDepth||isFishOffDepth(currentFish,currentCastProfile.depth));
    currentWeight=forcedFish?generateDebugWeight(currentFish,debugWeightClass):generateFishWeight(currentFish,currentOffDepth);
    nibbleDepth=calculateNibbleDepth(currentWeight);
  }else if(currentEncounterType==="junk") currentJunk=pickJunk();
}

let currentCastProfile={depth:"shallow",speciesDepth:"shallow",forcedOffDepth:false};

function castLine(){
  clearFishingTimers();
  if(isWorkDue() || isSleepChoice()){ updateTimeControls(); return; }
  if(player.inventory.length>=getInventoryLimit()){ message.textContent="Your creel is full."; updateTimeControls(); return; }
  if(player.gear.bait[player.selectedBait]<=0){ message.textContent="You're out of "+player.selectedBait.toLowerCase()+"s."; updateTimeControls(); return; }
  state="casting";currentCastProfile=determineCastProfile();currentDepth=currentCastProfile.depth;setupEncounterForCurrentCast();
  nibbleCount=0;successfulTwitches=0;twitchPrimed=false;pendingNervousnessMultiplier=1;disturbance=0;lastNibbleAt=0;fishHasLeft=false;startDisturbanceDecay();
  lineDepth=0;message.textContent="You cast your line.";hint.textContent="";fightPanel.classList.remove("active");
  fishButton.disabled=true;pullUpButton.style.display="none";marketButton.disabled=true;shopButton.disabled=true;fishButton.textContent="Casting...";
  if(typeof updateDepthDisplay==="function")updateDepthDisplay();
  lineTimer=setInterval(()=>{lineDepth++;drawLine();if(lineDepth>=CAST_DEPTH){clearInterval(lineTimer);beginWaiting();}},120);
}

function fishingScheduleBoundaryReached(){
  return isWorkDue() || isSleepChoice();
}
function autoPullForSchedule(){
  clearFishingTimers();
  state="ready";
  lineDepth=0;
  drawLine();
  currentFish=null;currentWeight=0;currentEncounterType=null;currentJunk=null;currentOffDepth=false;
  nibbleCount=0;successfulTwitches=0;twitchPrimed=false;pendingNervousnessMultiplier=1;fishHasLeft=false;
  pullUpButton.style.display="none";
  hint.textContent="";
  if(isWorkDue()) message.textContent="You pull up your line. It's time for work already.";
  else if(isSleepChoice()) message.textContent="You pull up your line. It's time to sleep.";
  updateTimeControls();
  saveGame();
}
function spendFishingUnit(finishCurrentEncounter=false){
  const priorMessage=message.textContent;
  advanceFishingTime();
  // A cast that was legal when it started gets to resolve its current encounter.
  // Do not announce Work/Sleep in the middle of that encounter; the boundary UI
  // is applied atomically when the encounter ends or another wait would begin.
  if(fishingScheduleBoundaryReached()){
    if(!finishCurrentEncounter){autoPullForSchedule();return false;}
    message.textContent=priorMessage;
  }
  return true;
}
function beginWaiting(){
  state="waiting";message.textContent="";updateFishingControls();
  // The initial cast commits one fishing time unit, but it is allowed to finish.
  if(!spendFishingUnit(true)) return;
  scheduleCurrentEncounter();
}
function scheduleCurrentEncounter(extraDelay=0){
  clearTimeout(nibbleTimer);
  if(currentEncounterType==="fish") scheduleNextNibble(randomNumber(MIN_NIBBLE_TIME,MAX_NIBBLE_TIME)+extraDelay);
  else if(currentEncounterType==="junk") nibbleTimer=setTimeout(junkTug,randomNumber(1200,2600)+extraDelay);
  else nibbleTimer=setTimeout(noEncounter,randomNumber(1500,3000)+extraDelay);
}
function noEncounter(){
  if(state!=="waiting")return;
  message.textContent="Nothing seems interested.";
  // Waiting is automatic. After a short visible pause, another unit passes.
  nibbleTimer=setTimeout(()=>{
    if(state!=="waiting")return;
    if(fishingScheduleBoundaryReached()){autoPullForSchedule();return;}
    if(!spendFishingUnit())return;
    message.textContent="";
    setupEncounterForCurrentCast();
    scheduleCurrentEncounter();
  },900);
}
function junkTug(){
  if(state!=="waiting")return;
  state="junk";message.textContent="Something catches on the line.";updateFishingControls();
}
function landJunk(){
  if(state!=="junk"||!currentJunk)return;
  clearFishingTimers();state="retracting";fishButton.disabled=true;message.textContent="";
  lineTimer=setInterval(()=>{lineDepth--;drawLine();if(lineDepth<=0){clearInterval(lineTimer);addLog("catch","Pulled up "+currentJunk.name+".");message.textContent=currentJunk.name+".";resetTimer=setTimeout(()=>resetFishing(),900);}},90);
}

function scheduleNextNibble(delay){ clearTimeout(nibbleTimer);nibbleTimer=setTimeout(()=>{if((state!=="waiting"&&state!=="nibble")||fishHasLeft)return;firstNibble();},delay); }

function getNibbleProbabilities(nibbleNumber=nibbleCount,assumePrimed=twitchPrimed){
  if(!currentFish)return {biteChance:0,rawNervousness:0,effectiveLeaveChance:0};
  const b=currentFish.nibbleBehavior;
  const response=clamp(b.twitchResponse ?? 0,0,2);
  // Each well-timed Twitch permanently adds another response-scaled bite-growth
  // increment. This represents the fish becoming more committed to the bait.
  const twitchInterest=successfulTwitches*b.biteGrowth*response;
  const biteChance=clamp(b.baseBite+Math.max(0,nibbleNumber-1)*b.biteGrowth+twitchInterest,0,1);
  // The first nibble is a free look. Nervousness begins affecting departure on
  // the second nibble, then grows with each additional inspection.
  let rawNervousness=nibbleNumber<=1?0:b.baseNervousness+Math.max(0,nibbleNumber-2)*b.nervousnessGrowth;
  if(assumePrimed)rawNervousness/=1+response;
  rawNervousness=clamp(rawNervousness*pendingNervousnessMultiplier,0,1);
  // Commitment suppresses flight. Bite is always rolled before leave.
  const effectiveLeaveChance=clamp(rawNervousness*(1-biteChance),0,1);
  return {biteChance,rawNervousness,effectiveLeaveChance};
}
function nibbleInterestText(biteChance){
  if(biteChance<0.15)return "A twitch on your line.";
  if(biteChance<0.30)return "A cautious nibble.";
  if(biteChance<0.50)return "It wants your bait.";
  if(biteChance<0.75)return "That was nearly a bite...";
  return "It might bite any second.";
}
function nibbleLeaveText(effectiveLeaveChance){
  if(effectiveLeaveChance<=0.15)return "";
  if(effectiveLeaveChance<=0.25)return "Feels nervous.";
  if(effectiveLeaveChance<=0.40)return "It's suspicious.";
  return "If anything goes wrong, it'll bolt.";
}
function updateNibbleDecisionMessage(){
  // The message describes the NEXT decision state, so it is useful information
  // the player can act on before the next nibble.
  const next=getNibbleProbabilities(nibbleCount+1,twitchPrimed);
  const parts=[nibbleInterestText(next.biteChance),nibbleLeaveText(next.effectiveLeaveChance)].filter(Boolean);
  message.textContent=parts.join(" ");
}
function firstNibble(){
  if(fishHasLeft||!currentFish)return;
  state="nibble";nibbleCount++;lastNibbleAt=Date.now();lineDepth=nibbleDepth;drawLine();updateFishingControls();
  resolveNibble();
}
function resolveNibble(){
  if(!currentFish||fishHasLeft)return;
  const probs=getNibbleProbabilities(nibbleCount,twitchPrimed);
  // A primed Twitch applies to this check only for nervousness suppression; its
  // interest gain already persists through successfulTwitches. A mistimed
  // Twitch penalty is likewise consumed by this check.
  twitchPrimed=false;pendingNervousnessMultiplier=1;
  clearTimeout(biteTimer);
  biteTimer=setTimeout(()=>{
    if(state!=="nibble")return;
    if(Math.random()<probs.biteChance){fishBites();return;}
    if(Math.random()<probs.effectiveLeaveChance){fishLeaves();return;}
    updateNibbleDecisionMessage();
    scheduleNextNibble(randomNumber(NIBBLE_PAUSE_MIN,NIBBLE_PAUSE_MAX));
  },250);
}
function twitchLine(){
  if(!["waiting","nibble","bite"].includes(state))return;
  disturbance+=1;
  if(state==="waiting"&&!currentFish){
    const spooklessPenalty=Math.max(0,disturbance-2)*0.08;if(Math.random()<spooklessPenalty){message.textContent="The water goes quiet.";}
    clearTimeout(nibbleTimer);setupEncounterForCurrentCast();scheduleCurrentEncounter(randomNumber(250,650));return;
  }
  if(fishHasLeft||!currentFish)return;
  const recentNibble=Date.now()-lastNibbleAt<=TWITCH_BITE_WINDOW;
  // A single Twitch in the post-nibble timing window works the bait: it raises
  // commitment and suppresses nervousness on the next nibble check.
  if(state==="nibble"&&recentNibble&&!twitchPrimed){
    twitchPrimed=true;successfulTwitches++;
    updateNibbleDecisionMessage();
    return;
  }
  // Outside the timing window (or mashing Twitch twice), nervousness doubles
  // on the next leave check rather than causing an unrelated instant-spook roll.
  pendingNervousnessMultiplier=clamp(pendingNervousnessMultiplier*2,1,4);
  if(state==="waiting"){message.textContent="You twitch the bait.";clearTimeout(nibbleTimer);scheduleNextNibble(randomNumber(350,900));return;}
  if(state==="nibble"){updateNibbleDecisionMessage();return;}
  if(state==="bite")message.textContent="BITE!";
}
function startDisturbanceDecay(){clearInterval(disturbanceTimer);disturbanceTimer=setInterval(()=>{if(disturbance>0)disturbance=Math.max(0,disturbance-0.35);},1200);}

function restartWaitingAfterFish(extraDelay=0){
  currentFish=null;currentWeight=0;nibbleCount=0;successfulTwitches=0;twitchPrimed=false;pendingNervousnessMultiplier=1;lastNibbleAt=0;fishHasLeft=false;state="waiting";
  updateFishingControls();
  // The line stays out; waiting for the next encounter costs another unit.
  nibbleTimer=setTimeout(()=>{
    if(state!=="waiting")return;
    if(fishingScheduleBoundaryReached()){autoPullForSchedule();return;}
    if(!spendFishingUnit())return;
    message.textContent="";
    setupEncounterForCurrentCast();
    scheduleCurrentEncounter(extraDelay);
  },700);
}
function fishLeaves(){
  if(fishHasLeft)return;fishHasLeft=true;clearTimeout(nibbleTimer);clearTimeout(biteTimer);message.textContent="The fish moved on.";player.pub.fishMovedOnCount=(player.pub.fishMovedOnCount||0)+1;disturbance=Math.max(0,disturbance-1);restartWaitingAfterFish();
}
function fishSpooked(){
  if(fishHasLeft)return;fishHasLeft=true;clearTimeout(nibbleTimer);clearTimeout(biteTimer);message.textContent="You spooked the fish.";addLog("fishing","You spooked the fish.");restartWaitingAfterFish(1000);
}

function pullUpAtNibble(){if(state!=="nibble"&&state!=="bite")return;clearTimeout(biteTimer);addLostFishLog();state="retracting";pullUpButton.style.display="none";message.textContent="";retractLine();}
function earlyPull(){if(state!=="waiting")return;clearTimeout(nibbleTimer);if(currentFish)addLostFishLog();state="retracting";pullUpButton.style.display="none";message.textContent="";retractLine();}
function addLostFishLog(){gainObsession(obsessionForLoss(currentWeight),"the one that got away");addLog("catch","Lost "+currentFish.name+" — "+currentWeight.toFixed(2)+" lb.");}
function retractLine(){fishButton.disabled=true;lineTimer=setInterval(()=>{lineDepth--;drawLine();if(lineDepth<=0){clearInterval(lineTimer);resetFishing();}},100);}

function fishBites(){if(state!=="nibble")return;state="bite";message.textContent="BITE!";updateFishingControls();clearTimeout(biteTimer);biteTimer=setTimeout(missHook,currentFish.hookWindow);}
function hookFish(){if(state!=="bite")return;clearTimeout(biteTimer);clearInterval(disturbanceTimer);pullUpButton.style.display="none";consumeBait();startFight();}
function missHook(){
  if(state!=="bite")return;gainObsession(obsessionForLoss(currentWeight),"missed big fish");clearInterval(disturbanceTimer);pullUpButton.style.display="none";consumeBait();state="finished";
  addLog("catch","Lost "+currentFish.name+" — "+currentWeight.toFixed(2)+" lb. Missed the hook.");message.textContent="You lost the fish.";hint.textContent="You missed the hook.\nYour bait is gone too.";finishFishingFailure();
}
function consumeBait(){player.gear.bait[player.selectedBait]--;updateDisplays();renderGearInventory();saveGame();}

function fishHasSpecialAbility(id){return !!currentFish?.specialAbilities?.includes(id);}
function tryStartFeint(staminaPercent){
  const ability=specialAbilities.feint;
  if(!fishHasSpecialAbility("feint")||staminaPercent<0.50||Math.random()>=ability.triggerChance)return false;
  activeSpecialAbility="feint";fightRecoveryLeft=true;fightSwingTarget=ability.restTarget ?? -0.21;fightSwingTargetTimer=ability.restDuration;forcedSurgeMultiplier=ability.followupSurgeMultiplier;
  debugLastContinueCheck+=" → FEINT";return true;
}
function tryQuickRecovery(staminaPercent){
  const ability=specialAbilities.quick_recovery;
  if(!fishHasSpecialAbility("quick_recovery")||quickRecoveryUsed||staminaPercent>ability.threshold||Math.random()>=ability.chance)return false;
  fishStamina=clamp(fishStamina+maxFishStamina*ability.recoveryFraction,0,maxFishStamina);
  quickRecoveryUsed=true;
  debugLastContinueCheck="QUICK RECOVERY +"+Math.round(ability.recoveryFraction*100)+"%";
  return true;
}
function tryLastGasp(staminaPercent,profile){
  const ability=specialAbilities.last_gasp;
  if(!fishHasSpecialAbility("last_gasp")||lastGaspUsed||staminaPercent>ability.threshold)return false;
  lastGaspUsed=true;
  startSurge(profile,1,true);
  debugLastFightCheck="LAST GASP";
  return true;
}
function startFight(){
  state="reeling";isReeling=false;isHoldingPressure=false;fishFighting=false;tension=28;startingDistance=nibbleDepth;fishDistance=startingDistance;maxFightDistance=startingDistance*1.75;fightSwing=0;fightSwingVelocity=0;fightSwingTarget=0;fightSwingTargetTimer=0;fightRecoveryLeft=false;activeSpecialAbility=null;forcedSurgeMultiplier=1;quickRecoveryUsed=false;lastGaspUsed=false;debugLastFightCheck="—";debugLastContinueCheck="—";
  const profile=currentFish.fightProfile || {staminaMultiplier:1,aggression:0.55,staminaDrain:0.9};
  maxFishStamina=(70+currentWeight*8+currentFish.fightPower*15)*profile.staminaMultiplier;fishStamina=maxFishStamina;fightCooldown=0.45;fightRemaining=0;
  if(fishHasSpecialAbility("quick_reaction") && Math.random()<(specialAbilities.quick_reaction?.chance ?? 0.98)){
    startSurge(profile);
    debugLastFightCheck="QUICK REACTION";
  }
  fightPanel.classList.add("active");normalControls.style.display="none";fightControls.style.display="flex";fightPressureButton.style.display=knowsTechnique("hold_pressure")?"inline-block":"none";message.textContent="Fish on!";hint.textContent="";fightReelButton.textContent="HOLD TO REEL [↑]";fightPressureButton.textContent="HOLD PRESSURE [↓]";updateFightDisplay();fightTimer=setInterval(fightTick,100);
}
function getSurgeSwingTarget(surgeStrength){
  // Right only means the fish is actively fighting. Stronger surges pull farther right.
  return clamp(0.18 + surgeStrength*0.34, 0.28, 0.54);
}
function startSurge(profile,multiplier=1,fullStrength=false){
  if(fishStamina<=0 && !fullStrength)return false;
  surgeStartStaminaPercent=fullStrength?1:(maxFishStamina>0?fishStamina/maxFishStamina:0);
  fishFighting=true;
  fightRemaining=getFightDuration();
  forcedSurgeMultiplier=multiplier;
  return true;
}
function aggressionFightChance(profile,staminaPercent){
  const aggression=clamp(profile.aggression ?? 0.55,0,1);
  // Tired fish become less willing to fight, but aggression resists fatigue.
  // Very aggressive fish can keep choosing to fight even when nearly spent.
  const staminaWillingness=0.20+0.80*staminaPercent;
  const stubbornness=aggression*aggression*(1-staminaPercent)*0.55;
  return clamp(aggression*staminaWillingness+stubbornness,0.02,0.98);
}
function fightTick(){
  if(state!=="reeling")return;
  const dt=0.1;
  const rod=getEquippedRod();
  const reel=getEquippedReel();
  const profile=currentFish.fightProfile || {staminaMultiplier:1,aggression:0.55,staminaDrain:0.9};

  if(fishFighting){
    fightRemaining-=dt;
    // Fighting continuously spends stamina. Hold Pressure makes the fish work harder.
    const drain=(7.0+currentWeight*0.45)*profile.staminaDrain*(isHoldingPressure?1.55:1)*dt;
    fishStamina=clamp(fishStamina-drain,0,maxFishStamina);
    if(fightRemaining<=0 || fishStamina<=0){
      fishFighting=false;forcedSurgeMultiplier=1;fightSwingTarget=0;
      const sp=maxFishStamina>0?fishStamina/maxFishStamina:0;
      if(tryQuickRecovery(sp)){fightCooldown=getNextFightDelay();}
      else if(tryStartFeint(sp)){/* feint controls its own recovery */}
      else {fightCooldown=getNextFightDelay();if(sp<0.35){fightRecoveryLeft=true;fightSwingTarget=-0.16;fightSwingTargetTimer=0.65;}}
    }
  }else if(fightRecoveryLeft){
    fightSwingTargetTimer=Math.max(0,fightSwingTargetTimer-dt);
    if(activeSpecialAbility==="feint")fightSwingTarget=specialAbilities.feint.restTarget ?? -0.21;
    else fightSwingTarget=-0.16;
    if(fightSwingTargetTimer<=0){
      fightRecoveryLeft=false;
      if(activeSpecialAbility==="feint"){
        activeSpecialAbility=null;startSurge(profile,specialAbilities.feint.followupSurgeMultiplier);
      }else fightSwingTarget=0;
    }
  }else{
    fightSwingTarget=0;fightCooldown-=dt;
    if(fightCooldown<=0){
      const sp=maxFishStamina>0?fishStamina/maxFishStamina:0;
      if(!tryLastGasp(sp,profile)){
        const chance=aggressionFightChance(profile,sp);
        const roll=Math.random();
        const fights=fishStamina>0 && roll<chance;
        debugLastFightCheck=(roll*100).toFixed(1)+"% vs "+(chance*100).toFixed(1)+"% AGGRESSION → "+(fights?"FIGHT":"REST");
        if(fights)startSurge(profile);
        else fightCooldown=getNextFightDelay();
      }
    }
  }

  const staminaPercent=maxFishStamina>0?fishStamina/maxFishStamina:0;
  // A surge spends stamina when it begins, but its strength reflects the
  // energy the fish had at the start of that surge. The cost weakens FUTURE runs.
  const surgeEnergy=fishFighting?surgeStartStaminaPercent:staminaPercent;
  const surgeStrength=(0.30+Math.sqrt(clamp(surgeEnergy,0,1))*0.70)*forcedSurgeMultiplier;

  if(fishFighting){
    fightSwingTarget=getSurgeSwingTarget(surgeStrength);
  }else if(!fightRecoveryLeft){
    fightSwingTarget=0;
  }

  // Slow/inertial movement: center is the true default, right means surge,
  // left is a brief fatigue reward after the fish is below half stamina.
  fightSwingVelocity+=(fightSwingTarget-fightSwing)*0.020;
  fightSwingVelocity*=0.89;
  fightSwing=clamp(fightSwing+fightSwingVelocity,-0.20,0.56);

  const reelLeverage=1-fightSwing*0.22;
  const tensionLeverage=1+fightSwing*0.28;
  const runRate=(0.7+currentWeight*0.12)*currentFish.fightPower*surgeStrength*(1+Math.max(0,fightSwing)*0.16);
  // During a surge, reeling is a direct tug-of-war: fish pull and reel pull
  // oppose each other on the same tick. A strong fish can still take line,
  // but a better reel meaningfully slows/stops that run. As stamina falls and
  // surgeStrength weakens, the same reel can begin gaining line mid-surge.
  const fightingReelRate=4.5*reel.reelPower*reelLeverage;
  // Even a calm fish has weight and resistance. Strong, high-stamina fish take
  // longer to reel even when they are not actively surging.
  const passiveStrength=currentFish.fightPower*(0.25+staminaPercent*0.45);
  const passiveResistance=Math.min(0.72,(currentWeight/(currentWeight+6))*0.42+passiveStrength*0.055);
  const calmReelRate=1.7*reel.reelPower*reelLeverage*(1-passiveResistance);

  if(isReeling){
    if(fishFighting){
      tension+=(28+currentWeight*5)*currentFish.fightPower*surgeStrength*rod.tensionMultiplier*tensionLeverage*dt;
      fishDistance+=(runRate-fightingReelRate)*dt;
    }else{
      tension+=7*rod.tensionMultiplier*tensionLeverage*dt;
      fishDistance-=calmReelRate*dt;
    }
  }else if(isHoldingPressure && fishFighting){
    // Hold Pressure fights the fish, not the line: it never adds tension.
    // It gives up a little line, relieves tension slowly, and the extra
    // stamina burn is applied above while the fish is surging.
    tension-=6.5*dt;
    fishDistance+=runRate*0.30*dt;
  }else{
    if(fishFighting){
      tension-=26*dt;
      fishDistance+=runRate*dt;
    }else{
      tension-=13*dt;
      fishDistance+=(0.08+currentWeight*0.015)*dt;
    }
  }

  tension=clamp(tension,0,100);
  fishDistance=Math.max(0,fishDistance);
  if(tension>=100){loseFish("The line snaps.");return;}
  if(fishDistance>=maxFightDistance){
    fishDistance=maxFightDistance;
    updateFightDisplay();
    loseFish("The fish runs out your line.");
    return;
  }
  if(fishDistance<=0){landFish();return;}
  updateFightDisplay();
}
function getNextFightDelay(){
  const sp=maxFishStamina>0?fishStamina/maxFishStamina:0;
  const sizePressure=Math.min(0.6,currentWeight*0.035);
  const fatigueDelay=(1-sp)*0.8;
  return Math.max(0.65,randomDecimal(0.85,1.35)-sizePressure+fatigueDelay);
}
function getFightDuration(){
  const sp=maxFishStamina>0?fishStamina/maxFishStamina:0;
  const base=randomDecimal(0.6,1.15)+Math.min(0.75,currentWeight*0.06);
  return Math.max(0.30,base*(0.55+sp*0.45));
}
function updateFightDisplay(){drawTensionGrid();drawFightLine();renderDebugFightMeters();}
function renderDebugFightMeters(){
  if(!fightPanel)return;
  if((!debugFightMeters && !debugFishStats) || state!=="reeling"){
    fightPanel.classList.remove("debugMetersVisible");
    fightPanel.innerHTML="";
    return;
  }
  fightPanel.classList.add("debugMetersVisible");
  const lineOut=maxFightDistance>0?clamp(fishDistance/maxFightDistance,0,1)*100:0;
  const staminaPct=maxFishStamina>0?clamp(fishStamina/maxFishStamina,0,1)*100:0;
  const profile=currentFish && currentFish.fightProfile ? currentFish.fightProfile : {aggression:0.55,staminaDrain:0.9};
  let html="";
  if(debugFightMeters){
    html+=`
      <div class="debugFightMeter"><div class="meterLabel">TENSION — ${Math.round(tension)}%</div><div class="meter"><div class="meterFill" id="debugTensionFill" style="width:${clamp(tension,0,100).toFixed(1)}%"></div></div></div>
      <div class="debugFightMeter"><div class="meterLabel">LINE OUT — ${Math.round(lineOut)}%</div><div class="meter"><div class="meterFill" id="debugDistanceFill" style="width:${lineOut.toFixed(1)}%"></div></div></div>`;
  }
  if(debugFishStats){
    const fightState=fishFighting?"SURGING RIGHT":fightRecoveryLeft?"TIRED / LEFT":"CENTER";
    html+=`<div class="debugFishStats">
      <div><strong>${currentFish?currentFish.name:"Fish"}</strong> — ${currentWeight.toFixed(2)} lb</div>
      <div>STAMINA — ${fishStamina.toFixed(1)} / ${maxFishStamina.toFixed(1)} (${staminaPct.toFixed(1)}%)</div>
      <div>STATE — ${fightState}</div>
      <div>STRENGTH — ${currentFish.fightPower.toFixed(2)}</div>
      <div>AGGRESSION — ${((profile.aggression ?? 0.55)*100).toFixed(0)}%</div>
      <div>STAMINA MULTIPLIER — ${(profile.staminaMultiplier ?? 1).toFixed(2)}×</div>
      <div>LAST FIGHT CHECK — ${debugLastFightCheck}</div>
      <div>SPECIAL — ${debugLastContinueCheck}</div>
    </div>`;
  }
  fightPanel.innerHTML=html;
}
function drawTensionGrid(){
  if(!tensionGrid || !tensionFillLayer)return;
  const level=Math.round(clamp(tension,0,100));
  tensionGrid.classList.toggle("active",state==="reeling");
  tensionFillLayer.style.height=level+"%";
  tensionFillLayer.classList.toggle("danger",level>=80);
}
function drawFightLine(){
  line.innerHTML="";
  const ratio=maxFightDistance>0?clamp(fishDistance/maxFightDistance,0,1):0;
  // Derive the drawable rows from the actual stage height so 100% line-out
  // reaches the visual bottom instead of stopping short of the mechanical limit.
  const lineHeight=16;
  const stageHeight=(lineStage && lineStage.clientHeight) ? lineStage.clientHeight : 240;
  const rows=Math.max(1,Math.floor(stageHeight/lineHeight));
  // Length is the primary line-out cue: the fish climbs toward the top as it comes in and drops toward the bottom as it runs.
  const dots=Math.max(1,Math.round(1+ratio*(rows-1)));
  const swingPixels=fightSwing*36;
  for(let i=0;i<dots;i++){
    const dot=document.createElement("span");
    dot.className="lineDot";dot.textContent="•";
    const progress=i/Math.max(1,dots-1);
    dot.style.transform="translateX("+(swingPixels*progress).toFixed(1)+"px)";
    if(ratio>=0.95)dot.classList.add("lineExtreme");
    else if(ratio>=0.80)dot.classList.add("lineCritical");
    else if(ratio>=0.60)dot.classList.add("lineWarning");
    line.appendChild(dot);
  }
}

function generateFishWeight(fish,offDepth=false){
  const min=fish.minWeight,max=fish.maxWeight,trophy=fish.trophyWeight;
  if(offDepth){
    const floor=min+(trophy-min)*0.65;
    if(Math.random()<0.10)return randomDecimal(trophy,max);
    return randomDecimal(floor,Math.max(floor,trophy-0.001));
  }
  // A continuous weight distribution with a thin upper tail: ~2% lands above the trophy threshold.
  if(Math.random()<0.02)return randomDecimal(trophy,max);
  const r=(Math.random()+Math.random()+Math.random())/3;
  return min+(trophy-min)*r;
}
function isTrophyFish(fish,weight){return weight>=fish.trophyWeight;}
function updateAllTimeBest(fish,weight){
  if(!player.meta.allTimeBests)player.meta.allTimeBests={};const old=player.meta.allTimeBests[fish.id]||0;if(weight>old){player.meta.allTimeBests[fish.id]=weight;saveMetaProgress();return true;}return false;
}

function landFish(){
  clearInterval(fightTimer);state="finished";isReeling=false;isHoldingPressure=false;fightPanel.classList.remove("active");if(tensionGrid){tensionGrid.classList.remove("active");}if(tensionFillLayer){tensionFillLayer.style.height="0%";tensionFillLayer.classList.remove("danger");}fightControls.style.display="none";normalControls.style.display="block";catchIdCounter++;
  const trophy=isTrophyFish(currentFish,currentWeight);if(trophy)player.pub.unacknowledgedTrophy=true;const value=currentWeight*currentFish.valuePerPound*(trophy?TROPHY_VALUE_MULTIPLIER:1);
  const rec={id:catchIdCounter,speciesId:currentFish.id,name:currentFish.name,weight:currentWeight,baseValue:value,status:"kept",caughtAt:new Date(),location:world.location,weather:getCurrentWeatherTags(),season:world.season,day:world.seasonDay,time:getTimeLabel(),bait:player.selectedBait,depth:currentDepth,offDepth:currentOffDepth,trophy};
  const priorSpecies=player.catchHistory.filter(c=>c.speciesId===currentFish.id);const isNewSpecies=priorSpecies.length===0;const priorBest=priorSpecies.length?Math.max(...priorSpecies.map(c=>c.weight)):0;const isPersonalBest=currentWeight>priorBest;const newAllTime=updateAllTimeBest(currentFish,currentWeight);
  gainObsession(obsessionForCatch(currentFish,currentWeight,isNewSpecies,isPersonalBest),"catch");learnFishKnowledge(currentFish.id,["name","waterType"]);player.catchHistory.push(rec);player.inventory.push(rec);
  addLog("catch",(trophy?"Trophy ":"")+"Caught "+currentFish.name+" — "+currentWeight.toFixed(2)+" lb.");
  message.textContent=trophy?`   .-========-.
  /  TROPHY  \
 |     \__/     |
  \          /
   --------

You caught a trophy ${currentFish.name}!`:"You caught a "+currentFish.name+"!";hint.textContent=currentWeight.toFixed(2)+" lb"+(trophy?" — TROPHY (+20% value)":"")+(newAllTime?"\nNew All-Time Best":"")+"\nEstimated value: $"+value.toFixed(2);
  lineDepth=0;drawLine();updateInventoryDisplay();updateTimeControls();
  if(trophy){fishButton.disabled=true;pullUpButton.style.display="none";sleepButton.disabled=true;marketButton.disabled=true;shopButton.disabled=true;}
  saveGame();if(!trophy&&!isWorkDue()&&!isSleepChoice())fishButton.textContent="Cast Again";resetTimer=setTimeout(()=>{if(state==="finished")resetFishing();},trophy?3400:2200);
}
function loseFish(reason){if(reason==="The line snaps." && fishFighting)player.pub.lineBrokenDuringSurge=true;gainObsession(obsessionForLoss(currentWeight),"big loss");clearInterval(fightTimer);state="finished";isReeling=false;isHoldingPressure=false;fightPanel.classList.remove("active");if(tensionGrid){tensionGrid.classList.remove("active");}if(tensionFillLayer){tensionFillLayer.style.height="0%";tensionFillLayer.classList.remove("danger");}fightControls.style.display="none";normalControls.style.display="block";addLog("catch","Lost "+currentFish.name+" — "+currentWeight.toFixed(2)+" lb. "+reason);message.textContent="You lost the fish.";hint.textContent=reason+"\nYour bait is gone too.";finishFishingFailure();}
function finishFishingFailure(){lineDepth=0;drawLine();updateTimeControls();saveGame();if(!isWorkDue()&&!isSleepChoice())fishButton.textContent="Cast Again";resetTimer=setTimeout(()=>{if(state==="finished")resetFishing();},1800);}

function chooseFish(depth){
  const tags=getCurrentWeatherTags(),bait=player.selectedBait,time=getTimeLabel(),base=locationFishWeights[world.location]||{};
  const weighted=[];
  for(const fish of fishTypes){
    if(fish.id==="arctic_charr" && !player.pub.knowsArcticCharr) continue;
    const locationBase=base[fish.id]||0;if(locationBase<=0)continue;
    const depthAffinity=fish.depthPreferences?.[depth]??0;if(depthAffinity<=0)continue;
    let weight=locationBase*depthAffinity;
    for(const pref of fish.weatherPreferences||[]){if(tags.includes(pref))weight*=1.35;}
    if((fish.seasonPreferences||[]).includes(world.season))weight*=1.22;else weight*=0.75;
    weight*=fish.baitPreferences?.[bait]??0.5;
    weight*=fish.timePreferences?.[time]??1;
    weighted.push({fish,weight});
  }
  if(!weighted.length){
    for(const fish of fishTypes){const locationBase=base[fish.id]||0;if(locationBase>0)weighted.push({fish,weight:locationBase});}
  }
  const total=weighted.reduce((s,i)=>s+i.weight,0);let roll=Math.random()*total;for(const item of weighted){roll-=item.weight;if(roll<=0)return item.fish;}return weighted[weighted.length-1]?.fish||fishTypes[0];
}

function calculateNibbleDepth(weight){const base=5;let pull=Math.round(Math.min(weight,8))+randomNumber(-1,1);return Math.max(base,Math.min(12,base+pull));}
function drawLine(){line.innerHTML="";for(let i=0;i<lineDepth;i++){const dot=document.createElement("span");dot.className="lineDot";dot.textContent="•";line.appendChild(dot);}}
function resetFishing(){
  clearFishingTimers();state="ready";isReeling=false;isHoldingPressure=false;fishFighting=false;tension=0;fightSwing=0;fightSwingVelocity=0;fightSwingTarget=0;fightSwingTargetTimer=0;fightRecoveryLeft=false;activeSpecialAbility=null;forcedSurgeMultiplier=1;quickRecoveryUsed=false;lastGaspUsed=false;fishStamina=100;maxFishStamina=100;surgeStartStaminaPercent=1;debugLastFightCheck="—";debugLastContinueCheck="—";lineDepth=0;currentFish=null;currentWeight=0;currentEncounterType=null;currentJunk=null;currentOffDepth=false;nibbleCount=0;successfulTwitches=0;twitchPrimed=false;pendingNervousnessMultiplier=1;disturbance=0;lastNibbleAt=0;fishHasLeft=false;
  fightPanel.classList.remove("active");if(tensionGrid){tensionGrid.classList.remove("active");}if(tensionFillLayer){tensionFillLayer.style.height="0%";tensionFillLayer.classList.remove("danger");}fightControls.style.display="none";normalControls.style.display="block";pullUpButton.style.display="none";drawLine();message.textContent="";hint.textContent="";renderCreel();renderGearInventory();updateDisplays();updateTimeControls();if(typeof updateDepthDisplay==="function")updateDepthDisplay();
}
function clearFishingTimers(){clearInterval(lineTimer);clearInterval(fightTimer);clearInterval(disturbanceTimer);clearTimeout(nibbleTimer);clearTimeout(biteTimer);clearTimeout(resetTimer);}
function randomNumber(min,max){return Math.floor(Math.random()*(max-min+1))+min;}
function randomDecimal(min,max){return Math.random()*(max-min)+min;}
function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
