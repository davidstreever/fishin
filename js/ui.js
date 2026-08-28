// Fishin' — ui.js

const locationTitle=document.getElementById("locationTitle"),topNav=document.getElementById("topNav"),locationTabs=document.getElementById("locationTabs"),locationDescription=document.getElementById("locationDescription"),depthControls=document.getElementById("depthControls");
const pierPanel=document.getElementById("pierPanel"),marketPanel=document.getElementById("marketPanel"),shopPanel=document.getElementById("shopPanel"),journalPanel=document.getElementById("journalPanel");
const seasonDisplay=document.getElementById("seasonDisplay"),dayDisplay=document.getElementById("dayDisplay"),yearDisplay=document.getElementById("yearDisplay"),timeDisplay=document.getElementById("timeDisplay");
const introOverlay=document.getElementById("introOverlay"),introText=document.getElementById("introText"),introChoices=document.getElementById("introChoices");
const marketCalendarDisplay=document.getElementById("marketCalendarDisplay"),shopCalendarDisplay=document.getElementById("shopCalendarDisplay");
const moneyDisplay=document.getElementById("moneyDisplay"),marketMoneyDisplay=document.getElementById("marketMoneyDisplay"),shopMoneyDisplay=document.getElementById("shopMoneyDisplay");
const rodDisplay=document.getElementById("rodDisplay"),reelDisplay=document.getElementById("reelDisplay"),baitTypeDisplay=document.getElementById("baitTypeDisplay"),baitAmountDisplay=document.getElementById("baitAmountDisplay"),specialItemDisplay=document.getElementById("specialItemDisplay"),temperatureDisplay=document.getElementById("temperatureDisplay");
const sky=document.getElementById("sky"),water=document.getElementById("water"),lineStage=document.getElementById("lineStage"),tensionGrid=document.getElementById("tensionGrid"),tensionFillLayer=document.getElementById("tensionFillLayer"),line=document.getElementById("line"),message=document.getElementById("message"),hint=document.getElementById("hint");
const fightPanel=document.getElementById("fightPanel");
const normalControls=document.getElementById("normalControls"),fightControls=document.getElementById("fightControls"),fishButton=document.getElementById("fishButton"),pullUpButton=document.getElementById("pullUpButton"),sleepButton=document.getElementById("sleepButton"),quitJobButton=document.getElementById("quitJobButton"),journalButton=document.getElementById("journalButton"),journalReturnButton=document.getElementById("journalReturnButton"),fightReelButton=document.getElementById("fightReelButton"),fightPressureButton=document.getElementById("fightPressureButton"),cutLineButton=document.getElementById("cutLineButton");
const marketButton=document.getElementById("marketButton"),shopButton=document.getElementById("shopButton"),marketReturnButton=document.getElementById("marketReturnButton"),shopReturnButton=document.getElementById("shopReturnButton");
const marketMessage=document.getElementById("marketMessage"),shopMessage=document.getElementById("shopMessage"),marketInventory=document.getElementById("marketInventory"),sellAllButton=document.getElementById("sellAllButton"),shopInventory=document.getElementById("shopInventory");
const gearInventory=document.getElementById("gearInventory"),creel=document.getElementById("creel"),gameLog=document.getElementById("gameLog"),journalSpecies=document.getElementById("journalSpecies"),journalEntry=document.getElementById("journalEntry"),inventoryCountDisplay=document.getElementById("inventoryCount"),inventoryLimitDisplay=document.getElementById("inventoryLimit"),totalWeightDisplay=document.getElementById("totalWeight"),totalValueDisplay=document.getElementById("totalValue");
const debugResetButton=document.getElementById("debugResetButton"),debugAddBaitButton=document.getElementById("debugAddBaitButton"),debugAddMoneyButton=document.getElementById("debugAddMoneyButton"),debugTravelToggle=document.getElementById("debugTravelToggle"),debugFightMetersToggle=document.getElementById("debugFightMetersToggle"),debugFishStatsToggle=document.getElementById("debugFishStatsToggle"),debugSpecifyFishToggle=document.getElementById("debugSpecifyFishToggle"),debugWeatherSelect=document.getElementById("debugWeatherSelect"),debugSeasonSelect=document.getElementById("debugSeasonSelect");
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
  seasonDisplay.textContent=world.season; dayDisplay.textContent=world.seasonDay; yearDisplay.textContent=world.year||1; timeDisplay.textContent=getTimeLabel(); marketCalendarDisplay.textContent=getCalendarLabel(); shopCalendarDisplay.textContent=getCalendarLabel();
  moneyDisplay.textContent=player.money.toFixed(2); marketMoneyDisplay.textContent=player.money.toFixed(2); shopMoneyDisplay.textContent=player.money.toFixed(2);
  rodDisplay.textContent=getEquippedRod().name; reelDisplay.textContent=getEquippedReel().name; baitTypeDisplay.textContent=player.selectedBait; baitAmountDisplay.textContent=player.gear.bait[player.selectedBait]; specialItemDisplay.textContent=player.gear.specialItem||"—"; if(temperatureDisplay){const w=world.weather||{};temperatureDisplay.textContent=(w.temperatureF??"—")+"°\n"+(w.temperature||"MILD");}
  inventoryLimitDisplay.textContent=getInventoryLimit();
  updateDepthDisplay();
}

