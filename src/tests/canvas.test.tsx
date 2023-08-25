import { fireEvent, render } from "@testing-library/react";
import { Canvas } from "../canvas/canvas";
import { CanvasElementStorage } from "~/canvas/storage/canvas-element-storage";

describe("Test", () => {
  it("should render the canvas", () => {
    const { container } = render(<Canvas />);
    expect(container.querySelector("#canvas")).toBeInTheDocument();
  });

  it("should render the actions menu", () => {
    const { container } = render(<Canvas />);
    expect(container.querySelector("#actions-menu")).toBeInTheDocument();
  });

  it("should render the rectangle button", () => {
    const { container } = render(<Canvas />);
    expect(
      container.querySelector("#actions-menu-rectangle")
    ).toBeInTheDocument();
  });

  it.only("should draw a rectangle", () => {
    const { container } = render(<Canvas />);
    const canvas = container.querySelector("#canvas")!;
    const rectangleButton = container.querySelector("#actions-menu-rectangle")!;
    fireEvent.click(rectangleButton);

    fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(canvas, { clientX: 200, clientY: 200 });
    fireEvent.mouseUp(canvas);

    const elements = CanvasElementStorage.get();

    expect(elements).toEqual([
      { type: "rectangle", x: 100, y: 100, xSize: 100, ySize: 100 },
    ]);
  });
});
