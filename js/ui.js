// Fishin' — ui.js

const locationTitle=document.getElementById("locationTitle"),topNav=document.getElementById("topNav"),locationTabs=document.getElementById("locationTabs"),locationDescription=document.getElementById("locationDescription"),depthControls=document.getElementById("depthControls");
const pierPanel=document.getElementById("pierPanel"),marketPanel=document.getElementById("marketPanel"),shopPanel=document.getElementById("shopPanel"),journalPanel=document.getElementById("journalPanel"),pubPanel=document.getElementById("pubPanel"),newspaperPanel=document.getElementById("newspaperPanel");
const seasonDisplay=document.getElementById("seasonDisplay"),dayDisplay=document.getElementById("dayDisplay"),weekdayDisplay=document.getElementById("weekdayDisplay"),yearDisplay=document.getElementById("yearDisplay"),timeDisplay=document.getElementById("timeDisplay");
const introOverlay=document.getElementById("introOverlay"),introText=document.getElementById("introText"),introChoices=document.getElementById("introChoices");
const marketCalendarDisplay=document.getElementById("marketCalendarDisplay"),shopCalendarDisplay=document.getElementById("shopCalendarDisplay");
const moneyDisplay=document.getElementById("moneyDisplay"),marketMoneyDisplay=document.getElementById("marketMoneyDisplay"),shopMoneyDisplay=document.getElementById("shopMoneyDisplay");
const rodGearSelect=document.getElementById("rodGearSelect"),reelGearSelect=document.getElementById("reelGearSelect"),tackleGearSelect=document.getElementById("tackleGearSelect"),baitGearSelect=document.getElementById("baitGearSelect"),baitAmountDisplay=document.getElementById("baitAmountDisplay"),specialGearRow=document.getElementById("specialGearRow"),specialGearSelect=document.getElementById("specialGearSelect"),temperatureDisplay=document.getElementById("temperatureDisplay");
const sky=document.getElementById("sky"),water=document.getElementById("water"),lineStage=document.getElementById("lineStage"),tensionGrid=document.getElementById("tensionGrid"),tensionFillLayer=document.getElementById("tensionFillLayer"),line=document.getElementById("line"),message=document.getElementById("message"),hint=document.getElementById("hint");
const fightPanel=document.getElementById("fightPanel");
const normalControls=document.getElementById("normalControls"),fightControls=document.getElementById("fightControls"),fishButton=document.getElementById("fishButton"),pullUpButton=document.getElementById("pullUpButton"),sleepButton=document.getElementById("sleepButton"),quitJobButton=document.getElementById("quitJobButton"),journalButton=document.getElementById("journalButton"),journalReturnButton=document.getElementById("journalReturnButton"),fightReelButton=document.getElementById("fightReelButton"),fightPressureButton=document.getElementById("fightPressureButton"),cutLineButton=document.getElementById("cutLineButton");
const marketButton=document.getElementById("marketButton"),shopButton=document.getElementById("shopButton"),marketReturnButton=document.getElementById("marketReturnButton"),shopReturnButton=document.getElementById("shopReturnButton"),pubButton=document.getElementById("pubButton"),pubReturnButton=document.getElementById("pubReturnButton"),pubTalkButton=document.getElementById("pubTalkButton"),pubBartenderTalkButton=document.getElementById("pubBartenderTalkButton"),pubTalkActions=document.getElementById("pubTalkActions"),pubBartenderActions=document.getElementById("pubBartenderActions"),pubCharacters=document.getElementById("pubCharacters"),pubExitActions=document.getElementById("pubExitActions"),pubLeaveButton=document.getElementById("pubLeaveButton"),pubMessage=document.getElementById("pubMessage"),pubCalendarDisplay=document.getElementById("pubCalendarDisplay"),pubMoneyDisplay=document.getElementById("pubMoneyDisplay");
const marketMessage=document.getElementById("marketMessage"),shopMessage=document.getElementById("shopMessage"),marketInventory=document.getElementById("marketInventory"),sellAllButton=document.getElementById("sellAllButton"),shopInventory=document.getElementById("shopInventory");
const gearInventory=document.getElementById("gearInventory"),creel=document.getElementById("creel"),gameLog=document.getElementById("gameLog"),journalSpecies=document.getElementById("journalSpecies"),journalEntry=document.getElementById("journalEntry"),journalWaterTabs=document.getElementById("journalWaterTabs"),inventoryCountDisplay=document.getElementById("inventoryCount"),inventoryLimitDisplay=document.getElementById("inventoryLimit"),totalWeightDisplay=document.getElementById("totalWeight"),totalValueDisplay=document.getElementById("totalValue");
const debugResetButton=document.getElementById("debugResetButton"),debugAddBaitButton=document.getElementById("debugAddBaitButton"),debugAddMoneyButton=document.getElementById("debugAddMoneyButton"),debugTravelToggle=document.getElementById("debugTravelToggle"),debugFightMetersToggle=document.getElementById("debugFightMetersToggle"),debugFishStatsToggle=document.getElementById("debugFishStatsToggle"),debugSpecifyFishToggle=document.getElementById("debugSpecifyFishToggle"),debugWeatherSelect=document.getElementById("debugWeatherSelect"),debugWaterSelect=document.getElementById("debugWaterSelect"),debugMoonSelect=document.getElementById("debugMoonSelect"),debugSeasonSelect=document.getElementById("debugSeasonSelect");
const newspaperFishingLink=document.getElementById("newspaperFishingLink"),newspaperReadButton=document.getElementById("newspaperReadButton"),newspaperReturnButton=document.getElementById("newspaperReturnButton"),newspaperEditionLabel=document.getElementById("newspaperEditionLabel"),forecastReadButton=document.getElementById("forecastReadButton"),oldIssuesReadButton=document.getElementById("oldIssuesReadButton"),newspaperContent=document.getElementById("newspaperContent");
const debugFishPanel=document.getElementById("debugFishPanel"),debugFishLocation=document.getElementById("debugFishLocation"),debugFishList=document.getElementById("debugFishList"),debugWeightSlider=document.getElementById("debugWeightSlider"),debugWeightLabel=document.getElementById("debugWeightLabel"),debugForcedSummary=document.getElementById("debugForcedSummary");


const DEBUG_WEIGHT_LABELS=["Small","Below Average","Average","Large","Very Large","Trophy Range"];
function getDebugLocationFish(){
  const base=locationFishWeights[world.location]||{};
  return fishTypes.filter(f=>(base[f.id]||0)>0);
}
function ensureDebugFishSelection(){
  const possible=getDebugLocationFish();
  if(!possible.some(f=>f.id===debugForcedFishId))debugForcedFishId=possible[0]?.id||null;
  return possible;
}
function renderDebugFishSelector(){
  if(!debugFishPanel)return;
  debugFishPanel.style.display=debugSpecifyFish?"block":"none";
  if(!debugSpecifyFish)return;
  const possible=ensureDebugFishSelection();
  debugFishLocation.textContent=(locations[world.location]?.name||world.location)+" — location roster";
  debugFishList.innerHTML="";
  for(const fish of possible){
    const b=document.createElement("button");b.type="button";b.className="debugFishChoice"+(fish.id===debugForcedFishId?" active":"");
    const name=document.createElement("span");name.textContent=fish.name;
    const rarity=document.createElement("span");rarity.className="debugFishRarity";rarity.textContent=(fish.rarity||"common").replace(/_/g," ");
    b.append(name,rarity);b.addEventListener("click",()=>{debugForcedFishId=fish.id;renderDebugFishSelector();});debugFishList.appendChild(b);
  }
  debugWeightSlider.value=String(debugWeightClass);debugWeightLabel.textContent=DEBUG_WEIGHT_LABELS[debugWeightClass]||DEBUG_WEIGHT_LABELS[2];
  const selected=fishTypes.find(f=>f.id===debugForcedFishId);
  debugForcedSummary.textContent=selected?"Forcing: "+selected.name+" • "+debugWeightLabel.textContent+"\nNormal bite/fight rules remain active.":"No fish available here.";
}
function addLog(type,text){ logIdCounter++; gameLogEntries.push({id:logIdCounter,type,text,season:world.season,day:world.seasonDay,time:getTimeLabel()}); renderGameLog(); }
function renderGameLog(){ gameLog.innerHTML=""; for(const entry of [...gameLogEntries].reverse()){ const row=document.createElement("div");row.className="logEntry"+(entry.type==="world"?" logWorld":""); const t=document.createElement("span");t.className="logTime";t.textContent="["+entry.season+" "+entry.day+" / "+entry.time+"]"; const x=document.createElement("span");x.textContent=entry.text; row.append(t,x); gameLog.appendChild(row);} }


function updateDisplays(){
  seasonDisplay.textContent=world.season; dayDisplay.textContent=world.seasonDay; if(weekdayDisplay)weekdayDisplay.textContent=getWeekday(); yearDisplay.textContent=world.year||1; timeDisplay.textContent=getTimeLabel(); marketCalendarDisplay.textContent=getCalendarLabel(); shopCalendarDisplay.textContent=getCalendarLabel();
  moneyDisplay.textContent=player.money.toFixed(2); marketMoneyDisplay.textContent=player.money.toFixed(2); shopMoneyDisplay.textContent=player.money.toFixed(2); if(pubMoneyDisplay)pubMoneyDisplay.textContent=player.money.toFixed(2); if(pubCalendarDisplay)pubCalendarDisplay.textContent=getCalendarLabel();
  renderActiveGearControls(); if(temperatureDisplay){const w=world.weather||{};temperatureDisplay.textContent=(w.temperatureF??"—")+"° "+String(w.temperature||"MILD").toLowerCase().replace(/^./,c=>c.toUpperCase());}
  inventoryLimitDisplay.textContent=getInventoryLimit();
  updateDepthDisplay();
  updateNewspaperFishingLink();
}

