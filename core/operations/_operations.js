// core/operations/_operations.js
// EZ A KÖZÖS ÁTJÁRÓ minden dokumentum-módosító művelethez.
// A graph-ot mostantól semmi nem írja közvetlenül — mindenki egy operationt hív,
// az pedig ezen a runOperation belépőn megy át.
//
// A "konnektor" itt: a runOperation az EGYETLEN hely, ahova a dokumentumot
// érintő közös teendők kerülnek. Most kettő van rajta: a "piszkos" jelző
// beállítása, és KÉSŐBB ide jön az undo (history-mentés a művelet előtt).

import { markDirty } from "../dirty-state.js";

// Egy művelet lefuttatása. Az 'action' egy függvény, ami ténylegesen módosítja
// a graph-ot, és visszaadja az eredményét (pl. az új node-ot).
export function runOperation(action) {

    // KÉSŐBB IDE JÖN (undo-fázis), a művelet ELŐTT:
    //   history.save();   // lefényképezi a graph mostani állapotát

    const result = action();                                // A tényleges graph-módosítás lefut

    markDirty();                                            // A dokumentum megváltozott -> mentetlen állapot

    return result;                                          // A hívó megkapja, amit a művelet visszaadott
}