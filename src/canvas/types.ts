export type ElementType = "rectangle" | "text";

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

export interface TextElement extends DrawedElement {
  type: "text";
  text: string;
  fontSize: number;
  isEditing?: boolean;
}

export type CanvasElement = RectangleElement | TextElement;

export type ResizeDirection =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "top"
  | "bottom"
  | "left"
  | "right";

export type ResizeMode = "single" | "multiple" | "text";
