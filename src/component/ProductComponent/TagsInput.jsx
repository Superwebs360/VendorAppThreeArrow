import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function TagsInput({ tags, onChange, colors, radii }) {
  const [input, setInput] = useState("");
  const add = () => {
    const t = input.trim().toLowerCase();
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setInput("");
  };
  const remove = (t) => onChange(tags.filter((x) => x !== t));
  return (
    <View>
      <View
        style={[
          styles.tagInputRow,
          {
            borderColor: colors.border,
            borderRadius: radii.sm,
            backgroundColor: colors.inputBg,
          },
        ]}
      >
        <TextInput
          style={[styles.tagInput, { color: colors.text }]}
          value={input}
          onChangeText={setInput}
          placeholder="Type a tag, press +"
          placeholderTextColor={colors.placeholder}
          onSubmitEditing={add}
          returnKeyType="done"
        />
        <TouchableOpacity
          onPress={add}
          style={[styles.tagAddBtn, { backgroundColor: colors.secondary }]}
        >
          <Ionicons name="add" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
      {tags.length > 0 && (
        <View style={styles.tagCloud}>
          {tags.map((t) => (
            <View
              key={t}
              style={[
                styles.tagChip,
                {
                  backgroundColor: colors.secondary + "15",
                  borderColor: colors.secondary + "30",
                },
              ]}
            >
              <Text style={[styles.tagChipText, { color: colors.secondary }]}>
                #{t}
              </Text>
              <TouchableOpacity
                onPress={() => remove(t)}
                hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
              >
                <Ionicons
                  name="close-circle"
                  size={13}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tagInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    overflow: "hidden",
  },
  tagInput: { flex: 1, paddingHorizontal: 12, height: 44, fontSize: 14 },
  tagAddBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  tagCloud: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  tagChipText: { fontSize: 12, fontWeight: "600" },
});
