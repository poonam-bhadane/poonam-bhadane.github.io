---
title: "Customer journey tracking and web analytics"
summary: "A consumer-finance demo website instrumented with Google Tag Manager and GA4 to track every touchpoint, with a custom KPI dashboard fed from the GA4 Data API."
status: live
order: 2
tags: ["GA4", "Google Tag Manager", "Web analytics", "AWS S3 + CloudFront", "Python"]
live: "https://d11wc84ifqixx5.cloudfront.net"
liveLabel: "Open live site"
---

## What it is

A live web analytics project that covers the full loop an analyst owns: instrument the touchpoints, collect clean and consented event data, report on journey KPIs, and find where to improve. The site is a fictional consumer-finance brand. The application flow is a dummy that ends in a simulated confirmation, and no personal data is collected in analytics.

There is also a custom [KPI dashboard](https://d11wc84ifqixx5.cloudfront.net/dashboard/) built from live GA4 data.

## What it demonstrates

| Capability | Where you see it |
|---|---|
| Journey tracking | Every page and form step emits a tracked GA4 event, from landing to confirmation. |
| Measurement planning | A documented tracking plan with the data layer events and their parameters. |
| Tag management | A GTM container with variables, triggers and GA4 event tags wired to the data layer. |
| Reporting | A custom KPI dashboard from the GA4 Data API, plus native GA4 funnel and path explorations. |
| Journey analysis | Funnel conversion, per-step drop-off, channel contribution and device split. |
| Hosting | A static site on S3 and CloudFront with HTTPS. |
| Data quality and privacy | Consistent event naming, a consent banner, and no personal data in tracking. |

## Skills

Google Analytics 4, Google Tag Manager, customer journey analytics, data layer and event tracking, AWS (S3, CloudFront), Python (GA4 Data API), data visualisation.
