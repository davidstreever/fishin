// Fishin' — isolated, repeatable testing sessions.
const TEST_RESULTS_KEY="fishinTestResults";
let testingSnapshot=null;
let testingEncounter=null;
let testingPendingControlMethod=null;
function cloneTestingData(value){return JSON.parse(JSON.stringify(value));}
function getTestingDeviceInfo(){
  const nav=typeof navigator==="undefined"?{}:navigator;
  const ua=nav.userAgent||"";
  const mobile=typeof nav.userAgentData?.mobile==="boolean"?nav.userAgentData.mobile:
    ua?(/Android|iPhone|iPad|iPod|Mobile/i.test(ua)||(/Macintosh/i.test(ua)&&(nav.maxTouchPoints||0)>1)):null;
  return {mobile,touchCapable:(nav.maxTouchPoints||0)>0,viewportWidth:typeof innerWidth==="number"?innerWidth:null,viewportHeight:typeof innerHeight==="number"?innerHeight:null};
}
function trackTestingControlMethod(method){
  if(!debugTestingMode || !["touch","mouse","pen","keyboard"].includes(method))return;
  if(testingEncounter && !testingEncounter.logged){
    if(!testingEncounter.inputMethods.includes(method))testingEncounter.inputMethods.push(method);
  }else testingPendingControlMethod=method;
}
function formatTestingLogEntry(entry){
  return "["+entry.season+" "+entry.day+" / "+entry.time+"]\n"+entry.text;
}
function renderTestLogTools(){
  const hasTests=gameLogEntries.some(e=>e.type==="test");
  testLogTools.hidden=!debugTestingMode && !hasTests;
  copyLatestTestButton.disabled=copyAllTestsButton.disabled=!hasTests;
}
function selectTestCopyText(){
  testCopyText.focus({preventScroll:true});
  testCopyText.select();
  testCopyText.setSelectionRange(0,testCopyText.value.length);
}
async function copyTestingLogEntries(entries){
  if(!entries.length){testCopyStatus.textContent="No test results yet.";return;}
  // Copy the saved text verbatim, including FULL RESULT, rather than rendered buttons.
  const text=entries.map(formatTestingLogEntry).join("\n\n");
  try{
    if(!navigator.clipboard?.writeText)throw new Error("Clipboard unavailable");
    await navigator.clipboard.writeText(text);
    testCopyStatus.textContent=entries.length===1?"Copied test.":"Copied "+entries.length+" tests.";
  }catch(error){
    testCopyText.value=text;
    if(!testCopyDialog.open)testCopyDialog.showModal();
    selectTestCopyText();
    testCopyStatus.textContent="Text ready to copy manually.";
  }
}
function setTestingMode(enabled){
  if(enabled===debugTestingMode)return;
  if(enabled && !["ready","finished"].includes(state)){
    debugTestingToggle.checked=false;
    message.textContent="Finish the current encounter before entering Testing Mode.";
    return;
  }
  testingPendingControlMethod=null;
  if(enabled){
    saveGame();
    testingSnapshot=cloneTestingData({world,player,logs:gameLogEntries,logIdCounter,catchIdCounter,debugSpecifyFish,debugFishStats,debugForcedFishId});
    resetFishing();
    debugTestingMode=true;debugSpecifyFish=true;debugFishStats=true;
    world.location="testing_zone";
    player.gear.ownedRods=Object.keys(rods);player.gear.ownedReels=Object.keys(reels);player.gear.ownedTackle=Object.keys(tackleItems);
    Object.keys(player.gear.bait).forEach(id=>player.gear.bait[id]=999);
    player.inventory=[];
    // Previous test results survive reloads without touching normal saves.
    gameLogEntries.length=0;
    try{const logs=JSON.parse(localStorage.getItem(TEST_RESULTS_KEY)||"[]");if(Array.isArray(logs))gameLogEntries.push(...logs);}catch(error){console.warn("Could not load test results",error);}
    logIdCounter=Math.max(0,...gameLogEntries.map(e=>e.id||0));
  }else{
    recordTestingResult("aborted","Testing Mode turned off.");
    resetFishing();
    debugTestingMode=false;
    Object.keys(world).forEach(key=>delete world[key]);Object.assign(world,testingSnapshot.world);
    Object.keys(player).forEach(key=>delete player[key]);Object.assign(player,testingSnapshot.player);
    gameLogEntries.length=0;gameLogEntries.push(...testingSnapshot.logs);
    logIdCounter=testingSnapshot.logIdCounter;catchIdCounter=testingSnapshot.catchIdCounter;
    debugSpecifyFish=testingSnapshot.debugSpecifyFish;debugFishStats=testingSnapshot.debugFishStats;debugForcedFishId=testingSnapshot.debugForcedFishId;
    testingSnapshot=null;testingEncounter=null;
  }
  debugTestingToggle.checked=enabled;
  debugSpecifyFishToggle.checked=debugSpecifyFish;debugSpecifyFishToggle.disabled=enabled;
  debugFishStatsToggle.checked=debugFishStats;
  pierPanel.style.display="block";topNav.style.display="flex";
  for(const panel of [marketPanel,shopPanel,journalPanel,pubPanel,newspaperPanel])panel.style.display="none";
  refreshLocationUI();updateDisplays();updateInventoryDisplay();renderGearInventory();renderGameLog();updateTimeControls();startEnvironmentAnimations();
  message.textContent=enabled?"Testing Mode: select a fish and weight class. Gear is available; unlocked techniques are preserved.":"Returned to your playthrough. Test results are kept separately.";
  if(!enabled)saveGame();
}
function beginTestingEncounter(){
  if(!debugTestingMode || !currentFish)return;
  testingEncounter={fish:cloneTestingData(currentFish),weight:currentWeight,weightClass:debugWeightClass,gear:{rod:cloneTestingData(getEquippedRod()),reel:cloneTestingData(getEquippedReel()),tackle:activeTackleId(),bait:player.selectedBait},skills:[...(player.meta.learnedTechniques||[])],books:[...player.books],device:getTestingDeviceInfo(),inputMethods:testingPendingControlMethod?[testingPendingControlMethod]:[],depth:currentDepth,season:world.season,weather:cloneTestingData(world.weather),time:getTimeLabel(),hooked:false,reelSeconds:0,pressureSeconds:0,idleSeconds:0,logged:false};
  testingPendingControlMethod=null;
}
function trackTestingInput(dt){
  if(!debugTestingMode || !testingEncounter || testingEncounter.logged)return;
  testingEncounter[isReeling?"reelSeconds":isHoldingPressure?"pressureSeconds":"idleSeconds"]+=dt;
}
function formatFightAbilityUses(counts){
  return Object.entries(counts).map(([id,count])=>(specialAbilities[id]?.name||id)+(count>1?" ×"+count:"")).join(", ")||"None";
}
function recordTestingResult(outcome,reason){
  if(!debugTestingMode || !testingEncounter || testingEncounter.logged)return;
  testingEncounter.logged=true;
  const attempt=testingEncounter;
  const result={...cloneTestingData(attempt),outcome,reason,recordedAt:new Date().toISOString(),nibbles:nibbleCount,successfulTwitches,fight:attempt.hooked?{seconds:fightElapsed,stamina:fishStamina,maxStamina:maxFishStamina,staminaPercent:maxFishStamina?fishStamina/maxFishStamina*100:0,distance:fishDistance,maxDistance:maxFightDistance,tension,baselineTension,effort:fightEffort,state:getFightState(),model:"steady_resistance_55",steadySeconds:fightSteadySeconds,restSeconds:fightRestSeconds,abilitiesUsed:{lastGasp:lastGaspUsed,quickRecovery:quickRecoveryUsed,feint:(fightAbilityUseCounts.feint||0)>0,quickReaction:(fightAbilityUseCounts.quick_reaction||0)>0},abilityUseCounts:cloneTestingData(fightAbilityUseCounts),lastFightCheck:debugLastFightCheck,special:debugLastContinueCheck}:null};
  const f=result.fight;
  const lines=["TEST — "+outcome.toUpperCase()+": "+reason,attempt.fish.name+" ("+attempt.fish.id+") — "+attempt.weight.toFixed(2)+" lb"+(attempt.weight>=attempt.fish.trophyWeight?" TROPHY":""),"GEAR — "+attempt.gear.rod.name+" / "+attempt.gear.reel.name+" / "+attempt.gear.tackle+" / "+attempt.gear.bait,"SKILLS — "+(attempt.skills.join(", ")||"None"),"NIBBLES — "+nibbleCount+"; SUCCESSFUL TWITCHES — "+successfulTwitches];
  lines.splice(4,0,"DEVICE — "+(attempt.device.mobile===null?"Unknown":attempt.device.mobile?"Mobile":"Desktop")+(attempt.device.viewportWidth?" ("+attempt.device.viewportWidth+" × "+attempt.device.viewportHeight+")":""),"CONTROLS — "+(attempt.inputMethods.join(", ")||"Unknown (no input recorded)"));
  if(f)lines.push("FIGHT TIME — "+f.seconds.toFixed(1)+"s","STAMINA — "+f.stamina.toFixed(1)+" / "+f.maxStamina.toFixed(1)+" ("+f.staminaPercent.toFixed(1)+"%)","STATE — "+f.state+"; EFFORT — "+(f.effort*100).toFixed(0)+"%","TENSION — "+f.tension.toFixed(1)+"%; BASELINE — "+f.baselineTension.toFixed(1)+"%","DISTANCE — "+f.distance.toFixed(2)+" / "+f.maxDistance.toFixed(2),"INPUT TIME — reel "+attempt.reelSeconds.toFixed(1)+"s / pressure "+attempt.pressureSeconds.toFixed(1)+"s / idle "+attempt.idleSeconds.toFixed(1)+"s","QUIET TIME — resistance "+f.steadySeconds.toFixed(1)+"s / rest "+f.restSeconds.toFixed(1)+"s","LAST FIGHT CHECK — "+f.lastFightCheck,"SPECIAL — "+f.special,"ABILITIES USED — "+formatFightAbilityUses(f.abilityUseCounts));
  else lines.push("FIGHT — not hooked");
  lines.push("FULL RESULT — "+JSON.stringify(result));
  addLog("test",lines.join("\n"),result);
  try{localStorage.setItem(TEST_RESULTS_KEY,JSON.stringify(gameLogEntries.filter(e=>e.type==="test")));}
  catch(error){console.warn("Test results could not be saved",error);addLog("world","Test log storage is full. New results remain in this session only.");}
}
