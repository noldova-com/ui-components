# Permission card

**Scope:** The kit's permission card: its default geometry, the text role it uses, and its surface and behavior.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

Fills its container's width; padded 0.75rem, its parts 0.5rem apart; the head's icon, title, risk and expiry 0.5rem apart on one row, centered on the title, wrapping with 0.25rem between lines; options 0.5rem apart at the end, wrapping; details unpadded, with no border or fill, at most 12 lines high once all their lines show; medium radius; 1px border.

## Text role

Panel; the head's kind, risk and expiry and who decided in the label role, muted; the heading emphasized, in `text-strong`; details in the code body role.

## Surface and behavior

The kit's inline permission request for an agent's message, a named group described by the risk, the requester and the description, never a dialog, and kept in the history once answered.
A head row: the approval icon in the accent color; the heading, with the request's kind under it when the app gives one, the requester's own name for the request as it gave it; then, at the row's end, the risk's icon and text (Low, Medium or High risk), the high-risk icon in the error color and its text emphasized, never by color alone, and "Expires in N min", updated each minute from the kit's shared clock in the app's locale.
The requester's line isn't shown, since the card sits in the requester's own message: it is in the card's description, after the risk, for assistive technology, as its name and kind, such as "Build agent, Agent", or as its name alone when the app gives no kind, such as "Files · Build agent · This computer".
Then the description and the details, as plain code in the mono font, left to right, with no label; details longer than 3 lines show their first 3, then Show all N lines, after which they scroll inside the card, a region named Details in the Tab order.
The options are equal secondary buttons at the row's end, in a kit toolbar, one tab stop on the default option; Enter, Space or a click chooses.
The default is never an allow at high risk; without a deny there is none and the card itself takes focus, where Enter chooses nothing.
At high risk an option that always allows, the kit's or the app's, turns the row into "Always allow this high-risk request?" with Confirm and Cancel, and an allow without a scope, which may last, into "Allow this high-risk request?"; a request whose risk is unknown shows no risk and is guarded as at high risk, its questions without "high-risk", such as "Allow this request?", Confirm and Cancel secondary at the end like the options, Cancel focused when focus was in the card; Cancel brings the options back.
Without a deny, every option at high risk asks so, "Allow this high-risk request once?" for an option that allows once, and Confirm takes no second click of a double click, which lands on it when the card grows upward, so a high-risk card never allows on a single Enter or a double click.
The card answers once: after a choice, its options are disabled and choose nothing until the app binds the request in another status.
While sending, the options stay focusable but disabled, beside the kit's spinner and Sending your answer; a failed send says "Your answer couldn't be sent." with Retry; once decided, expired or withdrawn, the outcome's icon and text replace the options (Allowed once and Always allowed in the added color; Denied and Always denied in the error color; for an option without a scope, its own label, with its effect's icon and color; Expired; Withdrawn), with who decided and the time in the app's locale, and the date too when it isn't today, or in the app's own formats from `provideTimeFormats`, `clock` for today and `full` for an earlier day, redrawn when they change and at the local midnight after a decision made today, from the kit's shared clock, which runs one timer to midnight, at most an hour at a time, while any card shows a decision made today and none otherwise, so after a sleep across midnight, or a changed clock or time zone, the date shows within the hour, and focus that was on the options moves to the card.
A pending request is announced once as "Permission request from", the requester's line, then the heading, such as "Permission request from Build agent, Agent: Delete the build folder" or, with no kind, "Permission request from Files · Build agent · This computer: Delete the build folder", assertively when no other card is pending and politely when one is; only a rendered card announces and counts as pending, so a request a virtual list hasn't drawn yet is announced when it scrolls into view; the card takes focus only when the app asks, and Escape passes out of it.
