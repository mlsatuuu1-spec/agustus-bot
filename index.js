const {
Client,
GatewayIntentBits
} = require("discord.js");

const fs = require("fs");
const path = require("path");

// ======================
// ENV
// ======================

const TOKEN = process.env.TOKEN;

const CLIENT_ID = process.env.CLIENT_ID;

const GUILD_ID = process.env.GUILD_ID;

const EVENT_CHANNEL = process.env.EVENT_CHANNEL;

const MONUMENT_CHANNEL = process.env.MONUMENT_CHANNEL;

const LEADERBOARD_CHANNEL = process.env.LEADERBOARD_CHANNEL;

const LOG_CHANNEL = process.env.LOG_CHANNEL;

const ANNOUNCEMENT_CHANNEL = process.env.ANNOUNCEMENT_CHANNEL;

// ======================
// CLIENT
// ======================

const client = new Client({

intents:[
GatewayIntentBits.Guilds
]

});
// ======================
// VOLUME
// ======================

const DATA_PATH="/data";

if(!fs.existsSync(DATA_PATH)){

fs.mkdirSync(DATA_PATH,{
recursive:true
});

}

const USERS_FILE=
path.join(DATA_PATH,"users.json");

const EVENTS_FILE=
path.join(DATA_PATH,"events.json");

// ======================
// CREATE FILE
// ======================

if(!fs.existsSync(USERS_FILE)){

fs.writeFileSync(

USERS_FILE,

JSON.stringify({

users:{}

},null,2)

);

}

if(!fs.existsSync(EVENTS_FILE)){

fs.writeFileSync(

EVENTS_FILE,

JSON.stringify({

garudaMessage:null,

upacaraMessage:null,

monumentMessage:null,

combo:null,

currentMonument:0,

progress:0

},null,2)

);

}
// ======================
// LOAD DATABASE
// ======================

let users=

JSON.parse(

fs.readFileSync(

USERS_FILE,

"utf8"

)

);

let events=

JSON.parse(

fs.readFileSync(

EVENTS_FILE,

"utf8"

)

);

// ======================
// SAVE
// ======================

function saveUsers(){

fs.writeFileSync(

USERS_FILE,

JSON.stringify(

users,

null,

2

)

);

}

function saveEvents(){

fs.writeFileSync(

EVENTS_FILE,

JSON.stringify(

events,

null,

2

)

);

}

// ======================
// READY
// ======================

client.once("ready",()=>{

console.log(`${client.user.tag} Online`);

});

client.login(TOKEN);


