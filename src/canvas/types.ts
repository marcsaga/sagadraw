type ElementType = "rectangle" | "selection";

export interface Position {
  x: number;
  y: number;
}

export interface BaseElement extends Position {
  xSize: number;
  ySize: number;
}

interface DrawedElement extends BaseElement {
  type: ElementType;
  selected?: boolean;
}

export interface RectangleElement extends DrawedElement {
  type: "rectangle";
}

export type CanvasElement = RectangleElement;

export type ResizeRectanglePosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "top"
  | "bottom"
  | "left"
  | "right";

export type ResizeMode = "single" | "multiple";
