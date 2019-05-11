# sasm2

This is a proof of concept of how to do World of Warcraft combat Simulation
inside the browser using the esteemed [Simulationcraft engine](https://github.com/simulationcraft/simc) (simc).

It is implemented as react application that delegates the heavy lifting to a
WebAssembly (wasm) version of simc ported with emscripten. Please note that I only partially upstreamed the wasm support and therefore the usage of my [simc fork](https://github.com/athei/simc) is required for now.

My first attempt of this POC was with a [frontend written in Rust](https://github.com/athei/sasm) in order to have the full web assembly experience (Rust compiling to wasm using webstd). It turned out that the Rust web frontend ecosystem was not ready yet.

# Motivation
Today most players rely on centralized services [[1]](https://www.raidbots.com) [[2]](https://www.askmrrobot.com) that run simc or another simulation software on their backends to answer questions about gearing decisions and such. Being a calculation intensive task this approach introduces significant server costs and therefore impedes scalibility.

On the other hand having your users download and install client software impedes adoption. Having the engine run in-browser offers the best of both worlds.

 # Further Ideas

Offer incentives to do calculations for other users. Maybe using a curerency on
a blockchain to have users pay each other for calculations instead of having
a middleman that has to deploy a large amount of servers (users already pay for
the mentioned services). Most users have powerful computers (they play video games) that are idle most of the time (at least some cores are).



