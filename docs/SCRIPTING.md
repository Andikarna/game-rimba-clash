# RIMBA CLASH — Dokumen scripting dan desain game

Versi 2 · 15 September 2026  
Game arcade fighting 2D dengan karakter orisinal, terinspirasi format duel klasik. Seluruh gameplay berjalan lokal di browser; tidak memerlukan backend atau akun tambahan untuk mekaniknya.

## Isi paket

- `game/`: website siap dijalankan, termasuk JavaScript sumber, CSS, HTML dan PNG.
- `game/assets/`: delapan sprite sheet petarung, satu atlas efek, satu latar arena.
- `game/adventure/`: platformer Irma versi sebelumnya.
- `SCRIPTING.md`: dokumen ini.
- `asset-prompts.json`: prompt persis dan metode pembuatan setiap PNG.
- `tests/combat.test.mjs`: pemeriksaan model pertarungan.

Aset dibuat dengan **built-in ImageGen**, bukan CLI/API fallback. Delapan karakter masing-masing memiliki empat pose utama: idle, pukul, tendang, casting. Jalan, lompat, blok, terkena serangan dan KO memakai pose plus transform. Ini animasi berbasis pose, bukan puluhan frame gambar unik untuk setiap gerakan.

## Menjalankan game

1. Ekstrak seluruh ZIP.
2. Buka terminal di folder hasil ekstraksi.
3. Jalankan `python -m http.server 5173 --directory game`.
4. Buka `http://localhost:5173`.

Game menggunakan ES Modules; jalankan melalui HTTP lokal, bukan klik dua kali HTML dengan protokol file. Untuk menguji model dengan Node.js modern, jalankan `node tests/combat.test.mjs`. Tidak ada paket npm yang perlu dipasang.

## Alur cerita

Fahrudin membawa Jantung Rimba ke Candi Senja. Irma dan Lukman mengikuti jejaknya untuk menyelamatkan desa. Enam legenda lain tiba dengan tujuan masing-masing: menyelamatkan perguruan, membekukan kutukan, menguji kekuatan, mencari kebenaran, dan menjaga candi.

Pemain memilih salah satu dari delapan karakter dan lawan AI. Pemenang dua ronde membawa pulang Jantung Rimba dan menerima epilog karakter. Format saat ini adalah duel bebas, bukan rangkaian turnamen campaign. Mode platformer lama tetap tersedia melalui tautan Mode petualangan.

## Aturan inti

- Dua kemenangan ronde memenangkan duel; timer awal 60 detik waktu simulasi.
- HP habis menghasilkan KO.
- Jika timer habis, bandingkan HP dibagi HP maksimum. Persentase dipakai agar roster dengan HP besar tidak otomatis menang ketika damage persentasenya sama.
- Seri tidak menambah skor dan mengulang nomor ronde yang sama.
- HP, guard, energi awal 25, proyektil, summon, status, dan cooldown direset pada awal setiap ronde.
- Energi maksimum 100. Regenerasi pasif 4/detik.
- Skill membutuhkan 25 energi dan cooldown nol.
- Ultimate membutuhkan 100 energi; seluruh meter dikonsumsi.
- Musik dan efek mulai setelah tindakan pengguna; tombol Audio mengatur volume dan mute.
- Pause menghentikan fisika, timer, status dan cooldown. Beralih tab otomatis menjeda duel.

## Kontrol

| Input | Aksi | Catatan |
|---|---|---|
| A / D atau ← / → | Bergerak | Kecepatan karakter berbeda |
| W / Spasi / ↑ | Lompat | Satu lompatan saat menyentuh tanah |
| S / ↓ | Blok | Tahan; di tanah dan menghadap serangan |
| J | Pukulan | Cepat, jangkauan pendek |
| K | Tendangan | Lebih lambat, jangkauan lebih jauh |
| L | Skill khusus | 25 energi + cooldown |
| I | Ultimate | 100 energi |
| Esc | Jeda / lanjut | Sama dengan tombol pada arena |
| Tombol ⛶ | Layar penuh | Bergantung dukungan browser |

