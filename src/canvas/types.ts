type ElementType = "rectangle" | "selection";

export interface BaseElement {
  x: number;
  y: number;
  xSize: number;
  ySize: number;
}

interface DrawedElement extends BaseElement {
  type: ElementType;
  selected?: boolean;
}

interface RectangleElement extends DrawedElement {
  type: "rectangle";
}

export type CanvasElement = RectangleElement;
