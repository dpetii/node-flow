// edges/edge-renderer.js
// Ez a modul KIZÁRÓLAG a kapcsolatok megjelenítéséért felel (SVG görbék).
// A pozíciókat a graph-ból, a getNodePosition átvezetőn keresztül kéri —
// SOHA nem a DOM-ból (getBoundingClientRect), hogy a húzás-felülírás is érvényesüljön.

import { graph, getNodePosition } from "../../../core/graph.js";

// A node mérete. EGYELŐRE konstans, mert a CSS-ben fix (140x80).
// KÉSŐBB: ez a graph-ba kerül node-onként (node.width / node.height),
// és innen onnan olvassuk, ha a node-ok mérete eltérhet.
const NODE_WIDTH = 140;
const NODE_HEIGHT = 80;

// Az SVG réteg, amibe a vonalakat rajzoljuk (lazy inicializálás)
let svgLayer = null;

function getSvgLayer() {

    if (svgLayer) return svgLayer;                          // Ha már létezik, visszaadjuk

    const NS = "http://www.w3.org/2000/svg";

    svgLayer = document.createElementNS(NS, "svg");         // SVG elemet névtérrel kell létrehozni
    svgLayer.classList.add("edge-layer");

    document.body.appendChild(svgLayer);

    return svgLayer;
}

// Egy handle KÉPERNYŐ-pozícióját számolja ki a node ADATBELI pozíciójából.
// A node bal felső sarka a (pos.x, pos.y); a handle ehhez képest relatív.
//   output -> jobb szél, függőlegesen középen
//   input  -> bal szél, függőlegesen középen
// (Amíg minden node 1 be / 1 ki handle-t használ, elég a node közepe.
//  Több handle esetén ide jön majd a handle sorszáma szerinti eltolás.)
function getHandleScreenPosition(nodeId, side) {

    const pos = getNodePosition(nodeId);                    // ADATBÓL (vagy húzás közben a dragging-ből)

    const y = pos.y + NODE_HEIGHT / 2;                      // Függőlegesen a node közepe

    const x = side === "output"
        ? pos.x + NODE_WIDTH                                // output: a node jobb széle
        : pos.x;                                            // input: a node bal széle

    return { x: x, y: y };
}

// Két pont közötti köbös Bézier-görbe path-stringje (S-alak)
function buildCurvePath(from, to) {

    const dx = Math.abs(to.x - from.x);
    const offset = Math.max(dx / 2, 40);                    // Vezérlőpont vízszintes eltolása (min. 40px)

    return `M ${from.x} ${from.y} `                         // Kezdőpont
         + `C ${from.x + offset} ${from.y}, `               // 1. vezérlőpont (forrásból jobbra)
         + `${to.x - offset} ${to.y}, `                     // 2. vezérlőpont (célból balra)
         + `${to.x} ${to.y}`;                               // Végpont
}

// Egy <path> SVG elemet hoz létre a görbe-stringből
function createPath(d, dashed) {

    const NS = "http://www.w3.org/2000/svg";

    const path = document.createElementNS(NS, "path");

    path.setAttribute("d", d);
    path.setAttribute("fill", "none");                      // Csak a vonal kell, kitöltés nem
    path.setAttribute("stroke", "orange");
    path.setAttribute("stroke-width", "2");

    if (dashed) {
        path.setAttribute("stroke-dasharray", "6 4");       // Ideiglenes (húzott) vonal szaggatott
    }

    return path;
}

// Újrarajzolja az ÖSSZES kapcsolatot a graph.edges-ből, plusz opcionálisan
// a húzás közbeni ideiglenes vonalat.
//   dragInfo -> { sourceId, sourceHandle, x, y } húzott kapcsolatnál, vagy null
export function renderEdges(dragInfo) {

    const svg = getSvgLayer();

    svg.innerHTML = "";                                     // Mindent letörlünk és újrarajzolunk

    graph.edges.forEach(function (edge) {                   // Végig a kész kapcsolatokon (mind id-alapú)

        const from = getHandleScreenPosition(edge.source, "output");
        const to = getHandleScreenPosition(edge.target, "input");

        const d = buildCurvePath(from, to);

        svg.appendChild(createPath(d, false));              // Folytonos vonal a kész kapcsolatnak
    });

    if (dragInfo) {                                         // Ha épp húzunk egy új kapcsolatot

        const from = getHandleScreenPosition(dragInfo.sourceId, "output");
        const to = { x: dragInfo.x, y: dragInfo.y };        // A kurzor a "cél"

        const d = buildCurvePath(from, to);

        svg.appendChild(createPath(d, true));               // Szaggatott, mert még nem végleges
    }
}
