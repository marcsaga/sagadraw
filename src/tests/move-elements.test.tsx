import { fireEvent, render } from "@testing-library/react";
import { Canvas } from "~/canvas/canvas";
import { CanvasElementStorage } from "~/canvas/storage/canvas-element-storage";
import { getEdgeCollisions, mockRectangle } from "./mockers/elements";

const mockedRect = mockRectangle({ selected: false });
const mockedRect2 = mockRectangle({ selected: false });
const mockedRectEdgeCollisions = getEdgeCollisions(mockedRect);
const mockedRect2EdgeCollisions = getEdgeCollisions(mockedRect2);

describe("move canvas elements", () => {
  beforeEach(() => {
    CanvasElementStorage.set([mockedRect, mockedRect2]);
  });
  afterEach(() => {
    CanvasElementStorage.clear();
  });

  it("should be able to move a rectangle", () => {
    const { container } = render(<Canvas />);
    const canvas = container.querySelector("#canvas")!;

    fireEvent.mouseDown(canvas, {
      clientX: mockedRectEdgeCollisions[0]!.x,
      clientY: mockedRectEdgeCollisions[0]!.y,
    });

    fireEvent.mouseDown(canvas, {
      clientX: mockedRect.x + mockedRect.xSize / 2,
      clientY: mockedRect.y + mockedRect.ySize / 2,
    });
    fireEvent.mouseMove(canvas, {
      clientX: mockedRect.x + mockedRect.xSize,
      clientY: mockedRect.y + mockedRect.ySize,
    });
    fireEvent.mouseUp(canvas);

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
    const canvas = container.querySelector("#canvas")!;

    fireEvent.mouseDown(canvas, {
      clientX: mockedRectEdgeCollisions[0]!.x,
      clientY: mockedRectEdgeCollisions[0]!.y,
    });
    fireEvent.mouseDown(canvas, {
      clientX: mockedRect2EdgeCollisions[0]!.x,
      clientY: mockedRect2EdgeCollisions[0]!.y,
    });

    fireEvent.mouseDown(canvas, {
      clientX: mockedRect.x + mockedRect.xSize / 2,
      clientY: mockedRect.y + mockedRect.ySize / 2,
    });
    fireEvent.mouseMove(canvas, {
      clientX: mockedRect.x + mockedRect.xSize,
      clientY: mockedRect.y + mockedRect.ySize,
    });
    fireEvent.mouseUp(canvas);

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
