import { Feather } from "@expo/vector-icons";
import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const { height: SH } = Dimensions.get("window");

/**
 * 3-dot context menu for product actions (edit, delete)
 */
export function ProductMenu({
  visible,
  onClose,
  onEdit,
  onDelete,
  anchorY,
  colors,
  radii,
  isDark,
  shadows,
}) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.box,
                !isDark && shadows.md,
                {
                  backgroundColor: colors.card || colors.background,
                  borderColor: colors.border || "rgba(0,0,0,0.08)",
                  borderRadius: radii.m || 14,
                  top: Math.min(anchorY, SH - 150),
                },
              ]}
            >
              <TouchableOpacity
                style={styles.item}
                onPress={() => {
                  onClose();
                  onEdit();
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.iconWrap, { backgroundColor: "#EEF2FF" }]}>
                  <Feather name="edit-2" size={13} color="#6366F1" />
                </View>
                <View>
                  <Text style={[styles.itemTitle, { color: colors.text }]}>
                    Edit Product
                  </Text>
                  <Text style={[styles.itemSub, { color: colors.textMuted }]}>
                    Modify details & images
                  </Text>
                </View>
              </TouchableOpacity>
              <View
                style={[
                  styles.divider,
                  { backgroundColor: colors.divider || "rgba(0,0,0,0.06)" },
                ]}
              />
              <TouchableOpacity
                style={styles.item}
                onPress={() => {
                  onClose();
                  onDelete();
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.iconWrap, { backgroundColor: "#FEF2F2" }]}>
                  <Feather name="trash-2" size={13} color="#EF4444" />
                </View>
                <View>
                  <Text style={[styles.itemTitle, { color: "#EF4444" }]}>
                    Delete Product
                  </Text>
                  <Text style={[styles.itemSub, { color: colors.textMuted }]}>
                    Cannot be undone
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.04)" },
  box: {
    position: "absolute",
    right: 14,
    minWidth: 200,
    borderWidth: 1,
    overflow: "hidden",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  itemTitle: { fontSize: 13, fontWeight: "600", letterSpacing: -0.1 },
  itemSub: { fontSize: 11, marginTop: 1 },
  divider: { height: StyleSheet.hairlineWidth, marginHorizontal: 14 },
});
