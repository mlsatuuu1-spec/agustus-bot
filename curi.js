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

        // =====================
        // COOLDOWN PENCURI
        // =====================

        this.cooldown = new Map();

        // =====================
        // COOLDOWN TARGET
        // =====================

        this.targetCooldown = new Map();

        // =====================
        // PENCURIAN AKTIF
        // =====================

        this.activeThefts = new Map();

        // =====================
        // PESAN UTAMA
        // =====================

        this.message = null;

    }

    // ==================================================
    // EMBED UTAMA
    // ==================================================

    buildEmbed() {

    return new EmbedBuilder()

        .setColor("#D62828")

        .setTitle("🇮🇩 🥷 OPERASI CURI POIN")

        .setDescription(

`🔥 **MISIKAN KEBERANIANMU DI HARI KEMERDEKAAN!**

Ada poin member lain yang menggiurkan?

🥷 **CURI SEKARANG!**

━━━━━━━━━━━━━━━━━━━━

🎯 **CARA BERMAIN**

Klik tombol **Curi Poin**.

Bot akan memilih target secara
**random berdasarkan jumlah poin**.


━━━━━━━━━━━━━━━━━━━━

💰 **HADIAH & RISIKO**

💰 Berhasil mencuri:
**hingga 25 poin**

🛡️ Target punya:
**30 detik** untuk bertahan

❌ Jika berhasil ditahan:
Pencuri kehilangan **10 poin**

━━━━━━━━━━━━━━━━━━━━

⏱️ **COOLDOWN**

🥷 Bisa mencuri lagi setiap
**10 menit**

━━━━━━━━━━━━━━━━━━━━

🇮🇩 **17 AGUSTUS SPECIAL EVENT**

⚔️ Rebut poin sebanyak-banyaknya!

🔥 **MERDEKA ATAU KEHILANGAN POIN!**`

        )

        .setFooter({

            text:
                "🇮🇩 HUT KEMERDEKAAN • 17 AGUSTUS 2026"

        })

        .setTimestamp();

}

    // ==================================================
    // BUTTON UTAMA
    // ==================================================

    buildButton() {

    return new ActionRowBuilder()

        .addComponents(

            new ButtonBuilder()

                .setCustomId("curi_poin")

                .setEmoji("🇮🇩")

                .setLabel("RAMPAS POIN!")

                .setStyle(ButtonStyle.Danger)

        );

}

    // ==================================================
    // START
    // ==================================================

    async start() {

        console.log("🥷 Curi Poin Module Loaded");

        if (!process.env.CURI_CHANNEL) {

            console.log(
                "⚠️ CURI_CHANNEL belum diset."
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

            this.message =
                await channel.send({

                    embeds: [
                        this.buildEmbed()
                    ],

                    components: [
                        this.buildButton()
                    ]

                });

            console.log(
                "🥷 Panel Curi Poin aktif."
            );

        } catch (err) {

            console.error(
                "❌ Gagal membuat panel Curi Poin:",
                err
            );

        }

    }

    // ==================================================
    // HANDLE BUTTON
    // ==================================================

    async handle(interaction) {

        if (!interaction.isButton())
            return;

        // =====================
        // CURI POIN
        // =====================

        if (
            interaction.customId ===
            "curi_poin"
        ) {

            await this.steal(interaction);

            return;

        }

        // =====================
        // TAHAN CURIAN
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

    // ==================================================
    // MULAI PENCURIAN
    // ==================================================

    async steal(interaction) {

        const thiefId =
            interaction.user.id;

        const thiefUsername =
            interaction.user.username;

        const now = Date.now();

        // ==================================================
        // CEK COOLDOWN PENCURI
        // ==================================================

        const lastSteal =
            this.cooldown.get(
                thiefId
            ) || 0;

        const cooldownTime =
            30 * 60 * 1000;

        if (
            now - lastSteal <
            cooldownTime
        ) {

            const remaining =
                lastSteal +
                cooldownTime -
                now;

            const minutes =
                Math.ceil(
                    remaining / 60000
                );

            return interaction.reply({

                content:
                    `⏳ Kamu masih cooldown!\n\n` +
                    `🥷 Bisa mencuri lagi dalam **${minutes} menit**.`,

                ephemeral: true

            });

        }

        // ==================================================
        // DATA PENCURI
        // ==================================================

        const thief =
            database.getUser(
                thiefId,
                thiefUsername
            );

        // ==================================================
        // MINIMAL 25 POIN
        // ==================================================

        if (
            (thief.points || 0) < 25
        ) {

            return interaction.reply({

                content:
                    "❌ Kamu membutuhkan minimal **10 poin** untuk mencuri.",

                ephemeral: true

            });

        }

        // ==================================================
        // CARI TARGET
        // ==================================================

        const allUsers =
            database.leaderboard();

        const possibleTargets =
            allUsers.filter(user => {

                if (
                    user.id === thiefId
                ) {

                    return false;

                }

                if (
                    (user.points || 0) < 25
                ) {

                    return false;

                }

                const targetLast =
                    this.targetCooldown.get(
                        user.id
                    ) || 0;

                if (
                    now - targetLast <
                    cooldownTime
                ) {

                    return false;

                }

                return true;

            });

        // ==================================================
        // TIDAK ADA TARGET
        // ==================================================

        if (
            possibleTargets.length === 0
        ) {

            return interaction.reply({

                content:
                    "🥷 Saat ini tidak ada target yang bisa dicuri.",

                ephemeral: true

            });

        }

        // ==================================================
// RANDOM TARGET BERDASARKAN JUMLAH POIN
// Semakin banyak poin = semakin besar peluang
// ==================================================

const weightedTargets = [];

possibleTargets.forEach(user => {

    const points = user.points || 0;

    let weight = 1;

    if (points >= 450) {

        weight = 10;

    } else if (points >= 400) {

        weight = 7;

    } else if (points >= 300) {

        weight = 5;

    } else if (points >= 200) {

        weight = 3;

    } else if (points >= 100) {

        weight = 1;

    }

    for (let i = 0; i < weight; i++) {

        weightedTargets.push(user);

    }

});

const target =
    weightedTargets[
        Math.floor(
            Math.random() *
            weightedTargets.length
        )
    ];
         // ==================================================
        // JUMLAH CURIAN
        // ==================================================

        const amount =
            Math.min(
                25,
                target.points
            );

        // ==================================================
        // ID PENCURIAN
        // ==================================================

        const theftId =
            `${thiefId}_${target.id}_${Date.now()}`;

        // ==================================================
        // SET COOLDOWN
        // ==================================================

        this.cooldown.set(
            thiefId,
            now
        );

        this.targetCooldown.set(
            target.id,
            now
        );

        // ==================================================
        // SIMPAN PENCURIAN
        // ==================================================

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

                resolved: false,

                alertMessage: null

            }

        );

        // ==================================================
        // BALAS PENCURI
        // ==================================================

        await interaction.reply({

            content:
                `🥷 Kamu mencoba mencuri **${amount} poin** dari **${target.username}**!`,

            ephemeral: true

        });

        // ==================================================
        // CHANNEL
        // ==================================================

        const channel =
            interaction.channel;

        // ==================================================
        // BUTTON TAHAN
        // ==================================================

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

        // ==================================================
        // PESAN TARGET
        // ==================================================

        const alertMessage =
            await channel.send({

                content:
                    `<@${target.id}> 🚨 **POINMU SEDANG DICURI!**`,

                embeds: [

                    new EmbedBuilder()

                        .setColor("#E74C3C")

                        .setTitle(
                            "🥷 PENCURIAN TERDETEKSI!"
                        )

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

        // ==================================================
        // SIMPAN PESAN
        // ==================================================

        const theft =
            this.activeThefts.get(
                theftId
            );

        if (theft) {

            theft.alertMessage =
                alertMessage;

        }

        // ==================================================
        // AUTO SELESAI 30 DETIK
        // ==================================================

        setTimeout(
            async () => {

                await this.finishTheft(
                    theftId
                );

            },
            30000
        );

    }

    // ==================================================
    // TAHAN CURIAN
    // ==================================================

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

        // ==================================================
        // CEK PENCURIAN
        // ==================================================

        if (!theft) {

            return interaction.reply({

                content:
                    "❌ Pencurian sudah selesai.",

                ephemeral: true

            });

        }

        // ==================================================
        // CEK SUDAH SELESAI
        // ==================================================

        if (
            theft.resolved
        ) {

            return interaction.reply({

                content:
                    "❌ Pencurian sudah selesai.",

                ephemeral: true

            });

        }

        // ==================================================
        // HANYA TARGET YANG BOLEH MENAHAN
        // ==================================================

        if (
            interaction.user.id !==
            theft.targetId
        ) {

            return interaction.reply({

                content:
                    "🛡️ Bukan kamu anying yang dicuri.",

                ephemeral: true

            });

        }

        // ==================================================
        // SELESAIKAN PENCURIAN
        // ==================================================

        theft.resolved = true;

        // ==================================================
        // PENCURI KENA -10
        // ==================================================

        database.removePoint(

            theft.thiefId,

            theft.thiefUsername,

            25

        );

        database.saveUsers();

        // ==================================================
        // LOG KE CHANNEL PEROLEHAN POIN
        // ==================================================

        await this.sendPointLog(

            "defend",

            {

                thiefUsername:
                    theft.thiefUsername,

                targetUsername:
                    theft.targetUsername,

                amount: 25

            }

        );

        // ==================================================
        // UPDATE LEADERBOARD
        // ==================================================

        try {

            const Leaderboard =
                require("./leaderboard");

            await new Leaderboard(
                this.client
            ).update();

        } catch (err) {

            console.error(
                "❌ Leaderboard error:",
                err
            );

        }

        // ==================================================
        // UBAH PESAN MENJADI HASIL
        // ==================================================

        try {

            await interaction.message.edit({

                content:
                    "🛡️ **CURIAN DIGAGALKAN!**",

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

💀 Hukuman pencuri:
**-25 Poin**

💰 Target kehilangan:
**0 Poin**

━━━━━━━━━━━━━━━━━━━━

🇮🇩 Poin berhasil diamankan!`

                        )

                        .setFooter({

                            text:
                                "🇮🇩 Event Kemerdekaan 2026"

                        })

                        .setTimestamp()

                ],

                components: []

            });

        } catch (err) {

            console.error(
                "❌ Gagal update pesan curian:",
                err
            );

        }

        // ==================================================
        // HAPUS PESAN SETELAH 10 DETIK
        // ==================================================

        setTimeout(

            async () => {

                try {

                    await interaction.message.delete();

                } catch (err) {}

            },

            10000

        );

        // ==================================================
        // HAPUS DATA PENCURIAN
        // ==================================================

        this.activeThefts.delete(
            theftId
        );

    }

    // ==================================================
    // PENCURIAN BERHASIL
    // ==================================================

    async finishTheft(theftId) {

        const theft =
            this.activeThefts.get(
                theftId
            );

        // ==================================================
        // CEK DATA
        // ==================================================

        if (!theft)
            return;

        if (
            theft.resolved
        )
            return;

        // ==================================================
        // TANDAI SELESAI
        // ==================================================

        theft.resolved = true;

        // ==================================================
        // KURANGI POIN KORBAN
        // ==================================================

        database.removePoint(

            theft.targetId,

            theft.targetUsername,

            theft.amount

        );

        // ==================================================
        // TAMBAH POIN PENCURI
        // ==================================================

        database.addPoint(

            theft.thiefId,

            theft.thiefUsername,

            theft.amount

        );

        database.saveUsers();

        // ==================================================
        // LOG KE CHANNEL PEROLEHAN POIN
        // ==================================================

        await this.sendPointLog(

            "success",

            {

                thiefUsername:
                    theft.thiefUsername,

                targetUsername:
                    theft.targetUsername,

                amount:
                    theft.amount

            }

        );

        // ==================================================
        // UPDATE LEADERBOARD
        // ==================================================

        try {

            const Leaderboard =
                require("./leaderboard");

            await new Leaderboard(
                this.client
            ).update();

        } catch (err) {

            console.error(
                "❌ Leaderboard error:",
                err
            );

        }

        // ==================================================
        // UPDATE PESAN PENCURIAN
        // ==================================================

        if (
            theft.alertMessage
        ) {

            try {

                await theft.alertMessage.edit({

                    content:
                        "🥷 **PENCURIAN BERHASIL!**",

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

                    ],

                    components: []

                });

            } catch (err) {

                console.error(
                    "❌ Gagal update pesan pencurian:",
                    err
                );

            }

        }

        // ==================================================
        // HAPUS PESAN SETELAH 10 DETIK
        // ==================================================

        if (
            theft.alertMessage
        ) {

            setTimeout(

                async () => {

                    try {

                        await theft.alertMessage.delete();

                    } catch (err) {}

                },

                10000

            );

        }

    }

    // ==================================================
    // LOG KE CHANNEL PEROLEHAN POIN
    // ==================================================

    async sendPointLog(type, data) {

        // ==================================================
        // CEK CHANNEL
        // ==================================================

        if (!process.env.LOG_CHANNEL)
            return;

        try {

            const channel =
                await this.client.channels.fetch(
                    process.env.LOG_CHANNEL
                );

            // ==================================================
            // CURI BERHASIL
            // ==================================================

            if (
                type === "success"
            ) {

                const embed =
                    new EmbedBuilder()

                        .setColor("#9B59B6")

                        .setTitle(
                            "🥷 CURI POIN BERHASIL"
                        )

                        .setDescription(

`💰 **${data.thiefUsername}** berhasil mencuri poin!

━━━━━━━━━━━━━━━━━━━━

🥷 **Pencuri**
${data.thiefUsername}

💰 **Mendapatkan**
**+${data.amount} Poin**

💀 **Korban**
${data.targetUsername}

📉 **Kehilangan**
**-${data.amount} Poin**

━━━━━━━━━━━━━━━━━━━━

🎉 Pencurian berhasil!`

                        )

                        .setFooter({

                            text:
                                "🇮🇩 Perolehan Poin • Event Kemerdekaan 2026"

                        })

                        .setTimestamp();

                await channel.send({

                    embeds: [
                        embed
                    ]

                });

                return;

            }

            // ==================================================
            // CURI GAGAL / DITAHAN
            // ==================================================

            if (
                type === "defend"
            ) {

                const embed =
                    new EmbedBuilder()

                        .setColor("#E74C3C")

                        .setTitle(
                            "🛡️ CURI POIN DIGAGALKAN"
                        )

                        .setDescription(

`🛡️ **${data.targetUsername}** berhasil menahan pencurian!

━━━━━━━━━━━━━━━━━━━━

🥷 **Pencuri**
${data.thiefUsername}

💀 **Hukuman**
**-25 Poin**

🛡️ **Korban**
${data.targetUsername}

💰 **Kehilangan Korban**
**0 Poin**

━━━━━━━━━━━━━━━━━━━━

❌ Pencurian berhasil digagalkan!`

                        )

                        .setFooter({

                            text:
                                "🇮🇩 Perolehan Poin • Event Kemerdekaan 2026"

                        })

                        .setTimestamp();

                await channel.send({

                    embeds: [
                        embed
                    ]

                });

            }

        } catch (err) {

            console.error(
                "❌ Gagal mengirim log Curi Poin:",
                err
            );

        }

    }

    // ==================================================
    // END OF CLASS
    // ==================================================

}

// ==================================================
// EXPORT
// ==================================================

module.exports = CuriPoin;