import type { BaseElement, CanvasElement } from "./types";

function renderRectanble(
  context: CanvasRenderingContext2D,
  rect: BaseElement,
  state: "drawed" | "selected" | "selection"
) {
  context.beginPath();
  context.roundRect(rect.x, rect.y, rect.xSize, rect.ySize, 5);
  context.lineCap = "round";
  switch (state) {
    case "drawed":
      context.strokeStyle = "black";
      context.lineWidth = 1;
      break;
    case "selected":
      context.strokeStyle = "black";
      context.lineWidth = 2;
      break;
    case "selection":
      context.fillStyle = "rgba(0, 0, 200, 0.1)";
      context.strokeStyle = "rgba(0, 0, 200)";
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
  for (const [, rect] of state.entries()) {
    renderRectanble(context, rect, rect.selected ? "selected" : "drawed");
  }
  if (selectionElement) {
    renderRectanble(context, selectionElement, "selection");
  }
}
