import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import {
  PAGE_PADDING,
  SPACING,
  useGridConfig,
} from "../../../../../constants/gridConfig"; // adjust path if needed
import {
  Radii,
  Shadows,
  Typography,
  useTheme,
} from "../../../../../constants/theme"; // adjust path if needed
import {
  addPaymentMethod,
  clearPaymentMutationError,
  deletePaymentMethod,
  fetchPaymentMethods,
  selectPaymentMethods,
  selectPaymentMethodsError,
  selectPaymentMethodsStatus,
  togglePaymentMethodStatus,
  updatePaymentMethod,
} from "../../../../../redux/vendorpaymentslice"; // adjust path if needed

// ─────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────

const METHOD_TABS = [
  { id: "upi", label: "UPI", icon: "smartphone" },
  { id: "card", label: "Card", icon: "credit-card" },
  { id: "bank", label: "Bank", icon: "bank" }, // MaterialCommunityIcons name
];

const UPI_APPS = [
  { id: "gpay", name: "Google Pay", initial: "G", color: "#3B8BD4" },
  { id: "paytm", name: "Paytm", initial: "P", color: "#1FA6D9" },
  { id: "bhim", name: "BHIM", initial: "B", color: "#E0742F" },
  { id: "other", name: "Other UPI", initial: "U", color: "#7C7F87" },
];

const maskTail = (value, visible = 4) => {
  const digits = String(value ?? "").replace(/\s/g, "");
  if (digits.length <= visible) return digits;
  return `•••• ${digits.slice(-visible)}`;
};

const IFSC_PATTERN = /^[A-Z]{4}0[A-Z0-9]{6}$/;

// ─────────────────────────────────────────────────────────────────────────
// Small building blocks
// ─────────────────────────────────────────────────────────────────────────

function TypeTab({ tab, active, onPress, colors }) {
  const Icon = tab.icon === "bank" ? MaterialCommunityIcons : Feather;
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.typeTab,
        { backgroundColor: active ? colors.secondary : colors.inputBg },
      ]}
    >
      <Icon
        name={tab.icon}
        size={15}
        color={active ? "#fff" : colors.textSecondary}
      />
      <Text
        style={[
          styles.typeTabText,
          { color: active ? "#fff" : colors.textSecondary },
        ]}
      >
        {tab.label}
      </Text>
    </Pressable>
  );
}

function FieldLabel({ children, colors }) {
  return (
    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
      {children}
    </Text>
  );
}

