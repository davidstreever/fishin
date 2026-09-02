// Fishin' — data.js

const DAY_PERIOD_UNITS = 4;
const NIGHT_UNITS = 7;
const DAYS_PER_SEASON = 7;
const WORKDAYS_PER_SEASON = 5;
const seasons = ["Spring", "Summer", "Fall"];

const DEPTHS = ["shallow", "mid", "deep"];
const DEPTH_LABELS = { shallow:"Shallow", mid:"Mid", deep:"Deep" };
const TARGET_DEPTH_ACCURACY = { surface_float:0.95, split_shot_kit:0.85, egg_sinker:0.95, adjustable_dual_diver:1.00 };

const locations = {
  fishing_hole: {
    id:"fishing_hole", name:"The Fishing Hole", waterType:"freshwater",
    description:"Freshwater. Easy access. Too many anglers.",
    availableDepths:["shallow","mid"], starterDepthOdds:{shallow:0.80,mid:0.20},
    encounterRates:{fish:0.80,nothing:0.15,junk:0.05},
    requiresTruck:false, requiresBoat:false, storyLocked:false
  },
  lazy_brook: {
    id:"lazy_brook", name:"Lazy Brook", waterType:"freshwater",
    description:"A narrow, shaded brook away from town.",
    availableDepths:["shallow"], starterDepthOdds:{shallow:1.00},
    encounterRates:{fish:0.85,nothing:0.12,junk:0.03},
    requiresTruck:true, requiresBoat:false, storyLocked:false
  },
  big_lake: {
    id:"big_lake", name:"Big Lake", waterType:"freshwater",
    description:"Open water, deeper holes, and room for bigger fish.",
    availableDepths:["shallow","mid","deep"], starterDepthOdds:{shallow:0.65,mid:0.25,deep:0.10},
    encounterRates:{fish:0.89,nothing:0.10,junk:0.01},
    requiresTruck:true, requiresBoat:false, storyLocked:false
  },
  old_pier: {
    id:"old_pier", name:"The Old Pier", waterType:"saltwater",
    description:"Weathered boards over cold salt water.",
    availableDepths:["shallow"], starterDepthOdds:{shallow:1.00},
    encounterRates:{fish:0.80,nothing:0.15,junk:0.05},
    requiresTruck:true, requiresBoat:false, storyLocked:false
  },
  coastal_waters: {
    id:"coastal_waters", name:"Coastal Waters", waterType:"saltwater",
    description:"Open coastal water beyond the harbor.",
    availableDepths:["shallow","mid","deep"], starterDepthOdds:{shallow:0.60,mid:0.30,deep:0.10},
    encounterRates:{fish:0.85,nothing:0.12,junk:0.03},
    requiresTruck:true, requiresBoat:true, storyLocked:false
  },
  dads_island: {
    id:"dads_island", name:"Dad's Island", waterType:"saltwater",
    description:"A remote island beside a steep drop into deep water.",
    availableDepths:["deep"], starterDepthOdds:{deep:1.00},
    encounterRates:{fish:0.75,nothing:0.20,junk:0.05},
    requiresTruck:true, requiresBoat:true, storyLocked:true
  }
};

// Baseline species shares among successful fish encounters. Conditions and depth modify these.
const locationFishWeights = {
  fishing_hole:{ pumpkinseed:38, yellow_perch:30, chain_pickerel:10, brook_trout:3, smallmouth_bass:9, largemouth_bass:9, white_perch:1 },
  lazy_brook:{ pumpkinseed:24, yellow_perch:25, chain_pickerel:22, brook_trout:20, smallmouth_bass:10, largemouth_bass:4, white_perch:4, landlocked_salmon:0.5, lake_trout:0.25, cusk_fresh:0.5, arctic_charr:0.05 },
  big_lake:{ pumpkinseed:10, yellow_perch:20, chain_pickerel:10, brook_trout:3, smallmouth_bass:14, largemouth_bass:12, white_perch:14, landlocked_salmon:9, lake_trout:8, cusk_fresh:7, arctic_charr:0.25 },
  old_pier:{ atlantic_mackerel:50, winter_flounder:30, striped_bass:5, bluefish:5, pollock:7, atlantic_herring:3 },
  coastal_waters:{ atlantic_mackerel:16, winter_flounder:12, striped_bass:9.5, bluefish:5, pollock:11.5, atlantic_herring:11.5, haddock:12.8, atlantic_cod:9.7, atlantic_wolffish:4.8, cusk_salt:5, atlantic_halibut:2, bluefin_tuna:0.2 },
  dads_island:{ pollock:12, haddock:30, atlantic_cod:27, atlantic_wolffish:4, cusk_salt:20, atlantic_halibut:6, bluefin_tuna:1 }
};

