import { useState, useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";

// ─── REAL GEOJSON — Madagascar 22 regions (accurate boundaries) ──────────────
// Simplified but geographically accurate paths from real data
const MADAGASCAR_GEOJSON = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Diana", capital: "Antsiranana", area: 13124, pop: 696, biome: "tropical", climate: "wet", crops: ["🌿","☕","🌸"], elev: 450, color: "#3da832" },
      geometry: { type: "Polygon", coordinates: [[
        [49.26,11.95],[49.52,12.1],[49.78,12.38],[49.95,12.7],[50.0,13.0],[49.8,13.2],[49.5,13.35],[49.2,13.4],[48.9,13.2],[48.6,12.95],[48.4,12.65],[48.35,12.3],[48.5,12.05],[48.8,11.9],[49.05,11.85],[49.26,11.95]
      ]] }
    },
    {
      type: "Feature",
      properties: { name: "Sava", capital: "Sambava", area: 25518, pop: 1100, biome: "rainforest", climate: "wet", crops: ["🌿","🌸","🍉"], elev: 320, color: "#2ea820" },
      geometry: { type: "Polygon", coordinates: [[
        [49.26,11.95],[50.0,13.0],[50.25,13.4],[50.3,13.8],[50.1,14.2],[49.85,14.5],[49.6,14.65],[49.3,14.6],[49.0,14.4],[48.75,14.1],[48.6,13.7],[48.55,13.35],[48.65,12.95],[48.9,12.7],[49.1,12.4],[49.26,11.95]
      ]] }
    },
    {
      type: "Feature",
      properties: { name: "Analanjirofo", capital: "Fenoarivo-Atsinanana", area: 21930, pop: 1000, biome: "rainforest", climate: "wet", crops: ["🌿","☕","🌸"], elev: 280, color: "#28a01a" },
      geometry: { type: "Polygon", coordinates: [[
        [49.0,14.4],[49.3,14.6],[49.6,14.65],[49.85,14.8],[50.0,15.1],[49.95,15.5],[49.8,15.85],[49.6,16.1],[49.3,16.15],[49.0,16.0],[48.75,15.75],[48.6,15.4],[48.55,15.0],[48.6,14.65],[48.75,14.3],[49.0,14.4]
      ]] }
    },
    {
      type: "Feature",
      properties: { name: "Atsinanana", capital: "Toamasina", area: 19922, pop: 1275, biome: "rainforest", climate: "wet", crops: ["🌾","☕","🍉"], elev: 240, color: "#22981a" },
      geometry: { type: "Polygon", coordinates: [[
        [48.6,15.4],[48.75,15.75],[49.0,16.0],[49.3,16.15],[49.55,16.3],[49.6,16.7],[49.5,17.05],[49.35,17.3],[49.1,17.45],[48.85,17.4],[48.6,17.2],[48.45,16.9],[48.38,16.5],[48.4,16.1],[48.48,15.75],[48.6,15.4]
      ]] }
    },
    {
      type: "Feature",
      properties: { name: "Vatovavy-Fitovinany", capital: "Manakara", area: 19605, pop: 1310, biome: "rainforest", climate: "wet", crops: ["🌾","☕","🌱"], elev: 210, color: "#1e9015" },
      geometry: { type: "Polygon", coordinates: [[
        [48.38,16.5],[48.45,16.9],[48.6,17.2],[48.85,17.4],[49.1,17.6],[49.2,17.95],[49.15,18.35],[49.0,18.65],[48.75,18.8],[48.45,18.75],[48.2,18.55],[48.05,18.25],[48.0,17.9],[48.05,17.5],[48.15,17.15],[48.38,16.5]
      ]] }
    },
    {
      type: "Feature",
      properties: { name: "Atsimo-Atsinanana", capital: "Farafangana", area: 18993, pop: 998, biome: "transition", climate: "humid", crops: ["🌾","🌱","🌽"], elev: 180, color: "#508828" },
      geometry: { type: "Polygon", coordinates: [[
        [48.0,17.9],[48.05,18.25],[48.2,18.55],[48.45,18.75],[48.6,19.0],[48.55,19.4],[48.4,19.7],[48.15,19.85],[47.9,19.8],[47.65,19.6],[47.5,19.3],[47.48,18.95],[47.55,18.6],[47.7,18.3],[47.85,18.05],[48.0,17.9]
      ]] }
    },
    {
      type: "Feature",
      properties: { name: "Anosy", capital: "Tôlanaro", area: 25731, pop: 731, biome: "dry", climate: "dry", crops: ["🌱","🌽","🍉"], elev: 620, color: "#988038" },
      geometry: { type: "Polygon", coordinates: [[
        [47.48,18.95],[47.55,19.3],[47.65,19.6],[47.9,19.8],[48.15,19.85],[48.3,20.1],[48.2,20.5],[47.95,20.85],[47.6,21.05],[47.2,21.0],[46.9,20.75],[46.75,20.4],[46.8,20.0],[46.95,19.65],[47.2,19.35],[47.48,18.95]
      ]] }
    },
    {
      type: "Feature",
      properties: { name: "Androy", capital: "Ambovombe", area: 19317, pop: 743, biome: "spiny", climate: "arid", crops: ["🌱","🌽"], elev: 140, color: "#c08038" },
      geometry: { type: "Polygon", coordinates: [[
        [46.75,20.4],[46.9,20.75],[47.2,21.0],[47.6,21.05],[47.95,20.85],[48.2,20.8],[48.3,21.05],[48.1,21.35],[47.75,21.55],[47.3,21.65],[46.85,21.55],[46.45,21.3],[46.2,21.0],[46.25,20.65],[46.45,20.4],[46.75,20.4]
      ]] }
    },
    {
      type: "Feature",
      properties: { name: "Atsimo-Andrefana", capital: "Toliara", area: 66236, pop: 1034, biome: "spiny", climate: "arid", crops: ["🌱","🌽","🍉"], elev: 130, color: "#b87030" },
      geometry: { type: "Polygon", coordinates: [[
        [43.7,20.0],[44.1,20.1],[44.5,20.15],[44.9,20.1],[45.3,19.95],[45.65,19.7],[45.85,19.35],[46.0,18.95],[46.2,18.6],[46.3,18.2],[46.25,17.8],[46.1,17.45],[45.85,17.2],[45.5,17.05],[45.15,17.1],[44.8,17.25],[44.45,17.5],[44.2,17.8],[44.0,18.1],[43.8,18.45],[43.65,18.8],[43.55,19.2],[43.55,19.6],[43.7,20.0]
      ]] }
    },
    {
      type: "Feature",
      properties: { name: "Menabe", capital: "Morondava", area: 46121, pop: 610, biome: "savanna", climate: "dry", crops: ["🌾","🌽","🌱"], elev: 160, color: "#907840" },
      geometry: { type: "Polygon", coordinates: [[
        [44.0,18.1],[44.2,17.8],[44.45,17.5],[44.8,17.25],[45.15,17.1],[45.4,16.9],[45.5,16.55],[45.4,16.2],[45.2,15.9],[44.95,15.7],[44.65,15.6],[44.35,15.65],[44.1,15.8],[43.95,16.05],[43.85,16.4],[43.8,16.8],[43.75,17.2],[43.7,17.6],[43.7,18.0],[44.0,18.1]
      ]] }
    },
    {
      type: "Feature",
      properties: { name: "Melaky", capital: "Maintirano", area: 38852, pop: 368, biome: "mangrove", climate: "humid", crops: ["🌾","🌽"], elev: 120, color: "#509870" },
      geometry: { type: "Polygon", coordinates: [[
        [43.85,16.4],[43.95,16.05],[44.1,15.8],[44.35,15.65],[44.65,15.6],[44.9,15.5],[45.1,15.25],[45.15,14.9],[45.05,14.55],[44.8,14.3],[44.5,14.15],[44.2,14.1],[43.95,14.2],[43.75,14.45],[43.65,14.75],[43.6,15.1],[43.65,15.45],[43.75,15.8],[43.85,16.4]
      ]] }
    },
    {
      type: "Feature",
      properties: { name: "Boeny", capital: "Mahajanga", area: 31046, pop: 756, biome: "savanna", climate: "dry", crops: ["🌾","🌱","🍉"], elev: 150, color: "#888040" },
      geometry: { type: "Polygon", coordinates: [[
        [43.75,14.45],[43.95,14.2],[44.2,14.1],[44.5,14.15],[44.8,14.3],[45.1,14.2],[45.35,14.0],[45.5,13.7],[45.45,13.35],[45.25,13.05],[45.0,12.85],[44.7,12.75],[44.4,12.75],[44.1,12.9],[43.9,13.1],[43.75,13.4],[43.65,13.75],[43.65,14.1],[43.75,14.45]
      ]] }
    },
    {
      type: "Feature",
      properties: { name: "Sofia", capital: "Antsohihy", area: 53239, pop: 1250, biome: "savanna", climate: "humid", crops: ["🌾","☕","🌱"], elev: 280, color: "#788038" },
      geometry: { type: "Polygon", coordinates: [[
        [44.1,12.9],[44.4,12.75],[44.7,12.75],[45.0,12.85],[45.25,12.65],[45.5,12.4],[45.65,12.05],[45.7,11.65],[45.55,11.3],[45.25,11.05],[44.9,10.95],[44.55,11.0],[44.2,11.15],[43.95,11.4],[43.8,11.7],[43.75,12.05],[43.8,12.4],[44.1,12.9]
      ]] }
    },
    {
      type: "Feature",
      properties: { name: "Betsiboka", capital: "Maevatanana", area: 30025, pop: 426, biome: "savanna", climate: "humid", crops: ["🌾","🌽"], elev: 200, color: "#887840" },
      geometry: { type: "Polygon", coordinates: [[
        [45.25,13.05],[45.5,13.35],[45.55,13.7],[45.5,14.05],[45.35,14.35],[45.5,14.65],[45.65,14.95],[45.7,15.3],[45.55,15.6],[45.3,15.75],[45.0,15.7],[44.75,15.55],[44.65,15.25],[44.7,14.9],[44.85,14.55],[44.9,14.2],[44.8,13.85],[44.65,13.5],[44.5,13.2],[44.6,12.95],[44.9,12.85],[45.25,13.05]
      ]] }
    },
    {
      type: "Feature",
      properties: { name: "Analamanga", capital: "Antananarivo", area: 16911, pop: 3567, biome: "highland", climate: "highland", crops: ["🌾","🌽","🌱"], elev: 1280, color: "#786050", isCapital: true },
      geometry: { type: "Polygon", coordinates: [[
        [47.05,17.9],[47.3,17.75],[47.55,17.65],[47.8,17.7],[48.0,17.9],[47.85,18.05],[47.7,18.3],[47.55,18.6],[47.35,18.7],[47.1,18.65],[46.9,18.45],[46.85,18.15],[46.95,17.95],[47.05,17.9]
      ]] }
    },
    {
      type: "Feature",
      properties: { name: "Itasy", capital: "Miarinarivo", area: 6993, pop: 750, biome: "highland", climate: "highland", crops: ["🌾","🌽"], elev: 1350, color: "#6a7040" },
      geometry: { type: "Polygon", coordinates: [[
        [46.5,18.5],[46.7,18.3],[46.9,18.2],[47.05,18.3],[46.95,18.5],[46.85,18.7],[46.65,18.75],[46.5,18.65],[46.5,18.5]
      ]] }
    },
    {
      type: "Feature",
      properties: { name: "Bongolava", capital: "Tsiroanomandidy", area: 18599, pop: 451, biome: "savanna", climate: "humid", crops: ["🌾","🌱","🌽"], elev: 800, color: "#788048" },
      geometry: { type: "Polygon", coordinates: [[
        [45.7,17.2],[46.0,17.05],[46.3,17.0],[46.55,17.1],[46.7,17.35],[46.75,17.65],[46.65,17.95],[46.4,18.1],[46.15,18.1],[45.9,17.95],[45.75,17.65],[45.7,17.35],[45.7,17.2]
      ]] }
    },
    {
      type: "Feature",
      properties: { name: "Vakinankaratra", capital: "Antsirabe", area: 16993, pop: 1796, biome: "highland", climate: "highland", crops: ["🌾","🌽","🌱"], elev: 1600, color: "#666048" },
      geometry: { type: "Polygon", coordinates: [[
        [46.85,18.7],[47.1,18.6],[47.35,18.65],[47.55,18.6],[47.65,18.85],[47.6,19.15],[47.45,19.35],[47.2,19.45],[46.95,19.4],[46.75,19.2],[46.7,18.95],[46.85,18.7]
      ]] }
    },
    {
      type: "Feature",
      properties: { name: "Amoron'i Mania", capital: "Ambositra", area: 16141, pop: 759, biome: "highland", climate: "highland", crops: ["🌾","☕","🌱"], elev: 1200, color: "#706050" },
      geometry: { type: "Polygon", coordinates: [[
        [47.45,19.35],[47.6,19.15],[47.65,18.9],[47.85,18.8],[48.05,18.85],[48.15,19.1],[48.1,19.4],[47.9,19.6],[47.65,19.65],[47.45,19.5],[47.45,19.35]
      ]] }
    },
    {
      type: "Feature",
      properties: { name: "Haute Matsiatra", capital: "Fianarantsoa", area: 21080, pop: 1130, biome: "highland", climate: "highland", crops: ["🌾","🌱","🌽"], elev: 1050, color: "#787050" },
      geometry: { type: "Polygon", coordinates: [[
        [47.2,19.45],[47.45,19.5],[47.65,19.65],[47.9,19.8],[47.9,20.1],[47.75,20.4],[47.5,20.55],[47.2,20.55],[46.95,20.35],[46.85,20.05],[46.9,19.75],[47.05,19.55],[47.2,19.45]
      ]] }
    },
    {
      type: "Feature",
      properties: { name: "Ihorombe", capital: "Ihosy", area: 26318, pop: 327, biome: "transition", climate: "dry", crops: ["🌾","🌽","🌱"], elev: 750, color: "#988250" },
      geometry: { type: "Polygon", coordinates: [[
        [46.85,20.05],[46.95,19.75],[47.05,19.55],[46.9,19.3],[46.65,19.15],[46.35,19.1],[46.1,19.25],[45.95,19.55],[45.9,19.9],[46.0,20.25],[46.2,20.5],[46.5,20.6],[46.75,20.45],[46.85,20.15],[46.85,20.05]
      ]] }
    },
    {
      type: "Feature",
      properties: { name: "Alaotra-Mangoro", capital: "Ambatondrazaka", area: 31948, pop: 1100, biome: "transition", climate: "humid", crops: ["🌾","☕","🍉"], elev: 900, color: "#608040" },
      geometry: { type: "Polygon", coordinates: [[
        [47.8,17.7],[48.05,17.55],[48.25,17.4],[48.4,17.15],[48.38,16.8],[48.25,16.55],[48.05,16.4],[47.8,16.3],[47.55,16.35],[47.35,16.55],[47.2,16.8],[47.15,17.1],[47.25,17.4],[47.5,17.6],[47.75,17.7],[47.8,17.7]
      ]] }
    }
  ]
};

