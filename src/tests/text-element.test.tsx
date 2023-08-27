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
    const { container, getAllByRole } = render(<Canvas />);

    const mockedText = mockText({ x: 100, y: 100, text: "Hello World" });
    FireEventsAPI.createText(container, mockedText, getAllByRole);

    const elements = CanvasElementStorage.get();
    expect(elements).toEqual([
      expect.objectContaining({ text: mockedText.text }),
    ]);
  });

  it("should be possible to edit a text element by doble clicking on top", () => {
    const { container, getAllByRole } = render(<Canvas />);

    const mockedText = mockText({ x: 100, y: 100, text: "Hello world" });
    FireEventsAPI.createText(container, mockedText, getAllByRole);

    const editedMockedText = { ...mockedText, text: "Bye bye world" };
    FireEventsAPI.createText(container, editedMockedText, getAllByRole);

    const elements = CanvasElementStorage.get();
    expect(elements).toEqual([
      expect.objectContaining({ text: editedMockedText.text }),
    ]);
  });

  it("should be able to add a text element inside a rectangle", () => {
    const { container, getAllByRole } = render(<Canvas />);

    const mockedRect = mockRectangle({});
    FireEventsAPI.createRectangle(container, mockedRect);

    const mockedText = mockText({
      x: mockedRect.x + mockedRect.xSize / 2,
      y: mockedRect.y + mockedRect.ySize / 2,
      text: "Hello World",
    });
    FireEventsAPI.createText(container, mockedText, getAllByRole);

    const elements = CanvasElementStorage.get();
    expect(elements).toEqual(
      expect.arrayContaining([expect.objectContaining({ text: "Hello World" })])
    );
  });

  it("should be able to edit a text element inside a rectangle", () => {
    const { container, getAllByRole } = render(<Canvas />);

    const mockedRect = mockRectangle({});
    FireEventsAPI.createRectangle(container, mockedRect);

    const mockedText = mockText({
      x: mockedRect.x + mockedRect.xSize / 2,
      y: mockedRect.y + mockedRect.ySize / 2,
      text: "Hello World",
    });
    FireEventsAPI.createText(container, mockedText, getAllByRole);

    const editedMockedText = { ...mockedText, text: "Bye bye world" };
    FireEventsAPI.createText(container, editedMockedText, getAllByRole);

    const elements = CanvasElementStorage.get();
    expect(elements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ text: editedMockedText.text }),
      ])
    );
  });

});
