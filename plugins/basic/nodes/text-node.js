// nodes/types/text-node.js
// TÍPUSLEÍRÁS (descriptor) — NEM csinál semmit, csak LEÍR.
// A node-renderer olvassa majd, és ebből építi a DOM-ot.
// (A korábbi handle- és behavior-rákötés átkerült a node-renderer.js-be,
//  hogy minden típus a közös vázat használja, ne duplikálja.)
export const textType = {

    title: "Text",                                          // A node fejléc-felirata

    inputs: [                                               // Bemeneti handle-ök leírása
        { name: "in", type: "any", color: "limegreen" }
    ],

    outputs: [                                              // Kimeneti handle-ök leírása
        { name: "out", type: "any", color: "red" }
    ],

    behaviors: ["draggable", "sizeable"]                    // Mely behaviorök aktívak alapból
};
