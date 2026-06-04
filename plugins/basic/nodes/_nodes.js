// nodes/_nodes.js
// Gyűjtő import a node-réteghez. A korábbi createTextNode helyett most a
// node-renderer createNodeElement-jét adjuk ki — az épít node-ot adatból.
import { createNodeElement } from "./node-renderer.js";

export const nodes = {
    createNodeElement
};
