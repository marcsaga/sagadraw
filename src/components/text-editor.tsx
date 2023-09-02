import type { TextElement } from "~/canvas/types";
import { useEffect, useRef } from "react";
import { TEXT_LINE_HEIGHT } from "~/canvas/elements/create";

interface TextareaProps {
  textInput: TextElement;
  onChangeTextInput: (textInput: TextElement) => void;
}

export function TextEditor({ textInput, onChangeTextInput }: TextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const editableDiv = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editableDiv.current) {
      editableDiv.current.focus();
      editableDiv.current.innerText = textInput.text;
    }
  }, [ref]);

  return (
    <div
      contentEditable
      ref={editableDiv}
      className="absolute focus:outline-none"
      style={{
        top: textInput.y,
        left: textInput.x,
        lineHeight: TEXT_LINE_HEIGHT + "px",
        fontSize: textInput.fontSize + "px",
        fontFamily: textInput.fontFamily,
      }}
      onInput={({ currentTarget }) => {
        onChangeTextInput({
          ...textInput,
          text: currentTarget.innerText,
          ySize: currentTarget.scrollHeight,
          xSize: currentTarget.scrollWidth,
        });
      }}
    ></div>
  );
}
