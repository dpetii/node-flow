// nodes/node-renderer.js
// Az ADATBÓL (nodeData) DOM node-ot épít, és karbantartja.
// Ez a réteg köti össze a graph-ot a DOM-mal — egy irányban: adat -> DOM.

import { behaviors } from "../behaviors/_behaviors.js";
import {
    startNodeDrag,
    updateNodeDrag,
    getNodePosition
} from "../../../core/graph.js";
import { endNodeDrag } from "../../../core/operations/move-node.js";
import { renderEdges } from "./edge-renderer.js";
import { startConnection } from "../edges/connection-manager.js";
import { getType } from "../nodes/_types.js";
import { registerNode } from "../../../core/node-registry.js";

// Egy DOM node pozícióját ráírja a stílusra a graph aktuális (vagy húzott) helyéről.
function applyPosition(div, nodeId) {

    const pos = getNodePosition(nodeId);                    // ADATBÓL (húzás közben a dragging-ből)

    div.style.left = pos.x + "px";
    div.style.top = pos.y + "px";
}

// A node behavior-listáját SZINKRONIZÁLJA a ténylegesen aktív behaviorökkel.
// Kétirányú: ami a listában van de nem aktív -> felrakjuk; ami aktív de
// kikerült a listából -> leszedjük (a cleanup függvényükkel).
// Az 'active' objektumban tartjuk a behaviorönként visszakapott cleanup-okat.
function syncBehaviors(div, nodeData, active) {

    // Felrakás: ami a listában van, de még nincs aktív
    nodeData.behaviors.forEach(function (name) {
        if (!active[name]) {
            active[name] = behaviors[name](div, makeDragCallbacks(div, nodeData.id));
        }
    });

    // Leszedés: ami aktív, de már nincs a listában
    Object.keys(active).forEach(function (name) {
        if (!nodeData.behaviors.includes(name)) {
            active[name]();                                 // cleanup meghívása
            delete active[name];
        }
    });
}

// A draggable behavior callback-jei. A húzás fázisait a graph drag-rétegére
// kötik, és minden mozdulatnál frissítik a node DOM-ját ÉS az edge-eket.
// (A sizeable nem használ callback-et, de a közös aláírás miatt megkapja —
//  egyszerűen figyelmen kívül hagyja.)
function makeDragCallbacks(div, nodeId) {

    return {
        onStart: function (x, y) {
            startNodeDrag(nodeId, x, y);                    // A node "kiválik" az interakcióba
        },
        onMove: function (x, y) {
            updateNodeDrag(x, y);                           // Csak a dragging frissül (graph érintetlen)
            applyPosition(div, nodeId);                     // A DOM node követi
            renderEdges(null);                              // Az edge-ek újraszámolnak (getNodePosition-ből)
        },
        onEnd: function () {
            endNodeDrag();                                  // A végső pozíció visszaíródik a graph-ba
            applyPosition(div, nodeId);                     // Biztos, ami biztos: a graph szerint helyre
            renderEdges(null);
        }
    };
}

// Egy handle DOM-elemet hoz létre, és RÁÍRJA a dataset-be a node-id-t és a
// handle nevét — ezekből ismeri fel a connection-manager a kapcsolat végét.
// A descriptorból kapott színt a handle háttérszínére írja.
function createHandle(nodeId, side, handleSpec) {

    const handle = document.createElement("div");

    handle.classList.add(side === "output" ? "output-handle" : "input-handle");

    handle.dataset.nodeId = nodeId;                         // melyik node-hoz tartozik
    handle.dataset.handle = handleSpec.name;                // melyik handle azon belül (a descriptorból)

    if (handleSpec.color) {
        handle.style.background = handleSpec.color;         // a descriptor által megadott szín
    }

    return handle;
}

// A teljes node DOM felépítése egy nodeData-ból.
// Visszaadja a DOM elemet ÉS az aktív behaviorök cleanup-tárolóját (active),
// hogy később (pl. behavior ki/bekapcsolásnál) újra lehessen szinkronizálni.
export function createNodeElement(nodeData) {

    const descriptor = getType(nodeData.type);              // A típushoz tartozó leírás felütése

    const div = document.createElement("div");

    div.classList.add("node");
    div.classList.add("node--" + nodeData.type);           // típus-specifikus CSS horog (pl. node--default)

    div.dataset.id = nodeData.id;                           // az id a DOM-on is elérhető

    // A node felirata a descriptor title-jéből (ha nincs leírás, marad üres).
    const titleEl = document.createElement("div");
    titleEl.classList.add("node-title");
    titleEl.textContent = descriptor ? descriptor.title : nodeData.type;
    div.appendChild(titleEl);

    // Bemeneti handle-ök a descriptor inputs listájából.
    if (descriptor) {
        descriptor.inputs.forEach(function (handleSpec) {
            div.appendChild(createHandle(nodeData.id, "input", handleSpec));
        });
    }

    // Kimeneti handle-ök a descriptor outputs listájából. Mindegyik output
    // lenyomása kapcsolat-húzást indít az adott handle nevével.
    if (descriptor) {
        descriptor.outputs.forEach(function (handleSpec) {

            const outputHandle = createHandle(nodeData.id, "output", handleSpec);

            outputHandle.addEventListener("mousedown", function (event) {
                event.stopPropagation();                    // Ne induljon el a node mozgatása
                event.preventDefault();                     // Ne legyen szövegkijelölés
                startConnection(nodeData.id, handleSpec.name, event.clientX, event.clientY);
            });

            div.appendChild(outputHandle);
        });
    }

    applyPosition(div, nodeData.id);                        // Kezdő pozíció az adatból

    const active = {};                                      // behaviorönkénti cleanup-tároló
    syncBehaviors(div, nodeData, active);                   // behaviorök felrakása a lista szerint

    registerNode(nodeData.id, div, active);                 // Bejegyzés a futásidejű nyilvántartásba
                                                            // (innen tudjuk később tisztán törölni: cleanup + DOM)

    return { element: div, active: active };
}

// Kívülről hívható: egy node behavior-listájának megváltozása után
// újraszinkronizálja a behavioröket (pl. "sizeable" törlése a listából).
export function refreshNodeBehaviors(div, nodeData, active) {
    syncBehaviors(div, nodeData, active);
}