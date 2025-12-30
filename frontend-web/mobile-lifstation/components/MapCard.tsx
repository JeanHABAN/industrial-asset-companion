// components/MapCard.tsx
import React from "react";
import { View, Text } from "react-native";
import { Card } from "./Ui";

type Props = {
  lat: number;
  lng: number;
  title?: string;
};

export default function MapCard({ lat, lng, title }: Props) {
  return (
    <Card style={{ padding: 16, overflow: "hidden" }}>
      <View style={{ height: 200, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ textAlign: "center" }}>
          {title || "Location"}
          {"\n"}
          Latitude: {lat.toFixed(6)}
          {"\n"}
          Longitude: {lng.toFixed(6)}
        </Text>
      </View>
    </Card>
  );
}
