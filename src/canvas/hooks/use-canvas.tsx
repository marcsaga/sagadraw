import { useEffect, useRef, useState } from "react";
import {
  checkSelectedElements,
  setUpCanvas,
  standarizeElement,
} from "../helpers";
import { renderCanvasElements } from "../renders";
import type { BaseElement, CanvasElement, Position } from "../types";
import type { MenuAction } from "~/components/actions-menu";
import { useDeleteListener } from "./use-delete-listener";
import { type ResizeState, resize } from "../elements/resize";
import { getCursor } from "../elements/get-cursor";
import {
  hasCollidedWithEdges,
  hasMovingCollision,
  hasResizeCollision,
} from "../elements/collisions";
import { CanvasElementStorage } from "../storage/canvas-element-storage";
import { useSyncLocalStorage } from "./use-sync-local-storage";

interface UseCanvas {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  startDrawing: (event: React.MouseEvent) => void;
  draw: (event: React.MouseEvent) => void;
  endDrawing: () => void;
  selectAction: (action: MenuAction) => void;
  deleteAll: () => void;
}

export const useCanvas = (): UseCanvas => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const movingPostion = useRef<{ x: number; y: number }>();
  const resizingPosition = useRef<ResizeState>();
  const [action, setAction] = useState<MenuAction>();
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectionElement, setSelectionElement] = useState<BaseElement>();
  const [state, setState] = useState<CanvasElement[]>([]);

  useDeleteListener(setState);
  const { syncLocalStorage } = useSyncLocalStorage(setState);

  useEffect(() => {
    const context = setUpCanvas(canvasRef.current);
    if (!context) return;

    renderCanvasElements(context, state, selectionElement);
    const collisionResponse = checkSelectedElements(state, selectionElement);
    if (collisionResponse?.updated) {
      setState(collisionResponse.newState);
    }
    syncLocalStorage(state);
  }, [canvasRef, state, selectionElement, syncLocalStorage]);

  useEffect(() => {
    function updateCursor(event: MouseEvent) {
      const cursor = getCursor({
        mousePosition: { x: event.offsetX, y: event.offsetY },
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

  const drawElement = (mousePosition: Position) => {
    const position = { ...mousePosition, xSize: 0, ySize: 0 };
    setIsDrawing(true);
    switch (action) {
      case "rectangle":
        setState([...state, { ...position, type: "rectangle" }]);
        break;
      default:
        setSelectionElement(position);
    }
  };

  const updateDrawedElement = (mousePosition: Position) => {
    if (!isDrawing) return;
    if (selectionElement) {
      setSelectionElement({
        ...selectionElement,
        xSize: mousePosition.x - selectionElement.x,
        ySize: mousePosition.y - selectionElement.y,
      });
    } else if (state.length) {
      const currentRect = state.splice(-1)[0]!;
      const newRect = {
        ...currentRect,
        xSize: mousePosition.x - currentRect.x,
        ySize: mousePosition.y - currentRect.y,
      };
      setState([...state, newRect]);
    }
  };

  const updateMovingElement = (mousePosition: Position) => {
    if (!movingPostion.current) return;
    const newState = state.map((rect) => {
      if (rect.selected) {
        rect = {
          ...rect,
          x: rect.x + (mousePosition.x - movingPostion.current!.x),
          y: rect.y + (mousePosition.y - movingPostion.current!.y),
        };
      }
      return rect;
    });
    movingPostion.current = mousePosition;
    setState(newState);
  };

  const updateResizingElement = (mousePosition: Position) => {
    if (!resizingPosition.current) return;
    const newState = resize(mousePosition, state, resizingPosition.current);
    setState(newState);
    resizingPosition.current = {
      ...resizingPosition.current,
      position: mousePosition,
    };
  };

  const startDrawing = ({ clientX, clientY }: React.MouseEvent) => {
    const mousePosition = { x: clientX, y: clientY };
    const resizeCollision = hasResizeCollision(state, mousePosition);
    if (resizeCollision.ok) {
      resizingPosition.current = {
        position: mousePosition,
        direction: resizeCollision.position,
      };
      return;
    }

    const movingCollsion = hasMovingCollision(state, mousePosition);
    if (movingCollsion.ok) {
      movingPostion.current = mousePosition;
      return;
    }

    const edgesCollision = hasCollidedWithEdges(state, mousePosition);
    if (edgesCollision.ok) {
      setState(edgesCollision.newState);
      movingPostion.current = mousePosition;
      return;
    }

    drawElement(mousePosition);
  };

  const draw = ({ clientX, clientY }: React.MouseEvent) => {
    const mousePosition = { x: clientX, y: clientY };
    updateDrawedElement(mousePosition);
    updateMovingElement(mousePosition);
    updateResizingElement(mousePosition);
  };

  const endDrawing = () => {
    if (isDrawing && state.length) {
      const std = standarizeElement(state.splice(-1)[0]!);
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

  const deleteAll = () => {
    setState([]);
  };

  return { canvasRef, startDrawing, draw, endDrawing, selectAction, deleteAll };
};
