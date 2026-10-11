/* =================================================================
   R6 HUB - o site em si
   -----------------------------------------------------------------
   Este arquivo faz tres coisas, nessa ordem:

     1. Lê a URL (o "#/..." depois do nome do site) e decide qual
        página mostrar.
     2. Monta o HTML de cada página.
     3. Liga os botões, filtros e campos de busca.

   Como testar uma mudanca aqui:
     abra o arquivo _selftest.html no navegador. Ele passa por todas
     as páginas e avisa se algo quebrou.

   Organizacao do arquivo:
     Parte 1 - Funcoes curtas de ajuda (escapar texto, formatar data...)
     Parte 2 - Leitura da URL
     Parte 3 - Blocos de tela reaproveitados
     Parte 4 - Uma funcao por pagina
     Parte 5 - Busca no topo da pagina
     Parte 6 - Ligar os botoes
     Parte 7 - Inicializacao
   ================================================================= */
(function () {
  "use strict";

  var DADOS = window.R6HUB;                 // Todos os dados do site
  var CONFIG = window.R6HUB_CONFIG;        // Configuracoes (config.js)
  var AREA_PRINCIPAL = document.getElementById("main");

  /* =================================================================
     PARTE 1 - FUNCOES CURTAS DE AJUDA
     ================================================================= */

  /* Acha um elemento pelo id. Ex: pegarElemento("search-input") */
  function pegarElemento(id) { return document.getElementById(id); }

  /* Protege o texto antes de colocar dentro do HTML.
     Sem isso, um "<" no nome de um Operador quebraria a pagina. */
  function escapar(texto) {
    return String(texto == null ? "" : texto)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  /* Deixa o texto comparável: tira acento e joga para minúsculas.
     Assim "Coração" e "coracao" contam como a mesma busca. */
  function normalizar(texto) {
    return String(texto == null ? "" : texto).toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  /* Pega as iniciais para usar no quadradinho do avatar.
     "DarkZero" vira "DZ", "Team Falcons" vira "TF". */
  function iniciais(nome) {
    var partes = String(nome).replace(/[^A-Za-z0-9\u00C0-\u024F ]/g, " ").trim().split(/\s+/);
    if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
    return (partes[0][0] + partes[1][0]).toUpperCase();
  }

  /* "Finka" vira "finka", "Tachanka" vira "tachanka".
     Serve para achar o arquivo do desenho em assets/img/operators/. */
  function arquivoDoOperador(nome) {
    return "assets/img/operators/" + String(nome || "")
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") + ".svg";
  }

  /* Desenha o quadradinho do Operador: o arquivo SVG por cima e as
     iniciais por baixo. Se o desenho nao carregar, o onerror tira a
     imagem e sobra so o texto -- nunca aparece um quadrado vazio. */
  function avatarDoOperador(operador) {
    return '<div class="avatar">' +
      '<span class="avatar-letras">' + escapar(iniciais(operador.name)) + "</span>" +
      '<img src="' + escapar(arquivoDoOperador(operador.name)) + '" alt="' +
        escapar("Portrait of operator " + operador.name) + '" loading="lazy" decoding="async" onerror="this.remove()">' +
    "</div>";
  }

  var NOMES_DOS_MESES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                         "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  /* "2026-09-22" vira "22 set 2026" */
  function formatarData(dataISO) {
    if (!dataISO) return "-";
    var partes = String(dataISO).slice(0, 10).split("-");
    if (partes.length !== 3) return dataISO;
    return Number(partes[2]) + " " + NOMES_DOS_MESES[Number(partes[1]) - 1] + " " + partes[0];
  }

  /* Desenha as bolinhas de 1 a 3 (usadas para vida e velocidade). */
  function bolinhas(quantidade, classe) {
    var html = '<span class="dots ' + (classe || "") + '">';
    for (var i = 1; i <= 3; i++) {
      html += "<b" + (i <= quantidade ? ' class="on"' : "") + "></b>";
    }
    return html + "</span>";
  }

  /* Prepara um texto para entrar dentro de um link (#/agente/...) */
  function codificarParaLink(valor) { return encodeURIComponent(String(valor)); }

  function nomeDoLado(lado) { return lado === "ATK" ? "Attacker" : "Defender"; }
  function siglaDoLado(lado) { return lado === "ATK" ? "ATK" : "DEF"; }

  /* Procura um Operador pelo id. Devolve null se nao achar. */
  function acharOperador(id) {
    var achado = DADOS.operators.filter(function (operador) { return operador.id === id; });
    return achado[0] || null;
  }

  /* Procura uma arma pelo nome, sem se preocupar com maiuscula. */
  function acharArma(nome) {
    return DADOS.weaponIndex[String(nome || "").toLowerCase()] ||
           DADOS.weaponIndex[normalizar(nome)] ||
           null;
  }

  /* Traduz os termos que chegam em ingles do arquivo de dados
     para o portugues que aparece na tela. */
  var TRADUCAO_CATEGORIA = {
    "esports": "Esports",
    "season-launch": "Season launch",
    "in-game-event": "In-game event",
    "ranked": "Ranked",
    "announcement": "Announcement",
    "community": "Community"
  };
  var TRADUCAO_STATUS = {
    "live": "live",
    "announcement": "announcement",
    "preseason": "pre-season",
    "result": "result"
  };
  var TRADUCAO_SLOT = {
    mira: "Sight / Scope",
    under: "Under-barrel",
    grip: "Grip",
    cano: "Barrel / Muzzle"
  };
  var TRADUCAO_CONFIANCA = { alta: "high confidence", media: "medium confidence", baixa: "low confidence" };

  function nomeDaCategoria(chave) { return TRADUCAO_CATEGORIA[chave] || chave; }
  function nomeDoStatus(chave) { return TRADUCAO_STATUS[chave] || chave; }
  function nomeDoSlot(chave) { return TRADUCAO_SLOT[chave] || chave; }

  /* Acha o nome bonito da funcao de um Operador (ex: "roamer" -> "Roamer"). */
  function nomeDaFuncao(idFuncao) {
    var achada = DADOS.roles.filter(function (funcao) { return funcao.id === idFuncao; });
    return achada[0] ? achada[0].label : idFuncao;
  }

  /* Etiqueta colorida de confianca da estimativa de peca. */
  function etiquetaConfianca(confianca) {
    var texto = TRADUCAO_CONFIANCA[confianca] || confianca;
    return '<span class="conf ' + (confianca || "") + '">' + escapar(texto) + "</span>";
  }

  /* Etiqueta colorida que diz se a mudanca foi buff, nerf ou mista. */
  function etiquetaDirecao(direcao) {
    var texto = direcao === "buff" ? "Buff" : direcao === "nerf" ? "Nerf" : "Mixed";
    return '<span class="pill ' + (direcao || "mixed") + '">' + texto + "</span>";
  }

  /* =================================================================
     PARTE 2 - LEITURA DA URL
     -----------------------------------------------------------------
     O endereco do site guarda o que esta aberto. Exemplos:
       #/                          pagina inicial
       #/agentes?side=ATK         lista de Operadores, so os atacantes
       #/agente/ash               detalhe do Ash
       #/arma/M249%20SAW          detalhe da M249
     ----------------------------------------------------------------- */

  /* Separa o "#/algo?filtro=x" em: caminho, filtros e pedacos do caminho. */
  function lerUrl() {
    var endereco = location.hash.replace(/^#/, "") || "/";
    var posicaoDoInterrogacao = endereco.indexOf("?");
    var caminho = posicaoDoInterrogacao === -1 ? endereco : endereco.slice(0, posicaoDoInterrogacao);
    var filtros = {};

    if (posicaoDoInterrogacao !== -1) {
      endereco.slice(posicaoDoInterrogacao + 1).split("&").forEach(function (par) {
        if (!par) return;
        var pedaco = par.split("=");
        filtros[decodeURIComponent(pedaco[0])] =
          decodeURIComponent((pedaco[1] || "").replace(/\+/g, " "));
      });
    }

    return {
      caminho: caminho,
      filtros: filtros,
      pedacos: caminho.split("/").filter(Boolean)
    };
  }

  /* Troca de pagina. Monta o "#/caminho?filtros" e joga no endereco. */
  function irPara(caminho, filtros) {
    var partes = [];
    if (filtros) {
      Object.keys(filtros).forEach(function (chave) {
        if (filtros[chave]) {
          partes.push(encodeURIComponent(chave) + "=" + encodeURIComponent(filtros[chave]));
        }
      });
    }
    location.hash = "#" + caminho + (partes.length ? "?" + partes.join("&") : "");
  }

  /* Muda um filtro sem perder os outros.
     Ex: trocar so o "side" continua com o "q" que ja estava. */
  function mudarFiltro(mudancas) {
    var filtros = lerUrl().filtros;
    Object.keys(mudancas).forEach(function (chave) {
      if (mudancas[chave] == null || mudancas[chave] === "") delete filtros[chave];
      else filtros[chave] = mudancas[chave];
    });
    irPara(lerUrl().caminho, filtros);
  }

  /* =================================================================
     PARTE 3 - BLOCOS DE TELA REAPROVEITADOS
     ================================================================= */

  /* Cabeçalho de uma seção: o texto do lado esquerdo e o botão do lado direito. */
  function cabecalhoDeSecao(etiqueta, titulo, descricao, botaoExtra) {
    return '<div class="sec-head"><div><span class="etiqueta">' + escapar(etiqueta) + "</span><h2>" +
      escapar(titulo) + "</h2>" + (descricao ? "<p>" + escapar(descricao) + "</p>" : "") + "</div>" +
      '<div class="empurra"></div>' + (botaoExtra || "") + "</div>";
  }

  /* O caminho de migalhas no topo: Inicio / Agentes / Ash */
  function migalhas(itens) {
    var html = '<nav class="crumbs">';
    itens.forEach(function (item, indice) {
      if (indice) html += "<span>/</span>";
      html += item.link
        ? '<a href="' + escapar(item.link) + '">' + escapar(item.texto) + "</a>"
        : "<span>" + escapar(item.texto) + "</span>";
    });
    return html + "</nav>";
  }

  /* A caixa de aviso azul ou amarela. */
  function aviso(texto, tipo) {
    return '<div class="notice ' + (tipo || "") + '"><span class="aviso-icone">' +
      (tipo === "info" ? "i" : "!") + "</span><div>" + texto + "</div></div>";
  }

  /* O quadradinho de um Operador dentro de uma lista. */
  function cartaoDoOperador(operador) {
    var classeDoLado = operador.side === "ATK" ? "atk" : "def";
    var bolinhasDeVida = operador.health === 125 ? 3 : operador.health === 110 ? 2 : 1;

    return '<a class="card ' + classeDoLado + '" href="#/agente/' + codificarParaLink(operador.id) + '">' +
      '<div class="card-top">' +
        avatarDoOperador(operador) +
        '<div class="card-title"><h3>' + escapar(operador.name) + "</h3>" +
        '<div class="sub">' + escapar(operador.unit) + " &middot; " + escapar(operador.region) + "</div></div>" +
        '<span class="side-badge ' + classeDoLado + '">' + siglaDoLado(operador.side) + "</span>" +
      "</div>" +
      '<div class="card-body"><div class="gadget-line"><b>Main gadget</b>' + escapar(operador.gadget) + "</div></div>" +
      '<div class="card-foot">' +
        '<span class="stat-mini"><i>hp</i>' + bolinhas(bolinhasDeVida) + operador.health + "</span>" +
        '<span class="stat-mini"><i>spd</i>' + bolinhas(operador.speed, classeDoLado) + operador.speed + "</span>" +
        '<span class="empurra">' + escapar(operador.roles.map(nomeDaFuncao).join(" / ")) + "</span>" +
      "</div></a>";
  }

  /* O quadradinho de uma arma dentro de uma lista. */
  function cartaoDaArma(arma) {
    return '<a class="card w-card" href="#/arma/' + codificarParaLink(arma.name) + '">' +
      '<div class="card-top"><div class="card-title">' +
        '<span class="wc-type">' + escapar(arma.type) + "</span>" +
        '<h3 style="margin-top:2px">' + escapar(arma.name) + "</h3>" +
      "</div></div>" +
      '<div class="spec-row">' +
        '<div class="spec"><b>' + escapar(arma.damage) + '</b><span>damage</span></div>' +
        '<div class="spec"><b>' + escapar(arma.rpm) + '</b><span>rpm</span></div>' +
        '<div class="spec"><b>' + escapar(arma.magazine) + '</b><span>mag</span></div>' +
        '<div class="spec"><b>' + arma.slots.length + '</b><span>slots</span></div>' +
      "</div>" +
      '<div class="card-foot"><span class="meta-flag">' + (arma.meta ? "attachment meta" : "no meta") + "</span>" +
      '<span class="empurra">view</span></div></a>';
  }

  /* =================================================================
     PARTE 4 - UMA FUNCAO POR PAGINA
     Cada funcao devolve uma string de HTML.
     ================================================================= */

  /* -----------------------------------------------------------------
     PAGINA INICIAL
     ----------------------------------------------------------------- */
  function paginaInicial() {
    var balanceamentos = DADOS.patchnotes;
    var temporadaAtual = balanceamentos.currentSeason;
    var ultimosPatches = balanceamentos.patches.slice(0, 3);
    var ultimosOperadores = balanceamentos.operatorReleases.slice(0, 3);
    var totalAtacantes = DADOS.operators.filter(function (operador) {
      return operador.side === "ATK";
    }).length;
    var totalDefensores = DADOS.operators.length - totalAtacantes;

    var html = "";

    /* Faixa do topo */
    html += '<section class="hero">' +
      "<div>" +
        '<span class="eyebrow">Community hub &middot; data from ' + escapar(formatarData(CONFIG.snapshot)) + "</span>" +
        "<h1>Rainbow Six <span>Siege</span> all in one place</h1>" +
        '<p class="lead">All ' + DADOS.operators.length + ' operators with their main gadget, secondary gadgets, ' +
        "unique ability and weapons, plus the estimated usage of the most popular attachments. Also the official patch notes, " +
        "game news and rankings.</p>" +
        '<div class="hero-acoes">' +
          '<a class="btn btn-primary" href="#/agentes">View the ' + DADOS.operators.length + " operators</a>" +
          '<a class="btn" href="#/armas">Weapons catalog</a>' +
          '<a class="btn" href="#/noticias">Balance changes</a>' +
        "</div>" +
      "</div>" +
      '<div class="season-card">' +
        '<span class="sc-label">Current season</span>' +
        '<div class="sc-name">' + escapar(temporadaAtual.name) + "</div>" +
        '<div class="sc-date">' + escapar(temporadaAtual.label) + " &middot; since " + escapar(formatarData(temporadaAtual.startedAt)) + "</div>" +
        "<hr>" +
        "<ul>" +
          "<li><b>Latest patch:</b> " + escapar(ultimosPatches[0].version) + " (" + escapar(formatarData(ultimosPatches[0].date)) + ")</li>" +
          "<li><b>New operator:</b> " + escapar(ultimosOperadores[0].name) + " &mdash; " + escapar(ultimosOperadores[0].gadget) + "</li>" +
          "<li><b>" + balanceamentos.patches.length + "</b> balance patches mapped</li>" +
          "<li><b>Next event:</b> " + escapar(DADOS.rankings.circuit.majorNext.name) + "</li>" +
        "</ul>" +
      "</div>" +
    "</section>";

    /* Números grandes */
    html += '<div class="stats">' +
      '<div class="stat"><b>' + DADOS.operators.length + "</b><span>operators</span></div>" +
      '<div class="stat"><b>' + totalAtacantes + " / " + totalDefensores + "</b><span>attackers / defenders</span></div>" +
      '<div class="stat"><b>' + DADOS.weapons.length + "</b><span>weapons in catalog</span></div>" +
      '<div class="stat"><b>' + Object.keys(DADOS.attachmentEffects).length + "</b><span>attachment types</span></div>" +
      '<div class="stat"><b>' + balanceamentos.patches.length + "</b><span>patches</span></div>" +
    "</div>";

    /* Aviso sobre os percentuais serem estimativas */
    html += aviso(
      "<b>About the attachment percentages:</b> Ubisoft does not publish attachment usage numbers. " +
      "All percentages on this site are <b>community estimates</b> " +
      "(guides, Reddit and pro players), with a confidence indicator on each item. " +
      "Weapon damage numbers and balance changes come from Ubisoft's official notes.");

    /* Operadores recém-chegados */
    html += cabecalhoDeSecao("Featured", "Recently released operators", "Signature gadgets from recent seasons.");
    html += '<div class="grid-ops">';
    ultimosOperadores.forEach(function (lancamento) {
      var operador = DADOS.operators.filter(function (item) {
        return normalizar(item.name) === normalizar(lancamento.name);
      })[0];

      if (operador) {
        html += cartaoDoOperador(operador);
      } else {
        /* O Operador do balanceamento nao esta no cadastro: mostra so o texto. */
        html += '<div class="card"><div class="card-top"><div class="card-title"><h3>' + escapar(lancamento.name) +
          '</h3><div class="sub">' + escapar(lancamento.gadget) + "</div></div></div>" +
          '<div class="card-body"><div class="gadget-line">' + escapar(lancamento.description || "") + "</div></div></div>";
      }
    });
    html += "</div>";

    /* Últimos balanceamentos */
    html += cabecalhoDeSecao("Balance", "Latest patch notes", "Official numbers straight from Ubisoft's notes.",
      '<a class="btn" href="#/noticias?tab=balanceamentos">View all</a>');
    html += '<div class="home-grid">';
    ultimosPatches.forEach(function (patch) {
      html += '<div class="card"><div class="card-top"><div class="card-title">' +
        '<span class="wc-type">' + escapar(patch.label) + " &middot; " + escapar(patch.version) + "</span>" +
        '<h3 style="margin-top:2px">' + escapar(formatarData(patch.date)) + "</h3>" +
        '<div class="sub">' + escapar(patch.headline || "") + "</div></div></div>" +
        '<div class="card-body"><div class="gadget-line">' +
        (patch.balance || []).length + " balance changes</div></div>" +
        '<div class="card-foot"><span class="empurra" style="margin:0">' + escapar(patch.season) + "</span></div></div>";
    });
    html += "</div>";

    /* Notícias e ranking, lado a lado */
    html += '<div class="two-col" style="margin-top:34px">';

    html += "<div>" + cabecalhoDeSecao("News", "Latest news", "",
      '<a class="btn" href="#/noticias">View all</a>') +
      listaDeNoticias((DADOS.news.items || []).slice(0, 4), true) + "</div>";

    html += "<div>" + cabecalhoDeSecao("Ranking", "Top teams",
      "Official qualification points for SI 2027.", '<a class="btn" href="#/rankings">View ranking</a>') +
      '<div class="rank-teaser">' + DADOS.rankings.teams.slice(0, 6).map(function (time, indice) {
        return '<div class="rt"><span class="p">' + (indice + 1) + '</span><div><div class="n">' + escapar(time.name) +
          '</div><div class="r">' + escapar(time.region) + " &middot; " + time.siPoints + " pts SI</div></div></div>";
      }).join("") + "</div></div>";

    html += "</div>";

    return html;
  }

  /* -----------------------------------------------------------------
     LISTA DE OPERADORES
     ----------------------------------------------------------------- */

  /* Aplica os filtros da URL e devolve só quem passou em todos.
     Obs: o filtro de CTU continua chamado "ctu" na URL (e não "unit",
     como o campo do arquivo) para os links salvos no navegador não
     deixarem de funcionar. */
  function filtrarOperadores(filtros) {
    return DADOS.operators.filter(function (operador) {
      if (filtros.side && operador.side !== filtros.side) return false;
      if (filtros.speed && String(operador.speed) !== filtros.speed) return false;
      if (filtros.health && String(operador.health) !== filtros.health) return false;
      if (filtros.year && String(operador.year) !== filtros.year) return false;
      if (filtros.role && operador.roles.indexOf(filtros.role) === -1) return false;
      if (filtros.ctu && operador.unit !== filtros.ctu) return false;

      if (filtros.q) {
        var textoBuscado = normalizar(filtros.q);
        var textoDoOperador = normalizar([
          operador.name, operador.unit, operador.region, operador.gadget,
          operador.gadgetDescription, operador.uniqueAbility, operador.bio,
          operador.year, operador.roles.join(" ")
        ].join(" "));
        if (textoDoOperador.indexOf(textoBuscado) === -1) return false;
      }
      return true;
    });
  }

  function paginaOperadores(filtros) {
    var lista = filtrarOperadores(filtros);

    /* Listas dos <select>: CTUs e anos que existem de fato no cadastro. */
    var unidades = [];
    DADOS.operators.forEach(function (operador) {
      if (unidades.indexOf(operador.unit) === -1) unidades.push(operador.unit);
    });
    unidades.sort();

    var anos = [];
    DADOS.operators.forEach(function (operador) {
      if (anos.indexOf(operador.year) === -1) anos.push(operador.year);
    });
    anos.sort(function (a, b) { return b - a; });

    /* Monta as <option> de um <select> de filtro. */
    function opcoes(valores, selecionado, textoPadrao) {
      var html = '<option value="">' + textoPadrao + "</option>";
      valores.forEach(function (valor) {
        var marcado = String(selecionado) === String(valor) ? " selected" : "";
        html += '<option value="' + escapar(valor) + '"' + marcado + ">" + escapar(valor) + "</option>";
      });
      return html;
    }

    var temFiltro = filtros.side || filtros.role || filtros.ctu ||
                    filtros.speed || filtros.health || filtros.year || filtros.q;

    var html = "";
    html += cabecalhoDeSecao("Operators", "The " + DADOS.operators.length + " operators",
      "Main gadget, secondary gadgets, unique ability and weapons for each operator.");
    html += migalhas([{ texto: "Home", link: "#/" }, { texto: "Operators" }]);

    /* Barra de filtros */
    html += '<div class="toolbar">' +
      '<span class="filtro-rotulo">Filters</span>' +
      '<select id="f-side" aria-label="Side">' + opcoes(["ATK", "DEF"], filtros.side, "All sides") + "</select>" +
      '<select id="f-role" aria-label="Role">' + opcoes(DADOS.roles.map(function (funcao) { return funcao.id; }), filtros.role, "All roles") + "</select>" +
      '<select id="f-ctu" aria-label="CTU">' + opcoes(unidades, filtros.ctu, "All CTUs") + "</select>" +
      '<select id="f-speed" aria-label="Speed">' + opcoes([1, 2, 3], filtros.speed, "Any speed") + "</select>" +
      '<select id="f-health" aria-label="Health">' + opcoes([100, 110, 125], filtros.health, "Any health") + "</select>" +
      '<select id="f-year" aria-label="Year">' + opcoes(anos, filtros.year, "Any year") + "</select>" +
      '<div class="divider"></div>' +
      '<input class="filtro-campo" id="f-q" type="search" placeholder="Search filters..." value="' +
        escapar(filtros.q || "") + '" aria-label="Search filters">' +
      '<span class="filtro-contagem"><b>' + lista.length + "</b> of " + DADOS.operators.length + "</span>" +
      (temFiltro ? '<a class="btn" href="#/agentes">Clear</a>' : "") +
    "</div>";

    if (!lista.length) {
      html += '<div class="empty-state"><b>No operators found</b>Try removing a filter.</div>';
    } else {
      html += '<div class="grid-ops">' + lista.map(cartaoDoOperador).join("") + "</div>";
    }

    /* Explicação do pool de gadgets secundários */
    html += cabecalhoDeSecao("Reference", "Secondary gadget pool",
      "Free-choice gadgets each operator carries in addition to the signature gadget. This changes between seasons: check the current patch.");
    html += '<div class="panes">';
    ["ATK", "DEF"].forEach(function (lado) {
      html += '<div class="pane"><h3>' + (lado === "ATK" ? "Attacker pool" : "Defender pool") + "</h3><ul class='sec-list'>";
      DADOS.gadgetPool[lado].forEach(function (gadget) {
        html += "<li><span class='gadget-icone'>" + (lado === "ATK" ? "A" : "D") + "</span><div><b>" +
          escapar(gadget.name) + "</b><small>" + escapar(gadget.description) + "</small></div></li>";
      });
      html += "</ul></div>";
    });
    html += "</div>";

    return html;
  }

  /* -----------------------------------------------------------------
     DETALHE DE UM OPERADOR
     ----------------------------------------------------------------- */
  function paginaOperador(id) {
    var operador = acharOperador(id);
    if (!operador) {
      return '<div class="empty-state"><b>Operator not found</b><a href="#/agentes">Back to the list</a></div>';
    }

    var classeDoLado = operador.side === "ATK" ? "atk" : "def";
    var armas = DADOS.operatorWeapons(operador);
    var todasAsArmas = armas.primary.concat(armas.secondary);
    var bolinhasDeVida = operador.health === 125 ? 3 : operador.health === 110 ? 2 : 1;

    var html = "";

    html += migalhas([
      { texto: "Home", link: "#/" },
      { texto: "Operators", link: "#/agentes" },
      { texto: operador.name }
    ]);

    html += '<section class="detail-hero ' + classeDoLado + '">' +
      avatarDoOperador(operador) +
      "<div>" +
        '<span class="eyebrow">' + nomeDoLado(operador.side) + " &middot; " + escapar(operador.unit) + "</span>" +
        "<h1>" + escapar(operador.name) + "</h1>" +
        '<div class="badges">' +
          '<span class="badge">' + escapar(operador.region) + "</span>" +
          '<span class="badge">released in <b>' + operador.year + "</b></span>" +
          '<span class="badge">health <b>' + operador.health + "</b> " + bolinhas(bolinhasDeVida) + "</span>" +
          '<span class="badge">speed <b>' + operador.speed + "</b> " + bolinhas(operador.speed, classeDoLado) + "</span>" +
          operador.roles.map(function (funcao) {
            return '<span class="badge gold">' + escapar(nomeDaFuncao(funcao)) + "</span>";
          }).join("") +
        "</div>" +
        '<p class="muted" style="max-width:70ch">' + escapar(operador.bio) + "</p>" +
      "</div>" +
    "</section>";

    html += '<div class="panes">';

    /* Gadget principal */
    html += '<div class="pane"><h3>Main gadget</h3>' +
      '<div class="gadget-box"><h4>' + escapar(operador.gadget) + "</h4><p>" + escapar(operador.gadgetDescription) + "</p></div>" +
      '<p class="small muted" style="margin:0">Gadget class: <b>' + escapar(operador.gadgetType) + "</b></p></div>";

    /* Habilidade única */
    html += '<div class="pane"><h3>Unique ability</h3>' +
      '<div class="gadget-box unique"><p class="lead-big">' + escapar(operador.uniqueAbility) + "</p></div>" +
      '<p class="small muted" style="margin:0">This is what sets this operator apart from everyone else on the same side.</p></div>';

    /* Gadgets secundários */
    html += '<div class="pane"><h3>Secondary gadgets (' + operador.secondaryGadgets.length + ")</h3><ul class='sec-list'>";
    operador.secondaryGadgets.forEach(function (nomeDoGadget) {
      var descricaoDoGadget = DADOS.gadgetPool[operador.side].filter(function (gadget) {
        return normalizar(gadget.name) === normalizar(nomeDoGadget);
      })[0];
      html += "<li><span class='gadget-icone'>" + (operador.side === "ATK" ? "A" : "D") + "</span><div><b>" +
        escapar(nomeDoGadget) + "</b>" +
        (descricaoDoGadget ? "<small>" + escapar(descricaoDoGadget.description) + "</small>" : "") + "</div></li>";
    });
    html += "</ul></div>";

    /* Armas */
    html += '<div class="pane full"><h3>Weapons (' + (todasAsArmas.length + 1) + ")</h3>";
    if (!armas.primary.length && !armas.secondary.length) {
      html += '<p class="muted">No firearms recorded for this operator.</p>';
    } else {
      if (armas.primary.length) {
        html += '<p class="small muted" style="margin-bottom:8px">Primary weapon</p><div class="weapon-rows">';
        armas.primary.forEach(function (arma) { html += linhaDaArma(arma, true); });
        html += "</div>";
      }
      if (armas.secondary.length) {
        html += '<p class="small muted" style="margin:16px 0 8px">Secondary weapon</p><div class="weapon-rows">';
        armas.secondary.forEach(function (arma) { html += linhaDaArma(arma, false); });
        html += "</div>";
      }
      html += aviso("The percentages below are <b>community estimates</b>. Ubisoft does not publish " +
        "attachment usage. Click a weapon to see the effect of each attachment and which operators also use it.", "info");
    }
    html += "</div>";

    /* Melhor uso */
    html += '<div class="pane full"><h3>Best use</h3><p class="lead-big">' + escapar(operador.best) + "</p></div>";
    html += "</div>";

    /* Botões de operador anterior e próximo */
    var posicao = DADOS.operators.indexOf(operador);
    var anterior = DADOS.operators[posicao - 1];
    var proximo = DADOS.operators[posicao + 1];

    html += '<div style="display:flex;gap:10px;margin-top:20px;flex-wrap:wrap">' +
      (anterior ? '<a class="btn" href="#/agente/' + codificarParaLink(anterior.id) + '">&larr; ' + escapar(anterior.name) + "</a>" : "") +
      (proximo ? '<a class="btn" href="#/agente/' + codificarParaLink(proximo.id) + '">' + escapar(proximo.name) + " &rarr;</a>" : "") +
      '<a class="btn btn-primary" href="#/agentes">All operators</a></div>';

    return html;
  }

  /* Uma arma dentro da página de um Operador, com as barras de peça. */
  function linhaDaArma(arma, ehPrimaria) {
    var temMeta = !!arma.meta;
    var rotulo = ehPrimaria ? "primary weapon" : "secondary weapon";

    return '<div class="wrow" data-wrow>' +
      '<button class="wrow-head" data-wtoggle>' +
        '<span class="arrow">&#9656;</span>' +
        '<span class="wname">' + escapar(arma.name) + "</span>" +
        '<span class="wtype">' + escapar(arma.type) + "</span>" +
        '<span class="empurra">' + (temMeta ? "attachment meta" : "no meta data") + "</span>" +
      "</button>" +
      '<div class="wrow-body">' +
        '<div class="wrow-stats">' +
          "<span><b>Damage</b> " + escapar(arma.damage) + "</span>" +
          "<span><b>RPM</b> " + escapar(arma.rpm) + "</span>" +
          "<span><b>Magazine</b> " + escapar(arma.magazine) + "</span>" +
          "<span><b>Slots</b> " + arma.slots.length + "</span>" +
          "<span><b>Type</b> " + rotulo + "</span>" +
        "</div>" +
        (arma.note ? '<p class="small muted">' + escapar(arma.note) + "</p>" : "") +
        (temMeta ? barrasDaMeta(arma) :
          '<p class="small muted" style="margin:8px 0 0">No attachment meta data for this weapon. ' +
          "Check the <a class='src-link' href='" + escapar(CONFIG.sources.attachments) + "' target='_blank' rel='noopener'>attachments wiki</a> to see what each slot accepts.</p>") +
        '<p class="small" style="margin:12px 0 0"><a class="src-link" href="#/arma/' +
          codificarParaLink(arma.name) + '">Open full weapon page</a></p>' +
      "</div></div>";
  }

  /* As barras de percentual de peça, uma por slot. */
  function barrasDaMeta(arma) {
    var html = "";

    arma.slots.forEach(function (slot) {
      var pegas = (arma.meta && arma.meta[slot]) || [];
      if (!pegas.length) return;

      html += '<div class="slot-block"><div class="slot-name">' + escapar(nomeDoSlot(slot)) + "</div>";
      pegas.forEach(function (peca) {
        html += '<div class="bar"><div class="bar-top"><b>' + escapar(peca.name) + " " +
          etiquetaConfianca(peca.confidence) + '</b><span>' + peca.percent + "%</span></div>" +
          '<div class="bar-track"><div class="bar-fill" style="width:' + Math.min(100, peca.percent) + '%"></div></div></div>';
      });
      html += "</div>";
    });

    if (!html) return '<p class="small muted">This weapon has no attachment slots with meta data.</p>';
    return html;
  }

  /* -----------------------------------------------------------------
     LISTA DE ARMAS
     ----------------------------------------------------------------- */
  var TIPOS_DE_ARMA = ["AR", "SMG", "LMG", "SHOTGUN", "MARKSMAN", "SNIPER", "PISTOL", "SHIELD", "MELEE", "LAUNCHER"];

  function paginaArmas(filtros) {
    var lista = DADOS.weapons.filter(function (arma) {
      if (filtros.type && arma.type !== filtros.type) return false;
      if (filtros.only === "meta" && !arma.meta) return false;

      if (filtros.q) {
        var textoBuscado = normalizar(filtros.q);
        var textoDaArma = normalizar([arma.name, arma.type, arma.note || ""].join(" "));
        if (textoDaArma.indexOf(textoBuscado) === -1) return false;
      }
      return true;
    });

    /* Só oferece no filtro os tipos que existem no catálogo. */
    var tiposQueExistem = TIPOS_DE_ARMA.filter(function (tipo) {
      return DADOS.weapons.some(function (arma) { return arma.type === tipo; });
    });
    var opcoesDeTipo = tiposQueExistem.map(function (tipo) {
      return '<option value="' + tipo + '"' + (filtros.type === tipo ? " selected" : "") + ">" + tipo + "</option>";
    }).join("");

    var temFiltro = filtros.type || filtros.q || filtros.only;

    var html = "";
    html += cabecalhoDeSecao("Weapons", "Weapons catalog",
      "Weapon stats, attachment slots and the estimated usage of the most popular attachments.");
    html += migalhas([{ texto: "Home", link: "#/" }, { texto: "Weapons" }]);

    html += '<div class="toolbar">' +
      '<span class="filtro-rotulo">Filters</span>' +
      '<select id="w-type" aria-label="Type"><option value="">All types</option>' + opcoesDeTipo + "</select>" +
      '<div class="divider"></div>' +
      '<input class="filtro-campo" id="w-q" type="search" placeholder="Search weapons..." value="' +
        escapar(filtros.q || "") + '" aria-label="Search weapons">' +
      '<span class="filtro-contagem"><b>' + lista.length + "</b> of " + DADOS.weapons.length + "</span>" +
      (temFiltro ? '<a class="btn" href="#/armas">Clear</a>' : "") +
    "</div>";

    html += aviso("<b>Attachment percentages are estimates.</b> No source publicly measures attachment usage in R6. " +
      "The numbers come from consensus among guides, Reddit and pro players, with confidence shown per item. " +
      "Weapon damage data comes from Ubisoft's official notes.", "info");

    html += '<div class="grid-weapons">' + lista.map(cartaoDaArma).join("") + "</div>";

    /* Meta global, um painel por slot */
    html += cabecalhoDeSecao("Reference", "Global attachment meta", "Estimated usage distribution across all weapons in the game.");
    html += '<div class="panes">' +
      painelDaMetaGlobal("cano", "Barrel / Muzzle") +
      painelDaMetaGlobal("grip", "Grip") +
      painelDaMetaGlobal("mira", "Sight / Scope") +
      painelDaMetaGlobal("under", "Under-barrel") +
    "</div>";

    /* Tabela com o efeito de cada peca */
    html += cabecalhoDeSecao("Reference", "Effect of each attachment", "Values measured and documented by the attachments wiki.");
    html += '<div class="tbl-scroll"><table><thead><tr><th>Attachment</th><th>Slot</th><th>Effect</th><th>Usage confidence</th></tr></thead><tbody>';
    Object.keys(DADOS.attachmentEffects).forEach(function (nomeDaPeca) {
      var peca = DADOS.attachmentEffects[nomeDaPeca];
      html += "<tr><td><b>" + escapar(nomeDaPeca) + "</b></td><td>" + escapar(nomeDoSlot(peca.slot)) +
        "</td><td>" + escapar(peca.description) + "</td><td>" + etiquetaConfianca(peca.confidence) + "</td></tr>";
    });
    html += "</tbody></table></div>";

    return html;
  }

  /* Um painel da meta global (cano, grip, mira ou under). */
  function painelDaMetaGlobal(slot, titulo) {
    var linhas = DADOS.metaGlobal[slot] || [];
    var html = '<div class="pane"><h3>' + escapar(titulo) + "</h3>";

    linhas.forEach(function (linha) {
      var percentual = parseInt(linha.percent, 10);
      var largura = isNaN(percentual) ? 0 : Math.min(100, percentual);
      html += '<div class="bar"><div class="bar-top"><b>' + escapar(linha.name) + " " +
        etiquetaConfianca(linha.confidence) + '</b><span>' + escapar(linha.percent) + "</span></div>" +
        '<div class="bar-track"><div class="bar-fill" style="width:' + largura + '%"></div></div>' +
        '<div class="small muted" style="margin-top:3px">' + escapar(linha.description) + "</div></div>";
    });

    return html + "</div>";
  }

  /* -----------------------------------------------------------------
     DETALHE DE UMA ARMA
     ----------------------------------------------------------------- */
  function paginaArma(nome) {
    var arma = acharArma(nome);
    if (!arma) {
      return '<div class="empty-state"><b>Weapon not found</b><a href="#/armas">Back to the catalog</a></div>';
    }

    var operadoresQueUsam = DADOS.weaponOperators(arma.name);
    var html = "";

    html += migalhas([
      { texto: "Home", link: "#/" },
      { texto: "Weapons", link: "#/armas" },
      { texto: arma.name }
    ]);

    html += '<section class="detail-hero" style="border-left-color:var(--dourado)">' +
      '<div class="avatar">' + escapar(iniciais(arma.name)) + "</div>" +
      "<div>" +
        '<span class="eyebrow">' + escapar(arma.type) + "</span>" +
        "<h1>" + escapar(arma.name) + "</h1>" +
        '<div class="badges">' +
          '<span class="badge">damage <b>' + escapar(arma.damage) + "</b></span>" +
          '<span class="badge">' + escapar(arma.rpm) + " <b>rpm</b></span>" +
          '<span class="badge">magazine <b>' + escapar(arma.magazine) + "</b></span>" +
          '<span class="badge">slots <b>' + arma.slots.length + "</b></span>" +
          '<span class="badge">' + operadoresQueUsam.length + " <b>operators</b></span>" +
        "</div>" +
        (arma.note ? '<p class="muted" style="max-width:70ch">' + escapar(arma.note) + "</p>" : "") +
      "</div></section>";

    html += '<div class="panes">';

    html += '<div class="pane"><h3>Attachment meta per slot</h3>' +
      (arma.meta ? barrasDaMeta(arma) : '<p class="muted">No measured attachment meta or consensus data for this weapon. ' +
        "Check the wiki for available slots and effects.</p>") + "</div>";

    html += '<div class="pane"><h3>Available slots</h3><ul class="sec-list">';
    if (!arma.slots.length) {
      html += '<li><span class="gadget-icone">-</span><div><b>No slots</b><small>This weapon does not accept attachments.</small></div></li>';
    }
    arma.slots.forEach(function (slot) {
      html += "<li><span class='gadget-icone'>" + escapar(slot.charAt(0).toUpperCase()) + "</span><div><b>" +
        escapar(nomeDoSlot(slot)) + "</b></div></li>";
    });
    html += "</ul></div>";

    html += '<div class="pane full"><h3>Operators that use it</h3>';
    if (!operadoresQueUsam.length) {
      html += '<p class="muted">No operators mapped.</p>';
    } else {
      html += '<div class="grid-ops">' + operadoresQueUsam.map(cartaoDoOperador).join("") + "</div>";
    }
    html += "</div>";

    html += "</div>";
    return html;
  }

  /* -----------------------------------------------------------------
     NOTICIAS
     ----------------------------------------------------------------- */

  /* A lista de notícias. Com "resumido = true", corta o texto em 2 frases. */
  function listaDeNoticias(itens, resumido) {
    if (!itens.length) return '<div class="empty-state"><b>Nothing here</b></div>';

    return '<div class="news-list">' + itens.map(function (noticia) {
      var partesDaData = String(noticia.date).split("-");
      var texto = resumido ? noticia.summary.split(". ").slice(0, 2).join(". ") + "." : noticia.summary;

      return '<article class="news-card">' +
        '<div class="news-date"><b>' + Number(partesDaData[2]) + "</b><span>" +
          NOMES_DOS_MESES[Number(partesDaData[1]) - 1] + " " + partesDaData[0] + "</span></div>" +
        "<div>" +
          "<h3>" + escapar(noticia.title) + "</h3>" +
          "<p>" + escapar(texto) + "</p>" +
          '<div class="news-meta">' +
            '<span class="pill ' + escapar(noticia.category) + '">' + escapar(nomeDaCategoria(noticia.category)) + "</span>" +
            (noticia.status && noticia.status !== "live"
              ? '<span class="pill ' + escapar(noticia.status) + '">' + escapar(nomeDoStatus(noticia.status)) + "</span>"
              : "") +
            (noticia.sourceUrl
              ? '<a class="src-link" href="' + escapar(noticia.sourceUrl) + '" target="_blank" rel="noopener">official source</a>'
              : "") +
          "</div>" +
        "</div></article>";
    }).join("") + "</div>";
  }

  function paginaNoticias(filtros) {
    var aba = filtros.tab === "balanceamentos" ? "balanceamentos" : "noticias";
    var itens = (DADOS.news.items || []).slice().sort(function (a, b) {
      return a.date < b.date ? 1 : -1;
    });

    /* Categorias que existem nas notícias */
    var categorias = [];
    itens.forEach(function (noticia) {
      if (categorias.indexOf(noticia.category) === -1) categorias.push(noticia.category);
    });
    categorias.sort();

    if (filtros.cat) {
      itens = itens.filter(function (noticia) { return noticia.category === filtros.cat; });
    }

    var html = "";
    html += cabecalhoDeSecao("News", "News and balance",
      "Official Ubisoft patch notes, season announcements, in-game events and esports results.");
    html += migalhas([{ texto: "Home", link: "#/" }, { texto: "News" }]);

    html += '<div class="tabs">' +
      '<button class="tab' + (aba === "noticias" ? " on" : "") + '" data-tab="noticias">News</button>' +
      '<button class="tab' + (aba === "balanceamentos" ? " on" : "") + '" data-tab="balanceamentos">Balance</button>' +
    "</div>";

    if (aba === "noticias") {
      html += '<div class="toolbar"><span class="filtro-rotulo">Categories</span>' +
        '<a class="chip' + (!filtros.cat ? " on" : "") + '" href="#/noticias?tab=noticias">All</a>' +
        categorias.map(function (categoria) {
          return '<a class="chip' + (filtros.cat === categoria ? " on" : "") +
            '" href="#/noticias?tab=noticias&cat=' + encodeURIComponent(categoria) + '">' +
            escapar(nomeDaCategoria(categoria)) + "</a>";
        }).join("") +
        '<span class="filtro-contagem"><b>' + itens.length + "</b> items</span></div>";

      html += listaDeNoticias(itens);
      html += aviso("Content summarized from official Ubisoft sources and esports sites. " +
        "Click &ldquo;official source&rdquo; for the original announcement.", "info");
    } else {
      html += listaDePatches();
    }

    return html;
  }

  /* A aba de balanceamentos: todas as patch notes, uma dobra dentro da outra. */
  function listaDePatches() {
    var patches = DADOS.patchnotes;
    var html = aviso("<b>Source:</b> official Ubisoft patch notes. " +
      "Expanding a patch shows highlights, new content, balance table and fixes.", "info");

    html += '<div class="toolbar">' +
      '<span class="filtro-rotulo">Legend</span>' +
      '<span class="pill buff">Buff</span><span class="pill nerf">Nerf</span><span class="pill mixed">Mixed</span>' +
      '<span class="filtro-contagem"><b>' + patches.patches.length + "</b> patches mapped</span>" +
      '<button class="btn" id="expand-all">Expand all</button></div>';

    html += patches.patches.map(function (patch) {
      return caixaDoPatch(patch);
    }).join("");

    return html;
  }

  /* Monta um patch. A parte de dentro fica escondida até clicar. */
  function caixaDoPatch(patch) {
    var mudancas = patch.balance || [];
    var destaques = patch.highlights || [];
    var correcoes = patch.bugFixes || {};
    var totalDeCorrecoes = (correcoes.gameplay || []).length + (correcoes.ui || []).length;
    var dentro = "";

    if (destaques.length) {
      dentro += "<h4>Highlights</h4><ul>" +
        destaques.map(function (linha) { return "<li>" + escapar(linha) + "</li>"; }).join("") + "</ul>";
    }

    if ((patch.newOperators || []).length) {
      dentro += "<h4>New operators</h4><ul>" +
        patch.newOperators.map(function (nome) { return "<li><b>" + escapar(nome) + "</b></li>"; }).join("") + "</ul>";
    }

    if ((patch.newMaps || []).length) {
      dentro += "<h4>Maps</h4><ul>" +
        patch.newMaps.map(function (nome) { return "<li>" + escapar(nome) + "</li>"; }).join("") + "</ul>";
    }

    if (mudancas.length) {
      dentro += "<h4>Balance changes (" + mudancas.length + ")</h4>" +
        '<div class="tbl-scroll"><table><thead><tr>' +
        "<th>Target</th><th>Gadget / weapon</th><th>Change</th><th>Direction</th></tr></thead><tbody>" +
        mudancas.map(function (mudanca) {
          return "<tr><td><b>" + escapar(mudanca.operator || mudanca.target || "-") + "</b></td><td>" +
            escapar(mudanca.gadget || "-") + "</td><td>" + escapar(mudanca.change) + "</td><td>" +
            etiquetaDirecao(mudanca.direction) + "</td></tr>";
        }).join("") +
        "</tbody></table></div>";
    } else {
      dentro += '<p class="small muted" style="margin:10px 0 0">This note brought no balance changes for operator, gadget or weapon.</p>';
    }

    if (totalDeCorrecoes) {
      dentro += "<h4>Fixes (" + totalDeCorrecoes + ")</h4><details><summary>View fixes</summary><ul>" +
        (correcoes.gameplay || []).map(function (linha) { return "<li>" + escapar(linha) + "</li>"; }).join("") +
        (correcoes.ui || []).map(function (linha) { return '<li class="muted">' + escapar(linha) + "</li>"; }).join("") +
        "</ul></details>";
    }

    dentro += '<p class="small" style="margin-top:14px"><a class="src-link" href="' + escapar(patch.sourceUrl) +
      '" target="_blank" rel="noopener">official patch notes</a></p>';

    return '<div class="patch" data-patch="' + escapar(patch.version) + '">' +
      '<button class="patch-head" data-ptoggle>' +
        '<span class="patch-ver">' + escapar(patch.version) + "</span>" +
        "<span><span class='patch-seen'>" + escapar(patch.label) + " &middot; " + escapar(patch.type) +
          " &middot; " + escapar(formatarData(patch.date)) + "</span>" +
        '<div class="patch-title">' + escapar(patch.headline || "") + "</div></span>" +
        '<span class="empurra"></span>' +
        '<span class="patch-seen">' + mudancas.length + " changes</span>" +
        '<span class="arrow">&#9656;</span>' +
      "</button>" +
      '<div class="patch-body">' + dentro + "</div>" +
    "</div>";
  }

  /* -----------------------------------------------------------------
     RANKINGS
     ----------------------------------------------------------------- */

  /* Estado da API opcional de ranking. Vazio = usa a lista do arquivo. */
  var estadoDaApi = {
    ligada: !!CONFIG.rankingApiUrl,
    carregando: false,
    carregada: false,
    erro: ""
  };

  /* Tenta buscar o ranking na API. Se falhar, continua com a lista local. */
  function carregarRankingDaApi() {
    if (!estadoDaApi.ligada || estadoDaApi.carregando || estadoDaApi.carregada) return;
    estadoDaApi.carregando = true;

    fetch(CONFIG.rankingApiUrl, { headers: CONFIG.rankingApiHeaders || {} })
      .then(function (resposta) {
        if (!resposta.ok) throw new Error("HTTP " + resposta.status);
        return resposta.json();
      })
      .then(function (dados) {
        if (dados && Array.isArray(dados.teams) && dados.teams.length) DADOS.rankings.teams = dados.teams;
        if (dados && Array.isArray(dados.solo) && dados.solo.length) DADOS.rankings.solo = dados.solo;
        estadoDaApi.carregada = true;
        if (lerUrl().pedacos[0] === "rankings") desenharPagina();
      })
      .catch(function (erro) {
        estadoDaApi.erro = String(erro && erro.message || erro);
      })
      .then(function () {
        estadoDaApi.carregando = false;
      });
  }

  /* A etiqueta que mostra de onde veio o ranking. */
  function etiquetaDaOrigem() {
    if (!estadoDaApi.ligada) {
      return '<span class="badge">source: <b>local snapshot</b> (' + escapar(formatarData(CONFIG.snapshot)) + ")</span>";
    }
    if (estadoDaApi.carregada) return '<span class="badge gold">source: <b>live API</b></span>';
    if (estadoDaApi.carregando) return '<span class="badge">source: <b>querying API...</b></span>';
    return '<span class="badge">source: <b>local snapshot</b> (API unavailable: ' +
      escapar(estadoDaApi.erro || "no connection") + ")</span>";
  }

  function paginaRankings(filtros) {
    var aba = filtros.tab === "solo" ? "solo" : "times";
    var ranking = DADOS.rankings;
    var html = "";

    html += cabecalhoDeSecao("Rankings", "Teams and players", "Official ranking, with sources and reference date.");
    html += migalhas([{ texto: "Home", link: "#/" }, { texto: "Rankings" }]);

    html += '<div class="toolbar"><span class="filtro-rotulo">Data source</span>' + etiquetaDaOrigem() +
      '<span class="filtro-contagem">snapshot ' + escapar(formatarData(ranking.snapshot)) + "</span></div>";

    html += '<div class="tabs">' +
      '<button class="tab' + (aba === "times" ? " on" : "") + '" data-tab="times">Teams</button>' +
      '<button class="tab' + (aba === "solo" ? " on" : "") + '" data-tab="solo">Solo / players</button>' +
    "</div>";

    if (aba === "times") {
      html += aviso("<b>Important:</b> " + escapar(ranking.disclaimer.teams), "info");

      /* Tabela dos times principais */
      html += '<div class="tbl-scroll"><table><thead><tr>' +
        "<th>#</th><th>Team</th><th>Region</th><th>Roster</th><th>Titles</th><th>Rolling 12m</th><th>SI pts</th>" +
        "</tr></thead><tbody>";
      ranking.teams.forEach(function (time) {
        html += '<tr class="rank-medals rank-' + time.position + '"><td class="num"><b>' + time.position + "</b></td>" +
          '<td><div class="team-cell"><span class="team-logo">' + escapar(iniciais(time.name)) + "</span>" +
          '<div><div class="tn"><a href="#">' + escapar(time.name) + "</a></div>" +
          (time.coach && time.coach !== "-" ? '<div class="tr">coach ' + escapar(time.coach) + "</div>" : "") +
          "</div></div>" +
          (time.note ? '<div class="small muted" style="margin-top:6px">' + escapar(time.note) + "</div>" : "") + "</td>" +
          "<td>" + escapar(time.region) + "</td>" +
          '<td class="small">' + escapar(time.team) + "</td>" +
          '<td><ul class="titles">' + (time.titles || []).map(function (titulo) {
            return "<li>" + escapar(titulo) + "</li>";
          }).join("") + "</ul></td>" +
          "<td><b>#" + time.rollingPosition + "</b> <span class='muted small'>" + escapar(time.rollingPoints) + " pts</span></td>" +
          "<td><b>" + escapar(time.siPoints) + "</b></td></tr>";
      });
      html += "</tbody></table></div>";

      /* Tabela dos outros times */
      html += cabecalhoDeSecao("References", "Other teams in the ranking",
        "Positions in the 12-month rolling ranking and the Six Invitational points ranking.");
      html += '<div class="tbl-scroll"><table><thead><tr>' +
        "<th>Team</th><th>Rolling 12m</th><th>SI points pos.</th><th>Notes</th></tr></thead><tbody>";
      ranking.teamsMore.forEach(function (time) {
        html += "<tr><td><b>" + escapar(time.name) + "</b></td><td>#" + escapar(time.rollingPosition) +
          "</td><td>#" + escapar(time.siPosition) + "</td>" +
          '<td class="small muted">' + escapar(time.note || "") + "</td></tr>";
      });
      html += "</tbody></table></div>";

      /* Contexto dos próximos eventos */
      html += cabecalhoDeSecao("Circuit", "Upcoming events and context");
      html += '<div class="home-grid">' +
        '<div class="pane"><h3>Next Major</h3><p class="lead-big">' + escapar(ranking.circuit.majorNext.name) + "</p>" +
          "<p>" + escapar(ranking.circuit.majorNext.date) + " &middot; " + escapar(ranking.circuit.majorNext.place) + " &middot; " +
          escapar(ranking.circuit.majorNext.teams) + " teams</p>" +
          '<p class="small muted">' + escapar(ranking.circuit.majorNext.note) + "</p></div>" +
        '<div class="pane"><h3>Next Six Invitational</h3><p class="lead-big">' + escapar(ranking.circuit.siNext.name) + "</p>" +
          "<p>" + escapar(ranking.circuit.siNext.date) + " &middot; " + escapar(ranking.circuit.siNext.place) + "</p>" +
          '<p class="small muted">Qualified so far: <b>' + escapar(ranking.circuit.qualifiedSoFar.join(", ")) + "</b>. " +
          escapar(ranking.circuit.siNext.note) + "</p></div>" +
        '<div class="pane"><h3>Ranked 3.0</h3><p class="lead-big">' + escapar(ranking.circuit.ranked.name) + "</p>" +
          "<p>Since " + escapar(formatarData(ranking.circuit.ranked.since)) + " (" + escapar(ranking.circuit.ranked.season) + ")</p>" +
          '<p class="small muted">' + escapar(ranking.circuit.ranked.note) + "</p></div>" +
      "</div>";
    } else {
      html += aviso("<b>Honest notice:</b> " + escapar(ranking.disclaimer.solo), "info");

      html += '<div class="expand-note" style="margin-bottom:18px">' +
        "If you set <code class='mono'>rankingApiUrl</code> in " +
        "<code class='mono'>assets/js/config.js</code>, this tab tries to fetch a live JSON endpoint " +
        "(format <code class='mono'>{ teams: [...], solo: [...] }</code>) and comes up with fresh data; " +
        "if the endpoint fails, the local snapshot below is kept. Current status: " + etiquetaDaOrigem() + ". " +
        "With no API configured, the site shows verified real names and titles, without inventing MMR." +
      "</div>";

      html += '<div class="tbl-scroll"><table><thead><tr>' +
        "<th>#</th><th>Player</th><th>Country</th><th>Team</th><th>MMR / RP</th><th>Notes</th>" +
        "</tr></thead><tbody>";
      ranking.solo.forEach(function (jogador) {
        html += '<tr class="rank-medals rank-' + jogador.position + '"><td class="num"><b>' + escapar(jogador.position) + "</b></td>" +
          "<td><div class='team-cell'><span class='team-logo'>" + escapar(iniciais(jogador.nickname)) + "</span>" +
          '<div><div class="tn">' + escapar(jogador.nickname) + '</div><div class="tr">' + escapar(jogador.realName) + "</div></div></div></td>" +
          "<td>" + escapar(jogador.country) + "</td>" +
          "<td>" + escapar(jogador.team) + "</td>" +
          '<td><span class="mmr-na">no public MMR</span></td>' +
          '<td class="small">' + escapar(jogador.note) + "</td></tr>";
      });
      html += "</tbody></table></div>";
    }

    html += '<p class="small muted" style="margin-top:18px">Ranking reference date: <b>' +
      escapar(formatarData(ranking.snapshot)) + "</b>. Sources: " +
      '<a class="src-link" href="' + escapar(CONFIG.sources.standings) + '" target="_blank" rel="noopener">Ubisoft global standings</a> e ' +
      '<a class="src-link" href="' + escapar(CONFIG.sources.sixstats) + '" target="_blank" rel="noopener">SixStats</a>.</p>';

    return html;
  }

  /* =================================================================
     PARTE 5 - A DECISAO DE QUAL PAGINA MOSTRAR
     ================================================================= */

  var ultimoCaminho = null;

  function desenharPagina() {
    var url = lerUrl();
    var filtros = url.filtros;
    var secao = url.pedacos[0] || "";
    var html = "";

    /* Quando a página é redesenhada por causa de um filtro, o cursor
       do campo de busca não pode pular. Guardamos onde ele estava. */
    var elementoFocado = document.activeElement;
    var idDoCampoFocado = (elementoFocado && elementoFocado.id && AREA_PRINCIPAL.contains(elementoFocado))
      ? elementoFocado.id : null;
    var posicaoDoCursor = (idDoCampoFocado && elementoFocado.selectionStart != null)
      ? elementoFocado.selectionStart : null;

    if (secao === "") {
      html = paginaInicial();
    } else if (secao === "agentes") {
      html = paginaOperadores(filtros);
    } else if (secao === "agente") {
      html = paginaOperador(decodeURIComponent(url.pedacos[1] || ""));
    } else if (secao === "armas") {
      html = paginaArmas(filtros);
    } else if (secao === "arma") {
      html = paginaArma(url.pedacos[1] ? decodeURIComponent(url.pedacos[1]) : "");
    } else if (secao === "noticias") {
      html = paginaNoticias(filtros);
    } else if (secao === "rankings") {
      html = paginaRankings(filtros);
    } else {
      html = '<div class="empty-state"><b>Page not found</b><a href="#/">Back to home</a></div>';
    }

    AREA_PRINCIPAL.innerHTML = html;
    document.title = "R6-HUB";

    /* Marca no menu qual aba está aberta */
    document.querySelectorAll("#nav a").forEach(function (link) {
      var chave = link.getAttribute("data-nav");
      var estaAberto = (chave === "/" && secao === "") ||
                       (chave && chave === secao) ||
                       (chave === "agentes" && secao === "agente") ||
                       (chave === "armas" && secao === "arma");
      link.classList.toggle("active", !!estaAberto);
    });

    ligarBotoes();

    /* Devolve o cursor para o campo de busca */
    if (idDoCampoFocado) {
      var campo = document.getElementById(idDoCampoFocado);
      if (campo) {
        campo.focus();
        if (posicaoDoCursor != null && campo.setSelectionRange) {
          try { campo.setSelectionRange(posicaoDoCursor, posicaoDoCursor); } catch (erro) { /* ignora */ }
        }
      }
    }

    /* Só volta ao topo quando mudou de página, não a cada filtro */
    if (ultimoCaminho === null || ultimoCaminho !== url.caminho) window.scrollTo(0, 0);
    ultimoCaminho = url.caminho;

    if (secao === "rankings") carregarRankingDaApi();
  }

  function ligarBotoes() {

    /* Abre e fecha a linha de uma arma */
    AREA_PRINCIPAL.querySelectorAll("[data-wtoggle]").forEach(function (botao) {
      botao.addEventListener("click", function () {
        botao.parentNode.classList.toggle("open");
        botao.querySelector(".empurra").textContent =
          botao.parentNode.classList.contains("open") ? "close" : "attachment meta";
      });
    });

    /* Abre e fecha um patch */
    AREA_PRINCIPAL.querySelectorAll("[data-ptoggle]").forEach(function (botao) {
      botao.addEventListener("click", function () {
        botao.parentNode.classList.toggle("open");
      });
    });

    /* Botão "Expandir tudo" / "Recolher tudo" */
    var botaoExpandir = pegarElemento("expand-all");
    if (botaoExpandir) {
      botaoExpandir.addEventListener("click", function () {
        var todosOsPatches = AREA_PRINCIPAL.querySelectorAll(".patch");
        var jaAbertos = AREA_PRINCIPAL.querySelectorAll(".patch.open").length;
        var querAbrir = jaAbertos < todosOsPatches.length / 2;
        todosOsPatches.forEach(function (patch) { patch.classList.toggle("open", querAbrir); });
        botaoExpandir.textContent = querAbrir ? "Collapse all" : "Expand all";
      });
    }

    /* Abas (Notícias / Balanceamentos / Times / Solo) */
    AREA_PRINCIPAL.querySelectorAll("[data-tab]").forEach(function (botao) {
      botao.addEventListener("click", function () {
        var mudanca = {};
        mudanca.tab = botao.getAttribute("data-tab");
        mudarFiltro(mudanca);
      });
    });

    /* Lê um <select> de filtro e joga o valor na URL. */
    function ligarSelecao(idDoCampo, nomeDoFiltro) {
      var campo = pegarElemento(idDoCampo);
      if (!campo) return;
      campo.addEventListener("change", function () {
        var mudanca = {};
        mudanca[nomeDoFiltro] = campo.value;
        mudarFiltro(mudanca);
      });
    }

    ligarSelecao("f-side", "side");
    ligarSelecao("f-role", "role");
    ligarSelecao("f-ctu", "ctu");
    ligarSelecao("f-speed", "speed");
    ligarSelecao("f-health", "health");
    ligarSelecao("f-year", "year");
    ligarSelecao("w-type", "type");

    /* Campo de busca de filtro. Espera a pessoa parar de digitar
       antes de redesenhar, senão a página pisca a cada tecla. */
    function ligarBusca(idDoCampo, nomeDoFiltro) {
      var campo = pegarElemento(idDoCampo);
      if (!campo) return;
      var tempoEspera = null;
      campo.addEventListener("input", function () {
        clearTimeout(tempoEspera);
        var valorDigitado = campo.value;
        tempoEspera = setTimeout(function () {
          var mudanca = {};
          mudanca[nomeDoFiltro] = valorDigitado;
          mudarFiltro(mudanca);
        }, 320);
      });
    }

    ligarBusca("f-q", "q");
    ligarBusca("w-q", "q");
  }

  /* =================================================================
     A BUSCA NO TOPO DA PAGINA
     ================================================================= */
  function buscaGlobal(termo) {
    var caixa = pegarElemento("search-results");
    var texto = normalizar(termo);

    if (texto.length < 2) {
      caixa.hidden = true;
      caixa.innerHTML = "";
      return;
    }

    var operadores = DADOS.operators.filter(function (operador) {
      return normalizar([operador.name, operador.unit, operador.region, operador.gadget, operador.gadgetType].join(" "))
        .indexOf(texto) !== -1;
    }).slice(0, 7);

    var armas = DADOS.weapons.filter(function (arma) {
      return normalizar([arma.name, arma.type].join(" ")).indexOf(texto) !== -1;
    }).slice(0, 6);

    var html = "";

    if (operadores.length) {
      html += '<div class="busca-grupo"><div class="busca-titulo">Operators</div>';
      operadores.forEach(function (operador) {
        html += '<a class="busca-item" href="#/agente/' + codificarParaLink(operador.id) + '">' +
          '<span class="etiqueta-lado ' + (operador.side === "ATK" ? "atk" : "def") + '">' + siglaDoLado(operador.side) + "</span>" +
          "<span><b>" + escapar(operador.name) + '</b><br><small>' + escapar(operador.gadget) + "</small></span></a>";
      });
      html += "</div>";
    }

    if (armas.length) {
      html += '<div class="busca-grupo"><div class="busca-titulo">Weapons</div>';
      armas.forEach(function (arma) {
        html += '<a class="busca-item" href="#/arma/' + codificarParaLink(arma.name) + '">' +
          '<span class="etiqueta-lado def">' + escapar(arma.type) + "</span>" +
          "<span><b>" + escapar(arma.name) + '</b><br><small>' + escapar(arma.damage) +
          " damage &middot; " + escapar(arma.magazine) + "</small></span></a>";
      });
      html += "</div>";
    }

    if (!html) {
      html = '<div class="busca-vazia">Nothing found for &ldquo;' + escapar(termo) + "&rdquo;.</div>";
    }

    caixa.innerHTML = html;
    caixa.hidden = false;
  }

  /* =================================================================
     PARTE 7 - INICIALIZACAO (roda uma vez, quando a página abre)
     ================================================================= */
  function iniciar() {

    /* Lista de fontes no rodapé */
    var listaDeFontes = pegarElemento("footer-sources");
    if (listaDeFontes) {
      var fontes = CONFIG.sources;
      listaDeFontes.innerHTML = [
        ["Operators (Ubisoft)", fontes.operators],
        ["Operators (wiki)", fontes.wiki],
        ["Official patch notes", fontes.patchNotes],
        ["Pro ranking", fontes.standings],
        ["Rolling 12m ranking", fontes.sixstats],
        ["Attachments and effects", fontes.attachments]
      ].map(function (fonte) {
        return '<li><a href="' + escapar(fonte[1]) + '" target="_blank" rel="noopener">' + escapar(fonte[0]) + "</a></li>";
      }).join("");
    }

    /* Menu no celular: o botão de três riscos abre e fecha */
    var botaoMenu = pegarElemento("burger");
    var menu = pegarElemento("nav");

    botaoMenu.addEventListener("click", function () {
      var aberto = menu.classList.toggle("open");
      botaoMenu.setAttribute("aria-expanded", aberto ? "true" : "false");
    });

    menu.addEventListener("click", function (evento) {
      if (evento.target.tagName === "A") menu.classList.remove("open");
    });

    /* Busca do topo */
    var campoBusca = pegarElemento("search-input");
    var caixaResultados = pegarElemento("search-results");
    var tempoDeEspera = null;

    campoBusca.addEventListener("input", function () {
      clearTimeout(tempoDeEspera);
      var digitado = campoBusca.value;
      tempoDeEspera = setTimeout(function () { buscaGlobal(digitado); }, 140);
    });

    /* Clique no campo já preenchido mostra o resultado de novo */
    campoBusca.addEventListener("focus", function () {
      if (campoBusca.value.length >= 2) buscaGlobal(campoBusca.value);
    });

    /* Clicou fora da busca? Fecha os resultados. */
    document.addEventListener("click", function (evento) {
      var clicouDentro = evento.target.closest("#search") || evento.target.closest("#search-results");
      if (!clicouDentro) caixaResultados.hidden = true;
    });

    /* Esc fecha a busca */
    campoBusca.addEventListener("keydown", function (evento) {
      if (evento.key === "Escape") {
        caixaResultados.hidden = true;
        campoBusca.blur();
      }
    });

    /* A página redesenha sozinha quando o endereço muda */
    window.addEventListener("hashchange", desenharPagina);
    desenharPagina();

    /* Na aba de balanceamentos, já abre o patch mais recente */
    var primeiroPatch = document.querySelector(".patch");
    if (primeiroPatch) primeiroPatch.classList.add("open");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
