// ui/render-all.js
// A TELJES graph kirajzolása az adatból: minden node + minden edge.
// Betöltés után hívjuk, miután a régi DOM-ot letakarítottuk és a graph
// adatát kicseréltük. Egy irányba dolgozik: adat -> DOM.

import { graph } from "../core/graph.js";
import { createNodeElement } from "../plugins/basic/renderers/node-renderer.js";
import { renderEdges } from "../plugins/basic/renderers/edge-renderer.js";

// Felépíti az összes node DOM-ját a graph.nodes-ból, majd kirajzolja az edge-eket.
// (A createNodeElement maga jegyzi be a node-okat a nyilvántartásba.)
export function renderAll() {

    graph.nodes.forEach(function (nodeData) {
        const result = createNodeElement(nodeData);         // adat -> DOM (+ behavior + nyilvántartás)
        document.body.appendChild(result.element);
    });

    renderEdges(null);                                      // a kapcsolatok a node-pozíciókból számolódnak
}