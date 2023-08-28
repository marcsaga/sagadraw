import { render } from "@testing-library/react";
import { Canvas } from "~/canvas/canvas";
import { CanvasElementStorage } from "~/canvas/storage/canvas-element-storage";
import { mockRectangle } from "./helpers/mock-elements";
import { FireEventsAPI } from "./helpers/fire-events-api";

describe("rectangle element", () => {
  afterEach(() => {
    CanvasElementStorage.clear();
  });

  it("should create a rectangle", () => {
    const { container } = render(<Canvas />);

    const mockedRect = mockRectangle({});
    FireEventsAPI.createRectangle(container, mockedRect);

    expect(CanvasElementStorage.get()).toEqual([mockedRect]);
  });

  it("should be able to create 30 rectangles", () => {
    const { container } = render(<Canvas />);

    for (let i = 0; i < 15; i++) {
      const mockedRect = mockRectangle({ y: i * 10, x: i * 10 });
      FireEventsAPI.createRectangle(container, mockedRect);
    }

    expect(CanvasElementStorage.get()).toHaveLength(15);
  });
});
