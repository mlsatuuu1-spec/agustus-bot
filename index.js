const {
Client,
GatewayIntentBits
}=require("discord.js");

const database=require("./database");

const utils=require("./utils");

const client=new Client({

intents:[

GatewayIntentBits.Guilds

]

});

// ======================
// ENV
// ======================

const TOKEN=process.env.TOKEN;

const CLIENT_ID=process.env.CLIENT_ID;

const GUILD_ID=process.env.GUILD_ID;

const EVENT_CHANNEL=process.env.EVENT_CHANNEL;

const MONUMENT_CHANNEL=process.env.MONUMENT_CHANNEL;

const LEADERBOARD_CHANNEL=process.env.LEADERBOARD_CHANNEL;

const LOG_CHANNEL=process.env.LOG_CHANNEL;

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
