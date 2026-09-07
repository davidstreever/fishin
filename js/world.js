// Fishin' — world.js

function getWeekday(){ return WEEKDAYS[((world.weekdayIndex||0)%7+7)%7]; }
function isWeekend(){ return [5,6].includes(((world.weekdayIndex||0)%7+7)%7); }
function getPeriodLimit(){
  if(world.period==="Morning") return 4;
  if(world.period==="Day") return 7;
  if(world.period==="Evening") return 4;
  if(world.period==="Night") return NIGHT_UNITS;
  return 4;
}

function getTimeLabel(){
  const u=world.timeUnits;
  if(world.period==="Morning"){ if(u===0)return "Dawn"; if(u<=2)return "Early Morning"; return "Mid Morning"; }
  if(world.period==="Day"){ if(u===0)return "Mid Morning"; if(u<=2)return "Late Morning"; if(u===3)return "Noon"; if(u<=5)return "Early Afternoon"; return "Late Afternoon"; }
  if(world.period==="Evening"){ if(u===0)return "Late Afternoon"; if(u<=2)return "Early Evening"; return "Twilight"; }
  if(world.period==="Night"){ if(u===0)return "Twilight"; if(u<=2)return "Sunset"; if(u===3)return "Midnight"; if(u<=5)return "Deep Night"; return "Dawn"; }
  return world.period;
}

function getCalendarLabel(){
  return world.season+", Day "+world.seasonDay+", Year "+world.year+" — "+getWeekday()+" — "+getTimeLabel();
}

function isWorkDue(){ return player.job.employed && !isWeekend() && world.period==="Morning" && world.timeUnits>=getPeriodLimit(); }
function isSleepChoice(){ return world.period==="Night" && !world.nightFishing; }
function canNightFish(){ return !player.job.employed || (isWeekend() && player.meta.obsession>=10); }
function canQuitJob(){ return player.job.employed && player.meta.obsession>=35 && (world.seasonsCompleted>=2 || player.meta.hasAmulet); }
function hasSleepDebt(){ return player.condition.nightsSkipped>0 || player.condition.fatigue>=2; }
function isNightComplete(){ return world.period==="Night" && world.nightFishing && world.timeUnits>=getPeriodLimit(); }

function advanceFishingTime(){
  world.timeUnits++;

  if(world.period==="Night" && world.nightFishing){
    player.condition.fatigue += 0.5;

    if(world.timeUnits>=getPeriodLimit()){
      finishAllNighter();
      return;
    }
  } else if(world.timeUnits>=getPeriodLimit()){
    world.timeUnits=getPeriodLimit();
    reachEndOfPeriod();
  }

  updateDisplays();
  updateTimeControls();
  if(typeof renderSky==="function") renderSky();
  saveGame();
}

function finishAllNighter(){
  addLog("world","You fish through the night until dawn.");

  world.nightFishing=false;
  world.period="Morning";
  world.timeUnits=0;

  advanceDay();

  message.textContent="Dawn breaks over the water.";

  updateDisplays();
  updateTimeControls();
  startEnvironmentAnimations();
  saveGame();
}

function reachEndOfPeriod(){
  if(world.period==="Morning"){
    if(isWeekend() || !player.job.employed){
      world.period="Day"; world.timeUnits=0; applyWeatherForCurrentPeriod(); message.textContent="The day opens up.";
    } else {
      message.textContent="Time to head to work.";
    }
    return;
  }
  if(world.period==="Day"){
    world.period="Evening"; world.timeUnits=0; applyWeatherForCurrentPeriod(); message.textContent="Evening settles in."; return;
  }
  if(world.period==="Evening"){
    world.period="Night"; world.timeUnits=0; world.nightFishing=false; applyWeatherForCurrentPeriod(); message.textContent="The day is done."; startEnvironmentAnimations(); return;
  }
}

function consumePeriodForTravel(){
  if(world.period==="Night") return;
  world.timeUnits=getPeriodLimit();
  reachEndOfPeriod();
  updateDisplays();
}

