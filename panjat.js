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
        // SCHEDULER
        // ======================

        this.scheduler = null;

        // ======================
        // JAM REWARD TERAKHIR
        // ======================

        this.lastRewardKey = "";

    }


    // ==================================================
    // WIB
    // ==================================================

    getWIB() {

        const now = new Date();

        return new Date(
            now.toLocaleString(
                "en-US",
                {
                    timeZone: "Asia/Jakarta"
                }
            )
        );

    }


    // ==================================================
    // KEY JAM REWARD
    // ==================================================

    getRewardKey() {

        const wib = this.getWIB();

        return (
            `${wib.getFullYear()}-` +
            `${String(
                wib.getMonth() + 1
            ).padStart(2, "0")}-` +
            `${String(
                wib.getDate()
            ).padStart(2, "0")}-` +
            `${String(
                wib.getHours()
            ).padStart(2, "0")}`
        );

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
                ]

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


        // ======================
        // PESAN PANEL
        // ======================

        if (
            database.events.paskibrakaMessage
        ) {

            this.message = null;

        }

    }


    // ==================================================
    // SAVE DATA
    // ==================================================

    saveData() {

        if (!database.events) {

            database.events = {};

        }


        database.events.paskibraka = {

            slots: this.slots

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

`🎖️ **REBUTAN 4 POSISI PASKIBRAKA**

Siapa yang berhasil bertahan?

━━━━━━━━━━━━━━━━━━━━

${text}
━━━━━━━━━━━━━━━━━━━━

💰 **REWARD OTOMATIS**

⏰ Setiap jam tepat
**00:00 • 01:00 • 02:00 • dst.**

🎁 Pemegang posisi mendapatkan:
**+10 Poin**

━━━━━━━━━━━━━━━━━━━━

⚔️ **SISTEM REBUTAN**

• Posisi bisa direbut kapan saja.
• Tidak perlu persetujuan.
• Jika direbut, pemilik lama keluar.
• Satu orang hanya bisa memegang 1 posisi.

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


            this.message =
                msg;


            database.events.paskibrakaMessage =
                msg.id;


            database.saveEvents();


            console.log(
                "🇮🇩 Panel Paskibraka dibuat."
            );

        } catch (err) {

            console.error(
                "❌ Gagal update panel Paskibraka:",
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
        // CEK POSISI YANG SUDAH DIMILIKI
        // ==================================================

        const currentSlot =
            this.slots.findIndex(
                slot =>
                    slot &&
                    slot.id === userId
            );


        // ==================================================
        // SUDAH DI POSISI TERSEBUT
        // ==================================================

        if (
            currentSlot === slotIndex
        ) {

            return interaction.reply({

                content:
                    `🇮🇩 Kamu sudah menempati **Paskibraka ${slotIndex + 1}**!`,

                ephemeral: true

            });

        }


        // ==================================================
        // PEMILIK LAMA
        // ==================================================

        const oldOwner =
            this.slots[slotIndex];


        // ==================================================
        // KELUARKAN DARI POSISI LAMA
        // ==================================================

        if (
            currentSlot !== -1
        ) {

            this.slots[currentSlot] =
                null;

        }


        // ==================================================
        // REBUT / AMBIL POSISI
        // ==================================================

        this.slots[slotIndex] = {

            id: userId,

            username: username

        };


        this.saveData();


        // ==================================================
        // BALAS
        // ==================================================

        if (oldOwner) {

            await interaction.reply({

                content:
`⚔️ **POSISI BERHASIL DIREBUT!**

🇮🇩 Kamu merebut **Paskibraka ${slotIndex + 1}**
dari **${oldOwner.username}**!

💰 Jika masih memegang posisi saat jam berikutnya:
**+10 Poin**`,

                ephemeral: true

            });

        } else {

            await interaction.reply({

                content:
`🇮🇩 **POSISI BERHASIL DIAMBIL!**

Kamu sekarang menempati
**Paskibraka ${slotIndex + 1}**!

💰 Jika masih memegang posisi saat jam berikutnya:
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
    // LOG
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

`⚔️ **${username}** berhasil merebut posisi!

━━━━━━━━━━━━━━━━━━━━

👤 **Pemain**
${username}

🇮🇩 **Posisi**
Paskibraka ${slotIndex + 1}

⚔️ **Direbut dari**
${oldOwner.username}

💰 **Reward**
+10 poin setiap jam`;

            } else {

                description =

`🇮🇩 **${username}** berhasil menempati posisi Paskibraka!

━━━━━━━━━━━━━━━━━━━━

👤 **Pemain**
${username}

🇮🇩 **Posisi**
Paskibraka ${slotIndex + 1}

💰 **Reward**
+10 poin setiap jam`;

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

        const rewardKey =
            this.getRewardKey();


        // ==================================================
        // CEGAH REWARD DOBEL
        // ==================================================

        if (
            this.lastRewardKey ===
            rewardKey
        ) {

            return;

        }


        this.lastRewardKey =
            rewardKey;


        console.log(
            `🇮🇩 Reward Paskibraka ${rewardKey}`
        );


        let rewarded = false;


        // ==================================================
        // BAGI +10 KE 4 PEMEGANG POSISI
        // ==================================================

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


                rewarded = true;


                database.saveUsers();


                console.log(
                    `🇮🇩 ${slot.username} +10 Poin`
                );


                // ======================
                // LOG
                // ======================

                if (
                    process.env.LOG_CHANNEL
                ) {

                    try {

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

`🇮🇩 **${slot.username}** menerima reward!

━━━━━━━━━━━━━━━━━━━━

🥇 **Posisi**
Paskibraka ${i + 1}

💰 **Mendapatkan**
**+10 Poin**

🏆 **Total Poin**
**${user.points} Poin**

⏰ **Waktu**
**${String(
    this.getWIB().getHours()
).padStart(2, "0")}:00 WIB**`

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

                    } catch (logError) {

                        console.error(
                            "❌ Gagal mengirim log reward:",
                            logError
                        );

                    }

                }

            } catch (err) {

                console.error(
                    `❌ Gagal memberi reward ${slot.username}:`,
                    err
                );

            }

        }


        database.saveUsers();


        // ==================================================
        // UPDATE LEADERBOARD
        // ==================================================

        if (rewarded) {

            try {

                const Leaderboard =
                    require("./leaderboard");


                const leaderboard =
                    new Leaderboard(
                        this.client
                    );


                await leaderboard.update();

            } catch (err) {

                console.error(
                    "❌ Gagal update leaderboard:",
                    err
                );

            }

        }


        // ==================================================
        // UPDATE PANEL
        // ==================================================

        await this.updatePanel();

    }


    // ==================================================
    // SCHEDULER
    // ==================================================

    startScheduler() {

        // ======================
        // CEGAH TIMER DOBEL
        // ======================

        if (
            this.scheduler
        ) {

            clearInterval(
                this.scheduler
            );

        }


        // ======================
        // CEK SETIAP 10 DETIK
        // ======================

        this.scheduler =
            setInterval(

                async () => {

                    try {

                        const wib =
                            this.getWIB();


                        const minute =
                            wib.getMinutes();


                        // ======================
                        // HANYA SAAT MENIT 00
                        // ======================

                        if (
                            minute !== 0
                        ) {

                            return;

                        }


                        const rewardKey =
                            this.getRewardKey();


                        if (
                            this.lastRewardKey ===
                            rewardKey
                        ) {

                            return;

                        }


                        await this.giveRewards();

                    } catch (err) {

                        console.error(
                            "❌ Paskibraka scheduler error:",
                            err
                        );

                    }

                },

                10 * 1000

            );

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
        // SCHEDULER
        // ======================

        this.startScheduler();


        console.log(
            "⏰ Paskibraka aktif: reward +10 setiap jam tepat WIB."
        );

    }

}


// ==================================================
// EXPORT
// ==================================================

module.exports = Panjat;