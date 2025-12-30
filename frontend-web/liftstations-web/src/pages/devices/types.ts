export type Device = {
  id: string; // ← tag number like PT-0102
  name: string;
  type: string;
  system: string;
  area: { id ?: string; name ?: string; level ?: string };
  loc: {
    panel: string;
    bucket: string;
    aisle: string;
    navText: string;
    layerId?: string;
    x?: number;
    y?: number;
  };
  scan?: { qr?: string };
  docs?: { id: string; kind: string; title: string }[];
  tags?: string[]; // ← optional extra tags (e.g., ["pressure","Rosemount"])
};

export type Plant = {
  id: string;
  name: string;
  devices: Device[];
};
