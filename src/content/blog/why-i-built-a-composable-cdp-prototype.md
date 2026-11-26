---
title: "How does a Marketer's idea become an Audience? I built a Prototype to find out"
description: "I don't have a production CDP to show my work, so I built a Prototype of the part most platforms hide: how someone describes an Audience, and how the system turns that into running jobs."
pubDate: 2026-09-22
tags: ["Composable CDP", "Audience building", "Architecture", "Buy vs build"]
draft: false
---

A marketer sits down and types a request into a tool. *Customers who looked at premium dog food in the last 30 days, who are platinum members, and who haven't bought anything since.* It takes about ten seconds to say.

Behind that sentence there is a lot of machinery. Somebody has to decide where the click data lives, how fresh it needs to be, what "haven't bought since" means when a customer buys from the app and the website, and how to remove people from the list the moment they do buy. Most of that is invisible to the person who asked.

That invisible part is what I wanted to understand properly. So I built a small version of it.

## Why a prototype

I work with customer data, and I don't have access to a production CDP that I can show you. I can't screenshot something I built at a company and put it on a website. What I can do is build something from scratch, make the decisions myself, and explain each one.

So that's what this is. A design prototype of a composable CDP, with an interactive audience builder you can click through. [Here it is](/composable-cdp-prototype/) if you want to look before you read the rest.

One thing I want to say plainly, because it matters: nothing in it actually runs. There is no Kafka cluster, no Flink job, no Redis. The data is made up. The builder produces the definition of an audience, the SQL it would generate, and a plan of which tool would do which job. It never calculates a single audience. I think that limit is honest, and I'd rather state it than let anyone assume more.

## What "composable" means to me

A traditional CDP is one product that does everything, and your customer data lives inside it. A composable setup takes the opposite approach. The data stays in your own warehouse or lakehouse, and you pick separate tools for separate jobs: one for collecting events, one for processing them, one for sending audiences to ad platforms and email tools.

The appeal is control. The cost is that you now have to decide, for every piece, whether to buy it or build it. That decision turned out to be the most interesting part of the whole project, and I'll come back to it.

## The screen doesn't do the work

The first design choice was the one that shaped everything else. The audience builder is only an authoring tool. When a marketer finishes, it outputs a structured definition (a JSON spec). A separate compiler would read that spec and create the actual jobs.

I like this because it keeps two groups of people from needing to understand each other's work. The marketer shouldn't have to know what a stream processor is. The engineer shouldn't have to re-read a request written in an email. They both look at the same definition, and it's precise enough that a validator can check it before anything is built.

## Question one: how fresh does it need to be?

The first thing the builder asks is the evaluation mode: real-time, batch, or hybrid. I think this is the question people skip, and it drives cost and complexity more than anything else.

Take two of the scenarios I built in.

A **cart abandoner** audience has to react within minutes. If someone adds a bag of dog food to their cart and wanders off, the reminder is only useful while they still remember what they were doing. That needs a stream processor that looks at each event as it arrives.

A **high-value customers at risk of leaving** audience is the opposite. Lifetime value and a churn score change slowly. Calculating it every night on the warehouse is fine, it's cheaper, and it's much simpler to run. Nobody is harmed if someone joins the list eight hours late.

The mistake I'd expect most teams to make is choosing real-time for everything because it sounds better. Real-time means keeping state in memory for every customer, and that costs money and attention. I'd use batch wherever I can get away with it, and only pay for real-time where waiting actually hurts.

## Sequences are where it gets hard

Some audiences depend on the order things happened. *Viewed a product, then added it to the cart within 30 minutes, and did not check out.*

A query that runs on a schedule can approximate this, but it's clumsy. Doing it properly means something that remembers, for every customer, "this person has done step one and is partway through step two." That is what a stream processor with pattern matching is for, and it's the main reason I marked sequences as something to build rather than buy.

The part that surprised me is the last step. *Did not check out.* You can't know someone didn't do something until the time window has closed. So a customer in that audience appears 30 minutes after their last action, not at the moment they abandoned.

That delay is intentional, and it's easy to misread as a bug. A marketer who expects the audience to fill instantly will think the tool is broken. I added a note in the builder to say so, because I'd rather explain it up front than have someone discover it later.

## Leaving matters as much as joining

Most people building audiences think about who gets in. I spent just as much time on who gets out.

Picture a customer who gets a "you left something in your cart" message, then buys. If they keep receiving it for two more days, that's about the worst thing the system can do. It looks careless and it teaches people to ignore you.

Tools that sync on a schedule are slow at removing people, because they only notice a change the next time they run. That's why I treated exit rules as something that needs to be evaluated per event, the same as entry. I also added a cool-down period, so someone can't drift in and out of an audience repeatedly and trigger a message each time.

## The warnings I'm most pleased with

On the right of the builder there's a validation panel. It looks at the definition and says what's likely to go wrong. A few of the rules:

- A sequence set to batch mode gets a warning, because sequences need real-time evaluation.
- A very long lookback in real-time mode, say two years, gets a warning, because holding that much history in memory is expensive. The fix is to read the older history from the warehouse.
- An audience with no exit rule gets a warning, because people will stay in it forever.
- An audience with no destination gets a warning, because nobody will receive anything.
- Switching off the marketing-consent requirement gets a warning, because that's a privacy decision somebody should make deliberately.

None of these are clever. They're the sort of mistake you'd catch in a code review, and I like that a tool can catch them before a marketer ever launches the thing.

## Buying versus building

I started out thinking of "buy or build" as one decision about the whole platform. It isn't. It's a separate decision for each capability, and the answers differ.

Connectors to ad platforms and messaging tools are tedious to maintain. APIs change, rate limits differ, credentials expire. I'd buy that. Scheduled audiences from the warehouse are well covered by existing tools, so I'd buy that too.

Logic that has to react in seconds, or that depends on the order of events, is where custom work earns its place. So real-time evaluation, sequences and exits are the pieces I'd build.

Some things are a mix, like suppression lists and purchase scoring based on recency, frequency and spend. There, I'd buy the plumbing and build the rules.

The architecture page in the prototype colour-codes every layer this way, so you can see the reasoning in one view.

## What this doesn't cover

A real build would need a lot more than I made. Identity resolution, the work of deciding which records belong to the same person, comes first. I did work through that separately in my [FauxFinance project](https://d12tkndjyabj2o.cloudfront.net/cdp/), so I know how much depends on it. Beyond that: roles and approvals, a history of who changed what, a safe way to edit an audience that's already live, connector setup, a proper consent interface, and cost monitoring for the streaming jobs.

I listed these on the architecture page too. I'd rather show what I didn't build than let a tidy interface suggest it's finished.

## Try it

If you open the [audience builder](/composable-cdp-prototype/), it has three ready-made scenarios. Load the cart abandoner one, switch the evaluation mode to batch, and watch what the validator says. Then turn on the functionality overlay, which labels each control and explains what the marketer is doing and what the system would do underneath.

If you'd have made different choices, or I got something wrong, I'd like to hear it. You can find me on the [contact section](/#contact) of the home page.
