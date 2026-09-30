/* =================================================================
   LISTA DE ARMAS
   -----------------------------------------------------------------
   O que tem aqui: as 116 armas do jogo, o efeito de cada peca e a
   estimativa de qual peca o pessoal mais usa.

   Como ler uma linha de arma:
     W("M4", "AR", "44/49", 750, "30+1", ["mira", "under", "grip", "cano"], {...}, "comentario")
        nome | tipo | dano | tiros por minuto | carregador | onde aceita peca
           | pecas mais usadas (percent = estimativa) | observacao

   AVISO IMPORTANTE: a Ubisoft nao publica os numeros de uso de peca.
   Todos os percentuais aqui sao ESTIMATIVAS da comunidade
   (guias, Reddit e jogadores profissionais).                        */
(function () {
  "use strict";
  window.R6HUB = window.R6HUB || {};

  /* Efeito de cada peca (medidos e documentados na wiki) */
  window.R6HUB.attachmentEffects = {
    "Flash Hider":          { slot: "cano",    description: "-20% de recuo vertical",            confidence: "media" },
    "Compensator":          { slot: "cano",    description: "-40% de recuo horizontal",          confidence: "media" },
    "Muzzle Brake":         { slot: "cano",    description: "-50% de recuo do primeiro tiro",    confidence: "media" },
    "Suppressor":           { slot: "cano",    description: "Silencia o tiro, sem perder dano",  confidence: "media" },
    "Extended Barrel":      { slot: "cano",    description: "+10% de dano base, queda mais lenta", confidence: "baixa" },
    "Sem cano":             { slot: "cano",    description: "Mantem o cano original da arma",     confidence: "baixa" },
    "Vertical Grip":        { slot: "grip",    description: "-20% de recuo vertical",            confidence: "alta" },
    "Angled Grip":          { slot: "grip",    description: "-20% de tempo de recarga",          confidence: "media" },
    "Horizontal Grip":      { slot: "grip",    description: "+5% de velocidade de movimento",    confidence: "media" },
    "Laser Sight":          { slot: "under",   description: "+10% de velocidade de mira (ADS)",  confidence: "alta" },
    "Scope 2.5x (ACOG)":    { slot: "mira",    description: "Luneta 2.5x, padrao de AR/LMG/DMR", confidence: "alta" },
    "Scope 1.5x (ACOG)":    { slot: "mira",    description: "Luneta 1.5x, boa para SMG e vertical", confidence: "media" },
    "Scope 2.0x":           { slot: "mira",    description: "Luneta 2.0x",                        confidence: "media" },
    "Scope 3.0x":           { slot: "mira",    description: "Luneta 3.0x",                        confidence: "media" },
    "Holographic Sight":    { slot: "mira",    description: "Mira holografica, boa de perto",     confidence: "media" },
    "Red Dot Sight":        { slot: "mira",    description: "Mira de ponto vermelho",             confidence: "media" },
    "Mironas de ferro":     { slot: "mira",    description: "Sem peca: apenas a mira original",   confidence: "alta" }
  };

  /* Meta global (estimativas da comunidade) */
  window.R6HUB.metaGlobal = {
    note: "Nenhuma fonte publica mede o uso de pecas em R6. Estes numeros sao estimativas de consenso.",
    cano: [
      { name: "Flash Hider",     percent: "45-55%", description: "Padrao em automáticas",                confidence: "media" },
      { name: "Compensator",     percent: "20-28%", description: "Fortes em armas de recuo largo",       confidence: "media" },
      { name: "Muzzle Brake",    percent: "10-14%", description: "~70-80% em pistolas, ~55-65% em DMR",  confidence: "media" },
      { name: "Sem cano",        percent: "5-8%",   description: "Minoria real (C8, M45)",               confidence: "baixa" },
      { name: "Extended Barrel", percent: "5-8%",   description: "Concentrada em C8, 416-C, AR-15.50",   confidence: "baixa" },
      { name: "Suppressor",      percent: "5-10%",  description: "Nicho: Nokk, Amaru, Ash",               confidence: "media" }
    ],
    grip: [
      { name: "Vertical Grip",   percent: "55-65%", description: "Grip dominante onde houver",           confidence: "alta" },
      { name: "Angled Grip",     percent: "20-28%", description: "M4/Maverick, BOSG, G36C",              confidence: "media" },
      { name: "Horizontal Grip", percent: "5-10%",  description: "Nicho: ALDA 5.56, SR-25, RK7",         confidence: "media" },
      { name: "Sem grip",        percent: "n/a",    description: "C8, P90, MP7, FMG-9, SMG-11 nao tem slot", confidence: "alta" }
    ],
    mira: [
      { name: "Scope 2.5x (ACOG)", percent: "30-40%", description: "Padrao onde houver lupao",           confidence: "alta" },
      { name: "1.0x / Holo",       percent: "20-25%", description: "Dominante em SMG de curto alcance",   confidence: "media" },
      { name: "Scope 1.5x (ACOG)", percent: "15-20%", description: "Forte em SMG e jogadas verticais",   confidence: "media" },
      { name: "Mironas de ferro",  percent: "5-10%",  description: "Forcado em pistolas e na C7E",        confidence: "alta" }
    ],
    under: [
      { name: "Laser Sight", percent: "55-65%", description: "Sousbarrel mais usada por larga margem", confidence: "alta" },
      { name: "Lanterna",    percent: "minimo",  description: "Praticamente fora do PvP ranqueado",    confidence: "alta" },
      { name: "Sem under",   percent: "35-45%",  description: "Superrecarregado em escopetas",         confidence: "media" }
    ]
  };

  /* Atalho para escrever uma arma em uma linha.
     type:  AR | SMG | LMG | SHOTGUN | MARKSMAN | SNIPER | PISTOL | MELEE | SHIELD | LAUNCHER
     slots: onde a arma aceita peca (mira / under / grip / cano)
     meta:  peca mais usada, com percent (estimado) e confidence (alta/media/baixa) */
  function W(name, type, damage, rpm, magazine, slots, meta, note) {
    return {
      name: name,
      type: type,
      damage: damage,
      rpm: rpm,
      magazine: magazine,
      slots: slots,
      meta: meta || null,
      note: note || ""
    };
  }

  window.R6HUB.weapons = [
    /* ---------------- RIFLES DE ASSALTO ---------------- */
    W("L85A2", "AR", "47", 669, "30+1", ["mira", "under", "grip", "cano"], {
      mira: [{ name: "Scope 2.5x (ACOG)", percent: 70, confidence: "alta" }, { name: "Scope 1.5x (ACOG)", percent: 18, confidence: "media" }],
      cano: [{ name: "Flash Hider", percent: 45, confidence: "media" }, { name: "Compensator", percent: 35, confidence: "media" }, { name: "Suppressor", percent: 10, confidence: "baixa" }],
      grip: [{ name: "Vertical Grip", percent: 80, confidence: "alta" }, { name: "Angled Grip", percent: 15, confidence: "media" }],
      under: [{ name: "Laser Sight", percent: 65, confidence: "alta" }]
    }, "Arma padrao do Sledge; recuo vertical de mid-tier, boa para entry."),
    W("AR33", "AR", "41", 748, "25+1", ["mira", "under", "grip", "cano"], null, "Arma do Thatcher e do Flores. Recuo vertical alto, mas rapida."),
    W("G36C", "AR", "38", 779, "30+1", ["mira", "under", "grip", "cano"], {
      mira: [{ name: "Scope 2.5x (ACOG)", percent: 60, confidence: "media" }, { name: "Scope 1.5x (ACOG)", percent: 25, confidence: "media" }],
      cano: [{ name: "Compensator", percent: 55, confidence: "media" }],
      grip: [{ name: "Angled Grip", percent: 45, confidence: "media" }, { name: "Vertical Grip", percent: 40, confidence: "media" }],
      under: [{ name: "Laser Sight", percent: 45, confidence: "media" }]
    }, "Recuo em losango largo. Um dos melhores rifles de entrada do Ash."),
    W("R4-C", "AR", "39", 859, "25+1", ["mira", "under", "grip", "cano"], {
      mira: [{ name: "Scope 2.5x (ACOG)", percent: 50, confidence: "media" }, { name: "Scope 1.5x (ACOG)", percent: 25, confidence: "media" }, { name: "Holographic Sight", percent: 20, confidence: "media" }],
      cano: [{ name: "Flash Hider", percent: 60, confidence: "alta" }, { name: "Compensator", percent: 20, confidence: "media" }, { name: "Suppressor", percent: 15, confidence: "media" }],
      grip: [{ name: "Vertical Grip", percent: 70, confidence: "alta" }, { name: "Angled Grip", percent: 25, confidence: "media" }],
      under: [{ name: "Laser Sight", percent: 60, confidence: "alta" }]
    }, "Arma do Ash e do Ram: cadencia alta, dano por tiro nao tao alto."),
    W("556xi", "AR", "47", 689, "30+1", ["mira", "under", "grip", "cano"], {
      mira: [{ name: "Scope 2.5x (ACOG)", percent: 65, confidence: "alta" }],
      cano: [{ name: "Flash Hider", percent: 50, confidence: "media" }, { name: "Compensator", percent: 40, confidence: "media" }],
      grip: [{ name: "Vertical Grip", percent: 75, confidence: "alta" }],
      under: [{ name: "Laser Sight", percent: 55, confidence: "media" }]
    }, "Divisao real entre Flash Hider e Compensator na comunidade. Favorita em Osa por causa da variacao de recuo."),
    W("F2", "AR", "37", 978, "25+1", ["mira", "under", "grip", "cano"], null, "Arma da Twitch e do Solid Snake: cadencia altissima, recuo vertical pesado."),
    W("AK-12", "AR", "40", 850, "30+1", ["mira", "under", "grip", "cano"], {
      mira: [{ name: "Scope 2.5x (ACOG)", percent: 70, confidence: "alta" }],
      cano: [{ name: "Flash Hider", percent: 65, confidence: "alta" }],
      grip: [{ name: "Vertical Grip", percent: 80, confidence: "alta" }],
      under: [{ name: "Laser Sight", percent: 55, confidence: "media" }]
    }, "Padrao do Fuze e do Ace. Estavel e rapida."),
    W("AUG A2", "AR", "42", 719, "30+1", ["mira", "under", "cano"], null, "Sem slot de grip. Arma da IQ e do Wamai."),
    W("552 Commando", "AR", "43/48", 690, "30+1", ["mira", "under", "grip", "cano"], {
      mira: [{ name: "Scope 2.5x (ACOG)", percent: 70, confidence: "alta" }],
      cano: [{ name: "Compensator", percent: 60, confidence: "alta" }],
      grip: [{ name: "Vertical Grip", percent: 75, confidence: "alta" }],
      under: [{ name: "Laser Sight", percent: 60, confidence: "media" }]
    }, "Recuo largo: o Compensator e o claro favorito. Dano base tambem disputado entre fontes."),
    W("416-C Carbine", "AR", "38/42", 739, "25+1", ["mira", "under", "grip", "cano"], {
      mira: [{ name: "Scope 2.5x (ACOG)", percent: 65, confidence: "alta" }],
      cano: [{ name: "Flash Hider", percent: 45, confidence: "media" }, { name: "Compensator", percent: 30, confidence: "media" }, { name: "Extended Barrel", percent: 20, confidence: "baixa" }],
      grip: [{ name: "Vertical Grip", percent: 70, confidence: "alta" }],
      under: [{ name: "Laser Sight", percent: 60, confidence: "alta" }]
    }, "O nerf do recuo vertical no patch Y11S2.2 impulsionou a arma na meta."),
    W("C8-SFW", "AR", "40/44", 837, "30+1", ["mira", "under", "cano"], {
      mira: [{ name: "Holographic Sight", percent: 50, confidence: "media" }, { name: "Scope 2.5x (ACOG)", percent: 35, confidence: "media" }],
      cano: [{ name: "Flash Hider", percent: 45, confidence: "media" }, { name: "Sem cano", percent: 25, confidence: "baixa" }, { name: "Compensator", percent: 25, confidence: "media" }],
      under: [{ name: "Laser Sight", percent: 65, confidence: "alta" }]
    }, "Nao tem slot de grip. Base da entrada do Buck."),
    W("Mk17 CQB", "AR", "44/49", 584, "20+1", [], null, "Arma exclusiva do Blackbeard. Pode ser usada junto com o H.U.L.L."),
    W("PARA-308", "AR", "47/52", 649, "30+1", ["mira", "under", "grip", "cano"], null, "Ferrolho (bolt-action) do Capitao e da Brava. Um tiro por aperto."),
    W("Type-89", "AR", "40", 848, "20+1", ["mira", "under", "grip", "cano"], {
      mira: [{ name: "Scope 2.5x (ACOG)", percent: 55, confidence: "media" }],
      cano: [{ name: "Flash Hider", percent: 50, confidence: "baixa" }, { name: "Compensator", percent: 50, confidence: "baixa" }],
      grip: [{ name: "Vertical Grip", percent: 55, confidence: "media" }, { name: "Angled Grip", percent: 30, confidence: "media" }],
      under: [{ name: "Laser Sight", percent: 50, confidence: "media" }]
    }, "Divisao 50/50 entre Flash Hider e Compensator: confianca baixa, fonte contradictoria."),
    W("C7E", "AR", "42", 799, "30+1", ["mira", "under", "grip", "cano"], {
      mira: [{ name: "Scope 1.5x (ACOG)", percent: 45, confidence: "media" }, { name: "Mironas de ferro", percent: 45, confidence: "media" }],
      cano: [{ name: "Compensator", percent: 50, confidence: "media" }],
      grip: [{ name: "Vertical Grip", percent: 60, confidence: "media" }],
      under: [{ name: "Laser Sight", percent: 50, confidence: "media" }]
    }, "Arma do Jackal. Dano base disputado entre fontes."),
    W("M762", "AR", "45", 729, "30+1", ["mira", "under", "grip", "cano"], {
      mira: [{ name: "Scope 2.5x (ACOG)", percent: 50, confidence: "media" }, { name: "Holographic Sight", percent: 30, confidence: "media" }],
      cano: [{ name: "Flash Hider", percent: 55, confidence: "media" }],
      grip: [{ name: "Vertical Grip", percent: 75, confidence: "alta" }],
      under: [{ name: "Laser Sight", percent: 50, confidence: "media" }]
    }, "Arma da Zofia. Dano alto e recuo estavel."),
    W("V308", "AR", "44", 699, "50+1", ["mira", "under", "grip", "cano"], null, "Carregador de 50 do Lion: cobre o bangalo inteiro sem recarregar."),
    W("Spear .308", "AR", "42/47", 699, "30+1", ["mira", "under", "grip", "cano"], {
      mira: [{ name: "Scope 2.5x (ACOG)", percent: 65, confidence: "media" }],
      cano: [{ name: "Compensator", percent: 60, confidence: "alta" }],
      grip: [{ name: "Horizontal Grip", percent: 60, confidence: "media" }],
      under: [{ name: "Laser Sight", percent: 50, confidence: "media" }]
    }, "Arma da Finka e da Thunderbird."),
    W("M4", "AR", "44/49", 750, "30+1", ["mira", "under", "grip", "cano"], {
      mira: [{ name: "Scope 2.5x (ACOG)", percent: 50, confidence: "media" }, { name: "Scope 1.5x (ACOG)", percent: 30, confidence: "media" }],
      cano: [{ name: "Flash Hider", percent: 55, confidence: "alta" }, { name: "Compensator", percent: 30, confidence: "media" }],
      grip: [{ name: "Vertical Grip", percent: 50, confidence: "media" }, { name: "Angled Grip", percent: 45, confidence: "media" }],
      under: [{ name: "Laser Sight", percent: 60, confidence: "alta" }]
    }, "A wiki recomenda Flash Hider em vez de Compensator por causa do recuo do primeiro tiro."),
    W("AK-74M", "AR", "44", 649, "40+1", ["mira", "under", "grip", "cano"], null, "Carregador de 40. Arma do Nomad e do Deimos."),
    W("ARX200", "AR", "47", 700, "20+1", ["mira", "under", "grip", "cano"], null, "Arma do Nomad e da Iana."),
    W("F90", "AR", "38/42", 780, "30+1", ["mira", "under", "grip", "cano"], null, "Arma da Gridlock. Recuo horizontal forte, otima para suppressao de area."),
    W("Commando 9", "AR", "36/40", 780, "25+1", ["mira", "under", "grip", "cano"], null, "Arma do Sentry, Mozzie e Noor."),
    W("SC3000K", "AR", "45/50", 800, "25+1", ["mira", "under", "grip", "cano"], {
      mira: [{ name: "Scope 2.5x (ACOG)", percent: 65, confidence: "media" }],
      cano: [{ name: "Compensator", percent: 45, confidence: "media" }, { name: "Flash Hider", percent: 40, confidence: "media" }],
      grip: [{ name: "Vertical Grip", percent: 60, confidence: "media" }, { name: "Horizontal Grip", percent: 30, confidence: "media" }],
      under: [{ name: "Laser Sight", percent: 50, confidence: "media" }]
    }, "Arma do Zero. Foi alvo de ajuste de recuo no patch Y11S2.1."),
    W("POF-9", "AR", "37/41", 739, "50+1", ["mira", "under", "grip", "cano"], null, "Arma do Sens. Carregador de 50."),
    W("PCX-33", "AR", "36/40", 744, "31+1", ["mira", "under", "grip", "cano"], null, "AR exclusiva da Skopos."),
    W("XK23", "AR", "49/54", 676, "35+1", ["mira", "under", "grip", "cano"], null, "Arma da Dokkaebi e da Rauora: dano base entre os mais altos."),

    /* ---------------- SUBMETRALHADORAS ---------------- */
    W("FMG-9", "SMG", "34/38", 799, "30+1", ["mira", "under", "cano"], {
      mira: [{ name: "Red Dot Sight", percent: 65, confidence: "alta" }],
      cano: [{ name: "Flash Hider", percent: 65, confidence: "alta" }, { name: "Suppressor", percent: 25, confidence: "media" }],
      under: [{ name: "Laser Sight", percent: 45, confidence: "media" }]
    }, "Somente automatica: Muzzle Brake e descartado. Sem slot de grip. A lupao do FMG-9 e exclusiva da Nokk."),
    W("MP5K", "SMG", "30/33", 799, "30+1", ["mira", "under", "cano"], {
      mira: [{ name: "Scope 1.5x (ACOG)", percent: 60, confidence: "media" }, { name: "Red Dot Sight", percent: 25, confidence: "media" }],
      cano: [{ name: "Flash Hider", percent: 50, confidence: "media" }],
      under: [{ name: "Laser Sight", percent: 55, confidence: "media" }]
    }, "Sem slot de grip. Consenso do Mute favorece lupao baixa."),
    W("UMP45", "SMG", "42/47", 599, "25+1", [], null, "Arma do Castle e do Pulse. Dano base disputado entre fontes."),
    W("MP5", "SMG", "27/30", 799, "30+1", ["mira", "under", "grip", "cano"], {
      mira: [{ name: "Scope 2.5x (ACOG)", percent: 45, confidence: "media" }, { name: "Scope 1.5x (ACOG)", percent: 35, confidence: "media" }],
      cano: [{ name: "Flash Hider", percent: 50, confidence: "media" }, { name: "Compensator", percent: 40, confidence: "media" }],
      grip: [{ name: "Vertical Grip", percent: 80, confidence: "alta" }],
      under: [{ name: "Laser Sight", percent: 60, confidence: "alta" }]
    }, "Arma do Doc e do Rook."),
    W("P90", "SMG", "22/24", 968, "50+1", ["mira", "under", "cano"], {
      mira: [{ name: "Scope 1.5x (ACOG)", percent: 50, confidence: "media" }, { name: "Scope 2.5x (ACOG)", percent: 30, confidence: "media" }],
      cano: [{ name: "Flash Hider", percent: 50, confidence: "media" }],
      under: [{ name: "Laser Sight", percent: 50, confidence: "media" }]
    }, "Sem slot de grip. Dano por tiro baixo, mas cadencia absurda."),
    W("9x19VSN", "SMG", "34/38", 749, "30+1", ["mira", "under", "grip", "cano"], {
      mira: [{ name: "Scope 1.5x (ACOG)", percent: 50, confidence: "media" }, { name: "Red Dot Sight", percent: 30, confidence: "media" }],
      cano: [{ name: "Compensator", percent: 60, confidence: "alta" }],
      grip: [{ name: "Vertical Grip", percent: 80, confidence: "alta" }],
      under: [{ name: "Laser Sight", percent: 55, confidence: "media" }]
    }, "Recuo em losango largo: Compensator e o favorito claro. Arma do Kapkan, Tachanka e Azami."),
    W("MP7", "SMG", "32/35", 899, "30+1", ["mira", "under", "cano"], {
      mira: [{ name: "Scope 1.5x (ACOG)", percent: 40, confidence: "media" }, { name: "Red Dot Sight", percent: 30, confidence: "media" }],
      cano: [{ name: "Flash Hider", percent: 60, confidence: "alta" }],
      under: [{ name: "Laser Sight", percent: 55, confidence: "media" }]
    }, "Sem slot de grip. A lupao do MP7 e exclusiva do Zero."),
    W("9mm C1", "SMG", "36/40", 575, "34+1", ["mira", "under", "grip", "cano"], null, "Arma da Frost."),
    W("MPX", "SMG", "26/29", 830, "30+1", ["mira", "under", "grip", "cano"], null, "Sem slot de grip. Arma da Valkyrie, Warden e Tubarao."),
    W("M12", "SMG", "42/47", 550, "30+1", [], null, "Arma do Sledge e da Caveira. Dano base subiu de 40 para 42 no patch Y11S1.1."),
    W("MP5SD", "SMG", "30", 800, "30+1", ["mira", "under", "grip"], null, "Silenciada de fabrica. Sem opcoes de cano. Arma do Echo."),
    W("PDW9", "SMG", "34/38", 799, "50+1", ["mira", "under", "grip", "cano"], null, "Arma do Jackal e da Osa."),
    W("Vector .45 ACP", "SMG", "23/25", 1200, "25+1", ["mira", "under", "grip", "cano"], {
      mira: [{ name: "Red Dot Sight", percent: 50, confidence: "media" }, { name: "Scope 2.5x (ACOG)", percent: 30, confidence: "media" }],
      cano: [{ name: "Compensator", percent: 50, confidence: "media" }, { name: "Flash Hider", percent: 35, confidence: "media" }],
      grip: [{ name: "Vertical Grip", percent: 75, confidence: "alta" }],
      under: [{ name: "Laser Sight", percent: 55, confidence: "media" }]
    }, "A Vector do Goyo e a unica que aceita lupao ampliada."),
    W("T-5 SMG", "SMG", "28/31", 899, "30+1", ["mira", "under", "grip", "cano"], {
      mira: [{ name: "Mironas de ferro", percent: 40, confidence: "media" }, { name: "Red Dot Sight", percent: 40, confidence: "media" }],
      cano: [{ name: "Flash Hider", percent: 45, confidence: "media" }],
      grip: [{ name: "Vertical Grip", percent: 80, confidence: "alta" }],
      under: [{ name: "Laser Sight", percent: 55, confidence: "media" }]
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
      mira: [{ name: "Scope 2.5x (ACOG)", percent: 70, confidence: "alta" }],
      cano: [{ name: "Flash Hider", percent: 50, confidence: "media" }, { name: "Compensator", percent: 40, confidence: "media" }],
      grip: [{ name: "Vertical Grip", percent: 80, confidence: "alta" }],
      under: [{ name: "Laser Sight", percent: 55, confidence: "media" }]
    }, "Arma da Amaru. Versao de metralhadora do LMG-E."),
    W("M249", "LMG", "48", 650, "100+0", ["mira", "under", "grip", "cano"], null, "Sem opcoes de Muzzle Brake ou Suppressor. Arma do Striker, Capitao e Gridlock."),
    W("T-95 LSW", "LMG", "46", 650, "80+1", ["mira", "under", "grip", "cano"], null, "Arma da Ying e do Flores."),
    W("LMG-E", "LMG", "41", 720, "150+0", ["mira", "under", "grip", "cano"], {
      mira: [{ name: "Scope 2.5x (ACOG)", percent: 65, confidence: "media" }],
      cano: [{ name: "Compensator", percent: 60, confidence: "media" }],
      grip: [{ name: "Vertical Grip", percent: 75, confidence: "alta" }],
      under: [{ name: "Laser Sight", percent: 50, confidence: "media" }]
    }, "Carregador de 150. Recuo vertical ja baixo, por isso o Compensator e o favorito. Arma da Zofia e do Ram."),
    W("ALDA 5.56", "LMG", "35", 900, "80+0", ["mira", "under", "grip", "cano"], {
      mira: [{ name: "Red Dot Sight", percent: 55, confidence: "media" }],
      cano: [{ name: "Flash Hider", percent: 45, confidence: "media" }],
      grip: [{ name: "Horizontal Grip", percent: 65, confidence: "media" }],
      under: [{ name: "Laser Sight", percent: 45, confidence: "media" }]
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
      mira: [{ name: "Scope 2.5x (ACOG)", percent: 70, confidence: "alta" }],
      cano: [{ name: "Muzzle Brake", percent: 55, confidence: "media" }],
      grip: [{ name: "Angled Grip", percent: 55, confidence: "media" }],
      under: [{ name: "Laser Sight", percent: 55, confidence: "media" }]
    }, "Balote, nao cartucho. Dano altissimo a media distancia. Arma da Dokkaebi e do Vigil."),
    W("ACS12", "SHOTGUN", "69", 298, "30+1", ["mira", "grip", "under"], null, "Balote. Nao tem opcoes de cano. Arma do Maestro e da Alibi."),
    W("TCSG12", "SHOTGUN", "75", 496, "10+1", ["mira", "grip", "cano", "under"], null, "Balote. Arma do Sentry, Kaid e Goyo."),
    W("Glaive-12", "SHOTGUN", "67", 494, "4+0", ["grip", "under"], null, "Balote exclusiva da Denari."),

    /* ---------------- ARMAS DE MARCA ---------------- */
    W("417", "MARKSMAN", "69", 444, "20+1", ["mira", "under", "grip", "cano"], null, "Arma da Twitch, Lion, Sens e Rauora."),
    W("CAMRS", "MARKSMAN", "69", 444, "20+1", ["mira", "under", "grip", "cano"], null, "A CAMRS do Brava aceita o Angled Grip em exclusivo."),
    W("SR-25", "MARKSMAN", "61", 445, "20+1", ["mira", "under", "grip", "cano"], {
      mira: [{ name: "Scope 2.5x (ACOG)", percent: 75, confidence: "alta" }],
      cano: [{ name: "Muzzle Brake", percent: 65, confidence: "media" }],
      grip: [{ name: "Horizontal Grip", percent: 60, confidence: "media" }],
      under: [{ name: "Laser Sight", percent: 40, confidence: "baixa" }]
    }, "Muitos jogadores rodam sem laser por causa do aviso visual e sonoro."),
    W("Mk 14 EBR", "MARKSMAN", "56", 444, "20+1", ["mira", "under", "grip", "cano"], null, "Telescopic Scope e Muzzle Brake exclusivos da Dokkaebi. A Aruni recebe a versao padrao."),
    W("AR-15.50", "MARKSMAN", "59", 444, "10+1", ["mira", "under", "grip", "cano"], {
      mira: [{ name: "Scope 2.5x (ACOG)", percent: 65, confidence: "baixa" }],
      cano: [{ name: "Muzzle Brake", percent: 70, confidence: "baixa" }],
      grip: [{ name: "Horizontal Grip", percent: 65, confidence: "baixa" }],
      under: [{ name: "Laser Sight", percent: 50, confidence: "baixa" }]
    }, "ATENCAO: fortement reequilibrada no Y11S3 (dano 67 -> 59, recuo aumentado, multiplicador do primeiro tiro 1.7 -> 3.7 no mouse e teclado). Build antiga pode nao ser mais a ideal."),
    W("PMR90A2", "MARKSMAN", "62", 445, "20+1", ["mira", "under", "grip", "cano"], null, "Arma do Thatcher e do Solid Snake."),
    W("OTs-03", "SNIPER", "71", 376, "15+1", ["under", "grip", "cano"], null, "Nao aceita lupao. O HDS Flip Sight e exclusivo do Glaz e permite ver atraves de fumaça."),
    W("CSRX 300", "SNIPER", "135", 63, "5+1", [], null, "Dano altissimo, mas 60% do dano vai para os membros. Arma da Kali."),

    /* ---------------- PISTOLAS E REVOLVERES ---------------- */
    W("P226 Mk 25", "PISTOL", "50", 494, "15+1", [], null, "Pistola padrao. Sem opcoes de peca no wiki."),
    W("M45 MEUSOC", "PISTOL", "58", 494, "7+1", [], {
      cano: [{ name: "Muzzle Brake", percent: 75, confidence: "alta" }, { name: "Sem cano", percent: 20, confidence: "baixa" }],
      under: [{ name: "Laser Sight", percent: 30, confidence: "baixa" }]
    }, "So aceita mira de ferro. Parte da comunidade roda sem cano para manter a velocidade do projetil."),
    W("5.7 USG", "PISTOL", "42", 494, "20+1", [], null, "Pistola padrao do Sledge, Thermite, Ash, Nokk e Zero."),
    W("P9", "PISTOL", "45", 495, "16+1", [], {
      cano: [{ name: "Muzzle Brake", percent: 80, confidence: "alta" }],
      under: [{ name: "Laser Sight", percent: 65, confidence: "media" }]
    }, "Muzzle Brake quase universal. So aceita mira de ferro."),
    W("GSh-18", "PISTOL", "44", 495, "18+1", [], null, "Pistola do Fuze, Finka, Gridlock, Kapkan, Tachanka, Flores e Rauora."),
    W("PMM", "PISTOL", "61/63", 496, "8+1", [], null, "Dano base disputado entre fontes. Arma da Fuze, Finka, Kapkan, Tachanka e Kaid."),
    W("P12", "PISTOL", "44", 495, "15+1", [], {
      cano: [{ name: "Muzzle Brake", percent: 70, confidence: "alta" }, { name: "Suppressor", percent: 25, confidence: "media" }],
      under: [{ name: "Laser Sight", percent: 70, confidence: "alta" }]
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
      mira: [{ name: "Scope 2.5x (ACOG)", percent: 40, confidence: "media" }, { name: "Red Dot Sight", percent: 40, confidence: "media" }],
      cano: [{ name: "Flash Hider", percent: 60, confidence: "alta" }],
      under: [{ name: "Laser Sight", percent: 65, confidence: "alta" }]
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

  /* ------------------------------------------------------------
     Funcoes auxiliares usadas pelo site.
     Nao precisa mexer aqui a nao ser para mudar a regra de busca. */

  /* Indice por nome em minusculas, para achar a arma sem diferenciar maiuscula. */
  window.R6HUB.weaponIndex = {};
  window.R6HUB.weapons.forEach(function (arma) {
    window.R6HUB.weaponIndex[arma.name.toLowerCase()] = arma;
  });

  /* Recebe um Operador e devolve as armas dele, ja com os dados completos. */
  window.R6HUB.operatorWeapons = function (operador) {
    var resultado = { primary: [], secondary: [] };
    (operador.primaryWeapons || []).forEach(function (nomeDaArma) {
      var arma = window.R6HUB.weaponIndex[(nomeDaArma || "").toLowerCase()];
      if (arma) resultado.primary.push(arma);
    });
    (operador.secondaryWeapons || []).forEach(function (nomeDaArma) {
      var arma = window.R6HUB.weaponIndex[(nomeDaArma || "").toLowerCase()];
      if (arma) resultado.secondary.push(arma);
    });
    return resultado;
  };

  /* Recebe o nome de uma arma e devolve quais Operadores a usam. */
  window.R6HUB.weaponOperators = function (nomeDaArma) {
    var procurado = (nomeDaArma || "").toLowerCase();
    return (window.R6HUB.operators || []).filter(function (operador) {
      var usaComoPrincipal = (operador.primaryWeapons || []).some(function (nome) {
        return (nome || "").toLowerCase() === procurado;
      });
      var usaComoSecundaria = (operador.secondaryWeapons || []).some(function (nome) {
        return (nome || "").toLowerCase() === procurado;
      });
      return usaComoPrincipal || usaComoSecundaria;
    });
  };
})();