function updateTimeControls(){
  pullUpButton.style.display=["waiting","nibble","bite"].includes(state)?"inline-block":"none"; pullUpButton.textContent="Pull Up [L]"; cutLineButton.textContent="Cut Line [K]"; fightReelButton.textContent=isReeling?"REELING... [↑]":"HOLD TO REEL [↑]"; if(!isHoldingPressure)fightPressureButton.textContent="HOLD PRESSURE [↓]";
  sleepButton.style.display="none";
  quitJobButton.style.display="none";

  if(world.period==="Night"){
    sleepButton.style.display="inline-block";
    sleepButton.title="Go to sleep."; sleepButton.textContent="Sleep [S]";
  } else if(hasSleepDebt() && ["Morning","Day"].includes(world.period)){
    sleepButton.style.display="inline-block";
    sleepButton.title="Catch up on sleep debt. This uses the rest of the current period."; sleepButton.textContent="Sleep [S]";
  }

  if(state!=="ready"&&state!=="finished"){
    marketButton.disabled=true;
    shopButton.disabled=true;
    sleepButton.disabled=true;
    return;
  }

  sleepButton.disabled=false;

  if(isWorkDue()){
    fishButton.disabled=false;
    fishButton.textContent="Go to Work [W]";
    marketButton.disabled=true;
    shopButton.disabled=true;
    if(canQuitJob()) quitJobButton.style.display="inline-block";
    return;
  }

  if(isSleepChoice()){
    marketButton.disabled=true;
    shopButton.disabled=true;

    if(canNightFish()){
      fishButton.disabled=false;
      fishButton.textContent="Keep Fishing";
    } else {
      fishButton.disabled=true;
      fishButton.textContent="Night";
    }

    return;
  }

  marketButton.disabled=world.period==="Night";
  shopButton.disabled=world.period==="Night";

  const baitCount=player.gear.bait[player.selectedBait];

  if(player.inventory.length>=getInventoryLimit()){
    fishButton.disabled=true;
    fishButton.textContent="Creel Full";
  }
  else if(baitCount<=0){
    fishButton.disabled=true;
    fishButton.textContent="No "+player.selectedBait+"s";
  }
  else if(state==="waiting" || state==="nibble"){
    if(knowsTechnique("twitch")){fishButton.disabled=false;fishButton.textContent="Twitch [J]";}
    else {fishButton.disabled=true;fishButton.textContent="Line Out";}
  }
  else if(state==="bite"){
    fishButton.disabled=false;
    fishButton.textContent="HOOK [H]";
  }
  else {
    fishButton.disabled=false;
    fishButton.textContent="Cast Line [Space]";
  }
}

