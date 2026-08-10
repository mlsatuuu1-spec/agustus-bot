const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const database = require("./database");

class Quiz {

    constructor(client) {

        this.client = client;

        this.message = null;

        this.active = false;

        this.currentQuestion = null;

        this.answers = new Set();

        this.winners = [];

        this.timer = null;

        this.scheduler = null;

        this.lastSpawnKey = "";

        this.lastQuestionIndex = -1;

        // Hadiah
        this.prizes = [
            25,
            15,
            10
        ];

        // Jadwal WIB
        this.quizHours = [
            15,
            16,
            17,
            18,
            19,
            20,
            21
        ];

        // ==================================================
        // SOAL QUIZ
        // ==================================================

        this.questions = [

            {
                question:
                    "Pada tanggal berapa Indonesia memproklamasikan kemerdekaannya?",

                options: [
                    "17 Agustus 1945",
                    "18 Agustus 1945",
                    "17 Agustus 1944",
                    "20 Mei 1945"
                ],

                answer: 0
            },

            {
                question:
                    "Siapa yang membacakan teks Proklamasi Kemerdekaan Indonesia?",

                options: [
                    "Mohammad Hatta",
                    "Soekarno",
                    "Ahmad Soebardjo",
                    "Sutan Sjahrir"
                ],

                answer: 1
            },

            {
                question:
                    "Siapa yang mendampingi Soekarno saat pembacaan Proklamasi?",

                options: [
                    "Mohammad Hatta",
                    "Sutan Sjahrir",
                    "Ahmad Soebardjo",
                    "Ki Hajar Dewantara"
                ],

                answer: 0
            },

            {
                question:
                    "Di mana Proklamasi Kemerdekaan Indonesia dibacakan?",

                options: [
                    "Istana Merdeka",
                    "Lapangan Ikada",
                    "Jalan Pegangsaan Timur No. 56",
                    "Gedung Pancasila"
                ],

                answer: 2
            },

            {
                question:
                    "Siapa yang mengetik naskah Proklamasi?",

                options: [
                    "Sayuti Melik",
                    "Sukarni",
                    "Wikana",
                    "B.M. Diah"
                ],

                answer: 0
            },

            {
                question:
                    "Siapa pencipta lagu Indonesia Raya?",

                options: [
                    "Ismail Marzuki",
                    "W.R. Supratman",
                    "C. Simanjuntak",
                    "Kusbini"
                ],

                answer: 1
            },

            {
                question:
                    "Siapa yang menjahit Bendera Pusaka Merah Putih?",

                options: [
                    "Fatmawati",
                    "R.A. Kartini",
                    "Dewi Sartika",
                    "Cut Nyak Dien"
                ],

                answer: 0
            },

            {
                question:
                    "Peristiwa Rengasdengklok terjadi menjelang peristiwa apa?",

                options: [
                    "Sumpah Pemuda",
                    "Proklamasi Kemerdekaan",
                    "Pembentukan BPUPKI",
                    "Konferensi Meja Bundar"
                ],

                answer: 1
            },

            {
                question:
                    "Pada tanggal berapa peristiwa Rengasdengklok terjadi?",

                options: [
                    "14 Agustus 1945",
                    "15 Agustus 1945",
                    "16 Agustus 1945",
                    "17 Agustus 1945"
                ],

                answer: 2
            },

            {
                question:
                    "Siapa yang dibawa golongan pemuda ke Rengasdengklok?",

                options: [
                    "Soekarno dan Mohammad Hatta",
                    "Sutan Sjahrir dan Tan Malaka",
                    "Ahmad Soebardjo dan Wikana",
                    "Ki Hajar Dewantara dan Soekarno"
                ],

                answer: 0
            },

            {
                question:
                    "Apa kepanjangan BPUPKI?",

                options: [
                    "Badan Penyelidik Usaha-usaha Persiapan Kemerdekaan Indonesia",
                    "Badan Persatuan Usaha Persiapan Kemerdekaan Indonesia",
                    "Badan Perjuangan Untuk Persatuan Kemerdekaan Indonesia",
                    "Badan Pembentukan Undang-undang Persiapan Kemerdekaan Indonesia"
                ],

                answer: 0
            },

            {
                question:
                    "Apa kepanjangan PPKI?",

                options: [
                    "Panitia Persiapan Kemerdekaan Indonesia",
                    "Persatuan Perjuangan Kemerdekaan Indonesia",
                    "Panitia Pembentukan Kemerdekaan Indonesia",
                    "Persatuan Persiapan Kemerdekaan Indonesia"
                ],

                answer: 0
            },

            {
                question:
                    "Kapan UUD 1945 disahkan?",

                options: [
                    "17 Agustus 1945",
                    "18 Agustus 1945",
                    "19 Agustus 1945",
                    "22 Agustus 1945"
                ],

                answer: 1
            },

            {
                question:
                    "Siapa wakil presiden pertama Republik Indonesia?",

                options: [
                    "Mohammad Hatta",
                    "Sutan Sjahrir",
                    "Ahmad Soebardjo",
                    "Tan Malaka"
                ],

                answer: 0
            },

            {
                question:
                    "Siapa presiden pertama Republik Indonesia?",

                options: [
                    "Soekarno",
                    "Mohammad Hatta",
                    "Suharto",
                    "B.J. Habibie"
                ],

                answer: 0
            },

            {
                question:
                    "Apa semboyan nasional Indonesia?",

                options: [
                    "Tut Wuri Handayani",
                    "Bhinneka Tunggal Ika",
                    "Jas Merah",
                    "Merdeka atau Mati"
                ],

                answer: 1
            },

            {
                question:
                    "Apa arti Bhinneka Tunggal Ika?",

                options: [
                    "Bersatu kita teguh",
                    "Berbeda-beda tetapi tetap satu",
                    "Satu bangsa satu bahasa",
                    "Indonesia negara kepulauan"
                ],

                answer: 1
            },

            {
                question:
                    "Apa dasar negara Indonesia?",

                options: [
                    "UUD 1945",
                    "Pancasila",
                    "Proklamasi",
                    "Bhinneka Tunggal Ika"
                ],

                answer: 1
            },

            {
                question:
                    "Berapa jumlah sila dalam Pancasila?",

                options: [
                    "3",
                    "4",
                    "5",
                    "6"
                ],

                answer: 2
            },

            {
                question:
                    "Apa bunyi sila pertama Pancasila?",

                options: [
                    "Kemanusiaan yang Adil dan Beradab",
                    "Persatuan Indonesia",
                    "Ketuhanan Yang Maha Esa",
                    "Keadilan Sosial bagi Seluruh Rakyat Indonesia"
                ],

                answer: 2
            },

            {
                question:
                    "Apa bunyi sila ketiga Pancasila?",

                options: [
                    "Persatuan Indonesia",
                    "Keadilan Sosial bagi Seluruh Rakyat Indonesia",
                    "Kerakyatan yang Dipimpin oleh Hikmat Kebijaksanaan",
                    "Kemanusiaan yang Adil dan Beradab"
                ],

                answer: 0
            },

            {
                question:
                    "Apa bunyi sila kelima Pancasila?",

                options: [
                    "Persatuan Indonesia",
                    "Keadilan Sosial bagi Seluruh Rakyat Indonesia",
                    "Ketuhanan Yang Maha Esa",
                    "Kemanusiaan yang Adil dan Beradab"
                ],

                answer: 1
            },

            {
                question:
                    "Hari Kebangkitan Nasional diperingati setiap tanggal?",

                options: [
                    "20 Mei",
                    "1 Juni",
                    "28 Oktober",
                    "10 November"
                ],

                answer: 0
            },

            {
                question:
                    "Hari Sumpah Pemuda diperingati setiap tanggal?",

                options: [
                    "17 Agustus",
                    "28 Oktober",
                    "10 November",
                    "20 Mei"
                ],

                answer: 1
            },

            {
                question:
                    "Sumpah Pemuda diikrarkan pada tahun?",

                options: [
                    "1926",
                    "1927",
                    "1928",
                    "1929"
                ],

                answer: 2
            },

            {
                question:
                    "Hari Pahlawan diperingati setiap tanggal?",

                options: [
                    "10 November",
                    "20 Mei",
                    "28 Oktober",
                    "17 Agustus"
                ],

                answer: 0
            },

            {
                question:
                    "Pertempuran besar 10 November 1945 terjadi di kota?",

                options: [
                    "Jakarta",
                    "Bandung",
                    "Surabaya",
                    "Semarang"
                ],

                answer: 2
            },

            {
                question:
                    "Siapa tokoh yang dikenal dengan sebutan Bung Tomo?",

                options: [
                    "Sutomo",
                    "Sukarno",
                    "Sudirman",
                    "Supomo"
                ],

                answer: 0
            },

            {
                question:
                    "Naskah Proklamasi dirumuskan di rumah siapa?",

                options: [
                    "Ahmad Soebardjo",
                    "Laksamana Tadashi Maeda",
                    "Sukarni",
                    "Wikana"
                ],

                answer: 1
            },

            {
                question:
                    "Siapa yang mengusulkan agar teks Proklamasi ditandatangani atas nama bangsa Indonesia?",

                options: [
                    "Sukarni",
                    "Sayuti Melik",
                    "Wikana",
                    "B.M. Diah"
                ],

                answer: 0
            },

            {
                question:
                    "Siapa yang mengetik teks Proklamasi setelah dirumuskan?",

                options: [
                    "Sayuti Melik",
                    "Sukarni",
                    "Ahmad Soebardjo",
                    "Wikana"
                ],

                answer: 0
            },

            {
                question:
                    "Siapa yang mengibarkan Bendera Pusaka saat Proklamasi?",

                options: [
                    "Latief Hendraningrat",
                    "Bung Tomo",
                    "Wikana",
                    "Ahmad Soebardjo"
                ],

                answer: 0
            },

            {
                question:
                    "Apa nama konstitusi yang disahkan pada 18 Agustus 1945?",

                options: [
                    "UUD 1945",
                    "UUDS 1950",
                    "Konstitusi RIS",
                    "UUD 1949"
                ],

                answer: 0
            },

            {
                question:
                    "Tanggal 17 Agustus diperingati sebagai?",

                options: [
                    "Hari Pahlawan",
                    "Hari Kemerdekaan Indonesia",
                    "Hari Kebangkitan Nasional",
                    "Hari Sumpah Pemuda"
                ],

                answer: 1
            },

            {
                question:
                    "Bulan Proklamasi Kemerdekaan Indonesia adalah?",

                options: [
                    "Juni",
                    "Juli",
                    "Agustus",
                    "September"
                ],

                answer: 2
            },

            {
                question:
                    "Apa nama dokumen yang menyatakan kemerdekaan Indonesia pada 17 Agustus 1945?",

                options: [
                    "Piagam Jakarta",
                    "Teks Proklamasi",
                    "Sumpah Pemuda",
                    "Dekrit Presiden"
                ],

                answer: 1
            },

            {
                question:
                    "Siapa yang dikenal sebagai Proklamator Kemerdekaan Indonesia bersama Soekarno?",

                options: [
                    "Mohammad Hatta",
                    "Ahmad Yani",
                    "Sutan Sjahrir",
                    "Jenderal Sudirman"
                ],

                answer: 0
            },

            {
                question:
                    "Organisasi yang mempersiapkan kemerdekaan Indonesia setelah BPUPKI dibubarkan adalah?",

                options: [
                    "PPKI",
                    "KNIP",
                    "BKR",
                    "MPR"
                ],

                answer: 0
            },

            {
                question:
                    "Apa nama tempat pembacaan Proklamasi pada 17 Agustus 1945?",

                options: [
                    "Pegangsaan Timur No. 56",
                    "Lapangan Ikada",
                    "Gedung Pancasila",
                    "Istana Negara"
                ],

                answer: 0
            },

            {
                question:
                    "Siapa salah satu tokoh yang ikut merumuskan teks Proklamasi bersama Soekarno dan Hatta?",

                options: [
                    "Ahmad Soebardjo",
                    "Jenderal Sudirman",
                    "Ki Hajar Dewantara",
                    "Bung Tomo"
                ],

                answer: 0
            },

            {
                question:
                    "Pada tanggal berapa Sumpah Pemuda diperingati?",

                options: [
                    "20 Mei",
                    "1 Juni",
                    "28 Oktober",
                    "10 November"
                ],

                answer: 2
            },

            {
                question:
                    "Apa nama peristiwa ketika Soekarno dan Hatta dibawa ke luar Jakarta oleh golongan pemuda?",

                options: [
                    "Peristiwa Rengasdengklok",
                    "Bandung Lautan Api",
                    "Palagan Ambarawa",
                    "Pertempuran Surabaya"
                ],

                answer: 0
            },

            {
                question:
                    "Siapa pencipta lagu Hari Merdeka?",

                options: [
                    "H. Mutahar",
                    "W.R. Supratman",
                    "Ismail Marzuki",
                    "C. Simanjuntak"
                ],

                answer: 0
            },

            {
                question:
                    "Siapa pencipta lagu Bagimu Negeri?",

                options: [
                    "Kusbini",
                    "H. Mutahar",
                    "W.R. Supratman",
                    "Ismail Marzuki"
                ],

                answer: 0
            },

            {
                question:
                    "Apa warna Bendera Pusaka Indonesia?",

                options: [
                    "Merah dan Putih",
                    "Merah dan Biru",
                    "Putih dan Biru",
                    "Merah dan Kuning"
                ],

                answer: 0
            }

        ];

    }

