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

            // ======================
            // SEMUA USER
            // ======================

            const allUsers = database.leaderboard();

            // ======================
            // TOP 10 LEADERBOARD
            // ======================

            const users = allUsers.slice(0, 10);

            let text = "";

            if (users.length === 0) {

                text = "Belum ada pemain.";

            } else {

                users.forEach((user, index) => {

                    const medal =
                        index === 0 ? "🥇" :
                        index === 1 ? "🥈" :
                        index === 2 ? "🥉" :
                        "🏅";

                    text +=
`${medal} **${user.username}**
⭐ ${user.points} | 🦅 ${user.garuda || 0} | 🏗️ ${user.monumen || 0}

`;

                });

            }

            // ======================
            // TOTAL ROBUX
            // SEMUA USER
            // ======================

            let robuxText = "";
            let totalRobux = 0;

            allUsers
    .filter(user => (user.robux || 0) > 0)
    .forEach(user => {

        robuxText +=
`${user.username} — 💎 ${user.robux} ⏣\n`;

        totalRobux +=
            user.robux || 0;

    });

            if (!robuxText) {

                robuxText =
                    "Belum ada yang menukar Robux.";

            }

            // ======================
            // EMBED
            // ======================

            const embed = new EmbedBuilder()

                .setColor("#F1C40F")

                .setTitle("🏆 LEADERBOARD KEMERDEKAAN")

                .setDescription(
`${text}
━━━━━━━━━━━━━━━━━━━━

💎 **TOTAL ROBUX DIDAPAT**

${robuxText}

━━━━━━━━━━━━━━━━━━━━`
                )

                .setFooter({
                    text: "🇮🇩 Event Kemerdekaan 2026"
                })

                .setTimestamp();

            // ======================
            // UPDATE PESAN LAMA
            // ======================

            if (database.events.leaderboardMessage) {

                try {

                    const msg = await channel.messages.fetch(
                        database.events.leaderboardMessage
                    );

                    await msg.edit({
                        embeds: [embed]
                    });

                    return;

                } catch (err) {

                    console.log(
                        "⚠️ Pesan leaderboard lama tidak ditemukan."
                    );

                }

            }

            // ======================
            // BUAT PESAN BARU
            // ======================

            const msg = await channel.send({
                embeds: [embed]
            });

            database.events.leaderboardMessage = msg.id;

            database.saveEvents();

        } catch (err) {

            console.error(
                "❌ Leaderboard Error:",
                err
            );

        }

    }

}

module.exports = Leaderboard;