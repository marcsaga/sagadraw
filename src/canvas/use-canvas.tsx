import { useEffect, useRef, useState } from "react";
import {
  checkSelectedElements,
  hasCollided,
  setUpCanvas,
  standarizeElementPosition,
  getResizeRectangles,
} from "./helpers";
import { getSelectedRect, renderCanvasElements } from "./renders";
import type {
  BaseElement,
  CanvasElement,
  ResizeRectanglePosition,
} from "./types";
import type { MenuAction } from "~/components/actions-menu";
import { useDeleteListener } from "./hooks/use-delete-listener";
import { resize } from "./elements/resize";
import { getCursor } from "./elements/get-cursor";

interface UseCanvas {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  startDrawing: (event: React.MouseEvent) => void;
  draw: (event: React.MouseEvent) => void;
  endDrawing: () => void;
  selectAction: (action: MenuAction) => void;
}

export const useCanvas = (): UseCanvas => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const movingPostion = useRef<{ x: number; y: number }>();
  const resizingPosition = useRef<{
    x: number;
    y: number;
    position: ResizeRectanglePosition;
  }>();
  const [action, setAction] = useState<MenuAction>();
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectionElement, setSelectionElement] = useState<BaseElement>();
  const [state, setState] = useState<CanvasElement[]>([]);

  useDeleteListener(setState);

  useEffect(() => {
    const context = setUpCanvas(canvasRef.current);
    if (!context) return;

    renderCanvasElements(context, state, selectionElement);
    const collisionResponse = checkSelectedElements(state, selectionElement);
    if (collisionResponse?.updated) {
      setState(collisionResponse.newState);
    }
  }, [canvasRef, state, selectionElement]);

  useEffect(() => {
    function updateCursor(event: MouseEvent) {
      const cursor = getCursor({
        currentMousePosition: { x: event.offsetX, y: event.offsetY },
        state,
        action,
      });
      canvasRef.current!.style.cursor = cursor;
    }
    const ref = canvasRef.current;
    if (!ref) return;
    ref.addEventListener("mousemove", updateCursor);
    return () => {
      ref.removeEventListener("mousemove", updateCursor);
    };
  }, [canvasRef, state, action]);

  const startMovingSelectedElements = ({
    nativeEvent: { offsetX, offsetY },
  }: React.MouseEvent): { moving: boolean } => {
    const position = { x: offsetX, y: offsetY, xSize: 0, ySize: 0 };
    const selectedRect = getSelectedRect(state);
    const moving =
      !!selectedRect && hasCollided(selectedRect.element, position);
    if (moving) {
      movingPostion.current = position;
    }

    return { moving };
  };

  const startResizingSelectedElements = ({
    nativeEvent: { offsetX, offsetY },
  }: React.MouseEvent): { resizing: boolean } => {
    const position = { x: offsetX, y: offsetY, xSize: 0, ySize: 0 };

    const selectedRect = getSelectedRect(state);
    if (!selectedRect) return { resizing: false };
    const resizeCollision = getResizeRectangles(
      selectedRect.element,
      selectedRect.mode
    ).find(([, rectangle]) => hasCollided(rectangle, position));
    if (resizeCollision) {
      resizingPosition.current = { ...position, position: resizeCollision[0] };
    }

    return { resizing: !!resizeCollision };
  };

  const drawElement = ({
    nativeEvent: { offsetX, offsetY },
  }: React.MouseEvent) => {
    const position = { x: offsetX, y: offsetY, xSize: 0, ySize: 0 };
    setIsDrawing(true);
    switch (action) {
      case "rectangle":
        setState([...state, { ...position, type: "rectangle" }]);
        break;
      default:
        setSelectionElement(position);
    }
  };

  const updateDrawedElement = ({
    nativeEvent: { offsetX, offsetY },
  }: React.MouseEvent) => {
    if (!isDrawing) return;
    if (selectionElement) {
      setSelectionElement({
        ...selectionElement,
        xSize: offsetX - selectionElement.x,
        ySize: offsetY - selectionElement.y,
      });
    } else if (state.length) {
      const currentRect = state.splice(-1)[0]!;
      const newRect = {
        ...currentRect,
        xSize: offsetX - currentRect.x,
        ySize: offsetY - currentRect.y,
      };
      setState([...state, newRect]);
    }
  };

  const updateMovingElement = ({
    nativeEvent: { offsetX, offsetY },
  }: React.MouseEvent) => {
    if (!movingPostion.current) return;
    const newState = state.map((rect) => {
      if (rect.selected) {
        rect = {
          ...rect,
          x: rect.x + (offsetX - movingPostion.current!.x),
          y: rect.y + (offsetY - movingPostion.current!.y),
        };
      }
      return rect;
    });
    movingPostion.current = { x: offsetX, y: offsetY };
    setState(newState);
  };

  const updateResizingElement = (event: React.MouseEvent) => {
    if (!resizingPosition.current) return;
    const newState = resize(event, state, resizingPosition.current);
    setState(newState);
    resizingPosition.current = {
      ...resizingPosition.current,
      x: event.nativeEvent.offsetX,
      y: event.nativeEvent.offsetY,
    };
  };

  const startDrawing = (event: React.MouseEvent) => {
    const { resizing } = startResizingSelectedElements(event);
    if (resizing) return;
    const { moving } = startMovingSelectedElements(event);
    if (moving) return;
    drawElement(event);
  };

  const draw = (event: React.MouseEvent) => {
    updateDrawedElement(event);
    updateMovingElement(event);
    updateResizingElement(event);
  };

  const endDrawing = () => {
    if (isDrawing && state.length) {
      const std = standarizeElementPosition(state.splice(-1)[0]!);
      setState([...state, std]);
      setIsDrawing(false);
    }
    movingPostion.current = undefined;
    resizingPosition.current = undefined;
    setAction(undefined);
    if (selectionElement) {
      setSelectionElement(undefined);
    }
  };

  const selectAction = (action: MenuAction) => {
    setAction(action);
  };

  return { canvasRef, startDrawing, draw, endDrawing, selectAction };
};
