const {
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle
}=require("discord.js");

const database=require("./database");
const utils=require("./utils");

class Monumen{

constructor(client){

this.client=client;

this.active=false;

this.claimed=new Set();

this.message=null;

this.timeout=null;

this.scheduler=null;

this.today="";

this.schedule=[];

this.maxSpawn=15;

this.list=[

{
name:"Monumen Nasional",
emoji:"🗼",
image:"https://cdn0-production-images-kly.akamaized.net/KDg0DCqy74Hy2uMOUUqUgXls74M=/1200x675/smart/filters:quality(75):strip_icc():format(jpeg)/kly-media-production/medias/788949/original/088808800_1420183683-Monas5.jpg"
},

{
name:"Candi Borobudur",
emoji:"🛕",
image:"https://cdn1-production-images-kly.akamaized.net/KRV05_LNI_woM1xsLULUlF-KGZE=/1200x675/smart/filters:quality(75):strip_icc():format(jpeg)/kly-media-production/medias/3023951/original/083764400_1579164554-indonesia-1098328_1920.jpg"
},

{
name:"Candi Prambanan",
emoji:"🏛",
image:"https://magelangekspres.disway.id/upload/40469391f378412c802b73e35f6245da.jpg"
},

{
name:"Tugu Pahlawan",
emoji:"⚔️",
image:"https://tiketwisata.surabaya.go.id/storage/tour/monumen-tugu-pahlawan_1680340884.jpeg"
},

{
name:"Lawang Sewu",
emoji:"🏚",
image:"https://upload.wikimedia.org/wikipedia/commons/e/e8/Lawang_sewu_semarang.jpg"
}

];

}

// =====================
// RANDOM SCHEDULE
// =====================

generateSchedule(){

const result=[];

while(result.length<this.maxSpawn){

const minute=Math.floor(Math.random()*1440);

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
// RANDOM MONUMENT
// =====================

randomMonument(){

return this.list[
Math.floor(
Math.random()*this.list.length
)
];

}
  // =====================
// BUILD EMBED
// =====================

buildEmbed(monumen){

return new EmbedBuilder()

.setColor("#16A34A")

.setTitle(`${monumen.emoji} MONUMEN DITEMUKAN!`)

.setDescription(

`📍 **${monumen.name}**

Ayo kunjungi monumen ini!

👥 Semua member boleh ikut.

🎁 Hadiah bisa positif ataupun negatif.

⏰ Event berlangsung **30 detik**.`

)

.setImage(monumen.image)

.setFooter({

text:"Jelajah Nusantara 2026"

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

.setCustomId("monumen")

.setEmoji("🗺️")

.setLabel("Kunjungi Monumen")

.setStyle(ButtonStyle.Success)

);

}

// =====================
// SPAWN
// =====================

async spawn(){

const channel=await this.client.channels.fetch(
process.env.MONUMENT_CHANNEL
);

const monumen=this.randomMonument();

this.active=true;

this.claimed.clear();

const msg=await channel.send({

content:"📢 **MONUMEN BARU DITEMUKAN!**",

embeds:[
this.buildEmbed(monumen)
],

components:[
this.buildButton()
]

});

this.message=msg;

console.log(
`🗿 ${monumen.name} muncul!`
);

clearTimeout(this.timeout);

this.timeout=setTimeout(async()=>{

this.active=false;

try{

await msg.edit({

content:"💨 Kesempatan mengunjungi monumen telah berakhir.",

components:[]

});

}catch(err){}

},30000);

}
  // =====================
// START
// =====================

start(){

console.log("🗿 Monumen Module Loaded");

this.today=this.todayKey();

this.generateSchedule();

// Spawn pertama
this.spawn();

// Jalankan scheduler
this.startScheduler();

console.log(
`🗿 Total Monumen Hari Ini : ${this.schedule.length}`
);

}

// =====================
// HANDLE BUTTON
// =====================

async handle(interaction){

if(!interaction.isButton()) return;

if(interaction.customId!=="monumen") return;

if(!this.active){

return interaction.reply({

content:"🗿 Event Monumen sudah berakhir.",

ephemeral:true

});

}

const id=interaction.user.id;

if(this.claimed.has(id)){

return interaction.reply({

content:"❌ Kamu sudah mengunjungi monumen ini.",

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

await interaction.reply({

ephemeral:true,

embeds:[

new EmbedBuilder()

.setColor(

reward.point>=0
?0x57F287
:0xED4245
)

.setTitle("🗿 Hasil Kunjungan")

.setDescription(

`${reward.text}

**${reward.point>=0?"+":""}${reward.point} poin**

🏆 Total poin : **${user.points}**`

)

]

});

try{

const log=await this.client.channels.fetch(
process.env.LOG_CHANNEL
);

await log.send({

embeds:[

new EmbedBuilder()

.setColor(0x2ECC71)

.setTitle(`🗿 ${interaction.user.username}`)

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

console.log("🗿 Jadwal Monumen Baru");

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
// UPDATE LEADERBOARD
// =====================

async updateLeaderboard(){

const Leaderboard=require("./leaderboard");

const leaderboard=

new Leaderboard(this.client);

await leaderboard.update();

}

}

// =====================
// EXPORT
// =====================

module.exports=Monumen;
