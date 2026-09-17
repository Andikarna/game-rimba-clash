/** Balance data; damage is before armor and block. */
export const ROSTER=[
  {
    "id": "irma",
    "name": "IRMA SURYANI",
    "short": "IRMA",
    "title": "Sang Penjaga Rimba",
    "role": "SUMMONER",
    "color": "#85edb2",
    "hp": 1050,
    "speed": 275,
    "power": 1,
    "armor": 1,
    "reach": 1,
    "stats": [
      3,
      3,
      4
    ],
    "effect": 0,
    "story": "Penjaga Jantung Rimba. Ikatannya dengan Lukman mengubah persahabatan menjadi kekuatan.",
    "special": {
      "name": "Panggilan Lukman",
      "type": "summon",
      "description": "Panggil Lukman selama 6 detik untuk melempar belati.",
      "damage": 23,
      "cooldown": 8
    },
    "ultimate": {
      "name": "Perjanjian Rimba",
      "type": "barrage",
      "description": "Pulihkan 100 HP dan lepaskan 5 roh rimba.",
      "damage": 37
    },
    "ending": "Irma merebut kembali Jantung Rimba. “Pulang, Lukman. Desa menunggu kita.”"
  },
  {
    "id": "lukman",
    "name": "LUKMAN",
    "short": "LUKMAN",
    "title": "Belati dari Balik Bayangan",
    "role": "RUSH DOWN",
    "color": "#b7d873",
    "hp": 900,
    "speed": 345,
    "power": 0.9,
    "armor": 1,
    "reach": 0.88,
    "stats": [
      2,
      5,
      3
    ],
    "effect": 3,
    "story": "Goblin lincah yang setia kepada Irma. Tubuh kecil, langkah cepat, dan belati yang selalu siap.",
    "special": {
      "name": "Serbu Belati",
      "type": "dash",
      "description": "Melesat maju dan menusuk lawan dari dekat.",
      "damage": 82,
      "cooldown": 3.8
    },
    "ultimate": {
      "name": "Tarian Seribu Belati",
      "type": "flurry",
      "description": "Terjang lawan dengan rentetan 6 tusukan.",
      "damage": 33
    },
    "ending": "Lukman mengangkat piala yang lebih tinggi dari tubuhnya. “Irma, lihat! Kita dapat hadiah!”"
  },
  {
    "id": "fahrudin",
    "name": "FAHRUDIN",
    "short": "FAHRUDIN",
    "title": "Ogre Sang Penakluk",
    "role": "JUGGERNAUT",
    "color": "#dfa776",
    "hp": 1450,
    "speed": 195,
    "power": 1.2,
    "armor": 0.9,
    "reach": 1.18,
    "stats": [
      5,
      1,
      5
    ],
    "effect": 1,
    "story": "Ogre pemilik tinju penghancur batu. Ia ingin menguasai Jantung Rimba dan menundukkan para legenda.",
    "special": {
      "name": "Hantaman Ogre",
      "type": "quake",
      "description": "Gelombang tanah. Lompat untuk menghindarinya.",
      "damage": 98,
      "cooldown": 5.5
    },
    "ultimate": {
      "name": "Murka Fahrudin",
      "type": "slam",
      "description": "Ledakan jarak dekat dengan damage besar.",
      "damage": 235
    },
    "ending": "Fahrudin menggenggam Jantung Rimba. Sorak arena mengajarinya: kehormatan lebih kuat dari ketakutan."
  },
  {
    "id": "raka",
    "name": "RAKA",
    "short": "RAKA",
    "title": "Tinju Sang Fajar",
    "role": "BALANCED",
    "color": "#ff9c66",
    "hp": 1100,
    "speed": 280,
    "power": 1.05,
    "armor": 1,
    "reach": 1,
    "stats": [
      4,
      3,
      3
    ],
    "effect": 1,
    "story": "Petarung api dari lereng Merapi. Raka memasuki turnamen demi melindungi perguruan keluarganya.",
    "special": {
      "name": "Bara Merapi",
      "type": "projectile",
      "description": "Bola api cepat dengan efek bakar 2 detik.",
      "damage": 65,
      "cooldown": 3.5,
      "status": "burn"
    },
    "ultimate": {
      "name": "Matahari Terbit",
      "type": "beam",
      "description": "Semburan api besar yang melintasi arena.",
      "damage": 195
    },
    "ending": "Api Raka menjadi lentera bagi perguruannya. Setiap murid belajar bahwa kekuatan lahir dari disiplin."
  },
  {
    "id": "nadira",
    "name": "NADIRA",
    "short": "NADIRA",
    "title": "Ratu Embun Beku",
    "role": "ZONER",
    "color": "#9bd8ff",
    "hp": 980,
    "speed": 270,
    "power": 0.98,
    "armor": 1,
    "reach": 1.15,
    "stats": [
      3,
      3,
      3
    ],
    "effect": 2,
    "story": "Ahli pedang dari puncak bersalju. Gerakannya tenang, jaraknya terukur, serangannya sedingin es.",
    "special": {
      "name": "Tombak Kristal",
      "type": "projectile",
      "description": "Proyektil es memperlambat gerak lawan.",
      "damage": 57,
      "cooldown": 4.2,
      "status": "slow"
    },
    "ultimate": {
      "name": "Kerajaan Es",
      "type": "barrage",
      "description": "Lima tombak es beruntun dengan efek lambat.",
      "damage": 40,
      "status": "slow"
    },
    "ending": "Nadira membekukan kutukan yang menutupi kampungnya. Salju pertama kali terasa hangat di hati."
  },
  {
    "id": "bayu",
    "name": "BAYU",
    "short": "BAYU",
    "title": "Kilat Tanpa Jejak",
    "role": "STRIKER",
    "color": "#80e5ed",
    "hp": 1000,
    "speed": 325,
    "power": 1,
    "armor": 1,
    "reach": 1.06,
    "stats": [
      3,
      5,
      2
    ],
    "effect": 2,
    "story": "Petarung petir yang selalu selangkah di depan. Bayu menguji batas kecepatannya di arena para legenda.",
    "special": {
      "name": "Tendangan Kilat",
      "type": "dash",
      "description": "Terjang cepat dengan setrum singkat.",
      "damage": 76,
      "cooldown": 4,
      "status": "stun"
    },
    "ultimate": {
      "name": "Badai Seribu Volt",
      "type": "flurry",
      "description": "Enam hantaman petir beruntun dari dekat.",
      "damage": 34
    },
    "ending": "Bayu akhirnya berhenti berlari. Di puncak kemenangan, ia tahu arah lebih penting daripada kecepatan."
  },
  {
    "id": "sekar",
    "name": "SEKAR",
    "short": "SEKAR",
    "title": "Bunga di Dalam Gelap",
    "role": "ASSASSIN",
    "color": "#cca1f1",
    "hp": 920,
    "speed": 320,
    "power": 1.03,
    "armor": 1,
    "reach": 1.1,
    "stats": [
      4,
      4,
      2
    ],
    "effect": 3,
    "story": "Pemburu bayangan dengan sabit bulan. Sekar mencari nama yang tersembunyi di balik kutukan rimba.",
    "special": {
      "name": "Langkah Bayangan",
      "type": "teleport",
      "description": "Muncul di belakang lawan lalu menyerang.",
      "damage": 70,
      "cooldown": 5
    },
    "ultimate": {
      "name": "Gerhana Terakhir",
      "type": "flurry",
      "description": "Teleportasi dan enam tebasan bayangan.",
      "damage": 35
    },
    "ending": "Sekar menemukan bahwa rahasia kutukan bukan milik satu orang. Ia memilih memutus rantainya."
  },
  {
    "id": "lala",
    "name": "LALA",
    "short": "LALA",
    "title": "Si Risol Rimba",
    "role": "ZONER",
    "color": "#b5e87a",
    "hp": 960,
    "speed": 295,
    "power": 0.97,
    "armor": 1,
    "reach": 1.12,
    "stats": [
      3,
      4,
      3
    ],
    "effect": 1,
    "story": "Penjual risol paling terkenal di pasar Rimba. Lala memasuki turnamen membawa keranjang risol andalannya — dan jangan salah, lemparan risolnya bisa bikin pingsan!",
    "special": {
      "name": "Lempar Risol",
      "type": "projectile",
      "description": "Melempar risol panas yang membakar lawan selama 2 detik.",
      "damage": 62,
      "cooldown": 3.8,
      "status": "burn"
    },
    "ultimate": {
      "name": "Hujan Risol",
      "type": "barrage",
      "description": "Lemparkan 5 risol panas beruntun ke arah lawan!",
      "damage": 38,
      "status": "burn"
    },
    "ending": "Lala mengangkat keranjang risolnya tinggi-tinggi. \"Siapa bilang jualan risol nggak keren?\""
  },
  {
    "id": "guntur",
    "name": "GUNTUR",
    "short": "GUNTUR",
    "title": "Benteng Bumi",
    "role": "DEFENDER",
    "color": "#d9be79",
    "hp": 1300,
    "speed": 225,
    "power": 1.1,
    "armor": 0.93,
    "reach": 1.06,
    "stats": [
      4,
      2,
      5
    ],
    "effect": 1,
    "story": "Penjaga gerbang candi dengan sarung tangan batu. Keteguhannya melindungi mereka yang tak mampu bertarung.",
    "special": {
      "name": "Perisai Bumi",
      "type": "shield",
      "description": "Tahan 55% damage selama 4 detik.",
      "damage": 0,
      "cooldown": 7
    },
    "ultimate": {
      "name": "Retakan Nusantara",
      "type": "quake",
      "description": "Tiga gelombang gempa menyapu lantai arena.",
      "damage": 76
    },
    "ending": "Guntur menanam Jantung Rimba di halaman candi. Dari retakan batu tumbuh kehidupan baru."
  }
];
export const RULES={roundSeconds:60,winsToMatch:2,specialCost:25,ultimateCost:100,energyPerSecond:4,guardReduction:.25,guardMax:100,gravity:1800,floor:596,left:65,right:1215};
export const BASIC={punch:{startup:.09,active:.075,recovery:.17,damage:39,range:122,stun:.18,gain:9},kick:{startup:.17,active:.11,recovery:.26,damage:63,range:173,stun:.27,gain:13}};

