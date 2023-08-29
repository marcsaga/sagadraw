import "@testing-library/jest-dom";

// RoundRect mock
CanvasRenderingContext2D.prototype.roundRect = function (
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  // Mock implementation or just an empty function
  // For example, you can call existing methods to simulate the roundRect:
  this.moveTo(x + radius, y);
  this.arcTo(x + width, y, x + width, y + height, radius);
  this.arcTo(x + width, y + height, x, y + height, radius);
  this.arcTo(x, y + height, x, y, radius);
  this.arcTo(x, y, x + width, y, radius);
  this.closePath();
};

// Clipboard mock

let copiedText = "";

const mockedWriteText = jest.fn(
  async (text: string) =>
    await new Promise<void>((resolve) => {
      copiedText = text;
      resolve();
    })
);

const mockedReadText = jest.fn(
  async () => await new Promise<string>((resolve) => resolve(copiedText))
);

Object.assign(navigator, {
  clipboard: { writeText: mockedWriteText, readText: mockedReadText },
});
