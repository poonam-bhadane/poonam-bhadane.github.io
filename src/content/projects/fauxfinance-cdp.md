---
title: "FauxFinance: an end-to-end Customer Data Platform on AWS"
summary: "A working CDP for a fictional consumer-finance brand. A storefront generates customer behaviour, a cloud pipeline unifies it into one profile per customer, and a dashboard shows the business what is happening."
status: live
order: 1
tags: ["Customer Data Platform", "AWS", "Identity resolution", "Data lake", "SQL"]
live: "https://d12tkndjyabj2o.cloudfront.net"
liveLabel: "Open live demo"
---

## What it is

A CDP collects every customer interaction, unifies it into one profile per person, and makes that profile usable for analytics and targeted engagement. FauxFinance is a complete, working version of that loop, built on AWS for a fictional consumer-finance brand. All data is synthetic, and nothing on the site is a real financial product.

## What you can do in the demo

- Browse the storefront (loans, credit cards, buy-now-pay-later), start an application and get a decision.
- Open the **CDP Dashboard** to see unified profiles, a conversion funnel, segments, abandoners and funded value over time.
- Open **About** for a plain-language explanation of how it works.

## How it works

| Step | What happens |
|---|---|
| **Collect** | A React storefront with an event tracker captures every click: views, applications, funding and drop-offs. |
| **Ingest** | Events flow through API Gateway, Kinesis and Firehose into an S3 data lake. |
| **Store** | A medallion data lake with bronze (raw), silver (cleaned) and gold (curated) layers. It is encrypted and private. |
| **Transform** | Athena SQL cleans, de-duplicates and models the raw events. |
| **Resolve identity** | Deterministic stitching links anonymous browsing to a known customer after login and re-attributes earlier activity, so one person is one profile. |
| **Profile** | Unified 360-degree profiles: sessions, product interest, applications and funded value. |
| **Analyse** | A dashboard with funnel, segments, abandoners and funded-over-time. |
| **Govern cost** | A $50 per month AWS budget with alerts. The always-on stream is torn down when idle to keep cost near zero. |

## What it shows about my work

- Designing a customer data pipeline from raw events to a usable profile
- Identity resolution across anonymous and known activity
- Practical cost control on cloud infrastructure
- Explaining a technical system in plain language for business users
