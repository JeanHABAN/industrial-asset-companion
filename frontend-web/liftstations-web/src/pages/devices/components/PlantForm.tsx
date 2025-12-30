import { useState } from "react";
import type { Plant } from "../types";

type Props = {
  initial?: Partial<Plant>;
  onSubmit: (plant: Plant) => void;
  onCancel: () => void;
  isEdit?: boolean;
};

export default function PlantForm({ initial, onSubmit, onCancel, isEdit }: Props) {
  const [id, setId] = useState(initial?.id ?? "");
  const [name, setName] = useState(initial?.name ?? "");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!id || !name) return alert("ID and Name are required.");
        onSubmit({ id, name, devices: initial?.devices ?? [] });
      }}
      className="space-y-3"
    >
      <div>
        <label className="block text-sm font-medium text-slate-700">Plant ID</label>
        <input
          className="border rounded-lg px-3 py-2 w-full bg-white text-slate-900 placeholder-slate-500"
          placeholder="ULL"
          value={id}
          onChange={(e) => setId(e.target.value)}
          disabled={isEdit} // don't allow id change on edit
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Plant Name</label>
        <input
          className="border rounded-lg px-3 py-2 w-full"
          placeholder="Ullrich WTP"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="border rounded-lg px-4 py-2">
          Cancel
        </button>
        <button type="submit" className="rounded-lg px-4 py-2 bg-blue-600 text-white">
          {isEdit ? "Save" : "Create Plant"}
        </button>
      </div>
    </form>
  );
}
