const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const database = require("./database");

class Panjat {

    constructor(client) {

        this.client = client;

        // ======================
        // 4 SLOT PASKIBRAKA
        // ======================

        this.slots = [
            null,
            null,
            null,
            null
        ];

        // ======================
        // PESAN PANEL
        // ======================

        this.message = null;

        // ======================
        // TIMER REWARD
        // ======================

        this.rewardInterval = null;

    }


    // ==================================================
    // LOAD DATA
    // ==================================================

    loadData() {

        if (!database.events) {
            database.events = {};
        }

        if (!database.events.paskibraka) {

            database.events.paskibraka = {

                slots: [
                    null,
                    null,
                    null,
                    null
                ],

                lastReward: Date.now()

            };

            database.saveEvents();

        }

        this.slots =
            database.events.paskibraka.slots || [
                null,
                null,
                null,
                null
            ];

        if (
            !database.events.paskibraka.lastReward
        ) {

            database.events.paskibraka.lastReward =
                Date.now();

            database.saveEvents();

        }

    }


    // ==================================================
    // SAVE DATA
    // ==================================================

    saveData() {

        database.events.paskibraka = {

            slots: this.slots,

            lastReward:
                database.events.paskibraka.lastReward

        };

        database.saveEvents();

    }


    // ==================================================
    // BUILD EMBED
    // ==================================================

    buildEmbed() {

        const names = [

            "🥇 **PASKIBRAKA 1**",
            "🥈 **PASKIBRAKA 2**",
            "🥉 **PASKIBRAKA 3**",
            "🏅 **PASKIBRAKA 4**"

        ];

        let text = "";

        this.slots.forEach(
            (slot, index) => {

                if (slot) {

                    text +=
`${names[index]}
👤 **${slot.username}**

`;

                } else {

                    text +=
`${names[index]}
🟢 **KOSONG**

`;

                }

            }
        );


        return new EmbedBuilder()

            .setColor("#D90429")

            .setTitle(
                "🇮🇩 PASKIBRAKA KEMERDEKAAN 2026"
            )

            .setDescription(

`🎖️ **PEREBUTAN 4 POSISI PASKIBRAKA**

Siapa yang mampu bertahan paling lama?

━━━━━━━━━━━━━━━━━━━━

${text}
━━━━━━━━━━━━━━━━━━━━

💰 **REWARD**

⏰ Setiap **1 jam**
🎁 **+10 Poin**

━━━━━━━━━━━━━━━━━━━━

⚔️ **SISTEM REBUTAN**

• Posisi bisa direbut kapan saja.
• Tidak perlu persetujuan pemilik.
• Jika direbut, pemilik lama langsung keluar.
• Satu orang hanya boleh memiliki 1 posisi.

🔥 **PERTAHANKAN POSISIMU!**`

            )

            .setFooter({

                text:
                    "🇮🇩 Event Kemerdekaan 2026 • Paskibraka"

            })

            .setTimestamp();

    }


    // ==================================================
    // BUTTON
    // ==================================================

    buildButtons() {

        const row1 =
            new ActionRowBuilder();

        const row2 =
            new ActionRowBuilder();


        for (
            let i = 0;
            i < 4;
            i++
        ) {

            const button =
                new ButtonBuilder()

                    .setCustomId(
                        `paskibraka_${i}`
                    )

                    .setEmoji("🇮🇩")

                    .setLabel(
                        `Posisi ${i + 1}`
                    )

                    .setStyle(
                        ButtonStyle.Danger
                    );


            if (i < 2) {

                row1.addComponents(
                    button
                );

            } else {

                row2.addComponents(
                    button
                );

            }

        }


        return [
            row1,
            row2
        ];

    }


    // ==================================================
    // UPDATE PANEL
    // ==================================================

