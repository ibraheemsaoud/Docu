---
title: titled docd
---

<SwmSnippet path="/src/screens/Profile/Profile.tsx" line="22">

---

&nbsp;

```tsx
export const Profile = () => {
  const { isLoading, user, updatePrefs } = useUser();
  const defaultIsDark =
    user?.prefs?.isDarkMode === undefined
      ? window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      : user?.prefs?.isDarkMode;

```

---

</SwmSnippet>

<SwmSnippet path="/src/screens/Profile/Profile.tsx" line="22">

---

&nbsp;

```tsx
export const Profile = () => {
  const { isLoading, user, updatePrefs } = useUser();
  const defaultIsDark =
    user?.prefs?.isDarkMode === undefined
      ? window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      : user?.prefs?.isDarkMode;
```

---

</SwmSnippet>
