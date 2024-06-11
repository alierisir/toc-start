import React from "react";

interface Props {
  items: "projects" | "tasks" | "users";
  onChange: (value: string) => void;
  style?: {};
}

const SearchBox = ({
  items,
  onChange,
  style = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    gap: 20,
    height: "2rem",
    borderRadius: 5,
    padding: 5,
  },
}: Props) => {
  return (
    <div style={style}>
      <span className="material-symbols-outlined">search</span>
      <input
        todo-search=""
        type="text"
        placeholder={`Search ${items}... `}
        onChange={(e) => {
          onChange(e.target.value);
        }}
      />
    </div>
  );
};

export default SearchBox;
