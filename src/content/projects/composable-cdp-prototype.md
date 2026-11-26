---
title: "Composable CDP: architecture and audience builder"
summary: "A design prototype showing how a composable CDP turns raw customer events into marketing audiences, with an interactive audience builder that shows the generated definition, SQL and buy-versus-build plan."
status: design
order: 3
tags: ["Composable CDP", "Architecture", "Audience building", "Kafka", "Flink", "Reverse-ETL"]
live: "/composable-cdp-prototype/"
liveLabel: "Open the prototype"
repo: "composable-cdp-prototype"
---

## Why I built it

I do not have access to a production CDP to show my work, so I designed this prototype to show the same thinking: how the pieces of a composable CDP fit together, and exactly how a marketer's choices become an audience that reaches customers.

## What it is

Two pages, kept deliberately simple:

- **An architecture overview** of the layers (sources, ingestion, processing, storage, audience builder, activation), colour-coded by what to buy and what to build, with the reasoning behind each choice.
- **An interactive audience builder.** A marketer sets the evaluation mode (real-time, batch or hybrid), rules, RFM scoring, sequences, exits, suppression and destinations. Every change regenerates the audience definition (JSON), illustrative SQL and an execution plan, and validation warnings catch risky set-ups.

## Be clear about what this is

This is a **design and UI prototype**. It has no running backend, and its data is fictional. It is separate from my other CDP projects, which are built and deployed on AWS. It uses a different, composable architecture.

## What it shows about my work

- Reasoning about buy-versus-build trade-offs
- How real-time, batch and hybrid audiences differ and why each exists
- Turning a business request into a structured, validated definition
- Explaining architecture clearly to business and technical readers
