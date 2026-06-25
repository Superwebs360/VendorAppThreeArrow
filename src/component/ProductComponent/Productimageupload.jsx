import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Radii, Typography, useTheme } from "../../constants/theme";

export default function ProductImageUpload({ images = [], onChange }) {
  const { colors, isDark } = useTheme();

  const pick = async () => {
    if (images.length >= 5) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri);
      onChange([...images, ...uris].slice(0, 5));
    }
  };

  const remove = (index) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Product Image
      </Text>
      <Text style={[styles.hint, { color: colors.textSecondary }]}>
        Upload clear images of your product (Max 5 Image)
      </Text>

      {/* Upload box */}
      <Pressable
        onPress={pick}
        style={[
          styles.uploadBox,
          {
            backgroundColor: isDark ? "#0F2010" : "#EDF7EB",
            borderColor: colors.secondary,
          },
        ]}
      >
        <View
          style={[
            styles.uploadIcon,
            { backgroundColor: colors.secondary + "22" },
          ]}
        >
          <Feather name="camera" size={28} color={colors.secondary} />
        </View>
        <Text style={[styles.uploadText, { color: colors.secondary }]}>
          Tap to upload images
        </Text>
        <Text style={[styles.uploadSub, { color: colors.textMuted }]}>
          or drag and drop
        </Text>
        <Text style={[styles.uploadMeta, { color: colors.textMuted }]}>
          PNG, JPG up to 5MB
        </Text>
      </Pressable>

      {/* Thumbnails */}
      {images.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.thumbRow}
        >
          {images.map((uri, i) => (
            <View key={i} style={styles.thumbWrap}>
              <Image
                source={{ uri }}
                style={[styles.thumb, { borderColor: colors.border }]}
                contentFit="cover"
              />
              <Pressable
                onPress={() => remove(i)}
                style={[styles.removeBtn, { backgroundColor: colors.error }]}
                hitSlop={4}
              >
                <Feather name="x" size={10} color="#fff" />
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  sectionTitle: { ...Typography.heading3 },
  hint: { ...Typography.caption },
  uploadBox: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: Radii.lg,
    paddingVertical: 28,
    alignItems: "center",
    gap: 6,
  },
  uploadIcon: {
    width: 56,
    height: 56,
    borderRadius: Radii.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  uploadText: { ...Typography.bodyMedium, fontWeight: "600" },
  uploadSub: { ...Typography.caption },
  uploadMeta: { fontSize: 11, marginTop: 2 },
  thumbRow: { marginTop: 4 },
  thumbWrap: { marginRight: 10, position: "relative", marginTop: 10 },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: Radii.md,
    borderWidth: 1,
  },
  removeBtn: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
});
