// behaviors/_behaviors.js
// Gyűjtő import. A KULCSNEVEK pontosan egyeznek a node.behaviors listában
// használt nevekkel, mert a behavior-szinkron NÉV szerint üti fel őket innen.
import { makeDraggable } from "./draggable.js";
import { makeSizeable } from "./sizeable.js";

export const behaviors = {
    draggable: makeDraggable,                               // node.behaviors-ban: "draggable"
    sizeable: makeSizeable                                  // node.behaviors-ban: "sizeable"
};
