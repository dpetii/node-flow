// core/node-registry.js
// FUTÁSIDEJŰ nyilvántartás az élő node-okról. NEM menthető és NEM JSON —
// függvényeket (cleanup) tárol, amik a memóriában élnek, egy adott DOM-elemhez
// és listenerekhez kötve. Ez a megfelelője annak, amit OOP-ban az objektum-
// referencia tart: itt tároljuk a node-ok "destruktorait" (cleanup), hogy
// törléskor/betöltéskor kontrolláltan meghívhassuk őket.
//
// A graph (a dokumentum) ettől FÜGGETLEN: az adat, ez a futó megjelenítés.

// id -> { element, active }
//   element: a node DOM-eleme
//   active:  behaviorönkénti cleanup-függvények (a node-renderer tölti)
const liveNodes = new Map();

// Egy frissen létrehozott node felvétele a nyilvántartásba.
// A node-renderer hívja, miután felépítette az elemet és a behavioröket.
export function registerNode(id, element, active) {
    liveNodes.set(id, { element: element, active: active });
}

// Egy node teljes, KONTROLLÁLT eltávolítása:
//   1) meghívja minden behaviorének cleanup-ját (a "destruktorokat"),
//   2) leveszi a DOM-elemet a képernyőről,
//   3) kiveszi a nyilvántartásból.
// Hiba (kivétel) nélkül — a törlés normális művelet, nem hibajelzés.
export function unregisterNode(id) {

    const entry = liveNodes.get(id);
    if (!entry) return;                                     // Nincs ilyen élő node — nincs teendő

    // 1) Minden aktív behavior cleanup-ja lefut (leszedi a listenereket)
    Object.keys(entry.active).forEach(function (name) {
        entry.active[name]();                               // a cleanup = destruktor
    });

    // 2) A DOM-elem eltávolítása a képernyőről
    if (entry.element && entry.element.parentNode) {
        entry.element.parentNode.removeChild(entry.element);
    }

    // 3) Kivesszük a nyilvántartásból
    liveNodes.delete(id);
}

// MINDEN élő node kontrollált eltávolítása (betöltés előtt: tiszta lap).
// Végigmegy a nyilvántartáson, mindegyiket rendesen lebontja.
export function clearAllNodes() {
    // Külön listába szedjük az id-kat, mert az unregisterNode módosítja a Map-et.
    Array.from(liveNodes.keys()).forEach(function (id) {
        unregisterNode(id);
    });
}

// Egy élő node lekérése (pl. behavior-frissítéshez, KÉSŐBB).
export function getLiveNode(id) {
    return liveNodes.get(id) || null;
}