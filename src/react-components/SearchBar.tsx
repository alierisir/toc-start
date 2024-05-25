import React from "react";

interface Props {
  onChange: (value: string) => void;
}

const SearchBar = (props: Props) => {
  return (
    <div className="search-bar-component">
      <input
        type="text"
        placeholder="Search projects by name"
        onChange={(e) => {
          props.onChange(e.target.value);
        }}
      />
    </div>
  );
};

export default SearchBar;
