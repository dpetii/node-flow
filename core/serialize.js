// core/serialize.js
// A graph DOKUMENTUM-állapotát JSON szöveggé alakítja és vissza.
// Tiszta logika: NEM tud fájlról és NEM tud DOM-ról — csak adatot fordít.
// A fájl-ki/bevitelt az ui réteg végzi, a DOM újraépítését a betöltés hívója.

import { graph, replaceGraph } from "./graph.js";

// A dokumentum verziója. KÉSŐBB ez segít a betöltésnél eldönteni,
// kell-e migrálni (ha egy régebbi formátumú fájlt hozol be).
const FORMAT_VERSION = "1.0";

// graph -> JSON szöveg. Csak a DOKUMENTUMOT írja ki (nodes, edges) —
// a futásidejű állapot (dragging, nyilvántartás) NEM kerül bele.
// A plugins lista feljegyzi, mely pluginokat használ a graph (most fixen basic),
// hogy betöltéskor ellenőrizhető legyen, jelen vannak-e.
export function serialize() {

    const doc = {
        formatVersion: FORMAT_VERSION,
        plugins: [
            { id: "basic", version: "1.0" }                 // KÉSŐBB: a ténylegesen használt pluginokból gyűjtve
        ],
        nodes: graph.nodes,                                 // a node-ok adata (id, type, x, y, behaviors, ...)
        edges: graph.edges                                  // a kapcsolatok (id-alapú)
    };

    // 2 szóköz behúzás — ember-olvasható marad a fájl
    return JSON.stringify(doc, null, 2);
}

// JSON szöveg -> a graph adatának CSERÉJE.
// A tényleges cserét a graph.replaceGraph végzi (ő állítja helyre a countereket is).
// Visszaadja a beolvasott dokumentumot (a hívónak hasznos lehet, pl. plugins-ellenőrzés).
export function deserialize(jsonText) {

    const doc = JSON.parse(jsonText);                       // Hibás JSON itt kivételt dob — a hívó kezeli

    // Minimális épségvizsgálat: legyen nodes és edges tömb.
    if (!Array.isArray(doc.nodes) || !Array.isArray(doc.edges)) {
        throw new Error("Érvénytelen graph fájl: hiányzó nodes vagy edges.");
    }

    replaceGraph(doc.nodes, doc.edges);                     // A graph adatának cseréje + counter-helyreállítás

    return doc;                                             // pl. doc.plugins a plugin-ellenőrzéshez
}