/*
 * auction.js — the paid-search (SEA) auction engine.
 *
 * Pure functions only: inputs in, results out, no DOM, no globals mutated.
 * Implements exactly the model documented in docs/sea-auction-mechanics.md:
 *
 *   qualityScore = clamp(round(avg(expectedCtr, adRelevance, landingPageExperience)), 1, 10)
 *   adRank       = bid * qualityScore
 *   actualCpc    = min(bid, (belowAdRank / qualityScore) + 0.01)   // last place pays RESERVE_CPC
 *
 * These functions are attached to window.Auction so plain <script> tags (no
 * build step / modules) can use them in the browser.
 */
(function () {
  "use strict";

  // Tunable constants (chosen for clarity, not realism). See the docs.
  var MIN_AD_RANK_THRESHOLD = 5.0; // minimum Ad Rank required to show at all
  var RESERVE_CPC = 0.25; // floor price the last-ranked advertiser pays (€)
  var MAX_AD_SLOTS = 4; // how many paid slots render above organic
  var MIN_INCREMENT = 0.01; // one cent to edge out the competitor below

  /** Force x to stay within [lo, hi]. */
  function clamp(x, lo, hi) {
    return Math.max(lo, Math.min(hi, x));
  }

  /**
   * Quality Score (1..10) = rounded average of the three 1..10 components.
   * @param {{expectedCtr:number, adRelevance:number, landingPageExperience:number}} q
   */
  function qualityScore(q) {
    var avg = (q.expectedCtr + q.adRelevance + q.landingPageExperience) / 3;
    return clamp(Math.round(avg), 1, 10);
  }

  /** Ad Rank = bid * Quality Score. */
  function adRank(bid, qs) {
    return bid * qs;
  }

  /**
   * Does this advertiser's keyword match the query, per its match type?
   * Simplified model of broad / phrase / exact match.
   * @param {string} query     the user's search text
   * @param {string} keyword   the advertiser's keyword
   * @param {string} matchType "broad" | "phrase" | "exact"
   */
  function keywordMatches(query, keyword, matchType) {
    var q = (query || "").toLowerCase().trim();
    var k = (keyword || "").toLowerCase().trim();
    if (!q || !k) return false;

    if (matchType === "exact") {
      return q === k;
    }
    if (matchType === "phrase") {
      // the keyword phrase appears, in order, somewhere in the query
      return q.indexOf(k) !== -1;
    }
    // broad (default): every word of the keyword appears somewhere in the query
    var words = k.split(/\s+/);
    return words.every(function (w) {
      return q.indexOf(w) !== -1;
    });
  }

  /**
   * Run one auction for one query against a list of advertisers.
   *
   * @param {string} query
   * @param {Array} advertisers each: {
   *     name, keyword, matchType, bid,
   *     components: {expectedCtr, adRelevance, landingPageExperience}
   *   }
   * @returns {Array} sorted winners, each augmented with:
   *     qualityScore, adRank, position (1-based), actualCpc, shown(bool)
   */
  function runAuction(query, advertisers) {
    // 1. Keep only advertisers whose keyword matches the query.
    var eligible = advertisers.filter(function (a) {
      return keywordMatches(query, a.keyword, a.matchType);
    });

    // 2. Compute Quality Score and Ad Rank for each.
    eligible = eligible.map(function (a) {
      var qs = qualityScore(a.components);
      return Object.assign({}, a, {
        qualityScore: qs,
        adRank: adRank(a.bid, qs),
      });
    });

    // 3. Sort by Ad Rank descending.
    eligible.sort(function (x, y) {
      return y.adRank - x.adRank;
    });

    // 4. Drop anything below the reserve threshold, then cap to MAX_AD_SLOTS.
    var qualifying = eligible.filter(function (a) {
      return a.adRank >= MIN_AD_RANK_THRESHOLD;
    });
    var shown = qualifying.slice(0, MAX_AD_SLOTS);

    // 5. Actual CPC: pay just enough to beat the advertiser ranked below you.
    return shown.map(function (a, i) {
      var below = shown[i + 1];
      var cpc;
      if (below) {
        cpc = below.adRank / a.qualityScore + MIN_INCREMENT;
        cpc = Math.min(a.bid, cpc); // never charged more than your bid
      } else {
        cpc = RESERVE_CPC; // last place pays the floor
      }
      return Object.assign({}, a, {
        position: i + 1,
        actualCpc: Math.round(cpc * 100) / 100,
        shown: true,
      });
    });
  }

  window.Auction = {
    clamp: clamp,
    qualityScore: qualityScore,
    adRank: adRank,
    keywordMatches: keywordMatches,
    runAuction: runAuction,
    constants: {
      MIN_AD_RANK_THRESHOLD: MIN_AD_RANK_THRESHOLD,
      RESERVE_CPC: RESERVE_CPC,
      MAX_AD_SLOTS: MAX_AD_SLOTS,
      MIN_INCREMENT: MIN_INCREMENT,
    },
  };
})();
