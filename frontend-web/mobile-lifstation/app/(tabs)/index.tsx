// app/(tabs)/index.tsx
import React from "react";
import { View, Text, StyleSheet, Pressable, Platform, ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { colors } from "@/constants/Colors";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function HomeScreen() {
  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ImageBackground
        source={{ uri: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=1400&q=60" }}
        style={styles.hero}
        imageStyle={{ opacity: 0.2 }}
      >
        <View style={styles.heroContent}>
          <Text style={styles.welcome}>👋 Welcome back, Operator</Text>
          <Text style={styles.appName}>Lift Station & Device Locator</Text>
          <Text style={styles.subtitle}>
            Quickly locate water utility assets, scan QR codes, and navigate to field sites.
          </Text>
        </View>
      </ImageBackground>

      {/* Quick Tiles */}
      <View style={styles.tilesContainer}>
        <Link href="/(tabs)/lift-stations" asChild>
          <Pressable style={({ pressed }) => [styles.tile, pressed && styles.tilePressed, webCursor()]}>
            <IconSymbol name="drop.fill" size={26} color="#38bdf8" />
            <Text style={styles.tileTitle}>Lift Stations</Text>
            <Text style={styles.tileSub}>Browse and view details</Text>
          </Pressable>
        </Link>

        <Link href="/(tabs)/devices" asChild>
          <Pressable style={({ pressed }) => [styles.tile, pressed && styles.tilePressed, webCursor()]}>
            <IconSymbol name="cpu.fill" size={26} color="#a5b4fc" />
            <Text style={styles.tileTitle}>Devices</Text>
            <Text style={styles.tileSub}>Find instruments and sensors</Text>
          </Pressable>
        </Link>

        <Link href="/(tabs)/explore" asChild>
          <Pressable style={({ pressed }) => [styles.tile, pressed && styles.tilePressed, webCursor()]}>
            <IconSymbol name="map.fill" size={26} color="#4ade80" />
            <Text style={styles.tileTitle}>Explore</Text>
            <Text style={styles.tileSub}>Map, scan, and nearby assets</Text>
          </Pressable>
        </Link>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>City of Austin • Austin Water Utility</Text>
        <Text style={styles.footerSub}>v1.0.0 — Smart Asset Companion</Text>
      </View>
    </SafeAreaView>
  );
}

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  hero: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
    backgroundColor: "#0f172a",
  },

  heroContent: {
    alignItems: "flex-start",
    justifyContent: "center",
  },

  welcome: {
    color: "#bae6fd",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },

  appName: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 0.5,
    marginBottom: 8,
  },

  subtitle: {
    color: "#cbd5e1",
    fontSize: 14,
    maxWidth: 320,
    lineHeight: 20,
  },

  tilesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 24,
    gap: 12,
  },

  tile: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 18,
    width: "48%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },

  tilePressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.96,
  },

  tileTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 8,
  },

  tileSub: {
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 4,
  },

  footer: {
    marginTop: "auto",
    alignItems: "center",
    paddingBottom: 20,
  },

  footerText: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "700",
  },

  footerSub: {
    color: "#64748b",
    fontSize: 12,
  },
});

function webCursor(kind: "pointer" | "not-allowed" = "pointer") {
  return Platform.OS === "web" ? ({ cursor: kind } as any) : {};
}
