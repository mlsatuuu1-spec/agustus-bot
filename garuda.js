const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const database = require("./database");
const utils = require("./utils");

class Garuda {

    constructor(client) {

        this.client = client;

        // =====================
        // STATUS GARUDA
        // =====================

        this.active = false;

        this.claimed = new Set();

        this.message = null;

        this.timeout = null;

        // =====================
        // SCHEDULER
        // =====================

        this.scheduler = null;

        // =====================
        // CLUE
        // =====================

        this.clueMessage = null;

        this.clueSent = new Set();

        // =====================
        // JADWAL HARIAN
        // =====================

        this.today = "";

        this.schedule = [];

        this.spawnedToday = new Set();

        this.maxSpawn = 15;

    }

// ==================================================
    // BUILD EMBED GARUDA
    // ==================================================

    buildEmbed() {

        return new EmbedBuilder()

            .setColor("#E11D48")

            .setTitle(
                "🦅 GARUDA MERDEKA MUNCUL!"
            )

            .setDescription(

`🇮🇩 **GARUDA TERBANG DI ATAS SERVER!**

🚨 **TANGKAP SECEPATNYA!**

Garuda hanya berada di server selama
**30 detik**.

👥 Semua member boleh ikut.

🎁 Hadiah bersifat random.

💰 Bisa mendapatkan poin
atau mengalami **Garuda Sial**.

━━━━━━━━━━━━━━━━━━━━

⚡ **SIAPA CEPAT DIA DAPAT!**`

            )

            .setImage(
                "https://png.pngtree.com/thumb_back/fh260/background/20230609/pngtree-bald-eagle-in-flight-in-front-of-mountains-image_2903050.jpg"
            )

            .setFooter({

                text:
                    "🇮🇩 Event Kemerdekaan 2026 • Garuda Hunt"

            })

            .setTimestamp();

    }

    // ==================================================
    // BUTTON GARUDA
    // ==================================================

    buildButton() {

        return new ActionRowBuilder()

            .addComponents(

                new ButtonBuilder()

                    .setCustomId(
                        "garuda"
                    )

                    .setEmoji("🦅")

                    .setLabel(
                        "Tangkap Garuda!"
                    )

                    .setStyle(
                        ButtonStyle.Danger
                    )

            );

    }

    
//==================================================
    // RANDOM SCHEDULE
    //==================================================

    generateSchedule() {

        const result = [];

        while (
            result.length <
            this.maxSpawn
        ) {

            const minute =
                Math.floor(
                    Math.random() * 1440
                );

            if (
                !result.includes(
                    minute
                )
            ) {

                result.push(
                    minute
                );

            }

        }

        result.sort(
            (a, b) => a - b
        );

        this.schedule = result;

        // Reset spawn harian

        this.spawnedToday.clear();

        // Reset clue

        this.clueSent.clear();

        this.clueMessage = null;

    }

    // ==================================================
    // TODAY KEY
    // ==================================================

    todayKey() {

        const now =
            new Date();

        return (
            `${now.getFullYear()}-` +
            `${now.getMonth() + 1}-` +
            `${now.getDate()}`
        );

    }

    // ==================================================
    // FORMAT JAM
    // ==================================================

    formatMinute(minute) {

        const hour =
            Math.floor(
                minute / 60
            );

        const min =
            minute % 60;

        return (
            `${String(hour).padStart(2, "0")}:` +
            `${String(min).padStart(2, "0")}`
        );

    }

    // ==================================================
    // CLUE GARUDA
    // ==================================================

