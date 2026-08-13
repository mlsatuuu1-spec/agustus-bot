const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const database = require("./database");

class PanjatPinang {

    constructor(client) {

        this.client = client;

        // ==================================================
        // STATUS GAME
        // ==================================================

        this.active = false;

        // ==================================================
        // STATUS PENDAFTARAN
        // ==================================================

        this.registering = false;

        // ==================================================
        // DATA TEAM
        // ==================================================

        this.teams = {

            merah: [],

            biru: []

        };

        // ==================================================
        // PROGRES TEAM
        // ==================================================

        this.progress = {

            merah: 0,

            biru: 0

        };

        // ==================================================
        // MESSAGE UTAMA
        // ==================================================

        this.message = null;

        // ==================================================
        // TIMER
        // ==================================================

        this.registrationTimer = null;

        // ==================================================
        // COOLDOWN
        // ==================================================

        this.cooldown = new Map();

        // ==================================================
        // CHANNEL MESSAGE
        // ==================================================

        this.resultMessage = null;

    }

    // ==================================================
    // EMBED PANEL UTAMA
    // ==================================================

    buildPanelEmbed() {

        return new EmbedBuilder()

            .setColor("#E74C3C")

            .setTitle(
                "🇮🇩 🏗️ PANJAT PINANG"
            )

            .setDescription(

`🎉 **LOMBA PANJAT PINANG DIMULAI!**

Bentuk timmu dan jadilah yang
pertama mencapai puncak!

━━━━━━━━━━━━━━━━━━━━

🔴 **TIM MERAH**
Berlomba mencapai puncak.

🔵 **TIM BIRU**
Berlomba mencapai puncak.

━━━━━━━━━━━━━━━━━━━━

👥 Pilih timmu sendiri.

⚖️ Jumlah anggota akan dijaga
agar tetap seimbang.

⏱️ Pendaftaran berlangsung
selama **60 detik**.

🏆 Tim pemenang:
**+5 Poin / anggota**

💀 Tim kalah:
**-5 Poin / anggota**

━━━━━━━━━━━━━━━━━━━━

🇮🇩 **SIAP PANJAT PINANG?**`

            )

            .setFooter({

                text:
                    "🇮🇩 Event Kemerdekaan 2026"

            })

            .setTimestamp();

    }

    // ==================================================
    // EMBED PENDAFTARAN
    // ==================================================

    buildRegistrationEmbed() {

        const merah =
            this.teams.merah.length;

        const biru =
            this.teams.biru.length;

        let merahText =
            this.teams.merah.length
                ? this.teams.merah
                    .map(
                        id => `<@${id}>`
                    )
                    .join("\n")
                : "Belum ada anggota.";

        let biruText =
            this.teams.biru.length
                ? this.teams.biru
                    .map(
                        id => `<@${id}>`
                    )
                    .join("\n")
                : "Belum ada anggota.";

        return new EmbedBuilder()

            .setColor("#F1C40F")

            .setTitle(
                "🏗️ PENDAFTARAN PANJAT PINANG"
            )

            .setDescription(

`🇮🇩 **PILIH TIMMU!**

Klik tombol di bawah untuk
bergabung ke salah satu tim.

⚠️ Setelah memilih tim,
kamu **tidak bisa pindah**.

⏱️ Pendaftaran ditutup dalam
**60 detik**.`

            )

            .addFields(

                {

                    name:
                        `🔴 TIM MERAH — ${merah} orang`,

                    value:
                        merahText,

                    inline: true

                },

                {

                    name:
                        `🔵 TIM BIRU — ${biru} orang`,

                    value:
                        biruText,

                    inline: true

                }

            )

            .setFooter({

                text:
                    "⚖️ Tim akan dijaga tetap seimbang"

            })

            .setTimestamp();

    }

    // ==================================================
    // BUTTON PENDAFTARAN
    // ==================================================

