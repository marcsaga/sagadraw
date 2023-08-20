import { useCanvas } from "./use-canvas";

export const Canvas = () => {
  const { canvasRef, startDrawing, draw, endDrawing, selectAction } =
    useCanvas();

  return (
    <div className="rootContainer">
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
      ></canvas>
      <button
        className="absolute bottom-24 right-24 rounded bg-black p-2"
        onClick={() => selectAction("rectangle")}
      >
        <span className="text-white">Rectangle</span>
      </button>
    </div>
  );
};
