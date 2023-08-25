import { getResizePositions, standarizeElement } from "./helpers";
import type {
  BaseElement,
  CanvasElement,
  Position,
  ResizeMode,
  RectangleElement,
  ResizeDirection,
} from "./types";

const RESIZE_RECT_SIZE = 8;
export const SHELL_MARGIN = 8;

export function getResizeRectangle(
  element: BaseElement,
  resizePosition: ResizeDirection
): RectangleElement {
  let position: Position;

  const margin = RESIZE_RECT_SIZE / 2;
  const topY = element.y - SHELL_MARGIN - margin;
  const bottomY = element.y + element.ySize + margin;
  const leftX = element.x - SHELL_MARGIN - margin;
  const rightX = element.x + element.xSize + margin;
  const middleX = element.x + element.xSize / 2 - margin;
  const middleY = element.y + element.ySize / 2 - margin;

  switch (resizePosition) {
    case "top-left": {
      position = { x: leftX, y: topY };
      break;
    }
    case "top-right": {
      position = { x: rightX, y: topY };
      break;
    }
    case "bottom-left": {
      position = { x: leftX, y: bottomY };
      break;
    }
    case "bottom-right": {
      position = { x: rightX, y: bottomY };
      break;
    }
    case "top": {
      position = { x: middleX, y: topY };
      break;
    }
    case "bottom": {
      position = { x: middleX, y: bottomY };
      break;
    }
    case "left": {
      position = { x: leftX, y: middleY };
      break;
    }
    case "right": {
      position = { x: rightX, y: middleY };
      break;
    }
    default:
      throw new Error("Invalid resize rectangle position");
  }

  return {
    ...position,
    xSize: RESIZE_RECT_SIZE,
    ySize: RESIZE_RECT_SIZE,
    type: "rectangle",
  };
}

function renderSelectedRect(
  context: CanvasRenderingContext2D,
  element: BaseElement,
  mode: ResizeMode
) {
  context.beginPath();
  context.rect(
    element.x - SHELL_MARGIN,
    element.y - SHELL_MARGIN,
    element.xSize + SHELL_MARGIN * 2,
    element.ySize + SHELL_MARGIN * 2
  );
  context.strokeStyle = "rgba(0, 0, 200)";
  context.lineWidth = 1;
  context.stroke();

  const resizePositions = getResizePositions(mode);
  for (const position of resizePositions) {
    renderRectanble(
      context,
      getResizeRectangle(element, position),
      "resize-rect"
    );
  }
}

export function getSelectedRect(
  state: CanvasElement[]
): { element: BaseElement; mode: ResizeMode } | undefined {
  const selectedElements = state.filter((element) => element.selected);
  if (selectedElements.length === 0) {
    return;
  }
  const minX = Math.min(...selectedElements.map((element) => element.x));
  const minY = Math.min(...selectedElements.map((element) => element.y));
  const maxSizeX = Math.max(
    ...selectedElements.map((element) => element.x + element.xSize)
  );
  const maxSizeY = Math.max(
    ...selectedElements.map((element) => element.y + element.ySize)
  );

  const maxSizeElement = selectedElements.find(
    (element) => element.x + element.xSize === maxSizeX
  )!;
  const maxSizeYElement = selectedElements.find(
    (element) => element.y + element.ySize === maxSizeY
  )!;

  return {
    element: standarizeElement({
      x: minX,
      y: minY,
      xSize: maxSizeElement.x - minX + maxSizeElement.xSize,
      ySize: maxSizeYElement.y - minY + maxSizeYElement.ySize,
    }),
    mode: selectedElements.length === 1 ? "single" : "multiple",
  };
}

function renderRectanble(
  context: CanvasRenderingContext2D,
  rect: BaseElement,
  variant: "drawed" | "selected" | "selection" | "resize-rect"
) {
  context.beginPath();
  context.roundRect(rect.x, rect.y, rect.xSize, rect.ySize, 16);
  context.lineCap = "round";
  switch (variant) {
    case "drawed":
      context.strokeStyle = "black";
      context.lineWidth = 1;
      break;
    case "selected":
      context.strokeStyle = "black";
      context.lineWidth = 2;
      break;
    case "selection":
      context.strokeStyle = "rgba(0, 0, 200)";
      context.fillStyle = "rgba(0, 0, 200, 0.1)";
      context.lineWidth = 1;
      context.fill();
      break;
    case "resize-rect":
      context.strokeStyle = "rgba(0, 0, 200)";
      context.fillStyle = "white";
      context.lineWidth = 1;
      context.fill();
      break;
  }
  context.stroke();
}

export function renderCanvasElements(
  context: CanvasRenderingContext2D,
  state: CanvasElement[],
  selectionElement?: BaseElement
) {
  for (const [, element] of state.entries()) {
    switch (element.type) {
      case "rectangle":
        renderRectanble(
          context,
          element,
          element.selected ? "selected" : "drawed"
        );
        break;
    }
  }

  const selectedRect = getSelectedRect(state);
  if (selectedRect) {
    renderSelectedRect(context, selectedRect.element, selectedRect.mode);
  }

  if (selectionElement) {
    renderRectanble(context, selectionElement, "selection");
  }
}
