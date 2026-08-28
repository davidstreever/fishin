// Fishin' — weather.js
// Weather is generated as a saved seven-day seasonal sequence. There is no forecast UI yet.
const WEATHER_DAYPARTS=["Morning","Day","Evening","Night"];
const WEATHER_PATTERNS={
  stable:{stay:0.80,modest:0.19,major:0.01},
  unsettled:{stay:0.55,modest:0.40,major:0.05},
  front:{stay:0.30,modest:0.50,major:0.20}
};
const SEASON_WEATHER={
  Spring:{pattern:[0.42,0.38,0.20],temp:[38,62],clear:0.25,rain:0.30,windBias:1},
  Summer:{pattern:[0.62,0.28,0.10],temp:[55,82],clear:0.50,rain:0.18,windBias:0},
  Fall:{pattern:[0.42,0.35,0.23],temp:[38,68],clear:0.28,rain:0.24,windBias:1}
};
const CONDITION_ORDER=["Clear","Partly Cloudy","Cloudy","Light Rain","Rain","Heavy Rain"];
const WIND_LABELS=["Calm","Light","Moderate","Strong","Very Strong"];
function weightedIndex(weights){let r=Math.random()*weights.reduce((a,b)=>a+b,0);for(let i=0;i<weights.length;i++){r-=weights[i];if(r<=0)return i;}return weights.length-1;}
function patternForSeason(season){const i=weightedIndex(SEASON_WEATHER[season].pattern);return ["stable","unsettled","front"][i];}
function tempCategory(f){if(f<47)return "COLD";if(f<57)return "COOL";if(f<69)return "MILD";if(f<78)return "WARM";return "HOT";}
function conditionToTags(name){const rain=["Light Rain","Rain","Heavy Rain"].includes(name);return {sky:name==="Clear"?"SUN":"SHADE",rain};}
function waterMotionFor(windLevel,rain){return Math.max(1,Math.min(4,1+Math.floor(windLevel/2)+(rain?1:0)));}
function makeWeatherState(name,tempF,windLevel,pattern){const tags=conditionToTags(name);return {name,sky:tags.sky,rain:tags.rain,temperature:tempCategory(tempF),temperatureF:Math.round(tempF),wind:WIND_LABELS[windLevel],windLevel,pattern,waterMotion:waterMotionFor(windLevel,tags.rain)};}
function initialCondition(season){const cfg=SEASON_WEATHER[season];const r=Math.random();if(r<cfg.rain)return Math.random()<0.25?"Rain":"Light Rain";if(r<cfg.rain+cfg.clear)return "Clear";return Math.random()<0.45?"Partly Cloudy":"Cloudy";}
function nextCondition(prev,pattern){const probs=WEATHER_PATTERNS[pattern];const r=Math.random();let step=0;if(r<probs.stay)step=0;else if(r<probs.stay+probs.modest)step=Math.random()<0.5?-1:1;else step=Math.random()<0.5?-2:2;let i=CONDITION_ORDER.indexOf(prev);if(i<0)i=2;return CONDITION_ORDER[Math.max(0,Math.min(CONDITION_ORDER.length-1,i+step))];}
function nextWind(prev,pattern,season){let level=prev;if(pattern==="front")level=Math.max(level,2)+weightedIndex([0.05,0.20,0.40,0.25,0.10]);else level+=weightedIndex([0.20,0.60,0.20])-1;level+=SEASON_WEATHER[season].windBias&&Math.random()<0.12?1:0;return Math.max(0,Math.min(4,level));}
function generateSeasonWeather(){
  const cfg=SEASON_WEATHER[world.season];let condition=initialCondition(world.season);let temp=Math.round((cfg.temp[0]+cfg.temp[1])/2);let wind=1;
  const days=[];
  for(let d=1;d<=DAYS_PER_SEASON;d++){
    const pattern=patternForSeason(world.season);const parts={};
    // Daily temperature tendency plus ordinary diurnal movement.
    const dailyBase=Math.max(cfg.temp[0],Math.min(cfg.temp[1],temp+randomNumber(-4,4)));
    for(let i=0;i<WEATHER_DAYPARTS.length;i++){
      const part=WEATHER_DAYPARTS[i];
      if(i>0)condition=nextCondition(condition,pattern);
      wind=nextWind(wind,pattern,world.season);
      // Strong wind/fronts are allowed to make a larger extra shift.
      if(wind>=3 && pattern!=="stable" && Math.random()<(wind===4?0.22:0.12)) condition=nextCondition(nextCondition(condition,"front"),"front");
      const offset={Morning:-5,Day:5,Evening:1,Night:-7}[part];
      const partTemp=Math.max(cfg.temp[0]-4,Math.min(cfg.temp[1]+4,dailyBase+offset+randomNumber(-2,2)));
      parts[part]=makeWeatherState(condition,partTemp,wind,pattern);
    }
    temp=dailyBase;days.push({day:d,pattern,parts});
  }
  world.weatherSeason={season:world.season,year:world.year,days};
  applyWeatherForCurrentPeriod();
}
function ensureSeasonWeather(){if(!world.weatherSeason||world.weatherSeason.season!==world.season||world.weatherSeason.year!==world.year||!Array.isArray(world.weatherSeason.days))generateSeasonWeather();else applyWeatherForCurrentPeriod();}
function applyWeatherForCurrentPeriod(){const day=world.weatherSeason?.days?.[world.seasonDay-1];if(!day)return;const part=WEATHER_DAYPARTS.includes(world.period)?world.period:"Day";world.weather={...day.parts[part]};}
// Compatibility with older world code/debug calls.
function generateDailyWeather(){ensureSeasonWeather();applyWeatherForCurrentPeriod();}
function describeWeather(){const w=world.weather||{};return (w.temperatureF!=null?w.temperatureF+"° and ":"")+(w.name||"clear").toLowerCase()+", "+(w.wind||"light").toLowerCase()+" wind.";}
function getCurrentWeatherTags(){const w=world.weather||{};const tags=[w.sky||"SUN",w.temperature||"MILD"];if(w.temperature==="COOL")tags.push("COLD","MILD");if(w.temperature==="WARM")tags.push("MILD","HOT");if(w.rain)tags.push("RAIN");return [...new Set(tags)];}
function setDebugWeather(kind){ensureSeasonWeather();let name=kind==="Sunny"?"Clear":kind==="Rainy"?"Rain":"Cloudy";world.weather=makeWeatherState(name,world.weather?.temperatureF||60,world.weather?.windLevel||1,world.weather?.pattern||"stable");}