    // ==================================================
    // AMBIL SOAL RANDOM
    // ==================================================

    getQuestion() {

        let index;

        do {

            index =
                Math.floor(
                    Math.random() *
                    this.questions.length
                );

        } while (
            index === this.lastQuestionIndex &&
            this.questions.length > 1
        );

        this.lastQuestionIndex =
            index;

        return this.questions[index];

    }

    // ==================================================
    // EMBED SOAL
    // ==================================================

    buildQuizEmbed() {

        const q =
            this.currentQuestion;

        const letters = [
            "A",
            "B",
            "C",
            "D"
        ];

        let options = "";

        q.options.forEach(
            (option, index) => {

                options +=
                    `**${letters[index]}.** ${option}\n`;

            }
        );

        return new EmbedBuilder()

            .setColor("#E74C3C")

            .setTitle(
                "🇮🇩 QUIZ KEMERDEKAAN"
            )

            .setDescription(

`🧠 **UJI PENGETAHUANMU!**

❓ **${q.question}**

━━━━━━━━━━━━━━━━━━━━

${options}
━━━━━━━━━━━━━━━━━━━━

🏆 **HADIAH**

🥇 Juara 1 — **+25 Poin**
🥈 Juara 2 — **+15 Poin**
🥉 Juara 3 — **+10 Poin**

⏳ Waktu menjawab: **30 detik**

⚡ **3 orang tercepat yang benar akan menang!**`

            )

            .setFooter({

                text:
                    "🇮🇩 Event Kemerdekaan 2026"

            })

            .setTimestamp();

    }

