-- =====================================================================
-- ORBIT MATH — seed.sql
-- Data awal: misi, kuis, bank soal, permainan, lencana.
-- Aman dijalankan ulang (idempotent). Jalankan SETELAH semua migrasi.
-- Konvensi: π = 22/7 untuk bilangan kelipatan 7, π = 3,14 untuk lainnya.
-- =====================================================================

-- ---------- MISI ----------
insert into public.lessons (id, slug, title, planet_name, xp_reward) values
  (1, 'circle-station',       'Mengenal Lingkaran',           'Circle Station',       100),
  (2, 'radius-base',          'Unsur-Unsur Lingkaran',        'Radius Base',          100),
  (3, 'pi-observatory',       'Memahami Nilai Pi',            'Pi Observatory',       100),
  (4, 'circle-motion',        'Konsep Keliling Lingkaran',    'Circle Motion',        100),
  (5, 'formula-core',         'Rumus Keliling Lingkaran',     'Formula Core',         120),
  (6, 'real-world-galaxy',    'Penerapan Keliling Lingkaran', 'Real World Galaxy',    120),
  (7, 'final-cosmic-mission', 'Evaluasi Keseluruhan',         'Final Cosmic Mission', 150)
on conflict (id) do update set slug = excluded.slug, title = excluded.title,
  planet_name = excluded.planet_name, xp_reward = excluded.xp_reward;

-- ---------- KUIS ----------
insert into public.quizzes (slug, title, kind, lesson_id, level, pass_score, xp_reward, default_count, shuffle) values
  ('lesson-1', 'Mini Quiz Misi 1 — Circle Station',     'lesson', 1, null, 60, 0, 5, false),
  ('lesson-2', 'Mini Quiz Misi 2 — Radius Base',        'lesson', 2, null, 60, 0, 5, false),
  ('lesson-3', 'Mini Quiz Misi 3 — Pi Observatory',     'lesson', 3, null, 60, 0, 5, false),
  ('lesson-4', 'Mini Quiz Misi 4 — Circle Motion',      'lesson', 4, null, 60, 0, 5, false),
  ('lesson-5', 'Mini Quiz Misi 5 — Formula Core',       'lesson', 5, null, 60, 0, 5, false),
  ('lesson-6', 'Mini Quiz Misi 6 — Real World Galaxy',  'lesson', 6, null, 60, 0, 5, false),
  ('lesson-7', 'Mini Quiz Misi 7 — Pemanasan Final',    'lesson', 7, null, 60, 0, 6, false),
  ('training-1', 'Training Level 1 — Beginner Explorer', 'training', null, 1, 70, 50, 10, true),
  ('training-2', 'Training Level 2 — Space Navigator',   'training', null, 2, 70, 75, 10, true),
  ('training-3', 'Training Level 3 — Galaxy Expert',     'training', null, 3, 70, 100, 8, true),
  ('exam',  'Final Examination',  'exam',  null, null, 70, 200, 20, true),
  ('daily', 'Tantangan Harian',   'daily', null, null, 100, 30, 1, false)
on conflict (slug) do update set title = excluded.title, kind = excluded.kind, lesson_id = excluded.lesson_id,
  level = excluded.level, pass_score = excluded.pass_score, xp_reward = excluded.xp_reward,
  default_count = excluded.default_count, shuffle = excluded.shuffle;

-- ---------- PERMAINAN ----------
insert into public.games (id, slug, title, description, max_score, pass_score, xp_reward) values
  (1, 'circle-hunter',      'Circle Hunter',       'Temukan semua benda berbentuk lingkaran sebelum waktu habis.', 200, 120, 50),
  (2, 'radius-or-diameter', 'Radius or Diameter?', 'Tentukan jenis garis yang menyala pada diagram lingkaran.',  100, 70, 50),
  (3, 'pi-detective',       'Pi Detective',        'Buka petunjuk dan pecahkan kasus misteri nilai π.',          180, 100, 50),
  (4, 'orbit-calculation',  'Orbit Calculation',   'Hitung keliling orbit secara bertahap dan kumpulkan poin.',  160, 100, 60),
  (5, 'bimo-space-rescue',  'BIMO Space Rescue',   'Isi energi pesawat BIMO dengan menjawab soal keliling.',     100, 60, 75)
on conflict (id) do update set slug = excluded.slug, title = excluded.title, description = excluded.description,
  max_score = excluded.max_score, pass_score = excluded.pass_score, xp_reward = excluded.xp_reward;

-- ---------- LENCANA ----------
insert into public.achievements (slug, title, description, icon, xp_reward, sort_order) values
  ('first-discovery',   'First Discovery',    'Menyelesaikan misi pertama.',                              'rocket',     25, 1),
  ('radius-specialist', 'Radius Specialist',  'Memahami jari-jari dan diameter (Misi 2 selesai).',        'ruler',      25, 2),
  ('pi-detective',      'Pi Detective',       'Menyelesaikan misi nilai π (Misi 3 selesai).',             'search',     25, 3),
  ('circle-explorer',   'Circle Explorer',    'Menyelesaikan seluruh materi lingkaran (Misi 1–6).',       'orbit',      75, 4),
  ('formula-master',    'Formula Master',     'Lulus latihan rumus keliling (Training Level 2).',         'sigma',      50, 5),
  ('cosmic-calculator', 'Cosmic Calculator',  'Berhasil menuntaskan tantangan Orbit Calculation.',        'calculator', 50, 6),
  ('daily-hero',        'Daily Spark',        'Menjawab benar Tantangan Harian.',                         'zap',        25, 7),
  ('game-explorer',     'Playground Voyager', 'Memainkan kelima permainan di Cosmic Playground.',         'gamepad',    50, 8),
  ('galaxy-champion',   'Galaxy Champion',    'Lulus Evaluasi Akhir (Final Examination).',                'trophy',    100, 9),
  ('perfect-orbit',     'Perfect Orbit',      'Meraih nilai sempurna 100 pada Evaluasi Akhir.',           'star',      100, 10)
on conflict (slug) do update set title = excluded.title, description = excluded.description,
  icon = excluded.icon, xp_reward = excluded.xp_reward, sort_order = excluded.sort_order;

-- ---------- BANK SOAL ----------
delete from public.quiz_questions where quiz_id in (select id from public.quizzes);

