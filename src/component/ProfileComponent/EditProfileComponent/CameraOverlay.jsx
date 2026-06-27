import { useTheme } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { CameraView } from "expo-camera";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const CameraOverlay = ({
  cameraRef,
  facing,
  capturing,
  onClose,
  onFlip,
  onCapture,
}) => {
  const { colors } = useTheme();

  return (
    // BUG FIX: was styles.ameraScreen (missing 'c') — camera had no flex:1
    <View style={[styles.cameraScreen, { backgroundColor: "#000" }]}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
      />

      {/* Face oval guide */}
      <View style={styles.ovalWrap} pointerEvents="none">
        <View style={[styles.oval, { borderColor: colors.secondary }]} />
        <Text style={[styles.ovalHint, { color: "#fff" }]}>
          Position your face inside the frame
        </Text>
      </View>

      {/* Top bar */}
      <View style={styles.camTopBar}>
        <TouchableOpacity onPress={onClose} style={styles.camIconBtn}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onFlip} style={styles.camIconBtn}>
          <Ionicons name="camera-reverse-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Shutter */}
      <View style={styles.shutterRow}>
        <TouchableOpacity
          onPress={onCapture}
          disabled={capturing}
          style={[styles.shutter, { borderColor: colors.secondary }]}
        >
          {capturing ? (
            <ActivityIndicator color={colors.secondary} />
          ) : (
            <View
              style={[
                styles.shutterInner,
                { backgroundColor: colors.secondary },
              ]}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CameraOverlay;

const styles = StyleSheet.create({
  cameraScreen: { flex: 1 }, // ← FIXED: was "ameraScreen"
  camTopBar: {
    position: "absolute",
    top: Platform.OS === "ios" ? 56 : 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    zIndex: 10,
  },
  camIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  ovalWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  oval: {
    width: 220,
    height: 280,
    borderRadius: 110,
    borderWidth: 2.5,
    borderStyle: "dashed",
  },
  ovalHint: {
    fontSize: 13,
    opacity: 0.85,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  shutterRow: {
    position: "absolute",
    bottom: 48,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  shutter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  shutterInner: { width: 56, height: 56, borderRadius: 28 },
});
