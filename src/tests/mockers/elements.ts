import type { Position, RectangleElement } from "~/canvas/types";

interface RectangleConfig {
  x: number;
  y: number;
  xSize: number;
  ySize: number;
  selected?: boolean;
}

export function mockRectangle({
  x = 100,
  y = 100,
  xSize = 200,
  ySize = 200,
  selected,
}: Partial<RectangleConfig>): RectangleElement {
  return { type: "rectangle", x, y, xSize, ySize, selected };
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
