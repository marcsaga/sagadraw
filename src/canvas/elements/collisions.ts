import { getResizeRectangles, standarizeElementPosition } from "../helpers";
import { getSelectedRect } from "../renders";
import type {
  BaseElement,
  CanvasElement,
  Position,
  ResizeDirection,
} from "../types";

export function hasCollided(
  wrapper: BaseElement,
  target: Position | BaseElement
) {
  const stdWrapper = standarizeElementPosition(wrapper);
  const stdTarget =
    "xSize" in target
      ? standarizeElementPosition(target)
      : { ...target, xSize: 0, ySize: 0 };

  return (
    stdWrapper.x < stdTarget.x &&
    stdWrapper.y < stdTarget.y &&
    stdWrapper.x + stdWrapper.xSize > stdTarget.x + stdTarget.xSize &&
    stdWrapper.y + stdWrapper.ySize > stdTarget.y + stdTarget.ySize
  );
}

export function hasResizeCollision(
  state: CanvasElement[],
  mousePosition: Position
): { ok: true; position: ResizeDirection } | { ok: false } {
  const selectedRect = getSelectedRect(state);
  if (!selectedRect) return { ok: false };

  const resizeCollision = getResizeRectangles(
    selectedRect.element,
    selectedRect.mode
  ).find(([, rectangle]) => hasCollided(rectangle, mousePosition));
  if (resizeCollision) {
    return { ok: true, position: resizeCollision[0] };
  }
  return { ok: false };
}

export function hasMovingCollision(
  state: CanvasElement[],
  mousePosition: Position
): { ok: boolean } {
  const selectedRect = getSelectedRect(state);
  if (!selectedRect) return { ok: false };
  return { ok: hasCollided(selectedRect.element, mousePosition) };
}
