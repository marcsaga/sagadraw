import { hasCollided } from "./elements/collisions";
import {
  getLineResizeRectagles,
  getResizeRectangle,
  getSelectedRect,
} from "./renders";
import type {
  BaseElement,
  CanvasElement,
  LineElement,
  ResizeDirection,
  ResizeMode,
} from "./types";

export function getCanvasContext(
  element?: HTMLCanvasElement | null
): CanvasRenderingContext2D | undefined {
  if (!element) return;
  const context = element.getContext("2d");
  if (!context) return;
  return context;
}

export function setUpCanvas(
  element?: HTMLCanvasElement | null
): CanvasRenderingContext2D | undefined {
  if (!element) return;
  element.width = window.innerWidth * 2;
  element.height = window.innerHeight * 2;
  element.style.width = `${window.innerWidth}px`;
  element.style.height = `${window.innerHeight}px`;

  const context = getCanvasContext(element);
  context?.scale(2, 2);

  return context;
}

export function standarizeElement<T extends BaseElement>(element: T): T {
  return {
    ...element,
    x: element.xSize < 0 ? element.x + element.xSize : element.x,
    y: element.ySize < 0 ? element.y + element.ySize : element.y,
    xSize: Math.abs(element.xSize),
    ySize: Math.abs(element.ySize),
  };
}

const SINGLE_ELEMENT_RESIZE_POSITIONS = new Set<ResizeDirection>([
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
  "top",
  "left",
  "right",
  "bottom",
]);

const MULTIPLE_ELEMENTS_RESIZE_POSITIONS = new Set<ResizeDirection>([
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
]);

const NONE_ELEMENT_RESIZE_POSITIONS = new Set<ResizeDirection>([]);

type ResizableBox = "single" | "multiple" | "none" | "text";

const resizePositionsDictionary: Record<ResizableBox, Set<ResizeDirection>> = {
  single: SINGLE_ELEMENT_RESIZE_POSITIONS,
  none: NONE_ELEMENT_RESIZE_POSITIONS,
  multiple: MULTIPLE_ELEMENTS_RESIZE_POSITIONS,
  text: NONE_ELEMENT_RESIZE_POSITIONS,
};

export const getResizePositions = (mode: ResizableBox) => {
  return resizePositionsDictionary[mode];
};

const getRectResizeRectangles = (
  element: BaseElement,
  mode: ResizableBox
): [ResizeDirection, BaseElement][] => {
  const positions = getResizePositions(mode);
  return Array.from(positions).map((position) => [
    position,
    getResizeRectangle(element, position),
  ]);
};

export function getResizeRectangles(
  element: BaseElement,
  mode: ResizeMode
): [ResizeDirection, BaseElement][] {
  if (mode === "line") {
    return getLineResizeRectagles(element as LineElement);
  }
  return getRectResizeRectangles(element, mode);
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
  const newState = state.map((element) => {
    const rectCollided = hasCollided(selectionElement, element);
    updated = updated || rectCollided !== element.selected;
    return { ...element, selected: rectCollided || resizeRectangleCollided };
  });

  return { updated, newState };
}

export function unSelectAll(state: CanvasElement[]): CanvasElement[] {
  return state.map((element) => ({ ...element, selected: false }));
}

export function standarizeResizingElements(state: CanvasElement[]) {
  return state.map((element) =>
    standarizeElement(
      "resizeDirection" in element
        ? element
        : { ...element, resizeDirection: undefined }
    )
  );
}

export function hasMinimumSize(element: BaseElement): boolean {
  return Math.abs(element.xSize) > 2 || Math.abs(element.ySize) > 2;
}
