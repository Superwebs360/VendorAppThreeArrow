import { useGridConfig } from "@/constants/gridConfig";
import { useTheme } from "@/constants/theme";
import { selectVendorUser } from "@/redux/authSlice";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import {
  clearError,
  createVendorStoreInformation,
  getMyStoreInformation,
  selectSaveError,
  selectStoreError,
  selectStoreExists,
  selectStoreInfo,
  selectStoreLoading,
  selectStoreSaving,
  updateVendorStoreInformation,
} from "../../../../../../redux/vendorstoreinformationSlice";

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

const DEFAULT_DAY = { open: "09:00", close: "21:00", closed: false };

const buildDefaultWeek = () =>
  DAYS.reduce((acc, d) => {
    acc[d.key] = { ...DEFAULT_DAY };
    return acc;
  }, {});

// ─── Validators ───────────────────────────────────────────────────────────────

const isValidTime = (val) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(val.trim());
const isValidDate = (val) => /^\d{4}-\d{2}-\d{2}$/.test(val.trim());

// ─── Main Component ───────────────────────────────────────────────────────────

const BusinessHours = () => {
  const { colors, typography, shadows } = useTheme();
  const { horizontalPad } = useGridConfig();
  const router = useRouter();
  const dispatch = useDispatch();

  const vendorUser = useSelector(selectVendorUser);
  const storeInfo = useSelector(selectStoreInfo);
  const loading = useSelector(selectStoreLoading);
  const error = useSelector(selectStoreError);
  const saving = useSelector(selectStoreSaving);
  const saveError = useSelector(selectSaveError);
  const storeExists = useSelector(selectStoreExists);

  // ── Form state ─────────────────────────────────────────────────────────────
  const [week, setWeek] = useState(buildDefaultWeek());
  const [holidays, setHolidays] = useState([]); // [{date, reason}]
  const [newHolidayDate, setNewHolidayDate] = useState("");
  const [newHolidayReason, setNewHolidayReason] = useState("");
  const [autoOpenClose, setAutoOpenClose] = useState(false);

  const hasFetched = useRef(false);

  useEffect(() => {
    if (vendorUser?._id && !hasFetched.current) {
      hasFetched.current = true;
      dispatch(getMyStoreInformation());
    }
  }, [vendorUser?._id, dispatch]);

  // ── Hydrate form whenever storeInfo changes ────────────────────────────────
  useEffect(() => {
    if (!storeInfo) return;

    const oh = storeInfo.operatingHours ?? {};

    const hydratedWeek = buildDefaultWeek();
    DAYS.forEach(({ key }) => {
      if (oh[key]) {
        hydratedWeek[key] = {
          open: oh[key].open ?? DEFAULT_DAY.open,
          close: oh[key].close ?? DEFAULT_DAY.close,
          closed: !!oh[key].closed,
        };
      }
    });
    setWeek(hydratedWeek);

    setHolidays(
      Array.isArray(oh.holidaySchedule)
        ? oh.holidaySchedule.map((h) => ({
            date: h.date ?? "",
            reason: h.reason ?? "",
          }))
        : [],
    );

    setAutoOpenClose(!!oh.autoOpenClose?.enabled);
  }, [storeInfo]);

  // ── Day field helpers ───────────────────────────────────────────────────────
  const updateDay = (key, field, value) => {
    setWeek((w) => ({ ...w, [key]: { ...w[key], [field]: value } }));
  };

  const toggleClosed = (key) => {
    setWeek((w) => ({
      ...w,
      [key]: { ...w[key], closed: !w[key].closed },
    }));
  };

  // Copy Monday's hours to all other days (quick-fill convenience)
  const copyMondayToAll = () => {
    const mon = week.monday;
    setWeek((w) => {
      const next = { ...w };
      DAYS.forEach(({ key }) => {
        if (key !== "monday") next[key] = { ...mon };
      });
      return next;
    });
  };

  // ── Holiday helpers ─────────────────────────────────────────────────────────
  const addHoliday = () => {
    if (!newHolidayDate.trim()) {
      Alert.alert("Required", "Please enter a date for the holiday.");
      return;
    }
    if (!isValidDate(newHolidayDate)) {
      Alert.alert("Invalid Date", "Use format YYYY-MM-DD, e.g. 2026-08-15.");
      return;
    }
    if (holidays.some((h) => h.date === newHolidayDate.trim())) {
      Alert.alert("Duplicate", "This date is already in your holiday list.");
      return;
    }
    setHolidays((h) => [
      ...h,
      { date: newHolidayDate.trim(), reason: newHolidayReason.trim() },
    ]);
    setNewHolidayDate("");
    setNewHolidayReason("");
  };

  const removeHoliday = (date) => {
    setHolidays((h) => h.filter((item) => item.date !== date));
  };

  // ── Pre-save validation ────────────────────────────────────────────────────
  const validateForm = () => {
    for (const { key, label } of DAYS) {
      const d = week[key];
      if (d.closed) continue;
      if (!isValidTime(d.open) || !isValidTime(d.close)) {
        Alert.alert(
          "Invalid Time",
          `${label}: please use HH:MM (24-hour) format for open/close time.`,
        );
        return false;
      }
    }
    return true;
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const operatingHoursPayload = {};
      DAYS.forEach(({ key }) => {
        operatingHoursPayload[key] = {
          open: week[key].open.trim(),
          close: week[key].close.trim(),
          closed: !!week[key].closed,
        };
      });
      operatingHoursPayload.holidaySchedule = holidays;
      operatingHoursPayload.autoOpenClose = { enabled: autoOpenClose };

      const formData = new FormData();
      formData.append("operatingHours", JSON.stringify(operatingHoursPayload));

      const result = storeExists
        ? await dispatch(
            updateVendorStoreInformation({
              vendorId: vendorUser._id,
              formData,
            }),
          )
        : await dispatch(createVendorStoreInformation(formData));

      const isSuccess = storeExists
        ? updateVendorStoreInformation.fulfilled.match(result)
        : createVendorStoreInformation.fulfilled.match(result);

      if (isSuccess) {
        Alert.alert("Saved", "Business hours updated successfully.", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert(
          "Error",
          result.payload || "Failed to save business hours.",
        );
      }
    } catch (err) {
      Alert.alert("Error", "An unexpected error occurred while saving.");
      console.error("Save business hours error:", err);
    }
  };

  // ── Loading state ────────────────────────────────────────────────────────────
  if (loading && storeExists === null) {
    return (
      <SafeAreaView
        style={[styles.root, { backgroundColor: colors.background }]}
        edges={["top", "left", "right"]}
      >
        <Header colors={colors} typography={typography} router={router} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.secondary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading business hours...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: colors.background }]}
      edges={["top", "left", "right", "bottom"]}
    >
      <Header colors={colors} typography={typography} router={router} />

      {error && (
        <ErrorBanner
          message={error}
          colors={colors}
          onDismiss={() => dispatch(clearError())}
        />
      )}
      {saveError && (
        <ErrorBanner
          message={saveError}
          colors={colors}
          onDismiss={() => dispatch(clearError())}
        />
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.body, { paddingHorizontal: horizontalPad * 2 }]}>
            {/* ── Intro card ── */}
            <View
              style={[
                styles.introCard,
                {
                  backgroundColor: colors.secondary + "0C",
                  borderColor: colors.secondary + "28",
                },
              ]}
            >
              <View
                style={[
                  styles.introIconWrap,
                  { backgroundColor: colors.secondary + "18" },
                ]}
              >
                <Ionicons name="time" size={20} color={colors.secondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.introTitle,
                    { color: colors.text, ...typography.bodyMedium },
                  ]}
                >
                  Set when customers can order
                </Text>
                <Text
                  style={[
                    styles.introSub,
                    { color: colors.textSecondary, ...typography.caption },
                  ]}
                >
                  Shown on your store page. Closed days won't receive orders.
                </Text>
              </View>
            </View>

            {/* ── Section: Weekly Schedule ── */}
            <View style={styles.sectionHeaderRow}>
              <SectionLabel
                icon="calendar-outline"
                text="Weekly Schedule"
                colors={colors}
                typography={typography}
              />
              <TouchableOpacity
                onPress={copyMondayToAll}
                style={[
                  styles.copyAllBtn,
                  {
                    backgroundColor: colors.secondary + "10",
                    borderColor: colors.secondary + "28",
                  },
                ]}
              >
                <Ionicons
                  name="copy-outline"
                  size={13}
                  color={colors.secondary}
                />
                <Text
                  style={[
                    styles.copyAllTxt,
                    { color: colors.secondary, ...typography.caption },
                  ]}
                >
                  Copy Mon to all
                </Text>
              </TouchableOpacity>
            </View>

            {DAYS.map(({ key, label }) => (
              <DayRow
                key={key}
                label={label}
                day={week[key]}
                onChangeOpen={(v) => updateDay(key, "open", v)}
                onChangeClose={(v) => updateDay(key, "close", v)}
                onToggleClosed={() => toggleClosed(key)}
                saving={saving}
                colors={colors}
                typography={typography}
              />
            ))}

            {/* ── Section: Holiday Schedule ── */}
            <SectionLabel
              icon="airplane-outline"
              text="Holiday Schedule"
              colors={colors}
              typography={typography}
              style={{ marginTop: 22 }}
            />

            {holidays.length > 0 && (
              <View style={{ marginBottom: 14, gap: 8 }}>
                {holidays.map((h) => (
                  <View
                    key={h.date}
                    style={[
                      styles.holidayRow,
                      {
                        backgroundColor: colors.inputBg,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.holidayDatePill,
                        { backgroundColor: colors.secondary + "15" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.holidayDateTxt,
                          { color: colors.secondary },
                        ]}
                      >
                        {h.date}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.holidayReasonTxt,
                        { color: colors.textSecondary, flex: 1 },
                      ]}
                      numberOfLines={1}
                    >
                      {h.reason || "Closed"}
                    </Text>
                    <TouchableOpacity
                      onPress={() => removeHoliday(h.date)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={17}
                        color={colors.error}
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <View
              style={[
                styles.addHolidayCard,
                { backgroundColor: colors.inputBg, borderColor: colors.border },
              ]}
            >
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TextInput
                  value={newHolidayDate}
                  onChangeText={setNewHolidayDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.placeholder}
                  editable={!saving}
                  style={[
                    styles.input,
                    {
                      flex: 1,
                      color: colors.text,
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                />
                <TextInput
                  value={newHolidayReason}
                  onChangeText={setNewHolidayReason}
                  placeholder="Reason (optional)"
                  placeholderTextColor={colors.placeholder}
                  editable={!saving}
                  style={[
                    styles.input,
                    {
                      flex: 1.3,
                      color: colors.text,
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                />
              </View>
              <TouchableOpacity
                onPress={addHoliday}
                disabled={saving}
                style={[
                  styles.addHolidayBtn,
                  {
                    backgroundColor: colors.secondary,
                    opacity: saving ? 0.6 : 1,
                  },
                ]}
              >
                <Ionicons name="add" size={16} color="#fff" />
                <Text style={styles.addHolidayBtnTxt}>Add Holiday</Text>
              </TouchableOpacity>
            </View>

            {/* ── Section: Auto Open/Close ── */}
            <SectionLabel
              icon="flash-outline"
              text="Auto Open/Close"
              colors={colors}
              typography={typography}
              style={{ marginTop: 22 }}
            />

            <View
              style={[
                styles.autoCard,
                { backgroundColor: colors.inputBg, borderColor: colors.border },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.autoTitle,
                    { color: colors.text, ...typography.bodyMedium },
                  ]}
                >
                  Auto switch store status
                </Text>
                <Text
                  style={[
                    styles.autoSub,
                    { color: colors.textSecondary, ...typography.caption },
                  ]}
                >
                  Store opens/closes automatically based on your weekly schedule
                  above.
                </Text>
              </View>
              <Switch
                value={autoOpenClose}
                onValueChange={setAutoOpenClose}
                disabled={saving}
                trackColor={{
                  false: colors.border,
                  true: colors.secondary + "80",
                }}
                thumbColor={autoOpenClose ? colors.secondary : "#f4f3f4"}
              />
            </View>

            {/* ── Info box ── */}
            <View
              style={[
                styles.infoBox,
                {
                  backgroundColor: colors.secondary + "08",
                  borderColor: colors.secondary + "25",
                },
              ]}
            >
              <Ionicons
                name="information-circle"
                size={18}
                color={colors.secondary}
              />
              <Text
                style={[
                  styles.infoText,
                  { color: colors.textSecondary, flex: 1 },
                ]}
              >
                If Auto Open/Close is off, you'll need to toggle your store
                status manually each day.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Save bar ── */}
      <View
        style={[
          styles.saveBar,
          { backgroundColor: colors.background, borderTopColor: colors.border },
        ]}
      >
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={[
            styles.saveBtn,
            {
              backgroundColor: colors.secondary,
              opacity: saving ? 0.7 : 1,
              ...shadows.secondary,
            },
          ]}
        >
          {saving ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={[styles.saveBtnTxt, { ...typography.button }]}>
                Saving...
              </Text>
            </>
          ) : (
            <Text style={[styles.saveBtnTxt, { ...typography.button }]}>
              Save Changes
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ─── Header ───────────────────────────────────────────────────────────────────

const Header = ({ colors, typography, router }) => (
  <View
    style={[
      styles.header,
      { backgroundColor: colors.background, borderBottomColor: colors.border },
    ]}
  >
    <TouchableOpacity
      onPress={() => router.back()}
      style={[
        styles.backBtn,
        { backgroundColor: colors.background, borderColor: colors.border },
      ]}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons name="chevron-back" size={20} color={colors.text} />
    </TouchableOpacity>

    <View style={styles.headerCenter}>
      <Text
        style={[
          styles.headerTitle,
          { color: colors.text, ...typography.heading3 },
        ]}
      >
        Business Hours
      </Text>
      <Text
        style={[
          styles.headerSub,
          { color: colors.textSecondary, ...typography.caption },
        ]}
      >
        Hours, holidays & auto status
      </Text>
    </View>

    <View
      style={[
        styles.headerBadge,
        {
          backgroundColor: colors.secondary + "18",
          borderColor: colors.secondary + "35",
        },
      ]}
    >
      <Ionicons name="time" size={17} color={colors.secondary} />
    </View>
  </View>
);

// ─── Error banner ─────────────────────────────────────────────────────────────

const ErrorBanner = ({ message, colors, onDismiss }) => (
  <View
    style={[
      styles.errorAlert,
      {
        backgroundColor: colors.error + "15",
        borderColor: colors.error + "35",
      },
    ]}
  >
    <Ionicons name="alert-circle" size={18} color={colors.error} />
    <Text style={[styles.errorText, { color: colors.error, flex: 1 }]}>
      {message}
    </Text>
    <TouchableOpacity onPress={onDismiss}>
      <Ionicons name="close" size={18} color={colors.error} />
    </TouchableOpacity>
  </View>
);

// ─── Section label ────────────────────────────────────────────────────────────

const SectionLabel = ({ icon, text, colors, typography, style }) => (
  <View style={[styles.sectionLabelRow, style]}>
    <Ionicons name={icon} size={15} color={colors.secondary} />
    <Text
      style={[
        styles.sectionLabelTxt,
        { color: colors.text, ...typography.bodyMedium },
      ]}
    >
      {text}
    </Text>
  </View>
);

// ─── Day row ──────────────────────────────────────────────────────────────────

const DayRow = ({
  label,
  day,
  onChangeOpen,
  onChangeClose,
  onToggleClosed,
  saving,
  colors,
  typography,
}) => (
  <View
    style={[
      styles.dayRow,
      { backgroundColor: colors.inputBg, borderColor: colors.border },
    ]}
  >
    <View style={styles.dayRowTop}>
      <Text
        style={[
          styles.dayLabel,
          { color: colors.text, ...typography.bodyMedium },
        ]}
      >
        {label}
      </Text>
      <View style={styles.dayClosedToggle}>
        <Text
          style={[
            styles.dayClosedLabel,
            { color: day.closed ? colors.error : colors.textSecondary },
          ]}
        >
          {day.closed ? "Closed" : "Open"}
        </Text>
        <Switch
          value={!day.closed}
          onValueChange={onToggleClosed}
          disabled={saving}
          trackColor={{ false: colors.border, true: colors.secondary + "80" }}
          thumbColor={!day.closed ? colors.secondary : "#f4f3f4"}
        />
      </View>
    </View>

    {!day.closed && (
      <View style={styles.dayTimesRow}>
        <View style={styles.timeField}>
          <Text style={[styles.timeFieldLabel, { color: colors.textMuted }]}>
            Opening Time
          </Text>
          <TextInput
            value={day.open}
            onChangeText={onChangeOpen}
            placeholder="09:00"
            placeholderTextColor={colors.placeholder}
            editable={!saving}
            maxLength={5}
            style={[
              styles.timeInput,
              {
                color: colors.text,
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
          />
        </View>
        <Ionicons
          name="arrow-forward"
          size={14}
          color={colors.textMuted}
          style={{ marginTop: 22 }}
        />
        <View style={styles.timeField}>
          <Text style={[styles.timeFieldLabel, { color: colors.textMuted }]}>
            Closing Time
          </Text>
          <TextInput
            value={day.close}
            onChangeText={onChangeClose}
            placeholder="21:00"
            placeholderTextColor={colors.placeholder}
            editable={!saving}
            maxLength={5}
            style={[
              styles.timeInput,
              {
                color: colors.text,
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
          />
        </View>
      </View>
    )}
  </View>
);

export default BusinessHours;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: { flex: 1 },
  headerTitle: { fontWeight: "700", marginBottom: 1 },
  headerSub: { opacity: 0.7 },
  headerBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: { fontSize: 14 },

  errorAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  errorText: { fontSize: 13, fontWeight: "500" },

  body: { paddingTop: 20, gap: 4 },

  introCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 26,
  },
  introIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  introTitle: { fontWeight: "600", marginBottom: 2 },
  introSub: { lineHeight: 17 },

  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sectionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 14,
  },
  sectionLabelTxt: { fontWeight: "700" },

  copyAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  copyAllTxt: { fontWeight: "600" },

  dayRow: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  dayRowTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dayLabel: { fontWeight: "600" },
  dayClosedToggle: { flexDirection: "row", alignItems: "center", gap: 8 },
  dayClosedLabel: { fontSize: 12, fontWeight: "600" },

  dayTimesRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 14,
  },
  timeField: { flex: 1 },
  timeFieldLabel: { fontSize: 11, marginBottom: 6, fontStyle: "italic" },
  timeInput: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },

  holidayRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  holidayDatePill: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  holidayDateTxt: { fontSize: 12, fontWeight: "700" },
  holidayReasonTxt: { fontSize: 13 },

  addHolidayCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    gap: 10,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  addHolidayBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 10,
    paddingVertical: 11,
  },
  addHolidayBtnTxt: { color: "#fff", fontWeight: "700", fontSize: 13 },

  autoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 4,
  },
  autoTitle: { fontWeight: "600", marginBottom: 2 },
  autoSub: { lineHeight: 16 },

  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 18,
    marginBottom: 20,
  },
  infoText: { fontSize: 13 },

  saveBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
  },
  saveBtn: {
    height: 54,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveBtnTxt: { color: "#fff" },
});
