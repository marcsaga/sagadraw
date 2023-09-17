export type ElementType = "rectangle" | "text" | "line";

export interface Position {
  x: number;
  y: number;
}

export interface BaseElement extends Position {
  xSize: number;
  ySize: number;
}

export interface DrawedElement extends BaseElement {
  id: string;
  type: ElementType;
  selected: boolean;
}

export interface RectangleElement extends DrawedElement {
  type: "rectangle";
}

export interface LineElement extends DrawedElement {
  type: "line";
  resizeDirection?: ResizeLineDirection;
  hasEndArrow?: boolean;
  startBindingID?: string;
  endBindingID?: string;
}

export interface TextElement extends DrawedElement {
  type: "text";
  text: string;
  fontSize: number;
  fontFamily: string;
}

export type CanvasElement = RectangleElement | TextElement | LineElement;

export type ResizeLineDirection = "line-start" | "line-end";

export type ResizeRectangleDirection =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "top"
  | "bottom"
  | "left"
  | "right";

export type ResizeDirection = ResizeLineDirection | ResizeRectangleDirection;

export type ResizableBox = "single" | "multiple" | "none" | "text";

export type ResizeMode = ResizableBox | "line";
