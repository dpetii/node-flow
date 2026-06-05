// core/node-compiler.js
// A node-RECEPT (a típus JSON-leírása, pl. default.json tartalma) FORDÍTÓJA.
// Tiszta logika: NEM tud fájlról és NEM tud DOM-ról — csak adatot oszt szét.
// A fájl-beolvasást a hívó végzi (JSON szöveg -> objektum), a DOM-építést a renderer.
//
// A fordító NEM cselekszik: nem épít DOM-ot, nem rak fel behaviort. Csak SZÉTOSZT.
// A teljes recept négyféle információt hordozhat (gráf, DOM, szemantika, projekt),
// de ezeket a FOGYASZTÓIK szerint porciózzuk, nem nyers rétegként:
//
//   render    -> amit a renderer a DOM felépítéséhez kér (cím, handle-ök)
//   behaviors -> a node-onkénti alkatrészek nevei (a behavior-rendszernek)
//
// A 'semantics' (handle-típusok kötés-ellenőrzéshez) a handle-ökön UTAZIK a
// render-szeletben: a renderer a handle dataset-jébe írja a nevet/típust, onnan
// olvassa a connection-manager. Ezért nincs külön semantics-csatorna EGYELŐRE.
//
// A 'project'/meta szeletnek ma még NINCS fogyasztója (debug, validáció később),
// ezért a fordító HELYET hagy neki, de nem tölti ki — a recept project-mezeje,
// ha van, érintetlenül átkerül a kimenetbe, hogy a későbbi fogyasztó megtalálja.

// Egyetlen handle recept-leírását a renderer által várt alakra hozza.
// A handle EGYBEN marad: a szín megjelenés, a név/típus szemantika, de
// fizikailag egy handle — a renderer rakja fel, a connection-manager a
// dataset-ből olvassa a nevet/típust.
function compileHandle(handleSpec) {
    return {
        side: handleSpec.side,                              // "input" | "output"
        name: handleSpec.name,                              // a handle neve (kötés-azonosító)
        type: handleSpec.type,                              // a handle típusa (kötés-kompatibilitás)
        color: handleSpec.color                             // a handle színe (megjelenés)
    };
}

// Egy recept-objektumból szétosztott struktúrát ad.
// A 'recipe' a JSON-ből már objektummá alakított recept (pl. default.json tartalma).
export function compileNodeRecipe(recipe) {

    // RENDER-szelet: amit a renderer a DOM-építéshez kér.
    const render = {
        type: recipe.type,                                  // típus-azonosító (CSS-horog, dataset)
        title: recipe.header ? recipe.header.title : recipe.type,  // fejléc-felirat (DOM)
        handles: (recipe.handles || []).map(compileHandle)  // a handle-ök egységes listája
    };

    // BEHAVIORS-szelet: a node-onkénti alkatrészek nevei.
    const behaviors = recipe.behaviors || [];

    // PROJECT/meta-szelet: ma nincs fogyasztója — érintetlenül átvisszük,
    // ha a recept hordoz ilyet, hogy a későbbi fogyasztó (debug, validáció)
    // megtalálja. Ha nincs, nem hozunk létre üres kulcsot.
    const out = {
        render: render,
        behaviors: behaviors
    };

    if (recipe.project !== undefined) {
        out.project = recipe.project;
    }

    return out;
}