create or replace function private.seed_q(
  p_quiz text, p_type text, p_topic text, p_diff int, p_prompt text,
  p_options jsonb, p_answer jsonb, p_expl text, p_illus text, p_unit text)
returns void language plpgsql set search_path = '' as $$
declare
  v_quiz bigint;
  v_order int;
begin
  select id into v_quiz from public.quizzes where slug = p_quiz;
  select coalesce(max(sort_order), 0) + 1 into v_order from public.quiz_questions where quiz_id = v_quiz;
  insert into public.quiz_questions (quiz_id, qtype, topic, difficulty, prompt, options, answer, explanation, illustration, unit, sort_order)
  values (v_quiz, p_type, p_topic, p_diff, p_prompt, p_options, p_answer, p_expl, p_illus, p_unit, v_order);
end;
$$;

-- ===== MISI 1 =====
select private.seed_q('lesson-1','mcq','Pengertian lingkaran',1,'Lingkaran adalah kumpulan titik-titik yang ...',
  '["berjarak sama terhadap satu titik pusat","membentuk sudut siku-siku","mempunyai empat sisi sama panjang","tersusun dalam satu garis lurus"]','{"index":0}',
  'Lingkaran adalah kumpulan semua titik yang jaraknya SAMA terhadap satu titik tertentu, yaitu titik pusat.', null, null);
select private.seed_q('lesson-1','true_false','Pengertian lingkaran',1,'Setiap titik pada lingkaran memiliki jarak yang sama ke titik pusat.',
  '["Benar","Salah"]','{"index":0}',
  'Benar. Jarak yang sama itu disebut jari-jari. Inilah ciri utama lingkaran.', 'anatomy:radius', null);
select private.seed_q('lesson-1','mcq','Benda berbentuk lingkaran',1,'Manakah benda berikut yang permukaannya berbentuk lingkaran?',
  '["Papan tulis","Uang koin","Buku tulis","Penggaris"]','{"index":1}',
  'Permukaan uang koin berbentuk lingkaran. Papan tulis, buku, dan penggaris berbentuk persegi panjang.', null, null);
select private.seed_q('lesson-1','true_false','Karakteristik lingkaran',1,'Lingkaran mempunyai titik sudut seperti segitiga.',
  '["Benar","Salah"]','{"index":1}',
  'Salah. Lingkaran dibentuk oleh garis lengkung yang mulus, jadi tidak mempunyai titik sudut maupun sisi lurus.', null, null);
select private.seed_q('lesson-1','mcq','Titik pusat',1,'Titik yang berada tepat di tengah lingkaran disebut ...',
  '["Titik sudut","Titik pusat","Titik potong","Titik puncak"]','{"index":1}',
  'Titik di tengah lingkaran disebut titik pusat. Semua titik pada lingkaran berjarak sama ke titik ini.', 'anatomy:center', null);

-- ===== MISI 2 =====
select private.seed_q('lesson-2','identify','Unsur lingkaran',1,'Garis yang menyala pada gambar adalah ...',
  '["Jari-jari","Diameter","Tali busur","Busur"]','{"index":0}',
  'Garis itu menghubungkan titik pusat dengan satu titik pada lingkaran, jadi namanya jari-jari (r).', 'anatomy:radius', null);
select private.seed_q('lesson-2','numeric','Jari-jari dan diameter',1,'Sebuah lingkaran memiliki jari-jari 9 cm. Berapa panjang diameternya?',
  null,'{"value":18}',
  'd = 2 × r = 2 × 9 = 18 cm. Diameter selalu dua kali jari-jari.', 'circle-r:9 cm', 'cm');
select private.seed_q('lesson-2','numeric','Jari-jari dan diameter',1,'Diameter sebuah piring 26 cm. Berapa panjang jari-jarinya?',
  null,'{"value":13}',
  'r = d ÷ 2 = 26 ÷ 2 = 13 cm. Jari-jari adalah setengah diameter.', 'circle-d:26 cm', 'cm');
select private.seed_q('lesson-2','identify','Unsur lingkaran',1,'Garis yang menyala pada gambar adalah ...',
  '["Diameter","Jari-jari","Tali busur","Juring"]','{"index":2}',
  'Garis lurus yang menghubungkan dua titik pada lingkaran TANPA melalui titik pusat disebut tali busur.', 'anatomy:chord', null);
select private.seed_q('lesson-2','match','Unsur lingkaran',2,'Pasangkan setiap istilah dengan pengertiannya.',
  '{"left":["Busur","Juring","Tembereng"],"right":["Daerah yang dibatasi tali busur dan busur","Bagian dari keliling lingkaran (garis lengkung)","Daerah yang dibatasi dua jari-jari dan busur"]}',
  '{"pairs":[1,2,0]}',
  'Busur = garis lengkung bagian keliling. Juring = daerah "potongan pizza" antara dua jari-jari dan busur. Tembereng = daerah antara tali busur dan busur.', null, null);

-- ===== MISI 3 =====
select private.seed_q('lesson-3','mcq','Nilai pi',1,'Nilai π diperoleh dari perbandingan ...',
  '["keliling dengan diameter","keliling dengan jari-jari","diameter dengan jari-jari","luas dengan keliling"]','{"index":0}',
  'π = K ÷ d. Untuk lingkaran sebesar apa pun, keliling dibagi diameter hasilnya selalu sekitar 3,14.', null, null);
select private.seed_q('lesson-3','mcq','Nilai pi',1,'Pendekatan nilai π dalam bentuk desimal yang sering digunakan adalah ...',
  '["2,14","3,14","3,41","4,13"]','{"index":1}',
  'π = 3,14159... biasanya dibulatkan menjadi 3,14.', null, null);
select private.seed_q('lesson-3','mcq','Nilai pi',1,'Bentuk pecahan yang mendekati nilai π adalah ...',
  '["7/22","22/7","14/3","3/14"]','{"index":1}',
  '22/7 = 3,142857... sangat dekat dengan π. Hati-hati, 7/22 itu terbalik!', null, null);