function randomChoice(items){ return items[Math.floor(Math.random()*items.length)]; }
function getWorkMessage(){
  const o=player.meta.obsession;
  if(o>=30) return randomChoice(["Your boss asked you if you're happy here today. Are you?","You don't need to come here. Do you?","You suddenly realize an hour has gone by without you noticing. You can't stop thinking about the fish you haven't caught yet."]);
  if(o>=25) return randomChoice(["It's getting harder and harder to spend your day at work, knowing the fish are biting.","You notice something today. No one asks you about fishing anymore, and they go quiet when you bring it up.","You watch the clock all afternoon instead of finishing your work. Hopefully no one notices."]);
  if(o>=20) return randomChoice(["After lunch, you just daydream about the water.","You find yourself randomly talking about fishing with coworkers.","Your boss asks you if you do anything besides fishing."]);
  if(o>=10) return randomChoice(["You spend your day wondering what might be biting tonight.","Thoughts of fishing motivate you and you get your work done fast today. Too bad you can't leave early.","Work is fine today, but it's not fishing."]);
  return randomChoice(["Another boring day at work.","You've had better days at work. You've had worse ones, too. You get through it.","Not too busy at work today."]);
}
function goToWork(){
  // Never allow Work to interrupt a cast that was legal when it began.
  // The boundary remains pending until the encounter reaches ready/finished.
  if(!isWorkDue() || !["ready","finished"].includes(state)) return;
  addLog("world","You head to work.");
  const workMessage=getWorkMessage();
  addLog("world",workMessage);
  world.period="Evening"; world.timeUnits=0;
  applyWeatherForCurrentPeriod();
  resetFishing();
  message.textContent=workMessage;
  updateDisplays(); updateTimeControls(); startEnvironmentAnimations(); saveGame();
}

function quitJob(){
  if(!canQuitJob()) return;
  player.job.employed=false;
  addLog("world","You quit your job.");
  message.textContent="You quit your job. Afternoon is yours.";
  world.period="Day";
  world.timeUnits=0;
  applyWeatherForCurrentPeriod();
  resetFishing();
  message.textContent="You quit your job. Afternoon is yours.";
  updateDisplays(); updateTimeControls(); saveGame();
}

function keepFishingAtNight(){
  if(!canNightFish() || world.period!=="Night" || world.nightFishing) return;
  world.nightFishing=true;
  player.condition.nightsSkipped += 1;
  player.condition.fatigue += 2;
  gainObsession(1.5,"staying up all night to fish");
  addLog("world","You decide to keep fishing.");
  message.textContent="The night stretches ahead.";
  resetFishing(); updateDisplays(); startEnvironmentAnimations(); saveGame();
}

function goToSleep(){
  if(world.period!=="Night") return;
  addLog("world","You head home and sleep.");
  let dreamed=false;
  if(player.meta.obsession>=20){
    dreamed=true;
    addLog("world","You dream about fishing.");
  }
  const recovery=world.nightFishing?3:5;
  player.condition.fatigue=Math.max(0,player.condition.fatigue-recovery);
  player.condition.nightsSkipped=Math.max(0,player.condition.nightsSkipped-(world.nightFishing?0.5:1));
  world.nightFishing=false;
  world.period="Morning"; world.timeUnits=0;
  advanceDay();
  resetFishing();
  if(dreamed) message.textContent="You dreamed about fishing.";
  updateDisplays(); startEnvironmentAnimations(); saveGame();
}

function catchUpSleep(){
  if(world.period==="Night" || !hasSleepDebt() || !["Morning","Day"].includes(world.period)) return;
  addLog("world","You catch up on some sleep.");
  player.condition.fatigue=Math.max(0,player.condition.fatigue-2);
  player.condition.nightsSkipped=Math.max(0,player.condition.nightsSkipped-0.5);
  world.timeUnits=getPeriodLimit();
  reachEndOfPeriod();
  resetFishing();
  message.textContent="You get some much-needed sleep.";
  updateDisplays(); updateTimeControls(); saveGame();
}