function updateFishingControls(){
  const activeEncounter=!['ready','finished'].includes(state);
  if(activeEncounter){
    if(state==='waiting'||state==='nibble'){
      fishButton.disabled=!knowsTechnique('twitch'); fishButton.textContent=knowsTechnique('twitch')?'Twitch [J]':'Line Out';
      pullUpButton.style.display='inline-block'; pullUpButton.disabled=false; pullUpButton.textContent='Pull Up [L]'; return;
    }
    if(state==='bite'){
      fishButton.disabled=false; fishButton.textContent='HOOK [H]';
      pullUpButton.style.display='inline-block'; pullUpButton.disabled=false; pullUpButton.textContent='Pull Up [L]'; return;
    }
    if(state==='junk'){
      fishButton.disabled=false; fishButton.textContent='Pull Up';
      pullUpButton.style.display='none'; return;
    }
    fishButton.disabled=true; pullUpButton.style.display='none'; return;
  }
  pullUpButton.style.display='none';
  if(isWorkDue()){fishButton.disabled=false;fishButton.textContent='Go to Work [W]';return;}
  if(isSleepChoice()){
    if(canNightFish()){fishButton.disabled=false;fishButton.textContent='Keep Fishing';}
    else{fishButton.disabled=true;fishButton.textContent='Night';}
    return;
  }
  const baitCount=player.gear.bait[player.selectedBait];
  if(player.inventory.length>=getInventoryLimit()){fishButton.disabled=true;fishButton.textContent='Creel Full';}
  else if(baitCount<=0){fishButton.disabled=true;fishButton.textContent='No '+player.selectedBait+'s';}
  else{fishButton.disabled=false;fishButton.textContent='Cast Line [Space]';}
}

function updateTimeControls(){
  if(pubButton){pubButton.disabled=!pubAvailable() || (state!=="ready"&&state!=="finished");pubButton.title=pubAvailable()?"The Black Dog is open.":"The Black Dog opens in the evening.";}
  cutLineButton.textContent="Cut Line [K]"; fightReelButton.textContent=isReeling?"REELING... [↑]":"HOLD TO REEL [↑]"; if(!isHoldingPressure)fightPressureButton.textContent="HOLD PRESSURE [↓]";
  sleepButton.style.display="none"; quitJobButton.style.display="none";
  if(world.period==="Night"){sleepButton.style.display="inline-block";sleepButton.title="Go to sleep.";sleepButton.textContent="Sleep [S]";}
  else if(hasSleepDebt()&&["Morning","Day"].includes(world.period)){sleepButton.style.display="inline-block";sleepButton.title="Catch up on sleep debt. This uses the rest of the current period.";sleepButton.textContent="Sleep [S]";}
  const busy=state!=="ready"&&state!=="finished";
  sleepButton.disabled=busy;
  marketButton.disabled=busy||isWorkDue()||world.period==="Night";
  shopButton.disabled=busy||isWorkDue()||world.period==="Night";
  if(isWorkDue()&&canQuitJob()&&!busy)quitJobButton.style.display="inline-block";
  updateFishingControls();
}
function refreshLocationUI(){
  const loc=locations[world.location];locationTitle.textContent="Fishin': "+loc.name.replace(/^The /,"");locationDescription.textContent=loc.description;renderLocationTabs();updateDepthDisplay();renderDebugFishSelector();
}
function updateDepthDisplay(){
  if(!depthControls)return;const loc=locations[world.location];if(!loc){depthControls.innerHTML="";return;}
  depthControls.innerHTML='<span class="depthLabel">Depth:</span> ';
  const choices=["random",...DEPTHS];
  choices.forEach((depth,i)=>{
    const isRandom=depth==="random";
    const available=isRandom||loc.availableDepths.includes(depth);
    const unlocked=isRandom||canTargetDepth(depth);
    const b=document.createElement("button");b.className="depthText"+(depth===player.selectedDepth?" active":"");b.textContent=isRandom?"Random":DEPTH_LABELS[depth];
    b.disabled=!available||!unlocked||(state!=="ready"&&state!=="finished");
    if(!available)b.title="This depth is not available here.";
    else if(!unlocked)b.title=depth==="shallow"?"Buy a Surface Float to target shallow water.":depth==="mid"?"Buy a Split-Shot Kit to target mid water.":"Buy an Egg Sinker to target deep water.";
    else if(isRandom)b.title="Use your old tackle and let the cast find its own depth.";
    b.addEventListener("click",()=>selectDepth(depth));depthControls.appendChild(b);
    if(i<choices.length-1)depthControls.appendChild(document.createTextNode(" | "));
  });
}
function selectDepth(depth){
  const loc=locations[world.location];
  if(depth!=="random" && (!loc.availableDepths.includes(depth)||!canTargetDepth(depth)))return;
  player.selectedDepth=depth;updateDepthDisplay();renderGearInventory();saveGame();
}

function renderLocationTabs(){
  locationTabs.innerHTML="";
  for(const loc of Object.values(locations)){
    const b=document.createElement("button");b.className="locationTab"+(world.location===loc.id?" active":"");
    const atlasLocation=["lazy_brook","big_lake","coastal_waters"].includes(loc.id);const atlasKnown=!atlasLocation||hasBook("maine_fishing_atlas");
    b.textContent=atlasKnown?loc.name.replace(/^The /,""):"???";
    if(!debugInstantTravel){
      if(!atlasKnown){b.disabled=true;b.classList.add("locked");b.title="You don't know where this is yet.";}
      const unlocked=world.unlockedLocations.includes(loc.id);
      const storyLocked=!!loc.storyLocked;
      const truckLocked=loc.requiresTruck&&!player.gear.vehicleRepaired;
      const boatLocked=loc.requiresBoat&&!player.gear.boatReady;
      if(!unlocked){b.disabled=true;b.classList.add("locked");}
      else if(storyLocked){b.classList.add("locked");b.title="Not yet discovered.";}
      else if(truckLocked){b.classList.add("locked");b.title="Fix your truck first.";}
      else if(boatLocked){b.classList.add("locked");b.title="You need a boat.";}
    }else b.title="Debug instant travel.";
    b.addEventListener("click",()=>goToFishingLocation(loc.id));locationTabs.appendChild(b);
  }
}

function fillGearSelect(select,items,current,onChange){
  if(!select)return; select.innerHTML="";
  for(const item of items){const o=document.createElement("option");o.value=item.id;o.textContent=item.name;o.selected=item.id===current;select.appendChild(o);}
  select.onchange=()=>onChange(select.value);
}
function activeTackleId(){return player.selectedDepth==="random"?"bobber":tackleForDepth(player.selectedDepth);}
function renderActiveGearControls(){
  fillGearSelect(rodGearSelect,player.gear.ownedRods.map(id=>rods[id]).filter(Boolean),player.gear.rod,id=>equipGear("rod",id));
  fillGearSelect(reelGearSelect,player.gear.ownedReels.map(id=>reels[id]).filter(Boolean),player.gear.reel,id=>equipGear("reel",id));
  const tackleOptions=[{id:"bobber",name:"Bobber"},...player.gear.ownedTackle.map(id=>tackleItems[id]).filter(Boolean)];
  fillGearSelect(tackleGearSelect,tackleOptions,activeTackleId(),id=>selectTackle(id));
  const baitOptions=Object.keys(player.gear.bait).filter(name=>player.gear.bait[name]>0).map(name=>({id:name,name}));
  fillGearSelect(baitGearSelect,baitOptions,player.selectedBait,id=>selectBait(id));
  if(baitAmountDisplay)baitAmountDisplay.textContent="×"+(player.gear.bait[player.selectedBait]||0);
  const specials=Array.isArray(player.gear.ownedSpecialItems)?player.gear.ownedSpecialItems:[];
  if(specialGearRow)specialGearRow.style.display=specials.length?"grid":"none";
}
function selectTackle(id){
  if(id==="bobber"){player.selectedDepth="random";}
  else {const item=tackleItems[id];if(!item||!hasTackle(id))return;player.selectedDepth=item.id==="adjustable_dual_diver"?(locations[world.location]?.availableDepths?.[0]||"shallow"):item.targetDepth;}
  updateDisplays();renderGearInventory();updateTimeControls();saveGame();
}
function renderGearInventory(){
  gearInventory.innerHTML="";
  const summary=document.createElement("div");summary.className="gearPickerSummary";
  const addPicker=(label,items,current,change)=>{const row=document.createElement("div"),lab=document.createElement("span"),sel=document.createElement("select");lab.textContent=label;for(const item of items){const o=document.createElement("option");o.value=item.id;o.textContent=item.name;o.selected=item.id===current;sel.appendChild(o);}sel.addEventListener("change",()=>change(sel.value));row.append(lab,sel);summary.appendChild(row);};
  addPicker("Rod",player.gear.ownedRods.map(id=>rods[id]).filter(Boolean),player.gear.rod,id=>equipGear("rod",id));
  addPicker("Reel",player.gear.ownedReels.map(id=>reels[id]).filter(Boolean),player.gear.reel,id=>equipGear("reel",id));
  addPicker("Tackle",[{id:"bobber",name:"Bobber"},...player.gear.ownedTackle.map(id=>tackleItems[id]).filter(Boolean)],activeTackleId(),id=>selectTackle(id));
  addPicker("Bait",Object.keys(player.gear.bait).filter(name=>player.gear.bait[name]>0).map(name=>({id:name,name:name+" ×"+player.gear.bait[name]})),player.selectedBait,id=>selectBait(id));
  gearInventory.appendChild(summary);
  const paperRow=document.createElement("div");paperRow.className="inventoryEntry persistentGearRow";
  const paperName=document.createElement("span");paperName.textContent="Newspaper";const paperDesc=document.createElement("span");paperDesc.innerHTML='Forecasts, local news, ads<div class="repairNote">'+getNewspaperGearState()+"</div>";const paperAction=document.createElement("span");
  if(!player.newspaper.subscribed && player.meta.newspaperUnlocked){const sub=document.createElement("button");sub.className="textLink";sub.textContent="[Subscribe $8]";sub.title="You won't have to buy next season's paper at the shop.";sub.disabled=player.money<8;sub.addEventListener("click",subscribeNewspaper);paperAction.appendChild(sub);}
  paperRow.append(paperName,paperDesc,paperAction);gearInventory.appendChild(paperRow);
  const vehicle=vehicles[player.gear.vehicle]||vehicles.old_truck;const truckRow=document.createElement("div");truckRow.className="inventoryEntry persistentGearRow";const truckName=document.createElement("span");truckName.textContent=player.gear.vehicleRepaired?"Old Truck":"Broken Old Truck";const truckDesc=document.createElement("span");truckDesc.textContent=player.gear.vehicleRepaired?"Rusty, loud, and mostly running":"Rusty, loud and currently going nowhere";const truckAction=document.createElement("span");if(!player.gear.vehicleRepaired){const repair=document.createElement("button");repair.className="smallButton";repair.textContent="Repair $"+vehicle.repairCost;repair.disabled=player.money<vehicle.repairCost;repair.addEventListener("click",repairTruck);truckAction.appendChild(repair);}truckRow.append(truckName,truckDesc,truckAction);gearInventory.appendChild(truckRow);
  if(player.gear.boatReady){const boatRow=document.createElement("div");boatRow.className="inventoryEntry persistentGearRow";boatRow.innerHTML="<span>Old Boat</span><span>Kept at Old Pier.</span><span></span>";gearInventory.appendChild(boatRow);}
  if(player.gear.lockedBox){const boxRow=document.createElement("div");boxRow.className="inventoryEntry";boxRow.innerHTML="<span>Locked Box</span><span class='repairNote'>The lock won't budge.</span><span></span>";gearInventory.appendChild(boxRow);}
}
function repairTruck(){
  const vehicle=vehicles[player.gear.vehicle]||vehicles.old_truck;if(player.gear.vehicleRepaired||player.money<vehicle.repairCost)return;player.money-=vehicle.repairCost;player.gear.vehicleRepaired=true;gainObsession(1,"repairing the truck for fishing");addLog("buy","Repaired the Old Truck for $"+vehicle.repairCost.toFixed(2)+".");message.textContent="The Old Truck coughs, rattles, and finally starts.";updateDisplays();renderGearInventory();renderLocationTabs();renderShopInventory();saveGame();
}
function selectBait(name){ if(player.gear.bait[name]<=0)return;player.selectedBait=name;updateDisplays();renderGearInventory();updateTimeControls();saveGame(); }

