const {
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle
}=require("discord.js");

const database=require("./database");

class Monumen{

constructor(client){

this.client=client;

this.active=false;

this.progress=0;

this.workers=new Set();

this.cooldown={};

this.message=null;

this.timeout=null;

this.scheduler=null;

this.nextSpawn=0;

this.project=null;

this.projects=[

{
name:"Monumen Nasional",
emoji:"🗼",
image:"https://upload.wikimedia.org/wikipedia/commons/e/e5/Monas_Jakarta.jpg"
},

{
name:"Candi Borobudur",
emoji:"🛕",
image:"https://upload.wikimedia.org/wikipedia/commons/9/91/Borobudur-Nothwest-view.jpg"
},

{
name:"Candi Prambanan",
emoji:"🏛️",
image:"https://upload.wikimedia.org/wikipedia/commons/7/7e/Prambanan_Temple.jpg"
},

{
name:"Tugu Pahlawan",
emoji:"⚔️",
image:"https://upload.wikimedia.org/wikipedia/commons/0/03/Tugu_Pahlawan_Surabaya.jpg"
},

{
name:"Lawang Sewu",
emoji:"🏚️",
image:"https://upload.wikimedia.org/wikipedia/commons/5/57/Lawang_Sewu.jpg"
}

];

}

randomProject(){

return this.projects[
Math.floor(
Math.random()*this.projects.length
)
];

}

progressBar(){

const full=Math.floor(this.progress/10);

return "🟩".repeat(full)+"⬜".repeat(10-full);

}

// =====================
// BUILD EMBED
// =====================

buildEmbed(){

return new EmbedBuilder()

.setColor("#16A34A")

.setTitle(`🏗️ ${this.project.name}`)

.setDescription(

`🔨 **Ayo bangun monumen bersama!**

${this.progressBar()}

**Progress : ${this.progress}%**

👷 Kontributor : **${this.workers.size}**

⏰ Cooldown membangun:
**5 Menit**

🏆 Bonus saat selesai:
**+10 Poin untuk semua kontributor**`

)

.setImage(this.project.image)

.setFooter({

text:"Event Bangun Monumen"

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

.setCustomId("bangun_monumen")

.setLabel("🔨 Bangun")

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

this.active=true;

this.progress=0;

this.workers.clear();

this.cooldown={};

this.project=this.randomProject();

const msg=await channel.send({

content:"@everyone",

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

console.log(
`🏗️ ${this.project.name} dimulai`
);

}

// =====================
// START
// =====================

start(){

console.log("🏗️ Monumen Module Loaded");

// Muncul pertama setelah 2 jam
this.nextSpawn=Date.now()+7200000;

this.startScheduler();

}

// =====================
// HANDLE BUTTON
// =====================

async handle(interaction){

if(!interaction.isButton()) return;

if(interaction.customId!=="bangun_monumen") return;

if(!this.active){

return interaction.reply({

content:"❌ Saat ini tidak ada proyek monumen.",

ephemeral:true

});

}

const id=interaction.user.id;

const now=Date.now();

// Cooldown 5 menit

if(

this.cooldown[id]&&

now<this.cooldown[id]

){

const s=Math.ceil(

(this.cooldown[id]-now)/1000

);

const m=Math.floor(s/60);

const d=s%60;

return interaction.reply({

content:`⏳ Tunggu **${m} menit ${d} detik** untuk membantu lagi.`,

ephemeral:true

});

}

this.cooldown[id]=now+300000;

// Tambah progress 1-3%

const add=Math.floor(Math.random()*3)+1;

this.progress+=add;

if(this.progress>100)

this.progress=100;

// Tambah statistik

this.workers.add(id);

const user=database.addPoint(

id,

interaction.user.username,

1

);

user.monumen=(user.monumen||0)+1;

database.saveUsers();

// Update embed

await this.message.edit({

embeds:[

this.buildEmbed()

],

components:[

this.buildButton()

]

});

await interaction.reply({

ephemeral:true,

content:`🔨 Kamu membantu pembangunan **+${add}%**\n⭐ +1 poin`

});

if(this.progress>=100){

await this.finish();

}

}

// =====================
// FINISH PROJECT
// =====================

async finish(){

this.active=false;

// Bonus semua kontributor

for(const id of this.workers){

const user=database.users.users[id];

if(!user) continue;

user.points+=10;

}

database.saveUsers();

try{

await this.message.edit({

content:"🎉 **MONUMEN SELESAI DIBANGUN!**",

embeds:[

new EmbedBuilder()

.setColor("#F1C40F")

.setTitle(`🏆 ${this.project.name}`)

.setDescription(

`✅ Monumen berhasil diselesaikan!

👷 Kontributor : **${this.workers.size}**

🎁 Semua kontributor mendapat **+10 poin**

🕑 Proyek berikutnya muncul **2 jam lagi**.`

)

.setImage(this.project.image)

.setTimestamp()

],

components:[]

});

}catch(err){

console.error(err);

}

const Leaderboard=require("./leaderboard");

await new Leaderboard(this.client).update();

this.nextSpawn=Date.now()+7200000;

}

// =====================
// SCHEDULER
// =====================

startScheduler(){

this.scheduler=setInterval(async()=>{

if(

!this.active&&

Date.now()>=this.nextSpawn

){

await this.spawn();

}

},30000);

}

}

// =====================
// EXPORT
// =====================

module.exports=Monumen;