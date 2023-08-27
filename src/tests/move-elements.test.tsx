import { render } from "@testing-library/react";
import { Canvas } from "~/canvas/canvas";
import { CanvasElementStorage } from "~/canvas/storage/canvas-element-storage";
import { mockRectangle } from "./helpers/mock-elements";
import { FireEventsAPI } from "./helpers/fire-events-api";

const mockedRect = mockRectangle({ selected: false });
const mockedRect2 = mockRectangle({ selected: false });

describe("move canvas elements", () => {
  beforeEach(() => {
    CanvasElementStorage.set([mockedRect, mockedRect2]);
  });
  afterEach(() => {
    CanvasElementStorage.clear();
  });

  it("should be able to move a rectangle", () => {
    const { container } = render(<Canvas />);

    FireEventsAPI.dragMouse(
      container,
      {
        x: mockedRect.x + mockedRect.xSize / 2,
        y: mockedRect.y + mockedRect.ySize / 2,
      },
      { x: mockedRect.x + mockedRect.xSize, y: mockedRect.y + mockedRect.ySize }
    );

    const elements = CanvasElementStorage.get()!;
    expect(elements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ...mockedRect,
          x: mockedRect.x + mockedRect.xSize / 2,
          y: mockedRect.y + mockedRect.xSize / 2,
          selected: true,
        }),
      ])
    );
  });

  it("should be able to move more than one selected element at the same time", () => {
    const { container } = render(<Canvas />);

    FireEventsAPI.dragMouse(
      container,
      {
        x: mockedRect.x + mockedRect.xSize / 2,
        y: mockedRect.y + mockedRect.ySize / 2,
      },
      { x: mockedRect.x + mockedRect.xSize, y: mockedRect.y + mockedRect.ySize }
    );

    const elements = CanvasElementStorage.get()!;
    expect(elements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ...mockedRect,
          x: mockedRect.x + mockedRect.xSize / 2,
          y: mockedRect.y + mockedRect.xSize / 2,
          selected: true,
        }),
        expect.objectContaining({
          ...mockedRect2,
          x: mockedRect2.x + mockedRect2.xSize / 2,
          y: mockedRect2.y + mockedRect2.xSize / 2,
          selected: true,
        }),
      ])
    );
  });
});
