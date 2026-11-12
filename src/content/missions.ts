/**
 * Konten materi ORBIT MATH — Keliling Lingkaran (SMP kelas VIII).
 * Konvensi π: 22/7 untuk kelipatan 7, 3,14 untuk bilangan lainnya.
 */

export type ActivityKey = "circle-hunt" | "anatomy" | "pi-measure" | "rolling-wheel" | "formula-builder" | "real-world" | "final-recap";

export interface MissionSection {
  title: string;
  body: string[];
  illustration?: string;
  formula?: string;
}

export interface MissionExample {
  question: string;
  illustration?: string;
  known: string[];
  asked: string;
  steps: string[];
  answer: string;
}

export interface MissionContent {
  id: number;
  slug: string;
  code: string;
  planet: string;
  title: string;
  tagline: string;
  colors: [string, string];
  bimoIntro: string;
  objectives: string[];
  sections: MissionSection[];
  terms: { term: string; meaning: string }[];
  realLife: { title: string; text: string; icon: string }[];
  examples: MissionExample[];
  funFact: string;
  summary: string[];
  activity: ActivityKey;
  activityTitle: string;
  activityIntro: string;
}

export const MISSIONS: MissionContent[] = [
  {
    id: 1,
    slug: "circle-station",
    code: "MISSION 01",
    planet: "Circle Station",
    title: "Mengenal Lingkaran",
    tagline: "Stasiun pertama: apa sih sebenarnya lingkaran itu?",
    colors: ["#62E5F5", "#1D55A6"],
    bimoIntro: "Halo, penjelajah! BIMO siap menemanimu menjelajahi dunia lingkaran hari ini! Kita mulai dari dasar: apa itu lingkaran?",
    objectives: [
      "Menjelaskan pengertian lingkaran dengan kata-kata sendiri.",
      "Menyebutkan ciri-ciri lingkaran dan titik pusatnya.",
      "Membedakan lingkaran dengan bangun datar lain.",
      "Menemukan contoh benda berbentuk lingkaran di sekitar kita.",
    ],
    sections: [
      {
        title: "Apa itu lingkaran?",
        body: [
          "Bayangkan kamu menancapkan paku di tanah, mengikat tali, lalu menarik tali itu memutar sambil menggores tanah.",
          "Garis lengkung yang terbentuk adalah lingkaran: kumpulan semua titik yang jaraknya SAMA terhadap satu titik tertentu.",
          "Titik tertentu itu disebut titik pusat, dan jarak yang sama itu disebut jari-jari.",
        ],
        illustration: "anatomy:radius",
      },
      {
        title: "Ciri-ciri lingkaran",
        body: [
          "Tidak mempunyai titik sudut dan tidak mempunyai sisi lurus.",
          "Mempunyai satu titik pusat tepat di tengah.",
          "Jarak titik pusat ke setiap titik pada lingkaran selalu sama.",
          "Bentuknya simetris: dilipat melalui pusat ke arah mana pun, kedua bagian pasti sama.",
        ],
        illustration: "anatomy:center",
      },
      {
        title: "Lingkaran vs bangun datar lain",
        body: [
          "Persegi dan segitiga punya sisi lurus dan titik sudut. Lingkaran tidak punya keduanya.",
          "Oval (elips) memang lengkung, tetapi jarak tepinya ke tengah tidak sama di semua arah. Jadi oval BUKAN lingkaran.",
        ],
        illustration: "compare-shapes",
      },
    ],
    terms: [
      { term: "Lingkaran", meaning: "Kumpulan titik yang berjarak sama terhadap satu titik pusat." },
      { term: "Titik pusat", meaning: "Titik tepat di tengah lingkaran." },
      { term: "Jari-jari (r)", meaning: "Jarak dari titik pusat ke titik pada lingkaran." },
      { term: "Simetris", meaning: "Dua bagian yang sama persis bila dilipat." },
    ],
    realLife: [
      { title: "Roda sepeda", text: "Roda dibuat lingkaran agar berputar mulus tanpa terantuk.", icon: "wheel" },
      { title: "Jam dinding", text: "Jarum jam berputar mengitari titik pusat.", icon: "clock" },
      { title: "Uang koin", text: "Permukaan koin berbentuk lingkaran.", icon: "coin" },
      { title: "Piring", text: "Tepi piring membentuk lingkaran.", icon: "plate" },
    ],
    examples: [
      {
        question: "Andi menggambar lingkaran dengan jangka. Jarak ujung jangka 5 cm. Berapa jarak titik pusat ke tepi lingkaran di titik mana pun?",
        illustration: "circle-r:5 cm",
        known: ["Bukaan jangka = 5 cm"],
        asked: "Jarak titik pusat ke tepi lingkaran",
        steps: [
          "Bukaan jangka menentukan jarak pusat ke tepi, yaitu jari-jari.",
          "Pada lingkaran, jarak pusat ke SETIAP titik di tepinya selalu sama.",
        ],
        answer: "Jaraknya selalu 5 cm di titik mana pun.",
      },
      {
        question: "Manakah yang lingkaran: permukaan telur atau permukaan uang koin?",
        known: ["Telur berbentuk lonjong", "Koin berbentuk bundar"],
        asked: "Benda yang berbentuk lingkaran",
        steps: [
          "Cek ciri utama: apakah jarak tepi ke tengah sama ke semua arah?",
          "Pada telur, jaraknya berbeda (lonjong). Pada koin, jaraknya sama.",
        ],
        answer: "Uang koin berbentuk lingkaran; telur berbentuk oval.",
      },
    ],
    funFact: "Lingkaran adalah bangun yang paling 'hemat': dengan panjang pagar yang sama, lingkaran mengurung daerah paling luas dibanding bangun lain!",
    summary: [
      "Lingkaran = kumpulan titik yang berjarak sama ke titik pusat.",
      "Jarak itu disebut jari-jari (r).",
      "Lingkaran tidak punya sisi lurus dan titik sudut.",
      "Oval bukan lingkaran karena jarak tepinya ke tengah tidak sama.",
    ],
    activity: "circle-hunt",
    activityTitle: "Aktivitas: Pemindai Bentuk",
    activityIntro: "Pindai objek di stasiun! Ketuk semua benda yang berbentuk lingkaran, lalu tekan Periksa.",
  },
  {
    id: 2,
    slug: "radius-base",
    code: "MISSION 02",
    planet: "Radius Base",
    title: "Unsur-Unsur Lingkaran",
    tagline: "Kenali bagian-bagian lingkaran seperti teknisi pangkalan.",
    colors: ["#318BFF", "#8D7CFF"],
    bimoIntro: "Selamat datang di Radius Base! Di sini kita membongkar lingkaran dan memberi nama setiap bagiannya.",
    objectives: [
      "Menyebutkan unsur-unsur lingkaran: titik pusat, jari-jari, diameter, busur, tali busur, juring, dan tembereng.",
      "Menunjukkan setiap unsur pada gambar lingkaran.",
      "Menggunakan hubungan d = 2 × r dan r = d ÷ 2.",
    ],
    sections: [
      {
        title: "Unsur berupa titik dan garis",
        body: [
          "Titik pusat: titik di tengah lingkaran.",
          "Jari-jari (r): garis dari titik pusat ke titik pada lingkaran.",
          "Diameter (d): garis lurus yang melalui titik pusat dan menghubungkan dua titik pada lingkaran.",
          "Tali busur: garis lurus yang menghubungkan dua titik pada lingkaran (tidak harus melewati pusat).",
          "Busur: garis lengkung, bagian dari keliling lingkaran.",
        ],
        illustration: "anatomy:diameter",
      },
      {
        title: "Unsur berupa daerah",
        body: [
          "Juring: daerah yang dibatasi dua jari-jari dan sebuah busur — mirip potongan pizza.",
          "Tembereng: daerah yang dibatasi sebuah tali busur dan busurnya — mirip potongan semangka di pinggir.",
        ],
        illustration: "anatomy:sector",
      },
      {
        title: "Hubungan jari-jari dan diameter",
        body: [
          "Diameter tersusun dari dua jari-jari yang segaris.",
          "Jadi diameter = 2 kali jari-jari, dan jari-jari = setengah diameter.",
          "Diameter juga merupakan tali busur yang paling panjang.",
        ],
        formula: "d = 2 × r     r = d ÷ 2",
        illustration: "circle-d:d = 2r",
      },
    ],
    terms: [
      { term: "Jari-jari (r)", meaning: "Garis dari pusat ke tepi lingkaran." },
      { term: "Diameter (d)", meaning: "Garis tengah melalui pusat; d = 2 × r." },
      { term: "Tali busur", meaning: "Garis lurus penghubung dua titik pada lingkaran." },
      { term: "Busur", meaning: "Garis lengkung bagian dari keliling." },
      { term: "Juring", meaning: "Daerah antara dua jari-jari dan busur." },
      { term: "Tembereng", meaning: "Daerah antara tali busur dan busur." },
    ],
    realLife: [
      { title: "Jari-jari roda", text: "Ruji sepeda menghubungkan as (pusat) ke tepi roda — persis seperti jari-jari.", icon: "wheel" },
      { title: "Potongan pizza", text: "Satu potong pizza berbentuk juring.", icon: "pizza" },
      { title: "Semangka", text: "Irisan pinggir semangka bundar mirip tembereng.", icon: "plate" },
    ],
    examples: [
      {
        question: "Jari-jari sebuah roda 30 cm. Berapa diameternya?",
        illustration: "circle-r:30 cm",
        known: ["r = 30 cm"],
        asked: "d",
        steps: ["Gunakan d = 2 × r.", "d = 2 × 30 = 60."],
        answer: "Diameter roda 60 cm.",
      },
      {
        question: "Diameter sebuah jam dinding 34 cm. Berapa jari-jarinya?",
        illustration: "clock:d = 34 cm",
        known: ["d = 34 cm"],
        asked: "r",
        steps: ["Gunakan r = d ÷ 2.", "r = 34 ÷ 2 = 17."],
        answer: "Jari-jari jam 17 cm.",
      },
    ],
    funFact: "Kata 'diameter' berasal dari bahasa Yunani: dia = melalui, metron = ukuran. Artinya 'ukuran yang melalui (pusat)'.",
    summary: [
      "Ada 7 unsur utama: titik pusat, jari-jari, diameter, tali busur, busur, juring, tembereng.",
      "Busur = garis lengkung; tali busur = garis lurus.",
      "Juring dibatasi 2 jari-jari; tembereng dibatasi tali busur.",
      "d = 2 × r dan r = d ÷ 2.",
    ],
    activity: "anatomy",
    activityTitle: "Aktivitas: Bongkar Lingkaran",
    activityIntro: "Ketuk nama unsur untuk menyalakannya pada diagram. Baca penjelasannya, lalu coba tebak sebelum menekan!",
  },
  {
    id: 3,
    slug: "pi-observatory",
    code: "MISSION 03",
    planet: "Pi Observatory",
    title: "Memahami Nilai Pi (π)",
    tagline: "Temukan angka rahasia yang dimiliki SEMUA lingkaran.",
    colors: ["#8D7CFF", "#62E5F5"],
    bimoIntro: "Di observatorium ini, kita akan menemukan angka ajaib bernama π (dibaca 'pi'). Siapkan teleskop dan pita ukurmu!",
    objectives: [
      "Menjelaskan π sebagai perbandingan keliling dan diameter.",
      "Menyebutkan nilai pendekatan π: 3,14 dan 22/7.",
      "Memilih nilai π yang tepat untuk perhitungan.",
    ],
    sections: [
      {
        title: "Percobaan pita ukur",
        body: [
          "Ambil beberapa benda bundar: tutup gelas, piring, dan roda.",
          "Ukur kelilingnya dengan pita, lalu ukur diameternya dengan penggaris.",
          "Bagi keliling dengan diameter. Ajaibnya, hasilnya selalu sekitar 3,14!",
        ],
        illustration: "pi-unroll",
      },
      {
        title: "Inilah π",
        body: [
          "Perbandingan keliling dan diameter yang selalu sama itu diberi nama π (pi).",
          "π adalah konstanta: nilainya tetap untuk lingkaran sebesar apa pun.",
          "Nilai π sebenarnya 3,14159265… dengan desimal yang tidak pernah berakhir.",
        ],
        formula: "π = K ÷ d",
      },
      {
        title: "3,14 atau 22/7?",
        body: [
          "Karena desimalnya tak berujung, kita memakai nilai pendekatan: 3,14 atau 22/7.",
          "Pakai 22/7 jika jari-jari atau diameter kelipatan 7 (7, 14, 21, 28, 35, …). Angka 7-nya bisa dicoret!",
          "Pakai 3,14 untuk bilangan lain, terutama kelipatan 10 (10, 20, 50, …).",
        ],
        formula: "π ≈ 3,14 ≈ 22/7",
      },
    ],
    terms: [
      { term: "π (pi)", meaning: "Perbandingan keliling dengan diameter lingkaran." },
      { term: "Konstanta", meaning: "Bilangan yang nilainya selalu tetap." },
      { term: "Nilai pendekatan", meaning: "Nilai yang sangat dekat dengan nilai sebenarnya." },
    ],
    realLife: [
      { title: "Teknik mesin", text: "Insinyur memakai π untuk merancang roda gigi dan mesin.", icon: "gear" },
      { title: "Satelit", text: "Orbit satelit dihitung memakai π.", icon: "planet" },
      { title: "Toples", text: "Label toples dibuat sepanjang keliling = π × diameter.", icon: "jar" },
    ],
    examples: [
      {
        question: "Keliling tutup panci 62,8 cm dan diameternya 20 cm. Berapa hasil K ÷ d?",
        known: ["K = 62,8 cm", "d = 20 cm"],
        asked: "K ÷ d",
        steps: ["Bagi keliling dengan diameter.", "62,8 ÷ 20 = 3,14."],
        answer: "Hasilnya 3,14 — itulah nilai π!",
      },
      {
        question: "Jari-jari lingkaran 14 cm. Nilai π mana yang lebih mudah dipakai?",
        known: ["r = 14 cm (kelipatan 7)"],
        asked: "Nilai π yang paling mudah",
        steps: ["14 = 2 × 7, jadi kelipatan 7.", "Dengan 22/7, angka 7 bisa dicoret: 22/7 × 14 = 22 × 2."],
        answer: "Gunakan π = 22/7.",
      },
    ],
    funFact: "Setiap tanggal 14 Maret (3/14) dirayakan sebagai Hari Pi sedunia. Komputer sudah menghitung π sampai triliunan angka di belakang koma!",
    summary: [
      "π = keliling ÷ diameter, selalu ≈ 3,14.",
      "π adalah konstanta untuk semua lingkaran.",
      "Pendekatan π: 3,14 atau 22/7.",
      "Kelipatan 7 → pakai 22/7; lainnya → pakai 3,14.",
    ],
    activity: "pi-measure",
    activityTitle: "Aktivitas: Laboratorium Pita Ukur",
    activityIntro: "Pilih benda, lalu 'ukur' keliling dan diameternya. Lihat tabel: apa yang selalu sama?",
  },
  {
    id: 4,
    slug: "circle-motion",
    code: "MISSION 04",
    planet: "Circle Motion",
    title: "Konsep Keliling Lingkaran",
    tagline: "Gulirkan roda dan saksikan kelilingnya terbentang.",
    colors: ["#62E5F5", "#318BFF"],
    bimoIntro: "Hai, penjelajah! Hari ini kita akan mencari tahu rahasia panjang garis yang mengelilingi sebuah lingkaran.",
    objectives: [
      "Menjelaskan keliling sebagai panjang garis yang mengelilingi lingkaran.",
      "Menghubungkan keliling dengan diameter dan jari-jari.",
      "Menjelaskan bahwa satu putaran roda menempuh jarak sama dengan kelilingnya.",
    ],
    sections: [
      {
        title: "Apa itu keliling?",
        body: [
          "Keliling lingkaran adalah panjang garis lengkung yang mengelilingi lingkaran satu putaran penuh.",
          "Bayangkan seekor semut berjalan di tepi piring sampai kembali ke titik awal. Jarak tempuh semut itulah kelilingnya.",
          "Keliling diukur dalam satuan panjang: cm, m, atau km.",
        ],
        illustration: "circle-k",
      },
      {
        title: "Satu putaran penuh",
        body: [
          "Saat roda berputar satu kali tanpa tergelincir, setiap titik di tepinya menyentuh jalan tepat satu kali.",
          "Artinya, jarak yang ditempuh roda dalam 1 putaran = keliling roda.",
          "Jika roda berputar n kali, jaraknya = n × keliling.",
        ],
        formula: "Jarak = banyak putaran × K",
        illustration: "wheel:1 putaran = K",
      },
      {
        title: "Keliling, diameter, dan jari-jari",
        body: [
          "Dari Misi 3, kita tahu K ÷ d = π. Jadi keliling ≈ 3,14 kali diameternya.",
          "Semakin besar diameter (atau jari-jari), semakin panjang kelilingnya.",
          "Jika diameter dibuat 2 kali lipat, keliling juga menjadi 2 kali lipat.",
        ],
      },
    ],
    terms: [
      { term: "Keliling (K)", meaning: "Panjang garis yang mengelilingi lingkaran." },
      { term: "Satu putaran", meaning: "Gerak memutar sampai kembali ke posisi awal (360°)." },
      { term: "Tergelincir", meaning: "Roda bergeser tanpa berputar — jaraknya tidak lagi sama dengan keliling." },
    ],
    realLife: [
      { title: "Odometer sepeda", text: "Alat penghitung jarak sepeda menghitung putaran roda × keliling roda.", icon: "wheel" },
      { title: "Lintasan atletik", text: "Pelari menempuh keliling lintasan setiap satu putaran.", icon: "track" },
      { title: "Bianglala", text: "Penumpang bianglala menempuh satu keliling setiap satu putaran.", icon: "ferris" },
    ],
    examples: [
      {
        question: "Keliling roda sepeda 2 m. Roda berputar 15 kali. Berapa jarak yang ditempuh?",
        illustration: "wheel:K = 2 m",
        known: ["K = 2 m", "Banyak putaran = 15"],
        asked: "Jarak tempuh",
        steps: ["Jarak = banyak putaran × keliling.", "Jarak = 15 × 2 = 30."],
        answer: "Jarak yang ditempuh 30 m.",
      },
      {
        question: "Roda A berdiameter 20 cm, roda B berdiameter 40 cm. Berapa kali keliling B dibanding A?",
        known: ["dA = 20 cm", "dB = 40 cm = 2 × dA"],
        asked: "Perbandingan keliling",
        steps: ["Keliling sebanding dengan diameter.", "Diameter B dua kali A, maka keliling B juga dua kali A."],
        answer: "Keliling B = 2 kali keliling A.",
      },
    ],
    funFact: "Para pengukur jalan zaman dulu memakai 'roda pengukur': setiap satu putaran, roda itu berbunyi 'klik' — tinggal hitung kliknya!",
    summary: [
      "Keliling = panjang garis yang mengelilingi lingkaran.",
      "1 putaran roda = jarak sepanjang kelilingnya.",
      "Jarak = banyak putaran × keliling.",
      "Keliling ≈ 3,14 × diameter; diameter dua kali lipat → keliling dua kali lipat.",
    ],
    activity: "rolling-wheel",
    activityTitle: "Aktivitas: Gulirkan Roda",
    activityIntro: "Tekan Mulai dan amati: setelah satu putaran, berapa jauh roda berpindah?",
  },
  {
    id: 5,
    slug: "formula-core",
    code: "MISSION 05",
    planet: "Formula Core",
    title: "Rumus Keliling Lingkaran",
    tagline: "Rakit rumus inti — dan pahami dari mana asalnya.",
    colors: ["#FFD76A", "#318BFF"],
    bimoIntro: "Ini dia inti reaktor ORBIT MATH: rumus keliling! Kita tidak sekadar menghafal — kita rakit sendiri rumusnya.",
    objectives: [
      "Menurunkan rumus K = π × d dari pengertian π.",
      "Menurunkan rumus K = 2 × π × r dari d = 2 × r.",
      "Menghitung keliling dari jari-jari atau diameter langkah demi langkah.",
    ],
    sections: [
      {
        title: "Langkah 1: dari π ke rumus",
        body: [
          "Kita tahu π = K ÷ d.",
          "Jika kedua ruas dikali d, kita dapat K = π × d.",
          "Inilah rumus keliling jika diketahui diameter.",
        ],
        formula: "K = π × d",
      },
      {
        title: "Langkah 2: ganti d dengan 2r",
        body: [
          "Ingat d = 2 × r.",
          "Ganti d pada rumus: K = π × (2 × r) = 2 × π × r.",
          "Inilah rumus keliling jika diketahui jari-jari. Dua rumus ini sebenarnya SAMA!",
        ],
        formula: "K = 2 × π × r",
        illustration: "formula-link",
      },
      {
        title: "Arti setiap huruf",
        body: ["K = keliling lingkaran.", "π = konstanta pi (3,14 atau 22/7).", "d = diameter.", "r = jari-jari."],
      },
      {
        title: "Tips menghitung cepat",
        body: [
          "Kelipatan 7? Pakai 22/7, coret 7-nya dulu: 22/7 × 21 = 22 × 3 = 66.",
          "Kelipatan 10? Pakai 3,14 dan geser koma: 3,14 × 10 = 31,4.",
          "Selalu tulis satuan di jawaban akhir (cm, m).",
        ],
      },
    ],
    terms: [
      { term: "K = π × d", meaning: "Rumus keliling dari diameter." },
      { term: "K = 2 × π × r", meaning: "Rumus keliling dari jari-jari." },
      { term: "Substitusi", meaning: "Mengganti huruf dengan angka yang diketahui." },
    ],
    realLife: [
      { title: "Desain roda", text: "Pabrik sepeda menghitung panjang ban dengan K = π × d.", icon: "wheel" },
      { title: "Bingkai jam", text: "Panjang bingkai jam dinding = kelilingnya.", icon: "clock" },
    ],
    examples: [
      {
        question: "Hitung keliling lingkaran dengan jari-jari 7 cm.",
        illustration: "circle-r:7 cm",
        known: ["r = 7 cm", "π = 22/7 (karena 7 kelipatan 7)"],
        asked: "K",
        steps: ["Rumus: K = 2 × π × r.", "Substitusi: K = 2 × 22/7 × 7.", "Coret 7: K = 2 × 22 = 44."],
        answer: "Keliling = 44 cm.",
      },
      {
        question: "Hitung keliling lingkaran dengan diameter 50 cm.",
        illustration: "circle-d:50 cm",
        known: ["d = 50 cm", "π = 3,14"],
        asked: "K",
        steps: ["Rumus: K = π × d.", "Substitusi: K = 3,14 × 50.", "Hitung: K = 157."],
        answer: "Keliling = 157 cm.",
      },
      {
        question: "Keliling lingkaran 88 cm. Berapa jari-jarinya? (π = 22/7)",
        known: ["K = 88 cm", "π = 22/7"],
        asked: "r",
        steps: ["K = 2 × π × r → 88 = 2 × 22/7 × r.", "88 = 44/7 × r.", "r = 88 × 7/44 = 14."],
        answer: "Jari-jari = 14 cm.",
      },
    ],
    funFact: "Matematikawan Archimedes (sekitar 250 SM) membuktikan bahwa π berada di antara 3 10/71 dan 3 1/7 — nilai 22/7 berasal dari batas atasnya!",
    summary: [
      "K = π × d (jika diketahui diameter).",
      "K = 2 × π × r (jika diketahui jari-jari).",
      "Kedua rumus sama karena d = 2 × r.",
      "Langkah: tulis diketahui → pilih rumus → substitusi → hitung → beri satuan.",
    ],
    activity: "formula-builder",
    activityTitle: "Aktivitas: Rakit Rumus",
    activityIntro: "Susun kepingan rumus dengan urutan yang benar, lalu uji rumusmu dengan angka.",
  },
  {
    id: 6,
    slug: "real-world-galaxy",
    code: "MISSION 06",
    planet: "Real World Galaxy",
    title: "Penerapan Keliling Lingkaran",
    tagline: "Bawa rumus keliling ke dunia nyata.",
    colors: ["#5BE3A1", "#318BFF"],
    bimoIntro: "Rumus sudah di tangan! Sekarang kita terbang ke Real World Galaxy untuk menyelesaikan masalah sehari-hari.",
    objectives: [
      "Menerjemahkan soal cerita menjadi informasi diketahui dan ditanya.",
      "Menyelesaikan masalah keliling dalam kehidupan sehari-hari.",
      "Menyelesaikan soal dengan beberapa langkah (putaran, satuan, biaya).",
    ],
    sections: [
      {
        title: "Strategi 4 langkah",
        body: [
          "1. Baca soal, tulis apa yang DIKETAHUI (r atau d? satuannya?).",
          "2. Tulis apa yang DITANYA (keliling? jarak? banyak putaran?).",
          "3. Pilih rumus dan nilai π yang tepat, lalu hitung.",
          "4. Periksa satuan dan jawab dengan kalimat lengkap.",
        ],
      },
      {
        title: "Kata kunci soal cerita",
        body: [
          "'Dipagari', 'dililit pita', 'bingkai', 'satu putaran' → yang dicari adalah KELILING.",
          "'Berputar n kali' → jarak = n × keliling.",
          "Perhatikan satuan: 100 cm = 1 m, 1.000 m = 1 km.",
        ],
      },
    ],
    terms: [
      { term: "Diketahui", meaning: "Informasi yang diberikan soal." },
      { term: "Ditanya", meaning: "Hal yang harus dicari." },
      { term: "Konversi satuan", meaning: "Mengubah satuan, misalnya cm ke m." },
    ],
    realLife: [
      { title: "Roda sepeda", text: "Menghitung jarak tempuh dari banyak putaran.", icon: "wheel" },
      { title: "Pagar taman", text: "Menghitung panjang pagar taman bundar.", icon: "garden" },
      { title: "Lintasan lari", text: "Menghitung jarak beberapa putaran.", icon: "track" },
      { title: "Meja bundar", text: "Menghitung panjang hiasan tepi meja.", icon: "table" },
      { title: "Pita kado", text: "Menghitung panjang pita pembungkus.", icon: "ribbon" },
    ],
    examples: [
      {
        question: "Roda sepeda Sinta berjari-jari 35 cm. Berapa keliling roda tersebut?",
        illustration: "wheel:r = 35 cm",
        known: ["r = 35 cm", "π = 22/7"],
        asked: "Keliling roda",
        steps: ["K = 2 × π × r", "K = 2 × 22/7 × 35", "K = 2 × 22 × 5 = 220"],
        answer: "Keliling roda sepeda Sinta 220 cm.",
      },
      {
        question: "Taman berbentuk lingkaran berdiameter 28 m akan dipagari. Berapa panjang pagar yang dibutuhkan?",
        illustration: "garden:d = 28 m",
        known: ["d = 28 m", "π = 22/7"],
        asked: "Panjang pagar (= keliling taman)",
        steps: ["K = π × d", "K = 22/7 × 28", "K = 22 × 4 = 88"],
        answer: "Panjang pagar yang dibutuhkan 88 m.",
      },
      {
        question: "Lintasan lari berbentuk lingkaran berjari-jari 49 m. Berapa jarak satu putaran?",
        illustration: "track:r = 49 m",
        known: ["r = 49 m", "π = 22/7"],
        asked: "Jarak satu putaran",
        steps: ["Jarak 1 putaran = keliling.", "K = 2 × 22/7 × 49 = 2 × 22 × 7 = 308"],
        answer: "Jarak satu putaran 308 m.",
      },
      {
        question: "Meja bundar berdiameter 120 cm. Berapa keliling meja?",
        illustration: "table:d = 120 cm",
        known: ["d = 120 cm", "π = 3,14"],
        asked: "Keliling meja",
        steps: ["K = π × d", "K = 3,14 × 120 = 376,8"],
        answer: "Keliling meja 376,8 cm.",
      },
      {
        question: "Roda berdiameter 63 cm berputar 200 kali. Berapa meter jarak tempuhnya?",
        illustration: "wheel:d = 63 cm",
        known: ["d = 63 cm", "Putaran = 200", "π = 22/7"],
        asked: "Jarak tempuh dalam meter",
        steps: ["K = 22/7 × 63 = 22 × 9 = 198 cm", "Jarak = 200 × 198 = 39.600 cm", "39.600 cm ÷ 100 = 396 m"],
        answer: "Jarak tempuh roda 396 m.",
      },
      {
        question: "Pita dililitkan 1 kali mengelilingi kotak kue bundar berdiameter 21 cm, ditambah 10 cm untuk pita. Berapa panjang pita?",
        illustration: "ribbon:d = 21 cm",
        known: ["d = 21 cm", "Tambahan = 10 cm", "π = 22/7"],
        asked: "Panjang pita",
        steps: ["K = 22/7 × 21 = 22 × 3 = 66 cm", "Panjang pita = 66 + 10 = 76 cm"],
        answer: "Panjang pita yang diperlukan 76 cm.",
      },
    ],
    funFact: "Lintasan atletik standar memiliki dua tikungan setengah lingkaran. Pelari di lajur luar mulai lebih depan karena keliling tikungannya lebih panjang!",
    summary: [
      "Pagar, pita, bingkai, satu putaran → cari keliling.",
      "Berputar n kali → jarak = n × K.",
      "Selalu perhatikan satuan dan konversinya.",
      "Jawab dengan kalimat lengkap dan satuan.",
    ],
    activity: "real-world",
    activityTitle: "Aktivitas: Misi Lapangan",
    activityIntro: "Pilih kasus, hitung sendiri, lalu cocokkan jawabanmu. BIMO akan memberi petunjuk bila perlu.",
  },
  {
    id: 7,
    slug: "final-cosmic-mission",
    code: "MISSION 07",
    planet: "Final Cosmic Mission",
    title: "Evaluasi Keseluruhan",
    tagline: "Gerbang terakhir galaksi: buktikan penguasaanmu!",
    colors: ["#FFD76A", "#8D7CFF"],
    bimoIntro: "Penjelajah hebat! Kamu sudah melewati 6 wilayah. Sebelum Final Examination, ayo kita isi ulang ingatan bersama.",
    objectives: [
      "Mengulang seluruh konsep: lingkaran, unsur, π, keliling, dan rumus.",
      "Mengukur kesiapan melalui kuis pemanasan.",
      "Mengikuti Final Examination.",
    ],
    sections: [
      {
        title: "Peta konsep perjalananmu",
        body: [
          "Lingkaran → kumpulan titik berjarak sama ke pusat.",
          "Unsur → pusat, jari-jari, diameter, tali busur, busur, juring, tembereng.",
          "π → K ÷ d ≈ 3,14 ≈ 22/7.",
          "Keliling → panjang garis yang mengelilingi lingkaran; 1 putaran roda = K.",
          "Rumus → K = π × d = 2 × π × r.",
        ],
        illustration: "formula-link",
      },
      {
        title: "Kesalahan yang sering terjadi",
        body: [
          "Tertukar jari-jari dan diameter. Cek: apakah garisnya melewati pusat sampai ke dua sisi?",
          "Lupa mengalikan 2 saat memakai jari-jari.",
          "Salah memilih π sehingga hitungan jadi rumit.",
          "Lupa mengubah satuan (cm ke m).",
        ],
      },
    ],
    terms: [
      { term: "Evaluasi", meaning: "Kegiatan mengukur pemahaman." },
      { term: "Pembahasan", meaning: "Penjelasan jawaban yang benar setelah evaluasi." },
    ],
    realLife: [
      { title: "Semua di sekitarmu", text: "Roda, jam, piring, lintasan — kini kamu bisa menghitung kelilingnya!", icon: "planet" },
    ],
    examples: [
      {
        question: "Soal campuran: Roda berdiameter 42 cm berputar 25 kali. Berapa meter jarak tempuhnya?",
        illustration: "wheel:d = 42 cm",
        known: ["d = 42 cm", "Putaran = 25", "π = 22/7"],
        asked: "Jarak tempuh (m)",
        steps: ["K = 22/7 × 42 = 132 cm", "Jarak = 25 × 132 = 3.300 cm", "3.300 ÷ 100 = 33 m"],
        answer: "Jarak tempuh 33 m.",
      },
    ],
    funFact: "Dengan rumus keliling yang sama, ilmuwan bisa memperkirakan panjang khatulistiwa Bumi: sekitar 40.000 km!",
    summary: [
      "Kamu sudah menguasai semua bekal untuk Final Examination.",
      "Kerjakan kuis pemanasan, lalu lanjutkan ke evaluasi akhir.",
      "Nilai lulus evaluasi: 70. Kamu bisa mengulang kapan saja.",
    ],
    activity: "final-recap",
    activityTitle: "Aktivitas: Kartu Kilat",
    activityIntro: "Balik setiap kartu dan cek apakah kamu masih ingat jawabannya.",
  },
];

export function getMission(slug: string): MissionContent | undefined {
  return MISSIONS.find((m) => m.slug === slug);
}
