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

export const TEXT_LINE_HEIGHT = 20;
const fontFamily = "sans-serif";

export function createTextElement({ x, y }: Position): TextElement {
  return {
    id: generateID(),
    x,
    y,
    text: "",
    xSize: 10,
    ySize: TEXT_LINE_HEIGHT,
    type: "text",
    fontSize: 16,
    fontFamily,
    selected: false,
  };
}

export function createRectangleElement({ x, y }: Position): RectangleElement {
  return {
    id: generateID(),
    x,
    y,
    xSize: 0,
    ySize: 0,
    type: "rectangle",
    selected: false,
  };
}

export function createLineElement(
  { x, y }: Position,
  opts?: { endArrow?: boolean }
): LineElement {
  return {
    id: generateID(),
    x,
    y,
    xSize: 0,
    ySize: 0,
    type: "line",
    selected: false,
    hasEndArrow: opts?.endArrow,
  };
}
