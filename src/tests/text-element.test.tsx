import { render } from "@testing-library/react";
import { Canvas } from "../canvas/canvas";
import { CanvasElementStorage } from "~/canvas/storage/canvas-element-storage";
import { mockRectangle, mockText } from "./helpers/mock-elements";
import { FireEventsAPI } from "./helpers/fire-events-api";

describe("text element", () => {
  afterEach(() => {
    CanvasElementStorage.clear();
  });

  it("should create a text element", () => {
    const { container } = render(<Canvas />);

    const mockedText = mockText({ x: 100, y: 100, text: "Hello World" });
    FireEventsAPI.createText(container, mockedText);

    const elements = CanvasElementStorage.get();
    expect(elements).toEqual([
      expect.objectContaining({ text: mockedText.text }),
    ]);
  });

  it("should no be selected after creating a text element", () => {
    const { container } = render(<Canvas />);

    FireEventsAPI.createText(
      container,
      mockText({ x: 100, y: 100, text: "Hello World" })
    );

    expect(CanvasElementStorage.get()).toEqual([
      expect.objectContaining({ selected: false }),
    ]);
  });

  it("should be possible to edit a text element by doble clicking on top", () => {
    const mockedText = mockText({ x: 100, y: 100, text: "Hello world" });
    CanvasElementStorage.set([mockedText]);
    const { container } = render(<Canvas />);

    const editedMockedText = {
      ...mockedText,
      text: "Bye bye world",
      x: mockedText.x + mockedText.xSize / 2,
      y: mockedText.y + mockedText.ySize / 2,
    };
    FireEventsAPI.createText(container, editedMockedText);

    const elements = CanvasElementStorage.get();
    expect(elements).toEqual([
      expect.objectContaining({ text: editedMockedText.text }),
    ]);
  });

  it("should be able to add a text element inside a rectangle", () => {
    const { container } = render(<Canvas />);

    const mockedRect = mockRectangle({});
    FireEventsAPI.createRectangle(container, mockedRect);

    const mockedText = mockText({
      x: mockedRect.x + mockedRect.xSize / 2,
      y: mockedRect.y + mockedRect.ySize / 2,
      text: "Hello World",
    });
    FireEventsAPI.createText(container, mockedText);

    const elements = CanvasElementStorage.get();
    expect(elements).toEqual(
      expect.arrayContaining([expect.objectContaining({ text: "Hello World" })])
    );
  });

  it("should not select an element when doble clicking on it to add a text inside a rect", () => {
    const { container } = render(<Canvas />);

    const mockedRect = mockRectangle({});
    FireEventsAPI.createRectangle(container, mockedRect);

    FireEventsAPI.triggerDoubleClick(container, {
      x: mockedRect.x + mockedRect.xSize / 2,
      y: mockedRect.y + mockedRect.ySize / 2,
    });

    const elements = CanvasElementStorage.get()!;
    const rectElement = elements.find(
      (element) => element.type === "rectangle"
    );
    expect(rectElement?.selected).toBeFalsy();
  });
});
