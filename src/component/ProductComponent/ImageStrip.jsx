import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ImageStrip({ images, onChange, colors, radii }) {
  const pick = async () => {
    if (images.length >= 8) {
      Alert.alert("Limit reached", "Max 8 images.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.9,
      selectionLimit: 8 - images.length,
    });
    if (!res.canceled) {
      const added = res.assets.map((a) => ({ uri: a.uri, altText: "" }));
      onChange([...images, ...added]);
    }
  };
  const remove = (i) => onChange(images.filter((_, idx) => idx !== i));

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginTop: 4 }}
    >
      <View style={styles.imageStrip}>
        {images.map((img, i) => (
          <View
            key={i}
            style={[
              styles.imgThumb,
              { borderRadius: radii.sm, borderColor: colors.border },
            ]}
          >
            <Image
              source={{ uri: img.uri }}
              style={[styles.imgThumbImg, { borderRadius: radii.sm }]}
            />
            <TouchableOpacity
              onPress={() => remove(i)}
              style={[styles.imgRemove, { backgroundColor: colors.error }]}
            >
              <Ionicons name="close" size={10} color="#fff" />
            </TouchableOpacity>
            {i === 0 && (
              <View
                style={[
                  styles.imgPrimaryBadge,
                  { backgroundColor: colors.secondary },
                ]}
              >
                <Text style={styles.imgPrimaryText}>Main</Text>
              </View>
            )}
          </View>
        ))}
        {images.length < 8 && (
          <TouchableOpacity
            onPress={pick}
            style={[
              styles.imgAdd,
              {
                borderColor: colors.border,
                borderRadius: radii.sm,
                backgroundColor: colors.inputBg,
              },
            ]}
          >
            <Ionicons name="add" size={24} color={colors.textMuted} />
            <Text style={[styles.imgAddText, { color: colors.textMuted }]}>
              {images.length === 0 ? "Add photos" : `${images.length}/8`}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  imageStrip: { flexDirection: "row", gap: 10, paddingVertical: 4 },
  imgThumb: { width: 82, height: 82, position: "relative", borderWidth: 1 },
  imgThumbImg: { width: 82, height: 82 },
  imgRemove: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  imgPrimaryBadge: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 2,
    alignItems: "center",
  },
  imgPrimaryText: { fontSize: 9, fontWeight: "700", color: "#fff" },
  imgAdd: {
    width: 82,
    height: 82,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderStyle: "dashed",
    gap: 4,
  },
  imgAddText: { fontSize: 10, fontWeight: "500" },
});
