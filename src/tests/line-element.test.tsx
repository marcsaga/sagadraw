import { render } from "@testing-library/react";
import { Canvas } from "~/canvas/canvas";
import { FireEventsAPI } from "./helpers/fire-events-api";
import { mockLine } from "./helpers/mock-elements";
import { CanvasElementStorage } from "~/canvas/storage/canvas-element-storage";
import { getLineResizeRectagles } from "~/canvas/renders";
import { pointToPointDistance } from "~/canvas/elements/collisions";
import type { Position } from "~/canvas/types";

describe("line element", () => {
  afterEach(() => {
    CanvasElementStorage.clear();
  });

  it("should create a line element", () => {
    const { container } = render(<Canvas />);
    const mockedLine = mockLine({});
    FireEventsAPI.createLine(container, mockedLine);

    const elements = CanvasElementStorage.get();
    expect(elements).toEqual([mockedLine]);
  });

  it("should be able to select a line element", () => {
    const mockedLine = mockLine({ selected: false });
    CanvasElementStorage.set([mockedLine]);
    const { container } = render(<Canvas />);

    FireEventsAPI.triggerClick(container, {
      x: mockedLine.x + mockedLine.xSize / 2,
      y: mockedLine.y + mockedLine.ySize / 2,
    });

    const elements = CanvasElementStorage.get();
    expect(elements).toEqual([expect.objectContaining({ selected: true })]);
  });

  it("should be able to move a line element", () => {
    const mockedLine = mockLine({ selected: false });
    CanvasElementStorage.set([mockedLine]);
    const { container } = render(<Canvas />);

    FireEventsAPI.dragMouse(
      container,
      {
        x: mockedLine.x + mockedLine.xSize / 2,
        y: mockedLine.y + mockedLine.ySize / 2,
      },
      { x: mockedLine.x + mockedLine.xSize, y: mockedLine.y + mockedLine.ySize }
    );

    const elements = CanvasElementStorage.get();
    expect(elements).toEqual([
      expect.objectContaining({
        ...mockedLine,
        x: mockedLine.x + mockedLine.xSize / 2,
        y: mockedLine.y + mockedLine.xSize / 2,
        selected: true,
      }),
    ]);
  });

  const mockedLine = mockLine({ selected: true });
  const resizePositions = getLineResizeRectagles(mockedLine).map(
    ([, { x, y }]) => ({ x, y })
  );
  it.each(resizePositions)(
    "should be able to resize a line element by dragging the %p resize rectangle",
    (position) => {
      CanvasElementStorage.set([mockedLine]);
      const { container } = render(<Canvas />);

      const offset = 2;
      const startLineDistance = pointToPointDistance(mockedLine, position);
      const endLineDistance = pointToPointDistance(
        {
          x: mockedLine.x + mockedLine.xSize,
          y: mockedLine.y + mockedLine.ySize,
        },
        position
      );

      let startPosition: Position;
      let endPosition: Position;
      let expectedLine = mockedLine;
      if (startLineDistance < endLineDistance) {
        startPosition = { x: position.x + offset, y: position.y + offset };
        endPosition = { x: position.x - 100, y: position.y - 100 };
        expectedLine = {
          ...expectedLine,
          x: endPosition.x + offset,
          y: endPosition.y + offset,
          xSize: mockedLine.xSize + 100 + offset,
          ySize: mockedLine.ySize + 100 + offset,
          selected: true,
        };
      } else {
        startPosition = { x: position.x + offset, y: position.x + offset };
        endPosition = { x: position.x + 100, y: position.y + 100 };
        expectedLine = {
          ...expectedLine,
          xSize: mockedLine.xSize + 100 - offset,
          ySize: mockedLine.ySize + 100 - offset,
          selected: true,
        };

        FireEventsAPI.dragMouse(container, startPosition, endPosition);

        const elements = CanvasElementStorage.get();
        expect(elements).toEqual([expect.objectContaining(expectedLine)]);
      }
    }
  );
});
