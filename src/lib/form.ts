/**
 * Chrome ignores `autocomplete="off"` on inputs whose label or placeholder it
 * reads as an address field, and drops its own saved-address list on top of
 * our combobox, leaving two menus stacked over each other.
 *
 * Declaring the field as a new password is the escape hatch Chromium honours
 * and the one MUI's Autocomplete documents for the same problem. Nothing here
 * is a password; the token is only a signal to the autofill heuristics.
 *
 * Spread this onto the visible input of any combobox that renders its own menu.
 */
export const suppressBrowserAutofill = {
  autoComplete: "new-password",
  autoCorrect: "off",
  autoCapitalize: "none",
  spellCheck: false,
  // Password managers read these to stay out of the way too.
  "data-1p-ignore": "",
  "data-lpignore": "true",
  "data-form-type": "other",
} as const;
