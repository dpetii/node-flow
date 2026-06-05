// edges/connection-manager.js
// A kapcsolatok ÁLLAPOTÁÉRT és LOGIKÁJÁÉRT felel. A megjelenítést az
// edge-renderer.js végzi, a kapcsolatok adatát a graph.js tárolja.

import { addEdge } from "../../../core/operations/add-edge.js";
import { renderEdges } from "../renderers/edge-renderer.js";

// A folyamatban lévő kapcsolat-húzás, vagy null ha épp nincs.
// { sourceId, sourceHandle, x, y } — innen indul, a kurzor az aktuális vég.
let connectionDrag = null;

// Kapcsolat-húzás indítása: az output handle lenyomásakor hívjuk.
//   sourceId    -> a forrás node id-ja
//   sourceHandle-> a forrás melyik handle-je (pl. "out")
export function startConnection(sourceId, sourceHandle, startX, startY) {

    connectionDrag = {
        sourceId: sourceId,
        sourceHandle: sourceHandle,
        x: startX,                                          // A kurzor kiinduló helye
        y: startY
    };

    renderEdges(connectionDrag);                            // Azonnal rajzoljuk az ideiglenes vonalat
}

// Egy handle DOM-elemből kiolvassa a hozzá tartozó node-id-t és handle-nevet.
// A node-gyártáskor a handle-ökre dataset-be írjuk ezeket (lásd text-node.js).
// Csak INPUT handle-t fogad el célként; egyébként null.
function readInputHandle(element) {

    if (!element) return null;
    if (!element.classList.contains("input-handle")) return null;

    return {
        nodeId: element.dataset.nodeId,                     // melyik node-hoz tartozik
        handle: element.dataset.handle                      // melyik handle azon belül
    };
}

// Globális egérmozgás: ha épp kapcsolatot húzunk, az ideiglenes vonal követi a kurzort.
document.addEventListener("mousemove", function (event) {

    if (!connectionDrag) return;                            // Csak kapcsolat-húzás közben

    connectionDrag.x = event.clientX;
    connectionDrag.y = event.clientY;

    renderEdges(connectionDrag);                            // Ideiglenes vonal a kurzorig
});

// Globális egérfelengedés: itt dől el, létrejön-e a kapcsolat.
document.addEventListener("mouseup", function (event) {

    if (!connectionDrag) return;

    // Mi van a kurzor alatt a felengedés pillanatában?
    const elementBelow = document.elementFromPoint(event.clientX, event.clientY);

    const target = readInputHandle(elementBelow);           // Input handle fölött vagyunk-e?

    if (target && target.nodeId !== connectionDrag.sourceId) {   // Érvényes cél, és nem önmaga

        addEdge(                                            // Kapcsolat az ADATBA (id-alapú)
            connectionDrag.sourceId,
            connectionDrag.sourceHandle,
            target.nodeId,
            target.handle
        );

        const edge = addEdge(connectionDrag.sourceId, connectionDrag.sourceHandle, target.nodeId, target.handle);
        console.log("Edge létrehozva (graph):", edge);
    }

    connectionDrag = null;                                  // A húzás vége (sikerült vagy sem)

    renderEdges(null);                                      // Újrarajzolás ideiglenes vonal nélkül
});