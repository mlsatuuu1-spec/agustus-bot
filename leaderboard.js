const { EmbedBuilder } = require("discord.js");
const database = require("./database");

class Leaderboard {

    constructor(client) {
        this.client = client;
    }

    async update() {

        if (!process.env.LEADERBOARD_CHANNEL) return;

        try {

            const channel = await this.client.channels.fetch(
                process.env.LEADERBOARD_CHANNEL
            );

            const users = database
                .leaderboard()
                .slice(0, 10);

            let text = "";

            if (users.length === 0) {

                text = "Belum ada pemain.";

            } else {

                users.forEach((user, index) => {

 const medal =

index===0?"🥇":

index===1?"🥈":

index===2?"🥉":

"🏅";

text +=

`${medal} **${user.username}**

━━━━━━━━━━━━━━━━━━

⭐ **Poin**
${user.points}

⏣ **Robux**
${user.robux||0}

🦅 **Garuda**
${user.garuda||0}

🏗️ **Monumen**
${user.monumen||0}

━━━━━━━━━━━━━━━━━━

`;

                });

            }

            const embed = new EmbedBuilder()

                .setColor("#FFD700")

                .setTitle("🏆 LEADERBOARD GARUDA")

                .setDescription(text)

                .setFooter({
                    text: "Update Otomatis"
                })

                .setTimestamp();

            if (database.events.leaderboardMessage) {

                try {

                    const msg = await channel.messages.fetch(
                        database.events.leaderboardMessage
                    );

                    await msg.edit({
                        embeds: [embed]
                    });

                    return;

                } catch (err) {}

            }

            const msg = await channel.send({
                embeds: [embed]
            });

            database.events.leaderboardMessage = msg.id;

            database.saveEvents();

        } catch (err) {

            console.error(err);

        }

    }

}

module.exports = Leaderboard;