function renderShopInventory(){
  shopInventory.innerHTML="";const box=document.createElement("div");box.className="shopBox";
  const baitTitle=document.createElement("div");baitTitle.className="shopSectionTitle";baitTitle.textContent="BAIT";box.appendChild(baitTitle);
  const baitPrices={Worm:2,Minnow:6,Insect:4,Grub:4,Shrimp:6,Squid:6,Crab:8,"Cut Bait":8};
  Object.entries(baitPrices).forEach(([name,baseCost])=>{
    const row=document.createElement("div");row.className="shopRow baitShopRow";
    const label=document.createElement("span");label.innerHTML=(name==="Cut Bait"?name:name+"s")+' <span class="shopHave">(Have: '+player.gear.bait[name]+')</span>';
    const choices=document.createElement("span");choices.className="baitQuantityChoices";
    const price=document.createElement("span");price.className="baitShopPrice";
    const buy=document.createElement("button");buy.className="smallButton";buy.textContent="Buy";
    let selectedAmount=5;
    const refresh=()=>{const cost=baseCost*(selectedAmount/5);price.textContent="$"+cost.toFixed(2);buy.disabled=player.money<cost;choices.querySelectorAll("button").forEach(b=>b.classList.toggle("active",Number(b.dataset.amount)===selectedAmount));};
    [5,10,20].forEach((amount,i)=>{if(i)choices.appendChild(document.createTextNode(" | "));const b=document.createElement("button");b.className="baitQuantityChoice";b.dataset.amount=amount;b.textContent="×"+amount;b.addEventListener("click",()=>{selectedAmount=amount;refresh();});choices.appendChild(b);});
    buy.addEventListener("click",()=>buyBait(name,selectedAmount,baseCost*(selectedAmount/5)));refresh();row.append(label,choices,price,buy);box.appendChild(row);
  });
  const tackleTitle=document.createElement("div");tackleTitle.className="shopSectionTitle";tackleTitle.textContent="TACKLE";box.appendChild(tackleTitle);Object.values(tackleItems).forEach(item=>box.appendChild(makeTackleShopRow(item)));
  const rodTitle=document.createElement("div");rodTitle.className="shopSectionTitle";rodTitle.textContent="RODS";box.appendChild(rodTitle);Object.values(rods).forEach(r=>box.appendChild(makeGearShopRow("rod",r)));
  const reelTitle=document.createElement("div");reelTitle.className="shopSectionTitle";reelTitle.textContent="REELS";box.appendChild(reelTitle);Object.values(reels).forEach(r=>box.appendChild(makeGearShopRow("reel",r)));
  renderNewspaperShopRows(box);
  if(player.gear.vehicleRepaired){const storageTitle=document.createElement("div");storageTitle.className="shopSectionTitle";storageTitle.textContent="CREELS";box.appendChild(storageTitle);const count=player.gear.truckCreels||0;const costs=[15,25,40,60];const row=document.createElement("div");row.className="shopRow";const label=document.createElement("span");label.innerHTML="Truck Creel <span class=\"shopHave\">(Have: "+count+" / 4)</span><div class=\"shopNote\">Adds room for 10 more fish in the truck.</div>";const price=document.createElement("span");price.textContent=count<4?"$"+costs[count].toFixed(2):"";const b=document.createElement("button");b.className="smallButton";b.textContent=count<4?"Buy":"Full";b.disabled=count>=4||player.money<costs[count];b.addEventListener("click",buyTruckCreel);row.append(label,price,b);box.appendChild(row);}
  const bookTitle=document.createElement("div");bookTitle.className="shopSectionTitle";bookTitle.textContent="BOOKS";box.appendChild(bookTitle);Object.values(books).forEach(book=>box.appendChild(makeBookShopRow(book)));
  shopInventory.appendChild(box);
}
function makeTackleShopRow(item){
  const row=document.createElement("div");row.className="shopRow";const label=document.createElement("span");label.innerHTML=item.name+'<div class="shopNote">'+item.note+"</div>";const price=document.createElement("span");price.textContent="$"+item.cost.toFixed(2);const b=document.createElement("button");b.className="smallButton";
  const owned=hasTackle(item.id);if(owned){b.textContent="Owned";b.disabled=true;}else{b.textContent="Buy";b.disabled=player.money<item.cost;b.addEventListener("click",()=>buyTackle(item.id));}row.append(label,price,b);return row;
}
function buyTackle(id){const item=tackleItems[id];if(!item||hasTackle(id)||player.money<item.cost)return;player.money-=item.cost;player.gear.ownedTackle.push(id);addLog("buy","Bought "+item.name+" for $"+item.cost.toFixed(2)+".");updateDisplays();renderGearInventory();renderShopInventory();updateDepthDisplay();saveGame();}
function makeGearShopRow(type,item){
  const row=document.createElement("div");row.className="shopRow";const label=document.createElement("span");label.innerHTML=item.name+'<div class="shopNote">'+item.note+"</div>";const price=document.createElement("span");price.textContent="$"+item.cost.toFixed(2);const b=document.createElement("button");b.className="smallButton";
  const owned=type==="rod"?player.gear.ownedRods.includes(item.id):player.gear.ownedReels.includes(item.id);const equipped=player.gear[type]===item.id;if(equipped){b.textContent="Equipped";b.disabled=true;}else if(owned){b.textContent="Equip";b.addEventListener("click",()=>equipGear(type,item.id));}else{b.textContent="Buy";b.disabled=player.money<item.cost;b.addEventListener("click",()=>buyGear(type,item.id));}row.append(label,price,b);return row;
}
function buyGear(type,id){const item=type==="rod"?rods[id]:reels[id];if(!item||player.money<item.cost)return;player.money-=item.cost;(type==="rod"?player.gear.ownedRods:player.gear.ownedReels).push(id);player.gear[type]=id;addLog("buy","Bought "+item.name+" for $"+item.cost.toFixed(2)+".");updateDisplays();renderGearInventory();renderShopInventory();saveGame();}
function equipGear(type,id){const list=type==="rod"?player.gear.ownedRods:player.gear.ownedReels;if(!list.includes(id))return;player.gear[type]=id;updateDisplays();renderGearInventory();renderShopInventory();saveGame();}

