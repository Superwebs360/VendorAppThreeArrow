import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  restoreAuth,
  selectIsAuthenticated,
  selectRestoring,
} from "../redux/authSlice"; // adjust path to your slice

export default function Index() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const restoring = useSelector(selectRestoring);

  // Kick off session rehydration on boot
  useEffect(() => {
    dispatch(restoreAuth());
  }, [dispatch]);

  // Once restore finishes, route appropriately
  useEffect(() => {
    if (restoring) return; // wait until AsyncStorage check completes

    if (isAuthenticated) {
      router.replace("/(tabs)/dashboard"); // or wherever your main app entry is
    } else {
      router.replace("/(auth)/login");
    }
  }, [restoring, isAuthenticated]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
