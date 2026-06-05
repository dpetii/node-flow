// canvas.js
// A VÁSZON interakció-rétege. EGYELŐRE csak EGY műveletet kezel: a node-húzást.
// (Később ide jön a fagyasztás, kijelölés, group, láthatóság, zoom/pan — most NEM.)
//
// Elvi váltás a korábbi állapothoz képest:
//   - A húzás NEM node-onkénti behavior többé. Az alkalmazás alap adottsága,
//     hogy a vászon a rajta lévő node-okat drag-and-drop-pal kezeli.
//   - Ezért EGYETLEN, vászon-szintű mechanizmus van, nem node-onként felaggatott.
//   - A megfogott node-ot futásidőben a DOM dataset.id-jából azonosítjuk
//     (nem callback-zárványból, mint korábban).
//
// A graph-réteggel ugyanúgy beszél, mint régen a draggable behavior tette:
//   startNodeDrag -> updateNodeDrag -> endNodeDrag.

import {
    startNodeDrag,
    updateNodeDrag,
    getNodePosition
} from "./core/graph.js";
import { endNodeDrag } from "./core/operations/move-node.js";
import { renderEdges } from "./plugins/basic/renderers/edge-renderer.js";

// Az ÉPP húzott node interakciós állapota, vagy null ha nem húzunk.
//   id      -> melyik node (a graph ezt az id-t kapja)
//   div     -> a node DOM eleme (ezt mozgatjuk vizuálisan)
//   offsetX -> a fogási pont X-ben (kurzor és a node bal-felső sarka közti táv)
//   offsetY -> ugyanez Y-ban
let drag = null;

// A node DOM elemének pozícióját ráírja a stílusra a graph aktuális
// (vagy húzás közbeni) helyéről. Ugyanaz az elv, mint a renderer applyPosition-je:
// SOHA nem a DOM-ból olvasunk pozíciót, mindig a graph-ból (getNodePosition).
function applyPosition(div, nodeId) {

    const pos = getNodePosition(nodeId);                    // ADATBÓL (húzás közben a dragging-ből)

    div.style.left = pos.x + "px";
    div.style.top = pos.y + "px";
}

// Egy eseményből kikeresi a húzandó node DOM-elemét — vagy null-t ad, ha
// a húzást NEM szabad indítani. Itt zárjuk ki a handle-öket: handle-en lenyomva
// kapcsolatot húzunk (azt a connection-manager intézi), nem node-ot mozgatunk.
function findDraggableNode(event) {

    // Handle fölött ne induljon node-húzás (a handle a kapcsolat-húzásé).
    if (event.target.closest(".input-handle, .output-handle")) {
        return null;
    }

    // A legközelebbi .node ős — erre kattintottunk rá valahol.
    const div = event.target.closest(".node");

    if (!div) return null;                                  // Üres vászonra kattintottunk

    // KÉSŐBB ide jön a "fagyasztott node nem húzható" feltétel.
    // Egyelőre minden node húzható.

    return div;
}

function onMouseDown(event) {

    const div = findDraggableNode(event);

    if (!div) return;                                      // Nincs mit húzni

    const nodeId = div.dataset.id;                          // A node-azonosító a DOM-ból (nem zárványból)

    const rect = div.getBoundingClientRect();              // Az elem aktuális helye a képernyőn

    const offsetX = event.clientX - rect.left;             // Hol fogtuk meg X-ben
    const offsetY = event.clientY - rect.top;              // Hol fogtuk meg Y-ban

    drag = {
        id: nodeId,
        div: div,
        offsetX: offsetX,
        offsetY: offsetY
    };

    div.style.cursor = "grabbing";

    // A húzott pozíció = kurzor mínusz fogási pont. Ezt kapja a graph drag-rétege.
    startNodeDrag(nodeId, event.clientX - offsetX, event.clientY - offsetY);
}

function onMouseMove(event) {

    if (!drag) return;                                     // Csak ha tényleg húzunk

    const newX = event.clientX - drag.offsetX;             // Új bal-felső sarok X
    const newY = event.clientY - drag.offsetY;             // Új bal-felső sarok Y

    updateNodeDrag(newX, newY);                            // Csak a dragging frissül (graph érintetlen)
    applyPosition(drag.div, drag.id);                      // A DOM node követi
    renderEdges(null);                                     // Az edge-ek újraszámolnak (getNodePosition-ből)
}

function onMouseUp() {

    if (!drag) return;                                     // Csak ha húztunk

    drag.div.style.cursor = "grab";

    endNodeDrag();                                         // A végső pozíció visszaíródik a graph-ba
    applyPosition(drag.div, drag.id);                      // Biztos, ami biztos: a graph szerint helyre
    renderEdges(null);

    drag = null;                                           // Az interakció vége
}

// A vászon-szintű húzás bekapcsolása. EGYSZER hívjuk az app indulásakor.
// A figyelők a document-en élnek — egyetlen példányban, nem node-onként.
export function initCanvasDragging() {

    document.addEventListener("mousedown", onMouseDown);   // Lenyomás bárhol (a node-ot a target adja)
    document.addEventListener("mousemove", onMouseMove);   // Mozgás bárhol az oldalon
    document.addEventListener("mouseup", onMouseUp);       // Felengedés bárhol
}