select private.seed_q('lesson-3','mcq','Memilih nilai pi',2,'Jari-jari lingkaran 21 cm. Nilai π yang paling memudahkan perhitungan adalah ...',
  '["22/7 karena 21 habis dibagi 7","3,14 karena selalu lebih tepat","22/7 karena 21 bilangan genap","Tidak perlu memakai π"]','{"index":0}',
  'Gunakan 22/7 bila ukuran merupakan kelipatan 7, karena angka 7 bisa langsung dicoret: 22/7 × 21 = 22 × 3 = 66.', null, null);
select private.seed_q('lesson-3','true_false','Nilai pi',2,'Nilai π untuk lingkaran besar lebih besar daripada untuk lingkaran kecil.',
  '["Benar","Salah"]','{"index":1}',
  'Salah. π adalah konstanta, artinya nilainya tetap untuk SEMUA lingkaran, besar maupun kecil.', null, null);

-- ===== MISI 4 =====
select private.seed_q('lesson-4','mcq','Konsep keliling',1,'Keliling lingkaran adalah ...',
  '["panjang garis lengkung yang mengelilingi lingkaran","daerah di dalam lingkaran","jarak dari pusat ke tepi","garis yang melalui pusat"]','{"index":0}',
  'Keliling adalah panjang lintasan satu putaran penuh di tepi lingkaran. Daerah di dalam lingkaran adalah luas, bukan keliling.', null, null);
select private.seed_q('lesson-4','true_false','Satu putaran',1,'Jarak yang ditempuh roda saat berputar satu kali penuh (tanpa tergelincir) sama dengan keliling roda.',
  '["Benar","Salah"]','{"index":0}',
  'Benar. Saat roda berputar satu kali, seluruh tepi roda menyentuh jalan tepat satu kali, sehingga jaraknya = keliling roda.', 'wheel:1 putaran', null);
select private.seed_q('lesson-4','mcq','Hubungan keliling dan diameter',2,'Jika diameter lingkaran diperbesar dua kali, kelilingnya menjadi ...',
  '["tetap","dua kali semula","empat kali semula","setengah kali semula"]','{"index":1}',
  'K = π × d. Jika d menjadi 2d, maka K menjadi π × 2d = 2 × (π × d). Jadi keliling juga dua kali semula.', null, null);
select private.seed_q('lesson-4','mcq','Hubungan keliling dan diameter',1,'Keliling lingkaran kira-kira berapa kali panjang diameternya?',
  '["2 kali","3,14 kali","4 kali","1,5 kali"]','{"index":1}',
  'Keliling ≈ 3,14 × diameter. Angka 3,14 inilah yang disebut π.', null, null);
select private.seed_q('lesson-4','numeric','Satu putaran',1,'Keliling sebuah roda 88 cm. Berapa cm jarak yang ditempuh roda jika berputar 1 kali penuh?',
  null,'{"value":88}',
  'Jarak satu putaran = keliling roda = 88 cm.', 'wheel:K = 88 cm', 'cm');

-- ===== MISI 5 =====
select private.seed_q('lesson-5','fill_formula','Rumus keliling',1,'Lengkapi rumus: K = π × ___',
  '["r","d","r²","2d"]','{"index":1}',
  'K = π × d, dengan d adalah diameter.', null, null);
select private.seed_q('lesson-5','fill_formula','Rumus keliling',1,'Lengkapi rumus: K = 2 × π × ___',
  '["d","r","K","π"]','{"index":1}',
  'K = 2 × π × r, dengan r adalah jari-jari. Ingat 2 × r = d.', null, null);
select private.seed_q('lesson-5','numeric','Menghitung keliling',2,'Hitung keliling lingkaran dengan diameter 14 cm. (π = 22/7)',
  null,'{"value":44,"alt":[43.96]}',
  'K = π × d = 22/7 × 14 = 22 × 2 = 44 cm.', 'circle-d:14 cm', 'cm');
select private.seed_q('lesson-5','numeric','Menghitung keliling',2,'Hitung keliling lingkaran dengan jari-jari 10 cm. (π = 3,14)',
  null,'{"value":62.8,"alt":[62.86]}',
  'K = 2 × π × r = 2 × 3,14 × 10 = 62,8 cm.', 'circle-r:10 cm', 'cm');
select private.seed_q('lesson-5','true_false','Hubungan dua rumus',2,'Rumus K = π × d dan K = 2 × π × r memberikan hasil yang sama, karena d = 2 × r.',
  '["Benar","Salah"]','{"index":0}',
  'Benar. Karena d = 2 × r, maka π × d = π × 2 × r = 2 × π × r. Keduanya rumus yang sama dalam bentuk berbeda.', null, null);

-- ===== MISI 6 =====
select private.seed_q('lesson-6','story','Roda sepeda',2,'Roda sepeda Dimas berjari-jari 35 cm. Berapa cm jarak yang ditempuh roda dalam satu putaran? (π = 22/7)',
  null,'{"value":220,"alt":[219.8]}',
  'Diketahui r = 35 cm. Jarak 1 putaran = keliling = 2 × 22/7 × 35 = 2 × 22 × 5 = 220 cm.', 'wheel:r = 35 cm', 'cm');
select private.seed_q('lesson-6','story','Pagar taman',2,'Taman berbentuk lingkaran berdiameter 20 m akan dipagari mengelilinginya. Berapa meter panjang pagar yang diperlukan? (π = 3,14)',
  null,'{"value":62.8,"alt":[62.86]}',
  'Panjang pagar = keliling taman = π × d = 3,14 × 20 = 62,8 m.', 'garden:d = 20 m', 'm');
select private.seed_q('lesson-6','story','Meja bundar',2,'Meja bundar berdiameter 140 cm akan dipasangi pita di tepinya. Berapa cm panjang pita yang dibutuhkan? (π = 22/7)',
  null,'{"value":440,"alt":[439.6]}',
  'Panjang pita = keliling meja = 22/7 × 140 = 22 × 20 = 440 cm.', 'table:d = 140 cm', 'cm');
select private.seed_q('lesson-6','story','Jarak tempuh roda',3,'Roda berjari-jari 14 cm berputar 10 kali. Berapa cm jarak yang ditempuh? (π = 22/7)',
  null,'{"value":880,"alt":[879.2]}',
  'Keliling = 2 × 22/7 × 14 = 88 cm. Jarak 10 putaran = 10 × 88 = 880 cm.', 'wheel:r = 14 cm', 'cm');
