// plugins/basic/plugin.js
// A "basic" család NÉVJEGYE. Nem csinál semmit a maga jogán — LEÍRJA,
// mit kínál a plugin: azonosító, név, verzió, és mely típusokat hozza.
// A váz registry-je ezt olvassa majd fel (KÉSŐBBI fázis), és innen tudja,
// mely node-típusok léteznek, milyen néven.

import { defaultNode } from "./nodes/default-node.js";

export const basicPlugin = {

    // ÁLLANDÓ azonosító — sosem változik a plugin élete során.
    // Szándékosan "buta", jelentés nélküli: mivel semmit nem jelent, semmi
    // nem teheti elavulttá (átnevezés, verzióváltás nem érinti).
    // EGYELŐRE olvasható ("basic"); KÉSŐBB lecserélhető egy véletlen ID-ra.
    id: "basic",

    // Ember-olvasható név — megjelenítésre. VÁLTOZHAT (átnevezhető).
    name: "Basic",

    // Verzió — VÁLTOZIK minden frissítéssel. A graph plugins-listája ezt
    // jegyzi fel, és ehhez igazodik majd a betöltés/migráció.
    version: "1.0",

    // A plugin által kínált node-típusok. A kulcs a típus neve, az érték
    // a descriptor. A teljes névteres azonosító: id + "/" + típusnév
    // -> "basic/default".
    nodeTypes: {
        default: defaultNode
    }

    // KÉSŐBB ide jönnek: edgeTypes, a saját behaviorök/alkatrészek listája,
    // és (más családoknál) a migrations.
};