    buildRegistrationButtons() {

        return new ActionRowBuilder()

            .addComponents(

                new ButtonBuilder()

                    .setCustomId(
                        "panjat_merah"
                    )

                    .setEmoji("🔴")

                    .setLabel(
                        "Gabung Tim Merah"
                    )

                    .setStyle(
                        ButtonStyle.Danger
                    ),

                new ButtonBuilder()

                    .setCustomId(
                        "panjat_biru"
                    )

                    .setEmoji("🔵")

                    .setLabel(
                        "Gabung Tim Biru"
                    )

                    .setStyle(
                        ButtonStyle.Primary
                    )

            );

    }

    // ==================================================
    // BUTTON PANJAT
    // ==================================================

    buildGameButtons() {

        return new ActionRowBuilder()

            .addComponents(

                new ButtonBuilder()

                    .setCustomId(
                        "panjat_action"
                    )

                    .setEmoji("🧗")
                    .setLabel(
                        "PANJAT!"
                    )

                    .setStyle(
                        ButtonStyle.Success
                    )

            );

    }

    // ==================================================
    // EMBED PERTANDINGAN
    // ==================================================

    buildGameEmbed() {

        const merah =
            Math.min(
                100,
                this.progress.merah
            );

        const biru =
            Math.min(
                100,
                this.progress.biru
            );

        return new EmbedBuilder()

            .setColor("#F1C40F")

            .setTitle(
                "🏗️ PANJAT PINANG DIMULAI!"
            )

            .setDescription(

`🇮🇩 **REBUT PUNCAK!**

Tim pertama yang mencapai **100%**
akan menjadi pemenang!

━━━━━━━━━━━━━━━━━━━━

🔴 **TIM MERAH**

${this.progressBar(merah)}
**${merah}%**

👥 ${this.teams.merah.length} anggota

━━━━━━━━━━━━━━━━━━━━

🔵 **TIM BIRU**

${this.progressBar(biru)}
**${biru}%**

👥 ${this.teams.biru.length} anggota

━━━━━━━━━━━━━━━━━━━━

🧗 Tekan tombol **PANJAT!**
untuk membantu timmu naik.

⚡ Setiap panjatan memberikan
progres secara random.`

            )

            .setFooter({

                text:
                    "🇮🇩 Siapa cepat, dia sampai puncak!"

            })

            .setTimestamp();

    }

    // ==================================================
    // PROGRESS BAR
    // ==================================================

    progressBar(value) {

        const total = 10;

        const filled =
            Math.round(
                (value / 100) * total
            );

        const empty =
            total - filled;

        return (
            "🟩".repeat(filled) +
            "⬜".repeat(empty)
        );

    }

    // ==================================================
    // START
    // ==================================================