function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  colors,
  error,
  keyboardType,
  autoCapitalize = "none",
  maxLength,
  style,
  editable = true,
}) {
  return (
    <View style={[styles.fieldGroup, style]}>
      <FieldLabel colors={colors}>{label}</FieldLabel>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        maxLength={maxLength}
        editable={editable}
        style={[
          styles.input,
          {
            backgroundColor: colors.inputBg,
            borderColor: error ? colors.error : colors.border,
            color: colors.text,
            opacity: editable ? 1 : 0.6,
          },
        ]}
      />
      {error ? (
        <Text style={[styles.fieldError, { color: colors.error }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

function UpiAppPicker({ selected, onSelect, colors }) {
  return (
    <View style={styles.upiAppRow}>
      {UPI_APPS.map((app) => {
        const active = selected === app.id;
        return (
          <Pressable
            key={app.id}
            onPress={() => onSelect(app.id)}
            style={[
              styles.upiAppChip,
              {
                borderColor: active ? app.color : colors.border,
                backgroundColor: active ? `${app.color}1A` : colors.inputBg,
              },
            ]}
          >
            <View style={[styles.upiAppBadge, { backgroundColor: app.color }]}>
              <Text style={styles.upiAppBadgeText}>{app.initial}</Text>
            </View>
            <Text
              style={[
                styles.upiAppChipText,
                { color: active ? colors.text : colors.textSecondary },
              ]}
              numberOfLines={1}
            >
              {app.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function PaymentMethodCard({
  method,
  onToggle,
  onRemove,
  onView,
  onEdit,
  colors,
  busy,
}) {
  const iconInfo = useMemo(() => {
    if (method.type === "upi") {
      const app = UPI_APPS.find((a) => a.id === method.appId) || UPI_APPS[3];
      return { kind: "badge", color: app.color, initial: app.initial };
    }
    if (method.type === "card") {
      return { kind: "icon", name: "credit-card", set: "feather" };
    }
    return { kind: "icon", name: "bank", set: "mci" };
  }, [method]);

  return (
    <View
      style={[
        styles.methodCard,
        Shadows.sm,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: method.active ? 1 : 0.55,
        },
      ]}
    >
      <View style={styles.methodLeft}>
        {iconInfo.kind === "badge" ? (
          <View
            style={[styles.methodBadge, { backgroundColor: iconInfo.color }]}
          >
            <Text style={styles.methodBadgeText}>{iconInfo.initial}</Text>
          </View>
        ) : (
          <View
            style={[styles.methodBadge, { backgroundColor: colors.surface }]}
          >
            {iconInfo.set === "mci" ? (
              <MaterialCommunityIcons
                name={iconInfo.name}
                size={18}
                color={colors.secondary}
              />
            ) : (
              <Feather
                name={iconInfo.name}
                size={18}
                color={colors.secondary}
              />
            )}
          </View>
        )}

        <View style={styles.methodTextCol}>
          <Text
            style={[styles.methodTitle, { color: colors.text }]}
            numberOfLines={1}
          >
            {method.title}
          </Text>
          <Text
            style={[styles.methodSubtitle, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {method.subtitle}
          </Text>
        </View>
      </View>

      <View style={styles.methodRight}>
        <Pressable
          onPress={() => onView(method)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.iconBtn}
        >
          <Feather name="eye" size={16} color={colors.textSecondary} />
        </Pressable>
        <Pressable
          onPress={() => onEdit(method)}
          disabled={busy}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.iconBtn}
        >
          <Feather name="edit-2" size={15} color={colors.secondary} />
        </Pressable>
        <Switch
          value={method.active}
          onValueChange={() => onToggle(method._id)}
          disabled={busy}
          trackColor={{ false: colors.border, true: colors.secondaryLight }}
          thumbColor={method.active ? colors.secondary : "#fff"}
          ios_backgroundColor={colors.border}
        />
        <Pressable
          onPress={() => onRemove(method._id)}
          disabled={busy}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.deleteBtn}
        >
          <Feather name="trash-2" size={15} color={colors.textMuted} />
        </Pressable>
      </View>
    </View>
  );
}

function EmptyState({ colors }) {
  return (
    <View style={[styles.emptyState, { borderColor: colors.border }]}>
      <Feather name="credit-card" size={28} color={colors.textMuted} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No payment methods yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Add a UPI ID, card, or bank account to start receiving payouts.
      </Text>
    </View>
  );
}

// ── View detail row ──
function DetailRow({ label, value, colors }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
        {label}
      </Text>
      <Text style={[styles.detailValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

// ── View modal ──
function ViewMethodModal({ method, onClose, colors }) {
  if (!method) return null;
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable
          style={[
            styles.modalCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalHeaderRow}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {method.title}
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Feather name="x" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>

          <View style={{ marginTop: SPACING.md, gap: SPACING.sm }}>
            <DetailRow
              label="Status"
              value={method.active ? "Active" : "Inactive"}
              colors={colors}
            />
            {method.type === "upi" && (
              <>
                <DetailRow
                  label="UPI App"
                  value={
                    UPI_APPS.find((a) => a.id === method.appId)?.name ||
                    "Other UPI"
                  }
                  colors={colors}
                />
                <DetailRow
                  label="UPI ID"
                  value={method.upiId}
                  colors={colors}
                />
              </>
            )}
            {method.type === "card" && (
              <>
                <DetailRow
                  label="Cardholder"
                  value={method.cardName}
                  colors={colors}
                />
                <DetailRow
                  label="Card number"
                  value={maskTail(method.cardNumber)}
                  colors={colors}
                />
                <DetailRow
                  label="Expiry"
                  value={method.cardExpiry}
                  colors={colors}
                />
              </>
            )}
            {method.type === "bank" && (
              <>
                <DetailRow
                  label="Account holder"
                  value={method.bankHolder}
                  colors={colors}
                />
                <DetailRow
                  label="Bank name"
                  value={method.bankName}
                  colors={colors}
                />
                <DetailRow
                  label="Account number"
                  value={maskTail(method.bankAccount)}
                  colors={colors}
                />
                <DetailRow
                  label="IFSC code"
                  value={method.bankIfsc}
                  colors={colors}
                />
              </>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ── Edit modal ──
function EditMethodModal({ method, onClose, onSave, saving, error, colors }) {
  const [form, setForm] = useState(() => ({ ...method }));
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm({ ...method });
    setErrors({});
  }, [method]);

  if (!method) return null;

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSave = () => {
    const newErrors = {};
    let updates = {};

    if (method.type === "upi") {
      if (!form.upiId?.trim() || !form.upiId.includes("@")) {
        newErrors.upiId = "Enter a valid UPI ID, e.g. name@bank";
      }
      updates = { appId: form.appId, upiId: form.upiId?.trim() };
    } else if (method.type === "card") {
      if (!form.cardName?.trim())
        newErrors.cardName = "Cardholder name is required";
      if (String(form.cardNumber || "").replace(/\s/g, "").length < 12)
        newErrors.cardNumber = "Enter a valid card number";
      if (!/^\d{2}\/\d{2}$/.test(form.cardExpiry || ""))
        newErrors.cardExpiry = "Use MM/YY format";
      updates = {
        cardName: form.cardName?.trim(),
        cardNumber: form.cardNumber,
        cardExpiry: form.cardExpiry,
      };
    } else if (method.type === "bank") {
      if (!form.bankHolder?.trim())
        newErrors.bankHolder = "Account holder name is required";
      if (String(form.bankAccount || "").replace(/\s/g, "").length < 6)
        newErrors.bankAccount = "Enter a valid account number";
      if (!IFSC_PATTERN.test((form.bankIfsc || "").trim().toUpperCase()))
        newErrors.bankIfsc = "Enter a valid IFSC code";
      if (!form.bankName?.trim()) newErrors.bankName = "Bank name is required";
      updates = {
        bankHolder: form.bankHolder?.trim(),
        bankAccount: form.bankAccount,
        bankIfsc: (form.bankIfsc || "").trim().toUpperCase(),
        bankName: form.bankName?.trim(),
      };
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    onSave(updates);
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable
          style={[
            styles.modalCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalHeaderRow}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Edit {method.title}
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Feather name="x" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>

          {error ? (
            <Text
              style={[
                styles.fieldError,
                { color: colors.error, marginTop: SPACING.sm },
              ]}
            >
              {error}
            </Text>
          ) : null}

          <View style={{ marginTop: SPACING.md }}>
            {method.type === "upi" && (
              <>
                <FieldLabel colors={colors}>Choose UPI app</FieldLabel>
                <UpiAppPicker
                  selected={form.appId}
                  onSelect={(id) => setField("appId", id)}
                  colors={colors}
                />
                <FormInput
                  label="UPI ID"
                  value={form.upiId}
                  onChangeText={(t) => setField("upiId", t)}
                  placeholder="yourname@okhdfcbank"
                  colors={colors}
                  error={errors.upiId}
                  style={{ marginTop: SPACING.md }}
                />
              </>
            )}

            {method.type === "card" && (
              <>
                <FormInput
                  label="Cardholder name"
                  value={form.cardName}
                  onChangeText={(t) => setField("cardName", t)}
                  placeholder="Name on card"
                  colors={colors}
                  error={errors.cardName}
                  autoCapitalize="words"
                />
                <FormInput
                  label="Card number"
                  value={form.cardNumber}
                  onChangeText={(t) => setField("cardNumber", t)}
                  placeholder="1234 5678 9012 3456"
                  colors={colors}
                  error={errors.cardNumber}
                  keyboardType="number-pad"
                  maxLength={19}
                  style={{ marginTop: SPACING.md }}
                />
                <FormInput
                  label="Expiry (MM/YY)"
                  value={form.cardExpiry}
                  onChangeText={(t) => setField("cardExpiry", t)}
                  placeholder="MM/YY"
                  colors={colors}
                  error={errors.cardExpiry}
                  keyboardType="default"
                  maxLength={5}
                  style={{ marginTop: SPACING.md }}
                />
              </>
            )}

            {method.type === "bank" && (
              <>
                <FormInput
                  label="Account holder name"
                  value={form.bankHolder}
                  onChangeText={(t) => setField("bankHolder", t)}
                  placeholder="As per bank records"
                  colors={colors}
                  error={errors.bankHolder}
                  autoCapitalize="words"
                />
                <FormInput
                  label="Bank name"
                  value={form.bankName}
                  onChangeText={(t) => setField("bankName", t)}
                  placeholder="e.g. HDFC Bank"
                  colors={colors}
                  error={errors.bankName}
                  autoCapitalize="words"
                  style={{ marginTop: SPACING.md }}
                />
                <FormInput
                  label="Account number"
                  value={form.bankAccount}
                  onChangeText={(t) => setField("bankAccount", t)}
                  placeholder="Account number"
                  colors={colors}
                  error={errors.bankAccount}
                  keyboardType="number-pad"
                  style={{ marginTop: SPACING.md }}
                />
                <FormInput
                  label="IFSC code"
                  value={form.bankIfsc}
                  onChangeText={(t) => setField("bankIfsc", t.toUpperCase())}
                  placeholder="e.g. HDFC0001234"
                  colors={colors}
                  error={errors.bankIfsc}
                  autoCapitalize="characters"
                  maxLength={11}
                  style={{ marginTop: SPACING.md }}
                />
              </>
            )}

            <Pressable
              onPress={handleSave}
              disabled={saving}
              style={[
                styles.submitBtn,
                {
                  backgroundColor: colors.secondary,
                  opacity: saving ? 0.6 : 1,
                },
              ]}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Feather name="check" size={16} color="#fff" />
                  <Text style={styles.submitBtnText}>Save changes</Text>
                </>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────────────────────────

export default function PaymentMethods() {
  const { colors } = useTheme();
  const grid = useGridConfig();
  const dispatch = useDispatch();

  // TODO: confirm this matches your authSlice's actual state shape
  const vendorId = useSelector(
    (state) => state.auth.vendor?._id || state.auth.user?._id,
  );

  const methods = useSelector(selectPaymentMethods);
  const status = useSelector(selectPaymentMethodsStatus);
  const mutationError = useSelector(selectPaymentMethodsError);
  const mutationStatus = useSelector(
    (state) => state.vendorPayment.mutationStatus,
  );

  const [activeTab, setActiveTab] = useState("upi");

  const [upiApp, setUpiApp] = useState("gpay");
  const [upiId, setUpiId] = useState("");
  const [upiError, setUpiError] = useState("");

  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardErrors, setCardErrors] = useState({});

  const [bankHolder, setBankHolder] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankErrors, setBankErrors] = useState({});

  // ── View / Edit modal state ──
  const [viewMethod, setViewMethod] = useState(null);
  const [editMethod, setEditMethod] = useState(null);
  const [editError, setEditError] = useState("");

  const contentWidth = grid.screenWidth - PAGE_PADDING * 2;
  const formMaxWidth = grid.isTablet ? 480 : contentWidth;
  const useTwoColumns = grid.isTablet;

  useEffect(() => {
    if (vendorId) dispatch(fetchPaymentMethods(vendorId));
  }, [vendorId, dispatch]);

  const resetUpiForm = () => {
    setUpiApp("gpay");
    setUpiId("");
    setUpiError("");
  };
  const resetCardForm = () => {
    setCardName("");
    setCardNumber("");
    setCardExpiry("");
    setCardErrors({});
  };
  const resetBankForm = () => {
    setBankHolder("");
    setBankAccount("");
    setBankIfsc("");
    setBankName("");
    setBankErrors({});
  };

  const isSaving = mutationStatus === "loading";

  const handleAddUpi = async () => {
    if (!vendorId) {
      setUpiError("Vendor session not loaded yet — please try again.");
      return;
    }
    if (!upiId.trim() || !upiId.includes("@")) {
      setUpiError("Enter a valid UPI ID, e.g. name@bank");
      return;
    }
    dispatch(clearPaymentMutationError());
    const result = await dispatch(
      addPaymentMethod({
        vendorId,
        method: { type: "upi", appId: upiApp, upiId: upiId.trim() },
      }),
    );
    if (addPaymentMethod.fulfilled.match(result)) resetUpiForm();
  };

  const handleAddCard = async () => {
    const errors = {};
    if (!cardName.trim()) errors.name = "Cardholder name is required";
    if (cardNumber.replace(/\s/g, "").length < 12)
      errors.number = "Enter a valid card number";
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) errors.expiry = "Use MM/YY format";
    setCardErrors(errors);
    if (Object.keys(errors).length > 0) return;

    dispatch(clearPaymentMutationError());
    const result = await dispatch(
      addPaymentMethod({
        vendorId,
        method: {
          type: "card",
          cardName: cardName.trim(),
          cardNumber,
          cardExpiry,
        },
      }),
    );
    if (addPaymentMethod.fulfilled.match(result)) resetCardForm();
  };

  const handleAddBank = async () => {
    const errors = {};
    if (!bankHolder.trim()) errors.holder = "Account holder name is required";
    if (bankAccount.replace(/\s/g, "").length < 6)
      errors.account = "Enter a valid account number";
    if (!IFSC_PATTERN.test(bankIfsc.trim().toUpperCase()))
      errors.ifsc = "Enter a valid IFSC code";
    if (!bankName.trim()) errors.bankName = "Bank name is required";
    setBankErrors(errors);
    if (Object.keys(errors).length > 0) return;

    dispatch(clearPaymentMutationError());
    const result = await dispatch(
      addPaymentMethod({
        vendorId,
        method: {
          type: "bank",
          bankHolder: bankHolder.trim(),
          bankAccount,
          bankIfsc: bankIfsc.trim().toUpperCase(),
          bankName: bankName.trim(),
        },
      }),
    );
    if (addPaymentMethod.fulfilled.match(result)) resetBankForm();
  };

  const toggleActive = (id) => {
    dispatch(togglePaymentMethodStatus({ vendorId, id }));
  };

  const removeMethod = (id) => {
    dispatch(deletePaymentMethod({ vendorId, id }));
  };

  const openView = (method) => setViewMethod(method);
  const closeView = () => setViewMethod(null);

  const openEdit = (method) => {
    setEditError("");
    setEditMethod(method);
  };
  const closeEdit = () => {
    setEditMethod(null);
    setEditError("");
  };

  const handleSaveEdit = async (updates) => {
    if (!vendorId || !editMethod) return;
    setEditError("");
    const result = await dispatch(
      updatePaymentMethod({ vendorId, id: editMethod._id, updates }),
    );
    if (updatePaymentMethod.fulfilled.match(result)) {
      closeEdit();
    } else {
      setEditError(result.payload || "Failed to update payment method");
    }
  };

  const activeCount = methods.filter((m) => m.active).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* ── Header ── */}
      <View style={styles.headerBlock}>
        <Pressable
          onPress={() => router.canGoBack() && router.back()}
          style={[
            styles.backbtn,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={20} color={colors.text} />
        </Pressable>
        <View style={{ gap: 2 }}>
          <Text style={[styles.title, { color: colors.text }]}>
            Payment Methods
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {status === "loading"
              ? "Loading..."
              : methods.length === 0
                ? "Add how you'd like to get paid"
                : `${activeCount} of ${methods.length} active`}
          </Text>
        </View>
      </View>
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Add new method card ── */}
        <View
          style={[
            styles.card,
            Shadows.sm,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              maxWidth: formMaxWidth,
              width: "100%",
              alignSelf: "center",
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Add a payment method
          </Text>

          {mutationError ? (
            <Text style={[styles.fieldError, { color: colors.error }]}>
              {mutationError}
            </Text>
          ) : null}

          <View style={styles.typeTabRow}>
            {METHOD_TABS.map((tab) => (
              <TypeTab
                key={tab.id}
                tab={tab}
                active={activeTab === tab.id}
                onPress={() => setActiveTab(tab.id)}
                colors={colors}
              />
            ))}
          </View>

          {/* ── UPI form ── */}
          {activeTab === "upi" && (
            <View style={styles.formBlock}>
              <FieldLabel colors={colors}>Choose UPI app</FieldLabel>
              <UpiAppPicker
                selected={upiApp}
                onSelect={setUpiApp}
                colors={colors}
              />
              <FormInput
                label="UPI ID"
                value={upiId}
                onChangeText={(t) => {
                  setUpiId(t);
                  if (upiError) setUpiError("");
                }}
                placeholder="yourname@okhdfcbank"
                colors={colors}
                error={upiError}
                style={{ marginTop: SPACING.md }}
              />
              <Pressable
                onPress={handleAddUpi}
                disabled={isSaving}
                style={[
                  styles.submitBtn,
                  {
                    backgroundColor: colors.secondary,
                    opacity: isSaving ? 0.6 : 1,
                  },
                ]}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Feather name="plus" size={16} color="#fff" />
                    <Text style={styles.submitBtnText}>Add UPI ID</Text>
                  </>
                )}
              </Pressable>
            </View>
          )}

          {/* ── Card form ── */}
          {activeTab === "card" && (
            <View style={styles.formBlock}>
              <FormInput
                label="Cardholder name"
                value={cardName}
                onChangeText={(t) => {
                  setCardName(t);
                  if (cardErrors.name)
                    setCardErrors((e) => ({ ...e, name: undefined }));
                }}
                placeholder="Name on card"
                colors={colors}
                error={cardErrors.name}
                autoCapitalize="words"
              />
              <FormInput
                label="Card number"
                value={cardNumber}
                onChangeText={(t) => {
                  setCardNumber(t);
                  if (cardErrors.number)
                    setCardErrors((e) => ({ ...e, number: undefined }));
                }}
                placeholder="1234 5678 9012 3456"
                colors={colors}
                error={cardErrors.number}
                keyboardType="number-pad"
                maxLength={19}
                style={{ marginTop: SPACING.md }}
              />
              <View
                style={[
                  styles.fieldRow,
                  { marginTop: SPACING.md, flexDirection: "row" },
                ]}
              >
                <FormInput
                  label="Expiry (MM/YY)"
                  value={cardExpiry}
                  onChangeText={(t) => {
                    setCardExpiry(t);
                    if (cardErrors.expiry)
                      setCardErrors((e) => ({ ...e, expiry: undefined }));
                  }}
                  placeholder="MM/YY"
                  colors={colors}
                  error={cardErrors.expiry}
                  keyboardType={"default"}
                  maxLength={5}
                  style={{ flex: useTwoColumns ? undefined : 1 }}
                />
              </View>
              <Pressable
                onPress={handleAddCard}
                disabled={isSaving}
                style={[
                  styles.submitBtn,
                  {
                    backgroundColor: colors.secondary,
                    opacity: isSaving ? 0.6 : 1,
                  },
                ]}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Feather name="plus" size={16} color="#fff" />
                    <Text style={styles.submitBtnText}>Add Card</Text>
                  </>
                )}
              </Pressable>
            </View>
          )}

          {/* ── Bank form ── */}
          {activeTab === "bank" && (
            <View style={styles.formBlock}>
              <FormInput
                label="Account holder name"
                value={bankHolder}
                onChangeText={(t) => {
                  setBankHolder(t);
                  if (bankErrors.holder)
                    setBankErrors((e) => ({ ...e, holder: undefined }));
                }}
                placeholder="As per bank records"
                colors={colors}
                error={bankErrors.holder}
                autoCapitalize="words"
              />
              <FormInput
                label="Bank name"
                value={bankName}
                onChangeText={(t) => {
                  setBankName(t);
                  if (bankErrors.bankName)
                    setBankErrors((e) => ({ ...e, bankName: undefined }));
                }}
                placeholder="e.g. HDFC Bank"
                colors={colors}
                error={bankErrors.bankName}
                autoCapitalize="words"
                style={{ marginTop: SPACING.md }}
              />
              <FormInput
                label="Account number"
                value={bankAccount}
                onChangeText={(t) => {
                  setBankAccount(t);
                  if (bankErrors.account)
                    setBankErrors((e) => ({ ...e, account: undefined }));
                }}
                placeholder="Account number"
                colors={colors}
                error={bankErrors.account}
                keyboardType="number-pad"
                style={{ marginTop: SPACING.md }}
              />
              <FormInput
                label="IFSC code"
                value={bankIfsc}
                onChangeText={(t) => {
                  setBankIfsc(t.toUpperCase());
                  if (bankErrors.ifsc)
                    setBankErrors((e) => ({ ...e, ifsc: undefined }));
                }}
                placeholder="e.g. HDFC0001234"
                colors={colors}
                error={bankErrors.ifsc}
                autoCapitalize="characters"
                maxLength={11}
                style={{ marginTop: SPACING.md }}
              />
              <Pressable
                onPress={handleAddBank}
                disabled={isSaving}
                style={[
                  styles.submitBtn,
                  {
                    backgroundColor: colors.secondary,
                    opacity: isSaving ? 0.6 : 1,
                  },
                ]}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Feather name="plus" size={16} color="#fff" />
                    <Text style={styles.submitBtnText}>Add Bank Account</Text>
                  </>
                )}
              </Pressable>
            </View>
          )}
        </View>

        {/* ── Saved methods list ── */}
        <View style={styles.listBlock}>
          <Text style={[styles.listHeading, { color: colors.text }]}>
            Saved methods
          </Text>

          {status === "loading" ? (
            <ActivityIndicator color={colors.secondary} />
          ) : methods.length === 0 ? (
            <EmptyState colors={colors} />
          ) : (
            <View style={{ gap: SPACING.sm }}>
              {methods.map((m) => (
                <PaymentMethodCard
                  key={m._id}
                  method={m}
                  onToggle={toggleActive}
                  onRemove={removeMethod}
                  onView={openView}
                  onEdit={openEdit}
                  colors={colors}
                  busy={isSaving}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <ViewMethodModal
        method={viewMethod}
        onClose={closeView}
        colors={colors}
      />
      <EditMethodModal
        method={editMethod}
        onClose={closeEdit}
        onSave={handleSaveEdit}
        saving={isSaving}
        error={editError}
        colors={colors}
      />
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.huge,
    gap: SPACING.xl,
  },
  headerBlock: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: SPACING.xl,
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: 20,
  },
  backbtn: {
    height: 38,
    width: 38,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: { ...Typography.heading2 },
  subtitle: { ...Typography.caption },
  card: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  cardTitle: { ...Typography.heading3, fontSize: 15 },
  typeTabRow: { flexDirection: "row", gap: SPACING.sm },
  typeTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
    paddingVertical: SPACING.sm + 2,
    borderRadius: Radii.md,
  },
  typeTabText: { ...Typography.caption, fontWeight: "700" },
  formBlock: { gap: 0 },
  fieldGroup: { gap: SPACING.xs },
  fieldRow: { gap: SPACING.md },
  fieldLabel: { ...Typography.label, fontSize: 11 },
  input: {
    borderWidth: 1,
    borderRadius: Radii.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
    fontSize: 14.5,
  },
  fieldError: { ...Typography.caption, fontSize: 11, marginTop: 2 },
  upiAppRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  upiAppChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    borderWidth: 1.5,
    borderRadius: Radii.full,
    paddingVertical: 6,
    paddingRight: 12,
    paddingLeft: 6,
  },
  upiAppBadge: {
    width: 22,
    height: 22,
    borderRadius: Radii.full,
    alignItems: "center",
    justifyContent: "center",
  },
  upiAppBadgeText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  upiAppChipText: { fontSize: 12, fontWeight: "600" },
  submitBtn: {
    marginTop: SPACING.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
    borderRadius: Radii.md,
  },
  submitBtnText: { ...Typography.button, fontSize: 14.5, color: "#fff" },
  listBlock: { gap: SPACING.md },
  listHeading: { ...Typography.heading3, fontSize: 15 },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: Radii.lg,
    padding: SPACING.md,
  },
  methodLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    flex: 1,
  },
  methodBadge: {
    width: 40,
    height: 40,
    borderRadius: Radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  methodBadgeText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  methodTextCol: { flex: 1, gap: 2 },
  methodTitle: { ...Typography.bodyMedium, fontSize: 14.5 },
  methodSubtitle: { ...Typography.caption, fontSize: 12 },
  methodRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  iconBtn: { padding: 4 },
  deleteBtn: { padding: 4 },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.huge,
    gap: SPACING.sm,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: Radii.lg,
  },
  emptyTitle: { ...Typography.bodyMedium, fontSize: 14.5 },
  emptySubtitle: {
    ...Typography.caption,
    fontSize: 12.5,
    textAlign: "center",
    maxWidth: 260,
  },
  // ── Modal styles ──
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: SPACING.lg,
  },
  modalHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: { ...Typography.heading3, fontSize: 16, flexShrink: 1 },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  detailLabel: { ...Typography.caption, fontSize: 12.5 },
  detailValue: { ...Typography.bodyMedium, fontSize: 13.5 },
});
