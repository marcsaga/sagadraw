import { fireEvent } from "@testing-library/react";
import type { Position, RectangleElement, TextElement } from "~/canvas/types";

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
    const rectangleButton = container.querySelector(".action-button")!;
    fireEvent.click(rectangleButton);

    const canvas = FireEventsAPI.getCanvasElement(container);
    fireEvent.mouseDown(canvas, {
      clientX: rectangle.x,
      clientY: rectangle.y,
    });
    fireEvent.mouseMove(canvas, {
      clientX: rectangle.x + rectangle.xSize,
      clientY: rectangle.y + rectangle.ySize,
    });
    fireEvent.mouseUp(canvas);
  }

  static createText(
    container: Element,
    text: TextElement,
    getAllByRole: (role: string) => HTMLElement[]
  ) {
    const canvas = FireEventsAPI.getCanvasElement(container);
    FireEventsAPI.triggerDoubleClick(container, text);
    const textarea = getAllByRole("textbox")[0]!;
    fireEvent.change(textarea, { target: { value: text.text } });
    fireEvent.mouseDown(canvas, {
      clientX: text.x + text.xSize * 2,
      clientY: text.y + text.ySize * 2,
    });
  }

  static dragMouse(container: Element, from: Position, to: Position) {
    const canvas = FireEventsAPI.getCanvasElement(container);
    fireEvent.mouseDown(canvas, { clientX: from.x, clientY: from.y });
    fireEvent.mouseMove(canvas, { clientX: to.x, clientY: to.y });
    fireEvent.mouseUp(canvas);
  }
}