function refreshLocationUI(){
  const loc=locations[world.location];locationTitle.textContent="Fishin': "+loc.name.replace(/^The /,"");locationDescription.textContent=loc.description;renderLocationTabs();updateDepthDisplay();renderDebugFishSelector();
}
function updateDepthDisplay(){
  if(!depthControls)return;const loc=locations[world.location];if(!loc){depthControls.innerHTML="";return;}
  depthControls.innerHTML='<span class="depthLabel">Depth:</span> ';
  DEPTHS.forEach((depth,i)=>{
    const available=loc.availableDepths.includes(depth);const b=document.createElement("button");b.className="depthText"+(depth===player.selectedDepth&&player.gear.tackleKit?" active":"");b.textContent=DEPTH_LABELS[depth];
    b.disabled=!player.gear.tackleKit||!available||(state!=="ready"&&state!=="finished");
    b.title=!player.gear.tackleKit?"Basic Tackle Kit lets you choose depth.":(!available?"This depth is not available here.":"");b.addEventListener("click",()=>selectDepth(depth));depthControls.appendChild(b);
    if(i<DEPTHS.length-1)depthControls.appendChild(document.createTextNode(" | "));
  });
}
function selectDepth(depth){
  const loc=locations[world.location];if(!player.gear.tackleKit||!loc.availableDepths.includes(depth))return;player.selectedDepth=depth;updateDepthDisplay();saveGame();
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

function renderGearInventory(){
  gearInventory.innerHTML="";
  const vehicle=vehicles[player.gear.vehicle]||vehicles.old_truck;
  const vehicleRow=document.createElement("div");vehicleRow.className="inventoryEntry equippedGear";
  const vehicleLabel=document.createElement("span");vehicleLabel.textContent="Vehicle";
  const vehicleValue=document.createElement("span");vehicleValue.innerHTML=(player.gear.vehicleRepaired?vehicle.repairedName:vehicle.name)+'<div class="repairNote">'+(player.gear.vehicleRepaired?"Running well enough.":vehicle.note)+"</div>";
  const vehicleAction=document.createElement("span");
  if(!player.gear.vehicleRepaired){const repair=document.createElement("button");repair.className="smallButton";repair.textContent="Repair $"+vehicle.repairCost;repair.disabled=player.money<vehicle.repairCost;repair.addEventListener("click",repairTruck);vehicleAction.appendChild(repair);}
  vehicleRow.append(vehicleLabel,vehicleValue,vehicleAction);gearInventory.appendChild(vehicleRow);

  const gearRows=[["Rod",getEquippedRod().name],["Reel",getEquippedReel().name],["Tackle",player.gear.tackleKit?"Basic Tackle Kit":"Dad's Old Tackle"]];
  for(const [label,val] of gearRows){const row=document.createElement("div");row.className="inventoryEntry equippedGear";row.innerHTML="<span>"+label+"</span><span>"+val+"</span><span></span>";gearInventory.appendChild(row);}
  if(player.gear.lockedBox){const boxRow=document.createElement("div");boxRow.className="inventoryEntry";boxRow.innerHTML="<span>Locked Box</span><span class='repairNote'>The lock won't budge.</span><span></span>";gearInventory.appendChild(boxRow);}
  for(const baitName of Object.keys(player.gear.bait)){
    const row=document.createElement("div");row.className="inventoryEntry"+(baitName===player.selectedBait?" selectedBait":"");const n=document.createElement("span");n.textContent=baitName;const a=document.createElement("span");a.textContent="×"+player.gear.bait[baitName];const b=document.createElement("button");b.className="smallButton";b.textContent=baitName===player.selectedBait?"Selected":"Select";b.disabled=baitName===player.selectedBait||player.gear.bait[baitName]<=0;b.addEventListener("click",()=>selectBait(baitName));row.append(n,a,b);gearInventory.appendChild(row);
  }
}
function repairTruck(){
  const vehicle=vehicles[player.gear.vehicle]||vehicles.old_truck;if(player.gear.vehicleRepaired||player.money<vehicle.repairCost)return;player.money-=vehicle.repairCost;player.gear.vehicleRepaired=true;gainObsession(1,"repairing the truck for fishing");addLog("buy","Repaired the Old Truck for $"+vehicle.repairCost.toFixed(2)+".");message.textContent="The Old Truck coughs, rattles, and finally starts.";updateDisplays();renderGearInventory();renderLocationTabs();renderShopInventory();saveGame();
}

function selectBait(name){ if(player.gear.bait[name]<=0)return;player.selectedBait=name;updateDisplays();renderGearInventory();updateTimeControls();saveGame(); }

function renderShopInventory(){
  shopInventory.innerHTML="";const box=document.createElement("div");box.className="shopBox";
  const baitTitle=document.createElement("div");baitTitle.className="shopSectionTitle";baitTitle.textContent="BAIT";box.appendChild(baitTitle);
  [["Worm",5,2],["Minnow",5,6],["Insect",5,4],["Grub",5,4],["Shrimp",5,6],["Squid",5,6],["Crab",5,8],["Cut Bait",5,8]].forEach(([name,amount,cost])=>{const row=document.createElement("div");row.className="shopRow";row.innerHTML="<span>"+(name==="Cut Bait"?name:name+"s")+" ×"+amount+" <span class=\"shopHave\">(Have: "+player.gear.bait[name]+")</span></span><span>$"+cost.toFixed(2)+"</span>";const b=document.createElement("button");b.className="smallButton";b.textContent="Buy";b.addEventListener("click",()=>buyBait(name,amount,cost));row.appendChild(b);box.appendChild(row);});
  const tackleTitle=document.createElement("div");tackleTitle.className="shopSectionTitle";tackleTitle.textContent="TACKLE";box.appendChild(tackleTitle);box.appendChild(makeTackleShopRow(tackleItems.basic_tackle_kit));
  const rodTitle=document.createElement("div");rodTitle.className="shopSectionTitle";rodTitle.textContent="RODS";box.appendChild(rodTitle);Object.values(rods).forEach(r=>box.appendChild(makeGearShopRow("rod",r)));
  const reelTitle=document.createElement("div");reelTitle.className="shopSectionTitle";reelTitle.textContent="REELS";box.appendChild(reelTitle);Object.values(reels).forEach(r=>box.appendChild(makeGearShopRow("reel",r)));
  const bookTitle=document.createElement("div");bookTitle.className="shopSectionTitle";bookTitle.textContent="BOOKS";box.appendChild(bookTitle);Object.values(books).forEach(book=>box.appendChild(makeBookShopRow(book)));
  shopInventory.appendChild(box);
}
function makeTackleShopRow(item){
  const row=document.createElement("div");row.className="shopRow";const label=document.createElement("span");label.innerHTML=item.name+'<div class="shopNote">'+item.note+"</div>";const price=document.createElement("span");price.textContent="$"+item.cost.toFixed(2);const b=document.createElement("button");b.className="smallButton";
  if(player.gear.tackleKit){b.textContent="Owned";b.disabled=true;}else{b.textContent="Buy";b.disabled=player.money<item.cost;b.addEventListener("click",buyTackleKit);}row.append(label,price,b);return row;
}
function buyTackleKit(){const item=tackleItems.basic_tackle_kit;if(player.gear.tackleKit||player.money<item.cost)return;player.money-=item.cost;player.gear.tackleKit=true;const loc=locations[world.location];if(!loc.availableDepths.includes(player.selectedDepth))player.selectedDepth=loc.availableDepths[0];addLog("buy","Bought "+item.name+" for $"+item.cost.toFixed(2)+".");updateDisplays();renderGearInventory();renderShopInventory();updateDepthDisplay();saveGame();}
function makeGearShopRow(type,item){
  const row=document.createElement("div");row.className="shopRow";const label=document.createElement("span");label.innerHTML=item.name+'<div class="shopNote">'+item.note+"</div>";const price=document.createElement("span");price.textContent="$"+item.cost.toFixed(2);const b=document.createElement("button");b.className="smallButton";
  const owned=type==="rod"?player.gear.ownedRods.includes(item.id):player.gear.ownedReels.includes(item.id);const equipped=player.gear[type]===item.id;if(equipped){b.textContent="Equipped";b.disabled=true;}else if(owned){b.textContent="Equip";b.addEventListener("click",()=>equipGear(type,item.id));}else{b.textContent="Buy";b.disabled=player.money<item.cost;b.addEventListener("click",()=>buyGear(type,item.id));}row.append(label,price,b);return row;
}
function buyGear(type,id){const item=type==="rod"?rods[id]:reels[id];if(!item||player.money<item.cost)return;player.money-=item.cost;(type==="rod"?player.gear.ownedRods:player.gear.ownedReels).push(id);player.gear[type]=id;addLog("buy","Bought "+item.name+" for $"+item.cost.toFixed(2)+".");updateDisplays();renderGearInventory();renderShopInventory();saveGame();}
function equipGear(type,id){const list=type==="rod"?player.gear.ownedRods:player.gear.ownedReels;if(!list.includes(id))return;player.gear[type]=id;updateDisplays();renderGearInventory();renderShopInventory();saveGame();}

function makeBookShopRow(book){
  const row=document.createElement("div");row.className="shopRow";const label=document.createElement("span");label.innerHTML=book.name+'<div class="shopNote">'+book.note+"</div>";const price=document.createElement("span");price.textContent="$"+book.cost.toFixed(2);const b=document.createElement("button");b.className="smallButton";
  if(player.books.includes(book.id)){b.textContent="Read";b.disabled=true;}else{b.textContent="Buy";b.disabled=player.money<book.cost;b.addEventListener("click",()=>buyBook(book.id));}
  row.append(label,price,b);return row;
}
function hasBook(id){return player.books.includes(id);}
function knowsTechnique(id){return (player.meta.learnedTechniques||[]).includes(id);}
function learnTechnique(id){if(!player.meta.learnedTechniques)player.meta.learnedTechniques=[];if(!player.meta.learnedTechniques.includes(id))player.meta.learnedTechniques.push(id);}
function buyBook(id){const book=books[id];if(!book||player.books.includes(id)||player.money<book.cost)return;player.money-=book.cost;player.books.push(id);if(id==="playing_the_fish")learnTechnique("hold_pressure");if(id==="advanced_freshwater"||id==="advanced_saltwater")learnTechnique("twitch");gainObsession(0.5,"buying fishing books");addLog("buy","Bought "+book.name+" for $"+book.cost.toFixed(2)+".");shopMessage.textContent="You add "+book.name+" to your shelf.";updateDisplays();renderShopInventory();renderLocationTabs();saveGame();}
function fishIsKnown(fish){return player.catchHistory.some(c=>c.speciesId===fish.id)||hasBook("visual_guide_maine_fish");}
function hasPracticalGuide(fish){return hasBook(fish.waterType==="freshwater"?"freshwater_practical":"saltwater_practical");}
function hasFindingGuide(fish){return hasBook(fish.waterType==="freshwater"?"finding_freshwater":"finding_saltwater");}
function hasAdvancedGuide(fish){return hasBook(fish.waterType==="freshwater"?"advanced_freshwater":"advanced_saltwater");}
function buyBait(name,amount,cost){ if(player.money<cost){shopMessage.textContent="You don't have enough money.";return;}player.money-=cost;player.gear.bait[name]+=amount;addLog("buy","Bought "+amount+" "+name+"s for $"+cost.toFixed(2)+".");updateDisplays();renderGearInventory();renderShopInventory();saveGame(); }

function updateInventoryDisplay(){ const totalWeight=player.inventory.reduce((s,f)=>s+f.weight,0),totalValue=player.inventory.reduce((s,f)=>s+f.baseValue,0);inventoryCountDisplay.textContent=player.inventory.length;inventoryLimitDisplay.textContent=getInventoryLimit();totalWeightDisplay.textContent=totalWeight.toFixed(2);totalValueDisplay.textContent=totalValue.toFixed(2);renderCreel();renderMarketInventory(); }
function renderCreel(){ creel.innerHTML="";if(!player.inventory.length){creel.innerHTML='<div class="empty">Your creel is empty.</div>';return;}for(const fish of player.inventory){const row=document.createElement("div");row.className="inventoryEntry";const d=document.createElement("span");d.textContent=fish.name+" — "+fish.weight.toFixed(2)+" lb";const v=document.createElement("span");v.className="fishValue";v.textContent="$"+fish.baseValue.toFixed(2);const b=document.createElement("button");b.className="smallButton";b.textContent="Release";b.disabled=state!=="ready"&&state!=="finished";b.addEventListener("click",()=>releaseFish(fish.id));row.append(d,v,b);creel.appendChild(row);} }
function renderMarketInventory(){ marketInventory.innerHTML="";if(!player.inventory.length){marketInventory.innerHTML='<div class="inventoryBox"><div class="empty">Your creel is empty.</div></div>';sellAllButton.disabled=true;return;}sellAllButton.disabled=false;const box=document.createElement("div");box.className="inventoryBox";for(const fish of player.inventory){const row=document.createElement("div");row.className="inventoryEntry";const d=document.createElement("span");d.textContent=fish.name+" — "+fish.weight.toFixed(2)+" lb";const v=document.createElement("span");v.className="fishValue";v.textContent="$"+fish.baseValue.toFixed(2);const b=document.createElement("button");b.className="smallButton";b.textContent="Sell";b.addEventListener("click",()=>sellFish(fish.id));row.append(d,v,b);box.appendChild(row);}marketInventory.appendChild(box); }
function releaseFish(id){const fish=player.inventory.find(f=>f.id===id);if(!fish)return;fish.status="released";player.inventory=player.inventory.filter(f=>f.id!==id);addLog("catch","Released "+fish.name+" — "+fish.weight.toFixed(2)+" lb.");message.textContent="You release the "+fish.name+".";updateInventoryDisplay();updateTimeControls();saveGame();}
function sellFish(id){const fish=player.inventory.find(f=>f.id===id);if(!fish)return;player.money+=fish.baseValue;fish.status="sold";player.inventory=player.inventory.filter(f=>f.id!==id);addLog("sale","Sold "+fish.name+" for $"+fish.baseValue.toFixed(2)+".");marketMessage.textContent="Sold "+fish.name+" for $"+fish.baseValue.toFixed(2)+".";updateDisplays();updateInventoryDisplay();renderGearInventory();saveGame();}
function sellAllFish(){if(!player.inventory.length)return;let total=0;const count=player.inventory.length;for(const f of player.inventory){total+=f.baseValue;f.status="sold";}player.money+=total;player.inventory=[];addLog("sale","Sold "+count+" fish for $"+total.toFixed(2)+".");marketMessage.textContent="You sell your catch for $"+total.toFixed(2)+".";updateDisplays();updateInventoryDisplay();renderGearInventory();saveGame();}

function openJournal(){
  if(state!=="ready"&&state!=="finished")return;
  pierPanel.style.display="none";marketPanel.style.display="none";shopPanel.style.display="none";journalPanel.style.display="block";topNav.style.display="none";locationTitle.textContent="Fishin': Fishing Journal";renderJournal();
}
function closeJournal(){
  journalPanel.style.display="none";pierPanel.style.display="block";topNav.style.display="flex";refreshLocationUI();resetFishing();startEnvironmentAnimations();
}
const journalSectionOpen={freshwater:true,saltwater:false};

function renderJournal(selectedId){
  journalSpecies.innerHTML="";
  const caughtFish=fishTypes.find(f=>player.catchHistory.some(c=>c.speciesId===f.id));
  const initial=selectedId||caughtFish?.id||fishTypes[0].id;
  const selectedFish=fishTypes.find(f=>f.id===initial);
  if(selectedFish) journalSectionOpen[selectedFish.waterType]=true;

  for(const waterType of ["freshwater","saltwater"]){
    const sectionFish=fishTypes.filter(f=>f.waterType===waterType);
    const title=document.createElement("button");
    title.type="button";
    title.className="journalSectionTitle";
    title.textContent=(journalSectionOpen[waterType]?"▾ ":"▸ ")+(waterType==="freshwater"?"FRESHWATER":"SALTWATER");
    title.setAttribute("aria-expanded",journalSectionOpen[waterType]?"true":"false");
    title.addEventListener("click",()=>{journalSectionOpen[waterType]=!journalSectionOpen[waterType];renderJournal(initial);});
    journalSpecies.appendChild(title);

    if(!journalSectionOpen[waterType]) continue;

    for(const fish of sectionFish){
      const catches=player.catchHistory.filter(c=>c.speciesId===fish.id);
      const known=fishIsKnown(fish);
      const hasTrophy=catches.some(c=>c.trophy);
      const b=document.createElement("button");
      b.className=fish.id===initial?"active":"";
      b.textContent=(known?fish.name:"???")+(known?"  ("+catches.length+")":"")+(hasTrophy?"  🏆":"");
      b.addEventListener("click",()=>renderJournal(fish.id));
      journalSpecies.appendChild(b);
    }
  }
  renderJournalEntry(initial);
}
function renderJournalEntry(fishId){
  const fish=fishTypes.find(f=>f.id===fishId);if(!fish)return;
  const caught=player.catchHistory.filter(c=>c.speciesId===fish.id);
  const known=fishIsKnown(fish);
  const largest=known?Math.max(...caught.map(c=>c.weight)):null;
  const allTime=player.meta.allTimeBests?.[fish.id]||null;
  const caughtLocations=[...new Set(caught.map(c=>locations[c.location]?.name||c.location).filter(Boolean))];
  const guideLocations=Object.entries(locationFishWeights).filter(([,weights])=>(weights[fish.id]||0)>0).map(([id])=>locations[id]?.name||id);
  const unknown='<span class="journalUnknown">???</span>';
  const preferredBait=Object.entries(fish.baitPreferences).sort((a,b)=>b[1]-a[1])[0]?.[0]||"?";
  const times=Object.entries(fish.timePreferences||{}).sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>x[0]).join(", ");
  const depths=Object.entries(fish.depthPreferences||{}).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).map(([d])=>DEPTH_LABELS[d]).join(", ");
  const trophies=caught.filter(c=>c.trophy).length;

  if(!known){
    journalEntry.innerHTML=[
      '<div class="journalName">???</div>',
      '<div class="journalStat"><span class="journalLabel">Water</span>'+(fish.waterType==="freshwater"?"Freshwater":"Saltwater")+'</div>',
      '<div class="journalStat"><span class="journalLabel">Caught</span>0</div>',
      '<div class="journalStat"><span class="journalLabel">Largest this run</span>—</div>',
      '<div class="journalStat"><span class="journalLabel">All-Time Best</span>'+(allTime?allTime.toFixed(2)+' lb':'—')+'</div>',
      '<div class="journalStat"><span class="journalLabel">Weight</span>'+unknown+'</div>',
      '<div class="journalStat"><span class="journalLabel">Depth</span>'+unknown+'</div>',
      '<div class="journalStat"><span class="journalLabel">Best bait</span>'+unknown+'</div>',
      '<div class="journalStat"><span class="journalLabel">Seasons</span>'+unknown+'</div>',
      '<div class="journalStat"><span class="journalLabel">Weather</span>'+unknown+'</div>',
      '<div class="journalStat"><span class="journalLabel">Best times</span>'+unknown+'</div>',
      '<div class="journalStat"><span class="journalLabel">Bite behavior</span>'+unknown+'</div>',
      '<div class="journalFishCopy"></div>'
    ].join("");
    return;
  }

  journalEntry.innerHTML=[
    '<div class="journalName">'+fish.name+(trophies?' <span class="trophyIcon" title="Trophy caught">🏆</span>':'')+'</div>',
    '<div class="journalStat"><span class="journalLabel">Water</span>'+(fish.waterType==="freshwater"?"Freshwater":"Saltwater")+'</div>',
    '<div class="journalStat"><span class="journalLabel">Caught</span>'+caught.length+'</div>',
    '<div class="journalStat"><span class="journalLabel">Largest this run</span>'+(largest?largest.toFixed(2)+' lb':'—')+'</div>',
    '<div class="journalStat"><span class="journalLabel">All-Time Best</span>'+(allTime?allTime.toFixed(2)+' lb':'—')+'</div>',
    '<div class="journalStat"><span class="journalLabel">Trophies</span>'+trophies+'</div>',
    '<div class="journalStat"><span class="journalLabel">Seen at</span>'+(hasFindingGuide(fish)?guideLocations.join(", "):(caughtLocations.length?caughtLocations.join(", "):unknown))+'</div>',
    '<div class="journalStat"><span class="journalLabel">Weight</span>'+(hasPracticalGuide(fish)?fish.minWeight.toFixed(1)+'–'+fish.maxWeight.toFixed(1)+' lb':unknown)+'</div>',
    '<div class="journalStat"><span class="journalLabel">Depth</span>'+(hasFindingGuide(fish)?depths:unknown)+'</div>',
    '<div class="journalStat"><span class="journalLabel">Best bait</span>'+(hasPracticalGuide(fish)?preferredBait:unknown)+'</div>',
    '<div class="journalStat"><span class="journalLabel">Seasons</span>'+(hasPracticalGuide(fish)?fish.seasonPreferences.join(", "):unknown)+'</div>',
    '<div class="journalStat"><span class="journalLabel">Weather</span>'+(hasFindingGuide(fish)?fish.weatherPreferences.join(", "):unknown)+'</div>',
    '<div class="journalStat"><span class="journalLabel">Best times</span>'+(hasFindingGuide(fish)?(times||"Varied"):unknown)+'</div>',
    '<div class="journalStat"><span class="journalLabel">Bite behavior</span>'+(hasAdvancedGuide(fish)?describeNibbleBehavior(fish):unknown)+'</div>',
    '<div class="journalFishCopy"></div>'
  ].join("");
}
function describeNibbleBehavior(fish){const b=fish.nibbleBehavior;if(b.leaveChance===0)return "Eager. Unlikely to leave once interested.";if(b.biteChance<0.45)return "Cautious. Twitching can help, but overdoing it may spook the fish.";return "Moderately cautious. Additional nibbles improve your chances.";}

