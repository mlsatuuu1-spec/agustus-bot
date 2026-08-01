const {
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle
}=require("discord.js");

const {
events,
addPoint,
removePoint,
saveEvents
}=require("./database");

const {
randomReward
}=require("./utils");

let active=false;

let claimed=new Set();

class Garuda{

constructor(client){

this.client=client;

}

embed(){

return new EmbedBuilder()

.setColor("#E11D48")

.setTitle("🦅 GARUDA MUNCUL!")

.setDescription(

`🇮🇩 Garuda sedang melintas!

Semua member boleh menangkap Garuda.

⏳ Waktu : **30 Detik**

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

.setStyle(ButtonStyle.Danger)

.setLabel("🦅 Tangkap Garuda")

);

}
  async spawn(){

const channel=

await this.client.channels.fetch(

process.env.EVENT_CHANNEL

);

active=true;

claimed.clear();

if(events.garudaMessage){

try{

const old=

await channel.messages.fetch(

events.garudaMessage

);

await old.delete();

}catch(err){}

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

await channel.messages.fetch(

msg.id

);

await message.edit({

components:[]

});

}catch(err){}

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

reward.point>=0

?0x57F287

:0xED4245

)

.setTitle(

`${reward.emoji} ${interaction.user.username}`

)

.setDescription(

`${reward.text}

**${reward.point>=0?"+":""}${reward.point} poin**

🏆 Total Poin : **${user.points}**`

)

.setTimestamp()

]

});

await interaction.reply({

content:

`${reward.text}

${reward.point>=0?"+":""}${reward.point} poin

🏆 Total poin kamu : ${user.points}`,

ephemeral:true

});

  }
  start(){

// Tes dulu, nanti kita ubah menjadi 20x per hari
this.spawn();

}

schedule(){

// Placeholder
// Nanti kita isi scheduler 20x sehari
// setelah Garuda berhasil jalan

}

}

module.exports=Garuda;
