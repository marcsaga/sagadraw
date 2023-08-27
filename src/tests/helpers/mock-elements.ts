import type {
  LineElement,
  Position,
  RectangleElement,
  TextElement,
} from "~/canvas/types";

export function mockRectangle({
  x = 100,
  y = 100,
  xSize = 200,
  ySize = 200,
  selected,
}: Partial<Omit<RectangleElement, "type">>): RectangleElement {
  return { type: "rectangle", x, y, xSize, ySize, selected };
}

export function mockText({
  x = 100,
  y = 100,
  text = "text",
  fontSize = 16,
  selected,
}: Partial<Omit<TextElement, "type">>): TextElement {
  return { type: "text", x, y, text, fontSize, selected, ySize: 30, xSize: 30 };
}

export function mockLine({
  x = 100,
  y = 100,
  xSize = 200,
  ySize = 200,
  selected,
}: Partial<Omit<LineElement, "type">>): LineElement {
  return { type: "line", x, y, xSize, ySize, selected };
}

export function getEdgeCollisions({
  x,
  y,
  xSize,
  ySize,
}: RectangleElement): Position[] {
  return [
    { x: x + xSize / 2, y },
    { x: x + xSize / 2, y: y + ySize },
    { x, y: y + ySize / 2 },
    { x: x + xSize, y: y + ySize / 2 },
  ];
}
