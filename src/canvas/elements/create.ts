import type {
  LineElement,
  Position,
  RectangleElement,
  TextElement,
} from "../types";
import { nanoid } from "nanoid";

export function generateID(): string {
  return nanoid();
}

export function createTextElement({ x, y }: Position): TextElement {
  return {
    id: generateID(),
    x,
    y,
    text: "",
    xSize: 10,
    ySize: 15,
    type: "text",
    fontSize: 16,
  };
}

export function createRectangleElement({ x, y }: Position): RectangleElement {
  return { id: generateID(), x, y, xSize: 0, ySize: 0, type: "rectangle" };
}

export function createLineElement({ x, y }: Position): LineElement {
  return { id: generateID(), x, y, xSize: 0, ySize: 0, type: "line" };
}