function advanceDay(){
  player.pub.drinksToday=0;
  player.pub.pubLockedDay=null;
  if(player.pub.oldTimerAffinity===-2) player.pub.oldTimerAffinity=-1;
  world.weekdayIndex=((world.weekdayIndex||0)+1)%7;
  archiveCurrentNewspaperIssue();
  world.seasonDay++;
  if(world.seasonDay>DAYS_PER_SEASON){ world.seasonDay=1; advanceSeason(); activateNextSeasonWeather(); deliverSubscribedNewspaper(); }
  else applyWeatherForCurrentPeriod();
  addLog("world",world.season+", Day "+world.seasonDay+", Year "+world.year+" — "+getWeekday()+" begins.");
  addLog("world",describeWeather());
}

function advanceSeason(){
  world.seasonsCompleted += 1;
  const previousSeasonIndex=world.seasonIndex;
  world.seasonIndex=(world.seasonIndex+1)%seasons.length;
  if(previousSeasonIndex===seasons.length-1 && world.seasonIndex===0) world.year++;
  world.season=seasons[world.seasonIndex];
  addLog("world",world.season+", Year "+world.year+" begins.");
}



function goToFishingLocation(locationId){
  if(state!=="ready" && state!=="finished") return;
  const loc=locations[locationId];
  if(!loc) return;
  if(world.location===locationId) return;

  if(!debugInstantTravel){
    if(!world.unlockedLocations.includes(locationId)) return;
    if(locationId==="dads_island"&&!world.storyFlags?.islandUnlocked){ message.textContent="You haven't found this place yet."; hint.textContent=""; return; }
    const atSea=["coastal_waters","dads_island"].includes(world.location);
    const goingToSea=["coastal_waters","dads_island"].includes(locationId);
    if(goingToSea&&world.location!=="old_pier"){ message.textContent="You have to leave from the Old Pier."; hint.textContent=""; return; }
    if(atSea&&locationId!=="old_pier"){ message.textContent="You have to return to the Old Pier first."; hint.textContent=""; return; }
    if(loc.requiresTruck && !player.gear.vehicleRepaired){ message.textContent="Fix your truck first."; hint.textContent=""; return; }
    if(loc.requiresBoat && !player.gear.boatReady){ message.textContent="You need a boat."; hint.textContent=""; return; }
  }

  addLog("world",(debugInstantTravel?"DEBUG: Travel to ":loc.requiresBoat?"You take the boat to ":"You drive to ")+loc.name+".");
  world.location=locationId;
  if(!debugInstantTravel && world.period!=="Night") consumePeriodForTravel();
  resetFishing(); refreshLocationUI(); updateDisplays(); startEnvironmentAnimations(); saveGame();
}

function goToLocation(location){
  if(state!=="ready" && state!=="finished") return;
  if(isWorkDue() || world.period==="Night") return;
  clearFishingTimers(); stopEnvironmentAnimations();
  const destinationName=location==="market"?"Fish Market":"Tackle Shop";
  const periodName=world.period==="Morning"?"morning":world.period==="Day"?"day":"evening";
  addLog("world","You spend the rest of the "+periodName+" at the "+destinationName+".");
  consumePeriodForTravel();
  world.screen=location;
  // Do not carry the previous sale confirmation into a new Market visit.
  if(location==="market") marketMessage.textContent="";
  pierPanel.style.display="none";
  journalPanel.style.display="none";
  marketPanel.style.display=location==="market"?"block":"none";
  shopPanel.style.display=location==="shop"?"block":"none";
  topNav.style.display="none";
  locationTitle.textContent=location==="market"?"Fishin': The Market":"Fishin': The Tackle Shop";
  updateDisplays(); updateInventoryDisplay(); renderGearInventory(); renderShopInventory(); saveGame();
}

function returnToFishing(){
  world.screen="fishing";
  marketPanel.style.display="none"; shopPanel.style.display="none"; journalPanel.style.display="none"; if(typeof pubPanel!=="undefined"&&pubPanel)pubPanel.style.display="none"; if(typeof newspaperPanel!=="undefined"&&newspaperPanel)newspaperPanel.style.display="none"; pierPanel.style.display="block"; topNav.style.display="flex";
  refreshLocationUI(); resetFishing(); updateDisplays(); updateInventoryDisplay(); renderGearInventory(); startEnvironmentAnimations(); saveGame();
}
