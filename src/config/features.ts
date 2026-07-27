function isEnabled(value: string | undefined) {
  return value?.trim().toLowerCase() === "true";
}

export const features = {
  checkoutSavedAddresses: isEnabled(
    import.meta.env.VITE_CHECKOUT_SAVED_ADDRESSES_ENABLED,
  ),
};
