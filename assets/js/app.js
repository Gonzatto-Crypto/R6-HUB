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
        escapar("Retrato do operador " + operador.name) + '" loading="lazy" decoding="async" onerror="this.remove()">' +
    "</div>";
  }

  var NOMES_DOS_MESES = ["jan", "fev", "mar", "abr", "mai", "jun",
                         "jul", "ago", "set", "out", "nov", "dez"];

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

  function nomeDoLado(lado) { return lado === "ATK" ? "Atacante" : "Defensor"; }
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
    "season-launch": "Inicio de temporada",
    "in-game-event": "Evento in-game",
    "ranked": "Ranked",
    "announcement": "Anuncio",
    "community": "Comunidade"
  };
  var TRADUCAO_STATUS = {
    "live": "ao vivo",
    "announcement": "anuncio",
    "preseason": "pre-temporada",
    "result": "resultado"
  };
  var TRADUCAO_SLOT = {
    mira: "Mira / Luneta",
    under: "Sousbarrel",
    grip: "Grip",
    cano: "Cano / Boca"
  };
  var TRADUCAO_CONFIANCA = { alta: "confianca alta", media: "confianca media", baixa: "confianca baixa" };

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
    var texto = direcao === "buff" ? "Buff" : direcao === "nerf" ? "Nerf" : "Misto";
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
      '<div class="card-body"><div class="gadget-line"><b>Gadget principal</b>' + escapar(operador.gadget) + "</div></div>" +
      '<div class="card-foot">' +
        '<span class="stat-mini"><i>vida</i>' + bolinhas(bolinhasDeVida) + operador.health + "</span>" +
        '<span class="stat-mini"><i>vel</i>' + bolinhas(operador.speed, classeDoLado) + operador.speed + "</span>" +
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
        '<div class="spec"><b>' + escapar(arma.damage) + '</b><span>dano</span></div>' +
        '<div class="spec"><b>' + escapar(arma.rpm) + '</b><span>rpm</span></div>' +
        '<div class="spec"><b>' + escapar(arma.magazine) + '</b><span>carreg.</span></div>' +
        '<div class="spec"><b>' + arma.slots.length + '</b><span>slots</span></div>' +
      "</div>" +
      '<div class="card-foot"><span class="meta-flag">' + (arma.meta ? "meta de pecas" : "sem meta") + "</span>" +
      '<span class="empurra">ver</span></div></a>';
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
        '<span class="eyebrow">Hub de comunidade &middot; dados de ' + escapar(formatarData(CONFIG.snapshot)) + "</span>" +
        "<h1>Rainbow Six <span>Siege</span> em um so lugar</h1>" +
        '<p class="lead">Os ' + DADOS.operators.length + ' operadores com gadget principal, gadgets secundarios, ' +
        "habilidade unica e armas, com o percentual estimado das pecas mais usadas. Mais as patch notes oficiais, " +
        "noticias do jogo e os rankings.</p>" +
        '<div class="hero-acoes">' +
          '<a class="btn btn-primary" href="#/agentes">Ver os ' + DADOS.operators.length + " operadores</a>" +
          '<a class="btn" href="#/armas">Catalogo de armas</a>' +
          '<a class="btn" href="#/noticias">Balanceamentos</a>' +
        "</div>" +
      "</div>" +
      '<div class="season-card">' +
        '<span class="sc-label">Temporada atual</span>' +
        '<div class="sc-name">' + escapar(temporadaAtual.name) + "</div>" +
        '<div class="sc-date">' + escapar(temporadaAtual.label) + " &middot; desde " + escapar(formatarData(temporadaAtual.startedAt)) + "</div>" +
        "<hr>" +
        "<ul>" +
          "<li><b>Patch mais recente:</b> " + escapar(ultimosPatches[0].version) + " (" + escapar(formatarData(ultimosPatches[0].date)) + ")</li>" +
          "<li><b>Operador novo:</b> " + escapar(ultimosOperadores[0].name) + " &mdash; " + escapar(ultimosOperadores[0].gadget) + "</li>" +
          "<li><b>" + balanceamentos.patches.length + "</b> patches de balanceamento mapeados</li>" +
          "<li><b>Proximo evento:</b> " + escapar(DADOS.rankings.circuit.majorNext.name) + "</li>" +
        "</ul>" +
      "</div>" +
    "</section>";

    /* Números grandes */
    html += '<div class="stats">' +
      '<div class="stat"><b>' + DADOS.operators.length + "</b><span>operadores</span></div>" +
      '<div class="stat"><b>' + totalAtacantes + " / " + totalDefensores + "</b><span>atacantes / defensores</span></div>" +
      '<div class="stat"><b>' + DADOS.weapons.length + "</b><span>armas no catalogo</span></div>" +
      '<div class="stat"><b>' + Object.keys(DADOS.attachmentEffects).length + "</b><span>tipos de peca</span></div>" +
      '<div class="stat"><b>' + balanceamentos.patches.length + "</b><span>patches</span></div>" +
    "</div>";

    /* Aviso sobre os percentuais serem estimativas */
    html += aviso(
      "<b>Sobre os percentuais de pecas:</b> a Ubisoft nao publica o numero de uso de pecas. " +
      "Todos os percentuais deste site sao <b>estimativas da comunidade</b> " +
      "(guias, Reddit e jogadores profissionais), com um indicador de confianca em cada item. " +
      "Os numeros de dano das armas e os balanceamentos vem das notas oficiais da Ubisoft.");

    /* Operadores recém-chegados */
    html += cabecalhoDeSecao("Destaque", "Operadores lancados recentemente", "Gadgets assinatura das ultimas temporadas.");
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
    html += cabecalhoDeSecao("Balanceamento", "Ultimas patch notes", "Numeros oficiais direto das notas da Ubisoft.",
      '<a class="btn" href="#/noticias?tab=balanceamentos">Ver todas</a>');
    html += '<div class="home-grid">';
    ultimosPatches.forEach(function (patch) {
      html += '<div class="card"><div class="card-top"><div class="card-title">' +
        '<span class="wc-type">' + escapar(patch.label) + " &middot; " + escapar(patch.version) + "</span>" +
        '<h3 style="margin-top:2px">' + escapar(formatarData(patch.date)) + "</h3>" +
        '<div class="sub">' + escapar(patch.headline || "") + "</div></div></div>" +
        '<div class="card-body"><div class="gadget-line">' +
        (patch.balance || []).length + " mudancas de balanceamento</div></div>" +
        '<div class="card-foot"><span class="empurra" style="margin:0">' + escapar(patch.season) + "</span></div></div>";
    });
    html += "</div>";

    /* Notícias e ranking, lado a lado */
    html += '<div class="two-col" style="margin-top:34px">';

    html += "<div>" + cabecalhoDeSecao("Noticias", "Ultimas noticias", "",
      '<a class="btn" href="#/noticias">Ver todas</a>') +
      listaDeNoticias((DADOS.news.items || []).slice(0, 4), true) + "</div>";

    html += "<div>" + cabecalhoDeSecao("Ranking", "Times no topo",
      "Pontos oficiais de qualificacao para o SI 2027.", '<a class="btn" href="#/rankings">Ver ranking</a>') +
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
    html += cabecalhoDeSecao("Operadores", "Os " + DADOS.operators.length + " agentes",
      "Gadget principal, gadgets secundarios, habilidade unica e armas de cada operador.");
    html += migalhas([{ texto: "Inicio", link: "#/" }, { texto: "Agentes" }]);

    /* Barra de filtros */
    html += '<div class="toolbar">' +
      '<span class="filtro-rotulo">Filtros</span>' +
      '<select id="f-side" aria-label="Lado">' + opcoes(["ATK", "DEF"], filtros.side, "Todos os lados") + "</select>" +
      '<select id="f-role" aria-label="Funcao">' + opcoes(DADOS.roles.map(function (funcao) { return funcao.id; }), filtros.role, "Todas as funcoes") + "</select>" +
      '<select id="f-ctu" aria-label="CTU">' + opcoes(unidades, filtros.ctu, "Todas as CTUs") + "</select>" +
      '<select id="f-speed" aria-label="Velocidade">' + opcoes([1, 2, 3], filtros.speed, "Qualquer velocidade") + "</select>" +
      '<select id="f-health" aria-label="Vida">' + opcoes([100, 110, 125], filtros.health, "Qualquer vida") + "</select>" +
      '<select id="f-year" aria-label="Ano">' + opcoes(anos, filtros.year, "Qualquer ano") + "</select>" +
      '<div class="divider"></div>' +
      '<input class="filtro-campo" id="f-q" type="search" placeholder="Buscar no filtro..." value="' +
        escapar(filtros.q || "") + '" aria-label="Buscar no filtro">' +
      '<span class="filtro-contagem"><b>' + lista.length + "</b> de " + DADOS.operators.length + "</span>" +
      (temFiltro ? '<a class="btn" href="#/agentes">Limpar</a>' : "") +
    "</div>";

    if (!lista.length) {
      html += '<div class="empty-state"><b>Nenhum operador encontrado</b>Tente remover algum filtro.</div>';
    } else {
      html += '<div class="grid-ops">' + lista.map(cartaoDoOperador).join("") + "</div>";
    }

    /* Explicação do pool de gadgets secundários */
    html += cabecalhoDeSecao("Referencia", "Pool de gadgets secundarios",
      "Gadgets de escolha livre que cada operador carrega alem do gadget assinatura. Isso muda entre temporadas: confira o patch atual.");
    html += '<div class="panes">';
    ["ATK", "DEF"].forEach(function (lado) {
      html += '<div class="pane"><h3>' + (lado === "ATK" ? "Pool de atacante" : "Pool de defensor") + "</h3><ul class='sec-list'>";
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
      return '<div class="empty-state"><b>Operador nao encontrado</b><a href="#/agentes">Voltar para a lista</a></div>';
    }

    var classeDoLado = operador.side === "ATK" ? "atk" : "def";
    var armas = DADOS.operatorWeapons(operador);
    var todasAsArmas = armas.primary.concat(armas.secondary);
    var bolinhasDeVida = operador.health === 125 ? 3 : operador.health === 110 ? 2 : 1;

    var html = "";

    html += migalhas([
      { texto: "Inicio", link: "#/" },
      { texto: "Agentes", link: "#/agentes" },
      { texto: operador.name }
    ]);

    html += '<section class="detail-hero ' + classeDoLado + '">' +
      avatarDoOperador(operador) +
      "<div>" +
        '<span class="eyebrow">' + nomeDoLado(operador.side) + " &middot; " + escapar(operador.unit) + "</span>" +
        "<h1>" + escapar(operador.name) + "</h1>" +
        '<div class="badges">' +
          '<span class="badge">' + escapar(operador.region) + "</span>" +
          '<span class="badge">lancado em <b>' + operador.year + "</b></span>" +
          '<span class="badge">vida <b>' + operador.health + "</b> " + bolinhas(bolinhasDeVida) + "</span>" +
          '<span class="badge">velocidade <b>' + operador.speed + "</b> " + bolinhas(operador.speed, classeDoLado) + "</span>" +
          operador.roles.map(function (funcao) {
            return '<span class="badge gold">' + escapar(nomeDaFuncao(funcao)) + "</span>";
          }).join("") +
        "</div>" +
        '<p class="muted" style="max-width:70ch">' + escapar(operador.bio) + "</p>" +
      "</div>" +
    "</section>";

    html += '<div class="panes">';

    /* Gadget principal */
    html += '<div class="pane"><h3>Gadget principal</h3>' +
      '<div class="gadget-box"><h4>' + escapar(operador.gadget) + "</h4><p>" + escapar(operador.gadgetDescription) + "</p></div>" +
      '<p class="small muted" style="margin:0">Classe do gadget: <b>' + escapar(operador.gadgetType) + "</b></p></div>";

    /* Habilidade única */
    html += '<div class="pane"><h3>Habilidade unica</h3>' +
      '<div class="gadget-box unique"><p class="lead-big">' + escapar(operador.uniqueAbility) + "</p></div>" +
      '<p class="small muted" style="margin:0">E o que separa este operador de todos os outros do mesmo lado.</p></div>';

    /* Gadgets secundários */
    html += '<div class="pane"><h3>Gadgets secundarios (' + operador.secondaryGadgets.length + ")</h3><ul class='sec-list'>";
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
    html += '<div class="pane full"><h3>Armas (' + (todasAsArmas.length + 1) + ")</h3>";
    if (!armas.primary.length && !armas.secondary.length) {
      html += '<p class="muted">Nenhuma arma de fogo registrada para este operador.</p>';
    } else {
      if (armas.primary.length) {
        html += '<p class="small muted" style="margin-bottom:8px">Arma principal</p><div class="weapon-rows">';
        armas.primary.forEach(function (arma) { html += linhaDaArma(arma, true); });
        html += "</div>";
      }
      if (armas.secondary.length) {
        html += '<p class="small muted" style="margin:16px 0 8px">Arma secundaria</p><div class="weapon-rows">';
        armas.secondary.forEach(function (arma) { html += linhaDaArma(arma, false); });
        html += "</div>";
      }
      html += aviso("Os percentuais abaixo sao <b>estimativas da comunidade</b>. A Ubisoft nao publica " +
        "percentual de uso de pecas. Clique na arma para ver o efeito de cada peca e quais operadores tambem a usam.", "info");
    }
    html += "</div>";

    /* Melhor uso */
    html += '<div class="pane full"><h3>Melhor uso</h3><p class="lead-big">' + escapar(operador.best) + "</p></div>";
    html += "</div>";

    /* Botões de operador anterior e próximo */
    var posicao = DADOS.operators.indexOf(operador);
    var anterior = DADOS.operators[posicao - 1];
    var proximo = DADOS.operators[posicao + 1];

    html += '<div style="display:flex;gap:10px;margin-top:20px;flex-wrap:wrap">' +
      (anterior ? '<a class="btn" href="#/agente/' + codificarParaLink(anterior.id) + '">&larr; ' + escapar(anterior.name) + "</a>" : "") +
      (proximo ? '<a class="btn" href="#/agente/' + codificarParaLink(proximo.id) + '">' + escapar(proximo.name) + " &rarr;</a>" : "") +
      '<a class="btn btn-primary" href="#/agentes">Todos os operadores</a></div>';

    return html;
  }

  /* Uma arma dentro da página de um Operador, com as barras de peça. */
  function linhaDaArma(arma, ehPrimaria) {
    var temMeta = !!arma.meta;
    var rotulo = ehPrimaria ? "arma principal" : "arma secundaria";

    return '<div class="wrow" data-wrow>' +
      '<button class="wrow-head" data-wtoggle>' +
        '<span class="arrow">&#9656;</span>' +
        '<span class="wname">' + escapar(arma.name) + "</span>" +
        '<span class="wtype">' + escapar(arma.type) + "</span>" +
        '<span class="empurra">' + (temMeta ? "meta de pecas" : "sem dados de meta") + "</span>" +
      "</button>" +
      '<div class="wrow-body">' +
        '<div class="wrow-stats">' +
          "<span><b>Dano</b> " + escapar(arma.damage) + "</span>" +
          "<span><b>RPM</b> " + escapar(arma.rpm) + "</span>" +
          "<span><b>Carregador</b> " + escapar(arma.magazine) + "</span>" +
          "<span><b>Slots</b> " + arma.slots.length + "</span>" +
          "<span><b>Tipo</b> " + rotulo + "</span>" +
        "</div>" +
        (arma.note ? '<p class="small muted">' + escapar(arma.note) + "</p>" : "") +
        (temMeta ? barrasDaMeta(arma) :
          '<p class="small muted" style="margin:8px 0 0">Nao ha dados de meta de pecas para esta arma. ' +
          "Consulte a <a class='src-link' href='" + escapar(CONFIG.sources.attachments) + "' target='_blank' rel='noopener'>wiki de attachments</a> para ver o que cada slot aceita.</p>") +
        '<p class="small" style="margin:12px 0 0"><a class="src-link" href="#/arma/' +
          codificarParaLink(arma.name) + '">Abrir pagina completa da arma</a></p>' +
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

    if (!html) return '<p class="small muted">Esta arma nao tem slots de peca com dados de meta.</p>';
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
    html += cabecalhoDeSecao("Armas", "Catalogo de armas",
      "Stats das armas, slots de peca e o percentual estimado das pecas mais usadas pelos jogadores.");
    html += migalhas([{ texto: "Inicio", link: "#/" }, { texto: "Armas" }]);

    html += '<div class="toolbar">' +
      '<span class="filtro-rotulo">Filtros</span>' +
      '<select id="w-type" aria-label="Tipo"><option value="">Todos os tipos</option>' + opcoesDeTipo + "</select>" +
      '<div class="divider"></div>' +
      '<input class="filtro-campo" id="w-q" type="search" placeholder="Buscar arma..." value="' +
        escapar(filtros.q || "") + '" aria-label="Buscar arma">' +
      '<span class="filtro-contagem"><b>' + lista.length + "</b> de " + DADOS.weapons.length + "</span>" +
      (temFiltro ? '<a class="btn" href="#/armas">Limpar</a>' : "") +
    "</div>";

    html += aviso("<b>Percentuais de pecas sao estimativas.</b> Nenhuma fonte publica mede o uso de pecas em R6. " +
      "Os numeros vem do consenso entre guias, Reddit e jogadores profissionais, com confianca indicada por item. " +
      "Os dados de dano das armas vem das notas oficiais da Ubisoft.", "info");

    html += '<div class="grid-weapons">' + lista.map(cartaoDaArma).join("") + "</div>";

    /* Meta global, um painel por slot */
    html += cabecalhoDeSecao("Referencia", "Meta global de pecas", "Distribuicao estimada de uso em todas as armas do jogo.");
    html += '<div class="panes">' +
      painelDaMetaGlobal("cano", "Cano / Boca") +
      painelDaMetaGlobal("grip", "Grip") +
      painelDaMetaGlobal("mira", "Mira / Luneta") +
      painelDaMetaGlobal("under", "Sousbarrel") +
    "</div>";

    /* Tabela com o efeito de cada peca */
    html += cabecalhoDeSecao("Referencia", "Efeito de cada peca", "Valores medidos e documentados pela wiki de attachments.");
    html += '<div class="tbl-scroll"><table><thead><tr><th>Peca</th><th>Slot</th><th>Efeito</th><th>Confianca do uso</th></tr></thead><tbody>';
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
      return '<div class="empty-state"><b>Arma nao encontrada</b><a href="#/armas">Voltar ao catalogo</a></div>';
    }

    var operadoresQueUsam = DADOS.weaponOperators(arma.name);
    var html = "";

    html += migalhas([
      { texto: "Inicio", link: "#/" },
      { texto: "Armas", link: "#/armas" },
      { texto: arma.name }
    ]);

    html += '<section class="detail-hero" style="border-left-color:var(--dourado)">' +
      '<div class="avatar">' + escapar(iniciais(arma.name)) + "</div>" +
      "<div>" +
        '<span class="eyebrow">' + escapar(arma.type) + "</span>" +
        "<h1>" + escapar(arma.name) + "</h1>" +
        '<div class="badges">' +
          '<span class="badge">dano <b>' + escapar(arma.damage) + "</b></span>" +
          '<span class="badge">' + escapar(arma.rpm) + " <b>rpm</b></span>" +
          '<span class="badge">carregador <b>' + escapar(arma.magazine) + "</b></span>" +
          '<span class="badge">slots <b>' + arma.slots.length + "</b></span>" +
          '<span class="badge">' + operadoresQueUsam.length + " <b>operadores</b></span>" +
        "</div>" +
        (arma.note ? '<p class="muted" style="max-width:70ch">' + escapar(arma.note) + "</p>" : "") +
      "</div></section>";

    html += '<div class="panes">';

    html += '<div class="pane"><h3>Meta de pecas por slot</h3>' +
      (arma.meta ? barrasDaMeta(arma) : '<p class="muted">Nao ha dados de meta de pecas medidos ou consenso para esta arma. ' +
        "Verifique a wiki para os slots e efeitos disponiveis.</p>") + "</div>";

    html += '<div class="pane"><h3>Slots disponiveis</h3><ul class="sec-list">';
    if (!arma.slots.length) {
      html += '<li><span class="gadget-icone">-</span><div><b>Sem slots</b><small>Esta arma nao aceita pecas.</small></div></li>';
    }
    arma.slots.forEach(function (slot) {
      html += "<li><span class='gadget-icone'>" + escapar(slot.charAt(0).toUpperCase()) + "</span><div><b>" +
        escapar(nomeDoSlot(slot)) + "</b></div></li>";
    });
    html += "</ul></div>";

    html += '<div class="pane full"><h3>Operadores que usam</h3>';
    if (!operadoresQueUsam.length) {
      html += '<p class="muted">Nenhum operador mapeado.</p>';
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
    if (!itens.length) return '<div class="empty-state"><b>Nada por aqui</b></div>';

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
              ? '<a class="src-link" href="' + escapar(noticia.sourceUrl) + '" target="_blank" rel="noopener">fonte oficial</a>'
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
    html += cabecalhoDeSecao("Noticias", "Noticias e balanceamentos",
      "Patch notes oficiais da Ubisoft, anuncios de temporada, eventos in-game e resultados de esports.");
    html += migalhas([{ texto: "Inicio", link: "#/" }, { texto: "Noticias" }]);

    html += '<div class="tabs">' +
      '<button class="tab' + (aba === "noticias" ? " on" : "") + '" data-tab="noticias">Noticias</button>' +
      '<button class="tab' + (aba === "balanceamentos" ? " on" : "") + '" data-tab="balanceamentos">Balanceamentos</button>' +
    "</div>";

    if (aba === "noticias") {
      html += '<div class="toolbar"><span class="filtro-rotulo">Categorias</span>' +
        '<a class="chip' + (!filtros.cat ? " on" : "") + '" href="#/noticias?tab=noticias">Todas</a>' +
        categorias.map(function (categoria) {
          return '<a class="chip' + (filtros.cat === categoria ? " on" : "") +
            '" href="#/noticias?tab=noticias&cat=' + encodeURIComponent(categoria) + '">' +
            escapar(nomeDaCategoria(categoria)) + "</a>";
        }).join("") +
        '<span class="filtro-contagem"><b>' + itens.length + "</b> itens</span></div>";

      html += listaDeNoticias(itens);
      html += aviso("Conteudo resumido de fontes oficiais da Ubisoft e de sites de esports. " +
        "Clique em &ldquo;fonte oficial&rdquo; para o anuncio original.", "info");
    } else {
      html += listaDePatches();
    }

    return html;
  }

  /* A aba de balanceamentos: todas as patch notes, uma dobra dentro da outra. */
  function listaDePatches() {
    var patches = DADOS.patchnotes;
    var html = aviso("<b>Fonte:</b> notas de patch oficiais da Ubisoft. " +
      "Expandir um patch mostra destaques, novidades, tabela de balanceamento e correcoes.", "info");

    html += '<div class="toolbar">' +
      '<span class="filtro-rotulo">Legenda</span>' +
      '<span class="pill buff">Buff</span><span class="pill nerf">Nerf</span><span class="pill mixed">Misto</span>' +
      '<span class="filtro-contagem"><b>' + patches.patches.length + "</b> patches mapeados</span>" +
      '<button class="btn" id="expand-all">Expandir tudo</button></div>';

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
      dentro += "<h4>Destaques</h4><ul>" +
        destaques.map(function (linha) { return "<li>" + escapar(linha) + "</li>"; }).join("") + "</ul>";
    }

    if ((patch.newOperators || []).length) {
      dentro += "<h4>Operadores novos</h4><ul>" +
        patch.newOperators.map(function (nome) { return "<li><b>" + escapar(nome) + "</b></li>"; }).join("") + "</ul>";
    }

    if ((patch.newMaps || []).length) {
      dentro += "<h4>Mapas</h4><ul>" +
        patch.newMaps.map(function (nome) { return "<li>" + escapar(nome) + "</li>"; }).join("") + "</ul>";
    }

    if (mudancas.length) {
      dentro += "<h4>Mudancas de balanceamento (" + mudancas.length + ")</h4>" +
        '<div class="tbl-scroll"><table><thead><tr>' +
        "<th>Alvo</th><th>Gadget / arma</th><th>Mudanca</th><th>Direcao</th></tr></thead><tbody>" +
        mudancas.map(function (mudanca) {
          return "<tr><td><b>" + escapar(mudanca.operator || mudanca.target || "-") + "</b></td><td>" +
            escapar(mudanca.gadget || "-") + "</td><td>" + escapar(mudanca.change) + "</td><td>" +
            etiquetaDirecao(mudanca.direction) + "</td></tr>";
        }).join("") +
        "</tbody></table></div>";
    } else {
      dentro += '<p class="small muted" style="margin:10px 0 0">Esta nota nao trouxe mudancas de balanceamento de operador, gadget ou arma.</p>';
    }

    if (totalDeCorrecoes) {
      dentro += "<h4>Correcoes (" + totalDeCorrecoes + ")</h4><details><summary>Ver correcoes</summary><ul>" +
        (correcoes.gameplay || []).map(function (linha) { return "<li>" + escapar(linha) + "</li>"; }).join("") +
        (correcoes.ui || []).map(function (linha) { return '<li class="muted">' + escapar(linha) + "</li>"; }).join("") +
        "</ul></details>";
    }

    dentro += '<p class="small" style="margin-top:14px"><a class="src-link" href="' + escapar(patch.sourceUrl) +
      '" target="_blank" rel="noopener">patch notes oficiais</a></p>';

    return '<div class="patch" data-patch="' + escapar(patch.version) + '">' +
      '<button class="patch-head" data-ptoggle>' +
        '<span class="patch-ver">' + escapar(patch.version) + "</span>" +
        "<span><span class='patch-seen'>" + escapar(patch.label) + " &middot; " + escapar(patch.type) +
          " &middot; " + escapar(formatarData(patch.date)) + "</span>" +
        '<div class="patch-title">' + escapar(patch.headline || "") + "</div></span>" +
        '<span class="empurra"></span>' +
        '<span class="patch-seen">' + mudancas.length + " mudancas</span>" +
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
      return '<span class="badge">fonte: <b>snapshot local</b> (' + escapar(formatarData(CONFIG.snapshot)) + ")</span>";
    }
    if (estadoDaApi.carregada) return '<span class="badge gold">fonte: <b>API ao vivo</b></span>';
    if (estadoDaApi.carregando) return '<span class="badge">fonte: <b>consultando API...</b></span>';
    return '<span class="badge">fonte: <b>snapshot local</b> (API indisponivel: ' +
      escapar(estadoDaApi.erro || "sem conexao") + ")</span>";
  }

  function paginaRankings(filtros) {
    var aba = filtros.tab === "solo" ? "solo" : "times";
    var ranking = DADOS.rankings;
    var html = "";

    html += cabecalhoDeSecao("Rankings", "Times e jogadores", "Ranking oficial, com fontes e data de referencia.");
    html += migalhas([{ texto: "Inicio", link: "#/" }, { texto: "Rankings" }]);

    html += '<div class="toolbar"><span class="filtro-rotulo">Origem dos dados</span>' + etiquetaDaOrigem() +
      '<span class="filtro-contagem">snapshot ' + escapar(formatarData(ranking.snapshot)) + "</span></div>";

    html += '<div class="tabs">' +
      '<button class="tab' + (aba === "times" ? " on" : "") + '" data-tab="times">Times</button>' +
      '<button class="tab' + (aba === "solo" ? " on" : "") + '" data-tab="solo">Solo / jogadores</button>' +
    "</div>";

    if (aba === "times") {
      html += aviso("<b>Importante:</b> " + escapar(ranking.disclaimer.teams), "info");

      /* Tabela dos times principais */
      html += '<div class="tbl-scroll"><table><thead><tr>' +
        "<th>#</th><th>Time</th><th>Regiao</th><th>Elenco</th><th>Titulos</th><th>Rolling 12m</th><th>Pts SI</th>" +
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
      html += cabecalhoDeSecao("Referencias", "Outros times no ranking",
        "Posicoes no ranking rolling de 12 meses e no ranking de pontos do Six Invitational.");
      html += '<div class="tbl-scroll"><table><thead><tr>' +
        "<th>Time</th><th>Rolling 12m</th><th>Pos. pontos SI</th><th>Obs.</th></tr></thead><tbody>";
      ranking.teamsMore.forEach(function (time) {
        html += "<tr><td><b>" + escapar(time.name) + "</b></td><td>#" + escapar(time.rollingPosition) +
          "</td><td>#" + escapar(time.siPosition) + "</td>" +
          '<td class="small muted">' + escapar(time.note || "") + "</td></tr>";
      });
      html += "</tbody></table></div>";

      /* Contexto dos próximos eventos */
      html += cabecalhoDeSecao("Circuito", "Proximos eventos e contexto");
      html += '<div class="home-grid">' +
        '<div class="pane"><h3>Proximo Major</h3><p class="lead-big">' + escapar(ranking.circuit.majorNext.name) + "</p>" +
          "<p>" + escapar(ranking.circuit.majorNext.date) + " &middot; " + escapar(ranking.circuit.majorNext.place) + " &middot; " +
          escapar(ranking.circuit.majorNext.teams) + " times</p>" +
          '<p class="small muted">' + escapar(ranking.circuit.majorNext.note) + "</p></div>" +
        '<div class="pane"><h3>Proximo Six Invitational</h3><p class="lead-big">' + escapar(ranking.circuit.siNext.name) + "</p>" +
          "<p>" + escapar(ranking.circuit.siNext.date) + " &middot; " + escapar(ranking.circuit.siNext.place) + "</p>" +
          '<p class="small muted">Qualificados ate agora: <b>' + escapar(ranking.circuit.qualifiedSoFar.join(", ")) + "</b>. " +
          escapar(ranking.circuit.siNext.note) + "</p></div>" +
        '<div class="pane"><h3>Ranked 3.0</h3><p class="lead-big">' + escapar(ranking.circuit.ranked.name) + "</p>" +
          "<p>Desde " + escapar(formatarData(ranking.circuit.ranked.since)) + " (" + escapar(ranking.circuit.ranked.season) + ")</p>" +
          '<p class="small muted">' + escapar(ranking.circuit.ranked.note) + "</p></div>" +
      "</div>";
    } else {
      html += aviso("<b>Aviso honesto:</b> " + escapar(ranking.disclaimer.solo), "info");

      html += '<div class="expand-note" style="margin-bottom:18px">' +
        "Se voce configurar <code class='mono'>rankingApiUrl</code> em " +
        "<code class='mono'>assets/js/config.js</code>, esta aba tenta buscar um endpoint JSON ao vivo " +
        "(formato <code class='mono'>{ teams: [...], solo: [...] }</code>) e sobe com os dados fresh; " +
        "se o endpoint falhar, o snapshot local abaixo e mantido. Status atual: " + etiquetaDaOrigem() + ". " +
        "Sem API configurada, o site mostra nomes e titulos reais verificados, sem inventar MMR." +
      "</div>";

      html += '<div class="tbl-scroll"><table><thead><tr>' +
        "<th>#</th><th>Jogador</th><th>Pais</th><th>Time</th><th>MMR / RP</th><th>Notas</th>" +
        "</tr></thead><tbody>";
      ranking.solo.forEach(function (jogador) {
        html += '<tr class="rank-medals rank-' + jogador.position + '"><td class="num"><b>' + escapar(jogador.position) + "</b></td>" +
          "<td><div class='team-cell'><span class='team-logo'>" + escapar(iniciais(jogador.nickname)) + "</span>" +
          '<div><div class="tn">' + escapar(jogador.nickname) + '</div><div class="tr">' + escapar(jogador.realName) + "</div></div></div></td>" +
          "<td>" + escapar(jogador.country) + "</td>" +
          "<td>" + escapar(jogador.team) + "</td>" +
          '<td><span class="mmr-na">sem MMR publico</span></td>' +
          '<td class="small">' + escapar(jogador.note) + "</td></tr>";
      });
      html += "</tbody></table></div>";
    }

    html += '<p class="small muted" style="margin-top:18px">Data de referencia do ranking: <b>' +
      escapar(formatarData(ranking.snapshot)) + "</b>. Fontes: " +
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
      html = '<div class="empty-state"><b>Pagina nao encontrada</b><a href="#/">Voltar ao inicio</a></div>';
    }

    AREA_PRINCIPAL.innerHTML = html;
    document.title = tituloDaPagina(secao) + " | R6 HUB";

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

  function tituloDaPagina(secao) {
    return {
      "": "Hub de Rainbow Six Siege",
      "agentes": "Agentes",
      "agente": "Operador",
      "armas": "Armas",
      "arma": "Arma",
      "noticias": "Noticias e Balanceamento",
      "rankings": "Rankings"
    }[secao] || "R6 HUB";
  }

  /* =================================================================
     PARTE 6 - LIGAR OS BOTÕES
     =================================================================
     Tudo aqui é ligado depois que o HTML é montado, porque o conteúdo
     muda toda vez que o usuário troca de página.                          */
  function ligarBotoes() {

    /* Abre e fecha a linha de uma arma */
    AREA_PRINCIPAL.querySelectorAll("[data-wtoggle]").forEach(function (botao) {
      botao.addEventListener("click", function () {
        botao.parentNode.classList.toggle("open");
        botao.querySelector(".empurra").textContent =
          botao.parentNode.classList.contains("open") ? "fechar" : "meta de pecas";
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
        botaoExpandir.textContent = querAbrir ? "Recolher tudo" : "Expandir tudo";
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
      html += '<div class="busca-grupo"><div class="busca-titulo">Operadores</div>';
      operadores.forEach(function (operador) {
        html += '<a class="busca-item" href="#/agente/' + codificarParaLink(operador.id) + '">' +
          '<span class="etiqueta-lado ' + (operador.side === "ATK" ? "atk" : "def") + '">' + siglaDoLado(operador.side) + "</span>" +
          "<span><b>" + escapar(operador.name) + '</b><br><small>' + escapar(operador.gadget) + "</small></span></a>";
      });
      html += "</div>";
    }

    if (armas.length) {
      html += '<div class="busca-grupo"><div class="busca-titulo">Armas</div>';
      armas.forEach(function (arma) {
        html += '<a class="busca-item" href="#/arma/' + codificarParaLink(arma.name) + '">' +
          '<span class="etiqueta-lado def">' + escapar(arma.type) + "</span>" +
          "<span><b>" + escapar(arma.name) + '</b><br><small>' + escapar(arma.damage) +
          " dano &middot; " + escapar(arma.magazine) + "</small></span></a>";
      });
      html += "</div>";
    }

    if (!html) {
      html = '<div class="busca-vazia">Nada encontrado para &ldquo;' + escapar(termo) + "&rdquo;.</div>";
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
        ["Operadores (Ubisoft)", fontes.operators],
        ["Operadores (wiki)", fontes.wiki],
        ["Patch notes oficiais", fontes.patchNotes],
        ["Ranking profissional", fontes.standings],
        ["Ranking rolling 12m", fontes.sixstats],
        ["Pecas e efeitos", fontes.attachments]
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
