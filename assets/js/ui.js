/* =================================================================
   R6 HUB - ui.js
   -----------------------------------------------------------------
   Reusable pieces of screen. Each function returns a string of HTML
   and never touches the page itself. Keeping them here means the
   operator card, the section header and the badges are written only
   once, no matter how many pages use them.

   Depends on window.R6HUB.helpers.
   ================================================================= */
window.R6HUB = window.R6HUB || {};

window.R6HUB.ui = (function () {
  "use strict";

  var h = window.R6HUB.helpers;

  /* The 52px square with the operator drawing on top and the
     initials behind it. If the drawing fails to load, onerror
     removes the image and the initials show through. */
  function avatarBox(operator) {
    return '<div class="avatar">' +
      '<span class="avatar-letras">' + h.escapeHtml(h.initials(operator.name)) + "</span>" +
      '<img src="' + h.escapeHtml(h.operatorImage(operator.name)) + '" alt="' +
        h.escapeHtml("Portrait of operator " + operator.name) +
        '" loading="lazy" decoding="async" onerror="this.remove()">' +
    "</div>";
  }

  /* A section header: label and title on the left, optional button on the right. */
  function sectionHead(kicker, title, description, extraButton) {
    return '<div class="sec-head"><div><span class="etiqueta">' + h.escapeHtml(kicker) + "</span><h2>" +
      h.escapeHtml(title) + "</h2>" + (description ? "<p>" + h.escapeHtml(description) + "</p>" : "") + "</div>" +
      '<div class="empurra"></div>' + (extraButton || "") + "</div>";
  }

  /* The Inicio / Agentes / Ash trail at the top of a page. */
  function breadcrumbs(items) {
    var html = '<nav class="crumbs">';
    items.forEach(function (item, index) {
      if (index) html += "<span>/</span>";
      html += item.link
        ? '<a href="' + h.escapeHtml(item.link) + '">' + h.escapeHtml(item.text) + "</a>"
        : "<span>" + h.escapeHtml(item.text) + "</span>";
    });
    return html + "</nav>";
  }

  /* The blue or yellow notice box. */
  function notice(html, kind) {
    return '<div class="notice ' + (kind || "") + '"><span class="aviso-icone">' +
      (kind === "info" ? "i" : "!") + "</span><div>" + html + "</div></div>";
  }

  /* The small confidence tag on an attachment estimate. */
  function confidenceTag(confidence) {
    return '<span class="conf ' + (confidence || "") + '">' +
      h.escapeHtml(h.confidenceText(confidence)) + "</span>";
  }

  /* The colored Buff / Nerf / Mixed tag. */
  function directionTag(direction) {
    var text = direction === "buff" ? "Buff" : direction === "nerf" ? "Nerf" : "Mixed";
    return '<span class="pill ' + (direction || "mixed") + '">' + text + "</span>";
  }

  /* One operator inside a grid. */
  function operatorCard(operator) {
    var sideClass = operator.side === "ATK" ? "atk" : "def";
    var healthDots = operator.health === 125 ? 3 : operator.health === 110 ? 2 : 1;

    return '<a class="card ' + sideClass + '" href="#/agente/' + h.encodeKey(operator.id) + '">' +
      '<div class="card-top">' +
        avatarBox(operator) +
        '<div class="card-title"><h3>' + h.escapeHtml(operator.name) + "</h3>" +
        '<div class="sub">' + h.escapeHtml(operator.unit) + " &middot; " + h.escapeHtml(operator.region) + "</div></div>" +
        '<span class="side-badge ' + sideClass + '">' + h.sideCode(operator.side) + "</span>" +
      "</div>" +
      '<div class="card-body"><div class="gadget-line"><b>Main gadget</b>' + h.escapeHtml(operator.gadget) + "</div></div>" +
      '<div class="card-foot">' +
        '<span class="stat-mini"><i>hp</i>' + h.dots(healthDots) + operator.health + "</span>" +
        '<span class="stat-mini"><i>spd</i>' + h.dots(operator.speed, sideClass) + operator.speed + "</span>" +
        '<span class="empurra">' + h.escapeHtml(operator.roles.map(h.roleLabel).join(" / ")) + "</span>" +
      "</div></a>";
  }

  /* The weapon drawing for cards and the weapon page. The weapon type
     is written behind the image, so it stays visible if the drawing
     fails to load (for example a weapon not drawn yet). */
  function weaponArt(weapon, modifierClass) {
    return '<span class="w-art' + (modifierClass ? " " + modifierClass : "") + '">' +
      '<span class="w-art-txt">' + h.escapeHtml(weapon.type) + "</span>" +
      '<img src="' + h.escapeHtml(h.weaponImage(weapon.name)) + '" alt="' +
        h.escapeHtml(weapon.name + " drawing") +
        '" loading="lazy" decoding="async" onerror="this.remove()">' +
    "</span>";
  }

  /* One weapon inside a grid. */
  function weaponCard(weapon) {
    return '<a class="card w-card" href="#/arma/' + h.encodeKey(weapon.name) + '">' +
      weaponArt(weapon) +
      '<div class="card-top"><div class="card-title">' +
        '<span class="wc-type">' + h.escapeHtml(weapon.type) + "</span>" +
        '<h3 style="margin-top:2px">' + h.escapeHtml(weapon.name) + "</h3>" +
      "</div></div>" +
      '<div class="spec-row">' +
        '<div class="spec"><b>' + h.escapeHtml(weapon.damage) + '</b><span>damage</span></div>' +
        '<div class="spec"><b>' + h.escapeHtml(weapon.rpm) + '</b><span>rpm</span></div>' +
        '<div class="spec"><b>' + h.escapeHtml(weapon.magazine) + '</b><span>mag</span></div>' +
        '<div class="spec"><b>' + weapon.slots.length + '</b><span>slots</span></div>' +
      "</div>" +
      '<div class="card-foot"><span class="meta-flag">' + (weapon.meta ? "attachment meta" : "no meta") + "</span>" +
      '<span class="empurra">view</span></div></a>';
  }

  /* A small operator chip used by the tier list: portrait, name and side. */
  function operatorChip(operator) {
    var sideClass = operator.side === "ATK" ? "atk" : "def";
    return '<a class="tier-op ' + sideClass + '" href="#/agente/' + h.encodeKey(operator.id) + '">' +
      '<span class="tier-op-avatar">' + h.escapeHtml(h.initials(operator.name)) +
        '<img src="' + h.escapeHtml(h.operatorImage(operator.name)) + '" alt="" loading="lazy" decoding="async" onerror="this.remove()">' +
      "</span>" +
      '<span class="tier-op-name">' + h.escapeHtml(operator.name) + "</span>" +
      '<span class="tier-op-side ' + sideClass + '">' + h.sideCode(operator.side) + "</span>" +
    "</a>";
  }

  return {
    avatarBox: avatarBox,
    sectionHead: sectionHead,
    breadcrumbs: breadcrumbs,
    notice: notice,
    confidenceTag: confidenceTag,
    directionTag: directionTag,
    operatorCard: operatorCard,
    weaponCard: weaponCard,
    weaponArt: weaponArt,
    operatorChip: operatorChip
  };
})();
