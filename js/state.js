// Fishin' — state.js

const world = {
  location:"fishing_hole",
  seasonIndex:0,
  season:"Spring",
  seasonDay:1,
  year:1,
  introSeen:false,
  period:"Morning",
  timeUnits:0,
  nightFishing:false,
  seasonsCompleted:0,
  weather:null,
  weatherSeason:null,
  unlockedLocations:["fishing_hole","lazy_brook","big_lake","old_pier","coastal_waters","dads_island"]
};

const player = {
  money:0,
  gear:{
    rod:"old_rod",
    reel:"old_reel",
    vehicle:"old_truck",
    vehicleRepaired:false,
    ownedRods:["old_rod"],
    ownedReels:["old_reel"],
    bait:{ Worm:12, Minnow:0, Insect:0, Grub:0, Shrimp:0, Squid:0, Crab:0, "Cut Bait":0 },
    lockedBox:true,
    tackleKit:false, // legacy save migration only
    ownedTackle:[],
    boatReady:false,
    truckCreels:0
  },
  selectedBait:"Worm",
  selectedDepth:"random",
  inventory:[],
  catchHistory:[],
  baseInventoryLimit:10,
  books:[],
  fishKnowledge:{},
  job:{ employed:true },
  meta:{ obsession:0, hasAmulet:false, obsessionMilestones:[], allTimeBests:{}, learnedTechniques:[] },
  condition:{ fatigue:0, nightsSkipped:0 }
};

const FISH_KNOWLEDGE_FIELDS = [
  "name","waterType","weight","trophyWeight","rarity","locations",
  "depth","bait","seasons","weather","time","behavior"
];

function ensureFishKnowledge(fishId){
  if(!player.fishKnowledge || typeof player.fishKnowledge!=="object") player.fishKnowledge={};
  if(!player.fishKnowledge[fishId] || typeof player.fishKnowledge[fishId]!=="object") player.fishKnowledge[fishId]={};
  const knowledge=player.fishKnowledge[fishId];
  for(const field of FISH_KNOWLEDGE_FIELDS){ if(typeof knowledge[field]!=="boolean") knowledge[field]=(field==="waterType"); }
  return knowledge;
}
function knowsFishKnowledge(fishId,field){ return !!ensureFishKnowledge(fishId)[field]; }
function learnFishKnowledge(fishId,fields){
  const knowledge=ensureFishKnowledge(fishId);
  for(const field of (Array.isArray(fields)?fields:[fields])){ if(FISH_KNOWLEDGE_FIELDS.includes(field)) knowledge[field]=true; }
}
function learnFishKnowledgeForWaterType(waterType,fields){
  for(const fish of fishTypes){ if(fish.waterType===waterType) learnFishKnowledge(fish.id,fields); }
}
function learnAllFishKnowledge(fields){ for(const fish of fishTypes) learnFishKnowledge(fish.id,fields); }

const gameLogEntries = [];
let logIdCounter = 0;

let state = "ready";
let lineDepth = 0;
let currentFish = null;
let currentWeight = 0;
let currentDepth = null;
let currentEncounterType = null;
let currentJunk = null;
let currentOffDepth = false;
let debugInstantTravel = false;
let debugFightMeters = false;
let debugFishStats = false;
let debugSpecifyFish = false;
let debugForcedFishId = null;
let debugWeightClass = 2;
let debugLastFightCheck = "—";
let debugLastContinueCheck = "—";
let nibbleDepth = 0;
let lineTimer = null;
let nibbleTimer = null;
let biteTimer = null;
let resetTimer = null;
let fightTimer = null;
let disturbanceTimer = null;
let catchIdCounter = 0;

const CAST_DEPTH = 5;
const MIN_NIBBLE_TIME = 1800;
const MAX_NIBBLE_TIME = 4500;
const NIBBLE_PAUSE_MIN = 800;
const NIBBLE_PAUSE_MAX = 1600;
const TWITCH_BITE_WINDOW = 1200;

let nibbleCount = 0;
let disturbance = 0;
let lastNibbleAt = 0;
let fishHasLeft = false;

let tension = 0;
let fishDistance = 0;
let startingDistance = 0;
let maxFightDistance = 0;
let isReeling = false;
let isHoldingPressure = false;
let fishFighting = false;
let fightRemaining = 0;
let fightCooldown = 0;
let fishStamina = 100;
let maxFishStamina = 100;
let surgeStartStaminaPercent = 1;
let fightSwing = 0;
let fightSwingVelocity = 0;
let fightSwingTarget = 0.12;
let fightSwingTargetTimer = 0;
let fightRecoveryLeft = false;
let activeSpecialAbility = null;
let forcedSurgeMultiplier = 1;
