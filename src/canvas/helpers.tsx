import type { BaseElement, CanvasElement } from "./types";

export function setUpCanvas(
  element?: HTMLCanvasElement | null
): CanvasRenderingContext2D | undefined {
  if (!element) return;
  element.width = window.innerWidth * 2;
  element.height = window.innerHeight * 2;
  element.style.width = `${window.innerWidth}px`;
  element.style.height = `${window.innerHeight}px`;

  const context = element.getContext("2d");
  if (!context) return;
  context.scale(2, 2);

  return context;
}

export function hasCollided(wrapper: BaseElement, element: BaseElement) {
  const normWrapper = {
    x: wrapper.xSize < 0 ? wrapper.x + wrapper.xSize : wrapper.x,
    y: wrapper.ySize < 0 ? wrapper.y + wrapper.ySize : wrapper.y,
    xSize: Math.abs(wrapper.xSize),
    ySize: Math.abs(wrapper.ySize),
  };

  return (
    normWrapper.x < element.x &&
    normWrapper.y < element.y &&
    normWrapper.x + normWrapper.xSize > element.x + element.xSize &&
    normWrapper.y + normWrapper.ySize > element.y + element.ySize
  );
}

export const checkSelectedCollisions = (
  state: CanvasElement[],
  selectionElement?: BaseElement
) => {
  if (!selectionElement) return;
  let updated = false;
  const newState = [...state];
  for (const [index, rect] of newState.entries()) {
    const rectCollided = hasCollided(selectionElement, rect);
    updated = updated || rectCollided !== rect.selected;
    newState[index]!.selected = rectCollided;
  }
  return { updated, newState };
};
