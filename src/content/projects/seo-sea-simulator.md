---
title: "SEO and SEA search simulator"
summary: "A learning project: an in-browser simulator of the Google Ads auction and organic ranking, with readable formulas for Quality Score, Ad Rank, cost per click and an SEO score."
status: prototype
order: 6
tags: ["SEO", "SEA", "Google Ads", "JavaScript"]
live: "/demos/seo-sea-simulator/"
liveLabel: "Open the simulator"
---

## Why I built it

To understand search marketing by seeing it work. Reading about Quality Score is abstract. Watching an advertiser with a lower bid win the top slot, and pay less per click, because its ad is more relevant makes the idea clear.

## What it does

- A **paid auction**: advertisers bid on keywords. The simulator computes Quality Score and Ad Rank, orders the ads, and shows what each advertiser actually pays per click.
- An **organic ranking**: pages are scored on on-page, technical and off-page factors, such as title, page speed, mobile-friendliness and backlinks. A page that cannot be indexed scores zero, however good its content.
- A **combined results page** with paid ads above organic results, plus editable inputs so you can change a bid or a page-speed value and watch the ranking move.

The formulas are simplified, transparent models of how search marketing works. They are not Google's real algorithms.

## What it includes

Four short documents explain the concepts and formulas (SEO and SEA fundamentals, auction mechanics, ranking mechanics, architecture), and the simulator itself is plain HTML and JavaScript with a test page.