function buyTruckCreel(){const count=player.gear.truckCreels||0,costs=[15,25,40,60];if(!player.gear.vehicleRepaired||count>=4||player.money<costs[count])return;const cost=costs[count];player.money-=cost;player.gear.truckCreels=count+1;addLog("buy","Bought a truck creel for $"+cost.toFixed(2)+".");shopMessage.textContent="You strap another creel into the truck.";updateDisplays();updateInventoryDisplay();renderGearInventory();renderShopInventory();saveGame();}
function makeBookShopRow(book){
  const row=document.createElement("div");row.className="shopRow";const label=document.createElement("span");label.innerHTML=book.name+'<div class="shopNote">'+book.note+"</div>";const price=document.createElement("span");price.textContent="$"+book.cost.toFixed(2);const b=document.createElement("button");b.className="smallButton";
  if(player.books.includes(book.id)){b.textContent="Read";b.disabled=true;}else{b.textContent="Buy";b.disabled=player.money<book.cost;b.addEventListener("click",()=>buyBook(book.id));}
  row.append(label,price,b);return row;
}
function hasBook(id){return player.books.includes(id);}
function knowsTechnique(id){return (player.meta.learnedTechniques||[]).includes(id);}
function learnTechnique(id){if(!player.meta.learnedTechniques)player.meta.learnedTechniques=[];if(!player.meta.learnedTechniques.includes(id))player.meta.learnedTechniques.push(id);}
function applyBookKnowledge(id){
  if(id==="visual_guide_maine_fish") learnAllFishKnowledge(["name","waterType"]);
  if(id==="freshwater_practical") learnFishKnowledgeForWaterType("freshwater",["weight","trophyWeight","rarity","bait","seasons"]);
  if(id==="saltwater_practical") learnFishKnowledgeForWaterType("saltwater",["weight","trophyWeight","rarity","bait","seasons"]);
  if(id==="finding_freshwater"){ learnFishKnowledgeForWaterType("freshwater",["locations","depth","weather","time"]); player.pub.knowsArcticCharr=true; learnFishKnowledge("arctic_charr",["name","locations","depth"]); }
  if(id==="finding_saltwater") learnFishKnowledgeForWaterType("saltwater",["locations","depth","weather","time"]);
  if(id==="advanced_freshwater") learnFishKnowledgeForWaterType("freshwater",["behavior"]);
  if(id==="advanced_saltwater") learnFishKnowledgeForWaterType("saltwater",["behavior"]);
}
function buyBook(id){const book=books[id];if(!book||player.books.includes(id)||player.money<book.cost)return;player.money-=book.cost;player.books.push(id);applyBookKnowledge(id);if(id==="playing_the_fish")learnTechnique("hold_pressure");if(id==="advanced_freshwater"||id==="advanced_saltwater")learnTechnique("twitch");gainObsession(0.5,"buying fishing books");addLog("buy","Bought "+book.name+" for $"+book.cost.toFixed(2)+".");shopMessage.textContent="You add "+book.name+" to your shelf.";updateDisplays();renderShopInventory();renderLocationTabs();saveGame();}
function fishIsKnown(fish){return knowsFishKnowledge(fish.id,"name");}
function fishFactKnown(fish,field){return knowsFishKnowledge(fish.id,field);}
function buyBait(name,amount,cost){ if(player.money<cost){shopMessage.textContent="You don't have enough money.";return;}player.money-=cost;player.gear.bait[name]+=amount;addLog("buy","Bought "+amount+" "+name+"s for $"+cost.toFixed(2)+".");updateDisplays();renderGearInventory();renderShopInventory();saveGame(); }

function updateInventoryDisplay(){ const totalWeight=player.inventory.reduce((s,f)=>s+f.weight,0),totalValue=player.inventory.reduce((s,f)=>s+f.baseValue,0);inventoryCountDisplay.textContent=player.inventory.length;inventoryLimitDisplay.textContent=getInventoryLimit();totalWeightDisplay.textContent=totalWeight.toFixed(2);totalValueDisplay.textContent=totalValue.toFixed(2);renderCreel();renderMarketInventory(); }
function renderCreel(){ creel.innerHTML="";if(!player.inventory.length){creel.innerHTML='<div class="empty">Your creel is empty.</div>';return;}for(const fish of player.inventory){const row=document.createElement("div");row.className="inventoryEntry";const d=document.createElement("span");d.textContent=fish.name+" — "+fish.weight.toFixed(2)+" lb";const v=document.createElement("span");v.className="fishValue";v.textContent="$"+fish.baseValue.toFixed(2);const b=document.createElement("button");b.className="smallButton";b.textContent="Release";b.disabled=state!=="ready"&&state!=="finished";b.addEventListener("click",()=>releaseFish(fish.id));row.append(d,v,b);creel.appendChild(row);} }
function renderMarketInventory(){ marketInventory.innerHTML="";if(!player.inventory.length){marketInventory.innerHTML='<div class="inventoryBox"><div class="empty">Your creel is empty.</div></div>';sellAllButton.disabled=true;return;}sellAllButton.disabled=false;const box=document.createElement("div");box.className="inventoryBox";for(const fish of player.inventory){const row=document.createElement("div");row.className="inventoryEntry";const d=document.createElement("span");d.textContent=fish.name+" — "+fish.weight.toFixed(2)+" lb";const v=document.createElement("span");v.className="fishValue";v.textContent="$"+fish.baseValue.toFixed(2);const b=document.createElement("button");b.className="smallButton";b.textContent="Sell";b.addEventListener("click",()=>sellFish(fish.id));row.append(d,v,b);box.appendChild(row);}marketInventory.appendChild(box); }
function releaseFish(id){const fish=player.inventory.find(f=>f.id===id);if(!fish)return;fish.status="released";player.inventory=player.inventory.filter(f=>f.id!==id);addLog("catch","Released "+fish.name+" — "+fish.weight.toFixed(2)+" lb.");message.textContent="You release the "+fish.name+".";updateInventoryDisplay();updateTimeControls();saveGame();}
function sellFish(id){const fish=player.inventory.find(f=>f.id===id);if(!fish)return;player.money+=fish.baseValue;fish.status="sold";player.inventory=player.inventory.filter(f=>f.id!==id);addLog("sale","Sold "+fish.name+" for $"+fish.baseValue.toFixed(2)+".");marketMessage.textContent="Sold "+fish.name+" for $"+fish.baseValue.toFixed(2)+".";updateDisplays();updateInventoryDisplay();renderGearInventory();saveGame();}
function sellAllFish(){if(!player.inventory.length)return;let total=0;const count=player.inventory.length;for(const f of player.inventory){total+=f.baseValue;f.status="sold";}player.money+=total;player.inventory=[];addLog("sale","Sold "+count+" fish for $"+total.toFixed(2)+".");marketMessage.textContent="You sell your catch for $"+total.toFixed(2)+".";updateDisplays();updateInventoryDisplay();renderGearInventory();saveGame();}

