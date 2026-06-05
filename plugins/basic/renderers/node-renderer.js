// nodes/node-renderer.js
// Az ADATBÓL (nodeData) DOM node-ot épít, és karbantartja.
// Ez a réteg köti össze a graph-ot a DOM-mal — egy irányban: adat -> DOM.
//
// VÁLTOZÁS: a húzás (drag) már NEM itt él. A node-mozgatást a vászon (canvas.js)
// intézi, vászon-szinten, egyetlen mechanizmussal. Ezért a korábbi
// makeDragCallbacks + a graph drag-rétegének importjai INNEN KIKERÜLTEK.
// A renderer már csak a node felépítéséért és a NODE-onkénti behaviorökért
// (pl. sizeable) felel.

import { behaviors } from "../behaviors/_behaviors.js";
import { getNodePosition } from "../../../core/graph.js";
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

    // Felrakás: ami a listában van, de még nincs aktív.
    nodeData.behaviors.forEach(function (name) {

        // VÉDELEM: a "draggable" kikerült a registryből (a vászon kezeli).
        // Ha egy régi node-adat vagy mentett gráf még listázza, NE szálljon el —
        // egyszerűen kihagyjuk az ismeretlen/eltávolított behaviorneveket.
        if (!behaviors[name]) return;

        if (!active[name]) {
            active[name] = behaviors[name](div);            // a behavior már nem kap drag-callbacket
        }
    });

    // Leszedés: ami aktív, de már nincs a listában.
    Object.keys(active).forEach(function (name) {
        if (!nodeData.behaviors.includes(name)) {
            active[name]();                                 // cleanup meghívása
            delete active[name];
        }
    });
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
                                                            // (a vászon EBBŐL azonosítja a húzott node-ot)

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