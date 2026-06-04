// core/operations/move-node.js
// Node-mozgatás VÉGLEGESÍTÉSE (drop) — az operations átjárón keresztül.
//
// FONTOS: a húzás HÁROM fázisú (start, update, end), de csak a VÉGE
// (endNodeDrag = a drop) dokumentum-módosítás — EZ az undo-egység.
// A start és az update INTERAKCIÓ (a dragging-réteget írja, nem a graph-ot),
// ezért azok NEM mennek az operationön át — a behavior közvetlenül hívja őket
// a graph-ból. Így "egy húzás = egy lépés", nem száz.

import { endNodeDrag as graphEndNodeDrag } from "../graph.js";
import { runOperation } from "./_operations.js";

// A drop pillanatában hívjuk: a húzott pozíció visszaíródik a graph-ba.
export function endNodeDrag() {
    return runOperation(function () {
        return graphEndNodeDrag();
    });
}