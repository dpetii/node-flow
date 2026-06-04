// graph/graph.js
// Ez a modul a SINGLE SOURCE OF TRUTH: itt él a teljes gráf adata.
// A DOM ennek csak a vetülete — soha nem olvasunk vissza a DOM-ból állapotot.

// A dokumentum-állapot: a "kész" gráf. Ez az, ami menthető/szerializálható.
//   nodes: [ { id, type, x, y, behaviors: [...] } ]
//   edges: [ { id, source, sourceHandle, target, targetHandle } ]
export const graph = {
    nodes: [],
    edges: []
};

// Az interakciós állapot: csak az ÉPP húzott node ideiglenes pozíciója, vagy null.
// Húzás közben innen jön a pozíció, nem a graph-ból (lásd getNodePosition).
//   { id, x, y }
let dragging = null;

// --- Azonosító-generálás -------------------------------------------------

let nodeCounter = 0;                                        // Folyamatosan növekvő számláló node-okhoz
let edgeCounter = 0;                                        // Ugyanez edge-ekhez

function nextNodeId() {
    nodeCounter += 1;
    return "n" + nodeCounter;                               // pl. "n1", "n2"
}

function nextEdgeId() {
    edgeCounter += 1;
    return "e" + edgeCounter;                               // pl. "e1", "e2"
}

// --- Node műveletek ------------------------------------------------------

// Új node felvétele a graph-ba. Csak ADATOT hoz létre, DOM-ot NEM.
// A megjelenítést a renderelő intézi az adatból.
export function addNode(type, x, y) {

    const node = {
        id: nextNodeId(),                                   // Egyedi azonosító
        type: type,                                         // A node típusa (pl. "default", "text", "add")
        x: x,                                               // Vízszintes pozíció (a graph az igazság)
        y: y,                                               // Függőleges pozíció
        behaviors: ["draggable", "sizeable"]                // Aktív behaviorök NEVE (futásidőben módosítható)
    };

    graph.nodes.push(node);                                 // Betesszük a dokumentum-állapotba

    return node;                                            // Visszaadjuk, hogy a hívó tudjon rá hivatkozni
}

// Egy node megkeresése id alapján
export function getNode(id) {
    return graph.nodes.find(function (n) { return n.id === id; });
}

// --- Pozíció átvezető (a minta szíve) ------------------------------------

// Egy node aktuális, ÉRVÉNYES pozícióját adja vissza.
// Ha a node épp húzás alatt van -> az interakciós állapotból (dragging).
// Egyébként -> a dokumentum-állapotból (graph).
// MINDEN pozíció-olvasásnak ezen kell átmennie, soha nem közvetlenül node.x-ből.
export function getNodePosition(id) {

    if (dragging && dragging.id === id) {                   // Ez a node épp interakció alatt áll?
        return { x: dragging.x, y: dragging.y };            // -> interakciós igazság
    }

    const node = getNode(id);                               // Nyugalomban lévő node
    return { x: node.x, y: node.y };                        // -> dokumentum-igazság
}

// --- Húzás életciklusa ---------------------------------------------------

// Húzás indítása: a node "kiválik" a dokumentum-állapotból az interakcióba.
// A node a graph-ban MARAD, csak a pozícióját mostantól a dragging adja.
export function startNodeDrag(id, x, y) {
    dragging = { id: id, x: x, y: y };
}

// Húzás közben: csak az interakciós pozíció frissül, a graph érintetlen.
export function updateNodeDrag(x, y) {
    if (!dragging) return;
    dragging.x = x;
    dragging.y = y;
}

// Húzás vége: az interakciós pozíció VISSZAÍRÓDIK a dokumentum-állapotba,
// majd a dragging kiürül. Innen a graph újra az egyetlen igazság.
export function endNodeDrag() {

    if (!dragging) return;

    const node = getNode(dragging.id);                      // Megkeressük az adatban a node-ot

    node.x = dragging.x;                                    // A végső pozíció visszakerül a graph-ba
    node.y = dragging.y;

    dragging = null;                                        // Az interakció vége — nincs többé felülírás
}

// Épp húzunk-e valamit? (a behavioröknek/renderelőnek hasznos lehet)
export function isDragging() {
    return dragging !== null;
}

// --- Edge műveletek ------------------------------------------------------

// Új kapcsolat felvétele. Az edge KIZÁRÓLAG id-kra hivatkozik, sosem DOM-ra
// és sosem koordinátára — a végpontokat a renderelő számolja getNodePosition-ből.
export function addEdge(sourceId, sourceHandle, targetId, targetHandle) {

    const edge = {
        id: nextEdgeId(),                                   // Egyedi azonosító
        source: sourceId,                                   // Forrás NODE id-ja (nem DOM!)
        sourceHandle: sourceHandle,                         // A forrás melyik handle-je (pl. "out")
        target: targetId,                                   // Cél NODE id-ja
        targetHandle: targetHandle                          // A cél melyik handle-je (pl. "in")
    };

    graph.edges.push(edge);

    return edge;
}

// --- Betöltés: a teljes dokumentum cseréje ------------------------------

// A graph adatának CSERÉJE betöltéskor. A futásidejű állapotot (dragging) is
// nullázza, és a counter-eket a legnagyobb meglévő id fölé állítja, hogy a
// betöltés utáni ÚJ node-ok/edge-ek ne ütközzenek a betöltöttekkel.
//
// FONTOS: a tömböket nem cseréljük le új referenciára, hanem a meglévő
// graph.nodes / graph.edges tartalmát ürítjük és töltjük újra — így a más
// modulokban már elkért 'graph' referencia érvényes marad.
export function replaceGraph(nodes, edges) {

    dragging = null;                                        // Interakció megszakad, ha épp volt

    graph.nodes.length = 0;                                 // A meglévő tömb kiürítése (referencia marad)
    graph.edges.length = 0;

    nodes.forEach(function (n) { graph.nodes.push(n); });   // Új tartalom betöltése
    edges.forEach(function (e) { graph.edges.push(e); });

    // Counter-helyreállítás: a legnagyobb meglévő sorszám fölé állítjuk.
    // Az id-k formája "n<szám>" és "e<szám>" — a szám-részt olvassuk ki.
    nodeCounter = maxIdNumber(graph.nodes);
    edgeCounter = maxIdNumber(graph.edges);
}

// Egy elemhalmaz id-jaiből kiolvassa a legnagyobb sorszámot (a vezető betű után).
// pl. ["n1","n5","n3"] -> 5. Üres halmaznál 0.
function maxIdNumber(items) {

    let max = 0;

    items.forEach(function (item) {
        const num = parseInt(String(item.id).slice(1), 10); // az első betű után a szám
        if (!isNaN(num) && num > max) {
            max = num;
        }
    });

    return max;
}