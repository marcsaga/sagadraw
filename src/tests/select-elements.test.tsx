import { fireEvent, render } from "@testing-library/react";
import { Canvas } from "~/canvas/canvas";
import { getSelectedRect } from "~/canvas/renders";
import { CanvasElementStorage } from "~/canvas/storage/canvas-element-storage";
import { getEdgeCollisions, mockRectangle } from "./mockers/elements";

const mockedRect = mockRectangle({});
const mockedRect2 = mockRectangle({ x: 200, y: 200, xSize: 100, ySize: 100 });
const mockedRectEdgeCollisions = getEdgeCollisions(mockedRect);
const mockedRect2EdgeCollisions = getEdgeCollisions(mockedRect2);

describe("render canvas elements", () => {
  beforeEach(() => {
    CanvasElementStorage.set([mockedRect, mockedRect2]);
  });

  afterEach(() => {
    CanvasElementStorage.clear();
  });

  it.each(mockedRectEdgeCollisions)(
    "should be able to select an element by clicking at edge %p",
    ({ x, y }) => {
      const { container } = render(<Canvas />);
      const canvas = container.querySelector("#canvas")!;
      fireEvent.mouseDown(canvas, { clientX: x, clientY: y });
      const elements = CanvasElementStorage.get();
      expect(getSelectedRect(elements!)).toBeTruthy();
    }
  );

  it.each(mockedRect2EdgeCollisions)(
    "should not be able to select more than one element by clicking at edge %p",
    ({ x, y }) => {
      const { container } = render(<Canvas />);
      const canvas = container.querySelector("#canvas")!;
      fireEvent.mouseDown(canvas, {
        clientX: mockedRectEdgeCollisions[0]!.x,
        clientY: mockedRectEdgeCollisions[0]!.y,
      });
      fireEvent.mouseUp(canvas);
      fireEvent.mouseDown(canvas, { clientX: x, clientY: y });
      fireEvent.mouseUp(canvas);
      const elements = CanvasElementStorage.get();
      expect(getSelectedRect(elements!)?.mode).toBe("single");
    }
  );

  it("should able to select an element sorrounding it with a bounding box", () => {
    const { container } = render(<Canvas />);
    const canvas = container.querySelector("#canvas")!;
    fireEvent.mouseDown(canvas, { clientX: 0, clientY: 0 });
    fireEvent.mouseMove(canvas, { clientX: 400, clientY: 400 });
    fireEvent.mouseUp(canvas);
    const elements = CanvasElementStorage.get();
    expect(getSelectedRect(elements!)).toBeTruthy();
  });

  it("should be able to select more than one element by sorrounding it with a bounding box", () => {
    const { container } = render(<Canvas />);
    const canvas = container.querySelector("#canvas")!;
    fireEvent.mouseDown(canvas, { clientX: 0, clientY: 0 });
    fireEvent.mouseMove(canvas, { clientX: 400, clientY: 400 });
    fireEvent.mouseUp(canvas);
    const elements = CanvasElementStorage.get();
    expect(getSelectedRect(elements!)?.mode).toBe("multiple");
  });
});
