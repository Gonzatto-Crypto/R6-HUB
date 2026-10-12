/* =================================================================
   R6 HUB - app.js
   -----------------------------------------------------------------
   The "glue" of the site. It does three things, in this order:

     1. Reads the URL (the "#/..." after the site name) and decides
        which page to show.
     2. Asks pages.js for that page's HTML and puts it on screen.
     3. Wires up the buttons, filters and search fields.

   How to test a change here:
     open _selftest.html in the browser. It walks through every page
     and reports if something broke.

   All the pure data and HTML building lives elsewhere:
     helpers.js  -> small pure functions and URL helpers
     ui.js       -> reusable pieces of screen
     pages.js    -> one function per page
   This file only decides and connects.
   ================================================================= */
(function () {
  "use strict";

  var D = window.R6HUB;
  var CONFIG = window.R6HUB_CONFIG;
  var h = window.R6HUB.helpers;
  var pages = window.R6HUB.pages;
  var MAIN = document.getElementById("main");

  function getEl(id) { return document.getElementById(id); }

  /* =================================================================
     RANKINGS API (optional live data)
     -----------------------------------------------------------------
     The site works offline from the local snapshot. If the owner sets
     rankingApiUrl in config.js, the rankings page tries to fetch a
     live JSON endpoint and falls back to the snapshot if it fails.
     ================================================================= */
  var api = {
    enabled: !!CONFIG.rankingApiUrl,
    loading: false,
    loaded: false,
    error: "",

    /* Try to fetch the ranking. On failure, keep the local snapshot. */
    load: function () {
      if (!api.enabled || api.loading || api.loaded) return;
      api.loading = true;

      fetch(CONFIG.rankingApiUrl, { headers: CONFIG.rankingApiHeaders || {} })
        .then(function (response) {
          if (!response.ok) throw new Error("HTTP " + response.status);
          return response.json();
        })
        .then(function (data) {
          if (data && Array.isArray(data.teams) && data.teams.length) D.rankings.teams = data.teams;
          if (data && Array.isArray(data.solo) && data.solo.length) D.rankings.solo = data.solo;
          api.loaded = true;
          if (h.parseHash().segments[0] === "rankings") drawPage();
        })
        .catch(function (error) {
          api.error = String(error && error.message || error);
        })
        .then(function () {
          api.loading = false;
        });
    },

    /* The tag that shows where the ranking data came from. */
    sourceBadge: function () {
      if (!api.enabled) {
        return '<span class="badge">source: <b>local snapshot</b> (' + h.escapeHtml(h.formatDate(CONFIG.snapshot)) + ")</span>";
      }
      if (api.loaded) return '<span class="badge gold">source: <b>live API</b></span>';
      if (api.loading) return '<span class="badge">source: <b>querying API...</b></span>';
      return '<span class="badge">source: <b>local snapshot</b> (API unavailable: ' +
        h.escapeHtml(api.error || "no connection") + ")</span>";
    }
  };
  window.R6HUB.api = api;

  /* =================================================================
     ROUTER
     ================================================================= */
  var lastPath = null;

  function drawPage() {
    var url = h.parseHash();
    var filters = url.filters;
    var section = url.segments[0] || "";
    var html = "";

    /* When a filter redraws the page, the search caret must not jump.
       Remember where it was. */
    var focused = document.activeElement;
    var focusedId = (focused && focused.id && MAIN.contains(focused)) ? focused.id : null;
    var caret = (focusedId && focused.selectionStart != null) ? focused.selectionStart : null;

    if (section === "") {
      html = pages.home();
    } else if (section === "agentes") {
      html = pages.operatorList(filters);
    } else if (section === "agente") {
      html = pages.operatorDetail(decodeURIComponent(url.segments[1] || ""));
    } else if (section === "armas") {
      html = pages.weaponList(filters);
    } else if (section === "arma") {
      html = pages.weaponDetail(url.segments[1] ? decodeURIComponent(url.segments[1]) : "");
    } else if (section === "noticias") {
      html = pages.newsPage(filters);
    } else if (section === "rankings") {
      html = pages.rankingsPage(filters);
    } else if (section === "tiers") {
      html = pages.tierList(filters);
    } else {
      html = '<div class="empty-state"><b>Page not found</b><a href="#/">Back to home</a></div>';
    }

    MAIN.innerHTML = html;
    document.title = "R6-HUB";

    /* Mark the open section in the top menu. */
    document.querySelectorAll("#nav a").forEach(function (link) {
      var key = link.getAttribute("data-nav");
      var isOpen = (key === "/" && section === "") ||
                   (key && key === section) ||
                   (key === "agentes" && section === "agente") ||
                   (key === "armas" && section === "arma");
      link.classList.toggle("active", !!isOpen);
    });

    wireEvents();

    /* Put the caret back in the search field. */
    if (focusedId) {
      var field = document.getElementById(focusedId);
      if (field) {
        field.focus();
        if (caret != null && field.setSelectionRange) {
          try { field.setSelectionRange(caret, caret); } catch (error) { /* ignore */ }
        }
      }
    }

    /* Scroll to top only when the page changed, not on every filter. */
    if (lastPath === null || lastPath !== url.path) window.scrollTo(0, 0);
    lastPath = url.path;

    if (section === "rankings") api.load();
  }

  /* =================================================================
     WIRING
     ================================================================= */
  function wireEvents() {

    /* Open/close a weapon row. */
    MAIN.querySelectorAll("[data-wtoggle]").forEach(function (button) {
      button.addEventListener("click", function () {
        button.parentNode.classList.toggle("open");
        button.querySelector(".empurra").textContent =
          button.parentNode.classList.contains("open") ? "close" : "attachment meta";
      });
    });

    /* Open/close a patch note. */
    MAIN.querySelectorAll("[data-ptoggle]").forEach(function (button) {
      button.addEventListener("click", function () {
        button.parentNode.classList.toggle("open");
      });
    });

    /* "Expand all" / "Collapse all" button. */
    var expandButton = getEl("expand-all");
    if (expandButton) {
      expandButton.addEventListener("click", function () {
        var allPatches = MAIN.querySelectorAll(".patch");
        var alreadyOpen = MAIN.querySelectorAll(".patch.open").length;
        var shouldOpen = alreadyOpen < allPatches.length / 2;
        allPatches.forEach(function (patch) { patch.classList.toggle("open", shouldOpen); });
        expandButton.textContent = shouldOpen ? "Collapse all" : "Expand all";
      });
    }

    /* Tabs (News / Balance / Teams / Solo / tier side). */
    MAIN.querySelectorAll("[data-tab]").forEach(function (button) {
      button.addEventListener("click", function () {
        h.changeFilter({ tab: button.getAttribute("data-tab") });
      });
    });

    /* Read a filter <select> and push its value into the URL. */
    function wireSelect(fieldId, filterName) {
      var field = getEl(fieldId);
      if (!field) return;
      field.addEventListener("change", function () {
        var change = {};
        change[filterName] = field.value;
        h.changeFilter(change);
      });
    }

    wireSelect("f-side", "side");
    wireSelect("f-role", "role");
    wireSelect("f-ctu", "ctu");
    wireSelect("f-speed", "speed");
    wireSelect("f-health", "health");
    wireSelect("f-year", "year");
    wireSelect("w-type", "type");

    /* Filter search field. Wait for the person to stop typing before
       redrawing, otherwise the page flickers on every key. */
    function wireSearch(fieldId, filterName) {
      var field = getEl(fieldId);
      if (!field) return;
      var waitTimer = null;
      field.addEventListener("input", function () {
        clearTimeout(waitTimer);
        var typedValue = field.value;
        waitTimer = setTimeout(function () {
          var change = {};
          change[filterName] = typedValue;
          h.changeFilter(change);
        }, 320);
      });
    }

    wireSearch("f-q", "q");
    wireSearch("w-q", "q");
  }

  /* =================================================================
     GLOBAL SEARCH (top bar)
     ================================================================= */
  function globalSearch(term) {
    var box = getEl("search-results");
    var needle = h.normalize(term);

    if (needle.length < 2) {
      box.hidden = true;
      box.innerHTML = "";
      return;
    }

    var operators = D.operators.filter(function (operator) {
      return h.normalize([operator.name, operator.unit, operator.region, operator.gadget, operator.gadgetType].join(" "))
        .indexOf(needle) !== -1;
    }).slice(0, 7);

    var weapons = D.weapons.filter(function (weapon) {
      return h.normalize([weapon.name, weapon.type].join(" ")).indexOf(needle) !== -1;
    }).slice(0, 6);

    var html = "";

    if (operators.length) {
      html += '<div class="busca-grupo"><div class="busca-titulo">Operators</div>';
      operators.forEach(function (operator) {
        html += '<a class="busca-item" href="#/agente/' + h.encodeKey(operator.id) + '">' +
          '<span class="etiqueta-lado ' + (operator.side === "ATK" ? "atk" : "def") + '">' + h.sideCode(operator.side) + "</span>" +
          "<span><b>" + h.escapeHtml(operator.name) + '</b><br><small>' + h.escapeHtml(operator.gadget) + "</small></span></a>";
      });
      html += "</div>";
    }

    if (weapons.length) {
      html += '<div class="busca-grupo"><div class="busca-titulo">Weapons</div>';
      weapons.forEach(function (weapon) {
        html += '<a class="busca-item" href="#/arma/' + h.encodeKey(weapon.name) + '">' +
          '<span class="etiqueta-lado def">' + h.escapeHtml(weapon.type) + "</span>" +
          "<span><b>" + h.escapeHtml(weapon.name) + '</b><br><small>' + h.escapeHtml(weapon.damage) +
          " damage &middot; " + h.escapeHtml(weapon.magazine) + "</small></span></a>";
      });
      html += "</div>";
    }

    if (!html) {
      html = '<div class="busca-vazia">Nothing found for &ldquo;' + h.escapeHtml(term) + "&rdquo;.</div>";
    }

    box.innerHTML = html;
    box.hidden = false;
  }

  /* =================================================================
     INIT (runs once, when the page opens)
     ================================================================= */
  function init() {

    /* Source list in the footer. */
    var sourceList = getEl("footer-sources");
    if (sourceList) {
      var sources = CONFIG.sources;
      sourceList.innerHTML = [
        ["Operators (Ubisoft)", sources.operators],
        ["Operators (wiki)", sources.wiki],
        ["Official patch notes", sources.patchNotes],
        ["Pro ranking", sources.standings],
        ["Rolling 12m ranking", sources.sixstats],
        ["Attachments and effects", sources.attachments]
      ].map(function (source) {
        return '<li><a href="' + h.escapeHtml(source[1]) + '" target="_blank" rel="noopener">' + h.escapeHtml(source[0]) + "</a></li>";
      }).join("");
    }

    /* Mobile menu: the hamburger button opens and closes it. */
    var menuButton = getEl("burger");
    var menu = getEl("nav");

    menuButton.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", open ? "true" : "false");
    });

    menu.addEventListener("click", function (event) {
      if (event.target.tagName === "A") menu.classList.remove("open");
    });

    /* Top search. */
    var searchField = getEl("search-input");
    var resultsBox = getEl("search-results");
    var waitTimer = null;

    searchField.addEventListener("input", function () {
      clearTimeout(waitTimer);
      var typed = searchField.value;
      waitTimer = setTimeout(function () { globalSearch(typed); }, 140);
    });

    /* Clicking an already-filled field shows the results again. */
    searchField.addEventListener("focus", function () {
      if (searchField.value.length >= 2) globalSearch(searchField.value);
    });

    /* Clicked outside the search? Close the results. */
    document.addEventListener("click", function (event) {
      var inside = event.target.closest("#search") || event.target.closest("#search-results");
      if (!inside) resultsBox.hidden = true;
    });

    /* Esc closes the search. */
    searchField.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        resultsBox.hidden = true;
        searchField.blur();
      }
    });

    /* The page redraws itself when the address changes. */
    window.addEventListener("hashchange", drawPage);
    drawPage();

    /* On the balance tab, open the most recent patch straight away. */
    var firstPatch = document.querySelector(".patch");
    if (firstPatch) firstPatch.classList.add("open");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