const rods = {
  old_rod:{id:"old_rod",name:"Old Rod",cost:0,tensionMultiplier:1.00,note:"Cheap, dependable. Not built for monsters."},
  fiberglass_rod:{id:"fiberglass_rod",name:"Fiberglass Rod",cost:35,tensionMultiplier:0.90,note:"Tough and forgiving under pressure."},
  graphite_rod:{id:"graphite_rod",name:"Graphite Rod",cost:110,tensionMultiplier:0.78,note:"Light, strong, and responsive."},
  boron_rod:{id:"boron_rod",name:"Boron Rod",cost:325,tensionMultiplier:0.65,note:"For serious anglers."}
};

const reels = {
  old_reel:{id:"old_reel",name:"Old Reel",cost:0,reelPower:1.00,note:"It works."},
  aluminum_reel:{id:"aluminum_reel",name:"Aluminum Reel",cost:25,reelPower:1.10,note:"A smoother, stronger reel."},
  carbon_reel:{id:"carbon_reel",name:"Carbon Reel",cost:85,reelPower:1.25,note:"Lightweight and precise."},
  titanium_reel:{id:"titanium_reel",name:"Titanium Reel",cost:250,reelPower:1.45,note:"The best money can buy."}
};

const vehicles = {
  old_truck:{id:"old_truck",name:"Broken Old Truck",repairedName:"Old Truck",repairCost:50,creelBonus:0,travelModifier:1.0,note:"Rusty, loud, and currently going nowhere."}
};

const tackleItems = {
  surface_float:{
    id:"surface_float",name:"Surface Float",cost:8,targetDepth:"shallow",
    note:"A simple float that keeps your bait in shallow water."
  },
  split_shot_kit:{
    id:"split_shot_kit",name:"Split-Shot Kit",cost:15,targetDepth:"mid",
    note:"These sinkers will let you fish in slightly deeper waters."
  },
  egg_sinker:{
    id:"egg_sinker",name:"Egg Sinker",cost:25,targetDepth:"deep",
    note:"These weights will let you fish the bottoms."
  },
  adjustable_dual_diver:{
    id:"adjustable_dual_diver",name:"Adjustable Dual Diver",cost:75,targetDepth:"any",
    note:"This advanced fishing tackle lets you quickly change the depth your line will sink to."
  }
};

const books = {
  maine_fishing_atlas:{id:"maine_fishing_atlas",name:"Maine Fishing Atlas",cost:12,note:"Maps and directions to fishing waters around the state."},
  visual_guide_maine_fish:{id:"visual_guide_maine_fish",name:"A Visual Guide to Maine Fish",cost:8,note:"Names and illustrations of Maine freshwater and saltwater fish."},
  freshwater_practical:{id:"freshwater_practical",name:"Freshwater Fishing: A Practical Guide",cost:25,note:"Basic freshwater sizes, seasons, and bait preferences."},
  saltwater_practical:{id:"saltwater_practical",name:"Saltwater Fishing: A Practical Guide",cost:25,note:"Basic saltwater sizes, seasons, and bait preferences."},
  finding_freshwater:{id:"finding_freshwater",name:"Finding Maine's Freshwater Fish",cost:55,note:"Where and when to look for freshwater species."},
  finding_saltwater:{id:"finding_saltwater",name:"Finding Maine's Saltwater Fish",cost:55,note:"Where and when to look for saltwater species."},
  advanced_freshwater:{id:"advanced_freshwater",name:"Advanced Freshwater Angling",cost:110,note:"Feeding behavior, twitching, and bite timing in freshwater."},
  advanced_saltwater:{id:"advanced_saltwater",name:"Advanced Saltwater Angling",cost:110,note:"Feeding behavior, twitching, and bite timing in saltwater."},
  playing_the_fish:{id:"playing_the_fish",name:"Playing the Fish",cost:45,note:"How to hold pressure when a fish makes a run."},
  reading_the_line:{id:"reading_the_line",name:"Reading the Line",cost:40,note:"How to judge what may be on the other end of your line."}
};

const junkItems = [
  {id:"waterlogged_boot",name:"Waterlogged Boot"},
  {id:"rusted_can",name:"Rusted Can"},
  {id:"tangled_line",name:"Tangled Fishing Line"},
  {id:"old_bottle",name:"Old Bottle"},
  {id:"waterlogged_glove",name:"Waterlogged Glove"}
];

