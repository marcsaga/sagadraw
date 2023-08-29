import { getSelectedRect } from "../renders";
import type {
  CanvasElement,
  Position,
  ResizeDirection,
  BaseElement,
} from "../types";

function resizeSingleElement(
  mousePosition: Position,
  state: CanvasElement[],
  resizeState: ResizeState
): CanvasElement[] {
  const newState = state.map((rect) => {
    if (!rect.selected) return rect;
    const { direction, position } = resizeState;
    switch (direction) {
      case "top-left":
        return {
          ...rect,
          x: rect.x + (mousePosition.x - position.x),
          y: rect.y + (mousePosition.y - position.y),
          xSize: rect.xSize + (position.x - mousePosition.x),
          ySize: rect.ySize + (position.y - mousePosition.y),
        };
      case "top-right":
        return {
          ...rect,
          y: rect.y + (mousePosition.y - position.y),
          xSize: rect.xSize + (mousePosition.x - position.x),
          ySize: rect.ySize + (position.y - mousePosition.y),
        };
      case "bottom-left":
        return {
          ...rect,
          x: rect.x + (mousePosition.x - position.x),
          xSize: rect.xSize + (position.x - mousePosition.x),
          ySize: rect.ySize + (mousePosition.y - position.y),
        };
      case "bottom-right":
        return {
          ...rect,
          xSize: rect.xSize + (mousePosition.x - position.x),
          ySize: rect.ySize + (mousePosition.y - position.y),
        };
      case "top":
        return {
          ...rect,
          y: rect.y + (mousePosition.y - position.y),
          ySize: rect.ySize + (position.y - mousePosition.y),
        };
      case "bottom":
        return { ...rect, ySize: rect.ySize + (mousePosition.y - position.y) };
      case "left":
        return {
          ...rect,
          x: rect.x + (mousePosition.x - position.x),
          xSize: rect.xSize + (position.x - mousePosition.x),
        };
      case "right":
        return { ...rect, xSize: rect.xSize + (mousePosition.x - position.x) };
      case "line-start": {
        return {
          ...rect,
          x: rect.x + (mousePosition.x - position.x),
          y: rect.y + (mousePosition.y - position.y),
          xSize: rect.xSize + (position.x - mousePosition.x),
          ySize: rect.ySize + (position.y - mousePosition.y),
        };
      }
      case "line-end": {
        return {
          ...rect,
          xSize: rect.xSize + (mousePosition.x - position.x),
          ySize: rect.ySize + (mousePosition.y - position.y),
        };
      }
      default:
        throw new Error("Invalid resize rectangle position");
    }
  });

  return newState;
}

export function getRelativePosition(
  container: BaseElement,
  element: BaseElement
) {
  return { x: element.x - container.x, y: element.y - container.y };
}

const MULTIPLE_RESIZE_VELOCITY = 300;

function resizeMultipleElements(
  mousePosition: Position,
  state: CanvasElement[],
  resizeState: ResizeState
): CanvasElement[] {
  const selectedRect = getSelectedRect(state);
  if (!selectedRect) return state;

  const newState = state.map((rect) => {
    if (!rect.selected) return rect;
    const { direction, position } = resizeState;
    const diff = 1 + (mousePosition.y - position.y) / MULTIPLE_RESIZE_VELOCITY;
    const inverseDiff = 1 / diff;
    const relativePosition = getRelativePosition(selectedRect.element, rect);
    switch (direction) {
      case "bottom-right":
        return {
          ...rect,
          x: selectedRect.element.x + relativePosition.x * diff,
          y: selectedRect.element.y + relativePosition.y * diff,
          xSize: rect.xSize * diff,
          ySize: rect.ySize * diff,
        };
      case "top-right":
        const deltaYTR = selectedRect.element.ySize * (1 - inverseDiff);
        return {
          ...rect,
          x: selectedRect.element.x + relativePosition.x * inverseDiff,
          y:
            selectedRect.element.y +
            deltaYTR +
            relativePosition.y * inverseDiff,
          xSize: rect.xSize * inverseDiff,
          ySize: rect.ySize * inverseDiff,
        };

      case "bottom-left":
        const deltaXBL = selectedRect.element.xSize * (1 - diff);
        return {
          ...rect,
          x: selectedRect.element.x + deltaXBL + relativePosition.x * diff,
          y: selectedRect.element.y + relativePosition.y * diff,
          xSize: rect.xSize * diff,
          ySize: rect.ySize * diff,
        };

      case "top-left":
        const deltaXTL = selectedRect.element.xSize * (1 - inverseDiff);
        const deltaYTL = selectedRect.element.ySize * (1 - inverseDiff);
        return {
          ...rect,
          x:
            selectedRect.element.x +
            deltaXTL +
            relativePosition.x * inverseDiff,
          y:
            selectedRect.element.y +
            deltaYTL +
            relativePosition.y * inverseDiff,
          xSize: rect.xSize * inverseDiff,
          ySize: rect.ySize * inverseDiff,
        };

      default:
        throw new Error("Invalid resize rectangle position");
    }
  });

  return newState;
}

export interface ResizeState {
  position: Position;
  direction: ResizeDirection;
}

export function resize(
  mousePosition: Position,
  state: CanvasElement[],
  resizeState: ResizeState
): CanvasElement[] {
  const selectedRect = getSelectedRect(state);
  if (!selectedRect) return state;

  return selectedRect.mode === "multiple"
    ? resizeMultipleElements(mousePosition, state, resizeState)
    : resizeSingleElement(mousePosition, state, resizeState);
}

export function resizeDrawingRectangle<T extends BaseElement>(
  element: T,
  mousePosition: Position
): T {
  return {
    ...element,
    xSize: mousePosition.x - element.x,
    ySize: mousePosition.y - element.y,
  };
}
