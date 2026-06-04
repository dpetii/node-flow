// core/dirty-state.js
// "Piszkos" jelző: van-e mentetlen változás a legutóbbi mentés óta.
// Minden dokumentum-módosító művelet piszkossá teszi (lásd _operations.js),
// a mentés és a betöltés tisztára állítja. A betöltés ezt nézi: ha tiszta
// (vagy üres a graph), nem kell figyelmeztetni.

let dirty = false;

export function markDirty() {
    dirty = true;
}

export function markClean() {
    dirty = false;
}

export function isDirty() {
    return dirty;
}