/* R6 HUB - rankings
   IMPORTANTE (leia antes de publicar):
   1) O Ranked 3.0 (lancado em 2026-06-02, Operation System Override) REMOVEU o MMR oculto.
      O ranked virou uma escada de Rank Points por PESSOA. Nao existe mais MMR nem ranking de
      time ranqueado dentro do jogo, e a Ubisoft nao publica nenhum leaderboard na web.
      Fonte: https://www.ubisoft.com/en-us/game/rainbow-six/siege/news-updates/5fzYRZKVVHqqRkkv3m4MyF/ranked-30-update
   2) Portanto, na aba TIMES o site mostra o ranking profissional oficial (com fontes).
   3) Na aba SOLO nao existe leaderboard publico de MMR/RP: o site mostra os jogadores
      individuais mais titulados com titulos reais e marca explicitamente que nao ha MMR publico.
   4) Para plugar uma API de ranking ao vivo, defina rankingApiUrl em assets/js/config.js.    */
(function () {
  "use strict";
  window.R6HUB = window.R6HUB || {};

  window.R6HUB.rankings = {
    snapshot: "2026-09-28",
    disclaimer: {
      teams: "Ranking profissional oficial (BLAST R6 / Ubisoft). A Ubisoft nao publica ranking de times ranqueados dentro do jogo: o Ranked 3.0 e individual, por Rank Points.",
      solo: "Nao existe leaderboard publico de MMR ou Rank Points. O Ranked 3.0 removeu o MMR oculto e a tabela da divisao Champion so e visivel dentro do jogo. Os nomes abaixo sao jogadores reais com titulos documentados - nao ha MMR publico para exibir."
    },

    /* Pontos oficiais de qualificacao para o Six Invitational 2027 */
    teams: [
      { pos: 1,  name: "DarkZero",        region: "América do Norte", rolling: 3,  rollingPts: 424, si: 1890,
        titles: ["BLAST R6 Major Salt Lake City 2026 (2026-05-08, US$ 200 mil)", "Six Invitational 2023 (2023-02-07)"],
        team: "Nuers, J9O, njr, Fultz, Kyno", coach: "Callout",
        source: "https://www.ubisoft.com/en-us/esports/rainbow-six/siege/team/39" },
      { pos: 2,  name: "FaZe Clan",       region: "América do Sul",     rolling: 1,  rollingPts: 665, si: 1610,
        titles: ["EWC 2026 (2026-08-15, US$ 750 mil)", "Six Invitational 2026 (2026-02-15, US$ 1 mi)", "Six Invitational 2025 (2025-02-16, US$ 1 mi)", "South America League Finals 2025 (2025-12-04)"],
        team: "Handyy, cyber, soulz1, KDS, VITAKING", coach: "RafaDeLL",
        note: "Unica organizacao a completar a 'trifecta' do EWC: SI 2025 + SI 2026 + EWC 2026. cyber, soulz1 e KDS sao os primeiros jogadores a vencer um Six Invitational, um Major e o EWC (trifecta).",
        source: "https://www.ubisoft.com/en-us/esports/rainbow-six/siege/team/5" },
      { pos: 3,  name: "ENTERPRISE Esports", region: "APAC - Oceania",     rolling: 16, rollingPts: 131, si: 1560,
        titles: ["APL Stage 1 OCE 2026 (2026-06-08)", "APL Kickoff Oceania 2026 (2026-03-29)", "APL Stage 2 OCE 2025 (2025-09-04)"],
        team: "Jigsaw, uhan, Playxr, Brendo, Kyro", coach: "-",
        source: "https://www.ubisoft.com/en-us/esports/rainbow-six/siege/team/389" },
      { pos: 4,  name: "Shopify Rebellion", region: "América do Norte",  rolling: 5,  rollingPts: 360, si: 1515,
        titles: ["BLAST R6 Major Salt Lake City 2026 - vice (2026-05-08)", "NA League Finals 2025 - vice", "NAL Closed League Stage 2 2024 (2024-09-05)"],
        team: "Ambi, Spoit, Surf, Rexen, Canadian", coach: "supr",
        source: "https://www.ubisoft.com/en-us/esports/rainbow-six/siege/team/43" },
      { pos: 5,  name: "Wildcard",        region: "América do Norte",    rolling: 4,  rollingPts: 384, si: 1495,
        titles: ["NA League Stage 1 2026 (2026-06-11, US$ 25 mil)", "NA SI LCQ 2025 (2025-01-11)"],
        team: "Kanzen, Bae, Adrian, bbySharKK, Spiker", coach: "Lagonis",
        source: "https://www.ubisoft.com/en-us/esports/rainbow-six/siege/team/59" },
      { pos: 6,  name: "Team Falcons",    region: "EMEA",                rolling: 2,  rollingPts: 486, si: 1435,
        titles: ["EML Stage 1 2026 (2026-06-08, EUR 25 mil)", "EML Finals 2025 (2025-11-29)", "BLAST Major Munich 2025 - vice (2025-11-08)"],
        team: "jume, Solotov, LikEfac, Yuzus, BriD", coach: "JULIO",
        source: "https://www.ubisoft.com/en-us/esports/rainbow-six/siege/team/265" },
      { pos: 7,  name: "G2 Esports",      region: "EMEA",                rolling: 8,  rollingPts: 261, si: 1315,
        titles: ["EML Kickoff 2026 (2026-03-30)", "EML Stage 1 2025 (2025-06-16)"],
        team: "Benjamaster, Stompn, Shaiiko, Doki, Alem4o", coach: "Ramalho",
        source: "https://www.ubisoft.com/en-us/esports/rainbow-six/siege/team/29" },
      { pos: 8,  name: "Weibo Gaming",    region: "APAC - Asia",         rolling: 7,  rollingPts: 319, si: 1310,
        titles: ["APL Stage 1 ASIA 2026 (2026-06-10, KRW 22,2 milhoes)", "APL Kickoff Asia 2026 (2026-03-28)", "APL Finals 2025 (2025-12-11)"],
        team: "Reeps96, Terd, Hovenherst, Gotti, SpeakEasy", coach: "gohaN",
        source: "https://www.ubisoft.com/en-us/esports/rainbow-six/siege/team/380" },
      { pos: 9,  name: "Twisted Minds",   region: "EMEA",                rolling: 25, rollingPts: 74,  si: 1225,
        titles: ["EML Kickoff 2026 (2026-03-30)", "BLAST R6 Major Salt Lake City 2026 - 4o lugar"],
        team: "BlaZ, jlaD, P9, Hashom, Tr1ixd, Mowwwgli", coach: "MadSkiils, Liddel",
        source: "https://www.ubisoft.com/en-us/esports/rainbow-six/siege/team/266" },
      { pos: 10, name: "Virtus.pro",      region: "EMEA",                rolling: 14, rollingPts: 160, si: 1125,
        titles: ["EML Stage 1 2026 - vice (2026-06-08)", "Six Invitational 2024 - 3o lugar (2024-02-24)"],
        team: "p4sh4, dan, SkyZs, rorick, Always, Nayqo", coach: "Dark",
        source: "https://www.ubisoft.com/en-us/esports/rainbow-six/siege/team/234" },
      { pos: 11, name: "All Gamers",      region: "China - CNL",         rolling: 15, rollingPts: 150, si: 1040,
        titles: ["CNL Kickoff 2026 (2026-04-11)", "CNL Stage 1 2026 - vice (2026-06-05)"],
        team: "MoonL1ght, YaZ, Mcie, SoloMiD, Ra3LGuN, DGG", coach: "Phenomene",
        source: "https://www.ubisoft.com/en-us/esports/rainbow-six/siege/team/415" },
      { pos: 12, name: "CAG by VARREL",   region: "APAC - Norte",        rolling: 12, rollingPts: 196, si: 1010,
        titles: ["APL Stage 1 APAC N 2026 (2026-06-12, JPY 2,4 milhoes)", "APL Major Qualifier Stage 2 2025 (2025-10-10)"],
        team: "ShuReap, Chibisu, Zaka, Anitun, DD", coach: "-",
        source: "https://www.ubisoft.com/en-us/esports/rainbow-six/siege/team/61" },
      { pos: 13, name: "Five Fears",      region: "América do Norte",    rolling: 22, rollingPts: 94,  si: 925,
        titles: ["NA Kickoff 2026 (2026-04-01, US$ 12 mil)"],
        team: "Snake, Fenz, RIV4L, Forrest, JJBlaztful", coach: "Kizi",
        source: "https://www.ubisoft.com/en-us/esports/rainbow-six/siege/team/396" },
      { pos: 14, name: "Edward Gaming",   region: "China - CNL",         rolling: 24, rollingPts: 84,  si: 895,
        titles: ["CNL Stage 1 2026 (2026-06-05, CNY 200 mil)", "CNL Kickoff 2026 - vice"],
        team: "Reif, Direction, Carpe, Bapn, OnJuly, Mo5quito", coach: "MinGoran",
        source: "https://www.ubisoft.com/en-us/esports/rainbow-six/siege/team/416" },
      { pos: 15, name: "FURIA",           region: "América do Sul",      rolling: 11, rollingPts: 215, si: 890,
        titles: ["EWC 2026 - vice (2026-08-15, US$ 350 mil)", "RE:LO:AD 2025 (2025-05-10, US$ 170 mil)", "SA Kickoff 2026 (2026-03-31)"],
        team: "Dias, HerdsZ, Loira, Bokzera, volpz", coach: "Reduct",
        source: "https://www.ubisoft.com/en-us/esports/rainbow-six/siege/team/9" }
    ],

    /* Times adicionais com posicao no ranking, sem perfil completo */
    teamsMore: [
      { name: "Team Liquid",  rolling: 6,  si: 26 },
      { name: "M80",          rolling: 9,  si: 25 },
      { name: "Ninjas in Pyjamas", rolling: 10, si: 16 },
      { name: "CAG",          rolling: 12, si: 12, note: "Mesma organizacao listada como CAG by VARREL" },
      { name: "Fluxo W7M",    rolling: 13, si: 44, note: "Campeao do Six Invitational 2024 (2024-02-25, final 3-2 sobre a FaZe Clan)" },
      { name: "Dplus",        rolling: 17, si: 21 },
      { name: "Daystar",      rolling: 20, si: 18 },
      { name: "LOS",          rolling: 19, si: 17 },
      { name: "Geekay",       rolling: 21, si: 33 },
      { name: "Chiefs",       rolling: 26, si: 21 },
      { name: "TYLOO",        rolling: 28, si: 26 },
      { name: "Fnatic",       rolling: 30, si: 34 }
    ],

    /* Solo: sem MMR publico. Lista de jogadores individuais mais titulados. */
    solo: [
      { pos: 1, tag: "cyber",  real: "Jaime Pereira Ramos",        country: "Brasil", team: "FaZe Clan",              mmu: null,
        note: "Primeiro jogador da historia do R6 a completar a trifecta: Six Invitational + BLAST Major + Esports World Cup. Primeiro a US$ 1 milhao em premiacoes e lider historico em abates. MVP do EWC 2026 (rating 1.40, K-D 53-29, KPR 1.10 na final).",
        source: "https://escharts.com/players/cyber" },
      { pos: 2, tag: "soulz1", real: "Lucas Romero Schinke",        country: "Brasil", team: "FaZe Clan",              mmu: null,
        note: "Trifecta: Six Invitational 2025, Six Invitational 2026 e EWC 2026.",
        source: "https://esportsworldcup.com/en/press-releases/faze-clan-secure-victory-at-r6-siege-at-ewc26" },
      { pos: 3, tag: "KDS",    real: "Eduardo Chiste Fontes Santos", country: "Brasil", team: "FaZe Clan",             mmu: null,
        note: "Trifecta: Six Invitational 2025, Six Invitational 2026 e EWC 2026. No EWC 2026: 'Ganhamos de tudo, entao basicamente somos os melhores jogadores.'",
        source: "https://esportsworldcup.com/en/press-releases/faze-clan-secure-victory-at-r6-siege-at-ewc26" },
      { pos: 4, tag: "Handyy", real: "Thiago Sa Ferreira",          country: "Brasil", team: "FaZe Clan",              mmu: null,
        note: "MVP do Six Invitational 2026. Campeao do SI 2025, SI 2026 e EWC 2026; vice no SI 2024.",
        source: "https://siege.gg/players/2822-handy" },
      { pos: 5, tag: "VITAKING", real: "Victor Augusto dos Santos", country: "Brasil", team: "FaZe Clan",              mmu: null,
        note: "Campeao do SI 2025, SI 2026 e EWC 2026.",
        source: "https://sixstats.cc/article/42-faze-clan-are-esports-world-cup-2026-champions" },
      { pos: 6, tag: "Spoit",  real: "William Lofstedt",           country: "Suecia",  team: "Shopify Rebellion",      mmu: null,
        note: "Campeao do Six Berlin Major. Campeao da NA League 2023 Stage 1. Entrou na Shopify Rebellion em 2026-02-22 apos dois anos no M80.",
        source: "https://siege.gg/players/380-spoit" },
      { pos: 7, tag: "jume",   real: "Marc Steinmann",             country: "Alemanha", team: "Team Falcons",          mmu: null,
        note: "Finalista do Six Invitational 2026 com a Team Secret. Clutch 1v3 no Fortress que manteve a Secret viva na semifinal contra a FaZe (perdida em 2-3 no tempo normal, 11-9 na prorrogacao).",
        source: "https://esportsinsider.com/2026/02/faze-clan-six-invitational-2026-win" }
    ],

    /* Contexto do circuito, para a aba de noticias */
    circuit: {
      majorNext: { name: "BLAST R6 Major Osaka", date: "2026-11-06 a 2026-11-15", place: "Osaka, ATC Hall", teams: 20,
        note: "Terceiro evento internacional do Year 11. Ingressos esgotados." },
      siNext: { name: "Six Invitational 2027", date: "2027-02-01 a 2027-02-14", place: "Sao Paulo, Suhai Music Hall",
        note: "Final de 12 a 14 de fevereiro, capacidade para pouco mais de 9 mil pessoas." },
      qualifiedSoFar: ["FaZe Clan"],
      ranked: { name: "Ranked 3.0", since: "2026-06-02", season: "Operation System Override",
        note: "Remove o MMR oculto, cria Rank Points, 5 Placement Matches por temporada e trilha de recompensas competitivas com 15 niveis." }
    }
  };
})();
