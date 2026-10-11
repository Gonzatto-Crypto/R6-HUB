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
    "Flash Hider":          { slot: "cano",    description: "-20% vertical recoil",              confidence: "media" },
    "Compensator":          { slot: "cano",    description: "-40% horizontal recoil",            confidence: "media" },
    "Muzzle Brake":         { slot: "cano",    description: "-50% first-shot recoil",            confidence: "media" },
    "Suppressor":           { slot: "cano",    description: "Silences the shot, no damage loss",  confidence: "media" },
    "Extended Barrel":      { slot: "cano",    description: "+10% base damage, slower drop-off", confidence: "baixa" },
    "No Barrel":            { slot: "cano",    description: "Keeps the weapon's original barrel", confidence: "baixa" },
    "Vertical Grip":        { slot: "grip",    description: "-20% vertical recoil",              confidence: "alta" },
    "Angled Grip":          { slot: "grip",    description: "-20% reload time",                  confidence: "media" },
    "Horizontal Grip":      { slot: "grip",    description: "+5% movement speed",                confidence: "media" },
    "Laser Sight":          { slot: "under",   description: "+10% aim-down-sights (ADS) speed",  confidence: "alta" },
    "Scope 2.5x (ACOG)":    { slot: "mira",    description: "2.5x scope, standard on AR/LMG/DMR", confidence: "alta" },
    "Scope 1.5x (ACOG)":    { slot: "mira",    description: "1.5x scope, good for SMG and vertical play", confidence: "media" },
    "Scope 2.0x":           { slot: "mira",    description: "2.0x scope",                        confidence: "media" },
    "Scope 3.0x":           { slot: "mira",    description: "3.0x scope",                        confidence: "media" },
    "Holographic Sight":    { slot: "mira",    description: "Holographic sight, good up close",   confidence: "media" },
    "Red Dot Sight":        { slot: "mira",    description: "Red dot sight",                      confidence: "media" },
    "Iron Sights":          { slot: "mira",    description: "No attachment: just the stock sights", confidence: "alta" }
  };

  /* Meta global (estimativas da comunidade) */
  window.R6HUB.metaGlobal = {
    note: "No public source measures attachment usage in R6. These numbers are community-consensus estimates.",
    cano: [
      { name: "Flash Hider",     percent: "45-55%", description: "Standard on automatics",               confidence: "media" },
      { name: "Compensator",     percent: "20-28%", description: "Strong on wide-recoil weapons",        confidence: "media" },
      { name: "Muzzle Brake",    percent: "10-14%", description: "~70-80% on pistols, ~55-65% on DMR",   confidence: "media" },
      { name: "No Barrel",       percent: "5-8%",   description: "A real minority (C8, M45)",            confidence: "baixa" },
      { name: "Extended Barrel", percent: "5-8%",   description: "Concentrated on C8, 416-C, AR-15.50",  confidence: "baixa" },
      { name: "Suppressor",      percent: "5-10%",  description: "Niche: Nokk, Amaru, Ash",              confidence: "media" }
    ],
    grip: [
      { name: "Vertical Grip",   percent: "55-65%", description: "Dominant grip where available",        confidence: "alta" },
      { name: "Angled Grip",     percent: "20-28%", description: "M4/Maverick, BOSG, G36C",              confidence: "media" },
      { name: "Horizontal Grip", percent: "5-10%",  description: "Niche: ALDA 5.56, SR-25, RK7",         confidence: "media" },
      { name: "No Grip",         percent: "n/a",    description: "C8, P90, MP7, FMG-9, SMG-11 have no slot", confidence: "alta" }
    ],
    mira: [
      { name: "Scope 2.5x (ACOG)", percent: "30-40%", description: "Standard where a scope is available",   confidence: "alta" },
      { name: "1.0x / Holo",       percent: "20-25%", description: "Dominant on short-range SMGs",          confidence: "media" },
      { name: "Scope 1.5x (ACOG)", percent: "15-20%", description: "Strong on SMGs and vertical plays",     confidence: "media" },
      { name: "Iron Sights",       percent: "5-10%",  description: "Forced on pistols and the C7E",         confidence: "alta" }
    ],
    under: [
      { name: "Laser Sight", percent: "55-65%", description: "Most-used under-barrel by a wide margin", confidence: "alta" },
      { name: "Flashlight",  percent: "minimal",  description: "Practically absent from ranked PvP",      confidence: "alta" },
      { name: "No Under-Barrel", percent: "35-45%",  description: "Over-represented on shotguns",        confidence: "media" }
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
    }, "Sledge's default weapon; mid-tier vertical recoil, good for entry."),
    W("AR33", "AR", "41", 748, "25+1", ["mira", "under", "grip", "cano"], null, "Thatcher and Flores' weapon. High vertical recoil, but fast."),
    W("G36C", "AR", "38", 779, "30+1", ["mira", "under", "grip", "cano"], {
      mira: [{ name: "Scope 2.5x (ACOG)", percent: 60, confidence: "media" }, { name: "Scope 1.5x (ACOG)", percent: 25, confidence: "media" }],
      cano: [{ name: "Compensator", percent: 55, confidence: "media" }],
      grip: [{ name: "Angled Grip", percent: 45, confidence: "media" }, { name: "Vertical Grip", percent: 40, confidence: "media" }],
      under: [{ name: "Laser Sight", percent: 45, confidence: "media" }]
    }, "Wide diamond-shaped recoil. One of Ash's best entry rifles."),
    W("R4-C", "AR", "39", 859, "25+1", ["mira", "under", "grip", "cano"], {
      mira: [{ name: "Scope 2.5x (ACOG)", percent: 50, confidence: "media" }, { name: "Scope 1.5x (ACOG)", percent: 25, confidence: "media" }, { name: "Holographic Sight", percent: 20, confidence: "media" }],
      cano: [{ name: "Flash Hider", percent: 60, confidence: "alta" }, { name: "Compensator", percent: 20, confidence: "media" }, { name: "Suppressor", percent: 15, confidence: "media" }],
      grip: [{ name: "Vertical Grip", percent: 70, confidence: "alta" }, { name: "Angled Grip", percent: 25, confidence: "media" }],
      under: [{ name: "Laser Sight", percent: 60, confidence: "alta" }]
    }, "Ash and Ram's weapon: high rate of fire, not-so-high damage per shot."),
    W("556xi", "AR", "47", 689, "30+1", ["mira", "under", "grip", "cano"], {
      mira: [{ name: "Scope 2.5x (ACOG)", percent: 65, confidence: "alta" }],
      cano: [{ name: "Flash Hider", percent: 50, confidence: "media" }, { name: "Compensator", percent: 40, confidence: "media" }],
      grip: [{ name: "Vertical Grip", percent: 75, confidence: "alta" }],
      under: [{ name: "Laser Sight", percent: 55, confidence: "media" }]
    }, "A real community split between Flash Hider and Compensator. Favored on Osa because of the recoil variation."),
    W("F2", "AR", "37", 978, "25+1", ["mira", "under", "grip", "cano"], null, "Twitch and Solid Snake's weapon: extremely high rate of fire, heavy vertical recoil."),
    W("AK-12", "AR", "40", 850, "30+1", ["mira", "under", "grip", "cano"], {
      mira: [{ name: "Scope 2.5x (ACOG)", percent: 70, confidence: "alta" }],
      cano: [{ name: "Flash Hider", percent: 65, confidence: "alta" }],
      grip: [{ name: "Vertical Grip", percent: 80, confidence: "alta" }],
      under: [{ name: "Laser Sight", percent: 55, confidence: "media" }]
    }, "Fuze and Ace's default. Stable and fast."),
    W("AUG A2", "AR", "42", 719, "30+1", ["mira", "under", "cano"], null, "No grip slot. IQ and Wamai's weapon."),
    W("552 Commando", "AR", "43/48", 690, "30+1", ["mira", "under", "grip", "cano"], {
      mira: [{ name: "Scope 2.5x (ACOG)", percent: 70, confidence: "alta" }],
      cano: [{ name: "Compensator", percent: 60, confidence: "alta" }],
      grip: [{ name: "Vertical Grip", percent: 75, confidence: "alta" }],
      under: [{ name: "Laser Sight", percent: 60, confidence: "media" }]
    }, "Wide recoil: the Compensator is the clear favorite. Base damage is also disputed among sources."),
    W("416-C Carbine", "AR", "38/42", 739, "25+1", ["mira", "under", "grip", "cano"], {
      mira: [{ name: "Scope 2.5x (ACOG)", percent: 65, confidence: "alta" }],
      cano: [{ name: "Flash Hider", percent: 45, confidence: "media" }, { name: "Compensator", percent: 30, confidence: "media" }, { name: "Extended Barrel", percent: 20, confidence: "baixa" }],
      grip: [{ name: "Vertical Grip", percent: 70, confidence: "alta" }],
      under: [{ name: "Laser Sight", percent: 60, confidence: "alta" }]
    }, "The vertical recoil nerf in patch Y11S2.2 pushed the weapon into the meta."),
    W("C8-SFW", "AR", "40/44", 837, "30+1", ["mira", "under", "cano"], {
      mira: [{ name: "Holographic Sight", percent: 50, confidence: "media" }, { name: "Scope 2.5x (ACOG)", percent: 35, confidence: "media" }],
      cano: [{ name: "Flash Hider", percent: 45, confidence: "media" }, { name: "No Barrel", percent: 25, confidence: "baixa" }, { name: "Compensator", percent: 25, confidence: "media" }],
      under: [{ name: "Laser Sight", percent: 65, confidence: "alta" }]
    }, "No grip slot. The backbone of Buck's entry."),
    W("Mk17 CQB", "AR", "44/49", 584, "20+1", [], null, "Blackbeard's exclusive weapon. Can be used alongside the H.U.L.L."),
    W("PARA-308", "AR", "47/52", 649, "30+1", ["mira", "under", "grip", "cano"], null, "Capitao and Brava's bolt-action. One shot per trigger pull."),
    W("Type-89", "AR", "40", 848, "20+1", ["mira", "under", "grip", "cano"], {
      mira: [{ name: "Scope 2.5x (ACOG)", percent: 55, confidence: "media" }],
      cano: [{ name: "Flash Hider", percent: 50, confidence: "baixa" }, { name: "Compensator", percent: 50, confidence: "baixa" }],
      grip: [{ name: "Vertical Grip", percent: 55, confidence: "media" }, { name: "Angled Grip", percent: 30, confidence: "media" }],
      under: [{ name: "Laser Sight", percent: 50, confidence: "media" }]
    }, "50/50 split between Flash Hider and Compensator: low confidence, conflicting sources."),
    W("C7E", "AR", "42", 799, "30+1", ["mira", "under", "grip", "cano"], {
      mira: [{ name: "Scope 1.5x (ACOG)", percent: 45, confidence: "media" }, { name: "Iron Sights", percent: 45, confidence: "media" }],
      cano: [{ name: "Compensator", percent: 50, confidence: "media" }],
      grip: [{ name: "Vertical Grip", percent: 60, confidence: "media" }],
      under: [{ name: "Laser Sight", percent: 50, confidence: "media" }]
    }, "Jackal's weapon. Base damage disputed among sources."),
    W("M762", "AR", "45", 729, "30+1", ["mira", "under", "grip", "cano"], {
      mira: [{ name: "Scope 2.5x (ACOG)", percent: 50, confidence: "media" }, { name: "Holographic Sight", percent: 30, confidence: "media" }],
      cano: [{ name: "Flash Hider", percent: 55, confidence: "media" }],
      grip: [{ name: "Vertical Grip", percent: 75, confidence: "alta" }],
      under: [{ name: "Laser Sight", percent: 50, confidence: "media" }]
    }, "Zofia's weapon. High damage and stable recoil."),
    W("V308", "AR", "44", 699, "50+1", ["mira", "under", "grip", "cano"], null, "Lion's 50-round magazine: covers the whole bungalow without reloading."),
    W("Spear .308", "AR", "42/47", 699, "30+1", ["mira", "under", "grip", "cano"], {
      mira: [{ name: "Scope 2.5x (ACOG)", percent: 65, confidence: "media" }],
      cano: [{ name: "Compensator", percent: 60, confidence: "alta" }],
      grip: [{ name: "Horizontal Grip", percent: 60, confidence: "media" }],
      under: [{ name: "Laser Sight", percent: 50, confidence: "media" }]
    }, "Finka and Thunderbird's weapon."),
    W("M4", "AR", "44/49", 750, "30+1", ["mira", "under", "grip", "cano"], {
      mira: [{ name: "Scope 2.5x (ACOG)", percent: 50, confidence: "media" }, { name: "Scope 1.5x (ACOG)", percent: 30, confidence: "media" }],
      cano: [{ name: "Flash Hider", percent: 55, confidence: "alta" }, { name: "Compensator", percent: 30, confidence: "media" }],
      grip: [{ name: "Vertical Grip", percent: 50, confidence: "media" }, { name: "Angled Grip", percent: 45, confidence: "media" }],
      under: [{ name: "Laser Sight", percent: 60, confidence: "alta" }]
    }, "The wiki recommends Flash Hider over Compensator because of first-shot recoil."),
    W("AK-74M", "AR", "44", 649, "40+1", ["mira", "under", "grip", "cano"], null, "40-round magazine. Nomad and Deimos' weapon."),
    W("ARX200", "AR", "47", 700, "20+1", ["mira", "under", "grip", "cano"], null, "Nomad and Iana's weapon."),
    W("F90", "AR", "38/42", 780, "30+1", ["mira", "under", "grip", "cano"], null, "Gridlock's weapon. Strong horizontal recoil, great for area suppression."),
    W("Commando 9", "AR", "36/40", 780, "25+1", ["mira", "under", "grip", "cano"], null, "Sentry, Mozzie and Noor's weapon."),
    W("SC3000K", "AR", "45/50", 800, "25+1", ["mira", "under", "grip", "cano"], {
      mira: [{ name: "Scope 2.5x (ACOG)", percent: 65, confidence: "media" }],
      cano: [{ name: "Compensator", percent: 45, confidence: "media" }, { name: "Flash Hider", percent: 40, confidence: "media" }],
      grip: [{ name: "Vertical Grip", percent: 60, confidence: "media" }, { name: "Horizontal Grip", percent: 30, confidence: "media" }],
      under: [{ name: "Laser Sight", percent: 50, confidence: "media" }]
    }, "Zero's weapon. It received a recoil adjustment in patch Y11S2.1."),
    W("POF-9", "AR", "37/41", 739, "50+1", ["mira", "under", "grip", "cano"], null, "Sens' weapon. 50-round magazine."),
    W("PCX-33", "AR", "36/40", 744, "31+1", ["mira", "under", "grip", "cano"], null, "Skopos' exclusive AR."),
    W("XK23", "AR", "49/54", 676, "35+1", ["mira", "under", "grip", "cano"], null, "Dokkaebi and Rauora's weapon: among the highest base damage."),

    /* ---------------- SUBMETRALHADORAS ---------------- */
    W("FMG-9", "SMG", "34/38", 799, "30+1", ["mira", "under", "cano"], {
      mira: [{ name: "Red Dot Sight", percent: 65, confidence: "alta" }],
      cano: [{ name: "Flash Hider", percent: 65, confidence: "alta" }, { name: "Suppressor", percent: 25, confidence: "media" }],
      under: [{ name: "Laser Sight", percent: 45, confidence: "media" }]
    }, "Full-auto only: Muzzle Brake is ruled out. No grip slot. The FMG-9's scope is exclusive to Nokk."),
    W("MP5K", "SMG", "30/33", 799, "30+1", ["mira", "under", "cano"], {
      mira: [{ name: "Scope 1.5x (ACOG)", percent: 60, confidence: "media" }, { name: "Red Dot Sight", percent: 25, confidence: "media" }],
      cano: [{ name: "Flash Hider", percent: 50, confidence: "media" }],
      under: [{ name: "Laser Sight", percent: 55, confidence: "media" }]
    }, "No grip slot. The Mute consensus favors a low-power scope."),
    W("UMP45", "SMG", "42/47", 599, "25+1", [], null, "Castle and Pulse's weapon. Base damage disputed among sources."),
    W("MP5", "SMG", "27/30", 799, "30+1", ["mira", "under", "grip", "cano"], {
      mira: [{ name: "Scope 2.5x (ACOG)", percent: 45, confidence: "media" }, { name: "Scope 1.5x (ACOG)", percent: 35, confidence: "media" }],
      cano: [{ name: "Flash Hider", percent: 50, confidence: "media" }, { name: "Compensator", percent: 40, confidence: "media" }],
      grip: [{ name: "Vertical Grip", percent: 80, confidence: "alta" }],
      under: [{ name: "Laser Sight", percent: 60, confidence: "alta" }]
    }, "Doc and Rook's weapon."),
    W("P90", "SMG", "22/24", 968, "50+1", ["mira", "under", "cano"], {
      mira: [{ name: "Scope 1.5x (ACOG)", percent: 50, confidence: "media" }, { name: "Scope 2.5x (ACOG)", percent: 30, confidence: "media" }],
      cano: [{ name: "Flash Hider", percent: 50, confidence: "media" }],
      under: [{ name: "Laser Sight", percent: 50, confidence: "media" }]
    }, "No grip slot. Low damage per shot, but an absurd rate of fire."),
    W("9x19VSN", "SMG", "34/38", 749, "30+1", ["mira", "under", "grip", "cano"], {
      mira: [{ name: "Scope 1.5x (ACOG)", percent: 50, confidence: "media" }, { name: "Red Dot Sight", percent: 30, confidence: "media" }],
      cano: [{ name: "Compensator", percent: 60, confidence: "alta" }],
      grip: [{ name: "Vertical Grip", percent: 80, confidence: "alta" }],
      under: [{ name: "Laser Sight", percent: 55, confidence: "media" }]
    }, "Wide diamond-shaped recoil: Compensator is the clear favorite. Kapkan, Tachanka and Azami's weapon."),
    W("MP7", "SMG", "32/35", 899, "30+1", ["mira", "under", "cano"], {
      mira: [{ name: "Scope 1.5x (ACOG)", percent: 40, confidence: "media" }, { name: "Red Dot Sight", percent: 30, confidence: "media" }],
      cano: [{ name: "Flash Hider", percent: 60, confidence: "alta" }],
      under: [{ name: "Laser Sight", percent: 55, confidence: "media" }]
    }, "No grip slot. The MP7's scope is exclusive to Zero."),
    W("9mm C1", "SMG", "36/40", 575, "34+1", ["mira", "under", "grip", "cano"], null, "Frost's weapon."),
    W("MPX", "SMG", "26/29", 830, "30+1", ["mira", "under", "grip", "cano"], null, "No grip slot. Valkyrie, Warden and Tubarao's weapon."),
    W("M12", "SMG", "42/47", 550, "30+1", [], null, "Sledge and Caveira's weapon. Base damage increased from 40 to 42 in patch Y11S1.1."),
    W("MP5SD", "SMG", "30", 800, "30+1", ["mira", "under", "grip"], null, "Factory-suppressed. No barrel options. Echo's weapon."),
    W("PDW9", "SMG", "34/38", 799, "50+1", ["mira", "under", "grip", "cano"], null, "Jackal and Osa's weapon."),
    W("Vector .45 ACP", "SMG", "23/25", 1200, "25+1", ["mira", "under", "grip", "cano"], {
      mira: [{ name: "Red Dot Sight", percent: 50, confidence: "media" }, { name: "Scope 2.5x (ACOG)", percent: 30, confidence: "media" }],
      cano: [{ name: "Compensator", percent: 50, confidence: "media" }, { name: "Flash Hider", percent: 35, confidence: "media" }],
      grip: [{ name: "Vertical Grip", percent: 75, confidence: "alta" }],
      under: [{ name: "Laser Sight", percent: 55, confidence: "media" }]
    }, "Goyo's Vector is the only one that accepts a magnified scope."),
    W("T-5 SMG", "SMG", "28/31", 899, "30+1", ["mira", "under", "grip", "cano"], {
      mira: [{ name: "Iron Sights", percent: 40, confidence: "media" }, { name: "Red Dot Sight", percent: 40, confidence: "media" }],
      cano: [{ name: "Flash Hider", percent: 45, confidence: "media" }],
      grip: [{ name: "Vertical Grip", percent: 80, confidence: "alta" }],
      under: [{ name: "Laser Sight", percent: 55, confidence: "media" }]
    }, "Lesion and Oryx's weapon. Flash Hider and Compensator are nearly equal on it."),
    W("Scorpion EVO 3 A1", "SMG", "23", 1079, "40+1", ["mira", "under", "grip", "cano"], null, "Highest rate of fire in the game. Ela and Denari's weapon."),
    W("K1A", "SMG", "36/40", 720, "30+1", ["mira", "under", "grip", "cano"], null, "Vigil's weapon."),
    W("Mx4 Storm", "SMG", "26/29", 948, "30+1", ["mira", "under", "cano"], null, "No grip slot. Alibi's weapon."),
    W("AUG A3", "SMG", "36/40", 699, "31+1", ["mira", "under", "grip", "cano"], null, "Kaid's weapon."),
    W("P10 RONI", "SMG", "26/29", 979, "15+1", ["mira", "under", "grip", "cano"], null, "No grip slot. Mozzie and Aruni's weapon."),
    W("UZK50GI", "SMG", "36/40", 700, "22+1", ["mira", "under", "grip"], null, "Thorn's exclusive SMG. No barrel options."),

    /* ---------------- METRALHADORAS ---------------- */
    W("6P41", "LMG", "46", 680, "100+0", ["mira", "under", "grip", "cano"], null, "100-round magazine. Fuze and Finka's weapon."),
    W("G8A1", "LMG", "37", 851, "50+1", ["mira", "under", "grip", "cano"], {
      mira: [{ name: "Scope 2.5x (ACOG)", percent: 70, confidence: "alta" }],
      cano: [{ name: "Flash Hider", percent: 50, confidence: "media" }, { name: "Compensator", percent: 40, confidence: "media" }],
      grip: [{ name: "Vertical Grip", percent: 80, confidence: "alta" }],
      under: [{ name: "Laser Sight", percent: 55, confidence: "media" }]
    }, "Amaru's weapon. The machine-gun version of the LMG-E."),
    W("M249", "LMG", "48", 650, "100+0", ["mira", "under", "grip", "cano"], null, "No Muzzle Brake or Suppressor options. Striker, Capitao and Gridlock's weapon."),
    W("T-95 LSW", "LMG", "46", 650, "80+1", ["mira", "under", "grip", "cano"], null, "Ying and Flores' weapon."),
    W("LMG-E", "LMG", "41", 720, "150+0", ["mira", "under", "grip", "cano"], {
      mira: [{ name: "Scope 2.5x (ACOG)", percent: 65, confidence: "media" }],
      cano: [{ name: "Compensator", percent: 60, confidence: "media" }],
      grip: [{ name: "Vertical Grip", percent: 75, confidence: "alta" }],
      under: [{ name: "Laser Sight", percent: 50, confidence: "media" }]
    }, "150-round magazine. Already-low vertical recoil, so the Compensator is the favorite. Zofia and Ram's weapon."),
    W("ALDA 5.56", "LMG", "35", 900, "80+0", ["mira", "under", "grip", "cano"], {
      mira: [{ name: "Red Dot Sight", percent: 55, confidence: "media" }],
      cano: [{ name: "Flash Hider", percent: 45, confidence: "media" }],
      grip: [{ name: "Horizontal Grip", percent: 65, confidence: "media" }],
      under: [{ name: "Laser Sight", percent: 45, confidence: "media" }]
    }, "Does not accept the Angled Grip. The clearest case of a mandatory Horizontal Grip. Maestro and Noor's weapon."),
    W("DP27", "LMG", "60", 550, "70+0", ["mira", "grip"], null, "Reflex Sight D only (exclusive). No laser. Tachanka's weapon."),

    /* ---------------- ESCOPETAS ---------------- */
    W("M590A1", "SHOTGUN", "46/21", 87, "7+0", ["mira", "under"], null, "Double-barrel shotgun. Damage drops off very fast past 5 meters."),
    W("M1014", "SHOTGUN", "27/13", 218, "8+0", ["mira", "under"], null, "Semi-automatic. Damage increased from 28 to 30 in patch Y11S3.1."),
    W("SG-CQB", "SHOTGUN", "42/19", 88, "7+0", ["mira", "grip", "under"], null, "Does not accept the Angled Grip. Twitch, Doc, Rook, Echo and Grim's weapon."),
    W("SASG-12", "SHOTGUN", "25/11", 348, "10+1", [], null, "Automatic shotgun. Kapkan, Finka and Fenrir's weapon."),
    W("M870", "SHOTGUN", "40/18", 102, "7+0", ["mira", "under"], null, "No barrel or grip slot. Sledge, Sentry, Jager, Bandit and Thorn's weapon."),
    W("Super 90", "SHOTGUN", "26/12", 219, "8+0", ["mira", "under"], null, "Frost and Melusi's weapon."),
    W("SPAS-12", "SHOTGUN", "29/13", 218, "7+0", ["mira", "under"], null, "No barrel or grip slot. Valkyrie and Oryx's weapon."),
    W("SPAS-15", "SHOTGUN", "25/11", 298, "6+1", ["mira", "under"], null, "No barrel or grip slot. Damage increased from 24 to 26 in patch Y11S3.1."),
    W("SuperNova", "SHOTGUN", "46/21", 87, "7+0", ["mira", "under"], null, "Hibana, Amaru and Echo's weapon."),
    W("ITA12L", "SHOTGUN", "40/18", 88, "8+0", ["mira", "under"], null, "Base damage disputed among sources. Jackal, Mira and Solis' weapon."),
    W("ITA12S", "SHOTGUN", "27/13", 83, "5+0", ["mira", "under"], null, "Pistol-shotgun. Thermite, Jackal, Amaru, Frost, Melusi and Thunderbird's weapon."),
    W("SIX12", "SHOTGUN", "44/20", 219, "6+0", ["mira", "under"], null, "Base damage disputed among sources. Ying's weapon."),
    W("SIX12 SD", "SHOTGUN", "44/20", 218, "6+0", ["mira", "under"], null, "Nokk and Lesion's weapon."),
    W("FO-12", "SHOTGUN", "23/26", 405, "10+1", ["mira", "grip", "cano", "under"], null, "Ela's weapon."),
    W("Super Shorty", "SHOTGUN", "33/15", 102, "3+0", ["mira", "under"], null, "3-shell pistol-shotgun. Sentry, Clash, Gridlock, Brava, Mozzie, Warden, Castle and Rook's weapon."),
    W("BOSG.12.2", "SHOTGUN", "125", 605, "2+0", ["mira", "grip", "under"], {
      mira: [{ name: "Scope 2.5x (ACOG)", percent: 70, confidence: "alta" }],
      cano: [{ name: "Muzzle Brake", percent: 55, confidence: "media" }],
      grip: [{ name: "Angled Grip", percent: 55, confidence: "media" }],
      under: [{ name: "Laser Sight", percent: 55, confidence: "media" }]
    }, "Slug, not buckshot. Very high damage at medium range. Dokkaebi and Vigil's weapon."),
    W("ACS12", "SHOTGUN", "69", 298, "30+1", ["mira", "grip", "under"], null, "Slug. No barrel options. Maestro and Alibi's weapon."),
    W("TCSG12", "SHOTGUN", "75", 496, "10+1", ["mira", "grip", "cano", "under"], null, "Slug. Sentry, Kaid and Goyo's weapon."),
    W("Glaive-12", "SHOTGUN", "67", 494, "4+0", ["grip", "under"], null, "Denari's exclusive slug."),

    /* ---------------- ARMAS DE MARCA ---------------- */
    W("417", "MARKSMAN", "69", 444, "20+1", ["mira", "under", "grip", "cano"], null, "Twitch, Lion, Sens and Rauora's weapon."),
    W("CAMRS", "MARKSMAN", "69", 444, "20+1", ["mira", "under", "grip", "cano"], null, "Brava's CAMRS exclusively accepts the Angled Grip."),
    W("SR-25", "MARKSMAN", "61", 445, "20+1", ["mira", "under", "grip", "cano"], {
      mira: [{ name: "Scope 2.5x (ACOG)", percent: 75, confidence: "alta" }],
      cano: [{ name: "Muzzle Brake", percent: 65, confidence: "media" }],
      grip: [{ name: "Horizontal Grip", percent: 60, confidence: "media" }],
      under: [{ name: "Laser Sight", percent: 40, confidence: "baixa" }]
    }, "Many players run it without a laser because of the visual and audio cue."),
    W("Mk 14 EBR", "MARKSMAN", "56", 444, "20+1", ["mira", "under", "grip", "cano"], null, "Telescopic Scope and Muzzle Brake are exclusive to Dokkaebi. Aruni gets the standard version."),
    W("AR-15.50", "MARKSMAN", "59", 444, "10+1", ["mira", "under", "grip", "cano"], {
      mira: [{ name: "Scope 2.5x (ACOG)", percent: 65, confidence: "baixa" }],
      cano: [{ name: "Muzzle Brake", percent: 70, confidence: "baixa" }],
      grip: [{ name: "Horizontal Grip", percent: 65, confidence: "baixa" }],
      under: [{ name: "Laser Sight", percent: 50, confidence: "baixa" }]
    }, "WARNING: heavily rebalanced in Y11S3 (damage 67 -> 59, increased recoil, first-shot multiplier 1.7 -> 3.7 on mouse and keyboard). The old build may no longer be ideal."),
    W("PMR90A2", "MARKSMAN", "62", 445, "20+1", ["mira", "under", "grip", "cano"], null, "Thatcher and Solid Snake's weapon."),
    W("OTs-03", "SNIPER", "71", 376, "15+1", ["under", "grip", "cano"], null, "Does not accept a scope. The HDS Flip Sight is exclusive to Glaz and lets you see through smoke."),
    W("CSRX 300", "SNIPER", "135", 63, "5+1", [], null, "Very high damage, but 60% of it goes to the limbs. Kali's weapon."),

    /* ---------------- PISTOLAS E REVOLVERES ---------------- */
    W("P226 Mk 25", "PISTOL", "50", 494, "15+1", [], null, "Default pistol. No attachment options on the wiki."),
    W("M45 MEUSOC", "PISTOL", "58", 494, "7+1", [], {
      cano: [{ name: "Muzzle Brake", percent: 75, confidence: "alta" }, { name: "No Barrel", percent: 20, confidence: "baixa" }],
      under: [{ name: "Laser Sight", percent: 30, confidence: "baixa" }]
    }, "Only accepts iron sights. Part of the community runs it without a barrel to keep bullet velocity."),
    W("5.7 USG", "PISTOL", "42", 494, "20+1", [], null, "Default pistol for Sledge, Thermite, Ash, Nokk and Zero."),
    W("P9", "PISTOL", "45", 495, "16+1", [], {
      cano: [{ name: "Muzzle Brake", percent: 80, confidence: "alta" }],
      under: [{ name: "Laser Sight", percent: 65, confidence: "media" }]
    }, "Nearly universal Muzzle Brake. Only accepts iron sights."),
    W("GSh-18", "PISTOL", "44", 495, "18+1", [], null, "Pistol for Fuze, Finka, Gridlock, Kapkan, Tachanka, Flores and Rauora."),
    W("PMM", "PISTOL", "61/63", 496, "8+1", [], null, "Base damage disputed among sources. Fuze, Finka, Kapkan, Tachanka and Kaid's weapon."),
    W("P12", "PISTOL", "44", 495, "15+1", [], {
      cano: [{ name: "Muzzle Brake", percent: 70, confidence: "alta" }, { name: "Suppressor", percent: 25, confidence: "media" }],
      under: [{ name: "Laser Sight", percent: 70, confidence: "alta" }]
    }, "Offers only Suppressor and Muzzle Brake. Blitz, Jager, Bandit, Wamai and Recruit's weapon."),
    W("Mk1 9mm", "PISTOL", "48", 493, "13+1", [], null, "Buck, Nomad, Ram, Gridlock and Frost's weapon."),
    W("D-50", "PISTOL", "71", 495, "7+1", [], null, "High damage. Nokk, Valkyrie and Azami's weapon."),
    W("PRB92", "PISTOL", "42", 494, "15+1", [], null, "Capitao, Nomad and Aruni's weapon."),
    W("Luison", "PISTOL", "65", 446, "12+1", [], null, "Suppressed variant of the PRB92, exclusive to Caveira, with manual reload."),
    W("P229", "PISTOL", "51", 494, "12+1", [], null, "Hibana, Grim, Capitao, Goyo, Skopos and Denari's weapon."),
    W("USP40", "PISTOL", "48", 494, "12+1", [], null, "Brava, Jackal, Mira and Oryx's weapon."),
    W("Q-929", "PISTOL", "60", 494, "10+1", [], null, "Ying, Lesion and Thunderbird's weapon."),
    W("RG15", "PISTOL", "38", 494, "15+1", [], null, "Zofia, Ela and Melusi's weapon."),
    W("1911 TACOPS", "PISTOL", "55", 496, "8+1", [], null, "Maverick, Thorn and Noor's weapon."),
    W("P-10C", "PISTOL", "40", 494, "15+1", [], null, "Jager, Clash and Warden's weapon."),
    W(".44 Mag Semi-Auto", "PISTOL", "54", 499, "7+1", [], null, "Nomad, Gridlock and Kaid's weapon."),
    W("SDP 9mm", "PISTOL", "47", 494, "16+1", [], null, "Sledge, Sens and Mozzie's weapon."),
    W("Tacit .45", "PISTOL", "52", 495, "8+1", ["under"], null, "Solid Snake's exclusive pistol. Accepts a laser."),
    W("LFP586", "PISTOL", "78", 494, "6+0", ["under"], null, "Revolver. Twitch, Lion, Doc, Rook, Kaid and Montagne's weapon."),
    W("Bailiff 410", "PISTOL", "27/30", 493, "5+0", ["mira", "under"], null, "Revolver for Alibi, Grim, Maestro, Oryx and Noor. Base damage disputed among sources. The Red Dot (handgun variant) is fixed and cannot be removed."),
    W("Keratos .357", "PISTOL", "78", 494, "6+0", [], null, "Revolver for Bandit, Wamai, Maestro and Alibi."),
    W(".44 Vendetta", "PISTOL", "78", 496, "6+0", ["under"], null, "Deimos' exclusive revolver."),

    /* ---------------- PISTOLAS AUTOMATICAS ---------------- */
    W("SMG-11", "PISTOL", "32/35", 1271, "16+1", ["mira", "under", "cano"], {
      mira: [{ name: "Scope 2.5x (ACOG)", percent: 40, confidence: "media" }, { name: "Red Dot Sight", percent: 40, confidence: "media" }],
      cano: [{ name: "Flash Hider", percent: 60, confidence: "alta" }],
      under: [{ name: "Laser Sight", percent: 65, confidence: "alta" }]
    }, "No grip slot. Historically the ACOG was allowed on this weapon because of Pro League players."),
    W("Bearing 9", "PISTOL", "33/36", 1098, "25+1", ["mira", "under", "cano"], null, "No grip slot. Glaz, Sledge, Hibana, Echo and Thunderbird's weapon."),
    W("C75 Auto", "PISTOL", "35", 999, "26+1", ["under", "cano"], null, "Offers only Suppressor and laser. Dokkaebi, Kali, Sentry, Vigil and Thorn's weapon."),
    W("SMG-12", "PISTOL", "16", 1273, "22+1", ["mira", "under", "grip"], null, "WARNING: heavy nerf in Y11S3 (damage 28 -> 16, magazine 32 -> 22). No barrel options. Dokkaebi and Vigil's weapon."),
    W("SPSMG9", "PISTOL", "35/39", 980, "20+1", ["mira", "under", "cano"], null, "Kali and Clash's weapon."),
    W("Reaper Mk2", "PISTOL", "31", 764, "33+1", ["under", "cano"], null, "No sight or grip slot. Used by Sledge, Lion, Maverick, Oryx, Sentry, Rook and Pulse."),

    /* ---------------- CORPO A CORPO / ESCUDOS / GADGET ---------------- */
    W("Knife", "MELEE", "-", "-", "-", [], null, "Default melee weapon for all operators."),
    W("GONNE-6", "LAUNCHER", "10", "-", "1", [], null, "Single-shot shaped-charge launcher."),
    W("Ballistic Shield", "SHIELD", "-", "-", "-", [], null, "Montagne's primary shield. Extends to the back and accepts a pistol."),
    W("Flash Shield", "SHIELD", "-", "-", "-", [], null, "Blitz's primary shield. Extends to the back and accepts the P12."),
    W("M249 SAW", "LMG", "48", 650, "60+1", ["mira", "under", "grip", "cano"], null, "M249 variant with a 60-round magazine. Used by Gridlock.")
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
