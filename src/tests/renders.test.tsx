import { fireEvent, render } from "@testing-library/react";
import { Canvas } from "~/canvas/canvas";
import { CanvasElementStorage } from "~/canvas/storage/canvas-element-storage";
import { mockRectangle } from "./mockers/elements";

const mockedRect = mockRectangle({});

describe("render canvas elements", () => {
  it("should draw a rectangle", () => {
    const { container } = render(<Canvas />);
    const canvas = container.querySelector("#canvas")!;
    const rectangleButton = container.querySelector(".action-button")!;
    fireEvent.click(rectangleButton);

    fireEvent.mouseDown(canvas, {
      clientX: mockedRect.x,
      clientY: mockedRect.y,
    });
    fireEvent.mouseMove(canvas, {
      clientX: mockedRect.x + mockedRect.xSize,
      clientY: mockedRect.y + mockedRect.ySize,
    });
    fireEvent.mouseUp(canvas);

    expect(CanvasElementStorage.get()).toEqual([mockedRect]);
  });
});