    async sendClue(
        minutesLeft,
        spawnMinute
    ) {

        try {

            const channel =
                await this.client.channels.fetch(
                    process.env.EVENT_CHANNEL
                );

            let title = "";

            let description = "";

            // ==================================================
            // 1 JAM
            // ==================================================

            if (
                minutesLeft === 60
            ) {

                title =
                    "👀 ADA YANG MENDEKAT...";

                description =

`🇮🇩 **SESUATU SEDANG MENUJU SERVER...**

Ada sesuatu yang akan turun
ke server hari ini.

🦅 **Garuda sedang mendekat.**

⏰ Perkiraan:
**± 1 jam lagi**

━━━━━━━━━━━━━━━━━━━━

👀 Pantau terus channel ini.

Siapa tahu kamu menjadi
yang pertama menangkapnya...`;

            }

            //==================================================
            // 5 MENIT
            // ==================================================

            else if (
                minutesLeft === 5
            ) {

                title =
                    "👀 GARUDA SEMAKIN DEKAT...";

                description =

`🇮🇩 **PERINGATAN DINI!**

🦅 Garuda akan segera turun
ke server.

⏰ Perkiraan:
**± 5 menit lagi**

━━━━━━━━━━━━━━━━━━━━

🔥 Siapkan jempolmu!

Jangan sampai keduluan
member lain.`;

            }

            // ==================================================
            // 1 MENIT
            // ==================================================

            else if (
                minutesLeft === 1
            ) {

                title =
                    "🚨 GARUDA SEGERA TURUN!";

                description =

`🦅 **GARUDA SUDAH SANGAT DEKAT!**

⏰ Perkiraan:
**± 1 menit lagi**

━━━━━━━━━━━━━━━━━━━━

🚨 **BERSIAP!**

Buka channel ini.
Saat Garuda muncul,
langsung tekan tombol tangkap!`;

            }

            else {

                return;

            }

            // ==================================================
            // CLUE KEY
            // ==================================================

            const clueKey =
                `${this.today}-${spawnMinute}-${minutesLeft}`;

            // Jangan kirim clue yang sama dua kali

            if (
                this.clueSent.has(
                    clueKey
                )
            ) {

                return;

            }

            this.clueSent.add(
                clueKey
            );

            // ==================================================
            // EMBED
            // ==================================================

            const embed =
                new EmbedBuilder()

                    .setColor(
                        minutesLeft === 1
                            ? "#E74C3C"
                            : "#F1C40F"
                    )

                    .setTitle(
                        title
                    )

                    .setDescription(
                        description
                    )

                    .addFields({

                        name:
                            "⏰ PERKIRAAN TURUN",

                        value:
                            `**${this.formatMinute(spawnMinute)} WIB**`,

                        inline: true

                    })

                    .setFooter({

                        text:
                            "🇮🇩 Event Kemerdekaan 2026 • Garuda Hunt"

                    })

                    .setTimestamp();

            // ==================================================
            // EDIT CLUE LAMA
            // ==================================================

            if (
                this.clueMessage
            ) {

                try {

                    await this.clueMessage.edit({

                        embeds: [
                            embed
                        ],

                        components: []

                    });

                    return;

                } catch (err) {

                    this.clueMessage =
                        null;

                }

            }

            //==================================================
            // KIRIM CLUE
            // ==================================================

            this.clueMessage =
                await channel.send({

                    embeds: [
                        embed
                    ]

                });

        } catch (err) {

            console.error(
                "❌ Gagal mengirim clue Garuda:",
                err
            );

        }

    }

    // ==================================================
    // HAPUS CLUE
    // ==================================================

    async clearClue() {

        if (
            !this.clueMessage
        ) {

            return;

        }

        try {

            await this.clueMessage.delete();

        } catch (err) {}

        this.clueMessage =
            null;

    }

    // ==================================================
    // SPAWN GARUDA
    // ==================================================

    async spawn() {

        const channel =
            await this.client.channels.fetch(
                process.env.EVENT_CHANNEL
            );

        // ==================================================
        // HAPUS CLUE
        // ==================================================

        await this.clearClue();

        // ==================================================
        // HAPUS GARUDA LAMA
        // ==================================================

        if (
            database.events.garudaMessage
        ) {

            try {

                const old =
                    await channel.messages.fetch(
                        database.events.garudaMessage
                    );

                await old.delete();

            } catch (err) {}

        }

        // ==================================================
        // RESET EVENT
        // ==================================================

        this.active = true;

        this.claimed.clear();

        // ==================================================
        // KIRIM GARUDA
        // ==================================================

        const msg =
            await channel.send({

                content:
                    "🚨 **GARUDA TERLIHAT!!**",

                embeds: [

                    this.buildEmbed()

                ],

                components: [

                    this.buildButton()

                ],

                allowedMentions: {

                    parse: [
                        "everyone"
                    ]

                }

            });

        this.message =
            msg;

        database.events.garudaMessage =
            msg.id;

        database.saveEvents();

        console.log(
            `🦅 Garuda Spawn! ⏰ ${new Date().toLocaleTimeString("id-ID")}`
        );

        //==================================================
        // TUTUP OTOMATIS
        //==================================================

        clearTimeout(
            this.timeout
        );

        this.timeout =
            setTimeout(
                async () => {

                    this.active =
                        false;

                    try {

                        await msg.edit({

                            content:
                                "💨 **Garuda berhasil kabur!**",

                            components: []

                        });

                    } catch (err) {}

                },
                30000
            );

    }

