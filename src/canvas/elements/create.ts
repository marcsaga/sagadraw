import type {
  LineElement,
  Position,
  RectangleElement,
  TextElement,
} from "../types";

export function createTextElement({ x, y }: Position): TextElement {
  return { x, y, text: "", xSize: 10, ySize: 15, type: "text", fontSize: 16 };
}

export function createRectangleElement({ x, y }: Position): RectangleElement {
  return { x, y, xSize: 0, ySize: 0, type: "rectangle" };
}

export function createLineElement({ x, y }: Position): LineElement {
  return { x, y, xSize: 0, ySize: 0, type: "line" };
}