    async updatePanel() {

        if (
            !process.env.PANJAT_CHANNEL
        ) {

            console.log(
                "⚠️ PANJAT_CHANNEL belum diset."
            );

            return;

        }


        try {

            const channel =
                await this.client.channels.fetch(
                    process.env.PANJAT_CHANNEL
                );


            // ======================
            // UPDATE PESAN LAMA
            // ======================

            if (
                database.events &&
                database.events.paskibrakaMessage
            ) {

                try {

                    const oldMessage =
                        await channel.messages.fetch(
                            database.events.paskibrakaMessage
                        );


                    await oldMessage.edit({

                        embeds: [
                            this.buildEmbed()
                        ],

                        components:
                            this.buildButtons()

                    });


                    this.message =
                        oldMessage;

                    return;

                } catch (err) {

                    console.log(
                        "⚠️ Panel Paskibraka lama tidak ditemukan."
                    );

                }

            }


            // ======================
            // BUAT PANEL BARU
            // ======================

            const msg =
                await channel.send({

                    embeds: [
                        this.buildEmbed()
                    ],

                    components:
                        this.buildButtons()

                });


            this.message = msg;


            database.events.paskibrakaMessage =
                msg.id;

            database.saveEvents();


            console.log(
                "🇮🇩 Panel Paskibraka dibuat."
            );

        } catch (err) {

            console.error(
                "❌ Gagal membuat panel Paskibraka:",
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


        if (
            !interaction.customId.startsWith(
                "paskibraka_"
            )
        ) {

            return;

        }


        const slotIndex =
            Number(
                interaction.customId.split("_")[1]
            );


        if (
            slotIndex < 0 ||
            slotIndex > 3
        ) {

            return;

        }


        const userId =
            interaction.user.id;

        const username =
            interaction.user.username;


        // ==================================================
        // CEK SLOT YANG SUDAH DIMILIKI
        // ==================================================

        const currentSlot =
            this.slots.findIndex(
                slot =>
                    slot &&
                    slot.id === userId
            );


        // ==================================================
        // SUDAH DI SLOT YANG SAMA
        // ==================================================

        if (
            currentSlot === slotIndex
        ) {

            return interaction.reply({

                content:
                    `🇮🇩 Kamu sudah berada di **Paskibraka ${slotIndex + 1}**!`,

                ephemeral: true

            });

        }


        // ==================================================
        // PINDAH / REBUT SLOT
        // ==================================================

        const oldOwner =
            this.slots[slotIndex];


        // ==================================================
        // KELUARKAN DARI SLOT LAMA
        // ==================================================

        if (
            currentSlot !== -1
        ) {

            this.slots[currentSlot] =
                null;

        }


        // ==================================================
        // PASANG PEMILIK BARU
        // ==================================================

        this.slots[slotIndex] = {

            id: userId,

            username: username

        };


        this.saveData();


        // ==================================================
        // BALAS USER
        // ==================================================

        if (oldOwner) {

            await interaction.reply({

                content:
`⚔️ **POSISI BERHASIL DIREBUT!**

🇮🇩 Kamu merebut **Paskibraka ${slotIndex + 1}**
dari **${oldOwner.username}**!

💰 Bertahan sampai reward berikutnya:
**+10 Poin**`,

                ephemeral: true

            });

        } else {

            await interaction.reply({

                content:
`🇮🇩 **SELAMAT!**

Kamu sekarang menjadi
**Paskibraka ${slotIndex + 1}**!

💰 Bertahan sampai reward berikutnya:
**+10 Poin**`,

                ephemeral: true

            });

        }


        // ==================================================
        // UPDATE PANEL
        // ==================================================

        await this.updatePanel();


        // ==================================================
        // LOG
        // ==================================================

        await this.sendLog(
            username,
            slotIndex,
            oldOwner
        );

    }


    // ==================================================
    // LOG PASKIBRAKA
    // ==================================================

    async sendLog(
        username,
        slotIndex,
        oldOwner
    ) {

        if (
            !process.env.LOG_CHANNEL
        ) {

            return;

        }


        try {

            const channel =
                await this.client.channels.fetch(
                    process.env.LOG_CHANNEL
                );


            let description;


            if (oldOwner) {

                description =

`⚔️ **${username}** berhasil merebut posisi Paskibraka!

━━━━━━━━━━━━━━━━━━━━

👤 **Pemain**
${username}

🇮🇩 **Posisi**
Paskibraka ${slotIndex + 1}

⚔️ **Direbut dari**
${oldOwner.username}

💰 **Reward**
+10 poin / jam`;

            } else {

                description =

`🇮🇩 **${username}** bergabung menjadi Paskibraka!

━━━━━━━━━━━━━━━━━━━━

👤 **Pemain**
${username}

🇮🇩 **Posisi**
Paskibraka ${slotIndex + 1}

💰 **Reward**
+10 poin / jam`;

            }


            const embed =
                new EmbedBuilder()

                    .setColor("#D90429")

                    .setTitle(
                        "🇮🇩 PASKIBRAKA"
                    )

                    .setDescription(
                        description
                    )

                    .setFooter({

                        text:
                            "Event Kemerdekaan 2026"

                    })

                    .setTimestamp();


            await channel.send({

                embeds: [
                    embed
                ]

            });

        } catch (err) {

            console.error(
                "❌ Paskibraka log error:",
                err
            );

        }

    }


    // ==================================================
    // BAGI REWARD
    // ==================================================

    async giveRewards() {

        console.log(
            "🇮🇩 Membagikan reward Paskibraka..."
        );


        for (
            let i = 0;
            i < this.slots.length;
            i++
        ) {

            const slot =
                this.slots[i];


            if (!slot)
                continue;


            try {

                const user =
                    database.addPoint(

                        slot.id,

                        slot.username,

                        10

                    );


                database.saveUsers();


                console.log(
                    `🇮🇩 ${slot.username} mendapat +10 poin.`
                );


                // ======================
                // LOG REWARD
                // ======================

                if (
                    process.env.LOG_CHANNEL
                ) {

                    const channel =
                        await this.client.channels.fetch(
                            process.env.LOG_CHANNEL
                        );


                    const embed =
                        new EmbedBuilder()

                            .setColor("#2ECC71")

                            .setTitle(
                                "🎖️ REWARD PASKIBRAKA"
                            )

                            .setDescription(

`🇮🇩 **${slot.username}** berhasil bertahan sebagai Paskibraka!

━━━━━━━━━━━━━━━━━━━━

🥇 **Posisi**
Paskibraka ${i + 1}

💰 **Reward**
**+10 Poin**

⏰ **Masa Tugas**
1 Jam

🏆 **Total Poin**
**${user.points} Poin**

━━━━━━━━━━━━━━━━━━━━

🔥 Pertahankan posisimu!`

                            )

                            .setFooter({

                                text:
                                    "🇮🇩 Event Kemerdekaan 2026"

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
                    `❌ Gagal memberi reward ${slot.username}:`,
                    err
                );

            }

        }


        // ==================================================
        // SIMPAN WAKTU REWARD
        // ==================================================

        database.events.paskibraka.lastReward =
            Date.now();

        database.saveEvents();


        // ==================================================
        // UPDATE PANEL
        // ==================================================

        await this.updatePanel();

    }


    // ==================================================
    // START
    // ==================================================

    async start() {

        console.log(
            "🇮🇩 Panjat Module → Paskibraka Loaded"
        );


        // ======================
        // LOAD DATA
        // ======================

        this.loadData();


        // ======================
        // PANEL
        // ======================

        await this.updatePanel();


        // ======================
        // HENTIKAN TIMER LAMA
        // ======================

        if (
            this.rewardInterval
        ) {

            clearInterval(
                this.rewardInterval
            );

        }


        // ======================
        // CEK REWARD SETIAP MENIT
        // ======================

        this.rewardInterval =
            setInterval(

                async () => {

                    try {

                        const lastReward =
                            database.events
                                .paskibraka
                                .lastReward || Date.now();


                        const elapsed =
                            Date.now() -
                            lastReward;


                        // ======================
                        // SUDAH 1 JAM
                        // ======================

                        if (
                            elapsed >=
                            60 * 60 * 1000
                        ) {

                            await this.giveRewards();

                        }

                    } catch (err) {

                        console.error(
                            "❌ Paskibraka timer error:",
                            err
                        );

                    }

                },

                60 * 1000

            );


        console.log(
            "⏰ Paskibraka reward: +10 poin setiap 1 jam."
        );

    }

}


// ==================================================
// EXPORT
// ==================================================

module.exports = Panjat;