import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { store } from "../redux/store";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
        <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
        <Stack.Screen name="(auth)" options={{ gestureEnabled: false }} />
        <Stack.Screen name="(onboarding)" options={{ gestureEnabled: false }} />
        <Stack.Screen name="(approval)" options={{ gestureEnabled: false }} />
      </Stack>
    </Provider>
  );
}
