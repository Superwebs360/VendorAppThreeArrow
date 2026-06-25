import React from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Help Modal ───────────────────────────────────────────────────────────────
export default function HelpModal({ visible, onClose, colors, radii, isDark }) {
  const faqs = [
    {
      q: "How long does approval take?",
      a: "Applications are typically reviewed within 2–3 business days. You'll be notified once a decision is made.",
    },
    {
      q: "Can I edit my application after submitting?",
      a: "You can withdraw your application, update your details, and resubmit at any time before approval.",
    },
    {
      q: "What happens if my application is rejected?",
      a: "You'll see the rejection reason on this screen. Use the 'Update & Resubmit' button to make corrections and resubmit.",
    },
    {
      q: "Who do I contact for support?",
      a: "Email us at vendor-support@yourapp.com or use the in-app chat during business hours (Mon–Sat, 10am–6pm IST).",
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalSheet,
            {
              backgroundColor: colors.card || colors.background,
              borderRadius: radii.xl || 16,
            },
          ]}
        >
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Help &amp; FAQs
              </Text>
              <Text
                style={[styles.modalSubtitle, { color: colors.textSecondary }]}
              >
                Common questions about vendor approval
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.closeBtn,
                {
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(0,0,0,0.06)",
                },
              ]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.closeBtnText, { color: colors.text }]}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: 420 }}
          >
            {faqs.map((item, i) => (
              <View
                key={i}
                style={[
                  styles.faqItem,
                  {
                    borderBottomColor: colors.divider || "rgba(0,0,0,0.06)",
                    borderBottomWidth: i < faqs.length - 1 ? 1 : 0,
                  },
                ]}
              >
                <Text style={[styles.faqQ, { color: colors.text }]}>
                  {item.q}
                </Text>
                <Text style={[styles.faqA, { color: colors.textSecondary }]}>
                  {item.a}
                </Text>
              </View>
            ))}
          </ScrollView>

          {/* Contact Support */}
          <TouchableOpacity
            style={[
              styles.supportBtn,
              {
                backgroundColor: isDark
                  ? "rgba(93,182,74,0.12)"
                  : "rgba(93,182,74,0.08)",
                borderColor: "rgba(93,182,74,0.3)",
                borderRadius: radii.m || 10,
              },
            ]}
            onPress={onClose}
          >
            <Text style={[styles.supportBtnText, { color: colors.secondary }]}>
              Contact Support
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    padding: 20,
    paddingBottom: 32,
    marginHorizontal: 8,
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginBottom: 3,
  },
  modalSubtitle: {
    fontSize: 13,
    lineHeight: 17,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: "700",
  },
  faqItem: {
    paddingVertical: 14,
  },
  faqQ: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
    lineHeight: 19,
  },
  faqA: {
    fontSize: 13,
    lineHeight: 19,
  },
  supportBtn: {
    marginTop: 18,
    paddingVertical: 13,
    alignItems: "center",
    borderWidth: 1,
  },
  supportBtnText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