const SKY_WIDTH=44;
const SKY_HEIGHT=5;
const waterFrames={1:["~~~~~       ~~~~~       ~~~~","~~~~       ~~~~~~       ~~~~","~~~~~       ~~~~       ~~~~~"],2:["~~~~   ~~~~~   ~~~~   ~~~~","~~~   ~~~~   ~~~~~~   ~~~~","~~~~~   ~~~   ~~~~   ~~~~~"],3:["~~≈~~~  ~~~~≈~~  ~~~~~","~~~~≈~~  ~~≈~~~  ~~~~","~~≈~~~  ~~~~  ~~≈~~~~"],4:["~≈~~^~~≈~~~^~~~~≈~~","~~^~~~≈~~^~~≈~~~~^~","≈~~~^~~~~≈~~^~~~≈~~","~~≈~^~~~≈~~~~^~~≈~~"]};
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
  [" .--. ",":##  :",":##  :"," '--' "]
];
function getMoonArt(){return SMALL_MOONS[(Math.max(1,world.seasonDay)-1)%SMALL_MOONS.length];}
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
  const drift=(skyFrame%6)-2;
  const base=Math.max(1,Math.min(SKY_WIDTH-14,18+drift));
  stampSky(grid,1,base,"   .--.");stampSky(grid,2,base-2,".-(    ).");stampSky(grid,3,base-3,"(_________)");
  if(name==="Light Rain"||name==="Rain"||name==="Heavy Rain"){
    const drops=name==="Light Rain"?"   '   '  ":name==="Rain"?" ' ' ' ' ":"'' '' '' ''";stampSky(grid,4,base-2,drops);
  }
}
function renderSky(){const grid=blankSky();renderCelestial(grid);renderWeatherOverlay(grid);sky.textContent=grid.map(r=>r.join("").replace(/\s+$/,"" )).join("\n");}
function startEnvironmentAnimations(){stopEnvironmentAnimations();skyFrame=0;waterFrame=0;renderSky();renderWater();animateSky();animateWater();}
function stopEnvironmentAnimations(){clearTimeout(skyAnimationTimer);clearTimeout(waterAnimationTimer);}
function animateSky(){skyAnimationTimer=setTimeout(()=>{if(pierPanel.style.display!=="none"){skyFrame=(skyFrame+1)%12;renderSky();}animateSky();},900);}
function renderWater(){const motion=world.weather?.waterMotion||1;const frames=waterFrames[motion]||waterFrames[1];water.textContent=frames[waterFrame%frames.length];}
function animateWater(){const motion=world.weather?.waterMotion||1;const speeds={1:900,2:550,3:300,4:160};waterAnimationTimer=setTimeout(()=>{if(pierPanel.style.display!=="none"){const frames=waterFrames[motion]||waterFrames[1];waterFrame=(waterFrame+1)%frames.length;renderWater();}animateWater();},speeds[motion]||900);}

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

