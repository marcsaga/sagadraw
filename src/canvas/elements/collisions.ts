import { getResizeRectangles, standarizeElement } from "../helpers";
import { SHELL_MARGIN, getSelectedRect } from "../renders";
import type {
  BaseElement,
  CanvasElement,
  LineElement,
  Position,
  RectangleElement,
  ResizeDirection,
  ResizeLineDirection,
  TextElement,
} from "../types";
import { createLineElement, generateID } from "./create";

const LINE_COLLISION_THESHOLD = 2;

export function pointToPointDistance(point1: Position, point2: Position) {
  return Math.hypot(point1.x - point2.x, point1.y - point2.y);
}

function hasPointCollidedWithLine(line: LineElement, point: Position): boolean {
  const distance = pointToLineDistance(point, line);
  return Math.abs(distance) < LINE_COLLISION_THESHOLD;
}

function pointToLineDistance(point: Position, line: LineElement): number {
  const start = { x: line.x, y: line.y };
  const end = { x: line.x + line.xSize, y: line.y + line.ySize };

  const lineLengthSquared = (end.x - start.x) ** 2 + (end.y - start.y) ** 2;
  if (lineLengthSquared === 0) {
    return Math.hypot(point.x - start.x, point.y - start.y);
  }

  let t =
    ((point.x - start.x) * (end.x - start.x) +
      (point.y - start.y) * (end.y - start.y)) /
    lineLengthSquared;

  t = Math.max(0, Math.min(1, t));

  const projection = {
    x: start.x + t * (end.x - start.x),
    y: start.y + t * (end.y - start.y),
  };

  return Math.hypot(point.x - projection.x, point.y - projection.y);
}

function isLineElement(element: BaseElement): element is LineElement {
  return "type" in element && element.type === "line";
}

export function hasCollided<T extends BaseElement>(
  wrapper: T,
  target: Position | BaseElement
) {
  if (isLineElement(wrapper)) {
    return hasPointCollidedWithLine(wrapper, target);
  }
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
):
  | { ok: true; direction: ResizeDirection; newState?: CanvasElement[] }
  | { ok: false } {
  const selectedRect = getSelectedRect(state);
  if (!selectedRect) return { ok: false };

  const resizeCollision = getResizeRectangles(
    selectedRect.element,
    selectedRect.mode
  ).find(([, rectangle]) => hasCollided(rectangle, mousePosition));
  if (!resizeCollision) {
    return { ok: false };
  }

  let newState: CanvasElement[] | undefined;
  if (selectedRect.mode === "line") {
    newState = state.map((element) =>
      element.selected && element.type === "line"
        ? {
            ...element,
            resizeDirection: resizeCollision[0] as ResizeLineDirection,
          }
        : element
    );
  }

  return { ok: true, direction: resizeCollision[0], newState };
}

function expandElement<T extends BaseElement>(rect: T): T {
  const amount = "type" in rect && rect.type === "line" ? 0 : SHELL_MARGIN;
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
    hasCollided(expandElement(selectedRect.element), mousePosition)
  ) {
    return { ok: true, newState: state };
  }

  const collidedElements = state
    .map((element, stateIndex) => ({ ...element, stateIndex }))
    .filter((element) => hasCollided(expandElement(element), mousePosition));
  if (collidedElements.length === 0) {
    return { ok: false };
  }

  const minSizeCollided = Math.min(
    ...collidedElements.map((element) => element.xSize * element.ySize)
  );
  const collidedElement = collidedElements
    .reverse()
    .find((element) => element.xSize * element.ySize === minSizeCollided);
  if (collidedElement === undefined) {
    return { ok: false };
  }

  return {
    ok: true,
    newState: state.map((element, index) => ({
      ...element,
      selected: collidedElement.stateIndex === index,
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
      hasCollided(expandElement(element), mousePosition)
  );
  if (elementIndex === -1 || state[elementIndex]?.type !== "text") {
    return { ok: false };
  }
  return {
    ok: true,
    textElement: state[elementIndex] as TextElement,
    newState: state.map((element, index) => ({
      ...element,
      selected: index === elementIndex,
    })),
  };
}

export function getRectangleLines(rectangle: RectangleElement): LineElement[] {
  const lines = [
    { x: rectangle.x, y: rectangle.y, xSize: rectangle.xSize, ySize: 0 },
    { x: rectangle.x, y: rectangle.y, xSize: 0, ySize: rectangle.ySize },
    {
      x: rectangle.x + rectangle.xSize,
      y: rectangle.y,
      xSize: 0,
      ySize: rectangle.ySize,
    },
    {
      x: rectangle.x,
      y: rectangle.y + rectangle.ySize,
      xSize: rectangle.xSize,
      ySize: 0,
    },
  ];

  return lines.map((line) => ({ ...createLineElement(line), ...line }));
}

function isRectangleElement(
  element: CanvasElement
): element is RectangleElement {
  return element.type === "rectangle";
}

const BINDING_COLLISION_THRESHOLD = 10;

export function getBindingState(
  state: CanvasElement[],
  line: LineElement,
  mousePosition: Position
): CanvasElement[] {
  if (!line.resizeDirection) {
    return state;
  }

  const rectangleLines = state
    .filter(isRectangleElement)
    .map((rect) => ({ id: rect.id, lines: getRectangleLines(rect) }));

  let newPosition: Position = mousePosition;
  let rectangleID: string | undefined;
  for (const rectangle of rectangleLines) {
    for (const line of rectangle.lines) {
      if (
        pointToLineDistance(mousePosition, line) < BINDING_COLLISION_THRESHOLD
      ) {
        if (line.xSize === 0) {
          newPosition = { x: line.x, y: mousePosition.y };
        } else {
          newPosition = { x: mousePosition.x, y: line.y };
        }
        rectangleID = rectangle.id;
        break;
      }
    }
  }

  if (mousePosition.x === newPosition.x && mousePosition.y === newPosition.y) {
    return state;
  }

  return state.map((element) => {
    if (element.id !== line.id) return element;
    const lineElement = element as LineElement;
    if (line.resizeDirection === "line-start") {
      return {
        ...lineElement,
        startBindingID: rectangleID,
        x: newPosition.x,
        y: newPosition.y,
        xSize: line.xSize + (line.x - newPosition.x),
        ySize: line.ySize + (line.y - newPosition.y),
      };
    }

    return {
      ...lineElement,
      endBindingID: rectangleID,
      xSize: line.xSize + (newPosition.x - (line.x + line.xSize)),
      ySize: line.ySize + (newPosition.y - (line.y + line.ySize)),
    };
  });
}
