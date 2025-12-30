import type { Device } from "../types";

type Props = {
  device: Device;
  onEdit?: (deviceId: string) => void;
  onDelete?: (deviceId: string) => void;
  disabled?: boolean;
  deleting?: boolean;
};

export function DeviceCard({ device, onEdit, onDelete }: Props) {
  return (
    <div className="border rounded-lg p-4 bg-white text-slate-900 shadow-sm mb-4">
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold mb-1">
          {device.name} <span className="text-gray-500">({device.type})</span>
        </h3>
        {(onEdit || onDelete) && (
          <div className="flex gap-2">
            {onEdit && (
              <button className="text-blue-600 hover:underline text-sm" onClick={() => onEdit(device.id)}>
                Edit
              </button>
            )}
            {onDelete && (
              <button className="text-red-600 hover:underline text-sm" onClick={() => onDelete(device.id)}>
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      <p className="mb-1"><strong>Tag:</strong> {device.id}</p>
      <p className="mb-1"><strong>System:</strong> {device.system}</p>
      <p className="mb-1">
        <strong>Area:</strong>{" "}
        {device.area?.name
        ? `${device.area.name}${device.area.level ? ` (${device.area.level})` : ""}`
        : "Not set"}
      </p>
      <p className="mb-1"><strong>Location:</strong> {device.loc?.navText}</p>
      <p className="mb-1">
        <strong>Panel:</strong> {device.loc?.panel},{" "}
        <strong>Bucket:</strong> {device.loc?.bucket},{" "}
        <strong>Aisle:</strong> {device.loc?.aisle}
      </p>

      {device.scan?.qr && (
        <p className="mb-1"><strong>QR:</strong> {device.scan?.qr}</p>
      )}

      {device.tags && device.tags.length > 0 && (
        <p className="mb-1"><strong>Tags:</strong> {device.tags.join(", ")}</p>
      )}

      {device.docs && device.docs.length > 0 && (
        <ul className="list-disc pl-5 mt-2">
          {device.docs.map((doc) => (
            <li key={doc.id}>
              <span className="font-medium">{doc.kind}:</span> {doc.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
