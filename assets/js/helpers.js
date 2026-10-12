/* =================================================================
   R6 HUB - helpers.js
   -----------------------------------------------------------------
   Small, reusable functions with no side effects. They only turn
   data into text, numbers or safe HTML strings. Nothing here reads
   the URL or touches the page, so this file is easy to test and
   easy to read on its own.

   Everything is exposed on window.R6HUB.helpers so the other
   scripts (ui.js, pages.js, app.js) can use it.
   ================================================================= */
window.R6HUB = window.R6HUB || {};

window.R6HUB.helpers = (function () {
  "use strict";

  /* Short names used when formatting a date. */
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  /* How each short data key should read on screen. */
  var CATEGORY_LABELS = {
    "esports": "Esports",
    "season-launch": "Season launch",
    "in-game-event": "In-game event",
    "ranked": "Ranked",
    "announcement": "Announcement",
    "community": "Community"
  };
  var STATUS_LABELS = {
    "live": "live",
    "announcement": "announcement",
    "preseason": "pre-season",
    "result": "result"
  };
  var SLOT_LABELS = {
    "mira": "Sight / Scope",
    "under": "Under-barrel",
    "grip": "Grip",
    "cano": "Barrel / Muzzle"
  };
  var CONFIDENCE_LABELS = {
    "alta": "high confidence",
    "media": "medium confidence",
    "baixa": "low confidence"
  };

  /* Make text safe before putting it inside an HTML string. Without
     this, a "<" in an operator name would break the whole page. */
  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  /* Make text comparable: lowercase and no accents, so "Coração"
     and "coracao" match the same search. */
  function normalize(value) {
    return String(value == null ? "" : value).toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  /* Initials for the small avatar square. "DarkZero" -> "DZ". */
  function initials(name) {
    var parts = String(name)
      .replace(/[^A-Za-z0-9\u00C0-\u024F ]/g, " ")
      .trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  /* Path to an operator's SVG drawing. "Tachanka" -> ".../tachanka.svg" */
  function operatorImage(name) {
    return "assets/img/operators/" + String(name || "")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") + ".svg";
  }

  /* "2026-09-22" -> "22 Sep 2026" */
  function formatDate(isoDate) {
    if (!isoDate) return "-";
    var parts = String(isoDate).slice(0, 10).split("-");
    if (parts.length !== 3) return isoDate;
    return Number(parts[2]) + " " + MONTHS[Number(parts[1]) - 1] + " " + parts[0];
  }

  /* Three little bars used for health and speed. */
  function dots(count, modifierClass) {
    var html = '<span class="dots ' + (modifierClass || "") + '">';
    for (var i = 1; i <= 3; i++) {
      html += "<b" + (i <= count ? ' class="on"' : "") + "></b>";
    }
    return html + "</span>";
  }

  /* Turn a value into something safe to put inside a link. */
  function encodeKey(value) {
    return encodeURIComponent(String(value));
  }

  /* "ATK" -> "Attacker", anything else -> "Defender". */
  function sideName(side) {
    return side === "ATK" ? "Attacker" : "Defender";
  }

  /* "ATK" -> "ATK", anything else -> "DEF". */
  function sideCode(side) {
    return side === "ATK" ? "ATK" : "DEF";
  }

  /* Find an operator by id, or null. */
  function findOperator(id) {
    var found = window.R6HUB.operators.filter(function (operator) {
      return operator.id === id;
    });
    return found[0] || null;
  }

  /* Find a weapon by name, ignoring case. */
  function findWeapon(name) {
    var index = window.R6HUB.weaponIndex;
    return index[String(name || "").toLowerCase()] || index[normalize(name)] || null;
  }

  /* The friendly name of an operator role id ("roamer" -> "Roamer"). */
  function roleLabel(roleId) {
    var found = window.R6HUB.roles.filter(function (role) {
      return role.id === roleId;
    });
    return found[0] ? found[0].label : roleId;
  }

  function categoryLabel(key) { return CATEGORY_LABELS[key] || key; }
  function statusLabel(key) { return STATUS_LABELS[key] || key; }
  function slotLabel(key) { return SLOT_LABELS[key] || key; }
  function confidenceText(key) { return CONFIDENCE_LABELS[key] || key; }

  /* =================================================================
     URL helpers
     The address bar stores what is open. Examples:
       #/                        home
       #/operators?side=ATK      operator list, attackers only
       #/operator/ash            Ash detail page
       #/weapon/M249%20SAW       M249 detail page
     ================================================================= */

  /* Split "#/path?a=b&c=d" into { path, filters, segments }. */
  function parseHash() {
    var raw = location.hash.replace(/^#/, "") || "/";
    var questionMark = raw.indexOf("?");
    var path = questionMark === -1 ? raw : raw.slice(0, questionMark);
    var filters = {};

    if (questionMark !== -1) {
      raw.slice(questionMark + 1).split("&").forEach(function (pair) {
        if (!pair) return;
        var pieces = pair.split("=");
        filters[decodeURIComponent(pieces[0])] =
          decodeURIComponent((pieces[1] || "").replace(/\+/g, " "));
      });
    }

    return { path: path, filters: filters, segments: path.split("/").filter(Boolean) };
  }

  /* Go to a page, building the "#/path?filters" address. */
  function navigateTo(path, filters) {
    var parts = [];
    if (filters) {
      Object.keys(filters).forEach(function (key) {
        if (filters[key]) {
          parts.push(encodeURIComponent(key) + "=" + encodeURIComponent(filters[key]));
        }
      });
    }
    location.hash = "#" + path + (parts.length ? "?" + parts.join("&") : "");
  }

  /* Change one filter without losing the others. */
  function changeFilter(changes) {
    var filters = parseHash().filters;
    Object.keys(changes).forEach(function (key) {
      if (changes[key] == null || changes[key] === "") delete filters[key];
      else filters[key] = changes[key];
    });
    navigateTo(parseHash().path, filters);
  }

  return {
    MONTHS: MONTHS,
    escapeHtml: escapeHtml,
    normalize: normalize,
    initials: initials,
    operatorImage: operatorImage,
    formatDate: formatDate,
    dots: dots,
    encodeKey: encodeKey,
    sideName: sideName,
    sideCode: sideCode,
    findOperator: findOperator,
    findWeapon: findWeapon,
    roleLabel: roleLabel,
    categoryLabel: categoryLabel,
    statusLabel: statusLabel,
    slotLabel: slotLabel,
    confidenceText: confidenceText,
    parseHash: parseHash,
    navigateTo: navigateTo,
    changeFilter: changeFilter
  };
})();
