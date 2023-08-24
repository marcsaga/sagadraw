import { getSelectedRect } from "../renders";
import type {
  CanvasElement,
  Position,
  ResizeRectanglePosition,
  BaseElement,
} from "../types";

function resizeSingleElement(
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

function getRelativePosition(container: BaseElement, element: BaseElement) {
  return { x: element.x - container.x, y: element.y - container.y };
}

function resizeMultipleElements(
  { nativeEvent: { offsetY } }: React.MouseEvent,
  state: CanvasElement[],
  resizePosition: Position & { position: ResizeRectanglePosition }
): CanvasElement[] {
  const selectedRect = getSelectedRect(state);
  if (!selectedRect) return state;

  const newState = state.map((rect) => {
    if (!rect.selected) return rect;
    const diff = 1 + (offsetY - resizePosition.y) / 100;
    const inverseDiff = 1 / diff;
    const relativePosition = getRelativePosition(selectedRect.element, rect);
    switch (resizePosition.position) {
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

export function resize(
  event: React.MouseEvent,
  state: CanvasElement[],
  resizePosition: Position & { position: ResizeRectanglePosition }
): CanvasElement[] {
  const selectedRect = getSelectedRect(state);
  if (!selectedRect) return state;

  return selectedRect.mode === "single"
    ? resizeSingleElement(event, state, resizePosition)
    : resizeMultipleElements(event, state, resizePosition);
}
