import { Stack } from "expo-router";

export default function OnBoardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
      <Stack.Screen name="wizard" />
    </Stack>
  );
}
