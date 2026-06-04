// plugins/basic/nodes/_types.js
// Egyszerű térkép: típusNÉV -> descriptor. A renderer ezen keresztül üti fel,
// melyik leírásból építsen, a node.type alapján.
// (KÉSŐBB ezt a core/registry váltja le, ami több plugin típusait gyűjti
//  névteresen. Egyelőre a basic-en belül, registry nélkül.)

import { textType } from "./text-node.js";

export const types = {
    default: textType                                       // a "default" típus a textType leírást használja
};

// Egy descriptor felütése típusNÉV alapján. Ha nincs ilyen típus, null.
export function getType(typeName) {
    return types[typeName] || null;
}