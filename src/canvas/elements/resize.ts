import { getSelectedRect } from "../renders";
import type {
  CanvasElement,
  Position,
  ResizeDirection,
  BaseElement,
} from "../types";

function resizeSingleElement(
  { nativeEvent: { offsetX, offsetY } }: React.MouseEvent,
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
          x: rect.x + (offsetX - position.x),
          y: rect.y + (offsetY - position.y),
          xSize: rect.xSize + (position.x - offsetX),
          ySize: rect.ySize + (position.y - offsetY),
        };
      case "top-right":
        return {
          ...rect,
          y: rect.y + (offsetY - position.y),
          xSize: rect.xSize + (offsetX - position.x),
          ySize: rect.ySize + (position.y - offsetY),
        };
      case "bottom-left":
        return {
          ...rect,
          x: rect.x + (offsetX - position.x),
          xSize: rect.xSize + (position.x - offsetX),
          ySize: rect.ySize + (offsetY - position.y),
        };
      case "bottom-right":
        return {
          ...rect,
          xSize: rect.xSize + (offsetX - position.x),
          ySize: rect.ySize + (offsetY - position.y),
        };
      case "top":
        return {
          ...rect,
          y: rect.y + (offsetY - position.y),
          ySize: rect.ySize + (position.y - offsetY),
        };
      case "bottom":
        return { ...rect, ySize: rect.ySize + (offsetY - position.y) };
      case "left":
        return {
          ...rect,
          x: rect.x + (offsetX - position.x),
          xSize: rect.xSize + (position.x - offsetX),
        };
      case "right":
        return { ...rect, xSize: rect.xSize + (offsetX - position.x) };
      default:
        throw new Error("Invalid resize rectangle position");
    }
  });

  return newState;
}

function getRelativePosition(container: BaseElement, element: BaseElement) {
  return { x: element.x - container.x, y: element.y - container.y };
}

function resizeMultipleElements(
  { nativeEvent: { offsetY } }: React.MouseEvent,
  state: CanvasElement[],
  resizeState: ResizeState
): CanvasElement[] {
  const selectedRect = getSelectedRect(state);
  if (!selectedRect) return state;

  const newState = state.map((rect) => {
    if (!rect.selected) return rect;
    const { direction, position } = resizeState;
    const diff = 1 + (offsetY - position.y) / 100;
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
  event: React.MouseEvent,
  state: CanvasElement[],
  resizeState: ResizeState
): CanvasElement[] {
  const selectedRect = getSelectedRect(state);
  if (!selectedRect) return state;

  return selectedRect.mode === "single"
    ? resizeSingleElement(event, state, resizeState)
    : resizeMultipleElements(event, state, resizeState);
}
