const {
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle
}=require("discord.js");

const database=require("./database");

class Tukar{

constructor(client){

this.client=client;

}

// =====================
// EMBED
// =====================

buildEmbed(){

return new EmbedBuilder()

.setColor("#2ECC71")

.setTitle("💸 TUKAR POIN")

.setDescription(

`💱 **KURS PENUKARAN**

⭐ **500 Poin = 5 ⏣**

━━━━━━━━━━━━━━

Contoh:

⭐ 500 → ⏣ 5

⭐ 1000 → ⏣ 10

⭐ 1500 → ⏣ 15

━━━━━━━━━━━━━━

Klik tombol di bawah untuk menukarkan poin.`

)

.setFooter({

text:"Cashback Shop"

})

.setTimestamp();

}

// =====================
// BUTTON
// =====================

buildButton(){

return new ActionRowBuilder()

.addComponents(

new ButtonBuilder()

.setCustomId("tukar")

.setEmoji("💸")

.setLabel("Tukarkan Poin")

.setStyle(ButtonStyle.Success)

);

}

// =====================
// START
// =====================

async start(){

const channel=

await this.client.channels.fetch(

process.env.SHOP_CHANNEL

);

await channel.send({

embeds:[

this.buildEmbed()

],

components:[

this.buildButton()

]

});

console.log("💸 Tukar Poin Loaded");

}
// =====================
// HANDLE BUTTON
// =====================

async handle(interaction){

if(!interaction.isButton()) return;

if(interaction.customId!=="tukar") return;

const user=database.getUser(

interaction.user.id,

interaction.user.username

);

if(user.points<500){

return interaction.reply({

ephemeral:true,

embeds:[

new EmbedBuilder()

.setColor("#E74C3C")

.setTitle("❌ Poin Tidak Cukup")

.setDescription(

`Kamu membutuhkan minimal **500 poin** untuk melakukan penukaran.

⭐ Poin kamu : **${user.points}**`

)

]

});

}

// Hitung kelipatan

const kelipatan=Math.floor(user.points/500);

const dipakai=kelipatan*500;

const robux=kelipatan*5;

// Kurangi poin

user.points-=dipakai;

// Tambah robux

user.robux=(user.robux||0)+robux;

database.saveUsers();

// Update leaderboard

try{

const Leaderboard=require("./leaderboard");

await new Leaderboard(this.client).update();

}catch(err){

console.error(err);

}

// Balasan

await interaction.reply({

ephemeral:true,

embeds:[

new EmbedBuilder()

.setColor("#2ECC71")

.setTitle("✅ Penukaran Berhasil")

.setDescription(

`⭐ Poin dipakai : **${dipakai}**

⏣ Robux didapat : **${robux}**

⭐ Sisa poin : **${user.points}**`

)

.setTimestamp()

]

});

}
// =====================
// UPDATE PANEL
// =====================

async updatePanel(){

const channel=await this.client.channels.fetch(
process.env.SHOP_CHANNEL
);

const messages=await channel.messages.fetch({limit:10});

const panel=messages.find(m=>

m.author.id===this.client.user.id&&

m.embeds.length>0&&

m.embeds[0].title==="💸 TUKAR POIN"

);

if(panel){

await panel.edit({

embeds:[

this.buildEmbed()

],

components:[

this.buildButton()

]

});

}else{

await channel.send({

embeds:[

this.buildEmbed()

],

components:[

this.buildButton()

]

});

}

}

}

// =====================
// EXPORT
// =====================

module.exports=Tukar;