    // ==================================================
    // HANDLE BUTTON
    // ==================================================

    async handle(
        interaction
    ) {

        if (
            !interaction.isButton()
        )
            return;

        if (
            interaction.customId !==
            "garuda"
        )
            return;

        // ==================================================
        // GARUDA SUDAH HILANG
        // ==================================================

        if (
            !this.active
        ) {

            return interaction.reply({

                content:
                    "🦅 Garuda sudah kabur.",

                ephemeral: true

            });

        }

        const id =
            interaction.user.id;

        // ==================================================
        // SUDAH MENANGKAP
        // ==================================================

        if (
            this.claimed.has(
                id
            )
        ) {

            return interaction.reply({

                content:
                    "❌ Kamu sudah menangkap Garuda kali ini.",

                ephemeral: true

            });

        }

        // ==================================================
        // CLAIM
        // ==================================================

        this.claimed.add(
            id
        );

        // ==================================================
        // DATA USER
        // ==================================================

        let user =
            database.getUser(

                id,

                interaction.user.username

            );

        // ==================================================
        // RANDOM REWARD
        // ==================================================

        let reward =
            this.applySpecial(

                user,

                utils.randomReward()

            );

        // ==================================================
        // TAMBAH / KURANG POIN
        // ==================================================

        if (
            reward.point >= 0
        ) {

            user =
                database.addPoint(

                    id,

                    interaction.user.username,

                    reward.point

                );

        }

        else {

            user =
                database.removePoint(

                    id,

                    interaction.user.username,

                    Math.abs(
                        reward.point
                    )

                );

        }

        // ==================================================
        // GARUDA STAT
        // ==================================================

        user.garuda++;

        // ==================================================
        // SAVE
        // ==================================================

        database.saveUsers();

        // ==================================================
        // LOG PEROLEHAN POIN
        // ==================================================

        try {

            const log =
                await this.client.channels.fetch(
                    process.env.LOG_CHANNEL
                );

            await log.send({

                embeds: [

                    new EmbedBuilder()

                        .setColor(

                            reward.point >= 0

                                ? 0x57F287

                                : 0xED4245

                        )

                        .setTitle(

                            `${reward.emoji} ${interaction.user.username}`

                        )

                        .setDescription(

`${reward.text}

**${reward.point >= 0 ? "+" : ""}${reward.point} poin**

🏆 Total:
**${user.points} poin**`

                        )

                        .setTimestamp()

                ]

            });

        } catch (err) {

            console.error(
                "❌ Gagal mengirim log Garuda:",
                err
            );

        }

        //==================================================
        // HASIL KE PEMAIN
        //==================================================

        await interaction.reply({

            ephemeral: true,

            embeds: [

                new EmbedBuilder()

                    .setColor(

                        reward.point >= 0

                            ? 0x57F287

                            : 0xED4245

                    )

                    .setTitle(
                        "🦅 HASIL TANGKAPAN"
                    )

                    .setDescription(

`${reward.text}

**${reward.point >= 0 ? "+" : ""}${reward.point} poin**

🏆 Total poin:
**${user.points}**`

                    )

                    .setTimestamp()

            ]

        });

        // ==================================================
        // UPDATE LEADERBOARD
        // ==================================================

        try {

            await this.updateLeaderboard();

        } catch (err) {

            console.error(
                "❌ Gagal update leaderboard:",
                err
            );

        }

    }

    // ==================================================
    // SCHEDULER
    // ==================================================