select private.seed_q('lesson-6','mcq','Lintasan lari',3,'Lintasan lari berbentuk lingkaran dengan diameter 70 m. Rani berlari 2 putaran. Jarak yang ditempuh Rani adalah ... (π = 22/7)',
  '["220 m","440 m","140 m","880 m"]','{"index":1}',
  'Keliling lintasan = 22/7 × 70 = 220 m. Dua putaran = 2 × 220 = 440 m.', 'track:d = 70 m', null);

-- ===== MISI 7 (pemanasan sebelum evaluasi) =====
select private.seed_q('lesson-7','mcq','Jari-jari dan diameter',1,'Hubungan diameter (d) dan jari-jari (r) yang benar adalah ...',
  '["d = r ÷ 2","d = 2 × r","d = r + 2","d = r × r"]','{"index":1}',
  'Diameter terdiri dari dua jari-jari yang segaris, jadi d = 2 × r.', null, null);
select private.seed_q('lesson-7','identify','Unsur lingkaran',1,'Daerah yang menyala pada gambar adalah ...',
  '["Tembereng","Juring","Busur","Tali busur"]','{"index":1}',
  'Daerah yang dibatasi dua jari-jari dan sebuah busur disebut juring (bentuknya seperti potongan pizza).', 'anatomy:sector', null);
select private.seed_q('lesson-7','numeric','Menghitung keliling',2,'Keliling lingkaran berjari-jari 21 cm adalah ... cm. (π = 22/7)',
  null,'{"value":132,"alt":[131.88]}',
  'K = 2 × 22/7 × 21 = 2 × 22 × 3 = 132 cm.', 'circle-r:21 cm', 'cm');
select private.seed_q('lesson-7','numeric','Mencari diameter',3,'Keliling lingkaran 31,4 cm. Berapa cm diameternya? (π = 3,14)',
  null,'{"value":10}',
  'K = π × d, jadi d = K ÷ π = 31,4 ÷ 3,14 = 10 cm.', null, 'cm');
select private.seed_q('lesson-7','true_false','Nilai pi',1,'Nilai π dapat dihitung dengan membagi keliling lingkaran dengan diameternya.',
  '["Benar","Salah"]','{"index":0}',
  'Benar. π = K ÷ d.', null, null);
select private.seed_q('lesson-7','story','Jam dinding',2,'Sebuah jam dinding berdiameter 28 cm. Berapa cm panjang bingkai di tepi jam? (π = 22/7)',
  null,'{"value":88,"alt":[87.92]}',
  'Panjang bingkai = keliling = 22/7 × 28 = 22 × 4 = 88 cm.', 'clock:d = 28 cm', 'cm');

-- ===== TRAINING LEVEL 1 — Beginner Explorer =====
select private.seed_q('training-1','mcq','Benda berbentuk lingkaran',1,'Benda berikut yang BUKAN berbentuk lingkaran adalah ...',
  '["Roda","Jam dinding bundar","Pintu kelas","Tutup botol"]','{"index":2}',
  'Pintu kelas berbentuk persegi panjang (punya 4 sisi lurus dan 4 sudut). Benda lainnya berbentuk lingkaran.', null, null);
select private.seed_q('training-1','true_false','Karakteristik lingkaran',1,'Telur berbentuk lingkaran sempurna jika dilihat dari samping.',
  '["Benar","Salah"]','{"index":1}',
  'Salah. Telur berbentuk oval (lonjong). Jarak tepi ke titik tengahnya tidak sama di semua arah, jadi bukan lingkaran.', null, null);
select private.seed_q('training-1','identify','Unsur lingkaran',1,'Garis yang menyala pada gambar adalah ...',
  '["Jari-jari","Diameter","Busur","Tali busur"]','{"index":1}',
  'Garis lurus yang melewati titik pusat dan menghubungkan dua titik pada lingkaran adalah diameter.', 'anatomy:diameter', null);
select private.seed_q('training-1','identify','Unsur lingkaran',1,'Bagian yang menyala pada gambar adalah ...',
  '["Busur","Tembereng","Juring","Diameter"]','{"index":0}',
  'Garis lengkung yang merupakan bagian dari keliling lingkaran disebut busur.', 'anatomy:arc', null);
select private.seed_q('training-1','identify','Unsur lingkaran',2,'Daerah yang menyala pada gambar adalah ...',
  '["Juring","Tembereng","Busur","Jari-jari"]','{"index":1}',
  'Daerah yang dibatasi tali busur dan busur disebut tembereng. Jika dibatasi dua jari-jari, namanya juring.', 'anatomy:segment', null);
select private.seed_q('training-1','identify','Unsur lingkaran',1,'Garis yang menyala pada gambar adalah ...',
  '["Diameter","Tali busur","Jari-jari","Busur"]','{"index":2}',
  'Garis dari titik pusat ke tepi lingkaran adalah jari-jari.', 'anatomy:radius', null);
select private.seed_q('training-1','numeric','Jari-jari dan diameter',1,'Jari-jari lingkaran 12 cm. Berapa cm diameternya?',
  null,'{"value":24}','d = 2 × r = 2 × 12 = 24 cm.', 'circle-r:12 cm', 'cm');
select private.seed_q('training-1','numeric','Jari-jari dan diameter',1,'Diameter lingkaran 50 cm. Berapa cm jari-jarinya?',
  null,'{"value":25}','r = d ÷ 2 = 50 ÷ 2 = 25 cm.', 'circle-d:50 cm', 'cm');
select private.seed_q('training-1','numeric','Jari-jari dan diameter',2,'Jari-jari sebuah roda mainan 7,5 cm. Berapa cm diameternya?',
  null,'{"value":15}','d = 2 × r = 2 × 7,5 = 15 cm.', 'wheel:r = 7,5 cm', 'cm');
select private.seed_q('training-1','match','Unsur lingkaran',2,'Pasangkan setiap istilah dengan pengertiannya.',
  '{"left":["Titik pusat","Jari-jari","Diameter"],"right":["Garis dari pusat ke tepi lingkaran","Titik tepat di tengah lingkaran","Tali busur terpanjang yang melalui pusat"]}',
  '{"pairs":[1,0,2]}',
  'Titik pusat = titik di tengah. Jari-jari = garis pusat ke tepi. Diameter = tali busur terpanjang yang melewati pusat.', null, null);
