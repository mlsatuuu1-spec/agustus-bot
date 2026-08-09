const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const database = require("./database");

class CuriPoin {

    constructor(client) {

        this.client = client;

        // Cooldown pencuri
        this.cooldown = new Map();

        // Cooldown korban
        this.targetCooldown = new Map();

        // Pencurian yang sedang berlangsung
        this.activeThefts = new Map();

        // Pesan utama game
        this.message = null;

    }

    // =====================
    // EMBED UTAMA
    // =====================

    buildEmbed() {

        return new EmbedBuilder()

            .setColor("#8E44AD")

            .setTitle("🥷 CURI POIN")

            .setDescription(

`💰 **CURIGAN POIN DIMULAI!**

Setiap member bisa mencoba mencuri
poin member lain.

━━━━━━━━━━━━━━━━━━━━

🥷 **CARA BERMAIN**

Klik tombol **Curi Poin**.

Bot akan memilih target secara random.

💰 Maksimal curian:
**10 Poin**

⏳ Cooldown:
**1 Jam**

━━━━━━━━━━━━━━━━━━━━

🛡️ **TAHAN CURIAN**

Target memiliki waktu **30 detik**
untuk mempertahankan poinnya.

Jika target berhasil menahan:

🥷 Pencuri **-10 Poin**

Jika target tidak melakukan apa-apa:

🥷 Pencuri berhasil mendapatkan poin.`

            )

            .setFooter({
                text: "🇮🇩 Event Kemerdekaan 2026"
            })

            .setTimestamp();

    }

    // =====================
    // BUTTON UTAMA
    // =====================

    buildButton() {

        return new ActionRowBuilder()

            .addComponents(

                new ButtonBuilder()

                    .setCustomId("curi_poin")

                    .setEmoji("🥷")

                    .setLabel("Curi Poin")

                    .setStyle(ButtonStyle.Danger)

            );

    }

    // =====================
    // START
    // =====================

    async start() {

        console.log("🥷 Curi Poin Module Loaded");

        if (!process.env.CURI_CHANNEL) {

            console.log(
                "⚠️ CURI_CHANNEL belum diset di Railway."
            );

            return;

        }

        try {

            const channel =
                await this.client.channels.fetch(
                    process.env.CURI_CHANNEL
                );

            // =====================
            // HAPUS PANEL LAMA
            // =====================

            if (this.message) {

                try {

                    await this.message.delete();

                } catch (err) {}

            }

            // =====================
            // KIRIM PANEL
            // =====================

            this.message = await channel.send({

                embeds: [
                    this.buildEmbed()
                ],

                components: [
                    this.buildButton()
                ]

            });

            console.log(
                "🥷 Panel Curi Poin berhasil dibuat."
            );

        } catch (err) {

            console.error(
                "❌ Gagal menjalankan Curi Poin:",
                err
            );

        }

    }

    // =====================
    // HANDLE INTERACTION
    // =====================

    async handle(interaction) {

        if (!interaction.isButton()) return;

        // =====================
        // TOMBOL CURI
        // =====================

        if (
            interaction.customId === "curi_poin"
        ) {

            await this.steal(interaction);

            return;

        }

        // =====================
        // TOMBOL TAHAN
        // =====================

        if (
            interaction.customId.startsWith(
                "tahan_curian_"
            )
        ) {

            await this.defend(interaction);

            return;

        }

    }

    // =====================
    // MULAI PENCURIAN
    // =====================

