import  { useState } from "react";
import type { Device } from "../types";

type Props = {
  initial?: Partial<Device>;
  onSubmit: (device: Device) => void;
  onCancel: () => void;
  isEdit?: boolean;
};

export default function DeviceForm({ initial, onSubmit, onCancel, isEdit }: Props) {
  const [id, setId] = useState(initial?.id ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState(initial?.type ?? "");
  const [system, setSystem] = useState(initial?.system ?? "");
  const [areaName, setAreaName] = useState(initial?.area?.name ?? "");
  const [areaId, setAreaId] = useState(initial?.area?.id ?? "");
  const [areaLevel, setAreaLevel] = useState(initial?.area?.level ?? "");
  const [panel, setPanel] = useState(initial?.loc?.panel ?? "");
  const [bucket, setBucket] = useState(initial?.loc?.bucket ?? "");
  const [aisle, setAisle] = useState(initial?.loc?.aisle ?? "");
  const [navText, setNavText] = useState(initial?.loc?.navText ?? "");
  const [qr, setQr] = useState(initial?.scan?.qr ?? "");
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!id || !name) return alert("Device Tag (ID) and Name are required.");
        const device: Device = {
          id,
          name,
          type,
          system,
          area: { id: areaId, name: areaName, level: areaLevel },
          loc: { panel, bucket, aisle, navText },
          scan: qr ? { qr } : undefined,
          tags: tags
            .split(",")
            .map(t => t.trim())
            .filter(Boolean),
          docs: initial?.docs ?? [],
        };
        onSubmit(device);
      }}
      className="grid grid-cols-1 md:grid-cols-2 gap-3"
    >
      <div>
        <label className="block text-sm font-medium">Device Tag (ID)</label>
        <input className="border rounded-lg px-3 py-2 w-full bg-white text-slate-900 placeholder-slate-500" value={id} onChange={e=>setId(e.target.value)} placeholder="PT-0102" required disabled={isEdit}/>
      </div>
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input className="border rounded-lg px-3 py-2 w-full bg-white text-slate-900 placeholder-slate-500" value={name} onChange={e=>setName(e.target.value)} placeholder="Filter Influent Pressure" required/>
      </div>
      <div>
        <label className="block text-sm font-medium">Type</label>
        <input className="border rounded-lg px-3 py-2 w-full bg-white text-slate-900 placeholder-slate-500" value={type} onChange={e=>setType(e.target.value)} placeholder="PT"/>
      </div>
      <div>
        <label className="block text-sm font-medium">System</label>
        <input className="border rounded-lg px-3 py-2 w-full bg-white text-slate-900 placeholder-slate-500" value={system} onChange={e=>setSystem(e.target.value)} placeholder="Filters"/>
      </div>

      <div>
        <label className="block text-sm font-medium">Area ID</label>
        <input className="border rounded-lg px-3 py-2 w-full bg-white text-slate-900 placeholder-slate-500" value={areaId} onChange={e=>setAreaId(e.target.value)} placeholder="A1"/>
      </div>
      <div>
        <label className="block text-sm font-medium">Area Name</label>
        <input className="border rounded-lg px-3 py-2 w-full bg-white text-slate-900 placeholder-slate-500" value={areaName} onChange={e=>setAreaName(e.target.value)} placeholder="Filter Gallery"/>
      </div>
      <div>
        <label className="block text-sm font-medium">Area Level</label>
        <input className="border rounded-lg px-3 py-2 w-full bg-white text-slate-900 placeholder-slate-500" value={areaLevel} onChange={e=>setAreaLevel(e.target.value)} placeholder="L1"/>
      </div>

      <div>
        <label className="block text-sm font-medium">Panel</label>
        <input className="border rounded-lg px-3 py-2 w-full bg-white text-slate-900 placeholder-slate-500" value={panel} onChange={e=>setPanel(e.target.value)} placeholder="MCC-2"/>
      </div>
      <div>
        <label className="block text-sm font-medium">Bucket</label>
        <input className="border rounded-lg px-3 py-2 w-full bg-white text-slate-900 placeholder-slate-500" value={bucket} onChange={e=>setBucket(e.target.value)} placeholder="3"/>
      </div>
      <div>
        <label className="block text-sm font-medium">Aisle</label>
        <input className="border rounded-lg px-3 py-2 w-full bg-white text-slate-900 placeholder-slate-500" value={aisle} onChange={e=>setAisle(e.target.value)} placeholder="B"/>
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium">Nav Text</label>
        <input className="border rounded-lg px-3 py-2 w-full bg-white text-slate-900 placeholder-slate-500" value={navText} onChange={e=>setNavText(e.target.value)} placeholder="North door → Aisle B → MCC-2"/>
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium">Tags (comma-separated)</label>
        <input className="border rounded-lg px-3 py-2 w-full bg-white text-slate-900 placeholder-slate-500" value={tags} onChange={e=>setTags(e.target.value)} placeholder="PT-0102, pressure, Rosemount"/>
      </div>

      <div className="md:col-span-2 flex justify-end gap-2 mt-2">
        <button type="button" onClick={onCancel} className="border rounded-lg px-3 py-2 w-full bg-white text-slate-900 placeholder-slate-500">Cancel</button>
        <button type="submit" className="border rounded-lg px-3 py-2 w-full bg-white text-slate-900 placeholder-slate-500">
          {isEdit ? "Save Device" : "Add Device"}
        </button>
      </div>
    </form>
  );
}