const specialAbilities = {
  feint:{id:"feint",name:"Feint",triggerChance:0.40,followupSurgeMultiplier:1.65,restDuration:1.30,restTarget:-0.21},
  last_gasp:{id:"last_gasp",name:"Last Gasp",threshold:0.25},
  quick_recovery:{id:"quick_recovery",name:"Quick Recovery",threshold:0.45,recoveryFraction:0.25,chance:0.45},
  quick_reaction:{id:"quick_reaction",name:"Quick Reaction",chance:0.98}
};
function fishDef(id,name,waterType,minWeight,maxWeight,trophyWeight,valuePerPound,fightPower,depthPreferences,rarity,baitPreferences,weatherPreferences,seasonPreferences,timePreferences,nibbleBehavior,hookWindow=1800,specialAbilityIds=[]){
  return {id,name,waterType,minWeight,maxWeight,trophyWeight,valuePerPound,fightPower,depthPreferences,rarity,baitPreferences,weatherPreferences,seasonPreferences,timePreferences,nibbleBehavior,hookWindow,specialAbilities:specialAbilityIds};
}

// Nibble behavior is built from interest and nervousness. Bite chance grows with
// each nibble; raw nervousness grows separately, then rising bite commitment
// suppresses the effective chance that the fish leaves. twitchResponse is one
// species-level sensitivity value: 1.0 doubles the normal bite-growth reward
// from a well-timed Twitch and halves raw nervousness on the next check.
const veryEager={baseBite:0.82,biteGrowth:0.18,baseNervousness:0.02,nervousnessGrowth:0.02,twitchResponse:0.30};
const eager={baseBite:0.72,biteGrowth:0.18,baseNervousness:0.03,nervousnessGrowth:0.03,twitchResponse:0.40};
const normalNibble={baseBite:0.55,biteGrowth:0.15,baseNervousness:0.10,nervousnessGrowth:0.06,twitchResponse:0.60};
const reluctant={baseBite:0.30,biteGrowth:0.11,baseNervousness:0.25,nervousnessGrowth:0.12,twitchResponse:0.90};
const brookTroutNibble={baseBite:0.10,biteGrowth:0.10,baseNervousness:0.35,nervousnessGrowth:0.20,twitchResponse:1.00};
const cautious={baseBite:0.38,biteGrowth:0.12,baseNervousness:0.15,nervousnessGrowth:0.08,twitchResponse:0.70};
const veryCautious={baseBite:0.28,biteGrowth:0.10,baseNervousness:0.20,nervousnessGrowth:0.10,twitchResponse:0.80};

const dayTimes={Dawn:1.20,"Early Morning":1.15,"Mid Morning":1.0,"Late Morning":0.95,Noon:0.85,"Early Afternoon":0.9,"Late Afternoon":1.0,"Early Evening":1.15,Twilight:1.25,Sunset:1.10,Midnight:0.8,"Deep Night":0.7};
const nightTimes={Dawn:1.15,"Early Morning":0.8,"Mid Morning":0.75,"Late Morning":0.7,Noon:0.65,"Early Afternoon":0.7,"Late Afternoon":0.9,"Early Evening":1.05,Twilight:1.25,Sunset:1.25,Midnight:1.2,"Deep Night":1.3};
const offshoreTimes={Dawn:1.1,"Early Morning":1.0,"Mid Morning":1.0,"Late Morning":1.0,Noon:1.0,"Early Afternoon":1.0,"Late Afternoon":1.0,"Early Evening":1.05,Twilight:1.1,Sunset:1.05,Midnight:0.95,"Deep Night":0.95};

