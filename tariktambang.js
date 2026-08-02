const {
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle
}=require("discord.js");

const database=require("./database");

const Leaderboard=require("./leaderboard");

class TarikTambang{

constructor(client){

this.client=client;

this.active=false;

this.playerA=null;

this.playerB=null;

this.scoreA=0;

this.scoreB=0;

this.message=null;

this.prepareTimeout=null;

this.battleTimeout=null;

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

`🇮🇩 **PERTANDINGAN TARIK TAMBANG**

🔴 **${this.playerA.username}**

🆚

🔵 **${this.playerB.username}**

━━━━━━━━━━━━━━

⏳ Persiapan dimulai...

Pertandingan dimulai dalam **1 menit**.

🏆 Pemenang : **+5 Poin**
💀 Kalah : **-2 Poin**`

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

.setLabel(this.playerA.username)

.setStyle(ButtonStyle.Danger),

new ButtonBuilder()

.setCustomId("tarik_kanan")

.setEmoji("➡️")

.setLabel(this.playerB.username)

.setStyle(ButtonStyle.Primary)

);

}

// =====================
// PILIH PLAYER RANDOM
// =====================

getRandomPlayers(){

const users=database
.leaderboard()
.filter(u=>u.id);

if(users.length<2) return false;

const random=[...users]
.sort(()=>Math.random()-0.5);

this.playerA=random[0];

this.playerB=random[1];

return true;

}

// =====================
// SPAWN EVENT
// =====================

async spawn(){

if(!this.getRandomPlayers()) return;

this.active=false;

this.scoreA=0;

this.scoreB=0;

this.cooldown.clear();

const channel=await this.client.channels.fetch(
process.env.TARIK_CHANNEL
);

this.message=await channel.send({

content:"@everyone",

embeds:[
this.buildEmbed()
]

});

console.log(
`🤼 Tarik Tambang

${this.playerA.username}
VS
${this.playerB.username}`
);

// Persiapan 1 menit

this.prepareTimeout=setTimeout(()=>{

this.startBattle();

},60000);

}

// =====================
// START
// =====================

start(){

console.log("🤼 Tarik Tambang Loaded");

// Langsung mulai 1 pertandingan
this.spawn();

// Lalu muncul setiap 30 menit

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

━━━━━━━━━━━━━━

🔵 **${this.playerB.username}**
Skor : **${this.scoreB}**

⏰ Waktu tersisa : **20 Detik**

👇 Semua member boleh membantu tim favoritnya!`

)

],

components:[

this.buildButton()

]

});

// Selesai setelah 20 detik

this.battleTimeout=setTimeout(()=>{

this.finishBattle();

},20000);

}

// =====================
// UPDATE SKOR
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

━━━━━━━━━━━━━━

🔵 **${this.playerB.username}**
Skor : **${this.scoreB}**

⏰ Pertandingan sedang berlangsung...`

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

const last=this.cooldown.get(
interaction.user.id
)||0;

if(Date.now()-last<1000){

return interaction.reply({

content:"⏳ Jangan spam tombol!",

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

// Update pesan

try{

await interaction.deferUpdate();

}catch(err){}

await this.updateBattle();

}

// =====================
// SELESAI PERTANDINGAN
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

// Tambah / Kurang poin

const winnerUser=database.addPoint(
winner.id,
winner.username,
5
);

const loserUser=database.removePoint(
loser.id,
loser.username,
2
);

// Statistik

winnerUser.tarik=(winnerUser.tarik||0)+1;

database.saveUsers();

// =====================
// UPDATE LEADERBOARD
// =====================

try{

const leaderboard=new Leaderboard(this.client);

await leaderboard.update();

}catch(err){

console.error(err);

}

// =====================
// LOG PEROLEHAN POIN
// =====================

try{

const log=await this.client.channels.fetch(
process.env.LOG_CHANNEL
);

await log.send({

embeds:[

new EmbedBuilder()

.setColor(0x57F287)

.setTitle(`🤼 ${winner.username}`)

.setDescription(

`🥇 Menang Tarik Tambang

**+5 poin**

🏆 Total : **${winnerUser.points} poin**`

)

.setTimestamp()

]

});

await log.send({

embeds:[

new EmbedBuilder()

.setColor(0xED4245)

.setTitle(`🤼 ${loser.username}`)

.setDescription(

`💀 Kalah Tarik Tambang

**-2 poin**

🏆 Total : **${loserUser.points} poin**`

)

.setTimestamp()

]

});

}catch(err){

console.error(err);

}

// =====================
// EDIT PESAN
// =====================

await this.message.edit({

content:"🏁 **PERTANDINGAN SELESAI!**",

embeds:[

new EmbedBuilder()

.setColor("#2ECC71")

.setTitle("🏆 HASIL TARIK TAMBANG")

.setDescription(

`🥇 **${winner.username}**

(+5 Poin)

━━━━━━━━━━━━━━

💀 **${loser.username}**

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

}

// =====================
// EXPORT
// =====================

module.exports=TarikTambang;