    startScheduler() {

        this.scheduler =
            setInterval(
                async () => {

                    const now =
                        new Date();

                    // ==================================================
                    // GANTI HARI
                    // ==================================================

                    if (
                        this.today !==
                        this.todayKey()
                    ) {

                        this.today =
                            this.todayKey();

                        this.generateSchedule();

                        console.log(
                            "📅 Jadwal Garuda Baru"
                        );

                    }

                    // ==================================================
                    // MENIT SEKARANG
                    // ==================================================

                    const currentMinute =
                        now.getHours() * 60 +
                        now.getMinutes();

                    // ==================================================
                    // CEK JADWAL
                    // ==================================================

                    for (
                        const spawnMinute of
                        this.schedule
                    ) {

                        // ==========================================
                        // JIKA SUDAH SPAWN HARI INI
                        // ==========================================

                        if (
                            this.spawnedToday.has(
                                spawnMinute
                            )
                        ) {

                            continue;

                        }

                        // ==========================================
                        // HITUNG SELISIH WAKTU
                        // ==========================================

                        let minutesLeft =
                            spawnMinute -
                            currentMinute;

                        // Lewat tengah malam

                        if (
                            minutesLeft < 0
                        ) {

                            minutesLeft +=
                                1440;

                        }

                        // ==========================================
                        // CLUE 1 JAM
                        // ==========================================

                        if (
                            minutesLeft === 60
                        ) {

                            await this.sendClue(

                                60,

                                spawnMinute

                            );

                        }

                        // ==========================================
                        // CLUE 5 MENIT
                        // ==========================================

                        if (
                            minutesLeft === 5
                        ) {

                            await this.sendClue(

                                5,

                                spawnMinute

                            );

                        }

                        // ==========================================
                        // CLUE 1 MENIT
                        // ==========================================

                        if (
                            minutesLeft === 1
                        ) {

                            await this.sendClue(

                                1,

                                spawnMinute

                            );

                        }

                        // ==========================================
                        // WAKTUNYA SPAWN
                        // ==========================================

                        if (
                            minutesLeft === 0
                        ) {

                            this.spawnedToday.add(
                                spawnMinute
                            );

                            console.log(

                                `🦅 Spawn Scheduler ${spawnMinute}`

                            );

                            try {

                                await this.spawn();

                            } catch (err) {

                                console.error(

                                    "❌ Gagal spawn Garuda:",

                                    err

                                );

                            }

                        }

                    }

                },
                30000
            );

    }

    //==================================================
    // START
    //==================================================

    start() {

        console.log(
            "🦅 Garuda Module Loaded"
        );

        this.today =
            this.todayKey();

        this.generateSchedule();

        // ==================================================
        // LANGSUNG SPAWN 1 GARUDA
        // ==================================================

        this.spawn();

        // ==================================================
        // JALANKAN SCHEDULER
        // ==================================================

        this.startScheduler();

        console.log(
            `📅 Total Spawn Hari Ini : ${this.schedule.length}`
        );

    }

    // ==================================================
    // SPECIAL EVENT
    // ==================================================

    applySpecial(
        user,
        reward
    ) {

        const roll =
            Math.random() * 100;

        user.streak =
            user.streak || 0;

        // ==================================================
        // GOLDEN GARUDA
        // ==================================================

        if (
            roll <= 3
        ) {

            reward = {

                emoji:
                    "👑",

                item:
                    "Golden Garuda",

                point:
                    10,

                text:
                    "✨ **GOLDEN GARUDA!**\n\n+10 poin"

            };

        }

        // ==================================================
        // GARUDA SIAL
        // ==================================================

        else if (
            roll >= 97
        ) {

            reward = {

                emoji:
                    "☠️",

                item:
                    "Garuda Sial",

                point:
                    -100,

                text:
                    "💀 **GARUDA SIAL!**"

            };

        }

        // ==================================================
        // NIGHT BONUS
        // ==================================================

        const hour =
            new Date().getHours();

        if (
            reward.point > 0 &&
            (
                hour >= 22 ||
                hour < 5
            )
        ) {

            reward.point *= 2;

            reward.text +=
                "\n🌙 Night Bonus x2";

        }

        // ==================================================
        // LUCKY STREAK
        // ==================================================

        user.streak++;

        if (
            user.streak >= 3
        ) {

            reward.point += 2;

            reward.text +=
                "\n🔥 Lucky Streak +2";

            user.streak = 0;

        }

        // ==================================================
        // MAKSIMAL 50 POIN
        // ==================================================

        if (
            reward.point > 50
        ) {

            reward.point = 50;

        }

        return reward;

    }

    // ==================================================
    // LEADERBOARD UPDATE
    // ==================================================

    async updateLeaderboard() {

        const Leaderboard =
            require("./leaderboard");

        const leaderboard =
            new Leaderboard(
                this.client
            );

        await leaderboard.update();

    }

}

// ==================================================
// EXPORT
// ==================================================

module.exports = Garuda;
