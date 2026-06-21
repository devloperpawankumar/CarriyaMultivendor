The new guard rails now enforce a one-way status ladder, so the seller must step through each stage instead of jumping directly to “delivered.”
 Allowed transitions:
pending → confirmed → processing → shipped → delivered
At any point up to shipped, a seller can also move to cancelled (e.g., stock issue).
delivered places the order in a locked state once payout is (or will soon be) released, so no further seller edits are accepted. Admins retain override access.
That means the error you saw (confirmed → delivered) is expected: the order hasn’t reported “processing” and “shipped” yet, so the system blocks the skip. To deliver an order:
Move it from confirmed to processing once prep/packing starts.
Set it to shipped as soon as the parcel is handed to the courier (ideally with a tracking number).
When you have proof of receipt (carrier scan or buyer confirmation), update to delivered. At that moment the payout timeline starts and the status becomes immutable for sellers.
This mirrors Amazon/Daraz: they require granular milestones so fraud detection, buyer notifications, and settlements stay consistent. If you need an exceptional change (e.g., you forgot to hit “shipped”), an admin route is still available to adjust the order; otherwise, follow the sequential flow above and the platform will accept the delivery update.