import { render } from "@testing-library/react";
import { Canvas } from "~/canvas/canvas";
import { getSelectedRect } from "~/canvas/renders";
import { CanvasElementStorage } from "~/canvas/storage/canvas-element-storage";
import {
  getEdgeCollisions,
  mockLine,
  mockRectangle,
} from "./helpers/mock-elements";
import { FireEventsAPI } from "./helpers/fire-events-api";

const mockedRect = mockRectangle({});
const mockedRect2 = mockRectangle({ x: 200, y: 200, xSize: 100, ySize: 100 });
const mockedRect3 = mockRectangle({ x: 500, y: 500, xSize: 100, ySize: 100 });
const mockedSelectedRect = mockRectangle({ x: 300, y: 300, selected: true });
const mockedSelectedRect2 = mockRectangle({
  x: 100,
  y: 100,
  xSize: 400,
  ySize: 400,
  selected: true,
});

const mockedRectEdgeCollisions = getEdgeCollisions(mockedRect);
const mockedRect2EdgeCollisions = getEdgeCollisions(mockedRect2);

describe("select canvas elements", () => {
  afterEach(() => {
    CanvasElementStorage.clear();
  });

  it.each(mockedRectEdgeCollisions)(
    "should be able to select an element by clicking at edge %p",
    ({ x, y }) => {
      CanvasElementStorage.set([mockedRect]);
      const { container } = render(<Canvas />);

      FireEventsAPI.triggerClick(container, { x, y });

      const elements = CanvasElementStorage.get();
      expect(getSelectedRect(elements!)).toBeTruthy();
    }
  );

  it.each(mockedRect2EdgeCollisions)(
    "should not be able to select more than one element by clicking at edge %p",
    ({ x, y }) => {
      CanvasElementStorage.set([mockedRect, mockedRect2]);
      const { container } = render(<Canvas />);

      FireEventsAPI.triggerClick(container, mockedRectEdgeCollisions[0]!);
      FireEventsAPI.triggerClick(container, { x, y });

      const elements = CanvasElementStorage.get();
      expect(getSelectedRect(elements!)?.mode).toBe("single");
    }
  );

  it("should be able to select another element if there is already one selected", () => {
    CanvasElementStorage.set([mockedSelectedRect, mockedRect2]);
    const { container } = render(<Canvas />);

    FireEventsAPI.triggerClick(container, {
      x: mockedRect2.x + mockedRect2.xSize / 2,
      y: mockedRect2.y + mockedRect2.ySize / 2,
    });

    const elements = CanvasElementStorage.get();
    expect(elements).toEqual([
      expect.objectContaining({ ...mockedSelectedRect, selected: false }),
      expect.objectContaining({ ...mockedRect2, selected: true }),
    ]);
  });

  it("should be able to select another element if there is already multiple selected", () => {
    CanvasElementStorage.set([
      mockedSelectedRect,
      mockedSelectedRect2,
      mockedRect3,
    ]);
    const { container } = render(<Canvas />);

    FireEventsAPI.triggerClick(container, {
      x: mockedRect3.x + mockedRect3.xSize / 2,
      y: mockedRect3.y + mockedRect3.ySize / 2,
    });

    const elements = CanvasElementStorage.get();
    expect(elements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ...mockedSelectedRect, selected: false }),
        expect.objectContaining({ ...mockedSelectedRect2, selected: false }),
        expect.objectContaining({ ...mockedRect3, selected: true }),
        ,
      ])
    );
  });

  it("should be able to select another element if there is already one selected and sorrounding the target", () => {
    CanvasElementStorage.set([mockedSelectedRect2, mockedRect2]);
    const { container } = render(<Canvas />);

    FireEventsAPI.triggerClick(container, {
      x: mockedRect2.x + mockedRect2.xSize / 2,
      y: mockedRect2.y + mockedRect2.ySize / 2,
    });

    const elements = CanvasElementStorage.get();
    expect(elements).toEqual([
      expect.objectContaining({ ...mockedSelectedRect2, selected: false }),
      expect.objectContaining({ ...mockedRect2, selected: true }),
    ]);
  });

  it("should able to select an element sorrounding it with a bounding box", () => {
    CanvasElementStorage.set([mockedRect, mockedRect2]);
    const { container } = render(<Canvas />);

    FireEventsAPI.dragMouse(container, { x: 0, y: 0 }, { x: 400, y: 400 });

    const elements = CanvasElementStorage.get();
    expect(getSelectedRect(elements!)).toBeTruthy();
  });

  it("should be able to select more than one element by sorrounding it with a bounding box", () => {
    CanvasElementStorage.set([mockedRect, mockedRect2]);
    const { container } = render(<Canvas />);

    FireEventsAPI.dragMouse(container, { x: 0, y: 0 }, { x: 400, y: 400 });

    const elements = CanvasElementStorage.get();
    expect(getSelectedRect(elements!)?.mode).toBe("multiple");
  });

  it("should be able to select a line and a rectangle sourrounding it", () => {
    const mockedLine = mockLine({ x: 150, y: 150, xSize: 100, ySize: 100 });
    const mockedRectagle = mockRectangle({
      x: 100,
      y: 100,
      xSize: 300,
      ySize: 300,
    });
    CanvasElementStorage.set([mockedRectagle, mockedLine]);
    const { container } = render(<Canvas />);

    FireEventsAPI.dragMouse(container, { x: 50, y: 50 }, { x: 450, y: 450 });

    const elements = CanvasElementStorage.get();
    expect(elements).toEqual([
      expect.objectContaining({ ...mockedRectagle, selected: true }),
      expect.objectContaining({ ...mockedLine, selected: true }),
    ]);
  });
});
