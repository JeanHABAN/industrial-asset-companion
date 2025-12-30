import { useQuery } from "@tanstack/react-query";
import { getPlants } from "../api/plants";
import type { Plant } from "../types";

export function usePlants() {
  return useQuery<Plant[]>({ queryKey: ["plants"], queryFn: getPlants });
}