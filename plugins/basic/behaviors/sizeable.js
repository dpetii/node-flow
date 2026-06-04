// behaviors/sizeable.js
// Görgővel átméretezhetővé tesz egy elemet, ha az egér fölötte van.
// VISSZAAD egy cleanup függvényt, hogy a behavior futásidőben leszedhető legyen.
export function makeSizeable(node) {

    let isMouseOver = false;                                // Az egér a node felett van-e
    let scale = 1;                                          // Aktuális méretarány

    // NÉVVEL definiált kezelők — hogy a cleanup le tudja szedni őket.

    function onEnter() {
        isMouseOver = true;
        node.classList.add("sizeable-hover");               // Vizuális jelzés
    }

    function onLeave() {
        isMouseOver = false;
        node.classList.remove("sizeable-hover");
    }

    function onWheel(event) {

        if (!isMouseOver) return;                           // Csak a node felett méretezünk

        event.preventDefault();                             // Ne görgessen az oldal

        if (event.deltaY < 0) {
            scale += 0.1;                                   // Felfelé: nagyítás
        } else {
            scale -= 0.1;                                   // Lefelé: kicsinyítés
        }

        scale = Math.max(0.5, Math.min(scale, 3));          // Korlátok közé szorítjuk

        node.style.transform = `scale(${scale})`;           // Alkalmazzuk
    }

    node.addEventListener("mouseenter", onEnter);
    node.addEventListener("mouseleave", onLeave);
    node.addEventListener("wheel", onWheel);

    // Cleanup: leszedi a kezelőket ÉS visszaállítja a vizuális állapotot.
    return function cleanup() {
        node.removeEventListener("mouseenter", onEnter);
        node.removeEventListener("mouseleave", onLeave);
        node.removeEventListener("wheel", onWheel);
        node.classList.remove("sizeable-hover");            // Ne maradjon ott a hover-jelzés
    };
}
