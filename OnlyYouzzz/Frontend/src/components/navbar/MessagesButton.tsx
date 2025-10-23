import React from "react";

type MessagesButtonProps = {
  onClick?: () => void;
};

const MessagesButton: React.FC<MessagesButtonProps> = ({ onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full bg-[#20357a] px-4 py-2.5 text-sm text-white hover:bg-[#20357a]/90 hover:shadow-sm"
    >
      <span className="inline-block h-2 w-2 rounded-full bg-accent" />
      Messages
    </button>
  );
};

export default MessagesButton;


