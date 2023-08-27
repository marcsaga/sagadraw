import { render } from "@testing-library/react";
import { Canvas } from "../canvas/canvas";
import { FireEventsAPI } from "./helpers/fire-events-api";

describe("Test", () => {
  it("should render the canvas", () => {
    const { container } = render(<Canvas />);
    expect(FireEventsAPI.getCanvasElement(container)).toBeInTheDocument();
  });

  it("should render the actions menu", () => {
    const { container } = render(<Canvas />);
    expect(container.querySelector("#actions-menu")).toBeInTheDocument();
  });

  it("should render an action button", () => {
    const { container } = render(<Canvas />);
    expect(container.querySelector(".action-button")).toBeInTheDocument();
  });
});
