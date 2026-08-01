const {
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle
} = require("discord.js");

const {
events,
addPoint,
removePoint,
saveEvents
} = require("./database");

const {
randomReward
} = require("./utils");

let claimed = new Set();

let active = false;

class GarudaEvent{

constructor(client){

this.client = client;

}

embed(){

return new EmbedBuilder()

.setColor("#E11D48")

.setTitle("🦅 GARUDA MUNCUL!")

.setDescription(
`🇮🇩 Garuda sedang melintas!

Semua member boleh menangkap!

⏳ Waktu : **30 detik**

Klik tombol di bawah sebelum Garuda kabur!`
)

.setFooter({

text:"Event Kemerdekaan"

})

.setTimestamp();

}

button(){

return new ActionRowBuilder()

.addComponents(

new ButtonBuilder()

.setCustomId("garuda")

.setLabel("🦅 Tangkap Garuda")

.setStyle(ButtonStyle.Danger)

);

}
  async spawn(){

const channel=

await this.client.channels.fetch(

process.env.EVENT_CHANNEL

);

claimed.clear();

active=true;

if(events.garudaMessage){

try{

const old=

await channel.messages.fetch(

events.garudaMessage

);

await old.delete();

}catch{}

}

const msg=

await channel.send({

embeds:[this.embed()],

components:[this.button()]

});

events.garudaMessage=msg.id;

saveEvents();
setTimeout(async()=>{

active=false;

try{

const message=

await channel.messages.fetch(msg.id);

await message.edit({

components:[]

});

}catch{}

},30000);

  }
  async handle(interaction){

if(!interaction.isButton()) return;

if(interaction.customId!=="garuda") return;

if(!active){

return interaction.reply({

content:"🦅 Garuda sudah kabur.",

ephemeral:true

});

}

const id=interaction.user.id;

if(claimed.has(id)){

return interaction.reply({

content:"❌ Kamu sudah menangkap Garuda kali ini.",

ephemeral:true

});

}

claimed.add(id);

const reward=randomReward();

let user;

if(reward.point>=0){

user=addPoint(

id,

interaction.user.username,

reward.point

);

}else{

user=removePoint(

id,

interaction.user.username,

Math.abs(reward.point)

);

}
    const log=

await this.client.channels.fetch(

process.env.LOG_CHANNEL

);

await log.send({

embeds:[

new EmbedBuilder()

.setColor(

reward.point>=0?

0x57F287:

0xED4245

)

.setTitle(`${reward.emoji} ${interaction.user.username}`)

.setDescription(

`${reward.text}

**${reward.point>=0?"+":""}${reward.point} poin**

Total poin : **${user.points}**`

)

.setTimestamp()

]

});
    await interaction.reply({

content:

`${reward.text}

${reward.point>=0?"+":""}${reward.point} poin

Total poin kamu : ${user.points}`,

ephemeral:true

});

}

}

module.exports=GarudaEvent;
// ======================
// RANDOM TIME
// ======================

schedule(){

const now=new Date();

const tomorrow=new Date();

tomorrow.setDate(now.getDate()+1);

tomorrow.setHours(0,0,0,0);

const list=[];

for(let i=0;i<20;i++){

const minute=

Math.floor(

Math.random()*1440

);

list.push(minute);

}

list.sort((a,b)=>a-b);

this.times=list;

console.log("Garuda Schedule");

console.log(list);


}
start(){

this.schedule();

this.loop();

}
loop(){

setInterval(()=>{

const now=new Date();

const minute=

now.getHours()*60+

now.getMinutes();

if(this.times.includes(minute)){

this.spawn();

}

},30000);

}
module.exports=GarudaEvent;
