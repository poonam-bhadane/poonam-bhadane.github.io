/*
 * seo.js — the organic-ranking (SEO) scoring engine.
 *
 * Pure functions only. Implements exactly the model documented in
 * docs/seo-ranking-mechanics.md:
 *
 *   onPageScore    (0..100)  weight 45%
 *   technicalScore (0..100)  weight 30%
 *   offPageScore   (0..100)  weight 25%
 *   seoScore = 0.45*onPage + 0.30*technical + 0.25*offPage
 *   (forced to 0 if the page is not indexable)
 *
 * Attached to window.Seo for plain <script> use (no build step).
 */
(function () {
  "use strict";

  function cap100(x) {
    return Math.max(0, Math.min(100, x));
  }

  function has(text, keyword) {
    if (!text || !keyword) return false;
    return text.toLowerCase().indexOf(keyword.toLowerCase()) !== -1;
  }

  /**
   * On-page sub-score (0..100), weight 45%.
   * @param {object} page  see data.js for the shape
   * @param {string} keyword target keyword
   */
  function scoreOnPage(page, keyword) {
    var pts = 0;
    if (has(page.title, keyword)) pts += 25; // keyword in title tag
    if (has(page.h1, keyword)) pts += 15; // keyword in H1
    if (has(page.bodyText, keyword))
      pts += 15; // keyword in body
    else if (page.bodyText) pts += 7; // partial credit if there's body at all
    if (page.metaDescription) pts += 10; // meta description present
    // content length: full at/above target words, scaled below
    var targetWords = 600;
    var words = page.wordCount || 0;
    pts += Math.round((Math.min(words, targetWords) / targetWords) * 15);
    if (has(page.urlSlug, keyword)) pts += 10; // keyword in URL slug
    if (page.hasImageAlt) pts += 10; // image alt text present
    return cap100(pts);
  }

  /** Technical sub-score (0..100), weight 30%. */
  function scoreTechnical(page) {
    var pts = 0;
    // page speed via LCP seconds
    if (page.lcpSeconds <= 2.5) pts += 30;
    else if (page.lcpSeconds <= 4.0) pts += 15;
    if (page.mobileFriendly) pts += 25;
    if (page.https) pts += 15;
    if (page.structuredData) pts += 15;
    if (page.indexable) pts += 15;
    return cap100(pts);
  }

  /** Off-page sub-score (0..100), weight 25%. */
  function scoreOffPage(page) {
    var backlinks = page.backlinks || 0;
    var authority = page.avgLinkingDomainAuthority || 0; // 0..100
    var pts = 0;
    pts += (Math.min(backlinks, 50) / 50) * 60; // diminishing returns, cap 50 links
    pts += (authority / 100) * 30; // quality of linking domains
    if (page.brandMentions) pts += 10;
    return cap100(Math.round(pts));
  }

  /**
   * Full page score with breakdown. Non-indexable pages score 0 (hard gate).
   * @returns {{seoScore, onPage, technical, offPage, note?}}
   */
  function scorePage(page, keyword) {
    var onPage = scoreOnPage(page, keyword);
    var technical = scoreTechnical(page);
    var offPage = scoreOffPage(page);

    if (!page.indexable) {
      return {
        seoScore: 0,
        onPage: onPage,
        technical: technical,
        offPage: offPage,
        note: "Not indexable — cannot rank",
      };
    }

    var score = 0.45 * onPage + 0.3 * technical + 0.25 * offPage;
    return {
      seoScore: Math.round(score),
      onPage: onPage,
      technical: technical,
      offPage: offPage,
    };
  }

  /**
   * Rank a list of pages for a keyword, highest SEO score first.
   * @returns {Array} each page augmented with its score breakdown + position.
   */
  function rankOrganic(pages, keyword) {
    var scored = pages.map(function (p) {
      var s = scorePage(p, keyword);
      return Object.assign({}, p, s);
    });
    scored.sort(function (a, b) {
      return b.seoScore - a.seoScore;
    });
    return scored.map(function (p, i) {
      return Object.assign({}, p, { position: i + 1 });
    });
  }

  window.Seo = {
    scoreOnPage: scoreOnPage,
    scoreTechnical: scoreTechnical,
    scoreOffPage: scoreOffPage,
    scorePage: scorePage,
    rankOrganic: rankOrganic,
    weights: { onPage: 0.45, technical: 0.3, offPage: 0.25 },
  };
})();
