import { getResizeRectangle, getSelectedRect } from "./renders";
import type {
  BaseElement,
  CanvasElement,
  ResizeRectanglePosition,
  ResizeMode,
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

const SINGLE_ELEMENT_RESIZE_POSITIONS = new Set<ResizeRectanglePosition>([
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
  "top",
  "left",
  "right",
  "bottom",
]);

const MULTIPLE_ELEMENTS_RESIZE_POSITIONS = new Set<ResizeRectanglePosition>([
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
]);

export const getResizePositions = (mode: ResizeMode) =>
  mode === "single"
    ? SINGLE_ELEMENT_RESIZE_POSITIONS
    : MULTIPLE_ELEMENTS_RESIZE_POSITIONS;

export function getResizeRectangles(
  element: BaseElement,
  mode: ResizeMode
): [ResizeRectanglePosition, BaseElement][] {
  return Array.from(getResizePositions(mode)).map((position) => [
    position,
    getResizeRectangle(element, position),
  ]);
}

export function checkSelectedElements(
  state: CanvasElement[],
  selectionElement?: BaseElement
): { updated: boolean; newState: CanvasElement[] } | undefined {
  if (!selectionElement) return;
  let updated = false;
  const selectedRect = getSelectedRect(state);
  let resizeRectangleCollided = false;
  if (selectedRect) {
    resizeRectangleCollided = getResizeRectangles(
      selectedRect.element,
      selectedRect.mode
    ).some(([, rectable]) => hasCollided(rectable, selectionElement));
  }
  const newState = [...state];
  for (const [index, rect] of newState.entries()) {
    const rectCollided = hasCollided(selectionElement, rect);
    updated =
      updated || (rectCollided !== rect.selected && !resizeRectangleCollided);
    newState[index]!.selected = rectCollided || resizeRectangleCollided;
  }

  return { updated, newState };
}
