const {
    Client,
    GatewayIntentBits
} = require("discord.js");

require("./database");

const Garuda = require("./garuda");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});

// ======================
// EVENT
// ======================

const garuda = new Garuda(client);

// ======================
// READY
// ======================

client.once("ready", async () => {

    console.log("================================");

    console.log(`✅ Login sebagai ${client.user.tag}`);

    console.log("🦅 Garuda Event Loaded");

    console.log("================================");

    garuda.start();

});

// ======================
// INTERACTION
// ======================

client.on("interactionCreate", async interaction => {

    try {

        await garuda.handle(interaction);

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