    // ==================================================
    // BUTTON SOAL
    // ==================================================

    buildButtons() {

        const letters = [
            "A",
            "B",
            "C",
            "D"
        ];

        return new ActionRowBuilder()

            .addComponents(

                letters.map(
                    (letter, index) => {

                        return new ButtonBuilder()

                            .setCustomId(
                                `quiz_${index}`
                            )

                            .setLabel(
                                letter
                            )

                            .setStyle(
                                ButtonStyle.Primary
                            );

                    }
                )

            );

    }

    // ==================================================
    // SPAWN QUIZ
    // ==================================================

    async spawn() {

        if (
            this.active
        )
            return;

        if (
            !process.env.QUIZ_CHANNEL
        )
            return;

        try {

            const channel =
                await this.client.channels.fetch(
                    process.env.QUIZ_CHANNEL
                );

// ==================================================
            // RESET
            // ==================================================

            this.active = true;

            this.answers.clear();

            this.winners = [];

            this.currentQuestion =
                this.getQuestion();

            // ==================================================
            // HAPUS PESAN LAMA
            // ==================================================

            if (
                this.message
            ) {

                try {

                    await this.message.delete();

                } catch (err) {}

                this.message = null;

            }

            // ==================================================
            // KIRIM SOAL BARU
            // ==================================================

            this.message =
                await channel.send({

                    content:
                        "🚨 **QUIZ KEMERDEKAAN DIMULAI!**",

                    embeds: [
                        this.buildQuizEmbed()
                    ],

                    components: [
                        this.buildButtons()
                    ]

                });

            console.log(
                `🧠 Quiz dimulai: ${this.currentQuestion.question}`
            );

// ==================================================
            // TIMER 30 DETIK
            // ==================================================

            clearTimeout(
                this.timer
            );

            this.timer =
                setTimeout(
                    async () => {

                        await this.finish();

                    },
                    30000
                );

        } catch (err) {

            console.error(
                "❌ Quiz spawn error:",
                err
            );

            this.active = false;

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

        if (
            !interaction.customId.startsWith(
                "quiz_"
            )
        )
            return;

        if (
            !this.active
        ) {

            return interaction.reply({

                content:
                    "⏰ Quiz sudah selesai.",

                ephemeral: true

            });

        }

// ==================================================
        // CEK SUDAH MENJAWAB
        // ==================================================

        const userId =
            interaction.user.id;

        if (
            this.answers.has(
                userId
            )
        ) {

            return interaction.reply({

                content:
                    "❌ Kamu sudah menjawab quiz ini.",

                ephemeral: true

            });

        }

        this.answers.add(
            userId
        );

        // ==================================================
        // JAWABAN
        // ==================================================

        const answer =
            Number(
                interaction.customId
                    .replace(
                        "quiz_",
                        ""
                    )
            );

        // ==================================================
        // SALAH
        // ==================================================

        if (
            answer !==
            this.currentQuestion.answer
        ) {

            return interaction.reply({

                content:
                    "❌ Jawaban salah! Semoga beruntung di quiz berikutnya.",

                ephemeral: true

            });

        }

        // ==================================================
        // BENAR
        // ==================================================

        const position =
            this.winners.length;

        if (
            position >= 3
        ) {

            return interaction.reply({

                content:
                    "⏰ Tiga pemenang sudah ditemukan.",

                ephemeral: true

            });

        }

        const prize =
            this.prizes[position];

        // Simpan pemenang
        this.winners.push({

            id:
                userId,

            username:
                interaction.user.username,

            prize

        });

// ==================================================
        // BALAS USER
        // ==================================================

        await interaction.reply({

            content:
                `🎉 **Jawaban benar!**\n\n` +
                `🏆 Kamu berada di posisi **#${position + 1}**!\n` +
                `💰 Hadiah: **+${prize} poin**`,

            ephemeral: true

        });

        // ==================================================
        // JIKA 3 PEMENANG SUDAH ADA
        // ==================================================

        if (
            this.winners.length >= 3
        ) {

            await this.finish();

        }

    }

    // ==================================================
    // FINISH
    // ==================================================

    async finish() {

        if (
            !this.active
        )
            return;

        this.active = false;

        clearTimeout(
            this.timer
        );

        // ==================================================
        // BAYAR PEMENANG
        // ==================================================

        for (
            const winner
            of this.winners
        ) {

            const user =
                database.addPoint(

                    winner.id,

                    winner.username,

                    winner.prize

                );

            user.quiz =
                (user.quiz || 0) + 1;

        }

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
                "Leaderboard error:",
                err
            );

        }

