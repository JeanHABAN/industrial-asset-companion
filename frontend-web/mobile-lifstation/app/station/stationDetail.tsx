import { useLocalSearchParams, Stack, useNavigation, useFocusEffect, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  Linking,
  Image,
  ScrollView,
  Platform,
  Pressable,
  StyleSheet,
} from "react-native";

import { fetchStation, StationView } from "../../lib/api/stations";
import { API_BASE } from "../../lib/api/base";
import { Button, Card, SectionTitle } from "../../components/Ui";

export default function StationDetail() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const router = useRouter();

  const hdr = (
    <Stack.Screen
      options={{
        headerShown: false,
        title: "",
      }}
    />
  );

  // Hide tab bar when viewing this screen
  useFocusEffect(
    useCallback(() => {
      const parent = navigation.getParent?.();
      parent?.setOptions?.({ tabBarStyle: { display: "none" } });
      return () => parent?.setOptions?.({ tabBarStyle: undefined });
    }, [navigation])
  );

  const [station, setStation] = useState<StationView | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchStation(String(id))
      .then(setStation)
      .catch((e) => setErr(String(e?.message ?? e)));
  }, [id]);

  const { lat, lng, hasCoords } = useMemo(() => {
    const latNum = Number(
      (station as any)?.latitude ?? (station as any)?.lat ?? (station as any)?.location?.lat
    );
    const lngNum = Number(
      (station as any)?.longitude ?? (station as any)?.lng ?? (station as any)?.location?.lng
    );
    return {
      lat: latNum,
      lng: lngNum,
      hasCoords: Number.isFinite(latNum) && Number.isFinite(lngNum),
    };
  }, [station]);

  // ---- Safe open URL helper (prevents crashes / silent fails) ----
  const safeOpenUrl = useCallback(async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        console.warn("Can't open URL:", url);
        return;
      }
      await Linking.openURL(url);
    } catch (e) {
      console.warn("Failed to open URL:", url, e);
    }
  }, []);

  // ---- External links ----
  const openGuarddog = useCallback(() => {
    return safeOpenUrl("https://guarddog.omnisite.com/login");
  }, [safeOpenUrl]);

  const openGoogle = useCallback(() => {
    return safeOpenUrl("https://www.google.com");
  }, [safeOpenUrl]);

  // ---- Map links fallbacks ----
  const fallbacks = useMemo(() => {
    if (!hasCoords) return {};
    const label = encodeURIComponent(station?.name || "Location");
    return {
      googleMaps: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      googleDirections: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`,
      appleMapsPin: `http://maps.apple.com/?ll=${lat},${lng}&q=${label}`,
      appleMapsDirections: `http://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`,
      androidGeoUri: `geo:${lat},${lng}?q=${lat},${lng}(${label})`,
    };
  }, [hasCoords, lat, lng, station?.name]);

  const googleMaps = (station as any)?.googleMaps || (fallbacks as any)?.googleMaps;
  const googleDirections = (station as any)?.googleDirections || (fallbacks as any)?.googleDirections;
  const appleMapsPin = (station as any)?.appleMapsPin || (fallbacks as any)?.appleMapsPin;
  const appleMapsDirections = (station as any)?.appleMapsDirections || (fallbacks as any)?.appleMapsDirections;
  const androidGeoUri = (station as any)?.androidGeoUri || (fallbacks as any)?.androidGeoUri;

  if (err) {
    return (
      <>
        {hdr}
        <SafeAreaView style={styles.screen}>
          <ScrollView contentContainerStyle={{ padding: 18 }}>
            <Text style={styles.errorText}>Failed: {err}</Text>
          </ScrollView>
        </SafeAreaView>
      </>
    );
  }

  if (!station) {
    return (
      <>
        {hdr}
        <SafeAreaView style={styles.screen}>
          <ScrollView contentContainerStyle={{ padding: 18 }}>
            <Text style={styles.loadingText}>Loading…</Text>
          </ScrollView>
        </SafeAreaView>
      </>
    );
  }

  const addr = [
    station.addressLine1,
    [station.city, station.state].filter(Boolean).join(", "),
    station.zip,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      {hdr}
      <SafeAreaView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Back */}
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.9 }]}
            accessibilityRole="button"
          >
            <Text style={styles.backText}>⬅️ Back to List</Text>
          </Pressable>

          {/* Links row */}
          <View style={styles.linkRow}>
            <Pressable
              onPress={openGuarddog}
              style={({ pressed }) => [styles.btnPrimary, pressed && { opacity: 0.9 }]}
              accessibilityRole="button"
            >
              <Text style={styles.btnText}>Guarddog</Text>
            </Pressable>

            <Pressable
              onPress={openGoogle}
              style={({ pressed }) => [styles.btnSecondary, pressed && { opacity: 0.9 }]}
              accessibilityRole="button"
            >
              <Text style={styles.btnText}>PM DOC</Text>
            </Pressable>
          </View>

          {/* Title */}
          <View style={{ marginTop: 4 }}>
            <Text style={styles.title} numberOfLines={2}>
              {station.name}
            </Text>
            <Text style={styles.codeText}>
              Code: <Text style={styles.codeStrong}>{station.code}</Text>
            </Text>
          </View>

          {/* Location */}
          <Card style={styles.card}>
            <SectionTitle style={{ color: "#ffffff" }}>Location</SectionTitle>
            <Text style={styles.addrText}>{addr || "No address on file"}</Text>
            {hasCoords ? (
              <Text style={styles.coordsText}>
                <Text style={{ fontWeight: "bold" }}>Lat/Lng:</Text> {lat.toFixed(6)}, {lng.toFixed(6)}
              </Text>
            ) : (
              <Text style={styles.coordsText}>Coordinates not available</Text>
            )}
          </Card>

          {/* Navigate */}
          <Card style={styles.card}>
            <SectionTitle style={{ color: "#ffffff" }}>Navigate</SectionTitle>
            <View style={{ gap: 10, marginTop: 10 }}>
              {hasCoords && (
                <Button
                  variant="primary"
                  label="🚗 Navigate"
                  onPress={() => {
                    if (Platform.OS === "ios" && appleMapsDirections) Linking.openURL(appleMapsDirections);
                    else if (Platform.OS === "android" && androidGeoUri) Linking.openURL(androidGeoUri);
                    else if (googleDirections) Linking.openURL(googleDirections);
                  }}
                />
              )}
              {googleMaps && <Button label="📍 Google Maps" onPress={() => Linking.openURL(googleMaps)} />}
              {googleDirections && (
                <Button label="▲ Google Directions" onPress={() => Linking.openURL(googleDirections)} />
              )}
              {appleMapsPin && <Button label="🍎 Apple Maps" onPress={() => Linking.openURL(appleMapsPin)} />}
              {appleMapsDirections && (
                <Button label="🍎 Apple Directions" onPress={() => Linking.openURL(appleMapsDirections)} />
              )}
              {androidGeoUri && <Button label="🤖 Android (geo:)" onPress={() => Linking.openURL(androidGeoUri)} />}
            </View>
          </Card>

          {/* QR */}
          <Card style={[styles.card, { marginBottom: 8 }]}>
            <SectionTitle style={{ color: "#ffffff" }}>Station QR</SectionTitle>

            <View style={styles.qrRow}>
              <View style={styles.qrCol}>
                <Image
                  source={{ uri: `${API_BASE}/stations/${station.id}/qr/android` }}
                  style={styles.qrImg}
                  resizeMode="contain"
                />
                <Text style={styles.qrLabel}>Android (geo:)</Text>
              </View>

              <View style={styles.qrCol}>
                <Image
                  source={{ uri: `${API_BASE}/stations/${station.id}/qr/ios` }}
                  style={styles.qrImg}
                  resizeMode="contain"
                />
                <Text style={styles.qrLabel}>iPhone (maps://)</Text>
              </View>
            </View>

            <View style={{ marginTop: 16, alignItems: "center" }}>
              <Button
                label="🖨️ Print Label"
                variant="muted"
                style={{ minWidth: 160 }}
                onPress={() => Linking.openURL(`${API_BASE}/stations/${station.id}/qr/label`)}
              />
            </View>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0f172a" },
  content: { padding: 18, gap: 18 },

  errorText: { color: "#ff6b6b", fontSize: 16, textAlign: "center" },
  loadingText: { color: "#fff", fontSize: 16, textAlign: "center" },

  backBtn: {
    backgroundColor: "#1e293b",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#334155",
    alignSelf: "flex-start",
  },
  backText: { color: "#fff", fontSize: 16 },

  // Flex buttons row (even width)
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 12, // works on newer RN; if not, we still have padding below
  },

  btnPrimary: {
    flex: 1,
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  btnSecondary: {
    flex: 1,
    backgroundColor: "#334155",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  btnText: { color: "#fff", fontWeight: "700", textAlign: "center" },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  codeText: { color: "rgba(255,255,255,0.7)", fontSize: 15 },
  codeStrong: { fontWeight: "700", color: "#fff" },

  card: { borderRadius: 16, backgroundColor: "#1e293b", padding: 18 },
  addrText: { color: "#ffffff", fontSize: 16, marginTop: 6 },
  coordsText: { color: "rgba(255,255,255,0.8)", marginTop: 8, fontSize: 15 },

  qrRow: { flexDirection: "row", gap: 18, marginTop: 12 },
  qrCol: { alignItems: "center", flex: 1 },
  qrImg: {
    width: 140,
    height: 140,
    borderRadius: 12,
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 6,
  },
  qrLabel: { color: "#ffffff", fontSize: 14 },
});
