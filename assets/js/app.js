/* =========================================================
   R6 HUB - aplicacao (vanilla JS, sem build)
   Rotas por hash:
     #/                    home
     #/agentes?...         lista de operadores com filtros
     #/agente/<id>         detalhe do operador
     #/armas?...           catalogo de armas
     #/arma/<nome>         detalhe da arma
     #/noticias            noticias + balanceamentos (abas)
     #/rankings            rankings de times e solo (abas)
   ========================================================= */
(function () {
  "use strict";

  var D = window.R6HUB;
  var CFG = window.R6HUB_CONFIG;
  var main = document.getElementById("main");

  /* ------------------------------------------------ helpers */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function norm(s) {
    return String(s == null ? "" : s).toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }
  function initials(name) {
    var parts = String(name).replace(/[^A-Za-z0-9\u00C0-\u024F ]/g, " ").trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  var MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  function fmtDate(iso) {
    if (!iso) return "-";
    var d = String(iso).slice(0, 10).split("-");
    if (d.length !== 3) return iso;
    return Number(d[2]) + " " + MESES[Number(d[1]) - 1] + " " + d[0];
  }
  function dots(n, cls) {
    var h = '<span class="dots ' + (cls || "") + '">';
    for (var i = 1; i <= 3; i++) h += "<b" + (i <= n ? ' class="on"' : "") + "></b>";
    return h + "</span>";
  }
  function enc(v) { return encodeURIComponent(String(v)); }
  function sideLabel(s) { return s === "ATK" ? "Atacante" : "Defensor"; }
  function sideShort(s) { return s === "ATK" ? "ATK" : "DEF"; }
  function opById(id) {
    return D.operators.filter(function (o) { return o.id === id; })[0] || null;
  }
  function wByName(n) {
    return D.weaponIndex[String(n || "").toLowerCase()] || D.weaponIndex[norm(n)] || null;
  }
  var CAT_PT = {
    "esports": "Esports",
    "season-launch": "Inicio de temporada",
    "in-game-event": "Evento in-game",
    "ranked": "Ranked",
    "announcement": "Anuncio",
    "community": "Comunidade"
  };
  var STATUS_PT = {
    "live": "ao vivo",
    "announcement": "anuncio",
    "preseason": "pre-temporada",
    "result": "resultado"
  };
  function catLabel(c) { return CAT_PT[c] || c; }
  function statusLabel(s) { return STATUS_PT[s] || s; }
  function roleLabel(id) {
    var r = D.roles.filter(function (x) { return x.id === id; })[0];
    return r ? r.label : id;
  }
  function slotLabel(s) {
    return { mira: "Mira / Luneta", under: "Sousbarrel", grip: "Grip", cano: "Cano / Boca" }[s] || s;
  }
  function confTag(c) {
    var lbl = { alta: "confianca alta", media: "confianca media", baixa: "confianca baixa" }[c] || c;
    return '<span class="conf ' + (c || "") + '">' + esc(lbl) + "</span>";
  }
  function directionPill(d) {
    return '<span class="pill ' + (d || "mixed") + '">' +
      (d === "buff" ? "Buff" : d === "nerf" ? "Nerf" : "Misto") + "</span>";
  }

  /* ------------------------------------------------ query string */
  function parseHash() {
    var h = location.hash.replace(/^#/, "") || "/";
    var qIdx = h.indexOf("?");
    var path = qIdx === -1 ? h : h.slice(0, qIdx);
    var query = {};
    if (qIdx !== -1) {
      h.slice(qIdx + 1).split("&").forEach(function (kv) {
        if (!kv) return;
        var p = kv.split("=");
        query[decodeURIComponent(p[0])] = decodeURIComponent((p[1] || "").replace(/\+/g, " "));
      });
    }
    return { path: path, query: query, parts: path.split("/").filter(Boolean) };
  }
  function go(path, query) {
    var qs = "";
    if (query) {
      var arr = Object.keys(query).filter(function (k) { return query[k]; })
        .map(function (k) { return encodeURIComponent(k) + "=" + encodeURIComponent(query[k]); });
      if (arr.length) qs = "?" + arr.join("&");
    }
    location.hash = "#" + path + qs;
  }
  function currentQuery() { return parseHash().query; }
  function setQuery(patch) {
    var q = currentQuery();
    Object.keys(patch).forEach(function (k) {
      if (patch[k] == null || patch[k] === "") delete q[k];
      else q[k] = patch[k];
    });
    go(parseHash().path, q);
  }

  /* ------------------------------------------------ fragmentos */
  function secHead(kicker, title, desc, extra) {
    return '<div class="sec-head"><div><span class="kicker">' + esc(kicker) + "</span><h2>" +
      esc(title) + "</h2>" + (desc ? "<p>" + esc(desc) + "</p>" : "") + "</div>" +
      '<div class="spacer"></div>' + (extra || "") + "</div>";
  }
  function crumbs(items) {
    var h = '<nav class="crumbs">';
    items.forEach(function (it, i) {
      if (i) h += "<span>/</span>";
      h += it.href ? '<a href="' + esc(it.href) + '">' + esc(it.label) + "</a>" : "<span>" + esc(it.label) + "</span>";
    });
    return h + "</nav>";
  }
  function notice(text, kind) {
    return '<div class="notice ' + (kind || "") + '"><span class="n-ico">' + (kind === "info" ? "i" : "!") +
      "</span><div>" + text + "</div></div>";
  }
  function opCard(op) {
    return '<a class="card ' + (op.side === "ATK" ? "atk" : "def") + '" href="#/agente/' + enc(op.id) + '">' +
      '<div class="card-top">' +
        '<div class="avatar">' + esc(initials(op.n)) + "</div>" +
        '<div class="card-title"><h3>' + esc(op.n) + "</h3>" +
        '<div class="sub">' + esc(op.ctu) + " &middot; " + esc(op.reg) + "</div></div>" +
        '<span class="side-badge ' + (op.side === "ATK" ? "atk" : "def") + '">' + sideShort(op.side) + "</span>" +
      "</div>" +
      '<div class="card-body"><div class="gadget-line"><b>Gadget principal</b>' + esc(op.g) + "</div></div>" +
      '<div class="card-foot">' +
        '<span class="stat-mini"><i>vida</i>' + dots(op.h === 125 ? 3 : op.h === 110 ? 2 : 1) + op.h + "</span>" +
        '<span class="stat-mini"><i>vel</i>' + dots(op.sp, op.side === "ATK" ? "atk" : "def") + op.sp + "</span>" +
        '<span class="sp">' + esc(op.r.map(roleLabel).join(" / ")) + "</span>" +
      "</div></a>";
  }
  function wCard(w) {
    var hasMeta = !!w.meta;
    return '<a class="card w-card" href="#/arma/' + encodeURIComponent(w.n) + '">' +
      '<div class="card-top"><div class="card-title">' +
        '<span class="wc-type">' + esc(w.t) + "</span>" +
        '<h3 style="margin-top:2px">' + esc(w.n) + "</h3>" +
      "</div></div>" +
      '<div class="spec-row">' +
        '<div class="spec"><b>' + esc(w.dmg) + '</b><span>dano</span></div>' +
        '<div class="spec"><b>' + esc(w.rpm) + '</b><span>rpm</span></div>' +
        '<div class="spec"><b>' + esc(w.mag) + '</b><span>carreg.</span></div>' +
        '<div class="spec"><b>' + w.slots.length + '</b><span>slots</span></div>' +
      "</div>" +
      '<div class="card-foot"><span class="meta-flag">' + (hasMeta ? "meta de pecas" : "sem meta") + "</span>" +
      '<span class="sp">ver</span></div></a>';
  }

  /* ------------------------------------------------ home */
  function viewHome() {
    var ps = D.patchnotes;
    var season = ps.currentSeason;
    var latest = ps.patches.slice(0, 3);
    var rel = ps.operatorReleases.slice(0, 3);
    var news = (D.news.items || []).slice(0, 3);
    var atk = D.operators.filter(function (o) { return o.side === "ATK"; }).length;
    var def = D.operators.length - atk;

    var h = "";
    h += '<section class="hero">' +
      '<div>' +
        '<span class="eyebrow">Hub de comunidade &middot; dados de ' + esc(fmtDate(CFG.snapshot)) + "</span>" +
        "<h1>Rainbow Six <span>Siege</span> em um so lugar</h1>" +
        '<p class="lead">Os ' + D.operators.length + ' operadores com gadget principal, gadgets secundarios, ' +
        "habilidade unica e armas, com o percentual estimado das pecas mais usadas. Mais as patch notes oficiais, " +
        "noticias do jogo e os rankings.</p>" +
        '<div class="hero-actions">' +
          '<a class="btn btn-primary" href="#/agentes">Ver os ' + D.operators.length + " operadores</a>" +
          '<a class="btn" href="#/armas">Catalogo de armas</a>' +
          '<a class="btn" href="#/noticias">Balanceamentos</a>' +
        "</div>" +
      "</div>" +
      '<div class="season-card">' +
        '<span class="sc-label">Temporada atual</span>' +
        '<div class="sc-name">' + esc(season.name) + "</div>" +
        '<div class="sc-date">' + esc(season.label) + " &middot; desde " + esc(fmtDate(season.startedAt)) + "</div>" +
        "<hr>" +
        "<ul>" +
          "<li><b>Patch mais recente:</b> " + esc(latest[0].version) + " (" + esc(fmtDate(latest[0].date)) + ")</li>" +
          "<li><b>Operador novo:</b> " + esc(rel[0].name) + " &mdash; " + esc(rel[0].gadget) + "</li>" +
          "<li><b>" + ps.patches.length + "</b> patches de balanceamento mapeados</li>" +
          "<li><b>Proximo evento:</b> " + esc(D.rankings.circuit.majorNext.name) + "</li>" +
        "</ul>" +
      "</div>" +
    "</section>";

    h += '<div class="stats">' +
      '<div class="stat"><b>' + D.operators.length + "</b><span>operadores</span></div>" +
      '<div class="stat"><b>' + atk + " / " + def + "</b><span>atacantes / defensores</span></div>" +
      '<div class="stat"><b>' + D.weapons.length + "</b><span>armas no catalogo</span></div>" +
      '<div class="stat"><b>' + Object.keys(D.attachmentEffects).length + "</b><span>tipos de peca</span></div>" +
      '<div class="stat"><b>' + ps.patches.length + "</b><span>patches</span></div>" +
    "</div>";

    h += notice(
      "<b>Sobre os percentuais de pecas:</b> a Ubisoft nao publica telemetria de uso de attachments. " +
      "Todos os percentuais de pecas deste site sao <b>estimativas de consenso da comunidade</b> " +
      "(guias, Reddit e jogadores pro), com um indicador de confianca em cada item. Os stats de armas e os " +
      "balanceamentos vem de fontes oficiais e de datasets cross-checkados.");

    /* destaques */
    h += secHead("Destaque", "Operadores lancados recentemente", "Gadgets assinatura das ultimas temporadas.");
    h += '<div class="grid-ops">';
    rel.forEach(function (r) {
      var op = D.operators.filter(function (o) { return norm(o.n) === norm(r.name); })[0];
      h += op ? opCard(op) :
        '<div class="card"><div class="card-top"><div class="card-title"><h3>' + esc(r.name) +
        '</h3><div class="sub">' + esc(r.gadget) + "</div></div></div>" +
        '<div class="card-body"><div class="gadget-line">' + esc(r.description || "") + "</div></div></div>";
    });
    h += "</div>";

    /* ultimos balanceamentos */
    h += secHead("Balanceamento", "Ultimas patch notes", "Numeros oficiais direto das notas da Ubisoft.",
      '<a class="btn" href="#/noticias?tab=balanceamentos">Ver todas</a>');
    h += '<div class="home-grid">';
    latest.forEach(function (p) {
      h += '<div class="card"><div class="card-top"><div class="card-title">' +
        '<span class="wc-type">' + esc(p.label) + " &middot; " + esc(p.version) + "</span>" +
        '<h3 style="margin-top:2px">' + esc(fmtDate(p.date)) + "</h3>" +
        '<div class="sub">' + esc(p.headline || "") + "</div></div></div>" +
        '<div class="card-body"><div class="gadget-line">' + (p.balance || []).length + " mudancas de balanceamento</div></div>" +
        '<div class="card-foot"><span class="sp" style="margin:0">' + esc(p.season) + "</span></div></div>";
    });
    h += "</div>";

    /* noticias + ranking */
    h += '<div class="two-col" style="margin-top:34px">';
    h += "<div>" + secHead("Noticias", "Ultimas noticias", "", '<a class="btn" href="#/noticias">Ver todas</a>') + newsList((D.news.items || []).slice(0, 4), true) + "</div>";
    h += "<div>" + secHead("Ranking", "Times no topo", "Pontos oficiais de qualificacao para o SI 2027.",
      '<a class="btn" href="#/rankings">Ver ranking</a>');
    h += '<div class="rank-teaser">' + D.rankings.teams.slice(0, 6).map(function (t, i) {
      return '<div class="rt"><span class="p">' + (i + 1) + '</span><div><div class="n">' + esc(t.name) +
        '</div><div class="r">' + esc(t.region) + " &middot; " + t.si + " pts SI</div></div></div>";
    }).join("") + "</div>" + "</div>";
    h += "</div>";

    return h;
  }

  /* ------------------------------------------------ agentes */
  function filterOperators(q) {
    return D.operators.filter(function (o) {
      if (q.side && o.side !== q.side) return false;
      if (q.speed && String(o.sp) !== q.speed) return false;
      if (q.health && String(o.h) !== q.health) return false;
      if (q.year && String(o.y) !== q.year) return false;
      if (q.role && o.r.indexOf(q.role) === -1) return false;
      if (q.ctu && o.ctu !== q.ctu) return false;
      if (q.q) {
        var t = norm(q.q);
        var hay = norm([o.n, o.ctu, o.reg, o.g, o.gd, o.un, o.bio, o.y, o.r.join(" ")].join(" "));
        if (hay.indexOf(t) === -1) return false;
      }
      return true;
    });
  }
  function viewAgents(q) {
    var list = filterOperators(q);
    var ctus = [];
    D.operators.forEach(function (o) { if (ctus.indexOf(o.ctu) === -1) ctus.push(o.ctu); });
    ctus.sort();
    var years = [];
    D.operators.forEach(function (o) { if (years.indexOf(o.y) === -1) years.push(o.y); });
    years.sort(function (a, b) { return b - a; });

    function opts(vals, sel, lab) {
      return '<option value="">' + lab + "</option>" + vals.map(function (v) {
        return '<option value="' + esc(v) + '"' + (String(sel) === String(v) ? " selected" : "") + ">" + esc(v) + "</option>";
      }).join("");
    }

    var h = "";
    h += secHead("Operadores", "Os " + D.operators.length + " agentes",
      "Gadget principal, gadgets secundarios, habilidade unica e armas de cada operador.");
    h += crumbs([{ label: "Inicio", href: "#/" }, { label: "Agentes" }]);

    h += '<div class="toolbar">' +
      '<span class="tb-label">Filtros</span>' +
      '<select id="f-side" aria-label="Lado">' + opts(["ATK", "DEF"], q.side, "Todos os lados") + "</select>" +
      '<select id="f-role" aria-label="Funcao">' + opts(D.roles.map(function (r) { return r.id; }), q.role, "Todas as funcoes") + "</select>" +
      '<select id="f-ctu" aria-label="CTU">' + opts(ctus, q.ctu, "Todas as CTUs") + "</select>" +
      '<select id="f-speed" aria-label="Velocidade">' + opts([1, 2, 3], q.speed, "Qualquer velocidade") + "</select>" +
      '<select id="f-health" aria-label="Vida">' + opts([100, 110, 125], q.health, "Qualquer vida") + "</select>" +
      '<select id="f-year" aria-label="Ano">' + opts(years, q.year, "Qualquer ano") + "</select>" +
      '<div class="divider"></div>' +
      '<input class="tb-input" id="f-q" type="search" placeholder="Buscar no filtro..." value="' + esc(q.q || "") + '" aria-label="Buscar no filtro">' +
      '<span class="tb-count"><b>' + list.length + "</b> de " + D.operators.length + "</span>" +
      ((q.side || q.role || q.ctu || q.speed || q.health || q.year || q.q) ? '<a class="btn" href="#/agentes">Limpar</a>' : "") +
    "</div>";

    if (!list.length) {
      h += '<div class="empty-state"><b>Nenhum operador encontrado</b>Tente remover algum filtro.</div>';
    } else {
      h += '<div class="grid-ops">' + list.map(opCard).join("") + "</div>";
    }

    /* referencia de gadgets */
    h += secHead("Referencia", "Pool de gadgets secundarios",
      "Gadgets de escolha livre que cada operador carrega alem do gadget assinatura. Isso muda entre temporadas: confira o patch atual.");
    h += '<div class="panes">';
    ["ATK", "DEF"].forEach(function (side) {
      h += '<div class="pane"><h3>' + (side === "ATK" ? "Pool de atacante" : "Pool de defensor") + "</h3><ul class='sec-list'>";
      D.gadgetPool[side].forEach(function (g) {
        h += "<li><span class='g-ico'>" + (side === "ATK" ? "A" : "D") + "</span><div><b>" + esc(g.n) + "</b><small>" +
          esc(g.d) + "</small></div></li>";
      });
      h += "</ul></div>";
    });
    h += "</div>";
    return h;
  }

  /* ------------------------------------------------ detalhe do operador */
  function viewAgent(id) {
    var op = opById(id);
    if (!op) return '<div class="empty-state"><b>Operador nao encontrado</b><a href="#/agentes">Voltar para a lista</a></div>';
    var cls = op.side === "ATK" ? "atk" : "def";
    var wp = D.operatorWeapons(op);
    var allW = wp.primary.concat(wp.secondary);

    var h = "";
    h += crumbs([{ label: "Inicio", href: "#/" }, { label: "Agentes", href: "#/agentes" }, { label: op.n }]);
    h += '<section class="detail-hero ' + cls + '">' +
      '<div class="avatar">' + esc(initials(op.n)) + "</div>" +
      "<div>" +
        '<span class="eyebrow">' + sideLabel(op.side) + " &middot; " + esc(op.ctu) + "</span>" +
        "<h1>" + esc(op.n) + "</h1>" +
        '<div class="badges">' +
          '<span class="badge">' + esc(op.reg) + "</span>" +
          '<span class="badge">lancado em <b>' + op.y + "</b></span>" +
          '<span class="badge">vida <b>' + op.h + "</b> " + dots(op.h === 125 ? 3 : op.h === 110 ? 2 : 1) + "</span>" +
          '<span class="badge">velocidade <b>' + op.sp + "</b> " + dots(op.sp, cls) + "</span>" +
          op.r.map(function (r) { return '<span class="badge gold">' + esc(roleLabel(r)) + "</span>"; }).join("") +
        "</div>" +
        '<p class="muted" style="max-width:70ch">' + esc(op.bio) + "</p>" +
      "</div>" +
    "</section>";

    h += '<div class="panes">';
    h += '<div class="pane"><h3>Gadget principal</h3>' +
      '<div class="gadget-box"><h4>' + esc(op.g) + "</h4><p>" + esc(op.gd) + "</p></div>" +
      '<p class="small muted" style="margin:0">Classe do gadget: <b>' + esc(op.gt) + "</b></p></div>";

    h += '<div class="pane"><h3>Habilidade unica</h3>' +
      '<div class="gadget-box unique"><p class="lead-big">' + esc(op.un) + "</p></div>" +
      '<p class="small muted" style="margin:0">E o que separa este operador de todos os outros do mesmo lado.</p></div>';

    /* secundarios */
    h += '<div class="pane"><h3>Gadgets secundarios (' + op.sec.length + ")</h3><ul class='sec-list'>";
    op.sec.forEach(function (name) {
      var def = D.gadgetPool[op.side].filter(function (g) { return norm(g.n) === norm(name); })[0];
      h += "<li><span class='g-ico'>" + (op.side === "ATK" ? "A" : "D") + "</span><div><b>" + esc(name) + "</b>" +
        (def ? "<small>" + esc(def.d) + "</small>" : "") + "</div></li>";
    });
    h += "</ul></div>";

    /* armas */
    h += '<div class="pane full"><h3>Armas (' + (allW.length + 1) + ")</h3>";
    if (!wp.primary.length && !wp.secondary.length) {
      h += '<p class="muted">Nenhuma arma de fogo registrada para este operador.</p>';
    } else {
      if (wp.primary.length) {
        h += '<p class="small muted" style="margin-bottom:8px">Arma principal</p><div class="weapon-rows">';
        wp.primary.forEach(function (w) { h += weaponRow(w, true); });
        h += "</div>";
      }
      if (wp.secondary.length) {
        h += '<p class="small muted" style="margin:16px 0 8px">Arma secundaria</p><div class="weapon-rows">';
        wp.secondary.forEach(function (w) { h += weaponRow(w, false); });
        h += "</div>";
      }
      h += notice("Os percentuais abaixo sao <b>estimativas de consenso da comunidade</b>. A Ubisoft nao publica " +
        "percentual de uso de pecas. Clique na arma para ver o efeito de cada peca e quais operadores tambem a usam.", "info");
    }
    h += "</div>";

    /* contra quem e bom */
    h += '<div class="pane full"><h3>Melhor uso</h3><p class="lead-big">' + esc(op.best) + "</p></div>";
    h += "</div>";

    /* nav */
    var idx = D.operators.indexOf(op);
    var prev = D.operators[idx - 1], next = D.operators[idx + 1];
    h += '<div style="display:flex;gap:10px;margin-top:20px;flex-wrap:wrap">' +
      (prev ? '<a class="btn" href="#/agente/' + enc(prev.id) + '">&larr; ' + esc(prev.n) + "</a>" : "") +
      (next ? '<a class="btn" href="#/agente/' + enc(next.id) + '">' + esc(next.n) + " &rarr;</a>" : "") +
      '<a class="btn btn-primary" href="#/agentes">Todos os operadores</a></div>';
    return h;
  }

  function weaponRow(w, primary) {
    var hasMeta = !!w.meta;
    return '<div class="wrow" data-wrow>' +
      '<button class="wrow-head" data-wtoggle>' +
        '<span class="arrow">&#9656;</span>' +
        '<span class="wname">' + esc(w.n) + "</span>" +
        '<span class="wtype">' + esc(w.t) + "</span>" +
        '<span class="sp">' + (hasMeta ? "meta de pecas" : "sem dados de meta") + "</span>" +
      "</button>" +
      '<div class="wrow-body">' +
        '<div class="wrow-stats">' +
          "<span><b>Dano</b> " + esc(w.dmg) + "</span>" +
          "<span><b>RPM</b> " + esc(w.rpm) + "</span>" +
          "<span><b>Carregador</b> " + esc(w.mag) + "</span>" +
          "<span><b>Slots</b> " + w.slots.length + "</span>" +
          (primary ? "<span><b>Tipo</b> arma principal</span>" : "<span><b>Tipo</b> arma secundaria</span>") +
        "</div>" +
        (w.note ? '<p class="small muted">' + esc(w.note) + "</p>" : "") +
        (hasMeta ? metaBlocks(w) :
          '<p class="small muted" style="margin:8px 0 0">Nao ha dados de meta de pecas para esta arma. ' +
          "Consulte a <a class='src-link' href='" + esc(CFG.sources.attachments) + "' target='_blank' rel='noopener'>wiki de attachments</a> para ver o que cada slot aceita.</p>") +
        '<p class="small" style="margin:12px 0 0"><a class="src-link" href="#/arma/' + encodeURIComponent(w.n) + '">Abrir pagina completa da arma</a></p>' +
      "</div></div>";
  }

  function metaBlocks(w) {
    var h = "";
    w.slots.forEach(function (s) {
      var picks = (w.meta && w.meta[s]) || [];
      if (!picks.length) return;
      h += '<div class="slot-block"><div class="slot-name">' + esc(slotLabel(s)) + "</div>";
      picks.forEach(function (p) {
        h += '<div class="bar"><div class="bar-top"><b>' + esc(p.n) + " " + confTag(p.c) + "</b><span>" + p.p + "%</span></div>" +
          '<div class="bar-track"><div class="bar-fill" style="width:' + Math.min(100, p.p) + '%"></div></div></div>';
      });
      h += "</div>";
    });
    if (!h) return '<p class="small muted">Esta arma nao tem slots de peca com dados de meta.</p>';
    return h;
  }

  /* ------------------------------------------------ armas */
  var TYPES = ["AR", "SMG", "LMG", "SHOTGUN", "MARKSMAN", "SNIPER", "PISTOL", "SHIELD", "MELEE", "LAUNCHER"];
  function viewWeapons(q) {
    var list = D.weapons.filter(function (w) {
      if (q.type && w.t !== q.type) return false;
      if (q.only === "meta" && !w.meta) return false;
      if (q.q) {
        var t = norm(q.q);
        if (norm([w.n, w.t, w.note || ""].join(" ")).indexOf(t) === -1) return false;
      }
      return true;
    });

    var h = "";
    h += secHead("Armas", "Catalogo de armas", "Stats das armas, slots de peca e o percentual estimado das pecas mais usadas pelos jogadores.");
    h += crumbs([{ label: "Inicio", href: "#/" }, { label: "Armas" }]);
    h += '<div class="toolbar">' +
      '<span class="tb-label">Filtros</span>' +
      '<select id="w-type" aria-label="Tipo">' + '<option value="">Todos os tipos</option>' +
        TYPES.filter(function (t) { return D.weapons.some(function (w) { return w.t === t; }); })
          .map(function (t) { return '<option value="' + t + '"' + (q.type === t ? " selected" : "") + ">" + t + "</option>"; }).join("") +
      "</select>" +
      '<div class="divider"></div>' +
      '<input class="tb-input" id="w-q" type="search" placeholder="Buscar arma..." value="' + esc(q.q || "") + '" aria-label="Buscar arma">' +
      '<span class="tb-count"><b>' + list.length + "</b> de " + D.weapons.length + "</span>" +
      ((q.type || q.q || q.only) ? '<a class="btn" href="#/armas">Limpar</a>' : "") +
    "</div>";

    h += notice("<b>Percentuais de pecas sao estimativas.</b> Nenhuma fonte publica mede o uso de attachments em R6. " +
      "Os numeros vem de consenso entre guias, Reddit e jogadores profissionais, com confianca indicada por item. " +
      "Os stats das armas vem de datasets cross-checkados contra a wiki.", "info");

    h += '<div class="grid-weapons">' + list.map(wCard).join("") + "</div>";

    /* meta global */
    h += secHead("Referencia", "Meta global de pecas", "Distribuicao estimada de uso em todas as armas do jogo.");
    h += '<div class="panes">' + metaGlobalPane("cano", "Cano / Boca") + metaGlobalPane("grip", "Grip") +
      metaGlobalPane("mira", "Mira / Luneta") + metaGlobalPane("under", "Sousbarrel") + "</div>";

    /* efeitos */
    h += secHead("Referencia", "Efeito de cada peca", "Valores medidos e documentados pela wiki de attachments.");
    h += '<div class="tbl-scroll"><table><thead><tr><th>Peca</th><th>Slot</th><th>Efeito</th><th>Confianca do uso</th></tr></thead><tbody>';
    Object.keys(D.attachmentEffects).forEach(function (k) {
      var e = D.attachmentEffects[k];
      h += "<tr><td><b>" + esc(k) + "</b></td><td>" + esc(slotLabel(e.slot)) + "</td><td>" + esc(e.d) + "</td><td>" + confTag(e.conf) + "</td></tr>";
    });
    h += "</tbody></table></div>";
    return h;
  }
  function metaGlobalPane(key, label) {
    var rows = D.metaGlobal[key] || [];
    var h = '<div class="pane"><h3>' + esc(label) + "</h3>";
    rows.forEach(function (r) {
      var pct = parseInt(r.p, 10);
      h += '<div class="bar"><div class="bar-top"><b>' + esc(r.n) + " " + confTag(r.conf) + "</b><span>" + esc(r.p) + "</span></div>" +
        '<div class="bar-track"><div class="bar-fill" style="width:' + (isNaN(pct) ? 0 : Math.min(100, pct)) + '%"></div></div>' +
        '<div class="small muted" style="margin-top:3px">' + esc(r.d) + "</div></div>";
    });
    return h + "</div>";
  }

  function viewWeapon(name) {
    var w = wByName(name);
    if (!w) return '<div class="empty-state"><b>Arma nao encontrada</b><a href="#/armas">Voltar ao catalogo</a></div>';
    var users = D.weaponOperators(w.n);

    var h = "";
    h += crumbs([{ label: "Inicio", href: "#/" }, { label: "Armas", href: "#/armas" }, { label: w.n }]);
    h += '<section class="detail-hero" style="border-left-color:var(--gold)">' +
      '<div class="avatar">' + esc(initials(w.n)) + "</div>" +
      "<div>" +
        '<span class="eyebrow">' + esc(w.t) + "</span>" +
        "<h1>" + esc(w.n) + "</h1>" +
        '<div class="badges">' +
          '<span class="badge">dano <b>' + esc(w.dmg) + "</b></span>" +
          '<span class="badge">' + esc(w.rpm) + " <b>rpm</b></span>" +
          '<span class="badge">carregador <b>' + esc(w.mag) + "</b></span>" +
          '<span class="badge">slots <b>' + w.slots.length + "</b></span>" +
          '<span class="badge">' + users.length + " <b>operadores</b></span>" +
        "</div>" +
        (w.note ? '<p class="muted" style="max-width:70ch">' + esc(w.note) + "</p>" : "") +
      "</div></section>";

    h += '<div class="panes">';
    h += '<div class="pane"><h3>Meta de pecas por slot</h3>' +
      (w.meta ? metaBlocks(w) : '<p class="muted">Nao ha dados de meta de pecas medidos ou consenso para esta arma. ' +
        "Verifique a wiki para os slots e efeitos disponiveis.</p>") + "</div>";

    h += '<div class="pane"><h3>Slots disponiveis</h3><ul class="sec-list">';
    if (!w.slots.length) h += '<li><span class="g-ico">-</span><div><b>Sem slots</b><small>Esta arma nao aceita pecas.</small></div></li>';
    w.slots.forEach(function (s) {
      h += "<li><span class='g-ico'>" + esc(s.charAt(0).toUpperCase()) + "</span><div><b>" + esc(slotLabel(s)) + "</b></div></li>";
    });
    h += "</ul></div>";

    h += '<div class="pane full"><h3>Operadores que usam</h3>';
    if (!users.length) h += '<p class="muted">Nenhum operador mapeado.</p>';
    else {
      h += '<div class="grid-ops">' + users.map(opCard).join("") + "</div>";
    }
    h += "</div>";
    h += "</div>";
    return h;
  }

  /* ------------------------------------------------ noticias */
  function newsList(items, compact) {
    if (!items.length) return '<div class="empty-state"><b>Nada por aqui</b></div>';
    return '<div class="news-list">' + items.map(function (n) {
      var d = String(n.date).split("-");
      return '<article class="news-card">' +
        '<div class="news-date"><b>' + Number(d[2]) + "</b><span>" + MESES[Number(d[1]) - 1] + " " + d[0] + "</span></div>" +
        "<div>" +
          "<h3>" + esc(n.title) + "</h3>" +
          (compact ? '<p>' + esc(n.summary.split(". ").slice(0, 2).join(". ") + ".") + "</p>" : "<p>" + esc(n.summary) + "</p>") +
          '<div class="news-meta">' +
            '<span class="pill ' + esc(n.category) + '">' + esc(catLabel(n.category)) + "</span>" +
            (n.status && n.status !== "live" ? '<span class="pill ' + esc(n.status) + '">' + esc(statusLabel(n.status)) + "</span>" : "") +
            (n.sourceUrl ? '<a class="src-link" href="' + esc(n.sourceUrl) + '" target="_blank" rel="noopener">fonte oficial</a>' : "") +
          "</div>" +
        "</div></article>";
    }).join("") + "</div>";
  }

  function viewNews(q) {
    var tab = q.tab === "balanceamentos" ? "balanceamentos" : "noticias";
    var items = (D.news.items || []).slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    var cats = [];
    items.forEach(function (n) { if (cats.indexOf(n.category) === -1) cats.push(n.category); });
    cats.sort();
    if (q.cat) items = items.filter(function (n) { return n.category === q.cat; });

    var h = "";
    h += secHead("Noticias", "Noticias e balanceamentos",
      "Patch notes oficiais da Ubisoft, anuncios de temporada, eventos in-game e resultados de esports.");
    h += crumbs([{ label: "Inicio", href: "#/" }, { label: "Noticias" }]);
    h += '<div class="tabs">' +
      '<button class="tab' + (tab === "noticias" ? " on" : "") + '" data-tab="noticias">Noticias</button>' +
      '<button class="tab' + (tab === "balanceamentos" ? " on" : "") + '" data-tab="balanceamentos">Balanceamentos</button>' +
    "</div>";

    if (tab === "noticias") {
      h += '<div class="toolbar"><span class="tb-label">Categorias</span>' +
        '<a class="chip' + (!q.cat ? " on" : "") + '" href="#/noticias?tab=noticias">Todas</a>' +
        cats.map(function (c) {
          return '<a class="chip' + (q.cat === c ? " on" : "") + '" href="#/noticias?tab=noticias&cat=' +
            encodeURIComponent(c) + '">' + esc(catLabel(c)) + "</a>";
        }).join("") +
        '<span class="tb-count"><b>' + items.length + "</b> itens</span></div>";
      h += newsList(items);
      h += notice("Conteudo resumido de fontes oficiais da Ubisoft e de sites de esports. " +
        "Clique em &ldquo;fonte oficial&rdquo; para o anuncio original.", "info");
    } else {
      h += patchList();
    }
    return h;
  }

  function patchList() {
    var ps = D.patchnotes;
    var h = notice("<b>Fonte:</b> notas de patch oficiais da Ubisoft. " +
      "Expandir um patch mostra destaques, novidades, tabela de balanceamento e correcoes.", "info");
    h += '<div class="toolbar">' +
      '<span class="tb-label">Legenda</span>' +
      '<span class="pill buff">Buff</span><span class="pill nerf">Nerf</span><span class="pill mixed">Misto</span>' +
      '<span class="tb-count"><b>' + ps.patches.length + "</b> patches mapeados</span>" +
      '<button class="btn" id="expand-all">Expandir tudo</button></div>';
    h += ps.patches.map(function (p) {
      var bal = p.balance || [];
      var hl = p.highlights || [];
      var bf = p.bugFixes || {};
      var bfCount = (bf.gameplay || []).length + (bf.ui || []).length;
      var b = "";

      if (hl.length) {
        b += "<h4>Destaques</h4><ul>" + hl.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>";
      }
      if ((p.newOperators || []).length) {
        b += "<h4>Operadores novos</h4><ul>" +
          p.newOperators.map(function (x) { return "<li><b>" + esc(x) + "</b></li>"; }).join("") + "</ul>";
      }
      if ((p.newMaps || []).length) {
        b += "<h4>Mapas</h4><ul>" +
          p.newMaps.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>";
      }
      if (bal.length) {
        b += "<h4>Mudancas de balanceamento (" + bal.length + ")</h4>" +
          '<div class="tbl-scroll"><table><thead><tr>' +
          "<th>Alvo</th><th>Gadget / arma</th><th>Mudanca</th><th>Direcao</th></tr></thead><tbody>" +
          bal.map(function (x) {
            return "<tr><td><b>" + esc(x.operator || x.target || "-") + "</b></td><td>" + esc(x.gadget || "-") +
              "</td><td>" + esc(x.change) + "</td><td>" + directionPill(x.direction) + "</td></tr>";
          }).join("") +
          "</tbody></table></div>";
      } else {
        b += '<p class="small muted" style="margin:10px 0 0">Esta nota nao trouxe mudancas de balanceamento de operador, gadget ou arma.</p>';
      }
      if (bfCount) {
        b += "<h4>Correcoes (" + bfCount + ")</h4><details><summary>Ver correcoes</summary><ul>" +
          (bf.gameplay || []).map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") +
          (bf.ui || []).map(function (x) { return '<li class="muted">' + esc(x) + "</li>"; }).join("") +
          "</ul></details>";
      }
      b += '<p class="small" style="margin-top:14px"><a class="src-link" href="' + esc(p.sourceUrl) +
        '" target="_blank" rel="noopener">patch notes oficiais</a></p>';

      return '<div class="patch" data-patch="' + esc(p.version) + '">' +
        '<button class="patch-head" data-ptoggle>' +
          '<span class="patch-ver">' + esc(p.version) + "</span>" +
          '<span><span class="patch-seen">' + esc(p.label) + " &middot; " + esc(p.type) + " &middot; " + esc(fmtDate(p.date)) + "</span>" +
          '<div class="patch-title">' + esc(p.headline || "") + "</div></span>" +
          '<span class="sp"></span>' +
          '<span class="patch-seen">' + bal.length + " mudancas</span>" +
          '<span class="arrow">&#9656;</span>' +
        "</button>" +
        '<div class="patch-body">' + b + "</div>" +
      "</div>";
    }).join("");
    return h;
  }

  /* ------------------------------------------------ rankings */
  /* Estado da busca opcional por API configurada em config.js.
     Vazio por padrao: o site usa apenas o snapshot local.                    */
  var live = { on: !!(CFG.rankingApiUrl), loading: false, loaded: false, error: "" };

  function loadLiveRankings() {
    if (!live.on || live.loading || live.loaded) return;
    live.loading = true;
    var opt = { headers: CFG.rankingApiHeaders || {} };
    fetch(CFG.rankingApiUrl, opt)
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (j) {
        if (j && Array.isArray(j.teams) && j.teams.length) D.rankings.teams = j.teams;
        if (j && Array.isArray(j.solo) && j.solo.length) D.rankings.solo = j.solo;
        live.loaded = true;
        if (parseHash().parts[0] === "rankings") render();
      })
      .catch(function (e) { live.error = String(e && e.message || e); })
      .then(function () { live.loading = false; });
  }

  function liveBadge() {
    if (!live.on) return '<span class="badge">fonte: <b>snapshot local</b> (' + esc(fmtDate(CFG.snapshot)) + ")</span>";
    if (live.loaded) return '<span class="badge gold">fonte: <b>API ao vivo</b></span>';
    if (live.loading) return '<span class="badge">fonte: <b>consultando API...</b></span>';
    return '<span class="badge">fonte: <b>snapshot local</b> (API indisponivel: ' + esc(live.error || "sem conexao") + ")</span>";
  }

  function viewRankings(q) {
    var tab = q.tab === "solo" ? "solo" : "times";
    var rk = D.rankings;
    var h = "";
    h += secHead("Rankings", "Times e jogadores", "Ranking oficial, com fontes e data de referencia.");
    h += crumbs([{ label: "Inicio", href: "#/" }, { label: "Rankings" }]);
    h += '<div class="toolbar"><span class="tb-label">Origem dos dados</span>' + liveBadge() +
      '<span class="tb-count">snapshot ' + esc(fmtDate(rk.snapshot)) + "</span></div>";
    h += '<div class="tabs">' +
      '<button class="tab' + (tab === "times" ? " on" : "") + '" data-tab="times">Times</button>' +
      '<button class="tab' + (tab === "solo" ? " on" : "") + '" data-tab="solo">Solo / jogadores</button>' +
    "</div>";

    if (tab === "times") {
      h += notice("<b>Importante:</b> " + esc(rk.disclaimer.teams), "info");
      h += '<div class="tbl-scroll"><table><thead><tr>' +
        "<th>#</th><th>Time</th><th>Regiao</th><th>Elenco</th><th>Titulos</th><th>Rolling 12m</th><th>Pts SI</th>" +
        "</tr></thead><tbody>";
      rk.teams.forEach(function (t) {
        h += '<tr class="rank-medals rank-' + t.pos + '"><td class="num"><b>' + t.pos + "</b></td>" +
          '<td><div class="team-cell"><span class="team-logo">' + esc(initials(t.name)) + "</span>" +
          '<div><div class="tn"><a href="#">' + esc(t.name) + "</a></div>" +
          (t.coach && t.coach !== "-" ? '<div class="tr">coach ' + esc(t.coach) + "</div>" : "") + "</div></div>" +
          (t.note ? '<div class="small muted" style="margin-top:6px">' + esc(t.note) + "</div>" : "") + "</td>" +
          "<td>" + esc(t.region) + "</td>" +
          '<td class="small">' + esc(t.team) + "</td>" +
          '<td><ul class="titles">' + (t.titles || []).map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></td>" +
          "<td><b>#" + t.rolling + "</b> <span class='muted small'>" + esc(t.rollingPts) + " pts</span></td>" +
          "<td><b>" + esc(t.si) + "</b></td></tr>";
      });
      h += "</tbody></table></div>";

      h += secHead("Referencias", "Outros times no ranking", "Posicoes no ranking rolling de 12 meses e no ranking de pontos do Six Invitational.");
      h += '<div class="tbl-scroll"><table><thead><tr><th>Time</th><th>Rolling 12m</th><th>Pos. pontos SI</th><th>Obs.</th></tr></thead><tbody>';
      rk.teamsMore.forEach(function (t) {
        h += "<tr><td><b>" + esc(t.name) + "</b></td><td>#" + esc(t.rolling) + "</td><td>#" + esc(t.si) + "</td>" +
          '<td class="small muted">' + esc(t.note || "") + "</td></tr>";
      });
      h += "</tbody></table></div>";

      h += secHead("Circuito", "Proximos eventos e contexto");
      h += '<div class="home-grid">' +
        '<div class="pane"><h3>Proximo Major</h3><p class="lead-big">' + esc(rk.circuit.majorNext.name) + "</p>" +
          "<p>" + esc(rk.circuit.majorNext.date) + " &middot; " + esc(rk.circuit.majorNext.place) + " &middot; " +
          esc(rk.circuit.majorNext.teams) + " times</p>" +
          '<p class="small muted">' + esc(rk.circuit.majorNext.note) + "</p></div>" +
        '<div class="pane"><h3>Proximo Six Invitational</h3><p class="lead-big">' + esc(rk.circuit.siNext.name) + "</p>" +
          "<p>" + esc(rk.circuit.siNext.date) + " &middot; " + esc(rk.circuit.siNext.place) + "</p>" +
          '<p class="small muted">Qualificados ate agora: <b>' + esc(rk.circuit.qualifiedSoFar.join(", ")) + "</b>. " +
          esc(rk.circuit.siNext.note) + "</p></div>" +
        '<div class="pane"><h3>Ranked 3.0</h3><p class="lead-big">' + esc(rk.circuit.ranked.name) + "</p>" +
          "<p>Desde " + esc(fmtDate(rk.circuit.ranked.since)) + " (" + esc(rk.circuit.ranked.season) + ")</p>" +
          '<p class="small muted">' + esc(rk.circuit.ranked.note) + "</p></div>" +
      "</div>";
    } else {
      h += notice("<b>Aviso honesto:</b> " + esc(rk.disclaimer.solo), "info");
      h += '<div class="expand-note" style="margin-bottom:18px">' +
        "Se voce configurar <code class='mono'>rankingApiUrl</code> em " +
        "<code class='mono'>assets/js/config.js</code>, esta aba tenta buscar um endpoint JSON ao vivo " +
        "(formato <code class='mono'>{ teams: [...], solo: [...] }</code>) e sobe com os dados fresh; " +
        "se o endpoint falhar, o snapshot local abaixo e mantido. Status atual: " + liveBadge() + ". " +
        "Sem API configurada, o site mostra nomes e titulos reais verificados, sem inventar MMR." +
      "</div>";
      h += '<div class="tbl-scroll"><table><thead><tr>' +
        "<th>#</th><th>Jogador</th><th>Pais</th><th>Time</th><th>MMR / RP</th><th>Notas</th>" +
        "</tr></thead><tbody>";
      rk.solo.forEach(function (p) {
        h += '<tr class="rank-medals rank-' + p.pos + '"><td class="num"><b>' + esc(p.pos) + "</b></td>" +
          "<td><div class='team-cell'><span class='team-logo'>" + esc(initials(p.tag)) + "</span>" +
          '<div><div class="tn">' + esc(p.tag) + '</div><div class="tr">' + esc(p.real) + "</div></div></div></td>" +
          "<td>" + esc(p.country) + "</td>" +
          "<td>" + esc(p.team) + "</td>" +
          '<td><span class="mmr-na">sem MMR publico</span></td>' +
          '<td class="small">' + esc(p.note) + "</td></tr>";
      });
      h += "</tbody></table></div>";
    }

    h += '<p class="small muted" style="margin-top:18px">Data de referencia do ranking: <b>' +
      esc(fmtDate(rk.snapshot)) + "</b>. Fontes: " +
      '<a class="src-link" href="' + esc(CFG.sources.standings) + '" target="_blank" rel="noopener">Ubisoft global standings</a> e ' +
      '<a class="src-link" href="' + esc(CFG.sources.sixstats) + '" target="_blank" rel="noopener">SixStats</a>.</p>';
    return h;
  }

  /* ------------------------------------------------ router */
  var lastPath = null;
  function render() {
    var r = parseHash();
    var q = r.query;
    var html = "";
    var navKey = r.parts[0] || "";

    /* preserva foco e cursor dos campos de busca dentro de #main */
    var ae = document.activeElement;
    var keepId = (ae && ae.id && main.contains(ae)) ? ae.id : null;
    var keepPos = (keepId && ae.selectionStart != null) ? ae.selectionStart : null;

    if (navKey === "") html = viewHome();
    else if (navKey === "agentes") html = viewAgents(q);
    else if (navKey === "agente") html = viewAgent(decodeURIComponent(r.parts[1] || ""));
    else if (navKey === "armas") html = viewWeapons(q);
    else if (navKey === "arma") html = viewWeapon(r.parts[1] ? decodeURIComponent(r.parts[1]) : "");
    else if (navKey === "noticias") html = viewNews(q);
    else if (navKey === "rankings") html = viewRankings(q);
    else {
      html = '<div class="empty-state"><b>Pagina nao encontrada</b><a href="#/">Voltar ao inicio</a></div>';
    }

    main.innerHTML = html;
    document.title = pageTitle(navKey) + " | R6 HUB";

    /* nav ativo */
    document.querySelectorAll("#nav a").forEach(function (a) {
      var k = a.getAttribute("data-nav");
      var on = (k === "/" && navKey === "") || (k && k === navKey) ||
        (k === "agentes" && navKey === "agente") || (k === "armas" && navKey === "arma");
      a.classList.toggle("active", !!on);
    });

    bindDynamic();

    if (keepId) {
      var el = document.getElementById(keepId);
      if (el) {
        el.focus();
        if (keepPos != null && el.setSelectionRange) {
          try { el.setSelectionRange(keepPos, keepPos); } catch (e) { /* ignore */ }
        }
      }
    }
    if (lastPath === null || lastPath !== r.path) window.scrollTo(0, 0);
    lastPath = r.path;

    if (navKey === "rankings") loadLiveRankings();
  }

  function pageTitle(navKey) {
    return {
      "": "Hub de Rainbow Six Siege",
      "agentes": "Agentes",
      "agente": "Operador",
      "armas": "Armas",
      "arma": "Arma",
      "noticias": "Noticias e Balanceamento",
      "rankings": "Rankings"
    }[navKey] || "R6 HUB";
  }

  /* eventos delegados dentro de #main */
  function bindDynamic() {
    /* acordeoes de arma */
    main.querySelectorAll("[data-wtoggle]").forEach(function (b) {
      b.addEventListener("click", function () {
        b.parentNode.classList.toggle("open");
        b.querySelector(".sp").textContent =
          b.parentNode.classList.contains("open") ? "fechar" : "meta de pecas";
      });
    });
    /* patches */
    main.querySelectorAll("[data-ptoggle]").forEach(function (b) {
      b.addEventListener("click", function () { b.parentNode.classList.toggle("open"); });
    });
    var ex = $("#expand-all");
    if (ex) ex.addEventListener("click", function () {
      var open = main.querySelectorAll(".patch.open").length < main.querySelectorAll(".patch").length / 2;
      main.querySelectorAll(".patch").forEach(function (p) { p.classList.toggle("open", open); });
      ex.textContent = open ? "Recolher tudo" : "Expandir tudo";
    });
    /* abas */
    main.querySelectorAll("[data-tab]").forEach(function (t) {
      t.addEventListener("click", function () {
        setQuery({ tab: t.getAttribute("data-tab") });
      });
    });
    /* filtros de operador */
    function bindSel(id, key, cast) {
      var el = $("#" + id);
      if (el) el.addEventListener("change", function () {
        var v = el.value;
        var p = {}; p[key] = v;
        setQuery(p);
      });
    }
    bindSel("f-side", "side");
    bindSel("f-role", "role");
    bindSel("f-ctu", "ctu");
    bindSel("f-speed", "speed");
    bindSel("f-health", "health");
    bindSel("f-year", "year");
    bindSel("w-type", "type");

    /* inputs de busca com debounce */
    function bindInput(id, key) {
      var el = $("#" + id);
      if (!el) return;
      var t = null;
      el.addEventListener("input", function () {
        clearTimeout(t);
        var v = el.value;
        t = setTimeout(function () { var p = {}; p[key] = v; setQuery(p); }, 320);
      });
    }
    bindInput("f-q", "q");
    bindInput("w-q", "q");
  }

  /* ------------------------------------------------ busca global */
  function globalSearch(term) {
    var box = $("#search-results");
    var t = norm(term);
    if (t.length < 2) { box.hidden = true; box.innerHTML = ""; return; }

    var ops = D.operators.filter(function (o) {
      return norm([o.n, o.ctu, o.reg, o.g, o.gt].join(" ")).indexOf(t) !== -1;
    }).slice(0, 7);
    var wps = D.weapons.filter(function (w) {
      return norm([w.n, w.t].join(" ")).indexOf(t) !== -1;
    }).slice(0, 6);

    var h = "";
    if (ops.length) {
      h += '<div class="sr-group"><div class="sr-title">Operadores</div>';
      ops.forEach(function (o) {
        h += '<a class="sr-item" href="#/agente/' + enc(o.id) + '">' +
          '<span class="tag ' + (o.side === "ATK" ? "atk" : "def") + '">' + sideShort(o.side) + "</span>" +
          "<span><b>" + esc(o.n) + '</b><br><small>' + esc(o.g) + "</small></span></a>";
      });
      h += "</div>";
    }
    if (wps.length) {
      h += '<div class="sr-group"><div class="sr-title">Armas</div>';
      wps.forEach(function (w) {
        h += '<a class="sr-item" href="#/arma/' + encodeURIComponent(w.n) + '">' +
          '<span class="tag def">' + esc(w.t) + "</span>" +
          "<span><b>" + esc(w.n) + "</b><br><small>" + esc(w.dmg) + " dano &middot; " + esc(w.mag) + "</small></span></a>";
      });
      h += "</div>";
    }
    if (!h) h = '<div class="sr-empty">Nada encontrado para &ldquo;' + esc(term) + "&rdquo;.</div>";
    box.innerHTML = h;
    box.hidden = false;
  }

  /* ------------------------------------------------ boot */
  function init() {
    /* fontes no footer */
    var ul = $("#footer-sources");
    if (ul) {
      var s = CFG.sources;
      ul.innerHTML = [
        ["Operadores (Ubisoft)", s.operators],
        ["Operadores (wiki)", s.wiki],
        ["Patch notes oficiais", s.patchNotes],
        ["Ranking profissional", s.standings],
        ["Ranking rolling 12m", s.sixstats],
        ["Pecas e efeitos", s.attachments]
      ].map(function (x) {
        return '<li><a href="' + esc(x[1]) + '" target="_blank" rel="noopener">' + esc(x[0]) + "</a></li>";
      }).join("");
    }

    /* nav mobile */
    var burger = $("#burger"), nav = $("#nav");
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") nav.classList.remove("open");
    });

    /* busca global */
    var si = $("#search-input"), box = $("#search-results");
    var t = null;
    si.addEventListener("input", function () {
      clearTimeout(t);
      var v = si.value;
      t = setTimeout(function () { globalSearch(v); }, 140);
    });
    si.addEventListener("focus", function () { if (si.value.length >= 2) globalSearch(si.value); });
    document.addEventListener("click", function (e) {
      if (!e.target.closest("#search") && !e.target.closest("#search-results")) box.hidden = true;
    });
    si.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { box.hidden = true; si.blur(); }
    });

    window.addEventListener("hashchange", render);
    render();

    /* abre o patch mais recente por padrao na aba de balanceamento */
    var first = document.querySelector(".patch");
    if (first) first.classList.add("open");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
