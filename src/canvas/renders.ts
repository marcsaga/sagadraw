import { getResizePositions, standarizeElement } from "./helpers";
import type {
  BaseElement,
  CanvasElement,
  Position,
  ResizeMode,
  RectangleElement,
  ResizeDirection,
  TextElement,
  LineElement,
  ResizableBox,
  ElementType,
  ResizeLineDirection,
} from "./types";

const RESIZE_RECT_SIZE = 8;
export const SHELL_MARGIN = 6;

export function getLineResizeRectagles(
  element: LineElement
): [ResizeLineDirection, Omit<RectangleElement, "id">][] {
  const margin = RESIZE_RECT_SIZE / 2;
  const topX = element.x - margin;
  const topY = element.y - margin;
  const bottomX = element.x + element.xSize - margin;
  const bottomY = element.y + element.ySize - margin;

  return [
    [
      "line-start",
      {
        x: topX,
        y: topY,
        xSize: RESIZE_RECT_SIZE,
        ySize: RESIZE_RECT_SIZE,
        type: "rectangle",
      },
    ],
    [
      "line-end",
      {
        x: bottomX,
        y: bottomY,
        xSize: RESIZE_RECT_SIZE,
        ySize: RESIZE_RECT_SIZE,
        type: "rectangle",
      },
    ],
  ];
}

export function getResizeRectangle(
  element: BaseElement,
  resizePosition: ResizeDirection
): Omit<RectangleElement, "id"> {
  let position: Position;

  const halfMargin = RESIZE_RECT_SIZE / 2;
  const quarterMargin = RESIZE_RECT_SIZE / 4;

  const topY = element.y - SHELL_MARGIN - halfMargin;
  const bottomY = element.y + element.ySize + quarterMargin;
  const leftX = element.x - SHELL_MARGIN - halfMargin;
  const rightX = element.x + element.xSize + quarterMargin;
  const middleX = element.x + element.xSize / 2 - halfMargin;
  const middleY = element.y + element.ySize / 2 - halfMargin;

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
  mode: ResizableBox
) {
  const rect = standarizeElement(element);
  context.beginPath();
  context.roundRect(
    rect.x - SHELL_MARGIN,
    rect.y - SHELL_MARGIN,
    rect.xSize + SHELL_MARGIN * 2,
    rect.ySize + SHELL_MARGIN * 2,
    4
  );
  context.strokeStyle = "rgba(0, 0, 200)";
  context.lineWidth = 1;
  context.stroke();

  const resizePositions = getResizePositions(mode);
  for (const position of resizePositions) {
    renderRectanble(context, getResizeRectangle(rect, position), "resize");
  }
}

function renderSelectedLine(
  context: CanvasRenderingContext2D,
  element: LineElement,
  opts?: { resizable?: boolean }
) {
  context.beginPath();
  context.moveTo(element.x, element.y);
  context.lineTo(element.x + element.xSize, element.y + element.ySize);
  context.strokeStyle = "rgba(0, 0, 200)";
  context.stroke();

  if (opts?.resizable) {
    for (const [direction, rectangle] of getLineResizeRectagles(element)) {
      renderRectanble(
        context,
        rectangle,
        element.resizeDirection === direction ? "resize-select" : "resize"
      );
    }
  }
}

const singleSelectedMode: Record<ElementType, ResizeMode> = {
  text: "none",
  line: "line",
  rectangle: "single",
};

export function getSelectedRect(
  state: CanvasElement[]
): { element: BaseElement; mode: ResizeMode } | undefined {
  const selectedElements = state.filter((element) => element.selected);
  if (selectedElements.length === 0) {
    return;
  }
  if (selectedElements.length === 1) {
    const element = selectedElements[0]!;
    return { element: element, mode: singleSelectedMode[element.type] };
  }

  const minX = Math.min(
    ...selectedElements.map((element) =>
      Math.min(element.x, element.x + element.xSize)
    )
  );
  const minY = Math.min(
    ...selectedElements.map((element) =>
      Math.min(element.y, element.y + element.ySize)
    )
  );
  const maxX = Math.max(
    ...selectedElements.map((element) =>
      Math.max(element.x, element.x + element.xSize)
    )
  );
  const maxY = Math.max(
    ...selectedElements.map((element) =>
      Math.max(element.y, element.y + element.ySize)
    )
  );

  return {
    element: standarizeElement({
      x: minX,
      y: minY,
      xSize: maxX - minX,
      ySize: maxY - minY,
    }),
    mode: "multiple",
  };
}

function renderRectanble(
  context: CanvasRenderingContext2D,
  rect: BaseElement,
  variant: "drawed" | "selected" | "selection" | "resize" | "resize-select"
) {
  context.beginPath();
  context.roundRect(rect.x, rect.y, rect.xSize, rect.ySize, 8);
  context.lineCap = "round";
  switch (variant) {
    case "drawed":
      context.strokeStyle = "black";
      context.fillStyle = "transparent";
      context.lineWidth = 1;
      break;
    case "selected":
      context.strokeStyle = "black";
      context.fillStyle = "transparent";
      context.lineWidth = 2;
      break;
    case "selection":
      context.strokeStyle = "rgba(0, 0, 200)";
      context.fillStyle = "rgba(0, 0, 200, 0.1)";
      context.lineWidth = 1;
      context.fill();
      break;
    case "resize":
      context.strokeStyle = "rgba(0, 0, 200)";
      context.fillStyle = "white";
      context.lineWidth = 1;
      context.fill();
      break;
    case "resize-select":
      context.strokeStyle = "rgba(0, 0, 200)";
      context.fillStyle = "rgba(0, 0, 200)";
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
  const selectedRect = getSelectedRect(state);
  for (const [, element] of state.entries()) {
    switch (element.type) {
      case "rectangle":
        renderRectanble(context, element, "drawed");
        if (element.selected && selectedRect?.mode === "multiple") {
          renderSelectedRect(context, element, "none");
        }
        break;
      case "text":
        renderText(context, element);
        if (element.selected && selectedRect?.mode === "multiple") {
          renderSelectedRect(context, element, "none");
        }
        break;
      case "line":
        renderLine(context, element);
        if (element.selected) {
          renderSelectedLine(context, element, {
            resizable: selectedRect?.mode !== "multiple",
          });
        }
        break;
    }
  }

  if (selectedRect && selectedRect.mode !== "line") {
    renderSelectedRect(context, selectedRect.element, selectedRect.mode);
  }

  if (selectionElement) {
    renderRectanble(context, selectionElement, "selection");
  }
}

export function renderText(
  context: CanvasRenderingContext2D,
  element: TextElement
) {
  context.beginPath();
  context.fillStyle = "black";
  context.font = element.fontSize + "px sans-serif";
  const lines = element.text.split("\n");
  context.textBaseline = "top";

  let y = element.y;
  for (const line of lines) {
    context.fillText(line, element.x, y);
    y += 24;
  }
}

export function renderLine(
  context: CanvasRenderingContext2D,
  element: LineElement
) {
  context.beginPath();
  context.moveTo(element.x, element.y);
  context.lineTo(element.x + element.xSize, element.y + element.ySize);
  context.stroke();
}
