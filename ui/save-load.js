// ui/save-load.js
// A Ment és Tölt gombok, a böngészős fájl-ki/bevitel, és a betöltés teljes
// láncolata. Itt fut össze a szerializálás, a dirty-jelző, a takarítás és
// az újraépítés — de mindegyiket a saját modulja végzi, ez csak összehangol.

import { serialize, deserialize } from "../core/serialize.js";
import { isDirty, markClean } from "../core/dirty-state.js";
import { clearAllNodes } from "../core/node-registry.js";
import { renderAll } from "./render-all.js";

// --- Mentés: graph -> JSON -> letöltött fájl -----------------------------

function saveToFile() {

    const jsonText = serialize();                           // graph -> JSON szöveg

    // A szöveget egy ideiglenes letöltési linken keresztül adjuk a böngészőnek.
    const blob = new Blob([jsonText], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "graph.json";                              // a letöltött fájl neve
    a.click();                                              // elindítja a letöltést

    URL.revokeObjectURL(url);                               // takarítás: a blob-url felszabadítása

    markClean();                                            // mentés után nincs mentetlen változás
}

// --- Betöltés: fájl -> JSON -> graph-csere -> újraépítés ------------------

// A tényleges betöltés, miután a felhasználó kiválasztotta a fájlt.
function loadFromText(jsonText) {

    try {
        deserialize(jsonText);                              // JSON -> a graph adatának cseréje (+ counter)
    } catch (err) {
        alert("A fájl nem tölthető be: " + err.message);    // hibás/sérült JSON — nem omlik össze
        return;
    }

    clearAllNodes();                                        // a RÉGI node-ok kontrollált lebontása (cleanup + DOM)
    renderAll();                                            // az ÚJ graph kirajzolása az adatból

    markClean();                                            // a frissen betöltött állapot "tiszta"
}

// A Tölt gomb: fájlválasztó, majd beolvasás. Előtte FIGYELMEZTETÉS, ha van
// mentetlen változás (dirty), nehogy a betöltés csendben felülírja a munkát.
function openLoadDialog() {

    if (isDirty()) {                                        // csak akkor kérdezünk, ha van veszteni való
        const ok = confirm("Mentetlen változások vannak. Biztosan betöltesz egy másikat? A jelenlegi elveszik.");
        if (!ok) return;                                    // a felhasználó meggondolta magát
    }

    // Rejtett fájl-input, ami JSON-t fogad
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";

    input.addEventListener("change", function () {

        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function () {
            loadFromText(String(reader.result));            // a fájl tartalma -> betöltés
        };
        reader.readAsText(file);                            // szövegként olvassuk be a JSON-t
    });

    input.click();                                          // megnyitja a fájlválasztót
}

// --- Gombok létrehozása --------------------------------------------------

export function createSaveLoadButtons() {

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Mentés";
    saveBtn.addEventListener("click", saveToFile);
    document.body.appendChild(saveBtn);

    const loadBtn = document.createElement("button");
    loadBtn.textContent = "Betöltés";
    loadBtn.addEventListener("click", openLoadDialog);
    document.body.appendChild(loadBtn);
}