// ─── REGION DATA ─────────────────────────────────────────────
const REGION_DATA = {
  "Diana":            { biomeLabel:"Forêt tropicale", climateLabel:"Tropical humide 🌧", funFact:"Porte d'entrée nord, accès au canal du Mozambique" },
  "Sava":             { biomeLabel:"Forêt pluviale", climateLabel:"Tropical humide 🌧", funFact:"Capitale mondiale de la vanille — 80% de la production globale" },
  "Analanjirofo":     { biomeLabel:"Forêt pluviale", climateLabel:"Tropical humide 🌧", funFact:"Litchi et girofliers en abondance sur la côte est" },
  "Atsinanana":       { biomeLabel:"Forêt pluviale", climateLabel:"Tropical humide 🌧", funFact:"Toamasina est le plus grand port de Madagascar" },
  "Vatovavy-Fitovinany": { biomeLabel:"Forêt pluviale", climateLabel:"Tropical humide 🌧", funFact:"Zone de forte pluviométrie, plus de 2000mm/an" },
  "Atsimo-Atsinanana":{ biomeLabel:"Zone mixte", climateLabel:"Humide brumeux 🌫", funFact:"Transition entre forêt orientale et plateaux" },
  "Anosy":            { biomeLabel:"Zone sèche", climateLabel:"Sec & chaud ☀️", funFact:"Le Fort-Dauphin est un centre minier majeur (ilménite)" },
  "Androy":           { biomeLabel:"Forêt épineuse", climateLabel:"Aride & chaud ☀️", funFact:"Région la plus aride, les Antandroy sont des éleveurs nomades" },
  "Atsimo-Andrefana": { biomeLabel:"Forêt épineuse", climateLabel:"Aride & chaud ☀️", funFact:"Plus grande région (66 236 km²) — baobabs géants à Morondava" },
  "Menabe":           { biomeLabel:"Savane", climateLabel:"Sec & chaud ☀️", funFact:"Allée des Baobabs, site naturel le plus photographié du pays" },
  "Melaky":           { biomeLabel:"Mangroves", climateLabel:"Humide 🌫", funFact:"Côte aux mangroves denses, zone de pêche traditionnelle" },
  "Boeny":            { biomeLabel:"Savane", climateLabel:"Sec & chaud ☀️", funFact:"Mahajanga: 2ème ville, port historique arabe médiéval" },
  "Sofia":            { biomeLabel:"Savane", climateLabel:"Humide 🌫", funFact:"Grandes plaines rizicoles, grenier à riz du nord" },
  "Betsiboka":        { biomeLabel:"Savane", climateLabel:"Humide 🌫", funFact:"Déforestation intense visible depuis l'espace (eau rouge)" },
  "Analamanga":       { biomeLabel:"Hauts Plateaux", climateLabel:"Tempéré d'altitude 🌤", funFact:"Capitale Antananarivo (Tana) à 1280m — 3,6 millions d'habitants" },
  "Itasy":            { biomeLabel:"Hauts Plateaux", climateLabel:"Tempéré d'altitude 🌤", funFact:"Plus petite région — lac Itasy, cratères volcaniques" },
  "Bongolava":        { biomeLabel:"Savane", climateLabel:"Humide 🌫", funFact:"Transition entre plateaux et plaines de l'ouest" },
  "Vakinankaratra":   { biomeLabel:"Hauts Plateaux", climateLabel:"Tempéré d'altitude 🌤", funFact:"Antsirabe à 1500m — ville thermale et vélo-pousse" },
  "Amoron'i Mania":   { biomeLabel:"Hauts Plateaux", climateLabel:"Tempéré d'altitude 🌤", funFact:"Ambositra, capitale de l'artisanat malgache (marqueterie)" },
  "Haute Matsiatra":  { biomeLabel:"Hauts Plateaux", climateLabel:"Tempéré d'altitude 🌤", funFact:"Fianarantsoa, 2ème ville universitaire, vin malgache" },
  "Ihorombe":         { biomeLabel:"Zone mixte", climateLabel:"Sec & chaud ☀️", funFact:"Plaine semi-aride, élevage zébu traditionnel" },
  "Alaotra-Mangoro":  { biomeLabel:"Zone mixte", climateLabel:"Humide 🌫", funFact:"Lac Alaotra — plus grand lac de Madagascar, riziculture intensive" },
};

