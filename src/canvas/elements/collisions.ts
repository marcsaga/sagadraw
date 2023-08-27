import { getResizeRectangles, standarizeElement } from "../helpers";
import { SHELL_MARGIN, getSelectedRect } from "../renders";
import type {
  BaseElement,
  CanvasElement,
  Position,
  ResizeDirection,
  TextElement,
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
): { ok: true; newState: CanvasElement[] } | { ok: false } {
  const selectedRect = getSelectedRect(state);
  if (
    selectedRect?.mode === "multiple" &&
    hasCollided(expandRect(selectedRect.element, SHELL_MARGIN), mousePosition)
  ) {
    return { ok: true, newState: state };
  }
  const collidedElements = state.filter((element) =>
    hasCollided(expandRect(element, SHELL_MARGIN), mousePosition)
  );
  if (collidedElements.length === 0) {
    return { ok: false };
  }

  const elementIndex = state.findIndex(
    (element) =>
      hasCollided(expandRect(element, SHELL_MARGIN), mousePosition) &&
      element.xSize * element.ySize ===
        Math.min(
          ...collidedElements.map((element) => element.xSize * element.ySize)
        )
  );
  if (elementIndex === -1) {
    return { ok: false };
  }

  return {
    ok: true,
    newState: state.map((element, index) => ({
      ...element,
      selected: elementIndex === index,
    })),
  };
}

export function hasTextInputCollision(
  state: CanvasElement[],
  mousePosition: Position
):
  | { ok: true; newState: CanvasElement[]; textElement: TextElement }
  | { ok: false } {
  const selectedRect = getSelectedRect(state);
  if (selectedRect?.mode === "multiple") {
    return { ok: false };
  }
  const elementIndex = state.findIndex(
    (element) =>
      element.type === "text" &&
      hasCollided(expandRect(element, SHELL_MARGIN), mousePosition)
  );
  if (elementIndex === -1 || state[elementIndex]?.type !== "text") {
    return { ok: false };
  }
  return {
    ok: true,
    textElement: state[elementIndex] as TextElement,
    newState: state.filter((_element, index) => index !== elementIndex),
  };
}
