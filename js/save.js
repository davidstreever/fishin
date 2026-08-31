// Fishin' — save.js
const SAVE_KEY = "fishinSave";
const META_SAVE_KEY = "fishinMeta";

function saveMetaProgress(){
  const meta={
    obsession:player.meta?.obsession||0,
    hasAmulet:!!player.meta?.hasAmulet,
    obsessionMilestones:[...(player.meta?.obsessionMilestones||[])],
    allTimeBests:{...(player.meta?.allTimeBests||{})},
    learnedTechniques:[...(player.meta?.learnedTechniques||[])]
  };
  localStorage.setItem(META_SAVE_KEY,JSON.stringify(meta));
}

function loadMetaProgress(){
  const raw=localStorage.getItem(META_SAVE_KEY);
  if(!raw) return;
  try{
    const meta=JSON.parse(raw);
    player.meta=Object.assign({obsession:0,hasAmulet:false,obsessionMilestones:[],allTimeBests:{},learnedTechniques:[]},player.meta||{},meta||{});
  }catch(error){ console.error("Could not load Fishin' meta save:",error); }
}

function saveGame(){
  const saveData={version:10,world,player,gameLogEntries,logIdCounter,catchIdCounter};
  localStorage.setItem(SAVE_KEY,JSON.stringify(saveData));
  saveMetaProgress();
}

function loadGame(){
  const raw=localStorage.getItem(SAVE_KEY);
  if(!raw){ loadMetaProgress(); return false; }
  try{
    const s=JSON.parse(raw);
    if(s.world) Object.assign(world,s.world);
    if(s.player){
      Object.assign(player,s.player);
      if(s.player.gear) player.gear=Object.assign({},player.gear,s.player.gear);
      if(s.player.condition) player.condition=Object.assign({fatigue:0,nightsSkipped:0},s.player.condition);
      if(s.player.job) player.job=Object.assign({employed:true},s.player.job);
      if(s.player.meta) player.meta=Object.assign({obsession:0,hasAmulet:false,obsessionMilestones:[],allTimeBests:{},learnedTechniques:[]},s.player.meta);
    }
    if(typeof player.gear.rod === "object") player.gear.rod=player.gear.rod.id||"old_rod";
    if(typeof player.gear.reel === "object") player.gear.reel=player.gear.reel.id||"old_reel";
    if(!player.gear.reel) player.gear.reel="old_reel";
    if(!player.gear.vehicle) player.gear.vehicle="old_truck";
    if(typeof player.gear.vehicleRepaired!=="boolean") player.gear.vehicleRepaired=false;
    if(!player.gear.ownedRods) player.gear.ownedRods=[player.gear.rod||"old_rod"];
    if(!player.gear.ownedReels) player.gear.ownedReels=[player.gear.reel||"old_reel"];
    player.gear.bait=Object.assign({Worm:0,Minnow:0,Insect:0,Grub:0,Shrimp:0,Squid:0,Crab:0,"Cut Bait":0},player.gear.bait||{});
    if(!Object.prototype.hasOwnProperty.call(player.gear.bait,player.selectedBait)) player.selectedBait="Worm";
    if(!player.books) player.books=[];
    const legacyBookMap={beginner_freshwater:"freshwater_practical",practical_angler:"finding_freshwater",advanced_angling:"advanced_freshwater"};
    player.books=player.books.map(id=>legacyBookMap[id]||id).filter((id,i,a)=>a.indexOf(id)===i);
    if(!player.job) player.job={employed:true};
    if(!player.meta) player.meta={obsession:0,hasAmulet:false,obsessionMilestones:[],allTimeBests:{},learnedTechniques:[]};
    if(!Array.isArray(player.meta.obsessionMilestones)) player.meta.obsessionMilestones=[];
    if(!player.meta.allTimeBests || typeof player.meta.allTimeBests!=="object") player.meta.allTimeBests={};
    if(!Array.isArray(player.meta.learnedTechniques)) player.meta.learnedTechniques=[];
    if(player.books.includes("playing_the_fish")&&!player.meta.learnedTechniques.includes("hold_pressure"))player.meta.learnedTechniques.push("hold_pressure");
    if((player.books.includes("advanced_freshwater")||player.books.includes("advanced_saltwater"))&&!player.meta.learnedTechniques.includes("twitch"))player.meta.learnedTechniques.push("twitch");
    if(!world.unlockedLocations) world.unlockedLocations=["fishing_hole","lazy_brook","big_lake","old_pier","coastal_waters","dads_island"];
    for(const id of Object.keys(locations)){ if(!world.unlockedLocations.includes(id)) world.unlockedLocations.push(id); }
    if(!world.location || !locations[world.location]) world.location="fishing_hole";
    if(typeof world.seasonsCompleted!=="number") world.seasonsCompleted=0;
    if(typeof world.year!=="number") world.year=1;
    if(typeof world.introSeen!=="boolean") world.introSeen=true;
    if(typeof player.baseInventoryLimit!=="number") player.baseInventoryLimit=player.inventoryLimit||10;
    if(typeof player.gear.tackleKit!=="boolean") player.gear.tackleKit=false;
    if(!Array.isArray(player.gear.ownedTackle)) player.gear.ownedTackle=[];
    // Preserve the capabilities of saves that bought the old one-time Basic Tackle Kit.
    if(player.gear.tackleKit){
      for(const id of ["surface_float","split_shot_kit","egg_sinker"]){ if(!player.gear.ownedTackle.includes(id))player.gear.ownedTackle.push(id); }
      player.gear.tackleKit=false;
    }
    if(typeof player.gear.boatReady!=="boolean") player.gear.boatReady=false;
    if(typeof player.gear.truckCreels!=="number") player.gear.truckCreels=0;
    player.gear.truckCreels=Math.max(0,Math.min(4,Math.floor(player.gear.truckCreels)));
    if(!player.selectedDepth || (player.selectedDepth!=="random"&&!DEPTHS.includes(player.selectedDepth))) player.selectedDepth="random";
    if(player.selectedDepth!=="random"&&!canTargetDepth(player.selectedDepth))player.selectedDepth="random";
    gameLogEntries.length=0;
    if(Array.isArray(s.gameLogEntries)) gameLogEntries.push(...s.gameLogEntries);
    logIdCounter=s.logIdCounter??0;
    catchIdCounter=s.catchIdCounter??0;
    loadMetaProgress();
    if(!player.meta.allTimeBests) player.meta.allTimeBests={};
    for(const catchRecord of player.catchHistory||[]){
      if(!catchRecord?.speciesId || typeof catchRecord.weight!=="number") continue;
      const old=player.meta.allTimeBests[catchRecord.speciesId]||0;
      if(catchRecord.weight>old) player.meta.allTimeBests[catchRecord.speciesId]=catchRecord.weight;
    }
    saveMetaProgress();
    return true;
  }catch(error){ console.error("Could not load Fishin' save:",error); loadMetaProgress(); return false; }
}

// Debug RESET is a true wipe. Future amulet prestige should use prestigeResetWithAmulet().
function deleteSave(){
  localStorage.removeItem(SAVE_KEY);
  localStorage.removeItem(META_SAVE_KEY);
  location.reload();
}

// Infrastructure for the future amulet prestige event: reset the run, keep obsession + amulet.
function prestigeResetWithAmulet(){
  player.meta.hasAmulet=true;
  saveMetaProgress();
  localStorage.removeItem(SAVE_KEY);
  location.reload();
}
