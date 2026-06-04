// plugins/basic/nodes/default-node.js
// TÍPUSLEÍRÁS (descriptor) — NEM csinál semmit, csak LEÍR.
// A node-renderer olvassa, és ebből építi a DOM-ot.
// (A handle- és behavior-rákötés a node-renderer.js-ben van,
//  hogy minden típus a közös vázat használja, ne duplikálja.)

export const defaultNode = {

    // A típus NEVE a basic pluginon belül. A teljes, névteres azonosító
    // ebből és a plugin ID-jából áll össze (lásd plugin.js): "basic/default".
    // KÉSŐBB ez ID-alapú lesz, ha a plugin nevét lecseréljük egy állandó ID-ra.
    name: "default",

    title: "Default",                                       // A node fejléc-felirata

    inputs: [                                               // Bemeneti handle-ök leírása
        { name: "in", type: "any", color: "limegreen" }
    ],

    outputs: [                                              // Kimeneti handle-ök leírása
        { name: "out", type: "any", color: "red" }
    ],

    behaviors: ["draggable", "sizeable"]                    // Mely behaviorök aktívak alapból
};