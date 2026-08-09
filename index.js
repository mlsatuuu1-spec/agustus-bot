const {
    Client,
    GatewayIntentBits
} = require("discord.js");

require("./database");

const Garuda = require("./garuda");

const Leaderboard = require("./leaderboard");

const Monumen = require("./monumen");

const Tukar=require("./tukar");

const CuriPoin = require("./curi");


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});

// ======================
// EVENT
// ======================

const garuda = new Garuda(client);
const leaderboard = new Leaderboard(client);
const monumen = new Monumen(client);
const tukar=new Tukar(client);


// ======================
// READY
// ======================

client.once("ready", async () => {

    console.log("================================");

    console.log(`✅ Login sebagai ${client.user.tag}`);

    console.log("🦅 Garuda Event Loaded");

    console.log("================================");

garuda.start();
monumen.start();
tukar.start();


leaderboard.update();

});

// ======================
// INTERACTION
// ======================

client.on("interactionCreate", async interaction => {

    try {

        await garuda.handle(interaction);
        await monumen.handle(interaction);
        await tukar.handle(interaction);
       
    } catch (err) {

        console.error(err);

    }

});

// ======================
// ERROR
// ======================

process.on("unhandledRejection", console.error);

process.on("uncaughtException", console.error);

// ======================
// LOGIN
// ======================

client.login(process.env.TOKEN);