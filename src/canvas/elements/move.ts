import type { CanvasElement, Position } from "../types";

export function moveSelectedElements(
  state: CanvasElement[],
  mousePosition: Position,
  movingPosition: Position
): CanvasElement[] {
  return state.map((rect) => {
    if (rect.selected) {
      rect = {
        ...rect,
        x: rect.x + (mousePosition.x - movingPosition.x),
        y: rect.y + (mousePosition.y - movingPosition.y),
      };
    }
    return rect;
  });
}