const fishTypes = [
  // Freshwater
  fishDef("pumpkinseed","Pumpkinseed","freshwater",0.15,1.25,1.05,2.20,0.55,{shallow:1.00,mid:0.20,deep:0.03},"common",{"Worm":1.8,"Minnow":0.5,"Insect":1.7,"Grub":1.4},["SUN","HOT"],["Spring","Summer"],dayTimes,veryEager,2200),
  fishDef("yellow_perch","Yellow Perch","freshwater",0.35,2.4,1.9,3.00,1.75,{shallow:0.70,mid:1.00,deep:0.35},"common",{"Worm":1.6,"Minnow":1.3,"Insect":1.4,"Grub":1.5},["SHADE","RAIN","COLD"],["Spring","Fall"],dayTimes,eager,1950,["quick_reaction"]),
  fishDef("chain_pickerel","Chain Pickerel","freshwater",1.0,7.0,5.8,4.00,2.20,{shallow:1.00,mid:0.60,deep:0.05},"uncommon",{"Worm":0.8,"Minnow":1.8,"Insect":0.5,"Grub":0.7},["SHADE","COLD"],["Spring","Fall"],dayTimes,normalNibble,1650,["feint"]),
  fishDef("brook_trout","Brook Trout","freshwater",0.3,5.5,4.2,5.50,2.30,{shallow:1.00,mid:0.50,deep:0.10},"rare",{"Worm":1.5,"Minnow":1.2,"Insect":1.7,"Grub":1.8},["SHADE","RAIN","COLD"],["Spring","Fall"],dayTimes,brookTroutNibble,1700,["quick_recovery"]),
  fishDef("smallmouth_bass","Smallmouth Bass","freshwater",0.75,8.0,6.2,5.25,2.50,{shallow:0.45,mid:1.00,deep:0.35},"common",{"Worm":1.2,"Minnow":1.7,"Insect":1.0,"Grub":1.2},["SUN","MILD"],["Summer","Fall"],dayTimes,normalNibble,1600),
  fishDef("largemouth_bass","Largemouth Bass","freshwater",1.0,8.5,7.0,5.75,2.80,{shallow:0.65,mid:1.00,deep:0.15},"common",{"Worm":1.1,"Minnow":1.8,"Insect":0.8,"Grub":1.1},["SHADE","RAIN","HOT"],["Summer","Fall"],dayTimes,cautious,1600,["last_gasp"]),
  fishDef("white_perch","White Perch","freshwater",0.3,3.5,2.8,3.25,1.10,{shallow:0.30,mid:1.00,deep:0.45},"common",{"Worm":1.5,"Minnow":1.4,"Insect":1.3,"Grub":1.3},["SHADE","MILD"],["Spring","Summer","Fall"],dayTimes,eager,1850),
  fishDef("landlocked_salmon","Landlocked Salmon","freshwater",1.0,12.0,8.5,6.50,2.50,{shallow:0.10,mid:1.00,deep:0.65},"uncommon",{"Worm":0.7,"Minnow":1.9,"Insect":1.0,"Grub":0.8},["COLD","SHADE"],["Spring","Fall"],dayTimes,cautious,1500),
  fishDef("lake_trout","Lake Trout","freshwater",1.5,25.0,16.0,6.75,2.50,{shallow:0.02,mid:0.25,deep:1.00},"uncommon",{"Worm":0.6,"Minnow":1.9,"Insect":0.6,"Grub":0.7},["COLD"],["Spring","Fall"],offshoreTimes,cautious,1450),
  fishDef("cusk_fresh","Cusk","freshwater",0.75,15.0,9.0,4.50,1.65,{shallow:0.02,mid:0.20,deep:1.00},"uncommon",{"Worm":1.2,"Minnow":1.6,"Insect":0.7,"Grub":1.0},["COLD","SHADE"],["Spring","Fall"],nightTimes,normalNibble,1700),
  fishDef("arctic_charr","Arctic Charr","freshwater",0.5,6.5,5.0,9.00,1.45,{shallow:0.01,mid:0.10,deep:1.00},"ultra_rare",{"Worm":0.9,"Minnow":1.6,"Insect":1.5,"Grub":1.2},["COLD"],["Spring","Fall"],offshoreTimes,eager,1450),

  // Saltwater
  fishDef("atlantic_mackerel","Atlantic Mackerel","saltwater",0.4,4.5,3.4,2.75,1.05,{shallow:1,mid:0.55},"common",{"Shrimp":1.2,"Squid":1.6,"Crab":0.4,"Cut Bait":1.1},["SUN","MILD"],["Spring","Summer","Fall"],dayTimes,eager,1900),
  fishDef("winter_flounder","Winter Flounder","saltwater",0.4,5.0,3.6,3.25,1.0,{shallow:1,mid:0.25},"common",{"Shrimp":1.7,"Squid":1.4,"Crab":1.3,"Cut Bait":0.8},["COLD","SHADE"],["Spring","Fall"],dayTimes,normalNibble,1900),
  fishDef("striped_bass","Striped Bass","saltwater",2.0,50.0,35.0,6.50,2.6,{shallow:1,mid:0.7},"rare",{"Shrimp":1.2,"Squid":1.3,"Crab":1.0,"Cut Bait":1.9},["SHADE","RAIN","MILD"],["Spring","Summer","Fall"],dayTimes,cautious,1400),
  fishDef("bluefish","Bluefish","saltwater",1.5,20.0,12.0,5.25,2.25,{shallow:1,mid:0.8},"uncommon",{"Shrimp":1.0,"Squid":1.4,"Crab":0.5,"Cut Bait":2.0},["SUN","MILD"],["Summer","Fall"],dayTimes,cautious,1450),
  fishDef("pollock","Pollock","saltwater",0.75,25.0,15.0,4.25,1.8,{shallow:0.2,mid:1,deep:0.8},"common",{"Shrimp":1.3,"Squid":1.6,"Crab":0.8,"Cut Bait":1.6},["COLD","MILD"],["Spring","Summer","Fall"],offshoreTimes,normalNibble,1650),
  fishDef("atlantic_herring","Atlantic Herring","saltwater",0.2,2.0,1.5,2.00,0.75,{shallow:0.55,mid:1},"common",{"Shrimp":1.2,"Squid":1.5,"Crab":0.4,"Cut Bait":0.7},["COLD","MILD"],["Spring","Fall"],dayTimes,eager,2050),
  fishDef("haddock","Haddock","saltwater",1.0,20.0,13.0,5.00,1.8,{mid:0.7,deep:1},"common",{"Shrimp":1.5,"Squid":1.5,"Crab":1.3,"Cut Bait":1.4},["COLD"],["Spring","Summer","Fall"],offshoreTimes,normalNibble,1650),
  fishDef("atlantic_cod","Atlantic Cod","saltwater",2.0,45.0,28.0,6.00,2.2,{mid:0.55,deep:1},"uncommon",{"Shrimp":1.3,"Squid":1.5,"Crab":1.6,"Cut Bait":1.8},["COLD"],["Spring","Fall"],offshoreTimes,cautious,1500),
  fishDef("atlantic_wolffish","Atlantic Wolffish","saltwater",4.0,40.0,27.0,7.50,2.4,{mid:0.3,deep:1},"rare",{"Shrimp":1.0,"Squid":1.1,"Crab":2.0,"Cut Bait":1.3},["COLD"],["Spring","Fall"],offshoreTimes,veryCautious,1350),
  fishDef("cusk_salt","Cusk","saltwater",1.5,30.0,19.0,5.25,1.9,{mid:0.3,deep:1},"common",{"Shrimp":1.2,"Squid":1.4,"Crab":1.7,"Cut Bait":1.7},["COLD"],["Spring","Summer","Fall"],nightTimes,normalNibble,1600),
  fishDef("atlantic_halibut","Atlantic Halibut","saltwater",8.0,120.0,75.0,8.00,3.2,{deep:1},"rare",{"Shrimp":1.2,"Squid":1.4,"Crab":1.6,"Cut Bait":1.9},["COLD"],["Spring","Summer","Fall"],offshoreTimes,veryCautious,1250),
  fishDef("bluefin_tuna","Bluefin Tuna","saltwater",30.0,500.0,300.0,10.00,4.5,{mid:0.1,deep:1},"ultra_rare",{"Shrimp":1.1,"Squid":1.7,"Crab":0.4,"Cut Bait":2.0},["MILD","HOT"],["Summer","Fall"],offshoreTimes,veryCautious,1100)
];

