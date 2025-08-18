import React from "react";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  size = "md",
  disabled = false,
}) => {
  const sizeClasses = {
    sm: {
      container: "w-8 h-4",
      toggle: "w-3 h-3",
      translate: "translate-x-4",
    },
    md: {
      container: "w-11 h-6",
      toggle: "w-5 h-5",
      translate: "translate-x-5",
    },
    lg: {
      container: "w-14 h-7",
      toggle: "w-6 h-6",
      translate: "translate-x-7",
    },
  };

  const { container, toggle, translate } = sizeClasses[size];

  return (
    <button
      type="button"
      className={`
        relative inline-flex ${container} shrink-0 cursor-pointer rounded-full border-2 border-transparent 
        transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${checked ? "bg-blue-600" : "bg-gray-200"}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
    >
      <span
        aria-hidden="true"
        className={`
          ${toggle} inline-block rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out
          ${checked ? translate : "translate-x-0"}
        `}
      />
    </button>
  );
};
