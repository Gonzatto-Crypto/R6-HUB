/* R6 HUB - configuracao global */
window.R6HUB_CONFIG = {
  siteName: "R6 HUB",
  tagline: "Hub de Rainbow Six Siege",
  /* Snapshot de referencia dos dados */
  snapshot: "2026-09-28",

  /* Endpoints opcionais de ranking ao vivo.
     Deixe vazio para usar o snapshot local (padrao).
     Se preenchido, o site tenta o fetch e cai no snapshot em caso de falha.
     Formato esperado: JSON { "teams": [...], "solo": [...] }
     com os mesmos nomes de campo usados em assets/js/data/rankings.js:

       teams: { position, name, region, team, coach, titles[],
                rollingPosition, rollingPoints, siPoints }
       solo:  { position, nickname, realName, country, team, note }

     "siPoints" em teams sao os PONTOS do Six Invitational.                */
  rankingApiUrl: "",
  rankingApiHeaders: {},

  /* Fontes oficiais usadas para compilar os dados */
  sources: {
    operators: "https://www.ubisoft.com/en-gb/game/rainbow-six/siege/game-info/operators",
    wiki: "https://rainbowsix.fandom.com/wiki/Operators_(Siege)",
    patchNotes: "https://www.ubisoft.com/en-us/game/rainbow-six/siege/news-updates",
    standings: "https://www.ubisoft.com/en-us/esports/rainbow-six/siege/global-standings",
    sixstats: "https://sixstats.cc/team-rankings",
    attachments: "https://rainbowsix.fandom.com/wiki/Weapon_Attachments"
  }
};
