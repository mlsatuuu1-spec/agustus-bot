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

.setImage("https://png.pngtree.com/thumb_back/fh260/background/20230609/pngtree-bald-eagle-in-flight-in-front-of-mountains-image_2903050.jpg")

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

content:"🚨 **GARUDA TERLIHAT!!",

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
  console.log(
`🦅 Garuda Spawn! ⏰ ${new Date().toLocaleTimeString("id-ID")}`
);

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
// HANDLE BUTTON
// =====================

async handle(interaction){

if(!interaction.isButton()) return;

if(interaction.customId!=="garuda") return;

if(!this.active){

return interaction.reply({

content:"🦅 Garuda sudah kabur.",

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

let user=database.getUser(

id,

interaction.user.username

);

let reward=this.applySpecial(

user,

utils.randomReward()

);

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

user.garuda++;

database.saveUsers();

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

try{

await this.updateLeaderboard();

}catch(err){

console.error(err);

}

}

// =====================
// SCHEDULER
// =====================

startScheduler(){

this.scheduler=setInterval(async()=>{

const now=new Date();

if(this.today!==this.todayKey()){

this.today=this.todayKey();

this.generateSchedule();

console.log("📅 Jadwal Garuda Baru");

}

const minute=

now.getHours()*60+

now.getMinutes();

if(

this.schedule.includes(minute)&&

!this.active

){

console.log(

`🦅 Spawn Scheduler ${minute}`

);

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

// Langsung spawn 1 Garuda
this.spawn();

// Jalankan scheduler
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

user.streak=user.streak||0;

if(roll<=3){

reward={

emoji:"👑",

item:"Golden Garuda",

point:10,

text:"✨ **GOLDEN GARUDA!**\n\n+10 poin"

};

}

else if(roll>=97){

reward={

emoji:"☠️",

item:"Garuda Sial",

point:-100,

text:"💀 **GARUDA SIAL!**"

};

}

const hour=new Date().getHours();

if(reward.point>0&&(hour>=22||hour<5)){

reward.point*=2;

reward.text+="\n🌙 Night Bonus x2";

}

user.streak++;

if(user.streak>=3){

reward.point+=2;

reward.text+="\n🔥 Lucky Streak +2";

user.streak=0;

}

// Maksimal hadiah 50 poin

if(reward.point > 50){

    reward.point = 50;

}

return reward;

}

 // =====================
// LEADERBOARD UPDATE
// =====================

async updateLeaderboard(){

const Leaderboard = require("./leaderboard");

const leaderboard = new Leaderboard(this.client);

await leaderboard.update();

}

}

// =====================
// EXPORT
// =====================

module.exports=Garuda;