Tombol sentuh tersedia di bawah arena pada viewport kecil. Tombol serangan dapat ditahan untuk mengulang setelah recovery selesai; input lompat menggunakan transisi keydown sehingga tidak mengulang otomatis saat ditahan.

## Roster dan skill

### 1. IRMA SURYANI — SUMMONER

Penjaga Jantung Rimba. Ikatannya dengan Lukman mengubah persahabatan menjadi kekuatan.

- HP 1050; gerak 275 unit/detik; power 1×; armor menerima 1× damage; reach 1×.
- **L — Panggilan Lukman:** Panggil Lukman selama 6 detik untuk melempar belati. Damage dasar 23; cooldown 8 detik; biaya 25 energi.
- **I — Perjanjian Rimba:** Pulihkan 100 HP dan lepaskan 5 roh rimba. Damage dasar 37 per hit jika serangan multihit; biaya 100 energi.
- **Epilog:** Irma merebut kembali Jantung Rimba. “Pulang, Lukman. Desa menunggu kita.”
- **PNG:** `assets/irma.png`.

### 2. LUKMAN — RUSH DOWN

Goblin lincah yang setia kepada Irma. Tubuh kecil, langkah cepat, dan belati yang selalu siap.

- HP 900; gerak 345 unit/detik; power 0.9×; armor menerima 1× damage; reach 0.88×.
- **L — Serbu Belati:** Melesat maju dan menusuk lawan dari dekat. Damage dasar 82; cooldown 3.8 detik; biaya 25 energi.
- **I — Tarian Seribu Belati:** Terjang lawan dengan rentetan 6 tusukan. Damage dasar 33 per hit jika serangan multihit; biaya 100 energi.
- **Epilog:** Lukman mengangkat piala yang lebih tinggi dari tubuhnya. “Irma, lihat! Kita dapat hadiah!”
- **PNG:** `assets/lukman.png`.

### 3. FAHRUDIN — JUGGERNAUT

Ogre pemilik tinju penghancur batu. Ia ingin menguasai Jantung Rimba dan menundukkan para legenda.

- HP 1450; gerak 195 unit/detik; power 1.2×; armor menerima 0.9× damage; reach 1.18×.
- **L — Hantaman Ogre:** Gelombang tanah. Lompat untuk menghindarinya. Damage dasar 98; cooldown 5.5 detik; biaya 25 energi.
- **I — Murka Fahrudin:** Ledakan jarak dekat dengan damage besar. Damage dasar 235 per hit jika serangan multihit; biaya 100 energi.
- **Epilog:** Fahrudin menggenggam Jantung Rimba. Sorak arena mengajarinya: kehormatan lebih kuat dari ketakutan.
- **PNG:** `assets/fahrudin.png`.

### 4. RAKA — BALANCED

Petarung api dari lereng Merapi. Raka memasuki turnamen demi melindungi perguruan keluarganya.

- HP 1100; gerak 280 unit/detik; power 1.05×; armor menerima 1× damage; reach 1×.
- **L — Bara Merapi:** Bola api cepat dengan efek bakar 2 detik. Damage dasar 65; cooldown 3.5 detik; biaya 25 energi.
- **I — Matahari Terbit:** Semburan api besar yang melintasi arena. Damage dasar 195 per hit jika serangan multihit; biaya 100 energi.
- **Epilog:** Api Raka menjadi lentera bagi perguruannya. Setiap murid belajar bahwa kekuatan lahir dari disiplin.
- **PNG:** `assets/raka.png`.

### 5. NADIRA — ZONER

Ahli pedang dari puncak bersalju. Gerakannya tenang, jaraknya terukur, serangannya sedingin es.

- HP 980; gerak 270 unit/detik; power 0.98×; armor menerima 1× damage; reach 1.15×.
- **L — Tombak Kristal:** Proyektil es memperlambat gerak lawan. Damage dasar 57; cooldown 4.2 detik; biaya 25 energi.
- **I — Kerajaan Es:** Lima tombak es beruntun dengan efek lambat. Damage dasar 40 per hit jika serangan multihit; biaya 100 energi.
- **Epilog:** Nadira membekukan kutukan yang menutupi kampungnya. Salju pertama kali terasa hangat di hati.
- **PNG:** `assets/nadira.png`.

