# Specification

## Summary
**Goal:** Add a hidden, session-based Admin Panel unlock via header logo password, and allow users to delete their own global chat messages via a mobile-friendly long-press action.

**Planned changes:**
- Add a hidden password prompt triggered by tapping/clicking the header logo; if the password is exactly "DexGod", set an "admin unlocked" flag for the current session and navigate to the Admin Panel, otherwise show an English error.
- Gate Admin Panel navigation and rendering behind both backend admin authorization (existing isCallerAdmin) and the new session "admin unlocked" state; hide Admin Panel entry unless both are true, and show English guidance/errors when access is attempted without meeting requirements.
- Implement a backend update method to delete a global chat message by messageId, allowing deletion only by the original sender (and optionally admins), and ensure deleted messages no longer appear in fetchGlobalMessages results.
- Add long-press (press-and-hold) on the user’s own global chat messages to reveal a delete action; on delete, call the backend method and update the UI without a full reload; show English error messaging on failure.

**User-visible outcome:** Admins can unlock the Admin Panel only after entering the correct password via the logo in the current session, and users can long-press their own chat messages to delete them so they disappear from the chat for everyone.
