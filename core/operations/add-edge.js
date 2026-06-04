// core/operations/add-edge.js
// Kapcsolat felvétele a graph-ba — az operations átjárón keresztül.
// A tényleges felvételt a graph.addEdge végzi.

import { addEdge as graphAddEdge } from "../graph.js";
import { runOperation } from "./_operations.js";

export function addEdge(sourceId, sourceHandle, targetId, targetHandle) {
    return runOperation(function () {
        return graphAddEdge(sourceId, sourceHandle, targetId, targetHandle);
    });
}