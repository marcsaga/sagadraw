import { getSelectedRect } from "../renders";
import type {
  BaseElement,
  CanvasElement,
  ElementType,
  ResizeMode,
} from "../types";

const ALIGNMENT_LINE_MODES = new Set<ResizeMode>(["single", "multiple"]);
const ALIGNMENT_TYPES = new Set<ElementType>(["rectangle"]);

function filterAlignmentElement(element: CanvasElement) {
  return ALIGNMENT_TYPES.has(element.type) && !element.selected;
}

export function getAlignmentLines(
  elements: CanvasElement[]
): BaseElement[] | undefined {
  const selectedRect = getSelectedRect(elements);
  if (!selectedRect || !ALIGNMENT_LINE_MODES.has(selectedRect.mode)) {
    return;
  }

  const alignmentLines: BaseElement[] = [];

  for (const element of elements.filter(filterAlignmentElement)) {
    if (selectedRect.element.y === element.y) {
      alignmentLines.push({
        x: Math.min(element.x, selectedRect.element.x),
        y: element.y,
        xSize:
          element.xSize +
          selectedRect.element.xSize +
          (selectedRect.element.x ===
          Math.min(element.x, selectedRect.element.x)
            ? element.x - (selectedRect.element.x + selectedRect.element.xSize)
            : selectedRect.element.x - (element.x + element.xSize)),
        ySize: 0,
      });
    }
    if (selectedRect.element.x === element.x) {
      alignmentLines.push({
        x: element.x,
        y: Math.min(element.y, selectedRect.element.y),
        xSize: 0,
        ySize:
          element.ySize +
          selectedRect.element.ySize +
          (selectedRect.element.y ===
          Math.min(element.y, selectedRect.element.y)
            ? element.y - (selectedRect.element.y + selectedRect.element.ySize)
            : selectedRect.element.y - (element.y + element.ySize)),
      });
    }
    if (selectedRect.element.x + selectedRect.element.xSize === element.x) {
      alignmentLines.push({
        x: element.x,
        y: Math.min(element.y, selectedRect.element.y),
        xSize: 0,
        ySize:
          element.ySize +
          selectedRect.element.ySize +
          (selectedRect.element.y ===
          Math.min(element.y, selectedRect.element.y)
            ? element.y - (selectedRect.element.y + selectedRect.element.ySize)
            : selectedRect.element.y - (element.y + element.ySize)),
      });
    }
    if (element.x + element.xSize === selectedRect.element.x) {
      alignmentLines.push({
        x: element.x + element.xSize,
        y: Math.min(element.y, selectedRect.element.y),
        xSize: 0,
        ySize:
          element.ySize +
          selectedRect.element.ySize +
          (selectedRect.element.y ===
          Math.min(element.y, selectedRect.element.y)
            ? element.y - (selectedRect.element.y + selectedRect.element.ySize)
            : selectedRect.element.y - (element.y + element.ySize)),
      });
    }
    if (
      selectedRect.element.x + selectedRect.element.xSize ===
      element.x + element.xSize
    ) {
      alignmentLines.push({
        x: element.x + element.xSize,
        y: Math.min(element.y, selectedRect.element.y),
        xSize: 0,
        ySize:
          element.ySize +
          selectedRect.element.ySize +
          (selectedRect.element.y ===
          Math.min(element.y, selectedRect.element.y)
            ? element.y - (selectedRect.element.y + selectedRect.element.ySize)
            : selectedRect.element.y - (element.y + element.ySize)),
      });
    }
    if (selectedRect.element.y + selectedRect.element.ySize === element.y) {
      alignmentLines.push({
        x: Math.min(element.x, selectedRect.element.x),
        y: element.y,
        xSize:
          element.xSize +
          selectedRect.element.xSize +
          (selectedRect.element.x ===
          Math.min(element.x, selectedRect.element.x)
            ? element.x - (selectedRect.element.x + selectedRect.element.xSize)
            : selectedRect.element.x - (element.x + element.xSize)),
        ySize: 0,
      });
    }
    if (selectedRect.element.y === element.y + element.ySize) {
      alignmentLines.push({
        x: Math.min(element.x, selectedRect.element.x),
        y: element.y + element.ySize,
        xSize:
          element.xSize +
          selectedRect.element.xSize +
          (selectedRect.element.x ===
          Math.min(element.x, selectedRect.element.x)
            ? element.x - (selectedRect.element.x + selectedRect.element.xSize)
            : selectedRect.element.x - (element.x + element.xSize)),
        ySize: 0,
      });
    }
    if (
      selectedRect.element.y + selectedRect.element.ySize ===
      element.y + element.ySize
    ) {
      alignmentLines.push({
        x: Math.min(element.x, selectedRect.element.x),
        y: element.y + element.ySize,
        xSize:
          element.xSize +
          selectedRect.element.xSize +
          (selectedRect.element.x ===
          Math.min(element.x, selectedRect.element.x)
            ? element.x - (selectedRect.element.x + selectedRect.element.xSize)
            : selectedRect.element.x - (element.x + element.xSize)),
        ySize: 0,
      });
    }
  }

  return alignmentLines;
}
