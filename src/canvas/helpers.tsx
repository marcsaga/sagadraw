import { getResizeRectangle, getSelectedRect } from "./renders";
import type {
  BaseElement,
  CanvasElement,
  ResizeRectanglePosition,
  Position,
} from "./types";

export function setUpCanvas(
  element?: HTMLCanvasElement | null
): CanvasRenderingContext2D | undefined {
  if (!element) return;
  element.width = window.innerWidth * 2;
  element.height = window.innerHeight * 2;
  element.style.width = `${window.innerWidth}px`;
  element.style.height = `${window.innerHeight}px`;

  const context = element.getContext("2d");
  if (!context) return;
  context.scale(2, 2);

  return context;
}

export function standarizeElementPosition<T extends BaseElement>(
  element: T
): T {
  return {
    ...element,
    x: element.xSize < 0 ? element.x + element.xSize : element.x,
    y: element.ySize < 0 ? element.y + element.ySize : element.y,
    xSize: Math.abs(element.xSize),
    ySize: Math.abs(element.ySize),
  };
}

export function hasCollided(wrapper: BaseElement, element: BaseElement) {
  const stdWrapper = standarizeElementPosition(wrapper);
  const stdElement = standarizeElementPosition(element);

  return (
    stdWrapper.x < stdElement.x &&
    stdWrapper.y < stdElement.y &&
    stdWrapper.x + stdWrapper.xSize > stdElement.x + stdElement.xSize &&
    stdWrapper.y + stdWrapper.ySize > stdElement.y + stdElement.ySize
  );
}

type ResizeCursor = "nesw-resize" | "nwse-resize" | "ns-resize" | "ew-resize";

const resizeCursorDict: Record<ResizeRectanglePosition, ResizeCursor> = {
  "top-left": "nwse-resize",
  "top-right": "nesw-resize",
  "bottom-left": "nesw-resize",
  "bottom-right": "nwse-resize",
  bottom: "ns-resize",
  top: "ns-resize",
  left: "ew-resize",
  right: "ew-resize",
};

export const RESIZE_RECTABLE_POSITIONS = new Set<ResizeRectanglePosition>([
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
  "top",
  "left",
  "right",
  "bottom",
]);

export function getResizeRectangles(
  element: BaseElement
): [ResizeRectanglePosition, BaseElement][] {
  return Array.from(RESIZE_RECTABLE_POSITIONS).map((position) => [
    position,
    getResizeRectangle(element, position),
  ]);
}

export function getCursorFromResizeCollision(
  elements: CanvasElement[],
  mouse: Pick<BaseElement, "x" | "y">
): ResizeCursor | undefined {
  const selectedRect = getSelectedRect(elements);
  if (!selectedRect) return;

  const collision = getResizeRectangles(selectedRect).find(([, rectangle]) => {
    return hasCollided(rectangle, { ...mouse, xSize: 0, ySize: 0 });
  });
  if (collision) return resizeCursorDict[collision[0]];
}

export function checkSelectedElements(
  state: CanvasElement[],
  selectionElement?: BaseElement
): { updated: boolean; newState: CanvasElement[] } | undefined {
  if (!selectionElement) return;
  let updated = false;
  const newState = [...state];
  for (const [index, rect] of newState.entries()) {
    const rectCollided = hasCollided(selectionElement, rect);

    const resizeRectangleCollided = getResizeRectangles(rect).some(
      ([, rectable]) => hasCollided(rectable, selectionElement)
    );
    updated =
      updated || (rectCollided !== rect.selected && !resizeRectangleCollided);
    newState[index]!.selected = rectCollided || resizeRectangleCollided;
  }
  return { updated, newState };
}

export function resizeElements(
  { nativeEvent: { offsetX, offsetY } }: React.MouseEvent,
  state: CanvasElement[],
  resizePosition: Position & { position: ResizeRectanglePosition }
): CanvasElement[] {
  const newState = state.map((rect) => {
    if (!rect.selected) return rect;
    switch (resizePosition.position) {
      case "top-left":
        return {
          ...rect,
          x: rect.x + (offsetX - resizePosition.x),
          y: rect.y + (offsetY - resizePosition.y),
          xSize: rect.xSize + (resizePosition.x - offsetX),
          ySize: rect.ySize + (resizePosition.y - offsetY),
        };
      case "top-right":
        return {
          ...rect,
          y: rect.y + (offsetY - resizePosition.y),
          xSize: rect.xSize + (offsetX - resizePosition.x),
          ySize: rect.ySize + (resizePosition.y - offsetY),
        };
      case "bottom-left":
        return {
          ...rect,
          x: rect.x + (offsetX - resizePosition.x),
          xSize: rect.xSize + (resizePosition.x - offsetX),
          ySize: rect.ySize + (offsetY - resizePosition.y),
        };
      case "bottom-right":
        return {
          ...rect,
          xSize: rect.xSize + (offsetX - resizePosition.x),
          ySize: rect.ySize + (offsetY - resizePosition.y),
        };
      case "top":
        return {
          ...rect,
          y: rect.y + (offsetY - resizePosition.y),
          ySize: rect.ySize + (resizePosition.y - offsetY),
        };
      case "bottom":
        return { ...rect, ySize: rect.ySize + (offsetY - resizePosition.y) };
      case "left":
        return {
          ...rect,
          x: rect.x + (offsetX - resizePosition.x),
          xSize: rect.xSize + (resizePosition.x - offsetX),
        };
      case "right":
        return { ...rect, xSize: rect.xSize + (offsetX - resizePosition.x) };
      default:
        throw new Error("Invalid resize rectangle position");
    }
  });

  return newState;
}
