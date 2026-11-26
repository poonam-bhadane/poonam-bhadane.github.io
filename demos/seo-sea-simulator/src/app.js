/*
 * app.js — wires the UI to the two engines and renders the simulated SERP.
 *
 * Depends (via plain <script> tags, load order matters):
 *   window.Auction  (auction.js)
 *   window.Seo      (seo.js)
 *   window.SeedData (data.js)
 *
 * No framework, no build step. Everything runs in the browser.
 */
(function () {
  "use strict";

  // Working copies of the seed data that the editor panels mutate.
  var advertisers = JSON.parse(JSON.stringify(window.SeedData.advertisers));
  var organicPages = JSON.parse(JSON.stringify(window.SeedData.organicPages));

  function el(id) {
    return document.getElementById(id);
  }

  function money(n) {
    return "\u20ac" + n.toFixed(2); // euro sign
  }

  // ---- Rendering the SERP ---------------------------------------------------

  function renderAds(query) {
    var winners = window.Auction.runAuction(query, advertisers);
    var host = el("ads");
    if (!winners.length) {
      host.innerHTML =
        '<p class="empty">No ads matched this query (check keywords / match types).</p>';
      return;
    }
    host.innerHTML = winners
      .map(function (a) {
        return (
          '<div class="result ad">' +
          '<div class="rank">#' +
          a.position +
          "</div>" +
          '<div class="body">' +
          '<div class="tag">Sponsored</div>' +
          '<div class="name">' +
          a.name +
          "</div>" +
          '<div class="metrics">' +
          "Quality Score <b>" +
          a.qualityScore +
          "</b> \u00b7 Ad Rank <b>" +
          a.adRank.toFixed(1) +
          "</b> \u00b7 You pay <b>" +
          money(a.actualCpc) +
          "</b>/click" +
          "</div>" +
          '<div class="sub">keyword: "' +
          a.keyword +
          '" (' +
          a.matchType +
          ") \u00b7 bid " +
          money(a.bid) +
          "</div>" +
          "</div>" +
          "</div>"
        );
      })
      .join("");
  }

  function renderOrganic(query) {
    var ranked = window.Seo.rankOrganic(organicPages, query);
    var host = el("organic");
    host.innerHTML = ranked
      .map(function (p) {
        var note = p.note ? ' <span class="note">' + p.note + "</span>" : "";
        return (
          '<div class="result organic">' +
          '<div class="rank">#' +
          p.position +
          "</div>" +
          '<div class="body">' +
          '<div class="url">' +
          p.url +
          "</div>" +
          '<div class="name">' +
          p.title +
          note +
          "</div>" +
          '<div class="metrics">' +
          "SEO score <b>" +
          p.seoScore +
          "</b>" +
          "</div>" +
          '<div class="bars">' +
          bar("on-page", p.onPage) +
          bar("technical", p.technical) +
          bar("off-page", p.offPage) +
          "</div>" +
          "</div>" +
          "</div>"
        );
      })
      .join("");
  }

  function bar(label, value) {
    return (
      '<div class="bar"><span class="bar-label">' +
      label +
      '</span><span class="bar-track"><span class="bar-fill" style="width:' +
      value +
      '%"></span></span><span class="bar-val">' +
      value +
      "</span></div>"
    );
  }

  function search() {
    var query = el("query").value.trim();
    el("queryEcho").textContent = query || "(empty)";
    renderAds(query);
    renderOrganic(query);
  }

  // ---- Editor panels (mutate the working data, then re-run) -----------------

  function renderAdvertiserEditor() {
    var host = el("advEditor");
    host.innerHTML = advertisers
      .map(function (a, i) {
        return (
          '<div class="edit-card">' +
          "<h4>" +
          a.name +
          "</h4>" +
          field("Bid (\u20ac)", "adv-" + i + "-bid", a.bid, "number", 0.1) +
          field(
            "Expected CTR (1-10)",
            "adv-" + i + "-ctr",
            a.components.expectedCtr,
            "number",
            1
          ) +
          field(
            "Ad relevance (1-10)",
            "adv-" + i + "-rel",
            a.components.adRelevance,
            "number",
            1
          ) +
          field(
            "Landing page (1-10)",
            "adv-" + i + "-lp",
            a.components.landingPageExperience,
            "number",
            1
          ) +
          "</div>"
        );
      })
      .join("");

    advertisers.forEach(function (a, i) {
      bind("adv-" + i + "-bid", function (v) {
        a.bid = parseFloat(v) || 0;
      });
      bind("adv-" + i + "-ctr", function (v) {
        a.components.expectedCtr = clampInput(v);
      });
      bind("adv-" + i + "-rel", function (v) {
        a.components.adRelevance = clampInput(v);
      });
      bind("adv-" + i + "-lp", function (v) {
        a.components.landingPageExperience = clampInput(v);
      });
    });
  }

  function renderPageEditor() {
    var host = el("pageEditor");
    host.innerHTML = organicPages
      .map(function (p, i) {
        return (
          '<div class="edit-card">' +
          "<h4>" +
          p.name +
          "</h4>" +
          field("LCP (seconds)", "pg-" + i + "-lcp", p.lcpSeconds, "number", 0.1) +
          field("Backlinks", "pg-" + i + "-bl", p.backlinks, "number", 1) +
          checkbox("Indexable", "pg-" + i + "-idx", p.indexable) +
          checkbox("Mobile-friendly", "pg-" + i + "-mob", p.mobileFriendly) +
          checkbox("Structured data", "pg-" + i + "-sd", p.structuredData) +
          "</div>"
        );
      })
      .join("");

    organicPages.forEach(function (p, i) {
      bind("pg-" + i + "-lcp", function (v) {
        p.lcpSeconds = parseFloat(v) || 0;
      });
      bind("pg-" + i + "-bl", function (v) {
        p.backlinks = parseInt(v, 10) || 0;
      });
      bindCheck("pg-" + i + "-idx", function (v) {
        p.indexable = v;
      });
      bindCheck("pg-" + i + "-mob", function (v) {
        p.mobileFriendly = v;
      });
      bindCheck("pg-" + i + "-sd", function (v) {
        p.structuredData = v;
      });
    });
  }

  function clampInput(v) {
    return window.Auction.clamp(parseInt(v, 10) || 1, 1, 10);
  }

  function field(label, id, value, type, step) {
    return (
      '<label class="fld">' +
      "<span>" +
      label +
      "</span>" +
      '<input id="' +
      id +
      '" type="' +
      type +
      '" step="' +
      step +
      '" value="' +
      value +
      '">' +
      "</label>"
    );
  }

  function checkbox(label, id, checked) {
    return (
      '<label class="chk">' +
      '<input id="' +
      id +
      '" type="checkbox" ' +
      (checked ? "checked" : "") +
      ">" +
      "<span>" +
      label +
      "</span>" +
      "</label>"
    );
  }

  function bind(id, fn) {
    var node = el(id);
    if (!node) return;
    node.addEventListener("input", function () {
      fn(node.value);
      search();
    });
  }

  function bindCheck(id, fn) {
    var node = el(id);
    if (!node) return;
    node.addEventListener("change", function () {
      fn(node.checked);
      search();
    });
  }

  function reset() {
    advertisers = JSON.parse(JSON.stringify(window.SeedData.advertisers));
    organicPages = JSON.parse(JSON.stringify(window.SeedData.organicPages));
    renderAdvertiserEditor();
    renderPageEditor();
    search();
  }

  // ---- Init -----------------------------------------------------------------

  function init() {
    el("query").value = window.SeedData.defaultQuery;
    el("searchBtn").addEventListener("click", search);
    el("query").addEventListener("keydown", function (e) {
      if (e.key === "Enter") search();
    });
    el("resetBtn").addEventListener("click", reset);
    renderAdvertiserEditor();
    renderPageEditor();
    search();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
