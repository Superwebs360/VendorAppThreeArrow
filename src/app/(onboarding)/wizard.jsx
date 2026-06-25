// wizard.jsx  ── Main Onboarding Wizard
// On mount: fetches vendor profile → hydrates form if draft → resumes from last filled step
// When navigated from bussiness_info with ?edit=1, skips the pending→redirect gate
// so vendor can edit and resubmit without being bounced back immediately.
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { router, useLocalSearchParams } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { COMPONENT, SAFE_AREA, SPACING } from "../../constants/gridConfig";
import { useTheme } from "../../constants/theme";
import {
  fetchMyVendorProfile,
  selectVendorError,
  selectVendorFetchStatus,
  selectVendorFormData,
  selectVendorProfile,
  selectVendorSubmitStatus,
  setField,
  submitVendorApplication,
} from "../../redux/vendorInfoSlice";

import { SafeAreaView } from "react-native-safe-area-context";
import Step1BusinessDetails from "../../component/OnboardingComponent/Step1BusinessDetails";
import Step2SellerDetails from "../../component/OnboardingComponent/Step2SellerDetails";
import Step3BrandDetails from "../../component/OnboardingComponent/Step3BrandDetails";
import Step4BankDetails from "../../component/OnboardingComponent/Step4BankDetails";
import Step5ShippingLocs from "../../component/OnboardingComponent/Step5ShippingLocs";
import Step6DigitalSign from "../../component/OnboardingComponent/Step6DigitalSign";
import Step7VerifySubmit from "../../component/OnboardingComponent/Step7VerifySubmit";
import StepProgressBar from "../../component/OnboardingComponent/StepProgressBar";

const TOTAL_STEPS = 7;

// ─────────────────────────────────────────────────────────────────────────────
// Validators per step
// ─────────────────────────────────────────────────────────────────────────────
const hasValue = (val) => {
  if (val === null || val === undefined) return false;
  if (typeof val === "number") return !isNaN(val);
  if (Array.isArray(val)) return val.length > 0;
  return String(val).trim().length > 0;
};

function validateStep(step, data) {
  const errors = {};

  if (step === 1) {
    if (!data.productCategories?.length)
      errors.productCategories = "Select at least one category";
    if (!data.onboardAs?.length)
      errors.onboardAs = "Please select at least one option";
    if (!hasValue(data.businessName)) errors.businessName = "Required";
    if (!hasValue(data.businessType)) errors.businessType = "Required";
    if (!hasValue(data.gstNumber)) errors.gstNumber = "Required";
    if (!hasValue(data.panNumber)) errors.panNumber = "Required";
    if (!hasValue(data.businessEmail)) errors.businessEmail = "Required";
    if (!hasValue(data.businessPhone)) errors.businessPhone = "Required";
    if (!hasValue(data.yearEstablished)) errors.yearEstablished = "Required";
    if (!hasValue(data.employees)) errors.employees = "Required";
  }

  if (step === 2) {
    if (!hasValue(data.sellerName)) errors.sellerName = "Required";
    if (!hasValue(data.sellerEmail)) errors.sellerEmail = "Required";
    if (!hasValue(data.sellerPhone)) errors.sellerPhone = "Required";
    if (!hasValue(data.sellerAddress)) errors.sellerAddress = "Required";
    if (!hasValue(data.sellerCity)) errors.sellerCity = "Required";
    if (!hasValue(data.sellerState)) errors.sellerState = "Required";
    if (!hasValue(data.sellerPincode)) errors.sellerPincode = "Required";
  }

  if (step === 3) {
    if (!hasValue(data.brandName)) errors.brandName = "Required to proceed";
    if (!hasValue(data.brandType)) errors.brandType = "Required to proceed";
  }

  if (step === 4) {
    if (!hasValue(data.accountHolder)) errors.accountHolder = "Required";
    if (!hasValue(data.bankName)) errors.bankName = "Required";
    if (!hasValue(data.accountNumber)) errors.accountNumber = "Required";
    if (!hasValue(data.ifscCode)) errors.ifscCode = "Required";
    if (!hasValue(data.branch)) errors.branch = "Required";
  }

  if (step === 5) {
    if (!hasValue(data.warehouseAddress)) errors.warehouseAddress = "Required";
    if (!hasValue(data.warehouseCity)) errors.warehouseCity = "Required";
    if (!hasValue(data.warehouseState)) errors.warehouseState = "Required";
    if (!hasValue(data.warehousePincode)) errors.warehousePincode = "Required";
  }

  return errors;
}

function computeCompleted(step, data) {
  const done = [];
  for (let s = 1; s < step; s++) {
    const errs = validateStep(s, data);
    if (Object.keys(errs).length === 0) done.push(s);
  }
  return done;
}

