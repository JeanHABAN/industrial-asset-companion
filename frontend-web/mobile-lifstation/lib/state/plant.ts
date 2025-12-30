import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "explore:lastPlantId";

export function usePersistedPlant() {
  const [plantId, setPlantId] = useState<string | undefined>(undefined);
  const [plantName, setPlantName] = useState<string | undefined>(undefined);
  const [ready, setReady] = useState(false);

  // restore once
  useEffect(() => {
    (async () => {
      try {
        const id = await AsyncStorage.getItem(STORAGE_KEY);
        if (id) setPlantId(id);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  // update + persist
  async function choose(id?: string, name?: string) {
    setPlantId(id);
    setPlantName(name);
    if (id) await AsyncStorage.setItem(STORAGE_KEY, id);
    else await AsyncStorage.removeItem(STORAGE_KEY);
  }

  return { plantId, plantName, choose, ready };
}