### 6. BAYU — STRIKER

Petarung petir yang selalu selangkah di depan. Bayu menguji batas kecepatannya di arena para legenda.

- HP 1000; gerak 325 unit/detik; power 1×; armor menerima 1× damage; reach 1.06×.
- **L — Tendangan Kilat:** Terjang cepat dengan setrum singkat. Damage dasar 76; cooldown 4 detik; biaya 25 energi.
- **I — Badai Seribu Volt:** Enam hantaman petir beruntun dari dekat. Damage dasar 34 per hit jika serangan multihit; biaya 100 energi.
- **Epilog:** Bayu akhirnya berhenti berlari. Di puncak kemenangan, ia tahu arah lebih penting daripada kecepatan.
- **PNG:** `assets/bayu.png`.

### 7. SEKAR — ASSASSIN

Pemburu bayangan dengan sabit bulan. Sekar mencari nama yang tersembunyi di balik kutukan rimba.

- HP 920; gerak 320 unit/detik; power 1.03×; armor menerima 1× damage; reach 1.1×.
- **L — Langkah Bayangan:** Muncul di belakang lawan lalu menyerang. Damage dasar 70; cooldown 5 detik; biaya 25 energi.
- **I — Gerhana Terakhir:** Teleportasi dan enam tebasan bayangan. Damage dasar 35 per hit jika serangan multihit; biaya 100 energi.
- **Epilog:** Sekar menemukan bahwa rahasia kutukan bukan milik satu orang. Ia memilih memutus rantainya.
- **PNG:** `assets/sekar.png`.

### 8. GUNTUR — DEFENDER

Penjaga gerbang candi dengan sarung tangan batu. Keteguhannya melindungi mereka yang tak mampu bertarung.

- HP 1300; gerak 225 unit/detik; power 1.1×; armor menerima 0.93× damage; reach 1.06×.
- **L — Perisai Bumi:** Tahan 55% damage selama 4 detik. Damage dasar 0; cooldown 7 detik; biaya 25 energi.
- **I — Retakan Nusantara:** Tiga gelombang gempa menyapu lantai arena. Damage dasar 76 per hit jika serangan multihit; biaya 100 energi.
- **Epilog:** Guntur menanam Jantung Rimba di halaman candi. Dari retakan batu tumbuh kehidupan baru.
- **PNG:** `assets/guntur.png`.


## Model pertarungan

### Ruang koordinat

Canvas logis berukuran 1280 × 720. Posisi fighter adalah pusat kaki, bukan sudut kiri atas gambar. Lantai pada y=596, batas horizontal x=65 sampai x=1215. Gravitasi 1800 unit/detik², kecepatan awal lompatan -750 unit/detik.

Hurtbox memakai rentang vertikal dari kaki minus tinggi petarung sampai kaki. Tinggi model: Fahrudin 265, Lukman 172, petarung lain 235. Model pertarungan terpisah dari batas piksel sprite sehingga glow dan scarf tidak memperbesar hitbox.

Pushbox memisahkan petarung yang berjarak kurang dari 85 unit dan beda ketinggian kurang dari 85. Lompatan dan teleport dapat menukar sisi arena. Arah pandang diperbarui ke arah lawan saat petarung tidak sedang menyerang.

### Startup, active, recovery

| Serangan | Startup | Active | Recovery | Damage dasar | Jangkauan |
|---|---:|---:|---:|---:|---:|
| Pukul | 0,090 s | 0,075 s | 0,170 s | 39 | 122 × reach |
| Tendang | 0,170 s | 0,110 s | 0,260 s | 63 | 173 × reach |
| Skill biasa | 0,190 s | 0,120 s | 0,330 s | per karakter | per tipe skill |
| Ultimate biasa | 0,220 s | 0,120 s | 0,500 s | per karakter | per tipe skill |

Skill multihit bertahan sampai semua pulse selesai. Buffer input berlangsung 0,12 detik. Serangan melee hanya bisa menghantam sekali per aksi. Damage baru terjadi pada jendela active dan jika jarak serta ketinggian memenuhi syarat.

### Rumus damage

