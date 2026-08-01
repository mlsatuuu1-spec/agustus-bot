const {
Client,
GatewayIntentBits
}=require("discord.js");

const Garuda=require("./garuda");

const client=new Client({

intents:[

GatewayIntentBits.Guilds

]

});

const garuda=

new Garuda(client);

// ======================
// READY
// ======================

client.once("ready",()=>{

console.log(

`✅ ${client.user.tag} Online`

);

garuda.start();

});

// ======================
// BUTTON
// ======================

client.on(

"interactionCreate",

async interaction=>{

await garuda.handle(

interaction

);

});

// ======================
// LOGIN
// ======================

client.login(

process.env.TOKEN

);
const ANNOUNCEMENT_CHANNEL=process.env.ANNOUNCEMENT_CHANNEL;

module.exports={

client,

TOKEN,

CLIENT_ID,

GUILD_ID,

EVENT_CHANNEL,

MONUMENT_CHANNEL,

LEADERBOARD_CHANNEL,

LOG_CHANNEL,

ANNOUNCEMENT_CHANNEL,

database,

utils

};

client.once("ready",()=>{

console.log(`${client.user.tag} Online`);

});

client.login(TOKEN);