function pubAvailable(){return ["Evening","Night"].includes(world.period) && player.pub.pubLockedDay!==world.season+":"+world.seasonDay;}
function finishPubAllNighter(){
  player.condition.nightsSkipped+=1; player.condition.fatigue+=2;
  addLog("world","You spend the whole night at The Black Dog.");
  world.period="Morning"; world.timeUnits=0; advanceDay(); player.pub.pubDawnExit=true;
  pubMessage.textContent="It's way past quitting time. You get off your stool and stumble out the door. The bartender glares at the bar and shakes his head.";
  showPubLeaveOnly(); updateDisplays(); saveGame();
}
function spendPubUnit(){
  if(world.period==="Night" && world.timeUnits+1>=getPeriodLimit()){
    world.timeUnits=getPeriodLimit(); finishPubAllNighter(); return false;
  }
  advanceFishingTime(); updateDisplays(); saveGame(); return true;
}
function resetPubMenus(){pubTalkActions.style.display="none";pubBartenderActions.style.display="none";pubExitActions.style.display="none";pubCharacters.style.display="block";}
function openPub(){
  if((state!=="ready"&&state!=="finished")||!pubAvailable())return;
  clearFishingTimers();stopEnvironmentAnimations();player.pub.pubVisits++;world.screen="pub";
  pierPanel.style.display="none";marketPanel.style.display="none";shopPanel.style.display="none";journalPanel.style.display="none";pubPanel.style.display="block";topNav.style.display="none";locationTitle.textContent="Fishin': The Black Dog";pubMessage.textContent="";resetPubMenus();
  if(!spendPubUnit())return;
  if(player.pub.unacknowledgedTrophy){player.pub.unacknowledgedTrophy=false;player.pub.oldTimerTrophyReactions++;player.pub.oldTimerFriendly=true;pubMessage.textContent='"Heard you caught a big one," says the old-timer. He\'s looking particularly friendly tonight. Maybe it\'s just the beer.';}
  updateDisplays();saveGame();
}
function closePub(){player.pub.pubDawnExit=false;returnToFishing();}
function setAffinity(n){player.pub.oldTimerAffinity=Math.max(-2,Math.min(2,n));}
function showPubLeaveOnly(){pubCharacters.style.display="none";pubTalkActions.style.display="none";pubBartenderActions.style.display="none";pubExitActions.style.display="block";}
function ejectFromPub(){player.pub.pubLockedDay=world.season+":"+world.seasonDay;pubMessage.textContent+='\n\nThe bartender shakes his head and points to the door.';showPubLeaveOnly();saveGame();}
function orderDrink(){if(player.money<3){pubMessage.textContent="You don't have enough money.";return;}player.money-=3;player.pub.drinksTotal++;player.pub.drinksToday++;if(!spendPubUnit())return;let text="The bartender puts a beer in front of you.\n\nYou drink your beer.";if(player.pub.oldTimerAffinity===-1){setAffinity(0);text+=" You notice the old timer is still ignoring you.";}else if(player.pub.oldTimerAffinity===0){setAffinity(1);text+=" The old man at the bar nods at you.";}pubMessage.textContent=text;updateDisplays();saveGame();}
function wouldAnnoyOldTimer(){
  if(player.pub.pubVisits>=3&&!player.pub.oldTimerWarningUsed){player.pub.oldTimerWarningUsed=true;player.pub.oldTimerFriendly=false;pubMessage.textContent="You catch yourself before you say it and annoy him.";saveGame();return true;}return false;
}
function buyOldTimerBeer(){if(player.money<3){pubMessage.textContent="You don't have enough money.";return;}player.money-=3;player.pub.oldTimerBeersBought++;if(!spendPubUnit())return;if(player.pub.oldTimerAffinity===-1){setAffinity(-2);player.pub.oldTimerFriendly=false;pubMessage.textContent='"Leave me alone."';ejectFromPub();return;}if(player.pub.oldTimerAffinity===0){setAffinity(1);pubMessage.textContent="He nods amiably.";}else if(player.pub.oldTimerAffinity===1){setAffinity(2);pubMessage.textContent='"Thanks."';}else pubMessage.textContent='"Thanks."';updateDisplays();saveGame();}
function revealOldTimerTip(){
  const waterTypes=player.gear.vehicleRepaired?["freshwater","saltwater"]:["freshwater"];
  if(!player.gear.vehicleRepaired&&Math.random()<0.2){pubMessage.textContent='"You should try saltwater fishing. Whole different thing."';return;}
  const candidates=[];for(const fish of fishTypes){if(!waterTypes.includes(fish.waterType)||fish.id==="arctic_charr"&&!player.pub.knowsArcticCharr)continue;for(const field of ["bait","weather","locations","depth","time","seasons"]){if(!knowsFishKnowledge(fish.id,field))candidates.push({fish,field});}}
  if(!candidates.length){pubMessage.textContent='"Fish change their minds. Keep your line wet."';return;}
  const {fish,field}=randomChoice(candidates);learnFishKnowledge(fish.id,["name",field]);let fact="";
  if(field==="bait"){const prefs=Object.entries(fish.baitPreferences||{}).filter(x=>x[1]>1).sort((a,b)=>b[1]-a[1]);fact=(prefs[0]?.[0]||"the right bait");pubMessage.textContent='"Did you know '+fish.name+' likes '+fact.toLowerCase()+'?"';}
  else if(field==="weather"){fact=(fish.weatherPreferences||[])[0]||"changing weather";pubMessage.textContent='"Did you know '+fish.name+' likes '+String(fact).toLowerCase()+' weather?"';}
  else if(field==="locations"){const locIds=Object.keys(locationFishWeights).filter(id=>(locationFishWeights[id]?.[fish.id]||0)>0);const loc=locations[randomChoice(locIds)];pubMessage.textContent='"You can find big '+fish.name+' in '+(loc?.name||"good water")+'."';}
  else{pubMessage.textContent='"Did you know '+fish.name+' likes particular '+field+'? Pay attention to it."';}
}
function askFishBiting(){
  if(player.pub.oldTimerFriendly){player.pub.oldTimerFriendly=false;revealOldTimerTip();saveGame();return;}
  if(player.pub.oldTimerAffinity===0){if(wouldAnnoyOldTimer())return;setAffinity(-1);pubMessage.textContent='"You\'re annoying me."';}
  else if(player.pub.oldTimerAffinity===-1){setAffinity(-2);pubMessage.textContent="He just glares into his drink.";ejectFromPub();return;}
  else if(player.pub.oldTimerAffinity>=1){revealOldTimerTip();setAffinity(player.pub.oldTimerAffinity-1);}
  else pubMessage.textContent="He ignores you.";saveGame();
}
function oldTimerHow(){if(player.pub.oldTimerAffinity===-1)pubMessage.textContent="He looks pointedly at the bartender, ignoring you.";else if(player.pub.oldTimerAffinity>=1)pubMessage.textContent='"I\'ve got plenty to complain about, but nobody cares."';else if(player.pub.oldTimerAffinity===0)pubMessage.textContent="He shrugs.";else{pubMessage.textContent='The bartender speaks to you. "We\'re closing now. Leave."\n\nNo one else moves.';ejectFromPub();}}
function askMovedOn(){learnTechnique("twitch");player.pub.heardTwitchAdvice=true;pubMessage.textContent='"Give the line a little twitch sometimes. Gets their attention."';saveGame();}
function askStrongFish(){learnTechnique("hold_pressure");player.pub.heardStrongFishAdvice=true;pubMessage.textContent='"When one runs hard, stop cranking. Hold pressure and let it tire itself out."';saveGame();}
function askRareFish(){player.pub.knowsArcticCharr=true;player.pub.heardRareFishAdvice=true;learnFishKnowledge("arctic_charr",["name","locations","depth"]);pubMessage.textContent='"You know about the arctic charr? You can only catch them in the deepest part of Big Lake."\n\nNow you have a chance to catch Arctic Charr at Big Lake.';saveGame();}
function addPubChoice(list,text,fn){const li=document.createElement("li"),b=document.createElement("button");b.type="button";b.textContent="["+text+"]";b.onclick=fn;li.appendChild(b);list.appendChild(li);}
function showOldTimerTalk(){player.pub.oldTimerTalks++;pubBartenderActions.style.display="none";pubTalkActions.innerHTML="";pubTalkActions.style.display="block";addPubChoice(pubTalkActions,"How's it going?",oldTimerHow);addPubChoice(pubTalkActions,"Are the fish biting?",askFishBiting);if(player.pub.oldTimerAffinity>=0&&player.pub.fishMovedOnCount>0&&!player.pub.heardTwitchAdvice)addPubChoice(pubTalkActions,"Ask about fish that nibble and swim away",askMovedOn);if(player.pub.oldTimerAffinity>=1&&player.pub.lineBrokenDuringSurge&&!player.pub.heardStrongFishAdvice)addPubChoice(pubTalkActions,"Ask about fish that are too strong to reel in",askStrongFish);if(player.pub.oldTimerAffinity===2&&!player.pub.heardRareFishAdvice)addPubChoice(pubTalkActions,"Ask about rare fish",askRareFish);addPubChoice(pubTalkActions,"Buy him a beer ($3)",buyOldTimerBeer);saveGame();}
function bartenderSmallTalk(){const lines=['He just looks at you, unblinking.','"Are you ordering a beer?"','He washes a glass and doesn\'t react at all.'];pubMessage.textContent=randomChoice(lines);}
function showBartenderTalk(){pubTalkActions.style.display="none";pubBartenderActions.innerHTML="";pubBartenderActions.style.display="block";addPubChoice(pubBartenderActions,"Make small talk",bartenderSmallTalk);addPubChoice(pubBartenderActions,"Order a drink ($3)",orderDrink);}

