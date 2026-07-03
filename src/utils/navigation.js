export const safeBack = (router, fallback = "/(tabs)/dashboard") => {
  try {
    if (!router) return;
    const canGoBack =
      typeof router.canGoBack === "function"
        ? router.canGoBack()
        : !!router.canGoBack;

    if (canGoBack) {
      router.back();
      return;
    }

    if (typeof router.replace === "function") {
      router.replace(fallback);
    }
  } catch (e) {
    // don't crash the app if navigation helper fails during dev
    // eslint-disable-next-line no-console
    console.warn("safeBack failed", e);
  }
};

export default safeBack;