```text
damage = damage_dasar × power_penyerang × armor_target
damage *= 0,45 jika Perisai Bumi aktif

Jika diblok:
  damage *= 0,25
  guard -= damage_dasar × 0,8
Jika tidak diblok:
  damage *= max(0,55, 1 - jumlah_hit_combo_sebelumnya × 0,065)
```

Pengali armor lebih kecil berarti pertahanan lebih baik. Perisai dan blok dapat ditumpuk. Burn terpisah dari rumus hit dan memberikan 12 HP/detik selama durasinya.

Pukulan yang mengenai target memberi 9 energi, tendangan 13. Hit skill memberi 5 energi. Target mendapat energi sebesar damage aktual × 0,065. Hit yang diblok tetap memberikan energi pada kedua pihak sesuai aturan tersebut. Serangan yang meleset tidak memberi bonus energi hit.

### Guard, hitstun, hit-stop, combo

- Guard maksimum 100; pemulihan 20/detik saat tidak memblok.
- Guard kosong menimbulkan guard break 0,9 detik.
- Hitstun pukulan 0,18 detik; tendangan 0,27 detik. Skill memakai nilai sendiri.
- Invulnerability singkat 0,065 detik menghindari hit bertumpuk pada tick yang sama.
- Hit-stop 0,045 detik untuk hit biasa, 0,025 detik untuk blok. Simulasi dan timer berhenti bersama selama hit-stop.
- Combo bertahan 0,72 detik sejak hit terakhir. Hit yang diblok tidak menambah combo.
- Setiap hit combo menurunkan damage berikutnya sebesar 6,5%, dengan lantai 55%.
- Screen shake menyertai benturan; prefers-reduced-motion menonaktifkan shake dan bob.

## Implementasi tiap jenis skill

| Tipe | Perilaku mesin |
|---|---|
| summon | Irma membuat pendamping Lukman selama 6 detik; belati pertama setelah 0,25 detik, berikutnya setiap 0,72 detik |
| dash | Fighter maju 760 unit/detik selama jendela 0,28 detik; hit sekali bila target dekat |
| projectile | Proyektil 530 unit/detik dengan collision terhadap hurtbox lawan |
| beam | Proyektil besar 690 unit/detik dan radius hit lebih besar |
| teleport | Pindah ke belakang lawan sejauh 105 unit, dibatasi dinding; menyerang bila target terjangkau |
| shield | Kurangi damage yang diterima menjadi 45% selama 4 detik |
| quake | Gelombang di lantai; target yang sedang airborne tidak terkena; ultimate Guntur mengirim 3 pulse |
| barrage | 5 proyektil dengan selang 0,2 detik; Irma juga memulihkan 100 HP sampai HP maksimum |
| flurry | Mendekat lalu 6 hit setiap 0,14 detik; Sekar melakukan teleport di awal |
| slam | Serangan jarak dekat beradius horizontal 300, knockback 110; tetap dapat meleset |

Proyektil berumur maksimal 3 detik dan dibuang setelah mengenai target atau keluar arena. Gelombang lantai dapat dilompati. Semua skill tetap memerlukan jarak/kondisi yang sesuai; memakai ultimate tidak menjamin mengenai target.

## Efek status

- **Burn:** 12 damage/detik selama 2 detik. Nilai durasi di-refresh saat hit burn baru.
- **Slow:** kecepatan gerak ×0,55 selama 2,5 detik. Tidak mengubah kecepatan proyektil.
- **Stun listrik:** hitstun minimum 0,42 detik.
- **Shield:** durasi 4 detik, damage diterima ×0,45.
- **Summon:** durasi 6 detik, pendamping mengikuti Irma dan menyerang otomatis.
- Knockback, hit flash, dan partikel atlas memberi umpan balik terpisah dari perhitungan damage.

## AI

AI membaca jarak lawan, serangan yang terlihat, proyektil aktif, energi dan cooldown—bukan input keyboard tersembunyi. Ia bergerak mendekat, menyerang dalam jangkauan, memblok ancaman, kadang melompat, memakai skill, dan menggunakan ultimate saat meter penuh. Nadira cenderung menjaga jarak. Gelombang lantai memicu respons melompat.

