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
  type: ElementType;
  selected?: boolean;
}

export interface RectangleElement extends DrawedElement {
  type: "rectangle";
}

export interface LineElement extends DrawedElement {
  type: "line";
}

export interface TextElement extends DrawedElement {
  type: "text";
  text: string;
  fontSize: number;
  isEditing?: boolean;
}

export type CanvasElement = RectangleElement | TextElement | LineElement;

export type ResizeDirection =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "any";

export type ResizableBox = "single" | "multiple" | "none";

export type ResizeMode = ResizableBox | "line";
