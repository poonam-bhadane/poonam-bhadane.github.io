---
title: "Unified BI and Group Reporting for a Manufacturing Group"
summary: "A Prototype that takes fragmented data from three subsidiaries of a fictional manufacturing group and turns it into one uniform database with standardised reporting and an interactive dashboard."
status: prototype
order: 4
tags: ["SQL", "Data modelling", "ETL", "KPI design", "Dashboards"]
live: "/demos/bi-dashboard/"
liveLabel: "Open the dashboard"
---

## The problem

Rheinwerk Group is a fictional medium-sized manufacturing holding company with three operating subsidiaries. Each runs its own systems, so group management cannot compare performance or see the full picture. This project builds the data foundation and the reporting layer that fixes that. All data is synthetic.

## What it demonstrates

| Skill | Where you see it |
|---|---|
| SQL | A schema definition and an analytics layer of KPI views |
| Data modelling | A Kimball-style star schema with conformed dimensions |
| ETL and data integration | A script that normalises three inconsistent sources into one warehouse |
| Identity resolution | The same customer, coded differently in each subsidiary, resolved to one group ID |
| KPI system design | Standardised, reusable KPI definitions such as revenue, margin, OTIF and backlog |
| Reporting | An interactive dashboard |
| Communication | Consulting-style documents: data model, KPI dictionary and project narrative |
