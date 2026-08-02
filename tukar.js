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
// BUILD EMBED
// =====================

buildEmbed(){

return new EmbedBuilder()

.setColor("#2ECC71")

.setTitle("💸 TUKAR POIN")

.setDescription(

`⭐ **100 Poin = 1 ⏣**

Aturan:

• Minimal **100 poin**
• Berlaku kelipatan
• Sisa poin tetap disimpan

Contoh:

⭐ 100 = ⏣ 1
⭐ 250 = ⏣ 2
⭐ 980 = ⏣ 9

Klik tombol di bawah untuk menukar poin.`

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

.setCustomId("tukar_poin")

.setEmoji("💸")

.setLabel("Tukarkan Poin")

.setStyle(ButtonStyle.Success)

);

}

// =====================
// SEND PANEL
// =====================

async sendPanel(){

const channel=await this.client.channels.fetch(

process.env.SHOP_CHANNEL

);

const msg=await channel.send({

embeds:[

this.buildEmbed()

],

components:[

this.buildButton()

]

});

console.log("💸 Panel Tukar Poin berhasil dibuat");

}
  // =====================
// START
// =====================

async start(){

await this.sendPanel();

}

// =====================
// HANDLE BUTTON
// =====================

async handle(interaction){

if(!interaction.isButton()) return;

if(interaction.customId!=="tukar_poin") return;

const user=database.getUser(

interaction.user.id,

interaction.user.username

);

const poin=user.points||0;

// Minimal 100 poin

if(poin<100){

return interaction.reply({

ephemeral:true,

embeds:[

new EmbedBuilder()

.setColor("#E74C3C")

.setTitle("❌ Penukaran Gagal")

.setDescription(

`Minimal penukaran adalah **100 poin**.

Poin kamu saat ini:

⭐ **${poin} poin**`

)

]

});

}

// Hitung Robux

const robux=Math.floor(poin/100);

const sisa=poin%100;

// Kurangi poin

user.points=sisa;

// Tambah saldo Robux

user.robux=(user.robux||0)+robux;

database.saveUsers();
  // =====================
// REPLY
// =====================

await interaction.reply({

ephemeral:true,

embeds:[

new EmbedBuilder()

.setColor("#2ECC71")

.setTitle("✅ Penukaran Berhasil")

.setDescription(

`💸 Berhasil menukar poin!

⭐ Poin dipakai : **${robux*100}**

⭐ Sisa poin : **${sisa}**

⏣ Robux didapat : **${robux}**

Silakan hubungi admin untuk pencairan Robux.`

)

.setTimestamp()

]

});

// =====================
// LOG
// =====================

try{

const log=await this.client.channels.fetch(
process.env.LOG_CHANNEL
);

await log.send({

embeds:[

new EmbedBuilder()

.setColor("#F1C40F")

.setTitle("💸 Penukaran Poin")

.setDescription(

`👤 ${interaction.user.username}

⭐ Ditukar : **${robux*100} poin**

⏣ Mendapat : **${robux}**

⭐ Sisa : **${sisa} poin**`

)

.setTimestamp()

]

});

}catch(err){

console.error(err);

}
  // =====================
// UPDATE LEADERBOARD
// =====================

try{

const Leaderboard=require("./leaderboard");

await new Leaderboard(this.client).update();

}catch(err){

console.error(err);

}

}

// =====================
// EXPORT
// =====================

module.exports=Tukar;