select private.seed_q('training-1','true_false','Unsur lingkaran',2,'Diameter adalah tali busur yang paling panjang.',
  '["Benar","Salah"]','{"index":0}',
  'Benar. Dari semua tali busur, yang melewati titik pusat (diameter) adalah yang terpanjang.', 'anatomy:diameter', null);
select private.seed_q('training-1','mcq','Unsur lingkaran',1,'Garis lurus yang menghubungkan dua titik pada lingkaran tanpa melalui pusat disebut ...',
  '["Jari-jari","Tali busur","Busur","Juring"]','{"index":1}',
  'Itulah tali busur. Busur berbentuk lengkung, sedangkan tali busur berbentuk lurus.', 'anatomy:chord', null);
select private.seed_q('training-1','fill_formula','Jari-jari dan diameter',1,'Lengkapi rumus: d = ___ × r',
  '["1","2","3","π"]','{"index":1}','d = 2 × r. Diameter sama dengan dua jari-jari.', null, null);
select private.seed_q('training-1','fill_formula','Jari-jari dan diameter',1,'Lengkapi rumus: r = d ÷ ___',
  '["2","π","4","r"]','{"index":0}','r = d ÷ 2. Jari-jari adalah setengah diameter.', null, null);

-- ===== TRAINING LEVEL 2 — Space Navigator =====
select private.seed_q('training-2','mcq','Nilai pi',1,'π adalah hasil bagi ...',
  '["K ÷ d","K ÷ r","d ÷ r","r ÷ d"]','{"index":0}','π = keliling ÷ diameter = K ÷ d.', null, null);
select private.seed_q('training-2','true_false','Nilai pi',2,'Nilai π tepat sama dengan 3,14.',
  '["Benar","Salah"]','{"index":1}',
  'Salah. π = 3,14159265... angka desimalnya tidak pernah berakhir. 3,14 dan 22/7 hanyalah nilai pendekatan.', null, null);
select private.seed_q('training-2','numeric','Menghitung keliling',1,'Diameter lingkaran 10 cm. Berapa cm kelilingnya? (π = 3,14)',
  null,'{"value":31.4,"alt":[31.43]}','K = π × d = 3,14 × 10 = 31,4 cm.', 'circle-d:10 cm', 'cm');
select private.seed_q('training-2','numeric','Menghitung keliling',1,'Jari-jari lingkaran 7 cm. Berapa cm kelilingnya? (π = 22/7)',
  null,'{"value":44,"alt":[43.96]}','K = 2 × π × r = 2 × 22/7 × 7 = 2 × 22 = 44 cm.', 'circle-r:7 cm', 'cm');
select private.seed_q('training-2','numeric','Menghitung keliling',2,'Diameter lingkaran 28 cm. Berapa cm kelilingnya? (π = 22/7)',
  null,'{"value":88,"alt":[87.92]}','K = π × d = 22/7 × 28 = 22 × 4 = 88 cm.', 'circle-d:28 cm', 'cm');
select private.seed_q('training-2','numeric','Menghitung keliling',1,'Jari-jari lingkaran 5 cm. Berapa cm kelilingnya? (π = 3,14)',
  null,'{"value":31.4,"alt":[31.43]}','K = 2 × 3,14 × 5 = 31,4 cm.', 'circle-r:5 cm', 'cm');
select private.seed_q('training-2','numeric','Menghitung keliling',2,'Jari-jari lingkaran 20 cm. Berapa cm kelilingnya? (π = 3,14)',
  null,'{"value":125.6,"alt":[125.71]}','K = 2 × 3,14 × 20 = 125,6 cm.', 'circle-r:20 cm', 'cm');
select private.seed_q('training-2','numeric','Menghitung keliling',2,'Diameter lingkaran 35 cm. Berapa cm kelilingnya? (π = 22/7)',
  null,'{"value":110,"alt":[109.9]}','K = 22/7 × 35 = 22 × 5 = 110 cm.', 'circle-d:35 cm', 'cm');
select private.seed_q('training-2','fill_formula','Hubungan dua rumus',2,'K = 2 × π × r dapat juga ditulis K = π × ___ karena 2 × r = d.',
  '["r","d","2d","r²"]','{"index":1}','Karena 2 × r = d, maka 2 × π × r = π × d.', null, null);
select private.seed_q('training-2','mcq','Memilih nilai pi',2,'Jika r = 49 cm, nilai π yang paling mudah digunakan adalah ...',
  '["3,14","22/7","2,14","7/22"]','{"index":1}','49 = 7 × 7, kelipatan 7. Dengan 22/7, angka 7 bisa langsung dicoret.', null, null);
select private.seed_q('training-2','mcq','Konsep keliling',2,'Keliling lingkaran berdiameter 1 m kira-kira ...',
  '["1 m","2 m","3,14 m","6,28 m"]','{"index":2}','K = π × 1 = 3,14 m. Keliling ≈ 3,14 kali diameternya.', null, null);
select private.seed_q('training-2','numeric','Mencari diameter',3,'Keliling lingkaran 44 cm. Berapa cm diameternya? (π = 22/7)',
  null,'{"value":14}','d = K ÷ π = 44 ÷ 22/7 = 44 × 7/22 = 14 cm.', null, 'cm');
select private.seed_q('training-2','numeric','Mencari jari-jari',3,'Keliling lingkaran 62,8 cm. Berapa cm jari-jarinya? (π = 3,14)',
  null,'{"value":10}','r = K ÷ (2 × π) = 62,8 ÷ 6,28 = 10 cm.', null, 'cm');
select private.seed_q('training-2','mcq','Rumus keliling',1,'Rumus keliling lingkaran jika diketahui jari-jari adalah ...',
  '["K = π × r","K = 2 × π × r","K = π × r × r","K = 2 × r"]','{"index":1}','K = 2 × π × r. Rumus π × r × r adalah rumus luas, bukan keliling.', null, null);

-- ===== TRAINING LEVEL 3 — Galaxy Expert =====
select private.seed_q('training-3','story','Roda',2,'Roda sepeda motor berdiameter 56 cm. Berapa cm jarak yang ditempuh dalam satu putaran? (π = 22/7)',
  null,'{"value":176,"alt":[175.84]}','Jarak 1 putaran = keliling = 22/7 × 56 = 22 × 8 = 176 cm.', 'wheel:d = 56 cm', 'cm');
