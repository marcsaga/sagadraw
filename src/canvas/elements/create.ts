import type { Position, RectangleElement, TextElement } from "../types";

export function createTextElement({ x, y }: Position): TextElement {
  return { x, y, text: "", xSize: 30, ySize: 30, type: "text", fontSize: 16 };
}

export function createRectangleElement({ x, y }: Position): RectangleElement {
  return { x, y, xSize: 0, ySize: 0, type: "rectangle" };
}
