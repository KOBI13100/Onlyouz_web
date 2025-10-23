import React from "react";

type ModelSelectProps = {
  onChange?: (model: string) => void;
};

const models = [
  { id: "gpt-4o", label: "GPT-4o" },
  { id: "gpt-4.1", label: "GPT-4.1" },
  { id: "mistral-large", label: "Mistral Large" },
];

const ModelSelect: React.FC<ModelSelectProps> = ({ onChange }) => {
  const [selected, setSelected] = React.useState(models[0].id);

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    setSelected(value);
    onChange?.(value);
  }

  return (
    <select
      value={selected}
      onChange={handleChange}
      className="w-full rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm focus:border-accent/40 focus:ring-2 focus:ring-accent/20"
      aria-label="Modèle"
    >
      {models.map((m) => (
        <option key={m.id} value={m.id}>
          {m.label}
        </option>
      ))}
    </select>
  );
};

export default ModelSelect;


