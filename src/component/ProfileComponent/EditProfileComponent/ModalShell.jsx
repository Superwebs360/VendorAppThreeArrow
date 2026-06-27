import { useTheme } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

/**
 * Shared modal wrapper — handles header, scrollable body, and footer save button.
 *
 * Props:
 *   visible, onClose, title, icon
 *   saveLabel (default "Save") | onSave (default = onClose)
 *   keyboardAvoiding (bool, default true)
 *   children — modal body content
 */
const ModalShell = ({
  visible,
  onClose,
  title,
  icon,
  saveLabel = "Save",
  onSave,
  isSaving = false,
  keyboardAvoiding = true,
  children,
}) => {
  const { colors, typography } = useTheme();

  const inner = (
    <View style={[styles.modalRoot, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
        <View
          style={[
            styles.modalIconWrap,
            { backgroundColor: colors.secondary + "18" },
          ]}
        >
          <Ionicons name={icon} size={20} color={colors.secondary} />
        </View>
        <Text
          style={[styles.modalTitle, { color: colors.text, ...typography.h3 }]}
        >
          {title}
        </Text>
        <TouchableOpacity onPress={onClose} style={styles.modalClose}>
          <Ionicons name="close" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Body */}
      <ScrollView
        contentContainerStyle={styles.modalScroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>

      {/* Footer */}
      <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => {
            console.log("[ModalShell] Save pressed, onSave =", typeof onSave);
            if (onSave) onSave();
            else onClose();
          }}
          disabled={isSaving}
          style={[
            styles.modalSave,
            { backgroundColor: isSaving ? colors.border : colors.secondary },
          ]}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[styles.modalSaveTxt, { ...typography.button }]}>
              {saveLabel}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={35}
        >
          {inner}
        </KeyboardAvoidingView>
      ) : (
        inner
      )}
    </Modal>
  );
};

export default ModalShell;

const styles = StyleSheet.create({
  modalRoot: { flex: 1 },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 20 : 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  modalIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: { flex: 1, fontWeight: "700" },
  modalClose: { padding: 4 },
  modalScroll: { padding: 20, paddingBottom: 32 },
  modalFooter: { padding: 20, borderTopWidth: 1 },
  modalSave: { paddingVertical: 15, borderRadius: 14, alignItems: "center" },
  modalSaveTxt: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
