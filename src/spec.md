# Specification

## Summary
**Goal:** Improve navigation on mobile, add private 1:1 direct messages, and allow viewing user profiles by tapping avatars anywhere in the app.

**Planned changes:**
- Replace the current purple circular sidebar toggle with a standard hamburger menu icon placed in the top-right on small screens, keeping the same sidebar open/close behavior and removing the old fixed circular button.
- Add 1:1 direct message threads between two users, reachable by selecting a user from the Users list or from the Global Chat context, with clear UI indication when viewing a DM vs global chat.
- Enforce backend authorization so only the two DM participants can fetch and view messages in that DM thread; persist DM messages and support sending text (and any existing attachment capability already supported by the composer).
- Enable opening a user’s read-only profile view by clicking/tapping their avatar wherever it appears (global chat messages, users list items, and DM UI), showing at least avatar, display name, username, and bio, with back navigation returning to the prior context.

**User-visible outcome:** On mobile, users see a top-right hamburger icon to open/close the sidebar. Users can start private 1:1 DMs from the Users list or global chat and only the two participants can access the thread. Tapping any user avatar opens that user’s profile (view-only) and returning brings the user back to where they were.
