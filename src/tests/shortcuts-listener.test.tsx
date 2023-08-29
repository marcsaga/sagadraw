import { fireEvent, render, waitFor } from "@testing-library/react";
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

  it("should be able to select all the elements with cmd + A", () => {
    CanvasElementStorage.set([unselectedMockedRect, mockedLine]);

    const { container } = render(<Canvas />);
    const canvas = FireEventsAPI.getCanvasElement(container);

    fireEvent.keyDown(canvas, { key: "a", metaKey: true });
    expect(CanvasElementStorage.get()).toEqual([
      expect.objectContaining({ selected: true, type: "rectangle" }),
      expect.objectContaining({ selected: true, type: "line" }),
    ]);
  });

  it("should be able to delete all the elements with cmd + A + backspace", () => {
    CanvasElementStorage.set([unselectedMockedRect, mockedLine]);

    const { container } = render(<Canvas />);
    const canvas = FireEventsAPI.getCanvasElement(container);

    fireEvent.keyDown(canvas, { key: "a", metaKey: true });
    fireEvent.keyDown(canvas, { key: "Backspace" });
    expect(CanvasElementStorage.get()).toEqual([]);
  });

  it("should be able to copy and paste an element with cmd + C and cmd + V ", async () => {
    CanvasElementStorage.set([selectedMockedRect]);

    const { container } = render(<Canvas />);
    const canvas = FireEventsAPI.getCanvasElement(container);

    fireEvent.keyDown(canvas, { key: "c", metaKey: true });
    fireEvent.keyDown(canvas, { key: "v", metaKey: true });
    await waitFor(() => expect(CanvasElementStorage.get()).toHaveLength(2));
    expect(CanvasElementStorage.get()).toEqual([
      expect.objectContaining({ selected: false, type: "rectangle" }),
      expect.objectContaining({ selected: true, type: "rectangle" }),
    ]);
  });

  it("should be able to copy and paste more than one element with cmd + C and cmd + V ", async () => {
    CanvasElementStorage.set([selectedMockedRect, mockedLine]);

    const { container } = render(<Canvas />);
    const canvas = FireEventsAPI.getCanvasElement(container);

    fireEvent.keyDown(canvas, { key: "c", metaKey: true });
    fireEvent.keyDown(canvas, { key: "v", metaKey: true });
    await waitFor(() => expect(CanvasElementStorage.get()).toHaveLength(4));

    expect(CanvasElementStorage.get()).toEqual([
      expect.objectContaining({ selected: false, type: "rectangle" }),
      expect.objectContaining({ selected: false, type: "line" }),
      expect.objectContaining({ selected: true, type: "rectangle" }),
      expect.objectContaining({ selected: true, type: "line" }),
    ]);
  });

  it("should not be able to copy and paste elements that are no selected with cmd + C and cmd + V ", async () => {
    CanvasElementStorage.set([unselectedMockedRect]);

    const { container } = render(<Canvas />);
    const canvas = FireEventsAPI.getCanvasElement(container);

    fireEvent.keyDown(canvas, { key: "c", metaKey: true });
    fireEvent.keyDown(canvas, { key: "v", metaKey: true });
    await waitFor(() => expect(CanvasElementStorage.get()).toHaveLength(1));

    expect(CanvasElementStorage.get()).toEqual([unselectedMockedRect]);
  });

  it("should be able to cut and paste an element with cmd + X and cmd + V ", async () => {
    CanvasElementStorage.set([selectedMockedRect]);

    const { container } = render(<Canvas />);
    const canvas = FireEventsAPI.getCanvasElement(container);

    fireEvent.keyDown(canvas, { key: "x", metaKey: true });
    await waitFor(() => expect(CanvasElementStorage.get()).toHaveLength(0));
    fireEvent.keyDown(canvas, { key: "v", metaKey: true });
    await waitFor(() => expect(CanvasElementStorage.get()).toHaveLength(1));

    expect(CanvasElementStorage.get()).toEqual([
      expect.objectContaining({ selected: true, type: "rectangle" }),
    ]);
  });

  it("should be able to cut and paste more than one element with cmd + X and cmd + V ", async () => {
    CanvasElementStorage.set([selectedMockedRect, mockedLine]);

    const { container } = render(<Canvas />);
    const canvas = FireEventsAPI.getCanvasElement(container);

    fireEvent.keyDown(canvas, { key: "x", metaKey: true });
    await waitFor(() => expect(CanvasElementStorage.get()).toHaveLength(0));
    fireEvent.keyDown(canvas, { key: "v", metaKey: true });
    await waitFor(() => expect(CanvasElementStorage.get()).toHaveLength(2));

    expect(CanvasElementStorage.get()).toEqual([
      expect.objectContaining({ selected: true, type: "rectangle" }),
      expect.objectContaining({ selected: true, type: "line" }),
    ]);
  });

  it("should not be able to cut and paste elements that are no selected with cmd + X and cmd + V ", async () => {
    CanvasElementStorage.set([unselectedMockedRect]);

    const { container } = render(<Canvas />);
    const canvas = FireEventsAPI.getCanvasElement(container);

    fireEvent.keyDown(canvas, { key: "x", metaKey: true });
    await waitFor(() => expect(CanvasElementStorage.get()).toHaveLength(1));
    fireEvent.keyDown(canvas, { key: "v", metaKey: true });
    await waitFor(() => expect(CanvasElementStorage.get()).toHaveLength(1));

    expect(CanvasElementStorage.get()).toEqual([unselectedMockedRect]);
  });
});
