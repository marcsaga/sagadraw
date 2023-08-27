import { fireEvent, render } from "@testing-library/react";
import { Canvas } from "../canvas/canvas";
import { CanvasElementStorage } from "~/canvas/storage/canvas-element-storage";

describe("text element", () => {
  afterEach(() => {
    CanvasElementStorage.clear();
  });

  it("should create text element by double click in the canvas", () => {
    const { container, getAllByRole } = render(<Canvas />);
    const canvas = container.querySelector("#canvas")!;

    fireEvent.doubleClick(canvas, { clientX: 100, clientY: 100 });
    const text = getAllByRole("textbox")[0]!;
    fireEvent.change(text, { target: { value: "Hello World" } });

    fireEvent.mouseDown(canvas, { clientX: 300, clientY: 300 });

    const elements = CanvasElementStorage.get();
    expect(elements).toEqual([
      expect.objectContaining({ text: "Hello World" }),
    ]);
  });

  it("should be possible to edit a text element by doble clicking on top", () => {
    const { container, getAllByRole } = render(<Canvas />);
    const canvas = container.querySelector("#canvas")!;

    fireEvent.doubleClick(canvas, { clientX: 100, clientY: 100 });
    const firstText = getAllByRole("textbox")[0]!;
    fireEvent.change(firstText, { target: { value: "Hello World" } });
    fireEvent.mouseDown(canvas, { clientX: 300, clientY: 300 });

    fireEvent.doubleClick(canvas, { clientX: 100, clientY: 100 });
    const secondText = getAllByRole("textbox")[0]!;
    fireEvent.change(secondText, { target: { value: "Bye bye World" } });
    fireEvent.mouseDown(canvas, { clientX: 300, clientY: 300 });

    const elements = CanvasElementStorage.get();
    expect(elements).toEqual([
      expect.objectContaining({ text: "Bye bye World" }),
    ]);
  });
});
