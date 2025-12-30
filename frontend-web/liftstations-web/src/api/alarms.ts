import { http } from './http';
import type { SpringPage } from './types';

export type AlarmDto = {
  id: string;
  stationId: string | null;
  severity: string | null;
  message: string | null;
  raisedAt: string | null;
  acknowledgedAt: string | null;
  acknowledgedBy: string | null;
  acknowledged: boolean;
};

export type AlarmResourceTip = {
  title: string;
  url: string;
  description: string;
};

export type AlarmDetailDto = {
  id: string;
  stationId: string | null;
  severity: string | null;
  message: string | null;
  raisedAt: string | null;
  acknowledgedAt: string | null;
  acknowledgedBy: string | null;
  acknowledged: boolean;
  resources: AlarmResourceTip[];
};

/* ---------- API ---------- */

// 👇 add stationId and severity to params type
export async function fetchAlarms(params: {
  q?: string;
  stationId?: string;
  severity?: string;
  page?: number;
  size?: number;
}) {
  const { data } = await http.get('/alarms', { params });
  return data as SpringPage<AlarmDto>;
}

export async function fetchAlarmDetail(id: string) {
  const { data } = await http.get(`/alarms/${id}`);
  return data as AlarmDetailDto;
}

export async function ackAlarm(id: string, user: string) {
  const { data } = await http.post(`/alarms/${id}/ack`, null, { params: { user } });
  return data as AlarmDto;
}
