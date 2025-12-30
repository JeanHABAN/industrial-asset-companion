// components/Ui.tsx
import React from "react";
import {
  Text,
  View,
  Pressable,
  StyleProp,
  TextStyle,
  ViewStyle,
} from "react-native";

/* -------- SectionTitle -------- */
type SectionTitleProps = {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
};

export function SectionTitle({ children, style }: SectionTitleProps) {
  return (
    <Text
      style={[
        { fontSize: 14, fontWeight: "800", letterSpacing: 0.5, color: "#fff" },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

/* -------- Card -------- */
type CardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Card({ children, style }: CardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: "#1e293b",
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#334155",
          padding: 12,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/* -------- Button -------- */
type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "muted";
  style?: StyleProp<ViewStyle>;
  labelColor?: string; // allow forcing white
};

export function Button({
  label,
  onPress,
  variant = "primary",
  style,
  labelColor = "#fff",
}: ButtonProps) {
  const bg = variant === "primary" ? "#2563EB" : "#374151";
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          backgroundColor: bg,
          paddingVertical: 10,
          paddingHorizontal: 14,
          borderRadius: 10,
          opacity: pressed ? 0.9 : 1,
        },
        style,
      ]}
    >
      <Text style={{ color: labelColor, fontWeight: "700" }}>{label}</Text>
    </Pressable>
  );
}
