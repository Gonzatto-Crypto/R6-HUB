/* =================================================================
   R6 HUB - pages.js
   -----------------------------------------------------------------
   One function per page. Each function returns a string of HTML and
   does not touch the page directly; app.js puts the result on screen.

   Depends on window.R6HUB, window.R6HUB_CONFIG, helpers and ui.
   ================================================================= */
window.R6HUB = window.R6HUB || {};

window.R6HUB.pages = (function () {
  "use strict";

  var D = window.R6HUB;
  var CONFIG = window.R6HUB_CONFIG;
  var h = window.R6HUB.helpers;
  var ui = window.R6HUB.ui;
  var esc = h.escapeHtml;

  /* =================================================================
     HOME
     Deliberately short: a hero, a few numbers, links to each area
     and the latest news. All the heavy lists live on their own pages.
     ================================================================= */
  function home() {
    var patches = D.patchnotes;
    var season = patches.currentSeason;
    var latestPatches = patches.patches.slice(0, 3);
    var attackers = countBySide("ATK");
    var defenders = D.operators.length - attackers;

    var latestNews = (D.news.items || []).slice().sort(function (a, b) {
      return a.date < b.date ? 1 : -1;
    }).slice(0, 3);

    var html = "";

    html += '<section class="hero">' +
      "<div>" +
        '<span class="eyebrow">Community hub &middot; data from ' + esc(h.formatDate(CONFIG.snapshot)) + "</span>" +
        "<h1>Rainbow Six <span>Siege</span> all in one place</h1>" +
        '<p class="lead">All ' + D.operators.length + " operators with their gadgets, abilities and weapons, " +
        "the attachment meta, the official patch notes, news, rankings and the meta of the best operators. " +
        "Pick a section below to start.</p>" +
        '<div class="hero-acoes">' +
          '<a class="btn btn-primary" href="#/agentes">Explore the ' + D.operators.length + " operators</a>" +
          '<a class="btn" href="#/tiers">Operator meta</a>' +
        "</div>" +
      "</div>" +
      '<div class="season-card">' +
        '<span class="sc-label">Current season</span>' +
        '<div class="sc-name">' + esc(season.name) + "</div>" +
        '<div class="sc-date">' + esc(season.label) + " &middot; since " + esc(h.formatDate(season.startedAt)) + "</div>" +
        "<hr>" +
        "<ul>" +
          "<li><b>Latest patch:</b> " + esc(latestPatches[0].version) + " (" + esc(h.formatDate(latestPatches[0].date)) + ")</li>" +
          "<li><b>Next event:</b> " + esc(D.rankings.circuit.majorNext.name) + "</li>" +
        "</ul>" +
      "</div>" +
    "</section>";

    html += '<div class="stats">' +
      '<div class="stat"><b>' + D.operators.length + "</b><span>operators</span></div>" +
      '<div class="stat"><b>' + attackers + " / " + defenders + "</b><span>attackers / defenders</span></div>" +
      '<div class="stat"><b>' + D.weapons.length + "</b><span>weapons in catalog</span></div>" +
      '<div class="stat"><b>' + Object.keys(D.attachmentEffects).length + "</b><span>attachment types</span></div>" +
      '<div class="stat"><b>' + patches.patches.length + "</b><span>patches mapped</span></div>" +
    "</div>";

    html += '<div class="tile-grid">' +
      tile("#/agentes", "Operators", D.operators.length + " operators with gadgets, abilities and weapons") +
      tile("#/armas", "Weapons", D.weapons.length + " weapons with stats and the attachment meta") +
      tile("#/noticias", "News &amp; Balance", "Official patch notes and the latest game news") +
      tile("#/rankings", "Rankings", "Pro teams and the most decorated players") +
      tile("#/tiers", "Meta", "The best operators, by community and pro play") +
    "</div>";

    html += ui.sectionHead("News", "Latest news", "", '<a class="btn" href="#/noticias">View all</a>');
    html += newsList(latestNews, true);

    return html;
  }

  function tile(href, title, text) {
    return '<a class="tile" href="' + href + '">' +
      "<h3>" + title + "</h3><p>" + text + "</p>" +
      '<span class="tile-go">Open &rarr;</span></a>';
  }

  /* =================================================================
     OPERATOR LIST
     ================================================================= */

  /* Keep only the operators that pass every filter in the URL.
     Note: the CTU filter stays named "ctu" in the URL so old bookmarks
     keep working, even though the data field is "unit". */
  function matchesOperatorFilters(operator, filters) {
    if (filters.side && operator.side !== filters.side) return false;
    if (filters.speed && String(operator.speed) !== filters.speed) return false;
    if (filters.health && String(operator.health) !== filters.health) return false;
    if (filters.year && String(operator.year) !== filters.year) return false;
    if (filters.role && operator.roles.indexOf(filters.role) === -1) return false;
    if (filters.ctu && operator.unit !== filters.ctu) return false;

    if (filters.q) {
      var needle = h.normalize(filters.q);
      var haystack = h.normalize([
        operator.name, operator.unit, operator.region, operator.gadget,
        operator.gadgetDescription, operator.uniqueAbility, operator.bio,
        operator.year, operator.roles.join(" ")
      ].join(" "));
      if (haystack.indexOf(needle) === -1) return false;
    }
    return true;
  }

  function operatorList(filters) {
    var list = D.operators.filter(function (operator) {
      return matchesOperatorFilters(operator, filters);
    });

    var units = distinct(D.operators.map(function (operator) { return operator.unit; })).sort();
    var years = distinct(D.operators.map(function (operator) { return operator.year; }))
      .sort(function (a, b) { return b - a; });

    var hasFilter = filters.side || filters.role || filters.ctu ||
                    filters.speed || filters.health || filters.year || filters.q;

    var html = "";
    html += ui.sectionHead("Operators", "The " + D.operators.length + " operators",
      "Main gadget, secondary gadgets, unique ability and weapons for each operator.");
    html += ui.breadcrumbs([{ text: "Home", link: "#/" }, { text: "Operators" }]);

    html += '<div class="toolbar">' +
      '<span class="filtro-rotulo">Filters</span>' +
      '<select id="f-side" aria-label="Side">' + selectOptions(["ATK", "DEF"], filters.side, "All sides") + "</select>" +
      '<select id="f-role" aria-label="Role">' +
        selectOptions(D.roles.map(function (role) { return role.id; }), filters.role, "All roles") + "</select>" +
      '<select id="f-ctu" aria-label="CTU">' + selectOptions(units, filters.ctu, "All CTUs") + "</select>" +
      '<select id="f-speed" aria-label="Speed">' + selectOptions([1, 2, 3], filters.speed, "Any speed") + "</select>" +
      '<select id="f-health" aria-label="Health">' + selectOptions([100, 110, 125], filters.health, "Any health") + "</select>" +
      '<select id="f-year" aria-label="Year">' + selectOptions(years, filters.year, "Any year") + "</select>" +
      '<div class="divider"></div>' +
      '<input class="filtro-campo" id="f-q" type="search" placeholder="Search filters..." value="' +
        esc(filters.q || "") + '" aria-label="Search filters">' +
      '<span class="filtro-contagem"><b>' + list.length + "</b> of " + D.operators.length + "</span>" +
      (hasFilter ? '<a class="btn" href="#/agentes">Clear</a>' : "") +
    "</div>";

    if (!list.length) {
      html += '<div class="empty-state"><b>No operators found</b>Try removing a filter.</div>';
    } else {
      html += '<div class="grid-ops">' + list.map(ui.operatorCard).join("") + "</div>";
    }

    html += ui.sectionHead("Reference", "Secondary gadget pool",
      "Free-choice gadgets each operator carries in addition to the signature gadget. This changes between seasons: check the current patch.");
    html += '<div class="panes">' +
      gadgetPoolPane("ATK", "Attacker pool") +
      gadgetPoolPane("DEF", "Defender pool") +
    "</div>";

    return html;
  }

  function gadgetPoolPane(side, title) {
    var html = '<div class="pane"><h3>' + title + "</h3><ul class='sec-list'>";
    D.gadgetPool[side].forEach(function (gadget) {
      html += "<li><span class='gadget-icone'>" + (side === "ATK" ? "A" : "D") + "</span><div><b>" +
        esc(gadget.name) + "</b><small>" + esc(gadget.description) + "</small></div></li>";
    });
    return html + "</ul></div>";
  }

  /* =================================================================
     OPERATOR DETAIL
     ================================================================= */
  function operatorDetail(id) {
    var operator = h.findOperator(id);
    if (!operator) {
      return '<div class="empty-state"><b>Operator not found</b><a href="#/agentes">Back to the list</a></div>';
    }

    var sideClass = operator.side === "ATK" ? "atk" : "def";
    var weapons = D.operatorWeapons(operator);
    var allWeapons = weapons.primary.concat(weapons.secondary);
    var healthDots = operator.health === 125 ? 3 : operator.health === 110 ? 2 : 1;

    var html = "";

    html += ui.breadcrumbs([
      { text: "Home", link: "#/" },
      { text: "Operators", link: "#/agentes" },
      { text: operator.name }
    ]);

    html += '<section class="detail-hero ' + sideClass + '">' +
      ui.avatarBox(operator) +
      "<div>" +
        '<span class="eyebrow">' + h.sideName(operator.side) + " &middot; " + esc(operator.unit) + "</span>" +
        "<h1>" + esc(operator.name) + "</h1>" +
        '<div class="badges">' +
          '<span class="badge">' + esc(operator.region) + "</span>" +
          '<span class="badge">released in <b>' + operator.year + "</b></span>" +
          '<span class="badge">health <b>' + operator.health + "</b> " + h.dots(healthDots) + "</span>" +
          '<span class="badge">speed <b>' + operator.speed + "</b> " + h.dots(operator.speed, sideClass) + "</span>" +
          operator.roles.map(function (role) {
            return '<span class="badge gold">' + esc(h.roleLabel(role)) + "</span>";
          }).join("") +
        "</div>" +
        '<p class="muted" style="max-width:70ch">' + esc(operator.bio) + "</p>" +
      "</div>" +
    "</section>";

    html += '<div class="panes">';

    html += '<div class="pane"><h3>Main gadget</h3>' +
      '<div class="gadget-box"><h4>' + esc(operator.gadget) + "</h4><p>" + esc(operator.gadgetDescription) + "</p></div>" +
      '<p class="small muted" style="margin:0">Gadget class: <b>' + esc(operator.gadgetType) + "</b></p></div>";

    html += '<div class="pane"><h3>Unique ability</h3>' +
      '<div class="gadget-box unique"><p class="lead-big">' + esc(operator.uniqueAbility) + "</p></div>" +
      '<p class="small muted" style="margin:0">This is what sets this operator apart from everyone else on the same side.</p></div>';

    html += '<div class="pane"><h3>Secondary gadgets (' + operator.secondaryGadgets.length + ")</h3><ul class='sec-list'>";
    operator.secondaryGadgets.forEach(function (gadgetName) {
      var gadget = D.gadgetPool[operator.side].filter(function (item) {
        return h.normalize(item.name) === h.normalize(gadgetName);
      })[0];
      html += "<li><span class='gadget-icone'>" + (operator.side === "ATK" ? "A" : "D") + "</span><div><b>" +
        esc(gadgetName) + "</b>" +
        (gadget ? "<small>" + esc(gadget.description) + "</small>" : "") + "</div></li>";
    });
    html += "</ul></div>";

    html += '<div class="pane full"><h3>Weapons (' + (allWeapons.length + 1) + ")</h3>";
    if (!weapons.primary.length && !weapons.secondary.length) {
      html += '<p class="muted">No firearms recorded for this operator.</p>';
    } else {
      if (weapons.primary.length) {
        html += '<p class="small muted" style="margin-bottom:8px">Primary weapon</p><div class="weapon-rows">';
        weapons.primary.forEach(function (weapon) { html += weaponRow(weapon, true); });
        html += "</div>";
      }
      if (weapons.secondary.length) {
        html += '<p class="small muted" style="margin:16px 0 8px">Secondary weapon</p><div class="weapon-rows">';
        weapons.secondary.forEach(function (weapon) { html += weaponRow(weapon, false); });
        html += "</div>";
      }
      html += ui.notice("The percentages below are <b>community estimates</b>. Ubisoft does not publish " +
        "attachment usage. Click a weapon to see the effect of each attachment and which operators also use it.", "info");
    }
    html += "</div>";

    html += '<div class="pane full"><h3>Best use</h3><p class="lead-big">' + esc(operator.best) + "</p></div>";
    html += "</div>";

    var index = D.operators.indexOf(operator);
    var previous = D.operators[index - 1];
    var next = D.operators[index + 1];

    html += '<div class="pager">' +
      (previous ? '<a class="btn" href="#/agente/' + h.encodeKey(previous.id) + '">&larr; ' + esc(previous.name) + "</a>" : "") +
      (next ? '<a class="btn" href="#/agente/' + h.encodeKey(next.id) + '">' + esc(next.name) + " &rarr;</a>" : "") +
      '<a class="btn btn-primary" href="#/agentes">All operators</a></div>';

    return html;
  }

  /* One weapon row inside an operator page, with the attachment bars. */
  function weaponRow(weapon, isPrimary) {
    var hasMeta = !!weapon.meta;
    var roleLabel = isPrimary ? "primary weapon" : "secondary weapon";

    return '<div class="wrow" data-wrow>' +
      '<button class="wrow-head" data-wtoggle>' +
        '<span class="arrow">&#9656;</span>' +
        '<span class="wname">' + esc(weapon.name) + "</span>" +
        '<span class="wtype">' + esc(weapon.type) + "</span>" +
        '<span class="empurra">' + (hasMeta ? "attachment meta" : "no meta data") + "</span>" +
      "</button>" +
      '<div class="wrow-body">' +
        '<div class="wrow-stats">' +
          "<span><b>Damage</b> " + esc(weapon.damage) + "</span>" +
          "<span><b>RPM</b> " + esc(weapon.rpm) + "</span>" +
          "<span><b>Magazine</b> " + esc(weapon.magazine) + "</span>" +
          "<span><b>Slots</b> " + weapon.slots.length + "</span>" +
          "<span><b>Type</b> " + roleLabel + "</span>" +
        "</div>" +
        (weapon.note ? '<p class="small muted">' + esc(weapon.note) + "</p>" : "") +
        (hasMeta ? metaBars(weapon)
          : '<p class="small muted" style="margin:8px 0 0">No attachment meta data for this weapon. ' +
            "Check the <a class='src-link' href='" + esc(CONFIG.sources.attachments) + "' target='_blank' rel='noopener'>attachments wiki</a> to see what each slot accepts.</p>") +
        '<p class="small" style="margin:12px 0 0"><a class="src-link" href="#/arma/' +
          h.encodeKey(weapon.name) + '">Open full weapon page</a></p>' +
      "</div></div>";
  }

  /* One percentage bar per attachment slot. */
  function metaBars(weapon) {
    var html = "";

    weapon.slots.forEach(function (slot) {
      var picks = (weapon.meta && weapon.meta[slot]) || [];
      if (!picks.length) return;

      html += '<div class="slot-block"><div class="slot-name">' + esc(h.slotLabel(slot)) + "</div>";
      picks.forEach(function (pick) {
        html += '<div class="bar"><div class="bar-top"><b>' + esc(pick.name) + " " +
          ui.confidenceTag(pick.confidence) + '</b><span>' + pick.percent + "%</span></div>" +
          '<div class="bar-track"><div class="bar-fill" style="width:' + Math.min(100, pick.percent) + '%"></div></div></div>';
      });
      html += "</div>";
    });

    if (!html) return '<p class="small muted">This weapon has no attachment slots with meta data.</p>';
    return html;
  }

  /* =================================================================
     WEAPON LIST
     ================================================================= */
  var WEAPON_TYPES = ["AR", "SMG", "LMG", "SHOTGUN", "MARKSMAN", "SNIPER", "PISTOL", "SHIELD", "MELEE", "LAUNCHER"];

  function weaponList(filters) {
    var list = D.weapons.filter(function (weapon) {
      if (filters.type && weapon.type !== filters.type) return false;
      if (filters.only === "meta" && !weapon.meta) return false;

      if (filters.q) {
        var needle = h.normalize(filters.q);
        var haystack = h.normalize([weapon.name, weapon.type, weapon.note || ""].join(" "));
        if (haystack.indexOf(needle) === -1) return false;
      }
      return true;
    });

    var existingTypes = WEAPON_TYPES.filter(function (type) {
      return D.weapons.some(function (weapon) { return weapon.type === type; });
    });
    var typeOptions = existingTypes.map(function (type) {
      return '<option value="' + type + '"' + (filters.type === type ? " selected" : "") + ">" + type + "</option>";
    }).join("");

    var hasFilter = filters.type || filters.q || filters.only;

    var html = "";
    html += ui.sectionHead("Weapons", "Weapons catalog",
      "Weapon stats, attachment slots and the estimated usage of the most popular attachments.");
    html += ui.breadcrumbs([{ text: "Home", link: "#/" }, { text: "Weapons" }]);

    html += '<div class="toolbar">' +
      '<span class="filtro-rotulo">Filters</span>' +
      '<select id="w-type" aria-label="Type"><option value="">All types</option>' + typeOptions + "</select>" +
      '<div class="divider"></div>' +
      '<input class="filtro-campo" id="w-q" type="search" placeholder="Search weapons..." value="' +
        esc(filters.q || "") + '" aria-label="Search weapons">' +
      '<span class="filtro-contagem"><b>' + list.length + "</b> of " + D.weapons.length + "</span>" +
      (hasFilter ? '<a class="btn" href="#/armas">Clear</a>' : "") +
    "</div>";

    html += ui.notice("<b>Attachment percentages are estimates.</b> No source publicly measures attachment usage in R6. " +
      "The numbers come from consensus among guides, Reddit and pro players, with confidence shown per item. " +
      "Weapon damage data comes from Ubisoft's official notes.", "info");

    html += '<div class="grid-weapons">' + list.map(ui.weaponCard).join("") + "</div>";

    html += ui.sectionHead("Reference", "Global attachment meta", "Estimated usage distribution across all weapons in the game.");
    html += '<div class="panes">' +
      globalMetaPane("cano", "Barrel / Muzzle") +
      globalMetaPane("grip", "Grip") +
      globalMetaPane("mira", "Sight / Scope") +
      globalMetaPane("under", "Under-barrel") +
    "</div>";

    html += ui.sectionHead("Reference", "Effect of each attachment", "Values measured and documented by the attachments wiki.");
    html += '<div class="tbl-scroll"><table><thead><tr>' +
      "<th>Attachment</th><th>Slot</th><th>Effect</th><th>Usage confidence</th></tr></thead><tbody>";
    Object.keys(D.attachmentEffects).forEach(function (partName) {
      var part = D.attachmentEffects[partName];
      html += "<tr><td><b>" + esc(partName) + "</b></td><td>" + esc(h.slotLabel(part.slot)) +
        "</td><td>" + esc(part.description) + "</td><td>" + ui.confidenceTag(part.confidence) + "</td></tr>";
    });
    html += "</tbody></table></div>";

    return html;
  }

  function globalMetaPane(slot, title) {
    var rows = D.metaGlobal[slot] || [];
    var html = '<div class="pane"><h3>' + esc(title) + "</h3>";

    rows.forEach(function (row) {
      var value = parseInt(row.percent, 10);
      var width = isNaN(value) ? 0 : Math.min(100, value);
      html += '<div class="bar"><div class="bar-top"><b>' + esc(row.name) + " " +
        ui.confidenceTag(row.confidence) + '</b><span>' + esc(row.percent) + "</span></div>" +
        '<div class="bar-track"><div class="bar-fill" style="width:' + width + '%"></div></div>' +
        '<div class="small muted" style="margin-top:3px">' + esc(row.description) + "</div></div>";
    });

    return html + "</div>";
  }

  /* =================================================================
     WEAPON DETAIL
     ================================================================= */
  function weaponDetail(name) {
    var weapon = h.findWeapon(name);
    if (!weapon) {
      return '<div class="empty-state"><b>Weapon not found</b><a href="#/armas">Back to the catalog</a></div>';
    }

    var users = D.weaponOperators(weapon.name);
    var html = "";

    html += ui.breadcrumbs([
      { text: "Home", link: "#/" },
      { text: "Weapons", link: "#/armas" },
      { text: weapon.name }
    ]);

    html += '<section class="detail-hero" style="border-left-color:var(--dourado)">' +
      '<div class="avatar">' + esc(h.initials(weapon.name)) + "</div>" +
      "<div>" +
        '<span class="eyebrow">' + esc(weapon.type) + "</span>" +
        "<h1>" + esc(weapon.name) + "</h1>" +
        '<div class="badges">' +
          '<span class="badge">damage <b>' + esc(weapon.damage) + "</b></span>" +
          '<span class="badge">' + esc(weapon.rpm) + " <b>rpm</b></span>" +
          '<span class="badge">magazine <b>' + esc(weapon.magazine) + "</b></span>" +
          '<span class="badge">slots <b>' + weapon.slots.length + "</b></span>" +
          '<span class="badge">' + users.length + " <b>operators</b></span>" +
        "</div>" +
        (weapon.note ? '<p class="muted" style="max-width:70ch">' + esc(weapon.note) + "</p>" : "") +
      "</div></section>";

    html += '<div class="panes">';

    html += '<div class="pane"><h3>Attachment meta per slot</h3>' +
      (weapon.meta ? metaBars(weapon)
        : '<p class="muted">No measured attachment meta or consensus data for this weapon. ' +
          "Check the wiki for available slots and effects.</p>") + "</div>";

    html += '<div class="pane"><h3>Available slots</h3><ul class="sec-list">';
    if (!weapon.slots.length) {
      html += '<li><span class="gadget-icone">-</span><div><b>No slots</b><small>This weapon does not accept attachments.</small></div></li>';
    }
    weapon.slots.forEach(function (slot) {
      html += "<li><span class='gadget-icone'>" + esc(slot.charAt(0).toUpperCase()) + "</span><div><b>" +
        esc(h.slotLabel(slot)) + "</b></div></li>";
    });
    html += "</ul></div>";

    html += '<div class="pane full"><h3>Operators that use it</h3>';
    if (!users.length) {
      html += '<p class="muted">No operators mapped.</p>';
    } else {
      html += '<div class="grid-ops">' + users.map(ui.operatorCard).join("") + "</div>";
    }
    html += "</div>";

    html += "</div>";
    return html;
  }

  /* =================================================================
     NEWS
     ================================================================= */

  /* The news list. With "summarized", the body is cut to two sentences. */
  function newsList(items, summarized) {
    if (!items.length) return '<div class="empty-state"><b>Nothing here</b></div>';

    return '<div class="news-list">' + items.map(function (item) {
      var dateParts = String(item.date).split("-");
      var text = summarized ? item.summary.split(". ").slice(0, 2).join(". ") + "." : item.summary;

      return '<article class="news-card">' +
        '<div class="news-date"><b>' + Number(dateParts[2]) + "</b><span>" +
          h.MONTHS[Number(dateParts[1]) - 1] + " " + dateParts[0] + "</span></div>" +
        "<div>" +
          "<h3>" + esc(item.title) + "</h3>" +
          "<p>" + esc(text) + "</p>" +
          '<div class="news-meta">' +
            '<span class="pill ' + esc(item.category) + '">' + esc(h.categoryLabel(item.category)) + "</span>" +
            (item.status && item.status !== "live"
              ? '<span class="pill ' + esc(item.status) + '">' + esc(h.statusLabel(item.status)) + "</span>"
              : "") +
            (item.sourceUrl
              ? '<a class="src-link" href="' + esc(item.sourceUrl) + '" target="_blank" rel="noopener">official source</a>'
              : "") +
          "</div>" +
        "</div></article>";
    }).join("") + "</div>";
  }

  function newsPage(filters) {
    var tab = filters.tab === "balanceamentos" ? "balanceamentos" : "noticias";
    var items = (D.news.items || []).slice().sort(function (a, b) {
      return a.date < b.date ? 1 : -1;
    });

    var categories = distinct(items.map(function (item) { return item.category; })).sort();

    if (filters.cat) {
      items = items.filter(function (item) { return item.category === filters.cat; });
    }

    var html = "";
    html += ui.sectionHead("News", "News and balance",
      "Official Ubisoft patch notes, season announcements, in-game events and esports results.");
    html += ui.breadcrumbs([{ text: "Home", link: "#/" }, { text: "News" }]);

    html += '<div class="tabs">' +
      '<button class="tab' + (tab === "noticias" ? " on" : "") + '" data-tab="noticias">News</button>' +
      '<button class="tab' + (tab === "balanceamentos" ? " on" : "") + '" data-tab="balanceamentos">Balance</button>' +
    "</div>";

    if (tab === "noticias") {
      html += '<div class="toolbar"><span class="filtro-rotulo">Categories</span>' +
        '<a class="chip' + (!filters.cat ? " on" : "") + '" href="#/noticias?tab=noticias">All</a>' +
        categories.map(function (category) {
          return '<a class="chip' + (filters.cat === category ? " on" : "") +
            '" href="#/noticias?tab=noticias&cat=' + encodeURIComponent(category) + '">' +
            esc(h.categoryLabel(category)) + "</a>";
        }).join("") +
        '<span class="filtro-contagem"><b>' + items.length + "</b> items</span></div>";

      html += newsList(items);
      html += ui.notice("Content summarized from official Ubisoft sources and esports sites. " +
        "Click &ldquo;official source&rdquo; for the original announcement.", "info");
    } else {
      html += patchList();
    }

    return html;
  }

  /* The balance tab: every patch note, each one collapsible. */
  function patchList() {
    var patches = D.patchnotes;
    var html = ui.notice("<b>Source:</b> official Ubisoft patch notes. " +
      "Expanding a patch shows highlights, new content, balance table and fixes.", "info");

    html += '<div class="toolbar">' +
      '<span class="filtro-rotulo">Legend</span>' +
      '<span class="pill buff">Buff</span><span class="pill nerf">Nerf</span><span class="pill mixed">Mixed</span>' +
      '<span class="filtro-contagem"><b>' + patches.patches.length + "</b> patches mapped</span>" +
      '<button class="btn" id="expand-all">Expand all</button></div>';

    html += patches.patches.map(patchBox).join("");
    return html;
  }

  /* One patch. The inside stays hidden until clicked. */
  function patchBox(patch) {
    var changes = patch.balance || [];
    var highlights = patch.highlights || [];
    var fixes = patch.bugFixes || {};
    var totalFixes = (fixes.gameplay || []).length + (fixes.ui || []).length;
    var body = "";

    if (highlights.length) {
      body += "<h4>Highlights</h4><ul>" +
        highlights.map(function (line) { return "<li>" + esc(line) + "</li>"; }).join("") + "</ul>";
    }

    if ((patch.newOperators || []).length) {
      body += "<h4>New operators</h4><ul>" +
        patch.newOperators.map(function (name) { return "<li><b>" + esc(name) + "</b></li>"; }).join("") + "</ul>";
    }

    if ((patch.newMaps || []).length) {
      body += "<h4>Maps</h4><ul>" +
        patch.newMaps.map(function (name) { return "<li>" + esc(name) + "</li>"; }).join("") + "</ul>";
    }

    if (changes.length) {
      body += "<h4>Balance changes (" + changes.length + ")</h4>" +
        '<div class="tbl-scroll"><table><thead><tr>' +
        "<th>Target</th><th>Gadget / weapon</th><th>Change</th><th>Direction</th></tr></thead><tbody>" +
        changes.map(function (change) {
          return "<tr><td><b>" + esc(change.operator || change.target || "-") + "</b></td><td>" +
            esc(change.gadget || "-") + "</td><td>" + esc(change.change) + "</td><td>" +
            ui.directionTag(change.direction) + "</td></tr>";
        }).join("") +
        "</tbody></table></div>";
    } else {
      body += '<p class="small muted" style="margin:10px 0 0">This note brought no balance changes for operator, gadget or weapon.</p>';
    }

    if (totalFixes) {
      body += "<h4>Fixes (" + totalFixes + ")</h4><details><summary>View fixes</summary><ul>" +
        (fixes.gameplay || []).map(function (line) { return "<li>" + esc(line) + "</li>"; }).join("") +
        (fixes.ui || []).map(function (line) { return '<li class="muted">' + esc(line) + "</li>"; }).join("") +
        "</ul></details>";
    }

    body += '<p class="small" style="margin-top:14px"><a class="src-link" href="' + esc(patch.sourceUrl) +
      '" target="_blank" rel="noopener">official patch notes</a></p>';

    return '<div class="patch" data-patch="' + esc(patch.version) + '">' +
      '<button class="patch-head" data-ptoggle>' +
        '<span class="patch-ver">' + esc(patch.version) + "</span>" +
        "<span><span class='patch-seen'>" + esc(patch.label) + " &middot; " + esc(patch.type) +
          " &middot; " + esc(h.formatDate(patch.date)) + "</span>" +
        '<div class="patch-title">' + esc(patch.headline || "") + "</div></span>" +
        '<span class="empurra"></span>' +
        '<span class="patch-seen">' + changes.length + " changes</span>" +
        '<span class="arrow">&#9656;</span>' +
      "</button>" +
      '<div class="patch-body">' + body + "</div>" +
    "</div>";
  }

  /* =================================================================
     RANKINGS
     ================================================================= */
  function rankingsPage(filters) {
    var tab = filters.tab === "solo" ? "solo" : "times";
    var ranking = D.rankings;
    var html = "";

    html += ui.sectionHead("Rankings", "Teams and players", "Official ranking, with sources and reference date.");
    html += ui.breadcrumbs([{ text: "Home", link: "#/" }, { text: "Rankings" }]);

    html += '<div class="toolbar"><span class="filtro-rotulo">Data source</span>' + sourceBadge() +
      '<span class="filtro-contagem">snapshot ' + esc(h.formatDate(ranking.snapshot)) + "</span></div>";

    html += '<div class="tabs">' +
      '<button class="tab' + (tab === "times" ? " on" : "") + '" data-tab="times">Teams</button>' +
      '<button class="tab' + (tab === "solo" ? " on" : "") + '" data-tab="solo">Solo / players</button>' +
    "</div>";

    if (tab === "times") {
      html += ui.notice("<b>Important:</b> " + esc(ranking.disclaimer.teams), "info");

      html += '<div class="tbl-scroll"><table><thead><tr>' +
        "<th>#</th><th>Team</th><th>Region</th><th>Roster</th><th>Titles</th><th>Rolling 12m</th><th>SI pts</th>" +
        "</tr></thead><tbody>";
      ranking.teams.forEach(function (team) {
        html += '<tr class="rank-medals rank-' + team.position + '"><td class="num"><b>' + team.position + "</b></td>" +
          '<td><div class="team-cell"><span class="team-logo">' + esc(h.initials(team.name)) + "</span>" +
          '<div><div class="tn"><a href="#">' + esc(team.name) + "</a></div>" +
          (team.coach && team.coach !== "-" ? '<div class="tr">coach ' + esc(team.coach) + "</div>" : "") +
          "</div></div>" +
          (team.note ? '<div class="small muted" style="margin-top:6px">' + esc(team.note) + "</div>" : "") + "</td>" +
          "<td>" + esc(team.region) + "</td>" +
          '<td class="small">' + esc(team.team) + "</td>" +
          '<td><ul class="titles">' + (team.titles || []).map(function (title) {
            return "<li>" + esc(title) + "</li>";
          }).join("") + "</ul></td>" +
          "<td><b>#" + team.rollingPosition + "</b> <span class='muted small'>" + esc(team.rollingPoints) + " pts</span></td>" +
          "<td><b>" + esc(team.siPoints) + "</b></td></tr>";
      });
      html += "</tbody></table></div>";

      html += ui.sectionHead("References", "Other teams in the ranking",
        "Positions in the 12-month rolling ranking and the Six Invitational points ranking.");
      html += '<div class="tbl-scroll"><table><thead><tr>' +
        "<th>Team</th><th>Rolling 12m</th><th>SI points pos.</th><th>Notes</th></tr></thead><tbody>";
      ranking.teamsMore.forEach(function (team) {
        html += "<tr><td><b>" + esc(team.name) + "</b></td><td>#" + esc(team.rollingPosition) +
          "</td><td>#" + esc(team.siPosition) + "</td>" +
          '<td class="small muted">' + esc(team.note || "") + "</td></tr>";
      });
      html += "</tbody></table></div>";

      html += ui.sectionHead("Circuit", "Upcoming events and context");
      html += '<div class="home-grid">' +
        '<div class="pane"><h3>Next Major</h3><p class="lead-big">' + esc(ranking.circuit.majorNext.name) + "</p>" +
          "<p>" + esc(ranking.circuit.majorNext.date) + " &middot; " + esc(ranking.circuit.majorNext.place) + " &middot; " +
          esc(ranking.circuit.majorNext.teams) + " teams</p>" +
          '<p class="small muted">' + esc(ranking.circuit.majorNext.note) + "</p></div>" +
        '<div class="pane"><h3>Next Six Invitational</h3><p class="lead-big">' + esc(ranking.circuit.siNext.name) + "</p>" +
          "<p>" + esc(ranking.circuit.siNext.date) + " &middot; " + esc(ranking.circuit.siNext.place) + "</p>" +
          '<p class="small muted">Qualified so far: <b>' + esc(ranking.circuit.qualifiedSoFar.join(", ")) + "</b>. " +
          esc(ranking.circuit.siNext.note) + "</p></div>" +
        '<div class="pane"><h3>Ranked 3.0</h3><p class="lead-big">' + esc(ranking.circuit.ranked.name) + "</p>" +
          "<p>Since " + esc(h.formatDate(ranking.circuit.ranked.since)) + " (" + esc(ranking.circuit.ranked.season) + ")</p>" +
          '<p class="small muted">' + esc(ranking.circuit.ranked.note) + "</p></div>" +
      "</div>";
    } else {
      html += ui.notice("<b>Honest notice:</b> " + esc(ranking.disclaimer.solo), "info");

      html += '<div class="expand-note" style="margin-bottom:18px">' +
        "If you set <code class='mono'>rankingApiUrl</code> in " +
        "<code class='mono'>assets/js/config.js</code>, this tab tries to fetch a live JSON endpoint " +
        "(format <code class='mono'>{ teams: [...], solo: [...] }</code>) and comes up with fresh data; " +
        "if the endpoint fails, the local snapshot below is kept. Current status: " + sourceBadge() + ". " +
        "With no API configured, the site shows verified real names and titles, without inventing MMR." +
      "</div>";

      html += '<div class="tbl-scroll"><table><thead><tr>' +
        "<th>#</th><th>Player</th><th>Country</th><th>Team</th><th>MMR / RP</th><th>Notes</th>" +
        "</tr></thead><tbody>";
      ranking.solo.forEach(function (player) {
        html += '<tr class="rank-medals rank-' + player.position + '"><td class="num"><b>' + esc(player.position) + "</b></td>" +
          "<td><div class='team-cell'><span class='team-logo'>" + esc(h.initials(player.nickname)) + "</span>" +
          '<div><div class="tn">' + esc(player.nickname) + '</div><div class="tr">' + esc(player.realName) + "</div></div></div></td>" +
          "<td>" + esc(player.country) + "</td>" +
          "<td>" + esc(player.team) + "</td>" +
          '<td><span class="mmr-na">no public MMR</span></td>' +
          '<td class="small">' + esc(player.note) + "</td></tr>";
      });
      html += "</tbody></table></div>";
    }

    html += '<p class="small muted" style="margin-top:18px">Ranking reference date: <b>' +
      esc(h.formatDate(ranking.snapshot)) + "</b>. Sources: " +
      '<a class="src-link" href="' + esc(CONFIG.sources.standings) + '" target="_blank" rel="noopener">Ubisoft global standings</a> and ' +
      '<a class="src-link" href="' + esc(CONFIG.sources.sixstats) + '" target="_blank" rel="noopener">SixStats</a>.</p>';

    return html;
  }

  /* The tag that shows where the ranking data came from. */
  function sourceBadge() {
    return window.R6HUB.api.sourceBadge();
  }

  /* =================================================================
     TIER LIST
     ================================================================= */
  function tierList(filters) {
    var side = filters.tab === "atk" ? "ATK" : filters.tab === "def" ? "DEF" : "";

    var html = "";
    html += ui.sectionHead("Meta", "Best operators right now",
      "Community consensus and performance in professional play, in one place.");
    html += ui.breadcrumbs([{ text: "Home", link: "#/" }, { text: "Meta" }]);

    html += ui.notice("<b>Opinion-based guide:</b> " + esc(D.tiers.intro) +
      " Reference date: " + esc(h.formatDate(D.tiers.updated)) + ".", "info");

    html += '<div class="tabs">' +
      '<button class="tab' + (!side ? " on" : "") + '" data-tab="">All</button>' +
      '<button class="tab' + (side === "ATK" ? " on" : "") + '" data-tab="atk">Attackers</button>' +
      '<button class="tab' + (side === "DEF" ? " on" : "") + '" data-tab="def">Defenders</button>' +
    "</div>";

    html += '<div class="tier-list">';
    D.tiers.tiers.forEach(function (tier) {
      var operators = tier.operators.map(h.findOperator).filter(function (operator) {
        return operator && (!side || operator.side === side);
      });
      if (!operators.length) return;

      html += '<div class="tier-row tier-' + tier.id + '">' +
        '<div class="tier-info">' +
          '<span class="tier-letter">' + esc(tier.label) + "</span>" +
          '<span class="tier-title">' + esc(tier.title) + "</span>" +
          "<p>" + esc(tier.description) + "</p>" +
        "</div>" +
        '<div class="tier-ops">' + operators.map(ui.operatorChip).join("") + "</div>" +
      "</div>";
    });
    html += "</div>";

    html += ui.sectionHead("Method", "How the tiers were built");
    html += '<div class="pane full"><ul class="sec-list">' +
      D.tiers.method.map(function (line) {
        return "<li><span class='gadget-icone'>i</span><div><b>" + esc(line) + "</b></div></li>";
      }).join("") +
    "</ul></div>";

    return html;
  }

  /* =================================================================
     SHARED SMALL HELPERS
     ================================================================= */

  /* Build the <option> list of a filter <select>. */
  function selectOptions(values, selected, defaultLabel) {
    var html = '<option value="">' + defaultLabel + "</option>";
    values.forEach(function (value) {
      var marked = String(selected) === String(value) ? " selected" : "";
      html += '<option value="' + esc(value) + '"' + marked + ">" + esc(value) + "</option>";
    });
    return html;
  }

  /* The unique values of an array, in first-seen order. */
  function distinct(values) {
    var result = [];
    values.forEach(function (value) {
      if (result.indexOf(value) === -1) result.push(value);
    });
    return result;
  }

  function countBySide(side) {
    return D.operators.filter(function (operator) { return operator.side === side; }).length;
  }

  return {
    home: home,
    operatorList: operatorList,
    operatorDetail: operatorDetail,
    weaponList: weaponList,
    weaponDetail: weaponDetail,
    newsPage: newsPage,
    rankingsPage: rankingsPage,
    tierList: tierList
  };
})();
