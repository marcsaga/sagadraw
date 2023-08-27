import { fireEvent, render } from "@testing-library/react";
import { Canvas } from "~/canvas/canvas";
import { CanvasElementStorage } from "~/canvas/storage/canvas-element-storage";
import { mockLine, mockRectangle } from "./helpers/mock-elements";
import { FireEventsAPI } from "./helpers/fire-events-api";

const selectedMockedRect = mockRectangle({ selected: true });
const unselectedMockedRect = mockRectangle({ selected: false });
const mockedLine = mockLine({ selected: true });

describe("shortcuts listener", () => {
  afterEach(() => {
    CanvasElementStorage.clear();
  });

  it("should be able to delete a selected element with backspace", () => {
    CanvasElementStorage.set([selectedMockedRect]);

    const { container } = render(<Canvas />);
    const canvas = FireEventsAPI.getCanvasElement(container);

    fireEvent.keyDown(canvas, { key: "Backspace" });
    expect(CanvasElementStorage.get()).toEqual([]);
  });

  it("should not be able to delete an unselected element with backspace", () => {
    CanvasElementStorage.set([unselectedMockedRect]);

    const { container } = render(<Canvas />);
    const canvas = FireEventsAPI.getCanvasElement(container);

    fireEvent.keyDown(canvas, { key: "Backspace" });
    expect(CanvasElementStorage.get()).toEqual([unselectedMockedRect]);
  });

  it("should be able to delete more than one selected element at the same time with backspace", () => {
    CanvasElementStorage.set([selectedMockedRect, selectedMockedRect]);

    const { container } = render(<Canvas />);
    const canvas = FireEventsAPI.getCanvasElement(container);

    fireEvent.keyDown(canvas, { key: "Backspace" });
    expect(CanvasElementStorage.get()).toEqual([]);
  });

  it("should be able to duplicate a selected element with cmd + D", () => {
    CanvasElementStorage.set([selectedMockedRect]);

    const { container } = render(<Canvas />);
    const canvas = FireEventsAPI.getCanvasElement(container);

    fireEvent.keyDown(canvas, { key: "d", metaKey: true });
    expect(CanvasElementStorage.get()).toEqual([
      expect.objectContaining({ selected: false, type: "rectangle" }),
      expect.objectContaining({ selected: true, type: "rectangle" }),
    ]);
  });

  it("should be able to duplicate more than one selected element with cmd + D", () => {
    CanvasElementStorage.set([selectedMockedRect, mockedLine]);

    const { container } = render(<Canvas />);
    const canvas = FireEventsAPI.getCanvasElement(container);

    fireEvent.keyDown(canvas, { key: "d", metaKey: true });
    expect(CanvasElementStorage.get()).toEqual([
      expect.objectContaining({ selected: false, type: "rectangle" }),
      expect.objectContaining({ selected: false, type: "line" }),
      expect.objectContaining({ selected: true, type: "rectangle" }),
      expect.objectContaining({ selected: true, type: "line" }),
    ]);
  });

  it("should not be able to duplicate elements that are no selected with cmd + D", () => {
    CanvasElementStorage.set([unselectedMockedRect]);

    const { container } = render(<Canvas />);
    const canvas = FireEventsAPI.getCanvasElement(container);

    fireEvent.keyDown(canvas, { key: "d", metaKey: true });
    expect(CanvasElementStorage.get()).toEqual([unselectedMockedRect]);
  });
});
