import { fireEvent } from "@testing-library/react";
import type {
  LineElement,
  Position,
  RectangleElement,
  TextElement,
} from "~/canvas/types";

export class FireEventsAPI {
  static getCanvasElement(container: Element) {
    return container.querySelector("#canvas")!;
  }

  static triggerClick(container: Element, position: Position) {
    const canvas = FireEventsAPI.getCanvasElement(container);
    const mousePosition = { clientX: position.x, clientY: position.y };
    fireEvent.mouseDown(canvas, mousePosition);
    fireEvent.mouseUp(canvas);
    fireEvent.click(canvas, mousePosition);
  }

  static triggerDoubleClick(container: Element, position: Position) {
    const mousePosition = { clientX: position.x, clientY: position.y };
    const canvas = FireEventsAPI.getCanvasElement(container);
    fireEvent.mouseDown(canvas, mousePosition);
    fireEvent.mouseUp(canvas);
    fireEvent.click(canvas, mousePosition);
    fireEvent.mouseDown(canvas, mousePosition);
    fireEvent.mouseUp(canvas);
    fireEvent.doubleClick(canvas, mousePosition);
  }

  static createRectangle(container: Element, rectangle: RectangleElement) {
    const rectangleButton = container.querySelector("#rectangle")!;
    fireEvent.click(rectangleButton);

    FireEventsAPI.dragMouse(container, rectangle, {
      x: rectangle.x + rectangle.xSize,
      y: rectangle.y + rectangle.ySize,
    });
  }

  static createLine(container: Element, line: LineElement) {
    const rectangleButton = container.querySelector("#line")!;
    fireEvent.click(rectangleButton);

    FireEventsAPI.dragMouse(container, line, {
      x: line.x + line.xSize,
      y: line.y + line.ySize,
    });
  }

  static createText(container: Element, element: TextElement) {
    FireEventsAPI.triggerDoubleClick(container, element);
    const textEditor = container.querySelector("#canvas-text-editor")!;
    fireEvent.input(textEditor, {
      target: { innerText: element.text, innerHTML: element.text },
    });
    const canvas = FireEventsAPI.getCanvasElement(container);
    fireEvent.mouseDown(canvas, {
      clientX: element.x + element.xSize * 2,
      clientY: element.y + element.ySize * 2,
    });
  }

  static dragMouse(container: Element, from: Position, to: Position) {
    const canvas = FireEventsAPI.getCanvasElement(container);
    fireEvent.mouseDown(canvas, { clientX: from.x, clientY: from.y });
    fireEvent.mouseMove(canvas, { clientX: to.x, clientY: to.y });
    fireEvent.mouseUp(canvas);
  }
}