function openJournal(){
  if(state!=="ready"&&state!=="finished")return;
  pierPanel.style.display="none";marketPanel.style.display="none";shopPanel.style.display="none";journalPanel.style.display="block";topNav.style.display="none";locationTitle.textContent="Fishin': Fishing Journal";renderJournal();
}
function closeJournal(){
  journalPanel.style.display="none";pierPanel.style.display="block";topNav.style.display="flex";refreshLocationUI();resetFishing();startEnvironmentAnimations();
}
let journalWaterType="freshwater";
function renderJournal(selectedId){
  const requested=fishTypes.find(f=>f.id===selectedId);if(requested)journalWaterType=requested.waterType;
  journalSpecies.innerHTML="";
  for(const b of journalWaterTabs.querySelectorAll("button")){b.classList.toggle("active",b.dataset.water===journalWaterType);b.onclick=()=>{journalWaterType=b.dataset.water;renderJournal();};}
  const sectionFish=fishTypes.filter(f=>f.waterType===journalWaterType);
  const caughtFish=sectionFish.find(f=>player.catchHistory.some(c=>c.speciesId===f.id));
  const initial=(requested&&requested.waterType===journalWaterType)?requested.id:(caughtFish?.id||sectionFish[0]?.id);
  for(const fish of sectionFish){
    const catches=player.catchHistory.filter(c=>c.speciesId===fish.id),known=fishIsKnown(fish),hasTrophy=catches.some(c=>c.trophy);
    const b=document.createElement("button");b.className=fish.id===initial?"active":"";b.textContent=(known?fish.name:"???")+(known?"  ("+catches.length+")":"")+(hasTrophy?"  🏆":"");b.addEventListener("click",()=>renderJournal(fish.id));journalSpecies.appendChild(b);
  }
  if(initial)renderJournalEntry(initial);
}
function renderJournalEntry(fishId){
  const fish=fishTypes.find(f=>f.id===fishId);if(!fish)return;
  const caught=player.catchHistory.filter(c=>c.speciesId===fish.id);
  const known=fishIsKnown(fish);
  const largest=caught.length?Math.max(...caught.map(c=>c.weight)):null;
  const allTime=player.meta.allTimeBests?.[fish.id]||null;
  const caughtLocations=[...new Set(caught.map(c=>locations[c.location]?.name||c.location).filter(Boolean))];
  const guideLocations=Object.entries(locationFishWeights).filter(([,weights])=>(weights[fish.id]||0)>0).map(([id])=>locations[id]?.name||id);
  const unknown='<span class="journalUnknown">???</span>';
  const preferredBait=Object.entries(fish.baitPreferences).filter(([,v])=>v>1).sort((a,b)=>b[1]-a[1]).map(([name])=>name).join(", ")||"No strong preference";
  const times=Object.entries(fish.timePreferences||{}).sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>x[0]).join(", ");
  const depths=Object.entries(fish.depthPreferences||{}).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).map(([d])=>DEPTH_LABELS[d]).join(", ");
  const caughtDepths=[...new Set(caught.map(c=>c.depth).filter(Boolean))].map(d=>DEPTH_LABELS[d]||d);
  const trophies=caught.filter(c=>c.trophy).length;

  journalEntry.innerHTML=[
    '<div class="journalName">'+(known?fish.name:unknown)+(trophies?' <span class="trophyIcon" title="Trophy caught">🏆</span>':'')+'</div>',
    '<div class="journalStat"><span class="journalLabel">Water</span>'+(fishFactKnown(fish,"waterType")?(fish.waterType==="freshwater"?"Freshwater":"Saltwater"):unknown)+'</div>',
    '<div class="journalStat"><span class="journalLabel">Caught</span>'+caught.length+'</div>',
    '<div class="journalStat"><span class="journalLabel">Largest this run</span>'+(largest?largest.toFixed(2)+' lb':'—')+'</div>',
    '<div class="journalStat"><span class="journalLabel">All-Time Best</span>'+(allTime?allTime.toFixed(2)+' lb':'—')+'</div>',
    '<div class="journalStat"><span class="journalLabel">Trophies</span>'+trophies+'</div>',
    '<div class="journalStat"><span class="journalLabel">Seen at</span>'+(fishFactKnown(fish,"locations")?guideLocations.join(", "):(caughtLocations.length?caughtLocations.join(", "):unknown))+'</div>',
    '<div class="journalStat"><span class="journalLabel">Weight</span>'+(fishFactKnown(fish,"weight")?fish.minWeight.toFixed(1)+'–'+fish.maxWeight.toFixed(1)+' lb':unknown)+'</div>',
    '<div class="journalStat"><span class="journalLabel">Trophy weight</span>'+(fishFactKnown(fish,"trophyWeight")?fish.trophyWeight.toFixed(1)+' lb':unknown)+'</div>',
    '<div class="journalStat"><span class="journalLabel">Rarity</span>'+(fishFactKnown(fish,"rarity")?fish.rarity.replaceAll("_"," "):unknown)+'</div>',
    '<div class="journalStat"><span class="journalLabel">Depth</span>'+(fishFactKnown(fish,"depth")?depths:(caughtDepths.length?caughtDepths.join(", "):unknown))+'</div>',
    '<div class="journalStat"><span class="journalLabel">Best bait</span>'+(fishFactKnown(fish,"bait")?preferredBait:unknown)+'</div>',
    '<div class="journalStat"><span class="journalLabel">Seasons</span>'+(fishFactKnown(fish,"seasons")?fish.seasonPreferences.join(", "):unknown)+'</div>',
    '<div class="journalStat"><span class="journalLabel">Weather</span>'+(fishFactKnown(fish,"weather")?fish.weatherPreferences.join(", "):unknown)+'</div>',
    '<div class="journalStat"><span class="journalLabel">Best times</span>'+(fishFactKnown(fish,"time")?(times||"Varied"):unknown)+'</div>',
    '<div class="journalStat"><span class="journalLabel">Bite behavior</span>'+(fishFactKnown(fish,"behavior")?describeNibbleBehavior(fish):unknown)+'</div>',
    '<div class="journalFishCopy"></div>'
  ].join("");
}
function describeNibbleBehavior(fish){const b=fish.nibbleBehavior;if((b.baseBite??0)>=0.70&&(b.baseNervousness??0)<=0.05)return "Eager. Usually quick to commit once interested.";if((b.baseBite??0)<0.35||(b.baseNervousness??0)>=0.20)return "Cautious. Working the bait can help, but bad timing makes it more suspicious.";return "Moderately cautious. Additional nibbles improve your chances.";}

const SKY_WIDTH=44;
const SKY_HEIGHT=5;
const waterFrames={1:["~~~~~~    ~~~~~~~    ~~~~~   ~~~~~~   ~~~~~~","~~~~~~    ~~~~~    ~~~~~~~~    ~~~~~~    ~~~","~~~~~~~       ~~~~        ~~~~       ~~~~~~~"],2:["~~~~~   ~~^~~   ~~~~~   ~~^~~  ~~~~   ~~^~~","~~^~~   ~~~~~    ~~^~~   ~~~~   ~~^~~   ~~~","~~~~   ~^~   ~~~~    ~^~    ~~~~   ~^~   ~~~"],3:["~~^ ~~~≈~~~  ~~≈^≈~~  ~~~≈^≈~~~  ~~~≈~~~ ^~~","~~~ ~~~~  ~~~~≈~~  ~~≈~~~  ~~~~  ~~^~~  ~~~~","  ~~≈~~~  ~~~~  ~~≈≈~~~~    ~~~~  ~~≈~~  ~≈~"],4:["≈≈≈~ ~≈^≈~~≈≈≈~~^~~≈≈~ ~≈^≈~~~~≈≈≈~~~~≈^≈~~~"," ~~~≈≈≈≈≈~≈^~~~~≈~~^≈≈≈~~≈≈^≈≈~~~~~≈≈^≈≈~^ ","≈≈≈≈≈≈~~~^ ~~≈≈≈≈≈≈~~^≈≈≈≈≈~~~^≈~~~~^≈≈≈~ ","~~≈~^ ~≈~~~~^~~≈≈≈~~~~≈~^ ~≈~~~~^≈≈≈~~≈≈^~"]};
let skyFrame=0,waterFrame=0,skyAnimationTimer=null,waterAnimationTimer=null;
function blankSky(){return Array.from({length:SKY_HEIGHT},()=>Array(SKY_WIDTH).fill(" "));}
function stampSky(grid,row,col,text){if(row<0||row>=SKY_HEIGHT)return;for(let i=0;i<text.length;i++){const x=col+i;if(x>=0&&x<SKY_WIDTH&&text[i]!==" ")grid[row][x]=text[i];}}
function getCelestialPosition(){
  const u=world.timeUnits;
  if(world.period==="Morning"){
    const positions=[[4,3],[3,7],[2,11],[1,15]];return {kind:"sun",pos:positions[Math.min(u,3)]};
  }
  if(world.period==="Day"){
    const positions=[[1,18],[0,20],[0,22],[0,24],[0,26],[0,28],[1,30]];return {kind:"sun",pos:positions[Math.min(u,6)]};
  }
  if(world.period==="Evening"){
    const positions=[[1,34],[2,32],[3,30],[4,28]];return {kind:"sun",pos:positions[Math.min(u,3)]};
  }
  if(world.period==="Night"){
    // Moon positions are the TOP-LEFT corner of a fixed 6x4 sprite.
    // With a 5-row sky this gives a subtle arc without clipping the moon.
    const positions=[[1,34],[1,31],[0,28],[0,22],[0,17],[1,12],[1,6]];return {kind:"moon",pos:positions[Math.min(u,6)]};
  }
  return null;
}
const SMALL_MOONS=[
  // Fixed 6-character x 4-line sprites. Four interior columns give clear phase steps.
  // Day 1: New Moon
  [" .--. ",":    :",":    :"," '--' "],
  // Day 2: Waxing Crescent
  [" .--. ",":   #:",":   #:"," '--' "],
  // Day 3: First Quarter
  [" .--. ",":  ##:",":  ##:"," '--' "],
  // Day 4: Waxing Gibbous
  [" .--. ",": ###:",": ###:"," '--' "],
  // Day 5: Full Moon
  [" .--. ",":####:",":####:"," '--' "],
  // Day 6: Waning Gibbous
  [" .--. ",":### :",":### :"," '--' "],
  // Day 7: Last Quarter
  [" .--. ",":##  :",":##  :"," '--' "],
  // Day 8: Waning Crescent
  [" .--. ",":#   :",":#   :"," '--' "]
];
function getMoonArt(){const phase=debugMoonPhase??((Math.max(1,world.seasonDay)-1)%8);return SMALL_MOONS[phase];}
function renderCelestial(grid){
  const c=getCelestialPosition();if(!c)return;
  const [row,col]=c.pos;
  if(c.kind==="sun"){
    // At Dawn/Twilight the lower rays clip naturally against the waterline.
    stampSky(grid,row-1,col,"\\ | /");stampSky(grid,row,col,"- O -");stampSky(grid,row+1,col,"/ | \\");
  }else{
    const art=getMoonArt();
    for(let i=0;i<art.length;i++) stampSky(grid,row+i,col,art[i]);
  }
}
function renderWeatherOverlay(grid){
  const name=world.weather?.name||"Clear";
  if(name==="Clear")return;
  // Overcast and proper rain obscure the celestial body. Partly Cloudy and
  // Light Rain keep it visible so the lighter weather states remain distinct.
  if(name==="Cloudy"||name==="Rain"||name==="Heavy Rain") {
    for(let row=0;row<grid.length;row++) grid[row].fill(" ");
  }
  const raining=name==="Light Rain"||name==="Rain"||name==="Heavy Rain";
  const drift=(skyFrame%6)-2;
  const base=Math.max(1,Math.min(SKY_WIDTH-14,18+drift));
  const phase=skyFrame%4;

  if(name==="Heavy Rain"){
    // A low, solid storm ceiling: the sun/moon disappears behind the cloud deck.
    // Unlike the ordinary cloud, we see only the scalloped underside below a flat top.
    for(let row=0;row<3;row++) grid[row].fill(" ");
    const undersides=[
      "  \\____/   \\_______/  \\_____/   \\_______/   \\____/  ",
      "\\_____/  \\______/   \\_______/  \\_____/   \\_______/  ",
      "  \\_______/   \\________/   \\_______/   \\______/  "
    ];
    stampSky(grid,1,-2+(skyFrame%3),undersides[skyFrame%undersides.length]);
    stampSky(grid,2,2-((skyFrame+1)%3),undersides[(skyFrame+1)%undersides.length]);
    const rows=["  /   /   /   /   /   /   /   /   / ","/   /   /   /   /   /   /   /   /   / "," /  /  /  /  /  /  /  /  /  /  /  /  /"];
    stampSky(grid,3,-1,rows[phase%3]);stampSky(grid,4,1,rows[(phase+1)%3]);
    return;
  }

  // Partly Cloudy / Light Rain retain the single cloud. Cloudy / Rain animate
  // 2-3 separate clouds spread across almost the full 44-character sky.
  const cloudRow=raining?0:1;
  const wide=name==="Cloudy"||name==="Rain";
  if(!wide){stampSky(grid,cloudRow,base,"   .--.");stampSky(grid,cloudRow+1,base-2,".-(    ).");stampSky(grid,cloudRow+2,base-3,"(_________)");}
  else {
    const layouts=[[2,18,33],[0,15,31],[4,22],[1,17,34]];const cols=layouts[skyFrame%layouts.length];
    cols.forEach((c,i)=>{const top=i%2?"  .---.":"   .--.";const mid=i%2?".(     ).":".-(    ).";const low=i%2?"(________)":"(_________)";stampSky(grid,cloudRow,c,top);stampSky(grid,cloudRow+1,c-2,mid);stampSky(grid,cloudRow+2,c-3,low);});
  }
  if(!raining)return;
  if(name==="Light Rain"){
    const sparse=[[[3,1],[4,8]],[[3,7],[4,13]],[[3,3],[4,10]],[[3,10],[4,5]]][phase];
    sparse.forEach(([row,off])=>stampSky(grid,row,base-3+off,"'"));
  }else{
    const rainRows=[" '  '   '  '   '   '  '   '   '  '   ' ","   '  '   '   '  '   '  '   '   '  '   '"," '   '  '   '  '   '   '  '   '   '  ' "];
    stampSky(grid,3,-1,rainRows[phase%3]);stampSky(grid,4,1,rainRows[(phase+1)%3]);
  }
}
function renderSky(){const grid=blankSky();renderCelestial(grid);renderWeatherOverlay(grid);sky.textContent=grid.map(r=>r.join("").replace(/\s+$/,"" )).join("\n");}
function startEnvironmentAnimations(){stopEnvironmentAnimations();skyFrame=0;waterFrame=0;renderSky();renderWater();animateSky();animateWater();}
function stopEnvironmentAnimations(){clearTimeout(skyAnimationTimer);clearTimeout(waterAnimationTimer);}
function animateSky(){skyAnimationTimer=setTimeout(()=>{if(pierPanel.style.display!=="none"){skyFrame=(skyFrame+1)%12;renderSky();}animateSky();},900);}
function getWaterMotion(){return debugWaterMotion??world.weather?.waterMotion??1;}
function renderWater(){const motion=getWaterMotion();const frames=waterFrames[motion]||waterFrames[1];water.textContent=frames[waterFrame%frames.length];}
function animateWater(){const motion=getWaterMotion();const speeds={1:900,2:550,3:300,4:160};waterAnimationTimer=setTimeout(()=>{if(pierPanel.style.display!=="none"){const frames=waterFrames[motion]||waterFrames[1];waterFrame=(waterFrame+1)%frames.length;renderWater();}animateWater();},speeds[motion]||900);}

