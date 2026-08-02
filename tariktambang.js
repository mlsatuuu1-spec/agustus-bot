const {
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle
}=require("discord.js");

const database=require("./database");

class TarikTambang{

constructor(client){

this.client=client;

this.active=false;

this.playerA=null;

this.playerB=null;

this.scoreA=0;

this.scoreB=0;

this.message=null;

this.timeout=null;

this.cooldown=new Map();

}

// =====================
// EMBED
// =====================

buildEmbed(){

return new EmbedBuilder()

.setColor("#E67E22")

.setTitle("🤼 TARIK TAMBANG")

.setDescription(

`🇮🇩 **PERTANDINGAN DIMULAI!**

🔴 ${this.playerA.username}

🆚

🔵 ${this.playerB.username}

━━━━━━━━━━━━━━

⏳ **Persiapan 1 Menit**

Setelah hitungan selesai,
semua member boleh membantu
tim favoritnya.

🏆 Pemenang +5 Poin
💀 Kalah -2 Poin`

)

.setFooter({

text:"Event Kemerdekaan 2026"

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

.setCustomId("tarik_kiri")

.setEmoji("⬅️")

.setLabel("Tim Merah")

.setStyle(ButtonStyle.Danger),

new ButtonBuilder()

.setCustomId("tarik_kanan")

.setEmoji("➡️")

.setLabel("Tim Biru")

.setStyle(ButtonStyle.Primary)

);

}
  // =====================
// PILIH 2 PLAYER RANDOM
// =====================

getRandomPlayers(){

const users=database
.leaderboard()
.filter(u=>u.points>=0);

if(users.length<2) return false;

const shuffled=[...users]
.sort(()=>Math.random()-0.5);

this.playerA=shuffled[0];

this.playerB=shuffled[1];

return true;

}

// =====================
// START EVENT
// =====================

async spawn(){

if(!this.getRandomPlayers()) return;

const channel=

await this.client.channels.fetch(

process.env.EVENT_CHANNEL

);

this.active=false;

this.scoreA=0;

this.scoreB=0;

const msg=

await channel.send({

content:"@everyone",

embeds:[

this.buildEmbed()

]

});

this.message=msg;

console.log(

`🤼 Tarik Tambang

${this.playerA.username}

VS

${this.playerB.username}`

);

// Persiapan 1 menit

setTimeout(()=>{

this.startBattle();

},60000);

}

// =====================
// START
// =====================

start(){

console.log(

"🤼 Tarik Tambang Loaded"

);

// Muncul setiap 30 menit

this.spawn();

setInterval(()=>{

this.spawn();

},30*60*1000);

}
  // =====================
// MULAI PERTANDINGAN
// =====================

async startBattle(){

this.active=true;

await this.message.edit({

content:"🔥 **TARIK SEKARANG!!**",

embeds:[

new EmbedBuilder()

.setColor("#E74C3C")

.setTitle("🤼 TARIK TAMBANG")

.setDescription(

`🔴 **${this.playerA.username}**
Skor : **${this.scoreA}**

🆚

🔵 **${this.playerB.username}**
Skor : **${this.scoreB}**

⏰ Waktu : **20 Detik**`

)

],

components:[

this.buildButton()

]

});

// 20 detik pertandingan

this.timeout=setTimeout(()=>{

this.finishBattle();

},20000);

}

// =====================
// UPDATE SCORE
// =====================

async updateBattle(){

if(!this.message) return;

await this.message.edit({

embeds:[

new EmbedBuilder()

.setColor("#E67E22")

.setTitle("🤼 TARIK TAMBANG")

.setDescription(

`🔴 **${this.playerA.username}**
Skor : **${this.scoreA}**

🆚

🔵 **${this.playerB.username}**
Skor : **${this.scoreB}**

⏰ Sedang Berlangsung...`

)

],

components:[

this.buildButton()

]

});

}
  // =====================
// HANDLE BUTTON
// =====================

async handle(interaction){

if(!interaction.isButton()) return;

if(
interaction.customId!=="tarik_kiri"&&
interaction.customId!=="tarik_kanan"
) return;

if(!this.active){

return interaction.reply({

content:"🤼 Pertandingan sudah selesai.",

ephemeral:true

});

}

// Cooldown 1 detik

const last=this.cooldown.get(interaction.user.id)||0;

if(Date.now()-last<1000){

return interaction.reply({

content:"⏳ Tunggu sebentar sebelum klik lagi.",

ephemeral:true

});

}

this.cooldown.set(

interaction.user.id,

Date.now()

);

// Tambah skor

if(interaction.customId==="tarik_kiri"){

this.scoreA++;

}else{

this.scoreB++;

}

await interaction.deferUpdate();

this.updateBattle();

}

// =====================
// SELESAI
// =====================

async finishBattle(){

this.active=false;

let winner,loser;

if(this.scoreA>=this.scoreB){

winner=this.playerA;

loser=this.playerB;

}else{

winner=this.playerB;

loser=this.playerA;

}

database.addPoint(

winner.id,

winner.username,

5

);

database.removePoint(

loser.id,

loser.username,

2

);

database.saveUsers();

await this.message.edit({

content:"🏁 **PERTANDINGAN SELESAI!**",

embeds:[

new EmbedBuilder()

.setColor("#2ECC71")

.setTitle("🏆 HASIL TARIK TAMBANG")

.setDescription(

`🥇 Pemenang

**${winner.username}**

(+5 Poin)

━━━━━━━━━━━━━━

💀 Kalah

**${loser.username}**

(-2 Poin)

━━━━━━━━━━━━━━

🔴 ${this.scoreA}

🆚

🔵 ${this.scoreB}`

)

],

components:[]

});

}

// =====================
// EXPORT
// =====================

module.exports=TarikTambang;
