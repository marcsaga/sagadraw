type ElementType = "rectangle" | "selection";

export type MenuAction = "rectangle";

export interface BaseElement {
  x: number;
  y: number;
  xSize: number;
  ySize: number;
}

export interface TypeElement extends BaseElement {
  type: ElementType;
}

export interface DrawedElement extends TypeElement {
  selected?: boolean;
}

interface RectangleElement extends DrawedElement {
  type: "rectangle";
}

export type Element = BaseElement;
