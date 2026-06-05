// probe/compiler-probe.js
// PRÓBA a node-compiler-hez. NEM a rendszer része — egyszer lefuttatható
// ellenőrzés, ami megmutatja, HOGYAN bontja szét a fordító a receptet.
//
// Mit csinál:
//   1) beolvassa a default.json receptet (a fordító ezt NEM teszi — az a hívó dolga),
//   2) objektummá alakítja (JSON.parse),
//   3) átadja a fordítónak (compileNodeRecipe),
//   4) kiírja a szétosztott szeleteket (render, behaviors), hogy lásd, helyesek-e.
//
// Futtatás Node-ban:   node probe/compiler-probe.js
// (Böngészőben is működne modulként, de a fájl-olvasáshoz itt Node-ot használunk,
//  mert a böngésző fetch-et kérne — a próba lényege a fordító, nem a betöltés módja.)

import { readFileSync } from "fs";
import { compileNodeRecipe } from "./node-compiler.js";

// 1) A recept beolvasása fájlból — ez a HÍVÓ dolga, nem a fordítóé.
const jsonText = readFileSync(new URL("./default.json", import.meta.url), "utf8");

// 2) Szöveg -> objektum.
const recipe = JSON.parse(jsonText);

// 3) A fordító szétosztja a fogyasztók közt.
const compiled = compileNodeRecipe(recipe);

// 4) Kiírás — emberi ellenőrzéshez.
console.log("=== BEMENET: a recept (default.json) ===");
console.log(JSON.stringify(recipe, null, 2));

console.log("\n=== KIMENET: a fordító szétosztott struktúrája ===");
console.log(JSON.stringify(compiled, null, 2));

console.log("\n=== ELLENŐRZŐ PONTOK ===");
console.log("render.title          ->", compiled.render.title);
console.log("render.type           ->", compiled.render.type);
console.log("render.handles száma  ->", compiled.render.handles.length);

const inputs = compiled.render.handles.filter(function (h) { return h.side === "input"; });
const outputs = compiled.render.handles.filter(function (h) { return h.side === "output"; });
console.log("  ebből input         ->", inputs.length, inputs.map(function (h) { return h.name; }));
console.log("  ebből output        ->", outputs.length, outputs.map(function (h) { return h.name; }));

console.log("behaviors             ->", compiled.behaviors);
console.log("tartalmaz 'draggable'?->", compiled.behaviors.includes("draggable"), "(false a helyes — a Canvasé)");
console.log("project szelet        ->", compiled.project === undefined ? "nincs (helyes — nincs fogyasztó)" : compiled.project);