        // ==================================================
        // HASIL QUIZ
        // ==================================================

        let result = "";

        if (
            this.winners.length === 0
        ) {

            result =
                "😢 Tidak ada yang berhasil menjawab dengan benar.";

        } else {

            this.winners.forEach(
                (winner, index) => {

                    const medal =
                        index === 0
                            ? "🥇"
                            : index === 1
                                ? "🥈"
                                : "🥉";

                    result +=
                        `${medal} **${winner.username}** — **+${winner.prize} Poin**\n`;

                }
            );

        }

        // ==================================================
        // UPDATE PESAN MENJADI HASIL
        // ==================================================

        if (
            this.message
        ) {

            try {

                await this.message.edit({

                    content:
                        "🏁 **QUIZ SELESAI!**",

                    embeds: [

                        new EmbedBuilder()

                            .setColor("#2ECC71")

                            .setTitle(
                                "🏆 HASIL QUIZ KEMERDEKAAN"
                            )

                            .setDescription(

`🎉 **3 PEMENANG TERCEPAT**

${result}

━━━━━━━━━━━━━━━━━━━━

❓ **Soal:**
${this.currentQuestion.question}

✅ **Jawaban benar:**
**${this.currentQuestion.options[this.currentQuestion.answer]}**

━━━━━━━━━━━━━━━━━━━━

🕒 Quiz berikutnya:
**Jadwal berikutnya pukul 15:00–21:00 WIB**`

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
                    "❌ Gagal update hasil quiz:",
                    err
                );

            }

        }

// ==================================================
        // RESET DATA
        // ==================================================

        this.currentQuestion = null;

        this.answers.clear();

    }

    // ==================================================
    // WAKTU WIB
    // ==================================================

    getWIB() {

        const now =
            new Date();

        const parts =
            new Intl.DateTimeFormat(
                "en-US",
                {

                    timeZone:
                        "Asia/Jakarta",

                    year:
                        "numeric",

                    month:
                        "2-digit",

                    day:
                        "2-digit",

                    hour:
                        "2-digit",

                    minute:
                        "2-digit",

                    hour12:
                        false

                }
            ).formatToParts(now);

        const data = {};

        parts.forEach(
            part => {

                data[part.type] =
                    part.value;

            }
        );

        return {

            year:
                data.year,

            month:
                data.month,

            day:
                data.day,

            hour:
                Number(
                    data.hour
                ),

            minute:
                Number(
                    data.minute
                )

        };

    }

// ==================================================
    // SCHEDULER
    // ==================================================

    startScheduler() {

        this.scheduler =
            setInterval(
                async () => {

                    const wib =
                        this.getWIB();

                    const hour =
                        wib.hour;

                    const minute =
                        wib.minute;

                    // ==================================================
                    // HANYA JAM 15-21
                    // ==================================================

                    if (
                        !this.quizHours.includes(
                            hour
                        )
                    ) {

                        return;

                    }

                    // ==================================================
                    // HANYA MENIT 00
                    // ==================================================

                    if (
                        minute !== 0
                    ) {

                        return;

                    }

                    // ==================================================
                    // KEY AGAR TIDAK DOBEL
                    // ==================================================

                    const spawnKey =
                        `${wib.year}-${wib.month}-${wib.day}-${hour}`;

                    if (
                        this.lastSpawnKey ===
                        spawnKey
                    ) {

                        return;

                    }

                    this.lastSpawnKey =
                        spawnKey;

                    await this.spawn();

                },
                30000
            );

    }

    // ==================================================
    // START
    // ==================================================

    start() {

        console.log(
            "🧠 Quiz Module Loaded"
        );

        console.log(
            "📅 Jadwal Quiz:"
        );

        console.log(
            "15:00, 16:00, 17:00, 18:00, 19:00, 20:00, 21:00 WIB"
        );

        this.startScheduler();

    }

}

// ==================================================
// EXPORT
// ==================================================

module.exports = Quiz;