| Kesulitan | Interval dasar keputusan | Peluang blok saat ancaman | Kecenderungan skill |
|---|---:|---:|---:|
| Santai | 0,46 s | 16% | 30% |
| Normal | 0,27 s | 45% | 55% |
| Sulit | 0,15 s | 72% | 80% |

Interval mendapat variasi acak 0–0,18 detik. Peluang bergantung kondisi dan memakai keputusan acak yang sama per siklus; bukan statistik kemenangan yang dijanjikan. HP dan damage AI sama dengan roster pemain.

## Struktur file dan tanggung jawab

```text
game/
  index.html          UI arena, HUD, pemilihan roster, dialog panduan
  style.css           tema, layout desktop/mobile, indikator dan touch control
  roster.js           data 8 karakter + RULES + BASIC
  engine.js           model FightEngine yang dapat dijalankan tanpa DOM
  render.js           PNG atlas, pose, efek, camera shake, arena
  app.js              input, UI, audio, fixed timestep, event dispatcher
  guide.html          panduan di dalam website, link unduhan PNG
  assets/*.png        aset visual asli
  adventure/          platformer sebelumnya
tests/
  combat.test.mjs      pemeriksaan logika dengan Node
```

### State machine

```text
select → countdown → fight → roundEnd → countdown
                          ↘ matchEnd → rematch
fight / countdown ↔ paused
roundEnd / matchEnd / paused → select
```

- `select`: konfigurasi petarung, lawan, dan kesulitan.
- `countdown`: 2,5 detik persiapan; combat input tidak dieksekusi.
- `fight`: fisika, AI, timer, skill dan collision berjalan.
- `paused`: semua state simulasi diam.
- `roundEnd`: tampilkan skor; lanjut ronde atau kembali memilih.
- `matchEnd`: tampilkan kemenangan/kekalahan dan epilog.

### Loop dan event

`app.js` memakai accumulator dan timestep 1/120 detik. requestAnimationFrame hanya mengatur kapan frame dirender. Delta per frame dibatasi agar tab yang tersendat tidak menyebabkan lompatan simulasi besar.

`FightEngine.emit()` mengirim event: round, fight, attack, jump, hit, block, guardbreak, skill, ultimate dan result. UI mengonsumsi event untuk tulisan FIGHT, nama ultimate, suara, serta modal hasil. Rendering tidak menentukan damage.

`snapshot()` menghasilkan objek serializable untuk pembacaan state dan pengujian. WebMCP, bila didukung browser, menyediakan `read_fight_state`, `select_fighters`, dan `start_fight`; semua memakai aksi dan state yang sama dengan UI dan menolak input karakter yang tidak valid.

## Panduan mengubah atau menambah karakter

1. Tambahkan entri pada `ROSTER` dengan id unik, nama, story, ending, statistik dan konfigurasi skill.
2. Gunakan salah satu tipe skill yang sudah didukung, atau tambahkan handler pada `updateAttack()`.
3. Simpan PNG di `assets/id.png`. Empat pose menghadap kanan, dari kiri ke kanan: idle, pukul, tendang, casting.
4. Tambahkan metadata source rectangle dan anchor pada `ATLAS` di render.js. Nilai atlas yang sekarang dituning terhadap sheet hasil generasi; tidak semua pose tepat di batas 384 piksel.
5. Tambahkan tes efek spesifik skill. Jangan hanya menguji nama tombol atau teks.
6. Perbarui label jumlah roster dan tata letak apabila jumlah petarung berubah.

Contoh konfigurasi minimal:

```js
{
  id: 'raka', name: 'RAKA', short: 'RAKA',
  hp: 1100, speed: 280, power: 1.05, armor: 1, reach: 1,
  special: {
    name: 'Bara Merapi',
    type: 'projectile',
    damage: 65,
    cooldown: 3.5,
    status: 'burn'
  },
  ultimate: { name: 'Matahari Terbit', type: 'beam', damage: 195 }
}
```

## Aset dan animasi