function findResumeStep(data) {
  for (let s = 1; s <= 6; s++) {
    const errs = validateStep(s, data);
    if (Object.keys(errs).length > 0) return s;
  }
  return 7;
}

// ─────────────────────────────────────────────────────────────────────────────
// Wizard
// ─────────────────────────────────────────────────────────────────────────────
export default function Wizard() {
  const { colors, radii } = useTheme();
  const dispatch = useDispatch();

  // ?edit=1 means we came from bussiness_info intentionally to edit a
  // pending/draft application. We skip the "pending → redirect back" gate
  // so the vendor isn't immediately bounced away.
  const { edit } = useLocalSearchParams();
  const isEditMode = edit === "1";

  const formData = useSelector(selectVendorFormData);
  const submitStatus = useSelector(selectVendorSubmitStatus);
  const submitError = useSelector(selectVendorError);
  const fetchStatus = useSelector(selectVendorFetchStatus);
  const existingVendor = useSelector(selectVendorProfile);

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [hydrated, setHydrated] = useState(false);
  const scrollRef = useRef(null);

  // ── On mount: hydrate form data ───────────────────────────────────────────────
  useEffect(() => {
    const bootstrap = async () => {
      // ── Fast path: Redux already has vendor data (e.g. navigated from
      // bussiness_info). Skip the network round-trip to avoid the loading
      // flash and the premature redirect that was causing the bug.
      if (existingVendor && Object.keys(formData).length > 0) {
        const status = existingVendor.status || "draft";

        // Only gate on "approved" — approved vendors have no reason to be here.
        // "pending" vendors ARE allowed in when isEditMode is true (Edit Details
        // button), or after a withdraw (status resets to "draft" in the store
        // immediately via the fulfilled reducer before this screen mounts).
        if (status === "approved") {
          router.replace("/(tabs)/dashboard");
          return;
        }

        // Compute resume step from already-hydrated formData in the store
        const resumeStep = findResumeStep(formData);
        setCurrentStep(resumeStep);
        setHydrated(true);
        return;
      }

      // ── Slow path: store is empty (cold start / direct deep link) ─────────────
      const result = await dispatch(fetchMyVendorProfile());

      if (fetchMyVendorProfile.fulfilled.match(result)) {
        const vendor = result.payload;
        const status = vendor?.status || "draft";

        if (status === "approved") {
          router.replace("/(tabs)/dashboard");
          return;
        }

        // Only redirect pending → bussiness_info when NOT in edit mode.
        // In edit mode the vendor knows they're here intentionally.
        if (status === "pending" && !isEditMode) {
          router.replace("/(approval)/bussiness_info");
          return;
        }

        // draft, rejected, or pending+editMode — stay in wizard
        const hydratedData = buildFlatFormData(vendor);
        const resumeStep = findResumeStep(hydratedData);
        setCurrentStep(resumeStep);
      }

      setHydrated(true);
    };

    bootstrap();
  }, []);

  // Mirrors hydrateFormData() in vendorInfoSlice exactly.
  const buildFlatFormData = (vendor) => {
    if (!vendor) return {};
    const bd = vendor.businessDetails || {};
    const sd = vendor.sellerDetails || {};
    const brd = vendor.brandDetails || {};
    const bk = vendor.bankDetails || {};
    const sh = vendor.shippingLocations || {};
    const ds = vendor.digitalSignature || {};
    return {
      businessName: bd.businessName || "",
      businessType: bd.businessType || "",
      gstNumber: bd.gstNumber || "",
      panNumber: bd.panNumber || "",
      businessEmail: bd.businessEmail || "",
      businessPhone: bd.businessPhone || "",
      yearEstablished: bd.yearEstablished ? String(bd.yearEstablished) : "",
      employees: bd.numberOfEmployees ? String(bd.numberOfEmployees) : "",
      productCategories: bd.categories || [],
      onboardAs: (bd.onboardingType || []).map(
        (v) => v.charAt(0).toUpperCase() + v.slice(1),
      ),
      sellerName: sd.sellerName || "",
      sellerEmail: sd.sellerEmail || "",
      sellerPhone: sd.sellerPhone || "",
      sellerAddress: sd.address || "",
      sellerCity: sd.city || "",
      sellerState: sd.state || "",
      sellerPincode: sd.pincode ? String(sd.pincode) : "",
      brandName: brd.brandName || "",
      brandType: brd.brandType || "",
      trademarkNumber: brd.trademarkNumber || "",
      brandWebsite: brd.brandWebsite || "",
      accountHolder: bk.accountHolderName || "",
      accountNumber: bk.accountNumber || "",
      ifscCode: bk.ifscCode || "",
      bankName: bk.bankName || "",
      branch: bk.branch || "",
      warehouseAddress: sh.warehouseAddress || "",
      warehouseCity: sh.city || "",
      warehouseState: sh.state || "",
      warehousePincode: sh.pincode ? String(sh.pincode) : "",
      latitude: sh.latitude ? String(sh.latitude) : "",
      longitude: sh.longitude ? String(sh.longitude) : "",
      digitalSignConfirmed: ds.signed || false,
    };
  };

  // ── Field updater ─────────────────────────────────────────────────────────────
  const handleChange = (field, value) => {
    dispatch(setField({ field, value }));
    if (errors[field]) {
      setErrors((prev) => {
        const e = { ...prev };
        delete e[field];
        return e;
      });
    }
  };

  const scrollToTop = () =>
    scrollRef.current?.scrollTo?.({ y: 0, animated: true });

  // ── Navigation ────────────────────────────────────────────────────────────────
  const goNext = () => {
    if (currentStep < TOTAL_STEPS) {
      const stepErrors = validateStep(currentStep, formData);
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        return;
      }
      setErrors({});
      setCurrentStep((s) => s + 1);
      scrollToTop();
    }
  };

  const goPrev = () => {
    if (currentStep > 1) {
      setErrors({});
      setCurrentStep((s) => s - 1);
      scrollToTop();
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    Alert.alert("Submit Application", "Are you sure you want to submit?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Submit",
        onPress: async () => {
          const result = await dispatch(submitVendorApplication(formData));

          if (submitVendorApplication.fulfilled.match(result)) {
            router.replace("/(approval)/bussiness_info");
          } else {
            Alert.alert("Error", result.payload);
          }
        },
      },
    ]);
  };

  const completedSteps = computeCompleted(currentStep, formData);
  const stepProps = { formData, onChange: handleChange, errors };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1BusinessDetails {...stepProps} />;
      case 2:
        return <Step2SellerDetails {...stepProps} />;
      case 3:
        return <Step3BrandDetails {...stepProps} />;
      case 4:
        return <Step4BankDetails {...stepProps} />;
      case 5:
        return <Step5ShippingLocs {...stepProps} />;
      case 6:
        return <Step6DigitalSign {...stepProps} />;
      case 7:
        return (
          <Step7VerifySubmit
            formData={formData}
            onSubmit={handleSubmit}
            onGoToStep={setCurrentStep}
          />
        );
      default:
        return null;
    }
  };

  const isLastStep = currentStep === TOTAL_STEPS;
  const nextBtnDisabled =
    Object.keys(validateStep(currentStep, formData)).length > 0;

  if (!hydrated) {
    return (
      <SafeAreaView
        style={[styles.safe, { backgroundColor: colors.background }]}
      >
        <View style={styles.bootstrapLoader}>
          <ActivityIndicator size="large" color={colors.secondary} />
          <Text style={[styles.bootstrapText, { color: colors.textSecondary }]}>
            Loading your progress…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <StepProgressBar
        currentStep={currentStep}
        completedSteps={completedSteps}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={COMPONENT.headerHeight + SAFE_AREA.top}
      >
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: SPACING.xxl + COMPONENT.tabBarHeight },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {renderStep()}
        </ScrollView>
      </KeyboardAvoidingView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          onPress={goPrev}
          disabled={currentStep === 1}
          style={[
            styles.navBtn,
            styles.prevBtn,
            {
              borderColor:
                currentStep === 1 ? colors.border : colors.textSecondary,
              opacity: currentStep === 1 ? 0.4 : 1,
              borderRadius: radii.sm,
            },
          ]}
        >
          <Text style={[styles.prevBtnText, { color: colors.text }]}>
            ← Previous
          </Text>
        </TouchableOpacity>

        <Text style={[styles.stepCounter, { color: colors.textMuted }]}>
          Step {currentStep} of {TOTAL_STEPS}
        </Text>

        {isLastStep ? (
          <View style={styles.navBtn} />
        ) : (
          <TouchableOpacity
            onPress={goNext}
            style={[
              styles.navBtn,
              styles.nextBtn,
              {
                backgroundColor: nextBtnDisabled
                  ? colors.border
                  : colors.secondary,
                borderRadius: radii.sm,
              },
            ]}
          >
            <Text style={styles.nextBtnText}>Next →</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  bootstrapLoader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  bootstrapText: {
    fontSize: 14,
    fontWeight: "500",
  },
  content: {
    padding: SPACING.xxl,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
  },
  navBtn: {
    minWidth: 110,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.lg,
  },
  prevBtn: {
    borderWidth: 1.5,
  },
  prevBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
  nextBtn: {},
  nextBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  stepCounter: {
    fontSize: 13,
  },
});