select private.seed_q('training-3','story','Jarak tempuh roda',3,'Roda berjari-jari 21 cm berputar 50 kali. Berapa METER jarak yang ditempuh? (π = 22/7)',
  null,'{"value":66,"alt":[65.94]}',
  'Keliling = 2 × 22/7 × 21 = 132 cm. Jarak = 50 × 132 = 6.600 cm. Ubah ke meter: 6.600 ÷ 100 = 66 m.', 'wheel:r = 21 cm', 'm');
select private.seed_q('training-3','story','Taman',3,'Kolam berbentuk lingkaran berjari-jari 7 m. Di tepinya akan ditanam pohon setiap 2 m. Berapa banyak pohon yang dibutuhkan? (π = 22/7)',
  null,'{"value":22}',
  'Keliling = 2 × 22/7 × 7 = 44 m. Karena tepi kolam melingkar (tertutup), banyak pohon = 44 ÷ 2 = 22 pohon.', 'garden:r = 7 m', 'pohon');
select private.seed_q('training-3','story','Biaya pagar',3,'Pagar taman berbentuk lingkaran berdiameter 14 m. Biaya pagar Rp50.000 per meter. Berapa rupiah biaya seluruhnya? (π = 22/7)',
  null,'{"value":2200000,"tolerance":1,"alt":[2198000]}',
  'Keliling = 22/7 × 14 = 44 m. Biaya = 44 × Rp50.000 = Rp2.200.000.', 'garden:d = 14 m', 'rupiah');
select private.seed_q('training-3','story','Jarak tempuh roda',2,'Sebuah roda menempuh jarak 440 cm dalam 5 putaran. Berapa cm keliling roda tersebut?',
  null,'{"value":88}','Keliling = jarak ÷ banyak putaran = 440 ÷ 5 = 88 cm.', 'wheel:5 putaran', 'cm');
select private.seed_q('training-3','story','Mencari jari-jari',3,'Sebuah roda menempuh 1.320 cm setelah berputar 10 kali. Berapa cm jari-jari roda? (π = 22/7)',
  null,'{"value":21}',
  'Keliling = 1.320 ÷ 10 = 132 cm. r = K ÷ (2 × π) = 132 ÷ (2 × 22/7) = 132 × 7/44 = 21 cm.', 'wheel:10 putaran', 'cm');
select private.seed_q('training-3','story','Lintasan lari',2,'Seorang atlet berlari mengelilingi lintasan berdiameter 70 m sebanyak 3 kali. Berapa meter jarak yang ditempuh? (π = 22/7)',
  null,'{"value":660,"alt":[659.4]}','Keliling = 22/7 × 70 = 220 m. Jarak = 3 × 220 = 660 m.', 'track:d = 70 m', 'm');
select private.seed_q('training-3','story','Pita',3,'Pita akan dililitkan satu kali mengelilingi kaleng berdiameter 7 cm, ditambah 3 cm untuk sambungan. Berapa cm panjang pita? (π = 22/7)',
  null,'{"value":25,"alt":[24.98]}','Keliling kaleng = 22/7 × 7 = 22 cm. Panjang pita = 22 + 3 = 25 cm.', 'ribbon:d = 7 cm', 'cm');
select private.seed_q('training-3','mcq','Membandingkan keliling',3,'Roda A berjari-jari 14 cm, roda B berdiameter 14 cm. Pernyataan yang benar adalah ...',
  '["Keliling A dua kali keliling B","Keliling A sama dengan keliling B","Keliling B dua kali keliling A","Keliling A empat kali keliling B"]','{"index":0}',
  'Keliling A = 2 × 22/7 × 14 = 88 cm. Keliling B = 22/7 × 14 = 44 cm. Jadi keliling A dua kali keliling B. Perhatikan beda jari-jari dan diameter!', null, null);
select private.seed_q('training-3','story','Meja bundar',3,'Tepi meja bundar berjari-jari 35 cm akan dihias renda. Berapa METER renda yang dibutuhkan? (π = 22/7)',
  null,'{"value":2.2,"tolerance":0.01}','Keliling = 2 × 22/7 × 35 = 220 cm. Ubah ke meter: 220 ÷ 100 = 2,2 m.', 'table:r = 35 cm', 'm');
select private.seed_q('training-3','story','Jarak tempuh roda',2,'Keliling ban sepeda 1,76 m. Berapa kali ban harus berputar untuk menempuh 176 m?',
  null,'{"value":100}','Banyak putaran = jarak ÷ keliling = 176 ÷ 1,76 = 100 kali.', 'wheel:K = 1,76 m', 'kali');
select private.seed_q('training-3','story','Jarum jam',3,'Jarum panjang sebuah jam dinding panjangnya 14 cm. Berapa cm lintasan ujung jarum panjang dalam 1 jam? (π = 22/7)',
  null,'{"value":88,"alt":[87.92]}',
  'Dalam 1 jam, jarum panjang berputar 1 kali penuh. Ujungnya membentuk lingkaran dengan r = 14 cm. K = 2 × 22/7 × 14 = 88 cm.', 'clock:r = 14 cm', 'cm');

-- ===== FINAL EXAMINATION (bank 30 soal, diambil acak) =====
select private.seed_q('exam','mcq','Pengertian lingkaran',1,'Pernyataan yang benar tentang lingkaran adalah ...',
  '["Lingkaran memiliki 4 titik sudut","Semua titik pada lingkaran berjarak sama ke titik pusat","Lingkaran tersusun dari garis-garis lurus","Jari-jari selalu lebih panjang dari diameter"]','{"index":1}',
  'Ciri utama lingkaran: semua titik pada lingkaran berjarak sama (jari-jari) ke titik pusat.', null, null);
select private.seed_q('exam','true_false','Benda berbentuk lingkaran',1,'Permukaan uang koin berbentuk lingkaran.',
  '["Benar","Salah"]','{"index":0}','Benar. Uang koin adalah contoh benda berbentuk lingkaran.', null, null);
select private.seed_q('exam','identify','Unsur lingkaran',1,'Bagian yang menyala pada gambar adalah ...',
  '["Titik pusat","Busur","Juring","Tembereng"]','{"index":0}','Titik di tengah lingkaran adalah titik pusat.', 'anatomy:center', null);
