import { fireEvent, render } from "@testing-library/react";
import { Canvas } from "~/canvas/canvas";
import { CanvasElementStorage } from "~/canvas/storage/canvas-element-storage";
import { mockRectangle } from "./helpers/mock-elements";
import { FireEventsAPI } from "./helpers/fire-events-api";

const selectedMockedRect = mockRectangle({ selected: true });
const unselectedMockedRect = mockRectangle({ selected: false });

describe("delete listener", () => {
  afterEach(() => {
    CanvasElementStorage.clear();
  });

  it("should be able to delete a selected element", () => {
    CanvasElementStorage.set([selectedMockedRect]);

    const { container } = render(<Canvas />);
    const canvas = FireEventsAPI.getCanvasElement(container);

    fireEvent.keyDown(canvas, { key: "Backspace" });
    expect(CanvasElementStorage.get()).toEqual([]);
  });

  it("should not be able to delete an unselected element", () => {
    CanvasElementStorage.set([unselectedMockedRect]);

    const { container } = render(<Canvas />);
    const canvas = FireEventsAPI.getCanvasElement(container);

    fireEvent.keyDown(canvas, { key: "Backspace" });
    expect(CanvasElementStorage.get()).toEqual([unselectedMockedRect]);
  });

  it("should be able to delete more than one selected element at the same time", () => {
    CanvasElementStorage.set([selectedMockedRect, selectedMockedRect]);

    const { container } = render(<Canvas />);
    const canvas = FireEventsAPI.getCanvasElement(container);

    fireEvent.keyDown(canvas, { key: "Backspace" });
    expect(CanvasElementStorage.get()).toEqual([]);
  });
});