    async start() {

        console.log(
            "🏗️ Panjat Pinang Module Loaded"
        );

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

            // ==================================================
            // HAPUS PANEL LAMA
            // ==================================================

            if (
                this.message
            ) {

                try {

                    await this.message.delete();

                } catch (err) {}

            }

            // ==================================================
            // KIRIM PANEL
            // ==================================================

            this.message =
                await channel.send({

                    embeds: [

                        this.buildPanelEmbed()

                    ],

                    components: [

                        new ActionRowBuilder()
                            .addComponents(

                                new ButtonBuilder()

                                    .setCustomId(
                                        "panjat_start"
                                    )

                                    .setEmoji("🏗️")

                                    .setLabel(
                                        "Mulai Panjat Pinang"
                                    )

                                    .setStyle(
                                        ButtonStyle.Success
                                    )

                            )

                    ]

                });

            console.log(
                "🏗️ Panel Panjat Pinang aktif."
            );

        } catch (err) {

            console.error(
                "❌ Gagal membuat panel Panjat Pinang:",
                err
            );

        }

    }

    // ==================================================
    // HANDLE BUTTON
    // ==================================================

    async handle(interaction) {

        if (
            !interaction.isButton()
        )
            return;

        // ==================================================
        // MULAI GAME
        // ==================================================

        if (
            interaction.customId ===
            "panjat_start"
        ) {

            await this.startGame(
                interaction
            );

            return;

        }

        // ==================================================
        // GABUNG MERAH
        // ==================================================

        if (
            interaction.customId ===
            "panjat_merah"
        ) {

            await this.joinTeam(
                interaction,
                "merah"
            );

            return;

        }

        // ==================================================
        // GABUNG BIRU
        // ==================================================

        if (
            interaction.customId ===
            "panjat_biru"
        ) {

            await this.joinTeam(
                interaction,
                "biru"
            );

            return;

        }

        // ==================================================
        // PANJAT
        // ==================================================

        if (
            interaction.customId ===
            "panjat_action"
        ) {

            await this.climb(
                interaction
            );

            return;

        }

    }

        // ==================================================
    // MULAI PENDAFTARAN
    // ==================================================

    async startGame(interaction) {

        // ==================================================
        // CEK GAME SEDANG BERJALAN
        // ==================================================

        if (
            this.active ||
            this.registering
        ) {

            return interaction.reply({

                content:
                    "🏗️ Saat ini sudah ada Panjat Pinang yang sedang berlangsung!",

                ephemeral: true

            });

        }

        // ==================================================
        // RESET DATA
        // ==================================================

        this.teams.merah = [];

        this.teams.biru = [];

        this.progress.merah = 0;

        this.progress.biru = 0;

        // ==================================================
        // MULAI PENDAFTARAN
        // ==================================================

        this.registering = true;

        // ==================================================
        // BALAS PEMAIN
        // ==================================================

        await interaction.reply({

            content:
                "🏗️ **Pendaftaran Panjat Pinang dibuka!**",

            ephemeral: true

        });

        // ==================================================
        // CHANNEL
        // ==================================================

        const channel =
            interaction.channel;

        // ==================================================
        // KIRIM PANEL PENDAFTARAN
        // ==================================================

        this.message =
            await channel.send({

                content:
                    "🇮🇩 **PENDAFTARAN PANJAT PINANG DIBUKA!**",

                embeds: [

                    this.buildRegistrationEmbed()

                ],

                components: [

                    this.buildRegistrationButtons()

                ]

            });

        // ==================================================
        // TIMER 60 DETIK
        // ==================================================

        clearTimeout(
            this.registrationTimer
        );

        this.registrationTimer =
            setTimeout(

                async () => {

                    await this.startBattle();

                },

                60000

            );

    }

    // ==================================================
    // GABUNG TEAM
    // ==================================================

    async joinTeam(
        interaction,
        team
    ) {

        // ==================================================
        // CEK PENDAFTARAN
        // ==================================================

        if (
            !this.registering
        ) {

            return interaction.reply({

                content:
                    "❌ Pendaftaran sudah ditutup.",

                ephemeral: true

            });

        }

        // ==================================================
        // CEK APAKAH SUDAH TERDAFTAR
        // ==================================================

        const userId =
            interaction.user.id;

        if (
            this.teams.merah.includes(
                userId
            ) ||
            this.teams.biru.includes(
                userId
            )
        ) {

            return interaction.reply({

                content:
                    "❌ Kamu sudah memilih tim.",

                ephemeral: true

            });

        }

        // ==================================================
        // CEK COOLDOWN
        // ==================================================

        const now =
            Date.now();

        const lastGame =
            this.cooldown.get(
                userId
            ) || 0;

        const cooldownTime =
            10 * 60 * 1000;

        if (
            now - lastGame <
            cooldownTime
        ) {

            const remaining =
                lastGame +
                cooldownTime -
                now;

            const minutes =
                Math.ceil(
                    remaining / 60000
                );

            return interaction.reply({

                content:
                    `⏳ Kamu masih cooldown!\n\n` +
                    `🏗️ Bisa ikut Panjat Pinang lagi dalam **${minutes} menit**.`,

                ephemeral: true

            });

        }

        // ==================================================
        // JAGA KESEIMBANGAN TEAM
        // ==================================================

        const merahCount =
            this.teams.merah.length;

        const biruCount =
            this.teams.biru.length;

        if (
            team === "merah" &&
            merahCount >
            biruCount
        ) {

            return interaction.reply({

                content:
                    "⚖️ Tim Merah sudah lebih banyak. Silakan pilih Tim Biru.",

                ephemeral: true

            });

        }

        if (
            team === "biru" &&
            biruCount >
            merahCount
        ) {

            return interaction.reply({

                content:
                    "⚖️ Tim Biru sudah lebih banyak. Silakan pilih Tim Merah.",

                ephemeral: true

            });

        }

        // ==================================================
        // MASUK TEAM
        // ==================================================

        this.teams[team].push(
            userId
        );

        // ==================================================
        // BALAS
        // ==================================================

        await interaction.reply({

            content:
                `🇮🇩 Kamu bergabung ke **Tim ${team === "merah" ? "Merah 🔴" : "Biru 🔵"}**!`,

            ephemeral: true

        });

        // ==================================================
        // UPDATE EMBED PENDAFTARAN
        // ==================================================

        if (
            this.message
        ) {

            try {

                await this.message.edit({

                    embeds: [

                        this.buildRegistrationEmbed()

                    ],

                    components: [

                        this.buildRegistrationButtons()

                    ]

                });

            } catch (err) {

                console.error(
                    "❌ Gagal update pendaftaran:",
                    err
                );

            }

        }

    }

    // ==================================================
    // MULAI PERTANDINGAN
    // ==================================================

    async startBattle() {

        // ==================================================
        // CEK STATUS
        // ==================================================

        if (
            !this.registering
        )
            return;

        this.registering = false;

        // ==================================================
        // CEK JUMLAH PEMAIN
        // ==================================================

        const totalPlayers =
            this.teams.merah.length +
            this.teams.biru.length;

        // ==================================================
        // MINIMAL 2 PEMAIN
        // ==================================================

        if (
            totalPlayers < 2
        ) {

            this.active = false;

            try {

                await this.message.edit({

                    content:
                        "❌ **PANJAT PINANG DIBATALKAN**",

                    embeds: [

                        new EmbedBuilder()

                            .setColor(
                                "#E74C3C"
                            )

                            .setTitle(
                                "🏗️ PANJAT PINANG DIBATALKAN"
                            )

                            .setDescription(

`Tidak cukup peserta.

👥 Minimal membutuhkan **2 pemain**.

Silakan mulai pertandingan baru!`

                            )

                            .setTimestamp()

                    ],

                    components: []

                });

            } catch (err) {}

            return;

        }

        // ==================================================
        // RESET PROGRES
        // ==================================================

        this.progress.merah = 0;

        this.progress.biru = 0;

        this.active = true;

        // ==================================================
        // SET COOLDOWN SEMUA PEMAIN
        // ==================================================

        const cooldownTime =
            10 * 60 * 1000;

        const now =
            Date.now();

        this.teams.merah.forEach(
            id => {

                this.cooldown.set(
                    id,
                    now
                );

            }
        );

        this.teams.biru.forEach(
            id => {

                this.cooldown.set(
                    id,
                    now
                );

            }
        );

        // ==================================================
        // UPDATE PESAN
        // ==================================================

        try {

            await this.message.edit({

                content:
                    "🚨 **PANJAT PINANG DIMULAI!**",

                embeds: [

                    this.buildGameEmbed()

                ],

                components: [

                    this.buildGameButtons()

                ]

            });

        } catch (err) {

            console.error(
                "❌ Gagal memulai pertandingan:",
                err
            );

        }

        console.log(
            `🏗️ Panjat Pinang dimulai: Merah ${this.teams.merah.length} vs Biru ${this.teams.biru.length}`
        );

    }

    // ==================================================
    // AKSI PANJAT
    // ==================================================

    async climb(interaction) {

        // ==================================================
        // CEK GAME
        // ==================================================

        if (
            !this.active
        ) {

            return interaction.reply({

                content:
                    "❌ Saat ini tidak ada Panjat Pinang yang berlangsung.",

                ephemeral: true

            });

        }

        // ==================================================
        // CARI TEAM PEMAIN
        // ==================================================

        const userId =
            interaction.user.id;

        let team = null;

        if (
            this.teams.merah.includes(
                userId
            )
        ) {

            team = "merah";

        }

        else if (
            this.teams.biru.includes(
                userId
            )
        ) {

            team = "biru";

        }

        // ==================================================
        // BUKAN PESERTA
        // ==================================================

        if (!team) {

            return interaction.reply({

                content:
                    "❌ Kamu tidak ikut pertandingan ini.",

                ephemeral: true

            });

        }

        // ==================================================
        // RANDOM PROGRES
        // ==================================================

        const roll =
            Math.random();

        let progress = 0;

        let resultText = "";

        // ==================================================
        // HASIL RANDOM
        // ==================================================

        if (
            roll < 0.05
        ) {

            progress = -10;

            resultText =
                "💥 **Terpeleset!** -10%";

        }

        else if (
            roll < 0.15
        ) {

            progress = -5;

            resultText =
                "🪵 **Pinangnya licin!** -5%";

        }

        else if (
            roll < 0.25
        ) {

            progress = 15;

            resultText =
                "🔥 **Dorongan kuat!** +15%";

        }

        else if (
            roll < 0.35
        ) {

            progress = 12;

            resultText =
                "💪 **Pijakan bagus!** +12%";

        }

        else {

            progress =
                Math.floor(
                    Math.random() * 6
                ) + 5;

            resultText =
                `🧗 **Berhasil memanjat!** +${progress}%`;

        }

        // ==================================================
        // UPDATE PROGRES
        // ==================================================

        this.progress[team] +=
            progress;

        // ==================================================
        // BATAS PROGRES
        // ==================================================

        if (
            this.progress[team] < 0
        ) {

            this.progress[team] = 0;

        }

        if (
            this.progress[team] > 100
        ) {

            this.progress[team] = 100;

        }

        // ==================================================
        // CEK MENANG
        // ==================================================

        if (
            this.progress[team] >= 100
        ) {

            await interaction.deferUpdate();

            await this.finishGame(
                team
            );

            return;

        }

        // ==================================================
        // UPDATE EMBED
        // ==================================================

        try {

            await interaction.update({

                embeds: [

                    this.buildGameEmbed()

                ],

                components: [

                    this.buildGameButtons()

                ]

            });

        } catch (err) {

            console.error(
                "❌ Gagal update Panjat Pinang:",
                err
            );

        }

        // ==================================================
        // INFO HASIL KE PEMAIN
        // ==================================================

        

    }

    // ==================================================
    // SELESAIKAN GAME
    // ==================================================

    async finishGame(
        winningTeam
    ) {

        if (
            !this.active
        )
            return;

        // ==================================================
        // NONAKTIFKAN GAME
        // ==================================================

        this.active = false;

        // ==================================================
        // TEAM KALAH
        // ==================================================

        const losingTeam =
            winningTeam === "merah"
                ? "biru"
                : "merah";

        // ==================================================
        // HADIAH
        // ==================================================

        const WIN_REWARD = 5;

        const LOSE_REWARD = 5;

        // ==================================================
        // PROSES TEAM PEMENANG
        // ==================================================

        for (
            const userId of
            this.teams[winningTeam]
        ) {

            const member =
    await this.client.users.fetch(userId);

const user =
    database.getUser(
        userId,
        member.username
    );

database.addPoint(
    userId,
    member.username,
    WIN_REWARD
);

        }

        // ==================================================
        // PROSES TEAM KALAH
        // ==================================================

        for (
            const userId of
            this.teams[losingTeam]
        ) {

            const member =
    await this.client.users.fetch(userId);

const user =
    database.getUser(
        userId,
        member.username
    );

database.removePoint(
    userId,
    member.username,
    LOSE_REWARD
);

        }

        // ==================================================
        // SIMPAN DATABASE
        // ==================================================

        database.saveUsers();

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
                "❌ Gagal update leaderboard:",
                err
            );

        }

        // ==================================================
        // BUAT DAFTAR PEMENANG
        // ==================================================

        const winners =
            this.teams[winningTeam]
                .map(
                    id => `<@${id}>`
                )
                .join("\n");

        const losers =
            this.teams[losingTeam]
                .map(
                    id => `<@${id}>`
                )
                .join("\n");

        // ==================================================
        // NAMA TEAM
        // ==================================================

        const winningName =
            winningTeam === "merah"
                ? "🔴 TIM MERAH"
                : "🔵 TIM BIRU";

        const losingName =
            losingTeam === "merah"
                ? "🔴 TIM MERAH"
                : "🔵 TIM BIRU";

        // ==================================================
        // EMBED HASIL
        // ==================================================

        const resultEmbed =
            new EmbedBuilder()

                .setColor("#F1C40F")

                .setTitle(
                    "🏆 PANJAT PINANG SELESAI!"
                )

                .setDescription(

`🇮🇩 **POHON PINANG BERHASIL DITAKLUKKAN!**

━━━━━━━━━━━━━━━━━━━━

🏆 **PEMENANG**

${winningName}

${winners}

🎁 **+5 Poin / anggota**

━━━━━━━━━━━━━━━━━━━━

💀 **KALAH**

${losingName}

${losers}

📉 **-5 Poin / anggota**

━━━━━━━━━━━━━━━━━━━━

🎉 Selamat kepada tim pemenang!

🇮🇩 **MERDEKA!**`

                )

                .setFooter({

                    text:
                        "🇮🇩 Event Kemerdekaan 2026"

                })

                .setTimestamp();

        // ==================================================
        // UPDATE PESAN
        // ==================================================

        if (
            this.message
        ) {

            try {

                await this.message.edit({

                    content:
                        "🏆 **PANJAT PINANG SELESAI!**",

                    embeds: [
                        resultEmbed
                    ],

                    components: []

                });

            } catch (err) {

                console.error(
                    "❌ Gagal update hasil:",
                    err
                );

            }

        }

        // ==================================================
        // KIRIM KE PEROLEHAN POIN
        // ==================================================

        try {

            const log =
                await this.client.channels.fetch(
                    process.env.LOG_CHANNEL
                );

            await log.send({

                embeds: [

                    new EmbedBuilder()

                        .setColor("#F1C40F")

                        .setTitle(
                            "🏗️ PEROLEHAN POIN — PANJAT PINANG"
                        )

                        .setDescription(

`${winningName} **MENANG!**

🏆 **+5 Poin**

${winners}

━━━━━━━━━━━━━━━━━━━━

${losingName} **KALAH!**

💀 **-5 Poin**

${losers}

🇮🇩 Panjat Pinang selesai!`

                        )

                        .setTimestamp()

                ]

            });

        } catch (err) {

            console.error(
                "❌ Gagal mengirim Perolehan Poin:",
                err
            );

        }

        // ==================================================
        // RESET SETELAH SELESAI
        // ==================================================

        setTimeout(async () => {

    this.teams.merah = [];
    this.teams.biru = [];

    this.progress.merah = 0;
    this.progress.biru = 0;

    this.active = false;
    this.registering = false;

    try {

        if (this.message) {

            await this.message.edit({

                content: null,

                embeds: [
                    this.buildPanelEmbed()
                ],

                components: [
                    new ActionRowBuilder()
                        .addComponents(

                            new ButtonBuilder()

                                .setCustomId(
                                    "panjat_start"
                                )

                                .setEmoji("🏗️")

                                .setLabel(
                                    "Mulai Panjat Pinang"
                                )

                                .setStyle(
                                    ButtonStyle.Success
                                )

                        )
                ]

            });

        }

    } catch (err) {

        console.error(
            "❌ Gagal mengembalikan panel Panjat:",
            err
        );

    }

}, 10000);

    }

    // ==================================================
    // END OF CLASS
    // ==================================================

}

// ==================================================
// EXPORT
// ==================================================

module.exports = PanjatPinang;


