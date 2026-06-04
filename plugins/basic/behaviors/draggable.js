// behaviors/draggable.js
// Húzhatóvá tesz egy elemet. A behavior NEM ismeri a graph-ot — callback-eket
// kap, és azokon keresztül jelzi a húzás fázisait. Így a behavior független marad.
//
//   node      -> a húzandó DOM elem
//   callbacks -> {
//       onStart(x, y)   : húzás kezdete (egér lenyomva az elemen)
//       onMove(x, y)    : húzás közben (kurzor mozgásakor)
//       onEnd()         : húzás vége (egér felengedve)
//   }
//
// VISSZAAD egy cleanup függvényt, ami leszedi a ráaggatott eseménykezelőket.
// Erre a behavior futásidejű ki/bekapcsolásához van szükség.
export function makeDraggable(node, callbacks) {

    let isDragging = false;                                 // Épp húzzuk-e ezt az elemet
    let offsetX = 0;                                        // Egér és elem-sarok távolsága X-ben (a fogási pont)
    let offsetY = 0;                                        // Ugyanez Y-ban

    // NÉVVEL definiált kezelők — kötelező, hogy a cleanup le tudja szedni őket.
    // (Névtelen függvényt nem lehet removeEventListener-rel eltávolítani.)

    function onMouseDown(event) {

        isDragging = true;
        node.style.cursor = "grabbing";

        const rect = node.getBoundingClientRect();          // Az elem aktuális helye a képernyőn

        offsetX = event.clientX - rect.left;                // Hol fogtuk meg X-ben
        offsetY = event.clientY - rect.top;                 // Hol fogtuk meg Y-ban

        // A húzott pozíció = kurzor mínusz fogási pont. Ezt adjuk át a graph-nak.
        callbacks.onStart(event.clientX - offsetX, event.clientY - offsetY);
    }

    function onMouseMove(event) {

        if (!isDragging) return;                            // Csak ha tényleg húzunk

        const newX = event.clientX - offsetX;               // Új bal felső sarok X
        const newY = event.clientY - offsetY;               // Új bal felső sarok Y

        callbacks.onMove(newX, newY);                       // Átadjuk a graph-nak (az írja a dragging-et)
    }

    function onMouseUp() {

        if (!isDragging) return;                            // Csak ha húztunk

        isDragging = false;
        node.style.cursor = "grab";

        callbacks.onEnd();                                  // Húzás vége -> graph visszaírja a pozíciót
    }

    node.addEventListener("mousedown", onMouseDown);        // Lenyomás magán az elemen
    document.addEventListener("mousemove", onMouseMove);    // Mozgás bárhol az oldalon
    document.addEventListener("mouseup", onMouseUp);        // Felengedés bárhol

    // Cleanup: pontosan azokat a kezelőket szedi le, amiket fent felraktunk.
    return function cleanup() {
        node.removeEventListener("mousedown", onMouseDown);
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
    };
}
