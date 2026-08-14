"use client";

import { useState } from "react";

export function RadioSeg3({
  name,
  options,
  defaultValue,
  onChangeValue,
}: {
  name: string;
  options: readonly string[];
  defaultValue: string;
  onChangeValue?: (v: string) => void;
}) {
  const [value, setValue] = useState(defaultValue);
  return (
    <div className="seg3">
      <input type="hidden" name={name} value={value} />
      {options.map((o) => (
        <button
          key={o}
          type="button"
          className={o === value ? "on" : ""}
          onClick={() => {
            setValue(o);
            onChangeValue?.(o);
          }}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
