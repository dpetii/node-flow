// edges/_edges.js
// Gyűjtő import: a kapcsolatkezelés nyilvános függvényeit egy helyről adjuk ki,
// ahogy a _nodes.js a node-okat és a _behaviors.js a viselkedéseket.

import { startDrag } from "./connection-manager.js";

export const connections = {
    startDrag
};
