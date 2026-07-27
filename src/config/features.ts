function isEnabled(value: string | undefined) {
  return value?.trim().toLowerCase() === "true";
}

export const features = {
  persistentCart: isEnabled(
    import.meta.env.VITE_CART_PERSISTENT_ENABLED,
  ),
  checkoutSavedAddresses: isEnabled(
    import.meta.env.VITE_CHECKOUT_SAVED_ADDRESSES_ENABLED,
  ),
};
