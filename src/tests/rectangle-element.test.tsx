import { render } from "@testing-library/react";
import { Canvas } from "~/canvas/canvas";
import { CanvasElementStorage } from "~/canvas/storage/canvas-element-storage";
import { mockRectangle } from "./helpers/mock-elements";
import { FireEventsAPI } from "./helpers/fire-events-api";

describe("rectangle element", () => {
  it("should create a rectangle", () => {
    const { container } = render(<Canvas />);

    const mockedRect = mockRectangle({});
    FireEventsAPI.createRectangle(container, mockedRect);

    expect(CanvasElementStorage.get()).toEqual([mockedRect]);
  });
});
