/* R6 HUB - catalogo de armas + meta de pecas (attachments)
   Fontes de stats: dataset hanslhansl/rainbow-six-siege-weapon-statistics (y11s3.1)
                    + Rainbow Six Wiki (Weapon_Attachments)
   IMPORTANTE: a Ubisoft nao publica telemetria de uso de pecas. Os percentuais abaixo
   sao ESTIMATIVAS de consenso da comunidade (guias + Reddit + jogadores pro).          */
(function () {
  "use strict";
  window.R6HUB = window.R6HUB || {};

  /* Efeito de cada peca (medidos e documentados na wiki) */
  window.R6HUB.attachmentEffects = {
    "Flash Hider":          { slot: "cano",    d: "-20% de recuo vertical",            conf: "media" },
    "Compensator":          { slot: "cano",    d: "-40% de recuo horizontal",          conf: "media" },
    "Muzzle Brake":         { slot: "cano",    d: "-50% de recuo do primeiro tiro",    conf: "media" },
    "Suppressor":           { slot: "cano",    d: "Silencia o tiro, sem perder dano",  conf: "media" },
    "Extended Barrel":      { slot: "cano",    d: "+10% de dano base, queda mais lenta", conf: "baixa" },
    "Sem cano":             { slot: "cano",    d: "Mantem o cano original da arma",     conf: "baixa" },
    "Vertical Grip":        { slot: "grip",    d: "-20% de recuo vertical",            conf: "alta" },
    "Angled Grip":          { slot: "grip",    d: "-20% de tempo de recarga",          conf: "media" },
    "Horizontal Grip":      { slot: "grip",    d: "+5% de velocidade de movimento",    conf: "media" },
    "Laser Sight":          { slot: "under",   d: "+10% de velocidade de mira (ADS)",  conf: "alta" },
    "Scope 2.5x (ACOG)":    { slot: "mira",    d: "Luneta 2.5x, padrao de AR/LMG/DMR", conf: "alta" },
    "Scope 1.5x (ACOG)":    { slot: "mira",    d: "Luneta 1.5x, boa para SMG e vertical", conf: "media" },
    "Scope 2.0x":           { slot: "mira",    d: "Luneta 2.0x",                        conf: "media" },
    "Scope 3.0x":           { slot: "mira",    d: "Luneta 3.0x",                        conf: "media" },
    "Holographic Sight":    { slot: "mira",    d: "Mira holografica, boa de perto",     conf: "media" },
    "Red Dot Sight":        { slot: "mira",    d: "Mira de ponto vermelho",             conf: "media" },
    "Mironas de ferro":     { slot: "mira",    d: "Sem peca: apenas a mira original",   conf: "alta" }
  };

  /* Meta global (estimativas da comunidade) */
  window.R6HUB.metaGlobal = {
    note: "Nenhuma fonte publica mede o uso de pecas em R6. Estes numeros sao estimativas de consenso.",
    cano: [
      { n: "Flash Hider",     p: "45-55%", d: "Padrao em automáticas",                conf: "media" },
      { n: "Compensator",     p: "20-28%", d: "Fortes em armas de recuo largo",       conf: "media" },
      { n: "Muzzle Brake",    p: "10-14%", d: "~70-80% em pistolas, ~55-65% em DMR",  conf: "media" },
      { n: "Sem cano",        p: "5-8%",   d: "Minoria real (C8, M45)",               conf: "baixa" },
      { n: "Extended Barrel", p: "5-8%",   d: "Concentrada em C8, 416-C, AR-15.50",   conf: "baixa" },
      { n: "Suppressor",      p: "5-10%",  d: "Nicho: Nokk, Amaru, Ash",               conf: "media" }
    ],
    grip: [
      { n: "Vertical Grip",   p: "55-65%", d: "Grip dominante onde houver",           conf: "alta" },
      { n: "Angled Grip",     p: "20-28%", d: "M4/Maverick, BOSG, G36C",              conf: "media" },
      { n: "Horizontal Grip", p: "5-10%",  d: "Nicho: ALDA 5.56, SR-25, RK7",         conf: "media" },
      { n: "Sem grip",        p: "n/a",    d: "C8, P90, MP7, FMG-9, SMG-11 nao tem slot", conf: "alta" }
    ],
    mira: [
      { n: "Scope 2.5x (ACOG)", p: "30-40%", d: "Padrao onde houver lupao",           conf: "alta" },
      { n: "1.0x / Holo",       p: "20-25%", d: "Dominante em SMG de curto alcance",   conf: "media" },
      { n: "Scope 1.5x (ACOG)", p: "15-20%", d: "Forte em SMG e jogadas verticais",   conf: "media" },
      { n: "Mironas de ferro",  p: "5-10%",  d: "Forcado em pistolas e na C7E",        conf: "alta" }
    ],
    under: [
      { n: "Laser Sight", p: "55-65%", d: "Sousbarrel mais usada por larga margem", conf: "alta" },
      { n: "Lanterna",    p: "minimo",  d: "Praticamente fora do PvP ranqueado",    conf: "alta" },
      { n: "Sem under",   p: "35-45%",  d: "Superrecarregado em escopetas",         conf: "media" }
    ]
  };

  /* t: AR | SMG | LMG | SHOTGUN | MARKSMAN | SNIPER | PISTOL | MELEE
     slots: quais slots existem na arma (mira/under/grip/cano)
     meta: p = percentual ESTIMADO, c = confianca (alta/media/baixa)                */
  function W(n, t, dmg, rpm, mag, slots, meta, note) {
    return { n: n, t: t, dmg: dmg, rpm: rpm, mag: mag, slots: slots, meta: meta || null, note: note || "" };
  }

  window.R6HUB.weapons = [
    /* ---------------- RIFLES DE ASSALTO ---------------- */
    W("L85A2", "AR", "47", 669, "30+1", ["mira", "under", "grip", "cano"], {
      mira: [{ n: "Scope 2.5x (ACOG)", p: 70, c: "alta" }, { n: "Scope 1.5x (ACOG)", p: 18, c: "media" }],
      cano: [{ n: "Flash Hider", p: 45, c: "media" }, { n: "Compensator", p: 35, c: "media" }, { n: "Suppressor", p: 10, c: "baixa" }],
      grip: [{ n: "Vertical Grip", p: 80, c: "alta" }, { n: "Angled Grip", p: 15, c: "media" }],
      under: [{ n: "Laser Sight", p: 65, c: "alta" }]
    }, "Arma padrao do Sledge; recuo vertical de mid-tier, boa para entry."),
    W("AR33", "AR", "41", 748, "25+1", ["mira", "under", "grip", "cano"], null, "Arma do Thatcher e do Flores. Recuo vertical alto, mas rapida."),
    W("G36C", "AR", "38", 779, "30+1", ["mira", "under", "grip", "cano"], {
      mira: [{ n: "Scope 2.5x (ACOG)", p: 60, c: "media" }, { n: "Scope 1.5x (ACOG)", p: 25, c: "media" }],
      cano: [{ n: "Compensator", p: 55, c: "media" }],
      grip: [{ n: "Angled Grip", p: 45, c: "media" }, { n: "Vertical Grip", p: 40, c: "media" }],
      under: [{ n: "Laser Sight", p: 45, c: "media" }]
    }, "Recuo em losango largo. Um dos melhores rifles de entrada do Ash."),
    W("R4-C", "AR", "39", 859, "25+1", ["mira", "under", "grip", "cano"], {
      mira: [{ n: "Scope 2.5x (ACOG)", p: 50, c: "media" }, { n: "Scope 1.5x (ACOG)", p: 25, c: "media" }, { n: "Holographic Sight", p: 20, c: "media" }],
      cano: [{ n: "Flash Hider", p: 60, c: "alta" }, { n: "Compensator", p: 20, c: "media" }, { n: "Suppressor", p: 15, c: "media" }],
      grip: [{ n: "Vertical Grip", p: 70, c: "alta" }, { n: "Angled Grip", p: 25, c: "media" }],
      under: [{ n: "Laser Sight", p: 60, c: "alta" }]
    }, "Arma do Ash e do Ram: cadencia alta, dano por tiro nao tao alto."),
    W("556xi", "AR", "47", 689, "30+1", ["mira", "under", "grip", "cano"], {
      mira: [{ n: "Scope 2.5x (ACOG)", p: 65, c: "alta" }],
      cano: [{ n: "Flash Hider", p: 50, c: "media" }, { n: "Compensator", p: 40, c: "media" }],
      grip: [{ n: "Vertical Grip", p: 75, c: "alta" }],
      under: [{ n: "Laser Sight", p: 55, c: "media" }]
    }, "Divisao real entre Flash Hider e Compensator na comunidade. Favorita em Osa por causa da variacao de recuo."),
    W("F2", "AR", "37", 978, "25+1", ["mira", "under", "grip", "cano"], null, "Arma da Twitch e do Solid Snake: cadencia altissima, recuo vertical pesado."),
    W("AK-12", "AR", "40", 850, "30+1", ["mira", "under", "grip", "cano"], {
      mira: [{ n: "Scope 2.5x (ACOG)", p: 70, c: "alta" }],
      cano: [{ n: "Flash Hider", p: 65, c: "alta" }],
      grip: [{ n: "Vertical Grip", p: 80, c: "alta" }],
      under: [{ n: "Laser Sight", p: 55, c: "media" }]
    }, "Padrao do Fuze e do Ace. Estavel e rapida."),
    W("AUG A2", "AR", "42", 719, "30+1", ["mira", "under", "cano"], null, "Sem slot de grip. Arma da IQ e do Wamai."),
    W("552 Commando", "AR", "43/48", 690, "30+1", ["mira", "under", "grip", "cano"], {
      mira: [{ n: "Scope 2.5x (ACOG)", p: 70, c: "alta" }],
      cano: [{ n: "Compensator", p: 60, c: "alta" }],
      grip: [{ n: "Vertical Grip", p: 75, c: "alta" }],
      under: [{ n: "Laser Sight", p: 60, c: "media" }]
    }, "Recuo largo: o Compensator e o claro favorito. Dano base tambem disputado entre fontes."),
    W("416-C Carbine", "AR", "38/42", 739, "25+1", ["mira", "under", "grip", "cano"], {
      mira: [{ n: "Scope 2.5x (ACOG)", p: 65, c: "alta" }],
      cano: [{ n: "Flash Hider", p: 45, c: "media" }, { n: "Compensator", p: 30, c: "media" }, { n: "Extended Barrel", p: 20, c: "baixa" }],
      grip: [{ n: "Vertical Grip", p: 70, c: "alta" }],
      under: [{ n: "Laser Sight", p: 60, c: "alta" }]
    }, "O nerf do recuo vertical no patch Y11S2.2 impulsionou a arma na meta."),
    W("C8-SFW", "AR", "40/44", 837, "30+1", ["mira", "under", "cano"], {
      mira: [{ n: "Holographic Sight", p: 50, c: "media" }, { n: "Scope 2.5x (ACOG)", p: 35, c: "media" }],
      cano: [{ n: "Flash Hider", p: 45, c: "media" }, { n: "Sem cano", p: 25, c: "baixa" }, { n: "Compensator", p: 25, c: "media" }],
      under: [{ n: "Laser Sight", p: 65, c: "alta" }]
    }, "Nao tem slot de grip. Base da entrada do Buck."),
    W("Mk17 CQB", "AR", "44/49", 584, "20+1", [], null, "Arma exclusiva do Blackbeard. Pode ser usada junto com o H.U.L.L."),
    W("PARA-308", "AR", "47/52", 649, "30+1", ["mira", "under", "grip", "cano"], null, "Ferrolho (bolt-action) do Capitao e da Brava. Um tiro por aperto."),
    W("Type-89", "AR", "40", 848, "20+1", ["mira", "under", "grip", "cano"], {
      mira: [{ n: "Scope 2.5x (ACOG)", p: 55, c: "media" }],
      cano: [{ n: "Flash Hider", p: 50, c: "baixa" }, { n: "Compensator", p: 50, c: "baixa" }],
      grip: [{ n: "Vertical Grip", p: 55, c: "media" }, { n: "Angled Grip", p: 30, c: "media" }],
      under: [{ n: "Laser Sight", p: 50, c: "media" }]
    }, "Divisao 50/50 entre Flash Hider e Compensator: confianca baixa, fonte contradictoria."),
    W("C7E", "AR", "42", 799, "30+1", ["mira", "under", "grip", "cano"], {
      mira: [{ n: "Scope 1.5x (ACOG)", p: 45, c: "media" }, { n: "Mironas de ferro", p: 45, c: "media" }],
      cano: [{ n: "Compensator", p: 50, c: "media" }],
      grip: [{ n: "Vertical Grip", p: 60, c: "media" }],
      under: [{ n: "Laser Sight", p: 50, c: "media" }]
    }, "Arma do Jackal. Dano base disputado entre fontes."),
    W("M762", "AR", "45", 729, "30+1", ["mira", "under", "grip", "cano"], {
      mira: [{ n: "Scope 2.5x (ACOG)", p: 50, c: "media" }, { n: "Holographic Sight", p: 30, c: "media" }],
      cano: [{ n: "Flash Hider", p: 55, c: "media" }],
      grip: [{ n: "Vertical Grip", p: 75, c: "alta" }],
      under: [{ n: "Laser Sight", p: 50, c: "media" }]
    }, "Arma da Zofia. Dano alto e recuo estavel."),
    W("V308", "AR", "44", 699, "50+1", ["mira", "under", "grip", "cano"], null, "Carregador de 50 do Lion: cobre o bangalo inteiro sem recarregar."),
    W("Spear .308", "AR", "42/47", 699, "30+1", ["mira", "under", "grip", "cano"], {
      mira: [{ n: "Scope 2.5x (ACOG)", p: 65, c: "media" }],
      cano: [{ n: "Compensator", p: 60, c: "alta" }],
      grip: [{ n: "Horizontal Grip", p: 60, c: "media" }],
      under: [{ n: "Laser Sight", p: 50, c: "media" }]
    }, "Arma da Finka e da Thunderbird."),
    W("M4", "AR", "44/49", 750, "30+1", ["mira", "under", "grip", "cano"], {
      mira: [{ n: "Scope 2.5x (ACOG)", p: 50, c: "media" }, { n: "Scope 1.5x (ACOG)", p: 30, c: "media" }],
      cano: [{ n: "Flash Hider", p: 55, c: "alta" }, { n: "Compensator", p: 30, c: "media" }],
      grip: [{ n: "Vertical Grip", p: 50, c: "media" }, { n: "Angled Grip", p: 45, c: "media" }],
      under: [{ n: "Laser Sight", p: 60, c: "alta" }]
    }, "A wiki recomenda Flash Hider em vez de Compensator por causa do recuo do primeiro tiro."),
    W("AK-74M", "AR", "44", 649, "40+1", ["mira", "under", "grip", "cano"], null, "Carregador de 40. Arma do Nomad e do Deimos."),
    W("ARX200", "AR", "47", 700, "20+1", ["mira", "under", "grip", "cano"], null, "Arma do Nomad e da Iana."),
    W("F90", "AR", "38/42", 780, "30+1", ["mira", "under", "grip", "cano"], null, "Arma da Gridlock. Recuo horizontal forte, otima para suppressao de area."),
    W("Commando 9", "AR", "36/40", 780, "25+1", ["mira", "under", "grip", "cano"], null, "Arma do Sentry, Mozzie e Noor."),
    W("SC3000K", "AR", "45/50", 800, "25+1", ["mira", "under", "grip", "cano"], {
      mira: [{ n: "Scope 2.5x (ACOG)", p: 65, c: "media" }],
      cano: [{ n: "Compensator", p: 45, c: "media" }, { n: "Flash Hider", p: 40, c: "media" }],
      grip: [{ n: "Vertical Grip", p: 60, c: "media" }, { n: "Horizontal Grip", p: 30, c: "media" }],
      under: [{ n: "Laser Sight", p: 50, c: "media" }]
    }, "Arma do Zero. Foi alvo de ajuste de recuo no patch Y11S2.1."),
    W("POF-9", "AR", "37/41", 739, "50+1", ["mira", "under", "grip", "cano"], null, "Arma do Sens. Carregador de 50."),
    W("PCX-33", "AR", "36/40", 744, "31+1", ["mira", "under", "grip", "cano"], null, "AR exclusiva da Skopos."),
    W("XK23", "AR", "49/54", 676, "35+1", ["mira", "under", "grip", "cano"], null, "Arma da Dokkaebi e da Rauora: dano base entre os mais altos."),

    /* ---------------- SUBMETRALHADORAS ---------------- */
    W("FMG-9", "SMG", "34/38", 799, "30+1", ["mira", "under", "cano"], {
      mira: [{ n: "Red Dot Sight", p: 65, c: "alta" }],
      cano: [{ n: "Flash Hider", p: 65, c: "alta" }, { n: "Suppressor", p: 25, c: "media" }],
      under: [{ n: "Laser Sight", p: 45, c: "media" }]
    }, "Somente automatica: Muzzle Brake e descartado. Sem slot de grip. A lupao do FMG-9 e exclusiva da Nokk."),
    W("MP5K", "SMG", "30/33", 799, "30+1", ["mira", "under", "cano"], {
      mira: [{ n: "Scope 1.5x (ACOG)", p: 60, c: "media" }, { n: "Red Dot Sight", p: 25, c: "media" }],
      cano: [{ n: "Flash Hider", p: 50, c: "media" }],
      under: [{ n: "Laser Sight", p: 55, c: "media" }]
    }, "Sem slot de grip. Consenso do Mute favorece lupao baixa."),
    W("UMP45", "SMG", "42/47", 599, "25+1", [], null, "Arma do Castle e do Pulse. Dano base disputado entre fontes."),
    W("MP5", "SMG", "27/30", 799, "30+1", ["mira", "under", "grip", "cano"], {
      mira: [{ n: "Scope 2.5x (ACOG)", p: 45, c: "media" }, { n: "Scope 1.5x (ACOG)", p: 35, c: "media" }],
      cano: [{ n: "Flash Hider", p: 50, c: "media" }, { n: "Compensator", p: 40, c: "media" }],
      grip: [{ n: "Vertical Grip", p: 80, c: "alta" }],
      under: [{ n: "Laser Sight", p: 60, c: "alta" }]
    }, "Arma do Doc e do Rook."),
    W("P90", "SMG", "22/24", 968, "50+1", ["mira", "under", "cano"], {
      mira: [{ n: "Scope 1.5x (ACOG)", p: 50, c: "media" }, { n: "Scope 2.5x (ACOG)", p: 30, c: "media" }],
      cano: [{ n: "Flash Hider", p: 50, c: "media" }],
      under: [{ n: "Laser Sight", p: 50, c: "media" }]
    }, "Sem slot de grip. Dano por tiro baixo, mas cadencia absurda."),
    W("9x19VSN", "SMG", "34/38", 749, "30+1", ["mira", "under", "grip", "cano"], {
      mira: [{ n: "Scope 1.5x (ACOG)", p: 50, c: "media" }, { n: "Red Dot Sight", p: 30, c: "media" }],
      cano: [{ n: "Compensator", p: 60, c: "alta" }],
      grip: [{ n: "Vertical Grip", p: 80, c: "alta" }],
      under: [{ n: "Laser Sight", p: 55, c: "media" }]
    }, "Recuo em losango largo: Compensator e o favorito claro. Arma do Kapkan, Tachanka e Azami."),
    W("MP7", "SMG", "32/35", 899, "30+1", ["mira", "under", "cano"], {
      mira: [{ n: "Scope 1.5x (ACOG)", p: 40, c: "media" }, { n: "Red Dot Sight", p: 30, c: "media" }],
      cano: [{ n: "Flash Hider", p: 60, c: "alta" }],
      under: [{ n: "Laser Sight", p: 55, c: "media" }]
    }, "Sem slot de grip. A lupao do MP7 e exclusiva do Zero."),
    W("9mm C1", "SMG", "36/40", 575, "34+1", ["mira", "under", "grip", "cano"], null, "Arma da Frost."),
    W("MPX", "SMG", "26/29", 830, "30+1", ["mira", "under", "grip", "cano"], null, "Sem slot de grip. Arma da Valkyrie, Warden e Tubarao."),
    W("M12", "SMG", "42/47", 550, "30+1", [], null, "Arma do Sledge e da Caveira. Dano base subiu de 40 para 42 no patch Y11S1.1."),
    W("MP5SD", "SMG", "30", 800, "30+1", ["mira", "under", "grip"], null, "Silenciada de fabrica. Sem opcoes de cano. Arma do Echo."),
    W("PDW9", "SMG", "34/38", 799, "50+1", ["mira", "under", "grip", "cano"], null, "Arma do Jackal e da Osa."),
    W("Vector .45 ACP", "SMG", "23/25", 1200, "25+1", ["mira", "under", "grip", "cano"], {
      mira: [{ n: "Red Dot Sight", p: 50, c: "media" }, { n: "Scope 2.5x (ACOG)", p: 30, c: "media" }],
      cano: [{ n: "Compensator", p: 50, c: "media" }, { n: "Flash Hider", p: 35, c: "media" }],
      grip: [{ n: "Vertical Grip", p: 75, c: "alta" }],
      under: [{ n: "Laser Sight", p: 55, c: "media" }]
    }, "A Vector do Goyo e a unica que aceita lupao ampliada."),
    W("T-5 SMG", "SMG", "28/31", 899, "30+1", ["mira", "under", "grip", "cano"], {
      mira: [{ n: "Mironas de ferro", p: 40, c: "media" }, { n: "Red Dot Sight", p: 40, c: "media" }],
      cano: [{ n: "Flash Hider", p: 45, c: "media" }],
      grip: [{ n: "Vertical Grip", p: 80, c: "alta" }],
      under: [{ n: "Laser Sight", p: 55, c: "media" }]
    }, "Arma do Lesion e do Oryx. Flash Hider e Compensator sao quase iguais nela."),
    W("Scorpion EVO 3 A1", "SMG", "23", 1079, "40+1", ["mira", "under", "grip", "cano"], null, "Cadencia mais alta do jogo. Arma da Ela e da Denari."),
    W("K1A", "SMG", "36/40", 720, "30+1", ["mira", "under", "grip", "cano"], null, "Arma do Vigil."),
    W("Mx4 Storm", "SMG", "26/29", 948, "30+1", ["mira", "under", "cano"], null, "Sem slot de grip. Arma da Alibi."),
    W("AUG A3", "SMG", "36/40", 699, "31+1", ["mira", "under", "grip", "cano"], null, "Arma do Kaid."),
    W("P10 RONI", "SMG", "26/29", 979, "15+1", ["mira", "under", "grip", "cano"], null, "Sem slot de grip. Arma do Mozzie e da Aruni."),
    W("UZK50GI", "SMG", "36/40", 700, "22+1", ["mira", "under", "grip"], null, "SMG exclusiva da Thorn. Nao oferece opcoes de cano."),

    /* ---------------- METRALHADORAS ---------------- */
    W("6P41", "LMG", "46", 680, "100+0", ["mira", "under", "grip", "cano"], null, "Carregador de 100. Arma da Fuze e da Finka."),
    W("G8A1", "LMG", "37", 851, "50+1", ["mira", "under", "grip", "cano"], {
      mira: [{ n: "Scope 2.5x (ACOG)", p: 70, c: "alta" }],
      cano: [{ n: "Flash Hider", p: 50, c: "media" }, { n: "Compensator", p: 40, c: "media" }],
      grip: [{ n: "Vertical Grip", p: 80, c: "alta" }],
      under: [{ n: "Laser Sight", p: 55, c: "media" }]
    }, "Arma da Amaru. Versao de metralhadora do LMG-E."),
    W("M249", "LMG", "48", 650, "100+0", ["mira", "under", "grip", "cano"], null, "Sem opcoes de Muzzle Brake ou Suppressor. Arma do Striker, Capitao e Gridlock."),
    W("T-95 LSW", "LMG", "46", 650, "80+1", ["mira", "under", "grip", "cano"], null, "Arma da Ying e do Flores."),
    W("LMG-E", "LMG", "41", 720, "150+0", ["mira", "under", "grip", "cano"], {
      mira: [{ n: "Scope 2.5x (ACOG)", p: 65, c: "media" }],
      cano: [{ n: "Compensator", p: 60, c: "media" }],
      grip: [{ n: "Vertical Grip", p: 75, c: "alta" }],
      under: [{ n: "Laser Sight", p: 50, c: "media" }]
    }, "Carregador de 150. Recuo vertical ja baixo, por isso o Compensator e o favorito. Arma da Zofia e do Ram."),
    W("ALDA 5.56", "LMG", "35", 900, "80+0", ["mira", "under", "grip", "cano"], {
      mira: [{ n: "Red Dot Sight", p: 55, c: "media" }],
      cano: [{ n: "Flash Hider", p: 45, c: "media" }],
      grip: [{ n: "Horizontal Grip", p: 65, c: "media" }],
      under: [{ n: "Laser Sight", p: 45, c: "media" }]
    }, "Nao aceita Angled Grip. Caso mais claro de Horizontal Grip obrigatorio. Arma do Maestro e da Noor."),
    W("DP27", "LMG", "60", 550, "70+0", ["mira", "grip"], null, "Somente Reflex Sight D (exclusivo). Sem laser. Arma do Tachanka."),

    /* ---------------- ESCOPETAS ---------------- */
    W("M590A1", "SHOTGUN", "46/21", 87, "7+0", ["mira", "under"], null, "Escopeta de cano duplo. Dano cai muito rapido depois de 5 metros."),
    W("M1014", "SHOTGUN", "27/13", 218, "8+0", ["mira", "under"], null, "Semi-automatica. Dano subiu de 28 para 30 no patch Y11S3.1."),
    W("SG-CQB", "SHOTGUN", "42/19", 88, "7+0", ["mira", "grip", "under"], null, "Nao aceita Angled Grip. Arma da Twitch, Doc, Rook, Echo e Grim."),
    W("SASG-12", "SHOTGUN", "25/11", 348, "10+1", [], null, "Escopeta automatica. Arma do Kapkan, Finka e Fenrir."),
    W("M870", "SHOTGUN", "40/18", 102, "7+0", ["mira", "under"], null, "Nao tem slot de cano nem de grip. Arma do Sledge, Sentry, Jager, Bandit e Thorn."),
    W("Super 90", "SHOTGUN", "26/12", 219, "8+0", ["mira", "under"], null, "Arma da Frost e da Melusi."),
    W("SPAS-12", "SHOTGUN", "29/13", 218, "7+0", ["mira", "under"], null, "Nao tem slot de cano nem de grip. Arma da Valkyrie e do Oryx."),
    W("SPAS-15", "SHOTGUN", "25/11", 298, "6+1", ["mira", "under"], null, "Nao tem slot de cano nem de grip. Dano subiu de 24 para 26 no patch Y11S3.1."),
    W("SuperNova", "SHOTGUN", "46/21", 87, "7+0", ["mira", "under"], null, "Arma da Hibana, Amaru e Echo."),
    W("ITA12L", "SHOTGUN", "40/18", 88, "8+0", ["mira", "under"], null, "Dano base disputado entre fontes. Arma do Jackal, Mira e Solis."),
    W("ITA12S", "SHOTGUN", "27/13", 83, "5+0", ["mira", "under"], null, "Pistola-escopeta. Arma de Thermite, Jackal, Amaru, Frost, Melusi e Thunderbird."),
    W("SIX12", "SHOTGUN", "44/20", 219, "6+0", ["mira", "under"], null, "Dano base disputado entre fontes. Arma da Ying."),
    W("SIX12 SD", "SHOTGUN", "44/20", 218, "6+0", ["mira", "under"], null, "Arma da Nokk e da Lesion."),
    W("FO-12", "SHOTGUN", "23/26", 405, "10+1", ["mira", "grip", "cano", "under"], null, "Arma da Ela."),
    W("Super Shorty", "SHOTGUN", "33/15", 102, "3+0", ["mira", "under"], null, "Pistola-escopeta de 3 cartuchos. Arma do Sentry, Clash, Gridlock, Brava, Mozzie, Warden, Castle e Rook."),
    W("BOSG.12.2", "SHOTGUN", "125", 605, "2+0", ["mira", "grip", "under"], {
      mira: [{ n: "Scope 2.5x (ACOG)", p: 70, c: "alta" }],
      cano: [{ n: "Muzzle Brake", p: 55, c: "media" }],
      grip: [{ n: "Angled Grip", p: 55, c: "media" }],
      under: [{ n: "Laser Sight", p: 55, c: "media" }]
    }, "Balote, nao cartucho. Dano altissimo a media distancia. Arma da Dokkaebi e do Vigil."),
    W("ACS12", "SHOTGUN", "69", 298, "30+1", ["mira", "grip", "under"], null, "Balote. Nao tem opcoes de cano. Arma do Maestro e da Alibi."),
    W("TCSG12", "SHOTGUN", "75", 496, "10+1", ["mira", "grip", "cano", "under"], null, "Balote. Arma do Sentry, Kaid e Goyo."),
    W("Glaive-12", "SHOTGUN", "67", 494, "4+0", ["grip", "under"], null, "Balote exclusiva da Denari."),

    /* ---------------- ARMAS DE MARCA ---------------- */
    W("417", "MARKSMAN", "69", 444, "20+1", ["mira", "under", "grip", "cano"], null, "Arma da Twitch, Lion, Sens e Rauora."),
    W("CAMRS", "MARKSMAN", "69", 444, "20+1", ["mira", "under", "grip", "cano"], null, "A CAMRS do Brava aceita o Angled Grip em exclusivo."),
    W("SR-25", "MARKSMAN", "61", 445, "20+1", ["mira", "under", "grip", "cano"], {
      mira: [{ n: "Scope 2.5x (ACOG)", p: 75, c: "alta" }],
      cano: [{ n: "Muzzle Brake", p: 65, c: "media" }],
      grip: [{ n: "Horizontal Grip", p: 60, c: "media" }],
      under: [{ n: "Laser Sight", p: 40, c: "baixa" }]
    }, "Muitos jogadores rodam sem laser por causa do aviso visual e sonoro."),
    W("Mk 14 EBR", "MARKSMAN", "56", 444, "20+1", ["mira", "under", "grip", "cano"], null, "Telescopic Scope e Muzzle Brake exclusivos da Dokkaebi. A Aruni recebe a versao padrao."),
    W("AR-15.50", "MARKSMAN", "59", 444, "10+1", ["mira", "under", "grip", "cano"], {
      mira: [{ n: "Scope 2.5x (ACOG)", p: 65, c: "baixa" }],
      cano: [{ n: "Muzzle Brake", p: 70, c: "baixa" }],
      grip: [{ n: "Horizontal Grip", p: 65, c: "baixa" }],
      under: [{ n: "Laser Sight", p: 50, c: "baixa" }]
    }, "ATENCAO: fortement reequilibrada no Y11S3 (dano 67 -> 59, recuo aumentado, multiplicador do primeiro tiro 1.7 -> 3.7 no mouse e teclado). Build antiga pode nao ser mais a ideal."),
    W("PMR90A2", "MARKSMAN", "62", 445, "20+1", ["mira", "under", "grip", "cano"], null, "Arma do Thatcher e do Solid Snake."),
    W("OTs-03", "SNIPER", "71", 376, "15+1", ["under", "grip", "cano"], null, "Nao aceita lupao. O HDS Flip Sight e exclusivo do Glaz e permite ver atraves de fumaça."),
    W("CSRX 300", "SNIPER", "135", 63, "5+1", [], null, "Dano altissimo, mas 60% do dano vai para os membros. Arma da Kali."),

    /* ---------------- PISTOLAS E REVOLVERES ---------------- */
    W("P226 Mk 25", "PISTOL", "50", 494, "15+1", [], null, "Pistola padrao. Sem opcoes de peca no wiki."),
    W("M45 MEUSOC", "PISTOL", "58", 494, "7+1", [], {
      cano: [{ n: "Muzzle Brake", p: 75, c: "alta" }, { n: "Sem cano", p: 20, c: "baixa" }],
      under: [{ n: "Laser Sight", p: 30, c: "baixa" }]
    }, "So aceita mira de ferro. Parte da comunidade roda sem cano para manter a velocidade do projetil."),
    W("5.7 USG", "PISTOL", "42", 494, "20+1", [], null, "Pistola padrao do Sledge, Thermite, Ash, Nokk e Zero."),
    W("P9", "PISTOL", "45", 495, "16+1", [], {
      cano: [{ n: "Muzzle Brake", p: 80, c: "alta" }],
      under: [{ n: "Laser Sight", p: 65, c: "media" }]
    }, "Muzzle Brake quase universal. So aceita mira de ferro."),
    W("GSh-18", "PISTOL", "44", 495, "18+1", [], null, "Pistola do Fuze, Finka, Gridlock, Kapkan, Tachanka, Flores e Rauora."),
    W("PMM", "PISTOL", "61/63", 496, "8+1", [], null, "Dano base disputado entre fontes. Arma da Fuze, Finka, Kapkan, Tachanka e Kaid."),
    W("P12", "PISTOL", "44", 495, "15+1", [], {
      cano: [{ n: "Muzzle Brake", p: 70, c: "alta" }, { n: "Suppressor", p: 25, c: "media" }],
      under: [{ n: "Laser Sight", p: 70, c: "alta" }]
    }, "Oferece apenas Suppressor e Muzzle Brake. Arma do Blitz, Jager, Bandit, Wamai e Recruit."),
    W("Mk1 9mm", "PISTOL", "48", 493, "13+1", [], null, "Arma do Buck, Nomad, Ram, Gridlock e Frost."),
    W("D-50", "PISTOL", "71", 495, "7+1", [], null, "Dano alto. Arma da Nokk, Valkyrie e Azami."),
    W("PRB92", "PISTOL", "42", 494, "15+1", [], null, "Arma da Capitao, Nomad e Aruni."),
    W("Luison", "PISTOL", "65", 446, "12+1", [], null, "Variante silenciada da PRB92, exclusiva da Caveira, com recarga manual."),
    W("P229", "PISTOL", "51", 494, "12+1", [], null, "Arma da Hibana, Grim, Capitao, Goyo, Skopos e Denari."),
    W("USP40", "PISTOL", "48", 494, "12+1", [], null, "Arma da Brava, Jackal, Mira e Oryx."),
    W("Q-929", "PISTOL", "60", 494, "10+1", [], null, "Arma da Ying, Lesion e Thunderbird."),
    W("RG15", "PISTOL", "38", 494, "15+1", [], null, "Arma da Zofia, Ela e Melusi."),
    W("1911 TACOPS", "PISTOL", "55", 496, "8+1", [], null, "Arma do Maverick, Thorn e Noor."),
    W("P-10C", "PISTOL", "40", 494, "15+1", [], null, "Arma do Jager, Clash e Warden."),
    W(".44 Mag Semi-Auto", "PISTOL", "54", 499, "7+1", [], null, "Arma do Nomad, Gridlock e Kaid."),
    W("SDP 9mm", "PISTOL", "47", 494, "16+1", [], null, "Arma do Sledge, Sens e Mozzie."),
    W("Tacit .45", "PISTOL", "52", 495, "8+1", ["under"], null, "Pistola exclusiva do Solid Snake. Aceita laser."),
    W("LFP586", "PISTOL", "78", 494, "6+0", ["under"], null, "Revolver. Arma da Twitch, Lion, Doc, Rook, Kaid e Montagne."),
    W("Bailiff 410", "PISTOL", "27/30", 493, "5+0", ["mira", "under"], null, "Revolver da Alibi, Grim, Maestro, Oryx e Noor. Dano base disputado entre fontes. A Red Dot (variante handgun) vem presa e nao e removivel."),
    W("Keratos .357", "PISTOL", "78", 494, "6+0", [], null, "Revolver do Bandit, Wamai, Maestro e Alibi."),
    W(".44 Vendetta", "PISTOL", "78", 496, "6+0", ["under"], null, "Revolver exclusivo do Deimos."),

    /* ---------------- PISTOLAS AUTOMATICAS ---------------- */
    W("SMG-11", "PISTOL", "32/35", 1271, "16+1", ["mira", "under", "cano"], {
      mira: [{ n: "Scope 2.5x (ACOG)", p: 40, c: "media" }, { n: "Red Dot Sight", p: 40, c: "media" }],
      cano: [{ n: "Flash Hider", p: 60, c: "alta" }],
      under: [{ n: "Laser Sight", p: 65, c: "alta" }]
    }, "Sem slot de grip. Historicamente o ACOG foi liberado nessa arma por causa dos jogadores de Pro League."),
    W("Bearing 9", "PISTOL", "33/36", 1098, "25+1", ["mira", "under", "cano"], null, "Sem slot de grip. Arma do Glaz, Sledge, Hibana, Echo e Thunderbird."),
    W("C75 Auto", "PISTOL", "35", 999, "26+1", ["under", "cano"], null, "Oferece apenas Suppressor e laser. Arma do Dokkaebi, Kali, Sentry, Vigil e Thorn."),
    W("SMG-12", "PISTOL", "16", 1273, "22+1", ["mira", "under", "grip"], null, "ATENCAO: nerf pesado no Y11S3 (dano 28 -> 16, carregador 32 -> 22). Sem opcoes de cano. Arma da Dokkaebi e do Vigil."),
    W("SPSMG9", "PISTOL", "35/39", 980, "20+1", ["mira", "under", "cano"], null, "Arma da Kali e da Clash."),
    W("Reaper Mk2", "PISTOL", "31", 764, "33+1", ["under", "cano"], null, "Sem slot de mira nem de grip. Usada por Sledge, Lion, Maverick, Oryx, Sentry, Rook e Pulse."),

    /* ---------------- CORPO A CORPO / ESCUDOS / GADGET ---------------- */
    W("Faca", "MELEE", "-", "-", "-", [], null, "Corpo a corpo padrao de todos os operadores."),
    W("GONNE-6", "LAUNCHER", "10", "-", "1", [], null, "Canhao de carga moldada usado em um unico disparo."),
    W("Ballistic Shield", "SHIELD", "-", "-", "-", [], null, "Escudo principal do Montagne. Estende-se para tras e aceita uma pistola."),
    W("Flash Shield", "SHIELD", "-", "-", "-", [], null, "Escudo principal do Blitz. Estende-se para tras e aceita a P12."),
    W("M249 SAW", "LMG", "48", 650, "60+1", ["mira", "under", "grip", "cano"], null, "Variante da M249 com carregador de 60. Usada pela Gridlock.")
  ];

  /* Indice por nome (case-insensitive) */
  window.R6HUB.weaponIndex = {};
  window.R6HUB.weapons.forEach(function (w) {
    window.R6HUB.weaponIndex[w.n.toLowerCase()] = w;
  });

  /* Mapa operador -> lista de armas completas */
  window.R6HUB.operatorWeapons = function (op) {
    var res = { primary: [], secondary: [] };
    (op.p || []).forEach(function (n) {
      var w = window.R6HUB.weaponIndex[(n || "").toLowerCase()];
      if (w) res.primary.push(w);
    });
    (op.s || []).forEach(function (n) {
      var w = window.R6HUB.weaponIndex[(n || "").toLowerCase()];
      if (w) res.secondary.push(w);
    });
    return res;
  };

  /* Quais operadores usam cada arma */
  window.R6HUB.weaponOperators = function (weaponName) {
    var key = (weaponName || "").toLowerCase();
    return (window.R6HUB.operators || []).filter(function (op) {
      return (op.p || []).some(function (n) { return (n || "").toLowerCase() === key; }) ||
             (op.s || []).some(function (n) { return (n || "").toLowerCase() === key; });
    });
  };
})();