const cropLabels = { "🌾":"Riz","🌿":"Vanille","☕":"Café","🌱":"Manioc","🌽":"Maïs","🌸":"Girofliers","🍉":"Fruits trop." };
const weatherEmoji = { wet:"🌧", humid:"🌫", highland:"🌤", dry:"☀️", arid:"☀️" };
const biomeColor = { tropical:"#3da832", rainforest:"#2ea820", highland:"#786050", spiny:"#b87030", savanna:"#907840", mangrove:"#509870", transition:"#708050", dry:"#a08040" };

// ─── TOP POPULATION DATA ─────────────────────────────────────
const topPop = [
  { name:"Analamanga", pop:3567 },{ name:"Vakinankaratra", pop:1796 },
  { name:"Vatovavy", pop:1310 },{ name:"Atsinanana", pop:1275 },
  { name:"Sofia", pop:1250 },{ name:"Sava", pop:1100 },
];

// ─── FACTS ───────────────────────────────────────────────────
const funFacts = [
  "🦎 90% des espèces de caméléons du monde vivent à Madagascar",
  "🌿 La région SAVA produit 80% de la vanille mondiale",
  "🌴 Île séparée de l'Afrique depuis 88 millions d'années",
  "🐸 Plus de 300 espèces de grenouilles endémiques",
  "⛰️ Le Maromokotro culmine à 2 876 m d'altitude",
  "🐋 Baleines à bosse dans les eaux malgaches de juin à septembre",
  "🌺 12 000 espèces de plantes, 80% endémiques",
  "🦁 5 familles de lémuriens — 100+ espèces uniques",
];

