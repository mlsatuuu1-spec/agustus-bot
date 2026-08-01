const {
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle
}=require("discord.js");

const database=require("./database");

const utils=require("./utils");

class Garuda{

constructor(client){

this.client=client;

this.active=false;

this.claimed=new Set();

this.message=null;

this.timeout=null;

this.scheduler=null;

this.today="";

this.schedule=[];

this.maxSpawn=20;

}

// =====================
// BUILD EMBED
// =====================

buildEmbed(){

return new EmbedBuilder()

.setColor("#E11D48")

.setTitle("🦅 GARUDA MUNCUL!")

.setDescription(

`🇮🇩 **GARUDA TERBANG DI ATAS SERVER!**

Tangkap Garuda sebelum kabur!

👥 Semua member boleh ikut.

🎁 Hadiah bisa positif ataupun negatif.

⏰ Event berlangsung **30 detik**.`

)

.setThumbnail(

"https://cdn.discordapp.com/emojis/🦅.png"

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

.setCustomId("garuda")

.setEmoji("🦅")

.setLabel("Tangkap Garuda")

.setStyle(ButtonStyle.Danger)

);

}

// =====================
// RANDOM SCHEDULE
// =====================

generateSchedule(){

const result=[];

while(result.length<this.maxSpawn){

const minute=

Math.floor(

Math.random()*1440

);

if(!result.includes(minute))

result.push(minute);

}

result.sort((a,b)=>a-b);

this.schedule=result;

}

// =====================
// TODAY
// =====================

todayKey(){

const now=new Date();

return `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`;

}
  // =====================
// SPAWN GARUDA
// =====================

async spawn(){

const channel=

await this.client.channels.fetch(

process.env.EVENT_CHANNEL

);

// Hapus Garuda lama

if(database.events.garudaMessage){

try{

const old=

await channel.messages.fetch(

database.events.garudaMessage

);

await old.delete();

}catch(err){}

}

// Reset event

this.active=true;

this.claimed.clear();

// Kirim Garuda

const msg=

await channel.send({

content:"🚨 **GARUDA TERLIHAT!!**\n@everyone",

embeds:[

this.buildEmbed()

],

components:[

this.buildButton()

],

allowedMentions:{

parse:["everyone"]

}

});

this.message=msg;

database.events.garudaMessage=msg.id;

database.saveEvents();

// Tutup otomatis

clearTimeout(this.timeout);

this.timeout=setTimeout(async()=>{

this.active=false;

try{

await msg.edit({

content:"💨 Garuda berhasil kabur...",

components:[]

});

}catch(err){}

},30000);

}
  // =====================
// START
// =====================

start(){

console.log("🦅 Garuda Module Loaded");

// Spawn pertama

this.spawn();

// Scheduler akan dibuat
// di Part 3

}
  // =====================
// HANDLE BUTTON
// =====================

async handle(interaction){

if(!interaction.isButton()) return;

if(interaction.customId!=="garuda") return;

if(!this.active){

return interaction.reply({

content:"🦅 Garuda sudah kabur!",

ephemeral:true

});

}

const id=interaction.user.id;

if(this.claimed.has(id)){

return interaction.reply({

content:"❌ Kamu sudah menangkap Garuda kali ini.",

ephemeral:true

});

}

this.claimed.add(id);

let reward=utils.randomReward();

let user;

if(reward.point>=0){

user=database.addPoint(

id,

interaction.user.username,

reward.point

);

}else{

user=database.removePoint(

id,

interaction.user.username,

Math.abs(reward.point)

);

}

// Statistik

user.garuda=(user.garuda||0)+1;

database.saveUsers();

// Kirim Log

try{

const log=

await this.client.channels.fetch(

process.env.LOG_CHANNEL

);

await log.send({

embeds:[

new EmbedBuilder()

.setColor(

reward.point>=0

?0x57F287

:0xED4245

)

.setTitle(`${reward.emoji} ${interaction.user.username}`)

.setDescription(

`${reward.text}

**${reward.point>=0?"+":""}${reward.point} poin**

🏆 Total : **${user.points} poin**`

)

.setTimestamp()

]

});

}catch(err){

console.error(err);

}

// Reply

await interaction.reply({

ephemeral:true,

embeds:[

new EmbedBuilder()

.setColor(

reward.point>=0

?0x57F287

:0xED4245

)

.setTitle("🦅 Hasil Tangkapan")

.setDescription(

`${reward.text}

**${reward.point>=0?"+":""}${reward.point} poin**

🏆 Total poin : **${user.points}**`

)

]

});
  await this.updateLeaderboard();

}
  // =====================
// SCHEDULER
// =====================

startScheduler(){

// Cek setiap 30 detik

this.scheduler=setInterval(async()=>{

const now=new Date();

// Hari baru

if(this.today!==this.todayKey()){

this.today=this.todayKey();

this.generateSchedule();

console.log("🦅 Schedule Baru");

console.log(this.schedule);

}

const minute=

now.getHours()*60+

now.getMinutes();

if(

this.schedule.includes(minute)&&

!this.active

){

try{

await this.spawn();

}catch(err){

console.error(err);

}

}

},30000);

}

// =====================
// START
// =====================

start(){

console.log("🦅 Garuda Module Loaded");

this.today=this.todayKey();

this.generateSchedule();

this.startScheduler();

console.log(

`📅 Total Spawn Hari Ini : ${this.schedule.length}`

);

}
  // =====================
// SPECIAL EVENT
// =====================

applySpecial(user,reward){

const roll=Math.random()*100;

// 👑 Golden Garuda (3%)

if(roll<=3){

reward={

emoji:"👑",

item:"Golden Garuda",

point:10,

text:"✨ **GOLDEN GARUDA!**\n\nKamu mendapat bonus +10 poin!"

};

}

// ☠️ Garuda Sial (3%)

else if(roll>=97){

reward={

emoji:"☠️",

item:"Garuda Sial",

point:-10,

text:"💀 **GARUDA SIAL!**\n\nGaruda menjatuhkan tai super 😭"

};

}

// 🌙 Night Bonus

const hour=new Date().getHours();

if(

reward.point>0&&

(hour>=22||hour<5)

){

reward.point*=2;

reward.text+="\n\n🌙 Night Bonus x2";

}

// 🔥 Lucky Streak

user.streak=user.streak||0;

user.streak++;

if(user.streak>=3){

reward.point+=2;

reward.text+="\n\n🔥 Lucky Streak +2 poin";

user.streak=0;

}

return reward;

}
  // =====================
// LEADERBOARD UPDATE
// =====================

async updateLeaderboard(){

if(!process.env.LEADERBOARD_CHANNEL)

return;

try{

const channel=

await this.client.channels.fetch(

process.env.LEADERBOARD_CHANNEL

);

const top=

database.leaderboard()

.slice(0,10);

let desc="";

if(top.length===0){

desc="Belum ada data.";

}else{

top.forEach((u,i)=>{

const medal=

i===0?"🥇":

i===1?"🥈":

i===2?"🥉":

`${i+1}.`;

desc+=`${medal} **${u.username}** — ${u.points} poin\n`;

});

}

const embed=

new EmbedBuilder()

.setColor("#F1C40F")

.setTitle("🏆 LEADERBOARD")

.setDescription(desc)

.setTimestamp();

if(database.events.leaderboardMessage){

try{

const msg=

await channel.messages.fetch(

database.events.leaderboardMessage

);

await msg.edit({

embeds:[embed]

});

return;

}catch(err){}

}

const msg=

await channel.send({

embeds:[embed]

});

database.events.leaderboardMessage=

msg.id;

database.saveEvents();

}catch(err){

console.error(err);

}

}

}

// =====================
// EXPORT
// =====================

module.exports=Garuda;