function showIntroStep(step){
  introOverlay.style.display="flex"; introChoices.innerHTML="";
  if(step===1){
    introText.innerHTML=`<p>"Your father died," says the man who arrives at your house.</p><p>He's a lawyer. He's brought you a letter explaining the deal.</p>`;
    [["I haven't seen him since he left, when I was just a kid.",2],["What did he leave me?",2],["Say nothing",2]].forEach(([label,next])=>{const b=document.createElement("button");b.textContent=label;b.addEventListener("click",()=>showIntroStep(next));introChoices.appendChild(b);});
  }else if(step===2){
    introText.innerHTML=`<p>"The will is pretty standard. But it says you need to clean out his old house to sell it and keep the money. It's not worth much, and the sale has to cover his debts. Which were considerable.</p><p>"You also get his old truck. Sorry, it's not running, that's why we had to have it towed here."</p>`;
    ["Well, if I fix it up, my wife won't have to drive me to work anymore.","Maybe he did care about me. But not much.","Thanks.","Say nothing"].forEach(label=>{const b=document.createElement("button");b.textContent=label;b.addEventListener("click",()=>showIntroStep(3));introChoices.appendChild(b);});
  }else{
    introText.innerHTML=`<p>The lawyer smiles and squeezes your shoulder before he leaves.</p><p>You look in the truck. It's got an old fishing rod and reel, a creel for fish, and a box with a lock.</p>`;
    const b=document.createElement("button");b.textContent="Go Fishing";b.addEventListener("click",finishIntro);introChoices.appendChild(b);
  }
}
function finishIntro(){ world.introSeen=true; introOverlay.style.display="none"; addLog("world","Your father left you a broken old truck, an old rod and reel, a creel, and a locked box."); saveGame(); }


// Newspaper — seasonal issues, forecasts, archive, and subscription.
function issueKey(season,year){return season+":"+year;}
function currentIssueKey(){return issueKey(world.season,world.year);}
function findOwnedIssue(key){return player.newspaper.ownedIssues.find(i=>i.key===key);}
function currentIssue(){return findOwnedIssue(currentIssueKey());}
function issueFromWeather(weather){return {key:issueKey(weather.season,weather.year),season:weather.season,year:weather.year,forecast:JSON.parse(JSON.stringify(weather.days||[]))};}
function archiveCurrentNewspaperIssue(){
  if(world.seasonDay!==DAYS_PER_SEASON||!world.weatherSeason)return;
  const issue=issueFromWeather(world.weatherSeason);if(!world.newspaperHistory.some(i=>i.key===issue.key))world.newspaperHistory.push(issue);
}
function getNewspaperGearState(){
  if(player.newspaper.subscribed)return "Subscribed";
  if(currentIssue())return "Current";
  return player.newspaper.ownedIssues.length?"Old":"None";
}
function addOwnedIssue(issue){if(!issue||findOwnedIssue(issue.key))return false;player.newspaper.ownedIssues.push(JSON.parse(JSON.stringify(issue)));player.meta.newspaperUnlocked=true;return true;}
function buyNewspaperIssue(issue){if(!issue||player.money<5||findOwnedIssue(issue.key))return;player.money-=5;addOwnedIssue(issue);addLog("buy","Bought the "+issue.season+", Year "+issue.year+" newspaper for $5.00.");renderShopInventory();renderGearInventory();updateDisplays();saveGame();}
function subscribeNewspaper(){if(player.newspaper.subscribed||player.money<8||!player.meta.newspaperUnlocked)return;player.money-=8;player.newspaper.subscribed=true;addLog("buy","Subscribed to the newspaper for $8.00.");const issue=issueFromWeather(world.weatherSeason);addOwnedIssue(issue);renderGearInventory();renderShopInventory();updateDisplays();saveGame();}
function deliverSubscribedNewspaper(){if(!player.newspaper?.subscribed)return;const issue=issueFromWeather(world.weatherSeason);if(addOwnedIssue(issue))addLog("world","The new "+world.season+" newspaper arrives.");}
function availableNewspaperIssues(){
  if(player.newspaper.subscribed)return [];
  const issues=[];if(world.weatherSeason)issues.push(issueFromWeather(world.weatherSeason));
  if(world.seasonDay===DAYS_PER_SEASON)issues.push(issueFromWeather(ensureNextSeasonWeather()));
  for(const old of (world.newspaperHistory||[]))issues.push(old);
  const seen=new Set();return issues.filter(i=>i&&!seen.has(i.key)&&seen.add(i.key)&&!findOwnedIssue(i.key));
}
function renderNewspaperShopRows(box){
  const issues=availableNewspaperIssues();if(!issues.length)return;const title=document.createElement("div");title.className="shopSectionTitle";title.textContent="NEWSPAPERS";box.appendChild(title);
  for(const issue of issues){const row=document.createElement("div");row.className="shopRow";const label=document.createElement("span");label.innerHTML=issue.season+", Year "+issue.year+'<div class="shopNote">Forecasts, local news, ads</div>';const price=document.createElement("span");price.textContent="$5.00";const buy=document.createElement("button");buy.className="smallButton";buy.textContent="Buy";buy.disabled=player.money<5;buy.addEventListener("click",()=>buyNewspaperIssue(issue));row.append(label,price,buy);box.appendChild(row);}
}
function updateNewspaperFishingLink(){if(!newspaperFishingLink)return;newspaperFishingLink.style.display=currentIssue()&&pierPanel.style.display!=="none"?"block":"none";}
function forecastSummary(day){const w=day?.parts?.Day||day?.parts?.Morning||{};const wind=String(w.wind||"Light").toLowerCase();let weather=String(w.name||"Clear").toLowerCase();let windText=wind==="calm"?"calm":wind==="light"?"light wind":wind+" winds";return {temp:(w.temperatureF??"—")+"°",text:weather+", "+windText};}
function renderForecast(issue){newspaperContent.innerHTML="<strong>8-DAY FORECAST</strong>";const grid=document.createElement("div");grid.className="forecastGrid";for(const day of issue.forecast||[]){const f=forecastSummary(day),cell=document.createElement("div");cell.className="forecastDay";cell.innerHTML="<strong>Day "+day.day+"</strong><div>"+f.temp+"</div><div>"+f.text+"</div>";grid.appendChild(cell);}newspaperContent.appendChild(grid);}
function renderOldIssues(){newspaperContent.innerHTML="<strong>OLD ISSUES</strong>";const list=document.createElement("div");list.className="oldIssueList";const old=player.newspaper.ownedIssues.filter(i=>i.key!==currentIssueKey()).slice().reverse();if(!old.length){list.innerHTML='<div class="empty">No old issues.</div>';}else for(const issue of old){const b=document.createElement("button");b.className="textLink";b.textContent=issue.season+", Year "+issue.year+" [Read]";b.addEventListener("click",()=>{newspaperEditionLabel.textContent=issue.season+", Year "+issue.year;renderForecast(issue);});list.appendChild(b);}newspaperContent.appendChild(list);}
function openNewspaper(){const issue=currentIssue();if(!issue)return;pierPanel.style.display="none";topNav.style.display="none";marketPanel.style.display="none";shopPanel.style.display="none";journalPanel.style.display="none";pubPanel.style.display="none";newspaperPanel.style.display="block";locationTitle.textContent="Fishin': The Newspaper";newspaperEditionLabel.textContent=issue.season+", Year "+issue.year;newspaperContent.innerHTML="";}
function closeNewspaper(){newspaperPanel.style.display="none";returnToFishing();}

