// core/operations/add-node.js
// Node felvétele a graph-ba — az operations átjárón keresztül.
// A tényleges adat-felvételt a graph.addNode végzi; ez a réteg csak
// a közös belépőn (runOperation) tereli át, hogy a jövőbeli undo egy helyre kerüljön.

import { addNode as graphAddNode } from "../graph.js";
import { runOperation } from "./_operations.js";

export function addNode(type, x, y) {
    return runOperation(function () {
        return graphAddNode(type, x, y);                    // a graph végzi a tényleges felvételt
    });
}