const fishFightProfiles = {
  // aggression is how often a fish chooses to fight. It is checked repeatedly.
  // staminaMultiplier controls the size of the stamina pool. Remaining stamina
  // limits how much of the fish's strength it can express.
  // staminaDrain controls how quickly active fighting exhausts the fish.
  pumpkinseed:{staminaMultiplier:0.50,aggression:0.10,staminaDrain:1.35},
  yellow_perch:{staminaMultiplier:0.82,aggression:0.58,staminaDrain:1.10},
  chain_pickerel:{staminaMultiplier:0.82,aggression:0.72,staminaDrain:0.95},
  brook_trout:{staminaMultiplier:1.10,aggression:0.68,staminaDrain:0.90},
  smallmouth_bass:{staminaMultiplier:1.22,aggression:0.88,staminaDrain:0.82},
  largemouth_bass:{staminaMultiplier:1.32,aggression:0.72,staminaDrain:0.82},
  white_perch:{staminaMultiplier:0.78,aggression:0.48,staminaDrain:1.10},
  landlocked_salmon:{staminaMultiplier:1.55,aggression:0.82,staminaDrain:0.72},
  lake_trout:{staminaMultiplier:1.65,aggression:0.38,staminaDrain:0.62},
  cusk_fresh:{staminaMultiplier:1.30,aggression:0.34,staminaDrain:0.72},
  arctic_charr:{staminaMultiplier:1.05,aggression:0.70,staminaDrain:0.88},
  atlantic_mackerel:{staminaMultiplier:0.85,aggression:0.68,staminaDrain:1.00},
  winter_flounder:{staminaMultiplier:0.75,aggression:0.18,staminaDrain:1.25},
  striped_bass:{staminaMultiplier:1.40,aggression:0.80,staminaDrain:0.70},
  bluefish:{staminaMultiplier:1.25,aggression:0.90,staminaDrain:0.76},
  pollock:{staminaMultiplier:1.10,aggression:0.62,staminaDrain:0.88},
  atlantic_herring:{staminaMultiplier:0.60,aggression:0.46,staminaDrain:1.20},
  haddock:{staminaMultiplier:1.10,aggression:0.48,staminaDrain:0.92},
  atlantic_cod:{staminaMultiplier:1.25,aggression:0.56,staminaDrain:0.82},
  atlantic_wolffish:{staminaMultiplier:1.35,aggression:0.58,staminaDrain:0.78},
  cusk_salt:{staminaMultiplier:1.18,aggression:0.42,staminaDrain:0.88},
  atlantic_halibut:{staminaMultiplier:1.60,aggression:0.50,staminaDrain:0.58},
  bluefin_tuna:{staminaMultiplier:2.00,aggression:0.94,staminaDrain:0.45}
};