fishButton.addEventListener("click",handleMainButton);pullUpButton.addEventListener("click",handleSecondaryFishingButton);sleepButton.addEventListener("click",()=>{world.period==="Night"?goToSleep():catchUpSleep();});quitJobButton.addEventListener("click",quitJob);journalButton.addEventListener("click",openJournal);journalReturnButton.addEventListener("click",closeJournal);marketButton.addEventListener("click",()=>goToLocation("market"));shopButton.addEventListener("click",()=>goToLocation("shop"));marketReturnButton.addEventListener("click",returnToFishing);shopReturnButton.addEventListener("click",returnToFishing);sellAllButton.addEventListener("click",sellAllFish);
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
  if((e.key==="w"||e.key==="W")&&isWorkDue()){keyboardActivate(fishButton);return;}
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
debugSeasonSelect.addEventListener("change",()=>{const s=debugSeasonSelect.value;if(!s)return;world.season=s;world.seasonIndex=seasons.indexOf(s);world.seasonDay=1;world.period="Morning";world.timeUnits=0;world.nightFishing=false;generateSeasonWeather();debugSeasonSelect.value="";resetFishing();refreshLocationUI();startEnvironmentAnimations();saveGame();});

setInterval(()=>{document.querySelectorAll(".lineDot").forEach(dot=>{Math.random()<.18?dot.classList.add("dim"):dot.classList.remove("dim");});},180);

inventoryLimitDisplay.textContent=getInventoryLimit();
const loadedSave=loadGame();
if(!loadedSave){generateSeasonWeather();addLog("world","Spring, Day 1 begins.");addLog("world",describeWeather());}else ensureSeasonWeather();
state="ready";
refreshLocationUI();updateDisplays();updateInventoryDisplay();renderGearInventory();renderShopInventory();resetFishing();startEnvironmentAnimations();
if(!world.introSeen) showIntroStep(1);
setInterval(saveGame,5000);