select private.seed_q('exam','identify','Unsur lingkaran',1,'Garis yang menyala pada gambar adalah ...',
  '["Jari-jari","Tali busur","Diameter","Busur"]','{"index":1}','Garis lurus yang menghubungkan dua titik pada lingkaran tanpa melewati pusat adalah tali busur.', 'anatomy:chord', null);
select private.seed_q('exam','identify','Unsur lingkaran',2,'Daerah yang menyala pada gambar adalah ...',
  '["Juring","Tembereng","Busur","Diameter"]','{"index":0}','Daerah antara dua jari-jari dan busur disebut juring.', 'anatomy:sector', null);
select private.seed_q('exam','identify','Unsur lingkaran',2,'Daerah yang menyala pada gambar adalah ...',
  '["Busur","Juring","Tembereng","Tali busur"]','{"index":2}','Daerah antara tali busur dan busur disebut tembereng.', 'anatomy:segment', null);
select private.seed_q('exam','match','Unsur lingkaran',2,'Pasangkan setiap istilah dengan pengertiannya.',
  '{"left":["Busur","Tali busur","Juring"],"right":["Daerah antara dua jari-jari dan busur","Garis lengkung bagian dari keliling","Garis lurus penghubung dua titik pada lingkaran"]}',
  '{"pairs":[1,2,0]}','Busur = garis lengkung. Tali busur = garis lurus penghubung dua titik pada lingkaran. Juring = daerah antara dua jari-jari dan busur.', null, null);
select private.seed_q('exam','numeric','Jari-jari dan diameter',1,'Jari-jari lingkaran 16 cm. Berapa cm diameternya?',
  null,'{"value":32}','d = 2 × r = 2 × 16 = 32 cm.', 'circle-r:16 cm', 'cm');
select private.seed_q('exam','numeric','Jari-jari dan diameter',1,'Diameter lingkaran 45 cm. Berapa cm jari-jarinya?',
  null,'{"value":22.5}','r = d ÷ 2 = 45 ÷ 2 = 22,5 cm.', 'circle-d:45 cm', 'cm');
select private.seed_q('exam','mcq','Nilai pi',1,'Nilai π mendekati ...',
  '["2,72","3,14","1,41","1,73"]','{"index":1}','π ≈ 3,14 atau 22/7.', null, null);
select private.seed_q('exam','true_false','Nilai pi',1,'22/7 dan 3,14 adalah nilai pendekatan untuk π.',
  '["Benar","Salah"]','{"index":0}','Benar. π sebenarnya 3,14159... sehingga 22/7 dan 3,14 adalah pendekatannya.', null, null);
select private.seed_q('exam','mcq','Nilai pi',2,'Hasil pengukuran tutup toples: keliling 47,1 cm dan diameter 15 cm. Hasil K ÷ d adalah ...',
  '["3,14","2,14","4,71","1,5"]','{"index":0}','47,1 ÷ 15 = 3,14. Hasil bagi keliling dan diameter selalu mendekati π.', null, null);
select private.seed_q('exam','mcq','Konsep keliling',1,'Keliling lingkaran merupakan ...',
  '["daerah di dalam lingkaran","panjang garis lengkung yang membatasi lingkaran","jarak pusat ke tepi lingkaran","dua kali jari-jari"]','{"index":1}',
  'Keliling = panjang garis lengkung yang mengelilingi lingkaran. Dua kali jari-jari adalah diameter.', null, null);
select private.seed_q('exam','true_false','Satu putaran',2,'Roda yang berputar satu kali penuh menempuh jarak yang sama dengan diameternya.',
  '["Benar","Salah"]','{"index":1}','Salah. Jarak satu putaran sama dengan KELILING roda (sekitar 3,14 kali diameternya).', 'wheel:1 putaran', null);
select private.seed_q('exam','fill_formula','Rumus keliling',1,'Lengkapi rumus: K = ___ × d',
  '["2","π","r","2π"]','{"index":1}','K = π × d.', null, null);
select private.seed_q('exam','fill_formula','Rumus keliling',1,'Lengkapi rumus: K = 2 × ___ × r',
  '["d","π","K","2"]','{"index":1}','K = 2 × π × r.', null, null);
select private.seed_q('exam','numeric','Menghitung keliling',2,'Diameter lingkaran 21 cm. Berapa cm kelilingnya? (π = 22/7)',
  null,'{"value":66,"alt":[65.94]}','K = 22/7 × 21 = 22 × 3 = 66 cm.', 'circle-d:21 cm', 'cm');
select private.seed_q('exam','numeric','Menghitung keliling',2,'Jari-jari lingkaran 14 cm. Berapa cm kelilingnya? (π = 22/7)',
  null,'{"value":88,"alt":[87.92]}','K = 2 × 22/7 × 14 = 2 × 22 × 2 = 88 cm.', 'circle-r:14 cm', 'cm');
select private.seed_q('exam','numeric','Menghitung keliling',2,'Diameter lingkaran 30 cm. Berapa cm kelilingnya? (π = 3,14)',
  null,'{"value":94.2,"alt":[94.29]}','K = 3,14 × 30 = 94,2 cm.', 'circle-d:30 cm', 'cm');
select private.seed_q('exam','numeric','Menghitung keliling',2,'Jari-jari lingkaran 15 cm. Berapa cm kelilingnya? (π = 3,14)',
  null,'{"value":94.2,"alt":[94.29]}','K = 2 × 3,14 × 15 = 94,2 cm.', 'circle-r:15 cm', 'cm');
select private.seed_q('exam','numeric','Menghitung keliling',2,'Jari-jari lingkaran 3,5 cm. Berapa cm kelilingnya? (π = 22/7)',
  null,'{"value":22,"alt":[21.98]}','K = 2 × 22/7 × 3,5 = 22/7 × 7 = 22 cm.', 'circle-r:3,5 cm', 'cm');
select private.seed_q('exam','numeric','Mencari diameter',3,'Keliling lingkaran 154 cm. Berapa cm diameternya? (π = 22/7)',
  null,'{"value":49}','d = K ÷ π = 154 × 7/22 = 49 cm.', null, 'cm');
select private.seed_q('exam','numeric','Mencari jari-jari',3,'Keliling lingkaran 125,6 cm. Berapa cm jari-jarinya? (π = 3,14)',
  null,'{"value":20}','r = K ÷ (2 × π) = 125,6 ÷ 6,28 = 20 cm.', null, 'cm');