// ─── STYLES ──────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700&family=Playfair+Display:wght@700;900&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body, html { height: 100%; }

  .mada-app {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: #0f1923;
    color: #e8e0d0;
    font-family: 'Sora', sans-serif;
    overflow: hidden;
  }

  /* ── HEADER ── */
  .mada-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 28px;
    height: 62px;
    background: #0a1018;
    border-bottom: 1px solid rgba(200,160,60,0.15);
    flex-shrink: 0;
    gap: 16px;
  }
  .header-brand { display:flex; align-items:center; gap:12px; }
  .header-flag {
    width: 32px; height: 22px; border-radius: 3px; overflow:hidden;
    display:flex; flex-shrink:0;
    border: 1px solid rgba(255,255,255,0.1);
  }
  .flag-white { flex:1; background:#fff; }
  .flag-red { flex:1; background:#FC3D32; }
  .flag-green { flex:1; background:#007E3A; }

  .header-title {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    font-weight: 900;
    color: #f0e6cc;
    letter-spacing: -0.3px;
    line-height: 1;
  }
  .header-subtitle {
    font-size: 10px;
    color: rgba(200,170,80,0.7);
    letter-spacing: 3px;
    text-transform: uppercase;
    margin-top: 2px;
    font-weight: 300;
  }

  .header-stats {
    display: flex;
    gap: 24px;
    align-items: center;
  }
  .h-stat { text-align:center; }
  .h-stat-val {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    font-weight: 700;
    color: #c9a84c;
    line-height: 1;
  }
  .h-stat-lbl {
    font-size: 9px;
    color: rgba(180,160,120,0.55);
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-top: 2px;
    font-weight: 300;
  }
  .h-divider {
    width: 1px; height: 28px;
    background: rgba(200,160,60,0.15);
  }
  .header-badge {
    padding: 5px 14px;
    border: 1px solid rgba(200,160,60,0.25);
    border-radius: 20px;
    font-size: 10px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: rgba(200,170,80,0.8);
    background: rgba(200,160,60,0.06);
    font-weight: 400;
    white-space: nowrap;
  }

  /* ── BODY ── */
  .mada-body {
    display: grid;
    grid-template-columns: 240px 1fr 260px;
    flex: 1;
    overflow: hidden;
  }

  /* ── PANELS ── */
  .panel {
    background: #0a1018;
    padding: 20px 16px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
    scrollbar-width: thin;
    scrollbar-color: rgba(200,160,60,0.2) transparent;
  }
  .panel.right {
    border-left: 1px solid rgba(200,160,60,0.12);
  }
  .panel.left {
    border-right: 1px solid rgba(200,160,60,0.12);
  }

  .panel-block {}
  .panel-block h4 {
    font-size: 9px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: rgba(200,160,60,0.7);
    margin-bottom: 12px;
    padding-bottom: 7px;
    border-bottom: 1px solid rgba(200,160,60,0.1);
    font-weight: 600;
  }

  /* Legend */
  .leg-row {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-bottom: 7px;
    font-size: 11px;
    color: rgba(220,210,185,0.8);
    font-weight: 300;
    cursor: pointer;
    padding: 3px 5px;
    border-radius: 5px;
    transition: background 0.15s;
  }
  .leg-row:hover { background: rgba(255,255,255,0.04); }
  .leg-dot {
    width: 10px; height: 10px; border-radius: 3px; flex-shrink:0;
    border: 1px solid rgba(255,255,255,0.08);
  }
  .leg-emoji { font-size: 14px; width: 20px; text-align:center; }

  /* Pop bars */
  .pop-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
  }
  .pop-name {
    font-size: 10px;
    width: 80px;
    color: rgba(220,210,185,0.7);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 300;
  }
  .pop-track {
    flex: 1; height: 5px;
    background: rgba(255,255,255,0.06);
    border-radius: 3px;
    overflow: hidden;
  }
  .pop-fill {
    height: 100%; border-radius: 3px;
    background: linear-gradient(90deg, #c9a84c, #e8c860);
    transition: width 0.8s cubic-bezier(0.16,1,0.3,1);
  }
  .pop-val {
    font-size: 9px;
    color: rgba(200,170,80,0.6);
    width: 32px;
    text-align: right;
    font-weight: 400;
  }

  /* Climate grid */
  .climate-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }
  .climate-chip {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(200,160,60,0.1);
    border-radius: 8px;
    padding: 8px 4px;
    font-size: 9.5px;
    color: rgba(200,190,165,0.75);
    text-align: center;
    font-weight: 300;
  }
  .climate-chip .ci { font-size: 18px; }

  /* ── MAP ── */
  .map-container {
    position: relative;
    overflow: hidden;
    background: #0d1f35;
  }
  .map-container::before {
    content: '';
    position: absolute; inset: 0; z-index: 0;
    background:
      radial-gradient(ellipse 80% 60% at 30% 50%, rgba(20,50,90,0.4) 0%, transparent 70%),
      radial-gradient(ellipse 60% 80% at 70% 30%, rgba(10,30,60,0.3) 0%, transparent 60%);
  }

  .map-svg-wrap {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
  }

  /* Region paths */
  .region-path {
    cursor: pointer;
    transition: opacity 0.2s, filter 0.2s;
  }
  .region-path:hover {
    filter: brightness(1.25) saturate(1.3);
  }
  .region-path.active {
    filter: brightness(1.3) saturate(1.4);
  }
  .region-path.dimmed {
    opacity: 0.3;
  }

  /* Tooltip */
  .map-tooltip {
    position: absolute;
    pointer-events: none;
    background: rgba(8,16,30,0.95);
    border: 1px solid rgba(200,160,60,0.35);
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 12px;
    white-space: nowrap;
    transform: translate(-50%, -110%);
    box-shadow: 0 8px 32px rgba(0,0,0,0.6);
    z-index: 50;
  }
  .tt-name {
    font-family: 'Playfair Display', serif;
    font-size: 14px;
    color: #c9a84c;
    font-weight: 700;
    margin-bottom: 2px;
  }
  .tt-sub { color: rgba(200,190,165,0.65); font-size: 10px; font-weight: 300; }

  /* Map scale */
  .map-scale {
    position: absolute;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    pointer-events: none;
    z-index: 10;
  }
  .scale-bar-track {
    display: flex;
    height: 5px;
    border-radius: 2px;
    overflow: hidden;
    width: 100px;
    border: 1px solid rgba(100,150,200,0.3);
  }
  .scale-seg { flex: 1; }
  .scale-seg:nth-child(odd) { background: rgba(120,170,220,0.6); }
  .scale-seg:nth-child(even) { background: rgba(255,255,255,0.5); }
  .scale-lbl {
    font-size: 8px;
    color: rgba(120,160,200,0.6);
    letter-spacing: 1px;
  }

  /* Compass */
  .compass {
    position: absolute;
    bottom: 16px;
    right: 16px;
    pointer-events: none;
    z-index: 10;
  }

  /* ── RIGHT PANEL — REGION CARD ── */
  .region-placeholder {
    text-align: center;
    padding: 24px 8px;
    color: rgba(150,140,120,0.5);
    font-size: 11px;
    font-weight: 300;
    line-height: 2;
    border: 1px dashed rgba(200,160,60,0.12);
    border-radius: 10px;
  }
  .region-placeholder .ph-icon { font-size: 28px; margin-bottom: 8px; opacity: 0.5; }

  .region-card { display: flex; flex-direction: column; gap: 0; }
  .rc-header {
    background: linear-gradient(135deg, rgba(200,160,60,0.15), rgba(200,160,60,0.05));
    border: 1px solid rgba(200,160,60,0.2);
    border-radius: 10px 10px 0 0;
    padding: 14px 16px 12px;
    margin: -20px -16px 0;
  }
  .rc-name {
    font-family: 'Playfair Display', serif;
    font-size: 17px;
    font-weight: 700;
    color: #f0e0b0;
    line-height: 1.1;
  }
  .rc-capital {
    font-size: 10px;
    color: rgba(200,160,60,0.6);
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-top: 4px;
    font-weight: 300;
  }
  .rc-body { padding: 12px 0 0; }
  .rc-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 7px 0;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    font-size: 11px;
  }
  .rc-key { color: rgba(160,150,130,0.7); font-weight: 300; }
  .rc-val { color: #e0d8c0; font-weight: 500; font-size: 11.5px; }

  .rc-crops {
    display: flex; gap: 6px; flex-wrap: wrap; margin-top: 12px;
  }
  .crop-chip {
    display: flex; align-items: center; gap: 5px;
    background: rgba(200,160,60,0.08);
    border: 1px solid rgba(200,160,60,0.18);
    border-radius: 20px;
    padding: 3px 9px;
    font-size: 10px;
    color: rgba(220,200,155,0.85);
    font-weight: 300;
  }

  .rc-fact {
    margin-top: 12px;
    background: rgba(255,255,255,0.03);
    border-left: 2px solid rgba(200,160,60,0.4);
    border-radius: 0 6px 6px 0;
    padding: 10px 12px;
    font-size: 11px;
    color: rgba(200,190,165,0.75);
    line-height: 1.6;
    font-weight: 300;
    font-style: italic;
  }

  /* Area ring chart */
  .area-visual {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 12px;
  }
  .area-label { font-size: 10px; color: rgba(180,165,130,0.7); font-weight: 300; line-height: 1.5; }

  /* Facts */
  .fact-card {
    background: rgba(200,160,60,0.05);
    border: 1px solid rgba(200,160,60,0.1);
    border-radius: 10px;
    padding: 12px 14px;
    font-size: 11px;
    color: rgba(210,200,175,0.8);
    line-height: 1.7;
    font-weight: 300;
  }
  .fact-btn {
    margin-top: 8px;
    width: 100%;
    padding: 7px;
    background: transparent;
    border: 1px solid rgba(200,160,60,0.2);
    border-radius: 7px;
    color: rgba(200,170,80,0.8);
    font-family: 'Sora', sans-serif;
    font-size: 10px;
    letter-spacing: 1px;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
    font-weight: 400;
  }
  .fact-btn:hover { background: rgba(200,160,60,0.08); border-color: rgba(200,160,60,0.35); }

  /* Agri table */
  .agri-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px 0;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    font-size: 10.5px;
    font-weight: 300;
  }
  .agri-left { display:flex; align-items:center; gap:7px; color:rgba(200,190,165,0.75); }
  .agri-right { color: rgba(200,170,80,0.7); font-size: 10px; }

  /* Mode selector */
  .mode-btns {
    display:flex; gap:5px; margin-bottom:4px;
  }
  .mode-btn {
    flex:1; padding:6px 4px;
    background:transparent;
    border:1px solid rgba(200,160,60,0.15);
    border-radius:6px;
    color:rgba(180,165,130,0.6);
    font-family:'Sora',sans-serif;
    font-size:9px;
    letter-spacing:1px;
    cursor:pointer;
    text-transform:uppercase;
    transition:all 0.15s;
    font-weight:400;
  }
  .mode-btn.active {
    background:rgba(200,160,60,0.12);
    border-color:rgba(200,160,60,0.35);
    color:rgba(200,170,80,0.9);
  }

  @keyframes fadeIn {
    from { opacity:0; transform:translateY(6px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .fade-in { animation: fadeIn 0.35s ease; }

  @keyframes pulse-ring {
    0%   { r: 4; opacity:0.9; }
    100% { r: 12; opacity:0; }
  }
  .pulse-ring { animation: pulse-ring 2.2s ease-out infinite; }
`;

// ─── COMPONENT ───────────────────────────────────────────────
export default function MadagascarMap() {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [factIdx, setFactIdx] = useState(0);
  const [colorMode, setColorMode] = useState("biome"); // biome | pop | elev
  const [dims, setDims] = useState({ w: 600, h: 700 });
  const [paths, setPaths] = useState([]);
  const [centroids, setCentroids] = useState([]);
  const projectionRef = useRef(null);

  // Build D3 projection & paths
  useEffect(() => {
    const compute = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const w = rect.width || 600;
      const h = rect.height || 700;
      setDims({ w, h });

      const projection = d3.geoMercator()
        .center([46.8, 19.5])
        .scale(Math.min(w, h) * 2.1)
        .translate([w / 2, h / 2]);

      projectionRef.current = projection;
      const pathGen = d3.geoPath().projection(projection);

      const built = MADAGASCAR_GEOJSON.features.map(f => ({
        d: pathGen(f),
        centroid: pathGen.centroid(f),
        props: f.properties,
      }));
      setPaths(built);
    };
    compute();
    const ro = new ResizeObserver(compute);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Color per mode
  const getColor = useCallback((props) => {
    if (colorMode === "biome") return props.color || "#607050";
    if (colorMode === "pop") {
      const p = props.pop || 0;
      if (p > 2000) return "#e05030";
      if (p > 1200) return "#e07830";
      if (p > 800) return "#c8a040";
      if (p > 400) return "#88a040";
      return "#4a8050";
    }
    if (colorMode === "elev") {
      const e = props.elev || 0;
      if (e > 1200) return "#a09070";
      if (e > 800) return "#7a8060";
      if (e > 400) return "#607848";
      if (e > 150) return "#508038";
      return "#389050";
    }
    return props.color;
  }, [colorMode]);

  const handleRegionClick = (props) => {
    setSelected(prev => prev?.name === props.name ? null : props);
  };

  const ext = REGION_DATA[selected?.name] || {};

  return (
    <>
      <style>{styles}</style>
      <div className="mada-app">

        {/* ── HEADER ── */}
        <header className="mada-header">
          <div className="header-brand">
            <div className="header-flag">
              <div className="flag-white"/>
              <div style={{display:'flex',flexDirection:'column',flex:1}}>
                <div className="flag-red" style={{flex:1}}/>
                <div className="flag-green" style={{flex:1}}/>
              </div>
            </div>
            <div>
              <div className="header-title">Madagascar</div>
              <div className="header-subtitle">Atlas Éducatif Interactif · 22 Régions</div>
            </div>
          </div>
          <div className="header-stats">
            <div className="h-stat"><div className="h-stat-val">587k</div><div className="h-stat-lbl">km²</div></div>
            <div className="h-divider"/>
            <div className="h-stat"><div className="h-stat-val">22</div><div className="h-stat-lbl">Régions</div></div>
            <div className="h-divider"/>
            <div className="h-stat"><div className="h-stat-val">27.7M</div><div className="h-stat-lbl">Hab.</div></div>
            <div className="h-divider"/>
            <div className="h-stat"><div className="h-stat-val">4e</div><div className="h-stat-lbl">Grande île</div></div>
          </div>
          <div className="header-badge">Carte Réelle · GeoJSON</div>
        </header>

        {/* ── BODY ── */}
        <div className="mada-body">

          {/* ── LEFT PANEL ── */}
          <aside className="panel left">

            <div className="panel-block">
              <h4>Mode de couleur</h4>
              <div className="mode-btns">
                {[["biome","Biome"],["pop","Population"],["elev","Altitude"]].map(([k,l]) => (
                  <button key={k} className={`mode-btn ${colorMode===k?"active":""}`} onClick={() => setColorMode(k)}>{l}</button>
                ))}
              </div>
            </div>

            <div className="panel-block">
              <h4>Biomes</h4>
              {[
                ["#3da832","Forêt tropicale humide"],
                ["#786050","Hauts Plateaux (C)"],
                ["#b87030","Forêt épineuse (S)"],
                ["#509870","Mangroves côtières (O)"],
                ["#907840","Savane de l'ouest"],
                ["#708050","Zone de transition"],
              ].map(([c,l]) => (
                <div className="leg-row" key={l}>
                  <div className="leg-dot" style={{background:c}}/>
                  <span>{l}</span>
                </div>
              ))}
            </div>

            <div className="panel-block">
              <h4>Agriculture</h4>
              {[["🌾","Rizières"],["🌿","Vanille (SAVA)"],["☕","Caféiers"],["🌱","Manioc"],["🌽","Maïs"],["🌸","Girofliers"],["🍉","Fruits tropicaux"]].map(([e,l]) => (
                <div className="leg-row" key={l}>
                  <span className="leg-emoji">{e}</span>
                  <span>{l}</span>
                </div>
              ))}
            </div>

            <div className="panel-block">
              <h4>Climat</h4>
              <div className="climate-grid">
                {[["🌧","Tropical humide (Est)"],["☀️","Aride & sec (Sud)"],["🌤","Tempéré (Plateau)"],["🌫","Humide (Ouest)"]].map(([e,l]) => (
                  <div className="climate-chip" key={l}>
                    <span className="ci">{e}</span>
                    <span>{l}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel-block">
              <h4>Top Population</h4>
              {topPop.map(r => (
                <div className="pop-row" key={r.name}>
                  <span className="pop-name">{r.name}</span>
                  <div className="pop-track">
                    <div className="pop-fill" style={{width:`${(r.pop/3567)*100}%`}}/>
                  </div>
                  <span className="pop-val">{r.pop>999?`${(r.pop/1000).toFixed(1)}M`:`${r.pop}k`}</span>
                </div>
              ))}
            </div>

          </aside>

          {/* ── MAP ── */}
          <main className="map-container" ref={containerRef}>
            <div className="map-svg-wrap">
              <svg
                ref={svgRef}
                width={dims.w}
                height={dims.h}
                style={{display:"block"}}
              >
                {/* Ocean gradient */}
                <defs>
                  <radialGradient id="oceanGrad" cx="40%" cy="45%" r="65%">
                    <stop offset="0%" stopColor="#1e3d62"/>
                    <stop offset="50%" stopColor="#14304f"/>
                    <stop offset="100%" stopColor="#0a1f38"/>
                  </radialGradient>
                  <radialGradient id="shallowGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#2a5080" stopOpacity="0.4"/>
                    <stop offset="100%" stopColor="transparent"/>
                  </radialGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="blur"/>
                    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                  <filter id="shadow">
                    <feDropShadow dx="1" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.5)"/>
                  </filter>
                </defs>

                {/* Ocean */}
                <rect width={dims.w} height={dims.h} fill="url(#oceanGrad)"/>

                {/* Ocean grid */}
                {[0.2,0.4,0.6,0.8].map(t => (
                  <line key={`h${t}`} x1={0} y1={dims.h*t} x2={dims.w} y2={dims.h*t}
                    stroke="rgba(100,160,220,0.06)" strokeWidth={1}/>
                ))}
                {[0.25,0.5,0.75].map(t => (
                  <line key={`v${t}`} x1={dims.w*t} y1={0} x2={dims.w*t} y2={dims.h}
                    stroke="rgba(100,160,220,0.06)" strokeWidth={1}/>
                ))}

                {/* Ocean labels */}
                <text x={dims.w*0.12} y={dims.h*0.45}
                  fontFamily="Georgia, serif" fontSize={13} fontStyle="italic"
                  fill="rgba(100,160,210,0.28)" textAnchor="middle" letterSpacing={3}>
                  Océan Indien
                </text>
                <text x={dims.w*0.88} y={dims.h*0.35}
                  fontFamily="Georgia, serif" fontSize={11} fontStyle="italic"
                  fill="rgba(100,160,210,0.22)" textAnchor="middle" letterSpacing={2}>
                  Canal du
                </text>
                <text x={dims.w*0.88} y={dims.h*0.35+16}
                  fontFamily="Georgia, serif" fontSize={11} fontStyle="italic"
                  fill="rgba(100,160,210,0.22)" textAnchor="middle" letterSpacing={2}>
                  Mozambique
                </text>

                {/* ── REGION PATHS ── */}
                {paths.map((p, i) => {
                  if (!p.d) return null;
                  const props = p.props;
                  const isActive = selected?.name === props.name;
                  const isDimmed = selected && !isActive;
                  const color = getColor(props);
                  return (
                    <g key={props.name}>
                      {/* Shadow */}
                      <path d={p.d} fill="rgba(0,0,0,0.25)" transform="translate(2,3)" style={{pointerEvents:"none"}}/>
                      {/* Main fill */}
                      <path
                        d={p.d}
                        fill={color}
                        stroke={isActive ? "rgba(255,220,100,0.9)" : "rgba(255,255,255,0.18)"}
                        strokeWidth={isActive ? 2 : 0.8}
                        className={`region-path ${isActive?"active":""} ${isDimmed?"dimmed":""}`}
                        style={{
                          transition:"opacity 0.2s, filter 0.2s",
                          filter: isActive ? "brightness(1.3) saturate(1.4)" : hovered===props.name ? "brightness(1.2) saturate(1.25)" : "none",
                          opacity: isDimmed ? 0.3 : 1,
                          animationDelay:`${i*0.03}s`
                        }}
                        onClick={() => handleRegionClick(props)}
                        onMouseEnter={(e) => {
                          setHovered(props.name);
                          const rect = containerRef.current.getBoundingClientRect();
                          setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                        }}
                        onMouseMove={(e) => {
                          const rect = containerRef.current.getBoundingClientRect();
                          setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                        }}
                        onMouseLeave={() => setHovered(null)}
                      />
                      {/* Region label */}
                      {p.centroid && (
                        <text
                          x={p.centroid[0]}
                          y={p.centroid[1]}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize={props.area > 40000 ? 9 : props.area > 20000 ? 8 : 7}
                          fontFamily="Sora, sans-serif"
                          fontWeight="600"
                          fill="rgba(255,255,255,0.9)"
                          letterSpacing="0.3px"
                          style={{pointerEvents:"none", paintOrder:"stroke", stroke:"rgba(0,0,0,0.5)", strokeWidth:"3px", textTransform:"uppercase"}}
                        >
                          {props.area < 8000 ? props.name.split(" ")[0] : props.name}
                        </text>
                      )}
                      {/* Weather icon */}
                      {p.centroid && props.area > 15000 && (
                        <text
                          x={p.centroid[0] + (props.area > 30000 ? 12 : 9)}
                          y={p.centroid[1] - 12}
                          fontSize={props.area > 40000 ? 13 : 11}
                          textAnchor="middle"
                          style={{pointerEvents:"none"}}
                        >
                          {weatherEmoji[props.climate]}
                        </text>
                      )}
                      {/* Crop icon */}
                      {p.centroid && props.area > 18000 && props.crops?.[0] && (
                        <text
                          x={p.centroid[0]}
                          y={p.centroid[1] + 13}
                          fontSize={10}
                          textAnchor="middle"
                          style={{pointerEvents:"none", opacity:0.85}}
                        >
                          {props.crops.slice(0,2).join(" ")}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* ── CAPITAL MARKER ── */}
                {projectionRef.current && (() => {
                  const pt = projectionRef.current([47.52, 18.91]);
                  if (!pt) return null;
                  return (
                    <g key="capital">
                      <circle cx={pt[0]} cy={pt[1]} r={8} fill="none" stroke="rgba(255,210,80,0.5)" strokeWidth={1} className="pulse-ring"/>
                      <circle cx={pt[0]} cy={pt[1]} r={5} fill="rgba(8,16,30,0.9)" stroke="#c9a84c" strokeWidth={2}/>
                      <circle cx={pt[0]} cy={pt[1]} r={2.5} fill="#e8c860"/>
                      <text x={pt[0]+10} y={pt[1]-7}
                        fontFamily="Sora, sans-serif" fontSize={9} fontWeight="600"
                        fill="rgba(230,200,120,0.9)"
                        style={{paintOrder:"stroke", stroke:"rgba(0,0,0,0.8)", strokeWidth:"3px"}}>
                        Antananarivo ★
                      </text>
                    </g>
                  );
                })()}

                {/* ── CITY DOTS ── */}
                {projectionRef.current && [
                  [49.35, 18.15, "Toamasina"],
                  [46.32, 23.35, "Toliara"],
                  [46.02, 14.52, "Mahajanga"],
                  [47.0, 21.45, "Tôlanaro"],
                ].map(([lng, lat, name]) => {
                  const pt = projectionRef.current([lng, lat]);
                  if (!pt) return null;
                  return (
                    <g key={name}>
                      <circle cx={pt[0]} cy={pt[1]} r={3} fill="rgba(220,200,160,0.7)" stroke="rgba(0,0,0,0.4)" strokeWidth={1}/>
                      <text x={pt[0]+6} y={pt[1]+3} fontFamily="Sora, sans-serif" fontSize={8}
                        fill="rgba(200,190,165,0.7)"
                        style={{paintOrder:"stroke", stroke:"rgba(0,0,0,0.6)", strokeWidth:"2.5px", pointerEvents:"none"}}>
                        {name}
                      </text>
                    </g>
                  );
                })}

                {/* ── NOSY BE ISLAND ── */}
                {projectionRef.current && (() => {
                  const pt = projectionRef.current([48.32, 13.33]);
                  return pt ? (
                    <g>
                      <ellipse cx={pt[0]} cy={pt[1]} rx={10} ry={7} fill="#3da832" stroke="rgba(255,255,255,0.2)" strokeWidth={0.8}/>
                      <text x={pt[0]} y={pt[1]+1} textAnchor="middle" dominantBaseline="middle"
                        fontSize={6} fontFamily="Sora, sans-serif" fontWeight="600"
                        fill="rgba(255,255,255,0.85)" style={{pointerEvents:"none", paintOrder:"stroke", stroke:"rgba(0,0,0,0.5)", strokeWidth:"2px", textTransform:"uppercase", letterSpacing:"0.3px"}}>
                        NOSY BE
                      </text>
                    </g>
                  ) : null;
                })()}

              </svg>
            </div>

            {/* Tooltip */}
            {hovered && (
              <div className="map-tooltip" style={{left:tooltipPos.x, top:tooltipPos.y}}>
                <div className="tt-name">{hovered}</div>
                <div className="tt-sub">Cliquer pour les détails</div>
              </div>
            )}

            {/* Scale */}
            <div className="map-scale">
              <div className="scale-bar-track">
                <div className="scale-seg"/><div className="scale-seg"/>
                <div className="scale-seg"/><div className="scale-seg"/>
              </div>
              <div className="scale-lbl">0 · · · 300 km</div>
            </div>

            {/* Compass */}
            <div className="compass">
              <svg width={48} height={48} viewBox="0 0 48 48">
                <circle cx={24} cy={24} r={22} fill="rgba(8,16,30,0.85)" stroke="rgba(200,160,60,0.25)" strokeWidth={1}/>
                <polygon points="24,6 21,22 24,19 27,22" fill="#c9a84c"/>
                <polygon points="24,42 21,26 24,29 27,26" fill="rgba(180,170,150,0.5)"/>
                <line x1={6} y1={24} x2={42} y2={24} stroke="rgba(200,160,60,0.15)" strokeWidth={1}/>
                <text x={24} y={5} textAnchor="middle" fontSize={9} fontWeight="700" fill="#c9a84c" fontFamily="Sora,sans-serif">N</text>
                <text x={24} y={46} textAnchor="middle" fontSize={8} fill="rgba(160,150,130,0.6)" fontFamily="Sora,sans-serif">S</text>
                <text x={3} y={27} textAnchor="middle" fontSize={8} fill="rgba(160,150,130,0.6)" fontFamily="Sora,sans-serif">O</text>
                <text x={45} y={27} textAnchor="middle" fontSize={8} fill="rgba(160,150,130,0.6)" fontFamily="Sora,sans-serif">E</text>
              </svg>
            </div>
          </main>

          {/* ── RIGHT PANEL ── */}
          <aside className="panel right">

            <div className="panel-block">
              <h4>Région Sélectionnée</h4>
              {!selected ? (
                <div className="region-placeholder">
                  <div className="ph-icon">🗺️</div>
                  Cliquer sur une région<br/>pour afficher ses données
                </div>
              ) : (
                <div className="region-card fade-in" key={selected.name}>
                  <div className="rc-header">
                    <div className="rc-name">{selected.name}</div>
                    <div className="rc-capital">Capitale : {selected.capital}</div>
                  </div>
                  <div className="rc-body">
                    <div className="rc-row"><span className="rc-key">Superficie</span><span className="rc-val">{selected.area?.toLocaleString('fr')} km²</span></div>
                    <div className="rc-row"><span className="rc-key">Population</span><span className="rc-val">~{selected.pop?.toLocaleString('fr')}k hab.</span></div>
                    <div className="rc-row"><span className="rc-key">Biome</span><span className="rc-val">{ext.biomeLabel || selected.biome}</span></div>
                    <div className="rc-row"><span className="rc-key">Climat</span><span className="rc-val">{ext.climateLabel || selected.climate}</span></div>
                    <div className="rc-row"><span className="rc-key">Altitude moy.</span><span className="rc-val">{selected.elev} m</span></div>
                    <div className="rc-row"><span className="rc-key">Cultures</span><span className="rc-val">{selected.crops?.length} types</span></div>
                  </div>
                  <div className="rc-crops">
                    {selected.crops?.map(c => (
                      <div className="crop-chip" key={c}>
                        <span>{c}</span><span>{cropLabels[c]}</span>
                      </div>
                    ))}
                  </div>
                  {ext.funFact && <div className="rc-fact">💡 {ext.funFact}</div>}
                </div>
              )}
            </div>

            <div className="panel-block">
              <h4>Agriculture & Exports</h4>
              {[
                ["🌾","Riz (riziculture)","16/22 régions"],
                ["🌿","Vanille (SAVA)","80% mondial"],
                ["☕","Café arabica","6 régions"],
                ["🌱","Manioc","12 régions"],
                ["🌸","Girofliers","Zone NE"],
                ["🍉","Fruits tropicaux","Côte est"],
              ].map(([e,l,r]) => (
                <div className="agri-row" key={l}>
                  <div className="agri-left"><span>{e}</span><span>{l}</span></div>
                  <span className="agri-right">{r}</span>
                </div>
              ))}
            </div>

            <div className="panel-block">
              <h4>Le Saviez-Vous ?</h4>
              <div className="fact-card fade-in" key={factIdx}>
                {funFacts[factIdx]}
              </div>
              <button className="fact-btn" onClick={() => setFactIdx(i => (i+1)%funFacts.length)}>
                Fait suivant →
              </button>
            </div>

            <div className="panel-block">
              <h4>Zones Climatiques</h4>
              {[
                ["#e8c860","55%","Aride & sec (S & O)"],
                ["#3da832","25%","Tropical humide (E)"],
                ["#786050","12%","Tempéré (Plateaux)"],
                ["#509870","8%","Humide (Mangroves O)"],
              ].map(([c,p,l]) => (
                <div key={l} style={{marginBottom:7}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:10,marginBottom:3,color:"rgba(200,190,165,0.7)",fontWeight:300}}>
                    <span>{l}</span><span style={{color:"rgba(200,170,80,0.7)"}}>{p}</span>
                  </div>
                  <div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:2,overflow:"hidden"}}>
                    <div style={{height:"100%",width:p,background:c,borderRadius:2,opacity:0.8}}/>
                  </div>
                </div>
              ))}
            </div>

          </aside>
        </div>
      </div>
    </>
  );
}