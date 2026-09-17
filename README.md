# RIMBA CLASH — Arena Para Legenda

Game fighting arcade 2D berbasis browser dengan 8 petarung orisinal, sprite PNG, skill elemental, dan lawan AI. Mode platformer **IRMA SURYANI — Perjanjian Rimba** juga tersedia.

## Fitur

- Delapan petarung: **Irma Suryani, Lukman, Fahrudin, Raka, Nadira, Bayu, Sekar, dan Guntur**.
- Skill khusus dan ultimate berbeda: summon, belati, gempa, api, es, petir, teleportasi, dan perisai.
- Dua kemenangan ronde untuk memenangkan duel, timer 60 detik, combo, blok, guard break, energi, dan efek status.
- Tiga tingkat kesulitan AI serta kontrol keyboard dan sentuh.
- Delapan sprite sheet PNG berisi 32 pose utama, atlas efek, dan arena Candi Senja.
- Musik orisinal Candi Senja dan efek pertarungan melalui Web Audio, dengan pengaturan volume terpisah.
- Mode petualangan platformer Irma dan Lukman melawan Ogre Fahrudin.

## Menjalankan lokal

Tidak memerlukan instalasi npm atau proses build. Gunakan Python 3 untuk menjalankan server HTTP:

```bash
git clone https://github.com/Andikarna/game-rimba-clash.git
cd game-rimba-clash
python -m http.server 5173 --directory dist
```

Buka [http://localhost:5173](http://localhost:5173). Pada Windows, perintah Python juga dapat dijalankan sebagai `py -m http.server 5173 --directory dist`.

Game menggunakan JavaScript ES Modules; membuka HTML langsung melalui `file://` tidak didukung. Musik mulai setelah interaksi pengguna, misalnya menekan **Masuk Arena**. Gunakan tombol **Audio** untuk volume dan mute.

## Kontrol pertarungan

| Tombol | Aksi |
| --- | --- |
| A / D atau ← / → | Bergerak |
| W / Spasi / ↑ | Lompat |
| S / ↓ | Tahan blok |
| J | Pukul |
| K | Tendang |
| L | Skill khusus (25 energi) |
| I | Ultimate (100 energi) |
| Esc | Jeda / lanjut |

## Struktur project

```text
dist/
  index.html           Halaman arena dan pilihan karakter
  app.js               Input, HUD, UI, dan loop permainan
  engine.js            Fisika, AI, collision, skill, dan aturan ronde
  roster.js            Data petarung dan konfigurasi balance
  render.js            Rendering Canvas dan pose PNG
  audio.js             Musik dan efek suara prosedural
  style.css            Tampilan desktop dan ponsel
  guide.html           Panduan dalam game
  assets/              PNG karakter, efek, dan arena
  adventure/           Game platformer sebelumnya
docs/
  SCRIPTING.md         Dokumentasi desain dan scripting lengkap
  asset-prompts.json   Prompt pembuatan aset ImageGen
tests/
  combat.test.mjs      Pemeriksaan model pertarungan
  audio.test.mjs       Pemeriksaan lifecycle audio
.openai/hosting.json    Identitas deployment Sites
```

File HTML, CSS, JavaScript, dan aset di `dist/` merupakan sumber website yang diedit langsung, bukan output build yang boleh dihapus.

## Pengujian

Gunakan Node.js 22 atau lebih baru:

```bash
node tests/combat.test.mjs
node tests/audio.test.mjs
```

Tes combat mencakup skill kedelapan petarung, ultimate, blok, combo, status, pause, hasil ronde, dan AI. Tes audio menggunakan AudioContext tiruan untuk memeriksa scheduler, volume, mute, pause/resume, dan cleanup.

## Dokumentasi dan aset

Lihat [dokumen scripting](docs/SCRIPTING.md), [prompt aset](docs/asset-prompts.json), dan [panduan HTML](dist/guide.html).

Aset PNG dibuat dengan ImageGen. Setiap karakter memiliki empat pose utama: idle, pukul, tendang, dan casting. Gerakan lain memakai pose dengan transform; bukan animasi puluhan frame per aksi.

Versi ini merupakan game single-player melawan AI. Online multiplayer dan rollback netcode belum diimplementasikan.

## Website

[Mainkan Rimba Clash](https://irma-goblin-chronicles.karnaandi00.chatgpt.site) — akses mengikuti pengaturan pemilik website.