for(const fish of fishTypes){
  fish.fightProfile=fishFightProfiles[fish.id] || {staminaMultiplier:1,aggression:0.55,staminaDrain:0.9};
}

const weatherDefinitions = {
  springClear:{name:"Clear",sky:"SUN",rain:false,temperature:"MILD",waterMotion:1},springColdClear:{name:"Clear",sky:"SUN",rain:false,temperature:"COLD",waterMotion:1},springCloudy:{name:"Cloudy",sky:"SHADE",rain:false,temperature:"MILD",waterMotion:2},springColdCloudy:{name:"Cloudy",sky:"SHADE",rain:false,temperature:"COLD",waterMotion:2},springLightRain:{name:"Light Rain",sky:"SHADE",rain:true,temperature:"MILD",waterMotion:3},springColdRain:{name:"Rain",sky:"SHADE",rain:true,temperature:"COLD",waterMotion:4},
  summerClear:{name:"Clear",sky:"SUN",rain:false,temperature:"HOT",waterMotion:1},summerMildClear:{name:"Clear",sky:"SUN",rain:false,temperature:"MILD",waterMotion:1},summerCloudy:{name:"Cloudy",sky:"SHADE",rain:false,temperature:"HOT",waterMotion:2},summerLightRain:{name:"Light Rain",sky:"SHADE",rain:true,temperature:"HOT",waterMotion:3},summerRain:{name:"Rain",sky:"SHADE",rain:true,temperature:"HOT",waterMotion:4},
  fallClear:{name:"Clear",sky:"SUN",rain:false,temperature:"MILD",waterMotion:1},fallColdClear:{name:"Clear",sky:"SUN",rain:false,temperature:"COLD",waterMotion:1},fallCloudy:{name:"Cloudy",sky:"SHADE",rain:false,temperature:"COLD",waterMotion:2},fallMildCloudy:{name:"Cloudy",sky:"SHADE",rain:false,temperature:"MILD",waterMotion:2},fallLightRain:{name:"Light Rain",sky:"SHADE",rain:true,temperature:"COLD",waterMotion:3},fallRain:{name:"Rain",sky:"SHADE",rain:true,temperature:"COLD",waterMotion:4}
};

const seasonalWeatherTables = {
  Spring:[{weather:"springClear",weight:20},{weather:"springColdClear",weight:10},{weather:"springCloudy",weight:25},{weather:"springColdCloudy",weight:15},{weather:"springLightRain",weight:20},{weather:"springColdRain",weight:10}],
  Summer:[{weather:"summerClear",weight:40},{weather:"summerMildClear",weight:15},{weather:"summerCloudy",weight:20},{weather:"summerLightRain",weight:15},{weather:"summerRain",weight:10}],
  Fall:[{weather:"fallClear",weight:15},{weather:"fallColdClear",weight:15},{weather:"fallCloudy",weight:30},{weather:"fallMildCloudy",weight:15},{weather:"fallLightRain",weight:15},{weather:"fallRain",weight:10}]
};
