// app.js
// Vékony belépési pont. A node létrehozása két lépés:
//   1) ADAT: addNode() felveszi a graph-ba
//   2) DOM: createNodeElement() megjeleníti az adatból
// Az app maga nem tárol állapotot — az a graph.js dolga.

import { addNode } from "./core/operations/add-node.js";
import { createNodeElement } from "./plugins/basic/renderers/node-renderer.js";
import { createSaveLoadButtons } from "./ui/save-load.js";

// Az utolsó kattintás helye, hogy oda kerüljön az új node
let lastClickX = 100;
let lastClickY = 100;

document.addEventListener("click", function (event) {

    // A gombokra (Új Node, Mentés, Betöltés) kattintást nem számítjuk
    // node-pozíciónak — csak a "szabad" vászonra kattintást.
    if (event.target.tagName !== "BUTTON") {
        lastClickX = event.clientX;
        lastClickY = event.clientY;
    }
});

// "Új Node" gomb
const button = document.createElement("button");

button.id = "createNodeButton";
button.textContent = "Új Node";

document.body.appendChild(button);

// A Mentés / Betöltés gombok létrehozása
createSaveLoadButtons();

button.addEventListener("click", function () {

    // 1) ADAT: felvesszük a graph-ba. EGYELŐRE "default" típussal.
    const nodeData = addNode("default", lastClickX, lastClickY);

    // 2) DOM: megjelenítjük az adatból
    const result = createNodeElement(nodeData);

    document.body.appendChild(result.element);

    // A result.active a behaviorök cleanup-tárolója — KÉSŐBB ezt eltesszük
    // (pl. egy node-id -> { element, active } térképbe), hogy a behavior
    // futásidejű ki/bekapcsolásához (refreshNodeBehaviors) hozzáférjünk.
});