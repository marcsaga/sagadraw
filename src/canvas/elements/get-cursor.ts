import type { MenuAction } from "~/components/actions-menu";
import { getResizeRectangles, hasCollided } from "../helpers";
import type {
  CanvasElement,
  Position,
  ResizeRectanglePosition,
} from "../types";
import { getSelectedRect } from "../renders";

type ResizeCursor = "nesw-resize" | "nwse-resize" | "ns-resize" | "ew-resize";
type Cursor = "default" | "move" | "pointer" | "crosshair" | ResizeCursor;

const resizeCursorDict: Record<ResizeRectanglePosition, ResizeCursor> = {
  "top-left": "nwse-resize",
  "top-right": "nesw-resize",
  "bottom-left": "nesw-resize",
  "bottom-right": "nwse-resize",
  bottom: "ns-resize",
  top: "ns-resize",
  left: "ew-resize",
  right: "ew-resize",
};

function getCursorFromResizeCollision(
  elements: CanvasElement[],
  mouse: Position
): ResizeCursor | undefined {
  const selectedRect = getSelectedRect(elements);
  if (!selectedRect) return;

  const collision = getResizeRectangles(
    selectedRect.element,
    selectedRect.mode
  ).find(([, rectangle]) => {
    return hasCollided(rectangle, { ...mouse, xSize: 0, ySize: 0 });
  });
  if (collision) return resizeCursorDict[collision[0]];
}

interface GetCursorInput {
  currentMousePosition: Position;
  state: CanvasElement[];
  action?: MenuAction;
}

export const getCursor = ({
  currentMousePosition,
  state,
  action,
}: GetCursorInput): Cursor => {
  const mousePosition = { ...currentMousePosition, xSize: 0, ySize: 0 };
  const resizeCursor = getCursorFromResizeCollision(state, mousePosition);
  if (resizeCursor) {
    return resizeCursor;
  }

  const selectedRect = getSelectedRect(state);
  if (selectedRect && hasCollided(selectedRect.element, mousePosition)) {
    return "move";
  }

  if (action !== undefined) {
    return "crosshair";
  }

  return "default";
};