    async steal(interaction) {

        const thiefId =
            interaction.user.id;

        const thiefUsername =
            interaction.user.username;

        const now = Date.now();

        // =====================
        // CEK COOLDOWN PENCURI
        // =====================

        const lastSteal =
            this.cooldown.get(thiefId) || 0;

        if (
            now - lastSteal <
            60 * 60 * 1000
        ) {

            const remaining =
                (lastSteal +
                    60 * 60 * 1000) -
                now;

            const minutes =
                Math.ceil(
                    remaining / 60000
                );

            return interaction.reply({

                content:
                    `⏳ Kamu masih dalam cooldown.\n\n` +
                    `🥷 Bisa mencuri lagi dalam **${minutes} menit**.`,

                ephemeral: true

            });

        }

        // =====================
        // CEK DATA PENCURI
        // =====================

        const thief =
            database.getUser(
                thiefId,
                thiefUsername
            );

        // =====================
        // MINIMAL 10 POIN
        // =====================

        if (thief.points < 10) {

            return interaction.reply({

                content:
                    "❌ Kamu membutuhkan minimal **10 poin** untuk mencuri.",

                ephemeral: true

            });

        }

        // =====================
        // CARI TARGET
        // =====================

        const allUsers =
            database.leaderboard();

        const possibleTargets =
            allUsers.filter(user => {

                if (user.id === thiefId)
                    return false;

                if ((user.points || 0) < 10)
                    return false;

                const targetLast =
                    this.targetCooldown.get(
                        user.id
                    ) || 0;

                if (
                    now - targetLast <
                    60 * 60 * 1000
                ) {

                    return false;

                }

                return true;

            });

        // =====================
        // TIDAK ADA TARGET
        // =====================

        if (
            possibleTargets.length === 0
        ) {

            return interaction.reply({

                content:
                    "🥷 Tidak ada target yang bisa dicuri saat ini.",

                ephemeral: true

            });

        }

        // =====================
        // PILIH TARGET RANDOM
        // =====================

        const target =
            possibleTargets[
                Math.floor(
                    Math.random() *
                    possibleTargets.length
                )
            ];

        // =====================
        // JUMLAH CURIAN
        // =====================

        const amount =
            Math.min(
                10,
                target.points
            );

        // =====================
        // BUAT ID PENCURIAN
        // =====================

        const theftId =
            `${thiefId}_${target.id}_${Date.now()}`;

        // =====================
        // COOLDOWN LANGSUNG
        // =====================

        this.cooldown.set(
            thiefId,
            now
        );

        this.targetCooldown.set(
            target.id,
            now
        );

        // =====================
        // SIMPAN PENCURIAN
        // =====================

        this.activeThefts.set(
            theftId,
            {

                thiefId,

                thiefUsername,

                targetId:
                    target.id,

                targetUsername:
                    target.username,

                amount,

                resolved: false

            }
        );

        // =====================
        // BALAS PENCURI
        // =====================

        await interaction.reply({

            content:
                `🥷 Kamu mencoba mencuri **${amount} poin** dari **${target.username}**!`,

            ephemeral: true

        });

        // =====================
        // CARI CHANNEL
        // =====================

        const channel =
            interaction.channel;

        // =====================
        // TOMBOL TAHAN
        // =====================

        const row =
            new ActionRowBuilder()

                .addComponents(

                    new ButtonBuilder()

                        .setCustomId(
                            `tahan_curian_${theftId}`
                        )

                        .setEmoji("🛡️")

                        .setLabel(
                            "Tahan Curian!"
                        )

                        .setStyle(
                            ButtonStyle.Success
                        )

                );

        // =====================
        // NOTIF TARGET
        // =====================

        await channel.send({

            content:
                `<@${target.id}> 🚨 **POINMU SEDANG DICURI!**`,

            embeds: [

                new EmbedBuilder()

                    .setColor("#E74C3C")

                    .setTitle("🥷 PENCURIAN TERDETEKSI!")

                    .setDescription(

`**${thief.username}** sedang mencoba mencuri poinmu!

━━━━━━━━━━━━━━━━━━━━

💰 Jumlah:
**${amount} Poin**

🥷 Pencuri:
**${thief.username}**

⏳ Waktu:
**30 Detik**

━━━━━━━━━━━━━━━━━━━━

🛡️ Tekan tombol di bawah
untuk mempertahankan poinmu.

Jika tidak melakukan apa-apa,
pencurian akan berhasil.`

                    )

                    .setFooter({
                        text:
                            "🇮🇩 Lindungi poinmu!"
                    })

                    .setTimestamp()

            ],

            components: [
                row
            ],

            allowedMentions: {

                users: [
                    target.id
                ]

            }

        });

        // =====================
        // WAKTU 30 DETIK
        // =====================

        setTimeout(
            async () => {

                await this.finishTheft(
                    theftId
                );

            },
            30000
        );

    }

    // =====================
    // TAHAN CURIAN
    // =====================

