export type Device = {
  id: string;
  name: string;
  type: string;
  system: string;
  area: { id: string; name: string; level: string };
  loc: { panel: string; bucket: string; aisle: string;  navText: string;  };
  scan?: { qr?: string };
  docs?: { id: string; kind: string; title: string }[];
  tags?: string[];
};

export type Plant = {
  id: string;
  name: string;
  devices: Device[];
};
