import { render } from "@testing-library/react";
import { Canvas } from "~/canvas/canvas";
import { FireEventsAPI } from "./helpers/fire-events-api";
import { mockLine } from "./helpers/mock-elements";
import { CanvasElementStorage } from "~/canvas/storage/canvas-element-storage";

describe("line element", () => {
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
});
