export type MenuAction = "rectangle";

interface ActionsMenuProps {
  selectAction: (action: MenuAction) => void;
  deleteAll: () => void;
}

const options: { label: string; action: MenuAction }[] = [
  { label: "Rectangle", action: "rectangle" },
];

export function ActionsMenu({ selectAction, deleteAll }: ActionsMenuProps) {
  return (
    <div className="absolute bottom-24 right-24 flex gap-4" id="actions-menu">
      {options.map(({ label, action }) => (
        <button
          key={action}
          className="action-button rounded bg-black p-2 text-white"
          onClick={() => selectAction(action)}
        >
          <span>{label}</span>
        </button>
      ))}
      <button
        className="rounded bg-black p-2 text-white"
        onClick={deleteAll}
        id={`actions-menu-delete-all`}
      >
        <span>Delete all</span>
      </button>
    </div>
  );
}