- 8 sprite sheet PNG, masing-masing 1536 × 1024 dengan alpha.
- 4 pose per sheet: 32 pose utama total.
- 1 atlas FX PNG 1536 × 1024: orb hijau, benturan api, es/petir, tebasan ungu.
- 1 arena PNG 1672 × 941: Candi Senja.
- Source PNG dipertahankan. Canvas memilih source rectangle tanpa menulis ulang gambar.
- Rendering FX memakai komposit screen untuk membuat glow menyatu dengan arena.
- Pose menyerang ditentukan oleh jenis aksi dan startup. Idle memiliki bob halus; hit, blok, jump dan KO memakai transform pose.
- Beberapa pose lebar memiliki scarf/anggota tubuh dekat batas sel; clipping runtime digunakan untuk mengurangi bagian pose tetangga. Untuk pipeline animasi produksi lebih lanjut, buat frame per aksi yang terpisah dan tambahkan in-between frames.

## Pemeriksaan yang dilakukan

13 kelompok pemeriksaan logika telah lulus, mencakup:
- Countdown, batas arena, lompatan dan landing.
- Startup/recovery dan satu hit per melee.
- Miss saat lawan jauh.
- Pengurangan damage blok dan guard break.
- Biaya energi, cooldown dan batas meter.
- Efek kedelapan skill dan damage kedelapan ultimate.
- Lompatan menghindari gelombang tanah.
- Shield, burn dan slow.
- Combo dan kedaluwarsanya.
- Pause yang mempertahankan state.
- KO, dua kemenangan, rematch, time ratio dan seri.
- 24 simulasi representatif AI di tiga kesulitan tanpa nilai NaN.
- Penolakan id karakter/kesulitan tidak valid.

Pilihan karakter, pemuatan aset, awal duel, UI ronde, tampilan sprite, dan WebMCP juga diperiksa di pratinjau browser. Tes model tidak menggantikan playtesting kompetitif untuk menyeimbangkan seluruh pasangan karakter.

## Batas versi ini

Versi ini adalah game browser single-player melawan AI. Belum mencakup online multiplayer, rollback netcode, controller/gamepad, rekaman replay, kombo gerakan quarter-circle, atau save progres cloud. Roster dan mesin modular disiapkan agar dapat dikembangkan lebih lanjut.


## Pembaruan audio — Candi Senja

Musik dan efek kini ditangani oleh `game/audio.js` dengan Web Audio API. Audio aktif setelah tindakan pengguna (tombol Masuk Arena atau Audio), sesuai kebijakan autoplay browser.

- Backsound **Candi Senja**: komposisi orisinal 16 bar dalam A minor, 132 BPM, loop sekitar 29 detik; lapisan bass, kick, snare, hi-hat dan melodi bernuansa gamelan/arcade.
- Seleksi karakter memakai aransemen ringan. Duel menambahkan perkusi dan bass; 15 detik terakhir menambah intensitas hi-hat.
- Efek: ayunan pukulan/tendangan, benturan, blok metalik, guard break, lompat, summon, skill empat elemen, ultimate, awal ronde dan fanfare hasil.
- Panning stereo mengikuti posisi petarung di arena.
- Pengaturan **Audio** menyediakan master on/off, volume musik dan efek terpisah, serta tombol Tes suara pukulan.
- Volume default: musik 38%, efek 75%. Preferensi tersimpan dalam localStorage perangkat.
- Musik berhenti ketika pause, ronde selesai, tab tersembunyi atau halaman ditinggalkan. Resume memulai kembali scheduler tanpa menggandakan musik.
- Scheduler 25 ms dengan lookahead 120 ms memakai jam AudioContext. Setiap oscillator/noise source dihentikan dan diputus setelah selesai.
- Gain terpisah music/effects masuk ke master dan dynamics compressor untuk membatasi puncak suara saat banyak hit bersamaan.
- Komposisi dan efek disintesis di browser, tidak bergantung pada file musik eksternal.

Pemeriksaan `tests/audio.test.mjs` memakai AudioContext tiruan untuk memvalidasi seluruh 16 bar, semua jenis efek, volume independen, mute, pause, tab tersembunyi, resume, fanfare, penyimpanan preferensi dan fallback audio tidak didukung. Pemeriksaan ini memvalidasi pemanggilan API dan lifecycle; bukan pengukuran kualitas akustik perangkat pengguna.

