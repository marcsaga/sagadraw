import { getResizeRectangles, standarizeElement } from "../helpers";
import { SHELL_MARGIN, getSelectedRect } from "../renders";
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
  const stdWrapper = standarizeElement(wrapper);
  const stdTarget =
    "xSize" in target
      ? standarizeElement(target)
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

  return resizeCollision
    ? { ok: true, position: resizeCollision[0] }
    : { ok: false };
}

function expandRect(rect: BaseElement, amount: number): BaseElement {
  return {
    ...rect,
    x: rect.x - amount,
    y: rect.y - amount,
    xSize: rect.xSize + amount * 2,
    ySize: rect.ySize + amount * 2,
  };
}

export function hasMovingCollision(
  state: CanvasElement[],
  mousePosition: Position
): { ok: boolean } {
  const selectedRect = getSelectedRect(state);
  if (!selectedRect) return { ok: false };
  return {
    ok: hasCollided(
      expandRect(selectedRect.element, SHELL_MARGIN),
      mousePosition
    ),
  };
}

const EDGE_COLLISION_MARGIN = 5;

export function hasCollidedWithEdges(
  state: CanvasElement[],
  mousePosition: Position
): { ok: true; newState: CanvasElement[] } | { ok: false } {
  const selectedIndex = state.findIndex((element) => {
    return (
      (mousePosition.x > element.x - EDGE_COLLISION_MARGIN &&
        mousePosition.x < element.x + EDGE_COLLISION_MARGIN) ||
      (mousePosition.y > element.y - EDGE_COLLISION_MARGIN &&
        mousePosition.y < element.y + EDGE_COLLISION_MARGIN) ||
      (mousePosition.x > element.x + element.xSize - EDGE_COLLISION_MARGIN &&
        mousePosition.x < element.x + element.xSize + EDGE_COLLISION_MARGIN) ||
      (mousePosition.y > element.y + element.ySize - EDGE_COLLISION_MARGIN &&
        mousePosition.y < element.y + element.ySize + EDGE_COLLISION_MARGIN)
    );
  });

  if (selectedIndex === -1) {
    return { ok: false };
  }

  return {
    ok: true,
    newState: state.map((element, index) => ({
      ...element,
      selected: selectedIndex === index,
    })),
  };
}