newspaperReadButton.addEventListener("click",openNewspaper);newspaperReturnButton.addEventListener("click",closeNewspaper);forecastReadButton.addEventListener("click",()=>{const issue=currentIssue();if(issue)renderForecast(issue);});oldIssuesReadButton.addEventListener("click",renderOldIssues);
fishButton.addEventListener("click",handleMainButton);pullUpButton.addEventListener("click",handleSecondaryFishingButton);sleepButton.addEventListener("click",()=>{world.period==="Night"?goToSleep():catchUpSleep();});quitJobButton.addEventListener("click",quitJob);journalButton.addEventListener("click",openJournal);pubButton.addEventListener("click",openPub);pubReturnButton.addEventListener("click",closePub);pubTalkButton.addEventListener("click",()=>{if(pubTalkActions.style.display==="block")pubTalkActions.style.display="none";else showOldTimerTalk();});pubBartenderTalkButton.addEventListener("click",()=>{if(pubBartenderActions.style.display==="block")pubBartenderActions.style.display="none";else showBartenderTalk();});pubLeaveButton.addEventListener("click",closePub);journalReturnButton.addEventListener("click",closeJournal);marketButton.addEventListener("click",()=>goToLocation("market"));shopButton.addEventListener("click",()=>goToLocation("shop"));marketReturnButton.addEventListener("click",returnToFishing);shopReturnButton.addEventListener("click",returnToFishing);sellAllButton.addEventListener("click",sellAllFish);
fightReelButton.addEventListener("pointerdown",e=>{if(state!=="reeling")return;e.preventDefault();isHoldingPressure=false;isReeling=true;fightReelButton.textContent="REELING... [↑]";fightPressureButton.textContent="HOLD PRESSURE [↓]";});
function stopReeling(){isReeling=false;if(fightReelButton)fightReelButton.textContent="HOLD TO REEL [↑]";}
fightReelButton.addEventListener("pointerup",stopReeling);fightReelButton.addEventListener("pointercancel",stopReeling);fightReelButton.addEventListener("pointerleave",stopReeling);

fightPressureButton.addEventListener("pointerdown",e=>{if(state!=="reeling")return;e.preventDefault();isReeling=false;isHoldingPressure=true;fightReelButton.textContent="HOLD TO REEL [↑]";fightPressureButton.textContent="HOLDING... [↓]";});
function stopPressure(){isHoldingPressure=false;if(fightPressureButton)fightPressureButton.textContent="HOLD PRESSURE [↓]";}
fightPressureButton.addEventListener("pointerup",stopPressure);fightPressureButton.addEventListener("pointercancel",stopPressure);fightPressureButton.addEventListener("pointerleave",stopPressure);
cutLineButton.addEventListener("click",()=>{if(state==="reeling")loseFish("You cut the line.");});

function keyboardActivate(button){if(!button||button.disabled||button.offsetParent===null)return;button.click();}
function keyboardStartReel(){if(state!=="reeling")return;isHoldingPressure=false;isReeling=true;fightReelButton.textContent="REELING... [↑]";fightPressureButton.textContent="HOLD PRESSURE [↓]";}
function keyboardStartPressure(){if(state!=="reeling"||!knowsTechnique("hold_pressure"))return;isReeling=false;isHoldingPressure=true;fightReelButton.textContent="HOLD TO REEL [↑]";fightPressureButton.textContent="HOLDING... [↓]";}
document.addEventListener("keydown",e=>{
  if(e.repeat)return;const tag=(e.target?.tagName||"").toLowerCase();if(["input","textarea","select"].includes(tag))return;
  if(e.code==="Space" && ["ready","finished"].includes(state)){e.preventDefault();keyboardActivate(fishButton);return;}
  if((e.key==="h"||e.key==="H")&&state==="bite"){keyboardActivate(fishButton);return;}
  if((e.key==="j"||e.key==="J")&&["waiting","nibble"].includes(state)&&knowsTechnique("twitch")){keyboardActivate(fishButton);return;}
  if(e.key==="ArrowUp"){e.preventDefault();keyboardStartReel();return;}
  if(e.key==="ArrowDown"){e.preventDefault();keyboardStartPressure();return;}
  if((e.key==="k"||e.key==="K")&&state==="reeling"){keyboardActivate(cutLineButton);return;}
  if((e.key==="l"||e.key==="L")&&["waiting","nibble","bite"].includes(state)){keyboardActivate(pullUpButton);return;}
  if((e.key==="s"||e.key==="S")&&sleepButton.offsetParent!==null&&!sleepButton.disabled){keyboardActivate(sleepButton);return;}
  if((e.key==="w"||e.key==="W")&&isWorkDue()&&["ready","finished"].includes(state)){keyboardActivate(fishButton);return;}
});
document.addEventListener("keyup",e=>{if(e.key==="ArrowUp")stopReeling();if(e.key==="ArrowDown")stopPressure();});

debugResetButton.addEventListener("click",()=>{if(confirm("Delete the Fishin' save and start over?"))deleteSave();});
debugAddBaitButton.addEventListener("click",()=>{Object.keys(player.gear.bait).forEach(name=>player.gear.bait[name]+=12);addLog("world","DEBUG: Added 12 of every bait.");renderGearInventory();updateDisplays();saveGame();});
debugAddMoneyButton.addEventListener("click",()=>{player.money+=100;addLog("world","DEBUG: Added $100.");updateDisplays();renderGearInventory();renderShopInventory();saveGame();});
debugTravelToggle.addEventListener("change",()=>{debugInstantTravel=debugTravelToggle.checked;renderLocationTabs();message.textContent=debugInstantTravel?"Debug instant travel enabled.":"";});
debugFightMetersToggle.addEventListener("change",()=>{debugFightMeters=debugFightMetersToggle.checked;if(typeof renderDebugFightMeters==="function")renderDebugFightMeters();});
debugFishStatsToggle.addEventListener("change",()=>{debugFishStats=debugFishStatsToggle.checked;if(typeof renderDebugFightMeters==="function")renderDebugFightMeters();});
debugSpecifyFishToggle.addEventListener("change",()=>{debugSpecifyFish=debugSpecifyFishToggle.checked;renderDebugFishSelector();message.textContent=debugSpecifyFish?"Debug fish selection enabled.":"";});
debugWeightSlider.addEventListener("input",()=>{debugWeightClass=Number(debugWeightSlider.value);renderDebugFishSelector();});
debugWeatherSelect.addEventListener("change",()=>{const c=debugWeatherSelect.value;if(!c)return;setDebugWeather(c);debugWeatherSelect.value="";updateDisplays();startEnvironmentAnimations();saveGame();});
debugMoonSelect.addEventListener("change",()=>{debugMoonPhase=debugMoonSelect.value===""?null:Number(debugMoonSelect.value);skyFrame=0;renderSky();});
debugWaterSelect.addEventListener("change",()=>{debugWaterMotion=debugWaterSelect.value?Number(debugWaterSelect.value):null;waterFrame=0;updateDisplays();startEnvironmentAnimations();});
debugSeasonSelect.addEventListener("change",()=>{const s=debugSeasonSelect.value;if(!s)return;world.season=s;world.seasonIndex=seasons.indexOf(s);world.seasonDay=1;world.period="Morning";world.timeUnits=0;world.nightFishing=false;generateSeasonWeather();debugSeasonSelect.value="";resetFishing();refreshLocationUI();startEnvironmentAnimations();saveGame();});

setInterval(()=>{document.querySelectorAll(".lineDot").forEach(dot=>{Math.random()<.18?dot.classList.add("dim"):dot.classList.remove("dim");});},180);

inventoryLimitDisplay.textContent=getInventoryLimit();
const loadedSave=loadGame();
// Migrate existing saves into the field-based knowledge model. Existing catches and owned books teach the same facts they did before.
for(const fish of fishTypes) ensureFishKnowledge(fish.id);
for(const rec of (player.catchHistory||[])){ if(rec?.speciesId) learnFishKnowledge(rec.speciesId,["name","waterType"]); }
for(const bookId of (player.books||[])) applyBookKnowledge(bookId);
if(!loadedSave){generateSeasonWeather();addLog("world","Spring, Day 1 begins.");addLog("world",describeWeather());}else ensureSeasonWeather();
state="ready";
refreshLocationUI();updateDisplays();updateInventoryDisplay();renderGearInventory();renderShopInventory();resetFishing();startEnvironmentAnimations();
if(!world.introSeen) showIntroStep(1);
setInterval(saveGame,5000);