select private.seed_q('exam','story','Roda sepeda',2,'Roda sepeda berjari-jari 28 cm. Berapa cm jarak yang ditempuh dalam satu putaran? (π = 22/7)',
  null,'{"value":176,"alt":[175.84]}','Jarak 1 putaran = 2 × 22/7 × 28 = 176 cm.', 'wheel:r = 28 cm', 'cm');
select private.seed_q('exam','story','Pagar taman',2,'Taman berbentuk lingkaran berdiameter 42 m akan dipagari. Berapa meter panjang pagar? (π = 22/7)',
  null,'{"value":132,"alt":[131.88]}','Panjang pagar = 22/7 × 42 = 22 × 6 = 132 m.', 'garden:d = 42 m', 'm');
select private.seed_q('exam','story','Pita',2,'Pita akan dililitkan mengelilingi kue tart berdiameter 20 cm. Berapa cm panjang pita minimal? (π = 3,14)',
  null,'{"value":62.8,"alt":[62.86]}','Panjang pita = keliling = 3,14 × 20 = 62,8 cm.', 'ribbon:d = 20 cm', 'cm');
select private.seed_q('exam','story','Jarak tempuh roda',3,'Roda berdiameter 70 cm berputar 100 kali. Berapa METER jarak yang ditempuh? (π = 22/7)',
  null,'{"value":220,"alt":[219.8]}','Keliling = 22/7 × 70 = 220 cm. Jarak = 100 × 220 = 22.000 cm = 220 m.', 'wheel:d = 70 cm', 'm');
select private.seed_q('exam','story','Lintasan',3,'Lintasan berbentuk lingkaran berdiameter 100 m. Berapa meter jarak 2 putaran? (π = 3,14)',
  null,'{"value":628,"alt":[628.57]}','Keliling = 3,14 × 100 = 314 m. Dua putaran = 628 m.', 'track:d = 100 m', 'm');
select private.seed_q('exam','story','Mencari diameter roda',3,'Sebuah roda menempuh 2.200 cm dalam 25 putaran. Berapa cm diameter roda? (π = 22/7)',
  null,'{"value":28}','Keliling = 2.200 ÷ 25 = 88 cm. d = 88 ÷ 22/7 = 88 × 7/22 = 28 cm.', 'wheel:25 putaran', 'cm');
select private.seed_q('exam','mcq','Membandingkan keliling',3,'Roda P berjari-jari 7 cm dan roda Q berjari-jari 14 cm. Keliling roda Q adalah ...',
  '["sama dengan keliling P","dua kali keliling P","empat kali keliling P","setengah keliling P"]','{"index":1}',
  'Keliling P = 44 cm, keliling Q = 88 cm. Jari-jari dua kali lipat → keliling juga dua kali lipat.', null, null);

-- ===== TANTANGAN HARIAN =====
select private.seed_q('daily','numeric','Menghitung keliling',2,'Jari-jari lingkaran 35 cm. Berapa cm kelilingnya? (π = 22/7)',
  null,'{"value":220,"alt":[219.8]}','K = 2 × 22/7 × 35 = 220 cm.', 'circle-r:35 cm', 'cm');
select private.seed_q('daily','numeric','Menghitung keliling',1,'Diameter lingkaran 8 cm. Berapa cm kelilingnya? (π = 3,14)',
  null,'{"value":25.12,"alt":[25.14]}','K = 3,14 × 8 = 25,12 cm.', 'circle-d:8 cm', 'cm');
select private.seed_q('daily','numeric','Menghitung keliling',2,'Jari-jari lingkaran 42 cm. Berapa cm kelilingnya? (π = 22/7)',
  null,'{"value":264,"alt":[263.76]}','K = 2 × 22/7 × 42 = 264 cm.', 'circle-r:42 cm', 'cm');
select private.seed_q('daily','numeric','Menghitung keliling',2,'Diameter lingkaran 63 cm. Berapa cm kelilingnya? (π = 22/7)',
  null,'{"value":198,"alt":[197.82]}','K = 22/7 × 63 = 22 × 9 = 198 cm.', 'circle-d:63 cm', 'cm');
select private.seed_q('daily','numeric','Menghitung keliling',2,'Jari-jari lingkaran 25 cm. Berapa cm kelilingnya? (π = 3,14)',
  null,'{"value":157,"alt":[157.14]}','K = 2 × 3,14 × 25 = 157 cm.', 'circle-r:25 cm', 'cm');
select private.seed_q('daily','numeric','Mencari jari-jari',3,'Keliling lingkaran 88 cm. Berapa cm jari-jarinya? (π = 22/7)',
  null,'{"value":14}','r = K ÷ (2 × π) = 88 ÷ 44/7 = 88 × 7/44 = 14 cm.', null, 'cm');
select private.seed_q('daily','numeric','Menghitung keliling',1,'Diameter lingkaran 12 cm. Berapa cm kelilingnya? (π = 3,14)',
  null,'{"value":37.68,"alt":[37.71]}','K = 3,14 × 12 = 37,68 cm.', 'circle-d:12 cm', 'cm');
select private.seed_q('daily','numeric','Menghitung keliling',2,'Jari-jari lingkaran 10,5 cm. Berapa cm kelilingnya? (π = 22/7)',
  null,'{"value":66,"alt":[65.94]}','K = 2 × 22/7 × 10,5 = 22/7 × 21 = 66 cm.', 'circle-r:10,5 cm', 'cm');
select private.seed_q('daily','story','Jarak tempuh roda',3,'Roda berjari-jari 7 cm berputar 5 kali. Berapa cm jarak yang ditempuh? (π = 22/7)',
  null,'{"value":220,"alt":[219.8]}','Keliling = 2 × 22/7 × 7 = 44 cm. Jarak = 5 × 44 = 220 cm.', 'wheel:r = 7 cm', 'cm');
select private.seed_q('daily','numeric','Mencari diameter',3,'Keliling lingkaran 94,2 cm. Berapa cm diameternya? (π = 3,14)',
  null,'{"value":30}','d = K ÷ π = 94,2 ÷ 3,14 = 30 cm.', null, 'cm');

drop function private.seed_q(text, text, text, int, text, jsonb, jsonb, text, text, text);
