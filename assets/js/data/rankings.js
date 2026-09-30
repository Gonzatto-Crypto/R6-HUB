/* =================================================================
   RANKINGS
   -----------------------------------------------------------------
   O que tem aqui:
     teams        os 15 times no topo, com perfil completo
     teamsMore    outros times, so com a posicao no ranking
     solo         jogadores individuais mais titulados
     circuit      contexto de eventos (proximo Major, proximo Six Invitational)
     disclaimer   os avisos honestos que aparecem na tela

   AVISO IMPORTANTE (leia antes de publicar):
   O Ranked 3.0, lancerado em 2026-06-02 na Operation System Override,
   tirou o MMR escondido do jogo. Hoje o ranked e uma escada de Rank Points
   por PESSOA, entao:
     1) Nao existe MMR publico nem ranking de time dentro do jogo.
     2) A aba TIMES mostra o ranking profissional oficial (BLAST/Ubisoft).
     3) A aba SOLO lista jogadores reais com titulos verificados e avisa
        claramente que nao existe MMR publico para mostrar.
     4) Para pegar ranking de uma API externa, preencha rankingApiUrl em
        assets/js/config.js.                                              */
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
      { position: 1,  name: "DarkZero",        region: "América do Norte", rollingPosition: 3,  rollingPoints: 424, siPoints: 1890,
        titles: ["BLAST R6 Major Salt Lake City 2026 (2026-05-08, US$ 200 mil)", "Six Invitational 2023 (2023-02-07)"],
        team: "Nuers, J9O, njr, Fultz, Kyno", coach: "Callout",
        source: "https://www.ubisoft.com/en-us/esports/rainbow-six/siege/team/39" },
      { position: 2,  name: "FaZe Clan",       region: "América do Sul",     rollingPosition: 1,  rollingPoints: 665, siPoints: 1610,
        titles: ["EWC 2026 (2026-08-15, US$ 750 mil)", "Six Invitational 2026 (2026-02-15, US$ 1 mi)", "Six Invitational 2025 (2025-02-16, US$ 1 mi)", "South America League Finals 2025 (2025-12-04)"],
        team: "Handyy, cyber, soulz1, KDS, VITAKING", coach: "RafaDeLL",
        note: "Unica organizacao a completar a 'trifecta' do EWC: SI 2025 + SI 2026 + EWC 2026. cyber, soulz1 e KDS sao os primeiros jogadores a vencer um Six Invitational, um Major e o EWC (trifecta).",
        source: "https://www.ubisoft.com/en-us/esports/rainbow-six/siege/team/5" },
      { position: 3,  name: "ENTERPRISE Esports", region: "APAC - Oceania",     rollingPosition: 16, rollingPoints: 131, siPoints: 1560,
        titles: ["APL Stage 1 OCE 2026 (2026-06-08)", "APL Kickoff Oceania 2026 (2026-03-29)", "APL Stage 2 OCE 2025 (2025-09-04)"],
        team: "Jigsaw, uhan, Playxr, Brendo, Kyro", coach: "-",
        source: "https://www.ubisoft.com/en-us/esports/rainbow-six/siege/team/389" },
      { position: 4,  name: "Shopify Rebellion", region: "América do Norte",  rollingPosition: 5,  rollingPoints: 360, siPoints: 1515,
        titles: ["BLAST R6 Major Salt Lake City 2026 - vice (2026-05-08)", "NA League Finals 2025 - vice", "NAL Closed League Stage 2 2024 (2024-09-05)"],
        team: "Ambi, Spoit, Surf, Rexen, Canadian", coach: "supr",
        source: "https://www.ubisoft.com/en-us/esports/rainbow-six/siege/team/43" },
      { position: 5,  name: "Wildcard",        region: "América do Norte",    rollingPosition: 4,  rollingPoints: 384, siPoints: 1495,
        titles: ["NA League Stage 1 2026 (2026-06-11, US$ 25 mil)", "NA SI LCQ 2025 (2025-01-11)"],
        team: "Kanzen, Bae, Adrian, bbySharKK, Spiker", coach: "Lagonis",
        source: "https://www.ubisoft.com/en-us/esports/rainbow-six/siege/team/59" },
      { position: 6,  name: "Team Falcons",    region: "EMEA",                rollingPosition: 2,  rollingPoints: 486, siPoints: 1435,
        titles: ["EML Stage 1 2026 (2026-06-08, EUR 25 mil)", "EML Finals 2025 (2025-11-29)", "BLAST Major Munich 2025 - vice (2025-11-08)"],
        team: "jume, Solotov, LikEfac, Yuzus, BriD", coach: "JULIO",
        source: "https://www.ubisoft.com/en-us/esports/rainbow-six/siege/team/265" },
      { position: 7,  name: "G2 Esports",      region: "EMEA",                rollingPosition: 8,  rollingPoints: 261, siPoints: 1315,
        titles: ["EML Kickoff 2026 (2026-03-30)", "EML Stage 1 2025 (2025-06-16)"],
        team: "Benjamaster, Stompn, Shaiiko, Doki, Alem4o", coach: "Ramalho",
        source: "https://www.ubisoft.com/en-us/esports/rainbow-six/siege/team/29" },
      { position: 8,  name: "Weibo Gaming",    region: "APAC - Asia",         rollingPosition: 7,  rollingPoints: 319, siPoints: 1310,
        titles: ["APL Stage 1 ASIA 2026 (2026-06-10, KRW 22,2 milhoes)", "APL Kickoff Asia 2026 (2026-03-28)", "APL Finals 2025 (2025-12-11)"],
        team: "Reeps96, Terd, Hovenherst, Gotti, SpeakEasy", coach: "gohaN",
        source: "https://www.ubisoft.com/en-us/esports/rainbow-six/siege/team/380" },
      { position: 9,  name: "Twisted Minds",   region: "EMEA",                rollingPosition: 25, rollingPoints: 74,  siPoints: 1225,
        titles: ["EML Kickoff 2026 (2026-03-30)", "BLAST R6 Major Salt Lake City 2026 - 4o lugar"],
        team: "BlaZ, jlaD, P9, Hashom, Tr1ixd, Mowwwgli", coach: "MadSkiils, Liddel",
        source: "https://www.ubisoft.com/en-us/esports/rainbow-six/siege/team/266" },
      { position: 10, name: "Virtus.pro",      region: "EMEA",                rollingPosition: 14, rollingPoints: 160, siPoints: 1125,
        titles: ["EML Stage 1 2026 - vice (2026-06-08)", "Six Invitational 2024 - 3o lugar (2024-02-24)"],
        team: "p4sh4, dan, SkyZs, rorick, Always, Nayqo", coach: "Dark",
        source: "https://www.ubisoft.com/en-us/esports/rainbow-six/siege/team/234" },
      { position: 11, name: "All Gamers",      region: "China - CNL",         rollingPosition: 15, rollingPoints: 150, siPoints: 1040,
        titles: ["CNL Kickoff 2026 (2026-04-11)", "CNL Stage 1 2026 - vice (2026-06-05)"],
        team: "MoonL1ght, YaZ, Mcie, SoloMiD, Ra3LGuN, DGG", coach: "Phenomene",
        source: "https://www.ubisoft.com/en-us/esports/rainbow-six/siege/team/415" },
      { position: 12, name: "CAG by VARREL",   region: "APAC - Norte",        rollingPosition: 12, rollingPoints: 196, siPoints: 1010,
        titles: ["APL Stage 1 APAC N 2026 (2026-06-12, JPY 2,4 milhoes)", "APL Major Qualifier Stage 2 2025 (2025-10-10)"],
        team: "ShuReap, Chibisu, Zaka, Anitun, DD", coach: "-",
        source: "https://www.ubisoft.com/en-us/esports/rainbow-six/siege/team/61" },
      { position: 13, name: "Five Fears",      region: "América do Norte",    rollingPosition: 22, rollingPoints: 94,  siPoints: 925,
        titles: ["NA Kickoff 2026 (2026-04-01, US$ 12 mil)"],
        team: "Snake, Fenz, RIV4L, Forrest, JJBlaztful", coach: "Kizi",
        source: "https://www.ubisoft.com/en-us/esports/rainbow-six/siege/team/396" },
      { position: 14, name: "Edward Gaming",   region: "China - CNL",         rollingPosition: 24, rollingPoints: 84,  siPoints: 895,
        titles: ["CNL Stage 1 2026 (2026-06-05, CNY 200 mil)", "CNL Kickoff 2026 - vice"],
        team: "Reif, Direction, Carpe, Bapn, OnJuly, Mo5quito", coach: "MinGoran",
        source: "https://www.ubisoft.com/en-us/esports/rainbow-six/siege/team/416" },
      { position: 15, name: "FURIA",           region: "América do Sul",      rollingPosition: 11, rollingPoints: 215, siPoints: 890,
        titles: ["EWC 2026 - vice (2026-08-15, US$ 350 mil)", "RE:LO:AD 2025 (2025-05-10, US$ 170 mil)", "SA Kickoff 2026 (2026-03-31)"],
        team: "Dias, HerdsZ, Loira, Bokzera, volpz", coach: "Reduct",
        source: "https://www.ubisoft.com/en-us/esports/rainbow-six/siege/team/9" }
    ],

    /* Outros times, so com a posicao no ranking (sem perfil completo).
       Aqui "siPosition" e a POSICAO no ranking de pontos do Six Invitational
       (por exemplo, 26 = trigesimo sexto lugar). Cuidado: em "teams" o campo
       "siPoints" sao os PONTOS, nao a posicao. */
    teamsMore: [
      { name: "Team Liquid",  rollingPosition: 6,  siPosition: 26 },
      { name: "M80",          rollingPosition: 9,  siPosition: 25 },
      { name: "Ninjas in Pyjamas", rollingPosition: 10, siPosition: 16 },
      { name: "CAG",          rollingPosition: 12, siPosition: 12, note: "Mesma organizacao listada como CAG by VARREL" },
      { name: "Fluxo W7M",    rollingPosition: 13, siPosition: 44, note: "Campeao do Six Invitational 2024 (2024-02-25, final 3-2 sobre a FaZe Clan)" },
      { name: "Dplus",        rollingPosition: 17, siPosition: 21 },
      { name: "Daystar",      rollingPosition: 20, siPosition: 18 },
      { name: "LOS",          rollingPosition: 19, siPosition: 17 },
      { name: "Geekay",       rollingPosition: 21, siPosition: 33 },
      { name: "Chiefs",       rollingPosition: 26, siPosition: 21 },
      { name: "TYLOO",        rollingPosition: 28, siPosition: 26 },
      { name: "Fnatic",       rollingPosition: 30, siPosition: 34 }
    ],

    /* Solo: sem MMR publico. Lista de jogadores individuais mais titulados. */
    solo: [
      { position: 1, nickname: "cyber",  realName: "Jaime Pereira Ramos",        country: "Brasil", team: "FaZe Clan",              mmr: null,
        note: "Primeiro jogador da historia do R6 a completar a trifecta: Six Invitational + BLAST Major + Esports World Cup. Primeiro a US$ 1 milhao em premiacoes e lider historico em abates. MVP do EWC 2026 (rating 1.40, K-D 53-29, KPR 1.10 na final).",
        source: "https://escharts.com/players/cyber" },
      { position: 2, nickname: "soulz1", realName: "Lucas Romero Schinke",        country: "Brasil", team: "FaZe Clan",              mmr: null,
        note: "Trifecta: Six Invitational 2025, Six Invitational 2026 e EWC 2026.",
        source: "https://esportsworldcup.com/en/press-releases/faze-clan-secure-victory-at-r6-siege-at-ewc26" },
      { position: 3, nickname: "KDS",    realName: "Eduardo Chiste Fontes Santos", country: "Brasil", team: "FaZe Clan",             mmr: null,
        note: "Trifecta: Six Invitational 2025, Six Invitational 2026 e EWC 2026. No EWC 2026: 'Ganhamos de tudo, entao basicamente somos os melhores jogadores.'",
        source: "https://esportsworldcup.com/en/press-releases/faze-clan-secure-victory-at-r6-siege-at-ewc26" },
      { position: 4, nickname: "Handyy", realName: "Thiago Sa Ferreira",          country: "Brasil", team: "FaZe Clan",              mmr: null,
        note: "MVP do Six Invitational 2026. Campeao do SI 2025, SI 2026 e EWC 2026; vice no SI 2024.",
        source: "https://siege.gg/players/2822-handy" },
      { position: 5, nickname: "VITAKING", realName: "Victor Augusto dos Santos", country: "Brasil", team: "FaZe Clan",              mmr: null,
        note: "Campeao do SI 2025, SI 2026 e EWC 2026.",
        source: "https://sixstats.cc/article/42-faze-clan-are-esports-world-cup-2026-champions" },
      { position: 6, nickname: "Spoit",  realName: "William Lofstedt",           country: "Suécia", team: "Shopify Rebellion",     mmr: null,
        note: "Campeao do Six Berlin Major. Campeao da NA League 2023 Stage 1. Entrou na Shopify Rebellion em 2026-02-22 apos dois anos no M80.",
        source: "https://siege.gg/players/380-spoit" },
      { position: 7, nickname: "jume",   realName: "Marc Steinmann",             country: "Alemanha", team: "Team Falcons",          mmr: null,
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
