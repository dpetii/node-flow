// behaviors/_behaviors.js
// Gyűjtő import. A KULCSNEVEK pontosan egyeznek a node.behaviors listában
// használt nevekkel, mert a behavior-szinkron NÉV szerint üti fel őket innen.
//
// A "draggable" KIKERÜLT innen: a húzás már nem node-onkénti behavior, hanem
// a vászon (canvas.js) alap adottsága — minden node-ot kezel, egy mechanizmussal.
// Itt már csak azok a behaviorök maradnak, amik tényleg NODE-onként változhatnak.
import { makeSizeable } from "./sizeable.js";

export const behaviors = {
    sizeable: makeSizeable                                  // node.behaviors-ban: "sizeable"
};