    async defend(interaction) {

        const prefix =
            "tahan_curian_";

        const theftId =
            interaction.customId.slice(
                prefix.length
            );

        const theft =
            this.activeThefts.get(
                theftId
            );

        // =====================
        // PENCURIAN TIDAK ADA
        // =====================

        if (!theft) {

            return interaction.reply({

                content:
                    "❌ Pencurian sudah selesai.",

                ephemeral: true

            });

        }

        // =====================
        // SUDAH SELESAI
        // =====================

        if (theft.resolved) {

            return interaction.reply({

                content:
                    "❌ Pencurian sudah selesai.",

                ephemeral: true

            });

        }

        // =====================
        // HANYA TARGET
        // =====================

        if (
            interaction.user.id !==
            theft.targetId
        ) {

            return interaction.reply({

                content:
                    "🛡️ Hanya target yang bisa menahan pencurian ini.",

                ephemeral: true

            });

        }

        // =====================
        // TANDAI SELESAI
        // =====================

        theft.resolved = true;

        // =====================
        // KURANGI POIN PENCURI
        // =====================

        const thief =
            database.getUser(
                theft.thiefId,
                theft.thiefUsername
            );

        database.removePoint(
            theft.thiefId,
            theft.thiefUsername,
            10
        );

        database.saveUsers();

        // =====================
        // UPDATE LEADERBOARD
        // =====================

        try {

            const Leaderboard =
                require("./leaderboard");

            await new Leaderboard(
                this.client
            ).update();

        } catch (err) {

            console.error(err);

        }

        // =====================
        // UPDATE PESAN
        // =====================

        try {

            await interaction.message.edit({

                embeds: [

                    new EmbedBuilder()

                        .setColor("#2ECC71")

                        .setTitle(
                            "🛡️ CURIAN DIGAGALKAN!"
                        )

                        .setDescription(

`🛡️ **${theft.targetUsername}** berhasil mempertahankan poinnya!

━━━━━━━━━━━━━━━━━━━━

🥷 Pencuri:
**${theft.thiefUsername}**

💀 Hukuman:
**-10 Poin**

💰 Target kehilangan:
**0 Poin**

━━━━━━━━━━━━━━━━━━━━

🇮🇩 Poin berhasil diamankan!`

                        )

                        .setTimestamp()

                ],

                components: []

            });

        } catch (err) {

            console.error(err);

        }

        // =====================
        // HAPUS DATA
        // =====================

        this.activeThefts.delete(
            theftId
        );

    }

    // =====================
    // PENCURIAN SELESAI
    // =====================

    async finishTheft(theftId) {

        const theft =
            this.activeThefts.get(
                theftId
            );

        if (!theft) return;

        if (theft.resolved) return;

        theft.resolved = true;

        // =====================
        // PINDAHKAN POIN
        // =====================

        database.removePoint(
            theft.targetId,
            theft.targetUsername,
            theft.amount
        );

        database.addPoint(
            theft.thiefId,
            theft.thiefUsername,
            theft.amount
        );

        database.saveUsers();

        // =====================
        // UPDATE LEADERBOARD
        // =====================

        try {

            const Leaderboard =
                require("./leaderboard");

            await new Leaderboard(
                this.client
            ).update();

        } catch (err) {

            console.error(err);

        }

        // =====================
        // CARI CHANNEL
        // =====================

        let channel = null;

        try {

            channel =
                await this.client.channels.fetch(
                    process.env.CURI_CHANNEL
                );

        } catch (err) {

            console.error(err);

        }

        // =====================
        // HASIL
        // =====================

        if (channel) {

            await channel.send({

                embeds: [

                    new EmbedBuilder()

                        .setColor("#9B59B6")

                        .setTitle(
                            "🥷 PENCURIAN BERHASIL!"
                        )

                        .setDescription(

`💰 **${theft.thiefUsername}** berhasil mencuri dari **${theft.targetUsername}**!

━━━━━━━━━━━━━━━━━━━━

🥷 Pencuri:
**+${theft.amount} Poin**

💀 Korban:
**-${theft.amount} Poin**

━━━━━━━━━━━━━━━━━━━━

⏳ Pencurian berikutnya bisa dilakukan
setelah cooldown.`

                        )

                        .setFooter({

                            text:
                                "🇮🇩 Event Kemerdekaan 2026"

                        })

                        .setTimestamp()

                ]

            });

        }

        // =====================
        // HAPUS DATA
        // =====================

        this.activeThefts.delete(
            theftId
        );

    }

}

// =====================
// EXPORT
// =====================

module.exports = CuriPoin;