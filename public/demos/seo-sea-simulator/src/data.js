/*
 * data.js — seed data for the fictional pet-food store simulator.
 *
 * All synthetic. These mirror the worked examples in the docs so the app's
 * output matches what you read there. Attached to window.SeedData.
 *
 * You can freely edit these values (or edit them live in the UI) and re-run a
 * search to watch rankings and prices change.
 */
(function () {
  "use strict";

  // -- Paid advertisers (SEA) -------------------------------------------------
  // components are the three 1..10 Quality Score inputs:
  //   expectedCtr, adRelevance, landingPageExperience
  var advertisers = [
    {
      name: "PawsPantry",
      keyword: "grain free dog food",
      matchType: "phrase",
      bid: 2.0,
      components: { expectedCtr: 9, adRelevance: 9, landingPageExperience: 9 },
    },
    {
      name: "MegaMart Pets",
      keyword: "dog food",
      matchType: "broad",
      bid: 3.0,
      components: { expectedCtr: 5, adRelevance: 5, landingPageExperience: 5 },
    },
    {
      name: "BudgetBarks",
      keyword: "grain free dog food",
      matchType: "broad",
      bid: 2.5,
      components: { expectedCtr: 6, adRelevance: 6, landingPageExperience: 6 },
    },
    {
      name: "HappyTails Direct",
      keyword: "cheap dog food",
      matchType: "phrase",
      bid: 1.2,
      components: { expectedCtr: 4, adRelevance: 4, landingPageExperience: 5 },
    },
  ];

  // -- Organic pages (SEO) ----------------------------------------------------
  var organicPages = [
    {
      name: "PawsPantry — Grain-Free Dog Food",
      url: "pawspantry.example/grain-free-dog-food",
      urlSlug: "grain-free-dog-food",
      title: "Grain Free Dog Food | PawsPantry",
      h1: "Grain Free Dog Food for Sensitive Pups",
      bodyText:
        "Our grain free dog food is vet-formulated with real meat and no filler grains...",
      metaDescription:
        "Shop premium grain free dog food. Real meat, no grains, free delivery.",
      wordCount: 800,
      hasImageAlt: true,
      lcpSeconds: 2.1,
      mobileFriendly: true,
      https: true,
      structuredData: true,
      indexable: true,
      backlinks: 30,
      avgLinkingDomainAuthority: 60,
      brandMentions: true,
    },
    {
      name: "PetBlogger — Best Grain Free Foods (blog)",
      url: "petblogger.example/best-grain-free",
      urlSlug: "best-grain-free",
      title: "The Best Grain Free Dog Food Brands Reviewed",
      h1: "We Tried 12 Foods This Year",
      bodyText:
        "There are many grain free dog food options on the market this year...",
      metaDescription: "A hands-on review of grain free options.",
      wordCount: 300,
      hasImageAlt: false,
      lcpSeconds: 4.5,
      mobileFriendly: true,
      https: true,
      structuredData: false,
      indexable: true,
      backlinks: 5,
      avgLinkingDomainAuthority: 30,
      brandMentions: false,
    },
    {
      name: "MegaMart Pets — Dog Food Category",
      url: "megamart.example/pets/dog-food",
      urlSlug: "dog-food",
      title: "Dog Food & Supplies | MegaMart Pets",
      h1: "Dog Food",
      bodyText:
        "Browse dog food, treats and supplies. Some grain free dog food available.",
      metaDescription: "Everything for your dog at MegaMart.",
      wordCount: 500,
      hasImageAlt: true,
      lcpSeconds: 3.2,
      mobileFriendly: true,
      https: true,
      structuredData: true,
      indexable: true,
      backlinks: 40,
      avgLinkingDomainAuthority: 45,
      brandMentions: true,
    },
    {
      name: "OldShop — Grain Free (blocked from indexing)",
      url: "oldshop.example/grain-free",
      urlSlug: "grain-free-dog-food",
      title: "Grain Free Dog Food | OldShop",
      h1: "Grain Free Dog Food",
      bodyText:
        "Great grain free dog food selection with everything you could want.",
      metaDescription: "Grain free dog food deals.",
      wordCount: 700,
      hasImageAlt: true,
      lcpSeconds: 2.0,
      mobileFriendly: true,
      https: true,
      structuredData: true,
      indexable: false, // <-- hard gate: this page cannot rank despite good content
      backlinks: 25,
      avgLinkingDomainAuthority: 55,
      brandMentions: true,
    },
  ];

  window.SeedData = {
    defaultQuery: "grain free dog food",
    advertisers: advertisers,
    organicPages: organicPages,
  };
})();
