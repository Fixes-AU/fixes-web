# Direct Contracts / Tradie Agency Feature Plan

Date: 22 July 2026  
Scope: Server, Fixes admin web, client web, client mobile app, fixer/tradie mobile app  
Status: Planning only. Main product/payment decisions were answered on 22 July 2026. Implementation should still start in phased slices, not as one large release.

## Executive Summary

Direct Contracts should become a first-class agency feature, not an extension of the current cleaning-admin shortcut.

The confirmed direction is:

- Agency applications start from a hidden/unlisted web registration page.
- Fixes admin must review and approve the agency before it can receive jobs.
- Agencies connect their own Stripe Connect account, similar to individual tradies.
- Client payment still goes through Fixes escrow/payment flow. "Direct Contracts" is only the feature name, not off-platform payment.
- Jobs can be dispatched to both individual tradies and eligible agencies at the same time.
- The client only finds out an agency accepted after assignment, similar to Uber/Doordash-style matching.
- Agencies can invite both existing verified Fixes tradies and brand-new employees.
- Worker verification should be category-specific, with optional extra document uploads and admin ability to request more documents.
- Agency employees/workers must never see client total, quote subtotal, GST, platform fee, agency earnings, payment status, or payout status.
- Agency owner/manager experience is required in both web portal and fixer mobile app from phase 1.
- When an agency assigns a worker, that assignment is final from the worker side. The worker does not accept or reject like marketplace dispatch. The job appears directly as the active job widget.
- Reviews attach to both the agency and the worker.
- Disputes should involve agency, owner/manager, and worker carefully through explicit state and participant rules.
- Agency online means the agency can receive jobs, without requiring an individual worker to be online at dispatch time.
- Agency payout goes to the agency. The agency handles paying its own workers outside Fixes.

The safest implementation path is:

1. Build agency tenant/account foundation.
2. Build agency onboarding and Fixes admin approval.
3. Build agency membership/invites and role permissions.
4. Add backend job/payment redaction before any worker UI ships.
5. Add agency portal and fixer app agency manager mode.
6. Add manual agency job assignment first.
7. Add automated dispatch to both agencies and individual tradies after the core tenant model is proven.
8. Add agency-aware chat, support, disputes, variations, reviews, and payouts.

## 1. Goal

Add a first-class "Direct Contracts" feature for construction/tradie agencies.

An agency should be able to receive Fixes jobs, manage an agency account, invite and manage tradie employees, assign a worker to each job, track progress, manage disputes/support, and receive agency-level earnings/payouts.

The assigned worker should see the job details needed to complete the work, but must not see job price, client-paid amount, platform fee, agency earnings, or payout details. The agency owner/manager handles payment internally with their worker.

## 2. Current Codebase Audit

### Server

Relevant current files:

- `server/models/User.js`
- `server/models/TradieProfile.js`
- `server/models/Job.js`
- `server/models/Payment.js`
- `server/models/Wallet.js`
- `server/models/JobDispatch.js`
- `server/models/Message.js`
- `server/models/Dispute.js`
- `server/models/SupportCase.js`
- `server/controllers/jobController.js`
- `server/controllers/paymentController.js`
- `server/controllers/tradieController.js`
- `server/controllers/messageController.js`
- `server/controllers/disputeController.js`
- `server/controllers/supportController.js`
- `server/controllers/cleaningAdminController.js`
- `server/services/dispatchService.js`
- `server/services/cleaningDispatchService.js`
- `server/services/paymentTradieService.js`
- `server/services/socketService.js`
- `server/utils/agencyJob.js`
- `server/services/agencyJobEmails.js`
- `server/services/agencyJobNotifications.js`

Findings:

- `User.role` is currently only `client`, `tradie`, or `admin`.
- There is no first-class Agency model.
- `TradieProfile.isAgencyTradie` exists, but it is a flat boolean and does not link a tradie to a specific agency.
- `Job.isAgencyManaged` exists, but it currently means cleaning/waste agency handling, not a generic construction/tradie agency owner workflow.
- `Job.assignedTradieId` supports one worker only. There is no agency receiver, agency owner, agency assignment history, or agency-visible job queue.
- `Payment.tradieId` is required and keyed to a user, not an agency.
- `Wallet` is keyed to `tradieId`, not agency.
- `dispatchService` skips `AGENCY_CATEGORIES` and uses `cleaningDispatchService` for cleaning/waste. This is not suitable as-is for multi-trade Direct Contracts.
- `cleaningAdminController` is a platform-admin style portal for cleaning jobs, not an agency-owner scoped portal.
- `messageController`, `supportController`, and `disputeController` authorize access using `clientId`, `assignedTradieId`, or admin. Agency owners/managers would currently be blocked unless they are the assigned tradie or platform admin.
- Socket rooms are user, `tradies`, `admins`, and `job:{id}`. There are no agency rooms.
- Notification payloads currently include earnings/price in some tradie dispatch notifications.

### Web Portals

Relevant current areas:

- Platform admin: `app/admin`
- Client dashboard: `app/dashboard`
- Cleaning admin: `app/cleaning-admin`
- Client public/main site and service pages: `components/upwork`, `lib/service-data.ts`

Findings:

- Platform admin can see jobs, users, verification, transactions, support, disputes, variations, and cleaning-admin panel switch.
- There is no agency portal route namespace such as `/agency`.
- Existing cleaning-admin portal has useful UI patterns for job queue, worker list, invites, rates, revenue, and settings, but it is globally scoped and platform-admin-only.
- Client web already handles agency-managed cleaning jobs in job detail views, but this is specific to cleaning/waste.
- Admin job pages show payment details and tradie earnings. Direct Contracts needs agency payment owner visibility and employee price redaction.

### Fixes Client Mobile App

Relevant current files:

- `fixes-mobile-app/src/screens/PostJobScreen.tsx`
- `fixes-mobile-app/src/screens/JobDetailScreen.tsx`
- `fixes-mobile-app/src/screens/JobsListScreen.tsx`
- `fixes-mobile-app/src/screens/JobChatScreen.tsx`
- `fixes-mobile-app/src/screens/SupportCaseScreen.tsx`
- `fixes-mobile-app/src/types/index.ts`

Findings:

- Client posting currently chooses categories and creates normal marketplace jobs or cleaning/waste agency jobs.
- No client-facing choice exists for "send to agency" vs "individual tradie".
- Client may not need to know the assigned employee pricing model, but should see "via Agency Name" and final assigned worker identity when available.
- Client chat currently assumes one assigned tradie participant.

### Fixer / Tradie Mobile App

Relevant current files:

- `fixer-mobile-app/src/navigation/AppNavigator.tsx`
- `fixer-mobile-app/src/context/AuthContext.tsx`
- `fixer-mobile-app/src/types/auth.ts`
- `fixer-mobile-app/src/screens/HomeScreen.tsx`
- `fixer-mobile-app/src/screens/DispatchScreen.tsx`
- `fixer-mobile-app/src/screens/ActiveJobScreen.tsx`
- `fixer-mobile-app/src/screens/InboxScreen.tsx`
- `fixer-mobile-app/src/screens/JobChatScreen.tsx`
- `fixer-mobile-app/src/screens/EarningsScreen.tsx`
- `fixer-mobile-app/src/screens/DisputeScreen.tsx`
- `fixer-mobile-app/src/screens/SupportCaseScreen.tsx`
- `fixer-mobile-app/src/screens/menu/*`

Findings:

- Fixer app is currently designed for individual tradies.
- Auth profile supports `isAgencyTradie`, but not agency membership role or agency permissions.
- Dispatch and active job screens show pricing/earnings in several places.
- Earnings/payout screens assume the logged-in user is the payout recipient.
- Agency owner/manager app experience would need role-based tabs and protected screens.

## 3. External Payment Reference

Stripe Connect supports several platform payment patterns:

- Separate charges and transfers are designed for marketplace/platform flows where a platform creates a charge and later transfers funds to one or more connected accounts. Stripe says this is useful when a specific user is not known at payment time or when splitting one payment across multiple connected accounts: https://docs.stripe.com/connect/separate-charges-and-transfers
- Direct charges create the charge on the connected account and have platform visibility limitations because transaction objects live on the connected account, not the platform account: https://docs.stripe.com/connect/direct-charges

Recommendation for Fixes:

Use platform-created charges with agency payout routing, not Stripe direct charges, unless the business specifically wants agencies to be the merchant of record. Fixes currently relies on platform-owned PaymentIntent records, admin transaction pages, disputes, support review, escrow/capture logic, and wallet repair flows. Direct charges would make those workflows harder to audit centrally.

## 4. Confirmed Product Decisions

These decisions were confirmed by product on 22 July 2026 and should drive implementation.

1. Agency onboarding:
   Build a web-only agency registration page first. The URL can be unlisted/hidden for early rollout. Agencies submit full application data, then Fixes admin approves or rejects the application before the agency can receive jobs.

2. Agency payment account:
   Agencies connect their own Stripe Connect account, similar to individual tradies. Agency payouts go to the agency. The agency is responsible for paying its own tradies/employees.

3. Client visibility:
   The client should only learn that an agency accepted after assignment. Before payment/dispatch, the client should not need to choose or know whether the job will go to an individual tradie or agency.

4. Dispatch rules:
   Jobs should be eligible for both individual tradies and agencies at the same time. The first valid accepted recipient wins, with concurrency safeguards so the same job cannot be accepted twice.

5. Agency worker types:
   Agencies can invite both existing verified Fixes tradies and brand-new employees.

6. Worker verification:
   Worker verification should be category-specific. Required documents should be based on the trade category. Optional extra document upload should also be available so agencies/workers can provide additional documents, and Fixes admins can request more documents when needed.

7. Job price hiding:
   Agency employees/workers must not see payment or pricing information. Hide client total, quote subtotal, GST, platform fee, agency earnings, payment status, payout status, and any derived payout labels.

8. Agency owner app:
   Agency owner/manager functionality is required in both the web agency portal and the fixer mobile app from phase 1.

9. Dispute ownership:
   Disputes should involve the agency entity, agency owner/manager, and assigned worker where relevant. This requires explicit state and participant rules so dispute responsibility does not become confused.

10. Reviews:
    Client reviews should attach to both the agency and the assigned worker.

11. Online/offline:
    Agency online means the whole agency can receive jobs. It should not require one specific eligible worker to be online at dispatch time.

12. Direct contract meaning:
    Payment still passes through Fixes. "Direct Contracts" is the feature name, not an off-platform client-agency payment flow.

## 5. Proposed Domain Model

### New Model: `AgencyApplication`

Purpose: web-only onboarding intake before an approved agency tenant exists.

Fields:

- `_id`
- `status`: `draft`, `submitted`, `under_review`, `approved`, `rejected`, `needs_more_info`
- `companyName`
- `ownerName`
- `ownerEmail`
- `ownerPhone`
- `abn`
- `businessAddress`
- `requestedCategories`
- `serviceAreas`
- `documents`: licenses, insurance, tax/ABN documents, category-specific evidence, optional extra uploads
- `stripeOnboardingIntent`: optional tracking until the approved agency connects Stripe
- `reviewNotes`
- `requestedMoreInfo`
- `approvedAgencyId`
- `submittedAt`
- `reviewedAt`
- `reviewedBy`
- timestamps

Important:

- Registration page should be web-only and unlisted/hidden during early rollout.
- Submitted applications do not receive dispatch until Fixes admin approves and the agency connects required Stripe/documents.
- Admin must be able to request more documents without rejecting the application.

### New Model: `Agency`

Purpose: top-level tenant/company.

Fields:

- `_id`
- `name`
- `slug`
- `status`: `draft`, `pending_verification`, `active`, `offline`, `suspended`, `rejected`
- `ownerUserId`
- `businessEmail`
- `phone`
- `abn`
- `businessAddress`
- `serviceAreas`
- `categories`: array of trade categories
- `categoryCapabilities`: per-category config
- `documents`: license, insurance, tax, ABN, trade/category docs
- `insurance`: policy metadata and expiry
- `stripeAccountId`
- `stripeAccountStatus`: `not_connected`, `pending`, `active`, `requires_action`
- `dispatchMode`: `manual`, `auto`
- `autoAssignRules`: max radius, worker online requirement, minimum rating, category priority
- `isOnline`
- `rating`
- `jobStats`
- `createdBy`
- timestamps

Indexes:

- `{ status: 1, isOnline: 1 }`
- `{ categories: 1, status: 1 }`
- geospatial index for service coverage if stored as points/regions
- unique `slug`
- sparse unique `abn`

### New Model: `AgencyMember`

Purpose: membership and role inside an agency.

Fields:

- `agencyId`
- `userId`
- `role`: `owner`, `manager`, `dispatcher`, `worker`, `finance`, `support`
- `status`: `invited`, `active`, `inactive`, `removed`
- `categories`
- `permissions`
- `employmentType`: `employee`, `subcontractor`, `existing_fixes_tradie`
- `canReceiveAssignments`
- `hideFinancials`: default true for workers
- `joinedAt`
- `invitedBy`
- timestamps

Indexes:

- unique `{ agencyId: 1, userId: 1 }`
- `{ userId: 1, status: 1 }`
- `{ agencyId: 1, role: 1, status: 1 }`

### New Model: `AgencyInvite`

Purpose: invite workers/managers.

Fields:

- `agencyId`
- `email`
- `phone`
- `name`
- `role`
- `categories`
- `tokenHash`
- `status`: `pending`, `accepted`, `expired`, `revoked`
- `expiresAt`
- `createdBy`
- `acceptedBy`
- timestamps

### New Model: `AgencyJobAssignment`

Purpose: keep an auditable agency assignment trail independent from `Job.assignedTradieId`.

Fields:

- `jobId`
- `agencyId`
- `assignedWorkerId`
- `assignedBy`
- `status`: `offered_to_agency`, `agency_accepted`, `worker_assigned`, `worker_accepted`, `worker_declined`, `worker_expired`, `in_progress`, `completed`, `cancelled`, `disputed`
- `assignmentSource`: `agency_manual`, `agency_auto`, `fixes_admin`, `dispatch`
- `acceptedAt`
- `assignedAt`
- `workerAcceptedAt`
- `completedAt`
- `notes`
- timestamps

Indexes:

- `{ jobId: 1, agencyId: 1 }`
- `{ agencyId: 1, status: 1 }`
- `{ assignedWorkerId: 1, status: 1 }`

### Extend `Job`

Add:

- `fulfillmentType`: `individual_tradie`, `agency_direct_contract`
- `agencyId`
- `agencyOwnerId`
- `agencyAssignedWorkerId`
- `agencyAssignmentId`
- `agencyAcceptedAt`
- `agencyAssignedAt`
- `visibleWorkerPrice`: false by default for agency jobs
- `clientAgencyLabel`: stored snapshot of agency name
- `directContractMeta`: category/service area/contract notes if required

Keep:

- `assignedTradieId` for backward compatibility, but for agency jobs it should point to the assigned worker only after agency assignment.

### Extend `Payment`

Add:

- `payeeType`: `tradie`, `agency`
- `agencyId`
- `workerId`
- `agencyEarnings`
- `workerEarnings`: optional/null, only if Fixes tracks internal agency worker pay later
- `paymentChannel`: add `direct_contract_agency`
- `stripeDestinationType`: `tradie_connect`, `agency_connect`, `manual`
- `stripeAgencyTransferId`

Important:

- For agency jobs, payout calculations and transfers should target agency, not worker.
- Worker wallet should not be credited for agency jobs.

### Extend `Message`

Confirmed direction:

Use a new `Conversation` model before scaling this feature. Existing job-level messages can be migrated into a default client-tradie conversation. Agency needs separate client-agency and agency-worker threads to avoid leaking internal agency messages to clients.

`Message` should become a child record of `Conversation`, while keeping backward-compatible job message reads during migration.

Conversation fields:

- `jobId`
- `agencyId`
- `type`: `client_tradie`, `client_agency`, `agency_worker`, `client_worker`, `support_case`, `dispute`
- `participants`: user/agency/member participant records
- `visibleToAgencyRoles`
- `isInternalAgencyThread`
- `lastMessageAt`
- timestamps

Message fields to add or normalize:

- `conversationId`
- `agencyId`
- `senderParticipantType`: `client`, `tradie`, `agency_manager`, `agency_worker`, `admin`, `support`
- `attachments`
- `readBy`

### Extend `Dispute` and `SupportCase`

Add:

- `agencyId`
- `agencyMemberId`
- `againstType`: `client`, `tradie`, `agency`
- `initiatorType`: `client`, `tradie`, `agency`, `admin`
- `assignedAgencyManagerId`

## 6. Role and Permission Model

Do not add `agency_owner` as a global `User.role` unless the whole app is ready for multi-role users.

Recommended:

- Keep `User.role = tradie` for agency owner/manager/worker accounts in the fixer ecosystem.
- Add agency memberships through `AgencyMember`.
- Auth `/auth/me` should return:
  - `user`
  - `profile`
  - `agencyMemberships`
  - `activeAgency`
  - `effectiveCapabilities`

Agency permissions:

- `agency:view_dashboard`
- `agency:manage_account`
- `agency:manage_documents`
- `agency:manage_categories`
- `agency:view_jobs`
- `agency:accept_jobs`
- `agency:assign_workers`
- `agency:view_worker_location`
- `agency:message_client`
- `agency:message_worker`
- `agency:view_finance`
- `agency:manage_payouts`
- `agency:view_disputes`
- `agency:respond_disputes`
- `agency:invite_members`
- `agency:remove_members`

Worker default:

- Can view assigned jobs.
- Can update job status.
- Can message agency manager/support if enabled.
- Can message client only if agency allows it.
- Cannot view payment fields.
- Cannot view agency finance.
- Cannot manage agency.

## 7. Job Routing and Dispatch Flow

### Current Problem

Standard jobs dispatch only to individual verified online tradies. Cleaning/waste jobs use a separate agency-style cleaning admin flow. Direct Contracts needs one controlled dispatch pipeline that can target either individual tradies or agencies.

### Proposed Flow

1. Client posts job.
2. Pricing/quote is generated as today.
3. Client accepts quote and payment is authorized.
4. Dispatch service builds candidate list:
   - Individual tradies matching category, skill, radius, verification, online status.
   - Agencies matching category, service area, verification, online status.
5. Dispatch offers can be sent to eligible individual tradies and eligible agencies at the same time.
6. The first valid accept wins. Backend locking/idempotency must prevent double acceptance.
7. If individual tradie accepts:
   - existing flow continues.
8. If agency accepts:
   - job becomes `agency_accepted` or remains `accepted` with `fulfillmentType=agency_direct_contract`.
   - agency owner/manager has 24 hours to assign a worker.
   - if no worker is assigned inside the SLA, the job enters Fixes admin review for manual handling/refund/redispatch decision.
9. Agency owner/manager assigns worker.
10. Worker assignment is final from the worker side. There is no worker accept/reject dispatch step.
11. Assigned worker sees the job directly in the fixer app active job widget, with an agency badge and no payment fields.
12. Worker progresses and completes the job.
13. Completion, OTP, support, disputes, variations, cancellation, and payout flows work through the same job, but payment release targets the agency.

### New Job Statuses

Avoid adding too many top-level statuses if possible.

Preferred:

- Keep current job status machine mostly intact.
- Add agency-specific assignment state in `AgencyJobAssignment`.
- Add only these job statuses if truly needed:
  - `agency_pending_assignment`
  - `agency_worker_assigned`

Reason:

The system already has many job statuses. Keeping agency assignment state in its own model reduces breakage in client job lists, filters, and payment capture code.

## 8. Backend API Plan

### Platform Admin APIs

New namespace:

- `GET /api/admin/agencies`
- `POST /api/admin/agencies`
- `GET /api/admin/agencies/:agencyId`
- `PATCH /api/admin/agencies/:agencyId`
- `PATCH /api/admin/agencies/:agencyId/verify`
- `PATCH /api/admin/agencies/:agencyId/suspend`
- `GET /api/admin/agencies/:agencyId/members`
- `GET /api/admin/agencies/:agencyId/jobs`
- `GET /api/admin/agencies/:agencyId/payments`

Purpose:

- Fixes team creates/verifies/suspends agencies.
- Fixes team can audit agency jobs, members, documents, payouts, disputes.

### Agency APIs

New namespace:

- `GET /api/agency/me`
- `PATCH /api/agency/:agencyId/status`
- `PATCH /api/agency/:agencyId/profile`
- `PATCH /api/agency/:agencyId/categories`
- `POST /api/agency/:agencyId/documents`
- `GET /api/agency/:agencyId/jobs`
- `GET /api/agency/:agencyId/jobs/:jobId`
- `POST /api/agency/:agencyId/jobs/:jobId/accept`
- `POST /api/agency/:agencyId/jobs/:jobId/assign-worker`
- `POST /api/agency/:agencyId/jobs/:jobId/reassign-worker`
- `GET /api/agency/:agencyId/workers`
- `POST /api/agency/:agencyId/invites`
- `PATCH /api/agency/:agencyId/invites/:inviteId/revoke`
- `PATCH /api/agency/:agencyId/members/:memberId`
- `DELETE /api/agency/:agencyId/members/:memberId`
- `GET /api/agency/:agencyId/earnings`
- `GET /api/agency/:agencyId/payouts`
- `GET /api/agency/:agencyId/disputes`
- `GET /api/agency/:agencyId/support-cases`

Every route must enforce:

- Authenticated user.
- Active agency membership.
- Required agency permission.
- Tenant scope by `agencyId`.

### Worker APIs

Existing job routes can be reused only after authorization is expanded:

- `GET /api/jobs/:id`
- `PATCH /api/jobs/:id/status`
- `POST /api/jobs/:id/completion-photos`
- `POST /api/jobs/:id/verify-completion`
- `POST /api/messages/:jobId`

But response shaping must hide financial data for agency workers.

Add helper:

- `canAccessJob(user, job, action)`
- `shapeJobForUser(user, job)`
- `shapePaymentForUser(user, job, payment)`
- `shapeDispatchForRecipient(recipientType, user, job, payment)`

No controller should manually decide this in-place.

## 9. Payment Plan

### Recommended Phase 1 Payment Design

Client still pays Fixes through the existing Stripe PaymentIntent flow.

For individual tradie:

- Existing flow remains.

For agency:

- `Payment.payeeType = agency`
- `Payment.agencyId = agency._id`
- `Payment.workerId = assigned worker user id`
- `Payment.tradieId` may temporarily store agency owner for backward compatibility, but should not be the long-term truth.
- On completion/capture, transfer agency earnings to the agency Stripe Connect account.
- Worker wallet is not credited.
- Agency portal shows detailed per-job payment records so the agency can reconcile and pay workers outside Fixes.
- Agency worker views never receive payment status, payout status, client total, quote subtotal, GST, platform fee, or agency earnings.

### Why Not Direct Charges By Default

Stripe direct charges put transaction objects on the connected account and have platform visibility limitations. Since Fixes admin needs transaction monitoring, disputes, support, escrow, and payout repair, platform-created charges with separate agency transfers are safer for this system.

### Payment Edge Cases

Must plan:

- Agency accepts but never assigns worker:
  - Start a 24-hour assignment SLA at agency acceptance.
  - Send reminders to agency managers before expiry.
  - If expired, block silent continuation and move to Fixes admin review.
  - Admin can refund, redispatch, cancel, or manually coordinate with the agency.
- Worker declines assignment:
  - Not supported in phase 1. Agency assignment is final from the worker side.
  - Worker sees the job directly as an active job because the agency manages its own staffing.
- Agency cancels after accepting:
  - Refund the client according to platform policy.
  - Record an agency debt/negative balance in Fixes ledger.
  - If agency Stripe Connect balance is available and Stripe supports recovery for that account state, attempt deduction/reversal through the proper Stripe flow.
  - Show full audit trail to Fixes admin and agency finance.
- Client cancels after agency acceptance:
  - Reuse the existing client cancellation policy and fee/refund rules.
  - Route any payable amount to agency, not worker.
- Agency worker completes but agency Stripe account is not active:
  - Prevent agency from going live/receiving dispatch where possible until Stripe onboarding is complete.
  - Keep retry and `requires_action` states for payout repair.
  - Admin finance page must clearly show blocked payout reason.
- Dispute freezes agency payout:
  - Follow current dispute freeze pattern, but freeze agency payout, not worker wallet.
- Variation increases/decreases agency job amount:
  - Use the same admin-reviewed variation flow as standard jobs.
  - Increased quote requires client approval/payment of balance.
  - Decreased quote creates refund/adjustment trail.
- Refund/split dispute resolution:
  - Target agency ledger/payout. Worker is evidence participant, not payout recipient.
- Agency is suspended with active jobs:
  - Normal suspension should be blocked while active jobs exist.
  - Admin override can suspend new job intake while allowing active jobs to continue to completion.
  - Suspended agencies cannot receive new dispatch offers.

## 10. Web Portal Plan

### Hidden Agency Registration Page

Add a web-only registration intake page for early agency onboarding.

Recommended route:

- `/agency/register` or another unlisted route selected before launch

Requirements:

- Collect company identity, owner contact, ABN/tax info, trade categories, service areas, insurance, category-specific license documents, optional extra documents, and payout readiness intent.
- Submission creates `AgencyApplication`, not active `Agency`.
- Fixes admin reviews, requests more documents, approves, or rejects.
- Approved application creates/activates the `Agency` tenant and invites/onboards the owner.
- Agency cannot receive dispatch until admin approval and required payout/document checks are complete.

### New Agency Portal

Recommended namespace:

- `app/agency`

Do not overload `app/cleaning-admin` because:

- It is platform-admin gated.
- It is global, not tenant scoped.
- It assumes cleaning/waste.
- It exposes revenue and cleaner controls in a way that does not map cleanly to multi-trade agencies.

Agency portal pages:

- `/agency` dashboard
- `/agency/jobs`
- `/agency/jobs/[id]`
- `/agency/workers`
- `/agency/invites`
- `/agency/messages`
- `/agency/notifications`
- `/agency/disputes`
- `/agency/earnings`
- `/agency/payouts`
- `/agency/settings`
- `/agency/settings/documents`
- `/agency/settings/categories`
- `/agency/settings/tax`
- `/agency/support`
- `/agency/bug-reports`

UI requirements:

- Use dense operational layout, like admin/cleaning-admin, not a landing page.
- Add clear role badges: Owner, Manager, Worker.
- Add tooltip/help icons for sensitive sections:
  - Online/offline
  - Job assignment
  - Worker financial visibility
  - Payout readiness
  - Dispute handling
- All tables must show agency-scoped data only.

### Platform Admin Additions

Add:

- `Admin > Agencies`
- `Admin > Agency Applications`
- Agency detail page with:
  - company profile
  - owner
  - documents
  - categories
  - workers
  - active jobs
  - earnings/payouts
  - disputes/support
  - audit log

### Client Web Updates

Add:

- On job detail: "Assigned via {Agency Name}" when agency job.
- If worker assigned: show worker identity as agency-assigned tradie/technician.
- Chat label should clarify whether client is messaging agency/team or assigned worker.
- No extra client complexity during posting. Client discovers the assigned agency/worker after the job is accepted/assigned.

## 11. Mobile App Plan

### Fixer App: Agency Owner / Manager

Add role-aware mode switch if user has agency membership:

- Individual Tradie mode
- Agency Manager mode

Agency manager tabs:

- Dashboard
- Jobs
- Workers
- Inbox
- Earnings
- Menu

Agency manager features:

- Go online/offline for agency.
- View incoming agency job offers.
- Accept/decline jobs.
- Assign/reassign worker.
- See 24-hour assignment SLA countdown after agency acceptance.
- Invite workers.
- Message client and worker.
- View job progress and location.
- Review support/dispute state.
- View agency earnings/payouts.
- Manage agency account docs/categories/tax/insurance.

### Fixer App: Agency Worker

Worker screens:

- Assigned Jobs
- Active Job
- Inbox
- Menu

Assignment behavior:

- Worker does not receive marketplace dispatch for agency-assigned jobs.
- Worker does not accept/reject agency assignments.
- Once the agency manager assigns the worker, the job appears directly in the active job widget above the map.
- The active job should show "Received via {Agency Name}" and all operational details needed to complete the job, excluding payment data.

Worker must not see:

- `payment.amount`
- `payment.platformFee`
- `payment.tradieEarnings`
- `quote.suggestedFixedPrice`
- `quote.totalIncGst`
- dispatch `pricing`
- wallet earnings for agency jobs

Worker can see:

- Agency name
- Job title/description
- Category
- Site address/suburb
- Client-safe details
- Photos
- Diagnostics
- Schedule
- Tasks
- Status actions
- Completion flow
- Support/report issue
- Scope variation submit flow if enabled

### Client App

Add:

- Job detail agency badge.
- Assigned worker display: "via {Agency Name}".
- Chat/support should handle agency participant labels.
- No price changes besides existing quote/payment flow.

## 12. Data Privacy and Response Shaping

This must be backend-enforced.

Create central helpers:

- `getUserAgencyMemberships(userId)`
- `hasAgencyPermission(userId, agencyId, permission)`
- `isAgencyWorkerForJob(userId, job)`
- `isAgencyManagerForJob(userId, job)`
- `redactJobForUser(job, user)`
- `redactDispatchForAgencyWorker(payload)`

Rules:

- Agency owner/finance can see agency payment.
- Agency manager can see payment only if permission includes `agency:view_finance`.
- Agency worker cannot see payment.
- Client can see client-paid amount but not agency payout/margin.
- Platform admin can see all.
- Individual tradie can see their own earnings as today.

## 13. Chat, Inbox, Notifications

Conversation model recommendation:

- Create `Conversation` with participants and scopes.
- Do not keep stretching `Message.receiverId` only.

Conversation types:

- `client_agency`: client + agency owner/managers
- `agency_worker`: agency manager + assigned worker
- `client_worker`: optional, only if agency allows direct client contact
- `support_case`: platform support
- `dispute`: platform dispute thread

Notifications:

- Agency job offer received.
- Agency accepted by manager.
- Worker assigned.
- Assignment SLA warning/expired.
- Worker on the way.
- Work started/completed.
- Client message.
- Worker message.
- Support/dispute update.
- Payout status.

Socket rooms:

- `agency:{agencyId}`
- `agency:{agencyId}:managers`
- `agency:{agencyId}:workers`
- `agency-job:{jobId}`

## 14. Disputes and Support

Current disputes are client vs assigned tradie.

Direct Contracts should support:

- client vs agency
- agency vs client
- worker evidence submitted under agency dispute
- platform admin resolution

Recommended:

- For agency jobs, dispute `againstType` should be agency.
- Worker can submit evidence if assigned.
- Agency owner/manager responds formally.
- Payment freeze applies to agency payout.
- Resolution actions:
  - pay agency
  - refund client
  - split between client refund and agency payout
  - request worker evidence
  - request agency response

## 15. Variations / Scope Changes

New admin-reviewed variation flow should extend to agency jobs.

Rules:

- Agency manager can submit a variation.
- Assigned agency worker may submit a variation if agency permits.
- Variation goes to Fixes admin review first.
- Admin sends reviewed quote to client.
- If accepted, payment difference updates agency payment record.
- If declined, agency/worker proof flow continues.
- Worker still does not see financial amounts unless permission allows it.

## 16. Rollout Plan

### Phase 0: Final Spec Freeze

- Confirm exact agency registration route name and launch visibility.
- Confirm category-specific document checklist per trade.
- Confirm admin override policy for agency suspension and agency cancellation debt recovery.
- Confirm client-facing copy for "assigned via agency".
- Confirm tooltip/help copy for admin and agency manager panels.

### Phase 1: Backend Foundations

- Add AgencyApplication model and admin review states.
- Add Agency, AgencyMember, AgencyInvite, AgencyJobAssignment models.
- Add agency permission middleware.
- Add response redaction helpers.
- Extend Job and Payment with agency fields.
- Add platform admin agency CRUD.
- Add agency `/me` endpoint.
- Add tests for authorization and redaction.

### Phase 2: Admin Portal

- Add `Admin > Agency Applications`.
- Add `Admin > Agencies`.
- Add agency verification and document review.
- Add request-more-documents flow.
- Add agency job audit view.
- Add agency payment visibility.
- Add agency cancellation/debt ledger visibility.
- Add audit logs.

### Phase 3: Agency Portal Web

- Add `/agency` portal.
- Add hidden/unlisted agency registration intake page.
- Agency dashboard, jobs, workers, invites, settings.
- Add tooltips/help icons.
- Add agency-scoped inbox notifications.

### Phase 4: Dispatch Integration

- Extend candidate search to include agencies.
- Add agency job offer model/state.
- Dispatch eligible jobs to both individual tradies and agencies.
- Add first-valid-accept locking so one job cannot be accepted twice.
- Add agency accept/decline.
- Add manager assignment to worker.
- Add 24-hour assignment SLA and admin review queue on expiry.
- Add fallback rules.
- Add socket notifications.

### Phase 5: Fixer App Agency Manager Mode

- Extend auth profile with agency memberships.
- Add agency mode switch.
- Add agency dashboard/jobs/workers/invites.
- Add accept/assign flows.
- Add assignment SLA warnings.

### Phase 6: Fixer App Worker Redaction

- Add worker assignment screens.
- Redact all payment/earnings fields for agency jobs.
- Add "Received via {Agency Name}" labels.
- Show agency-assigned jobs directly in the active job widget; no worker accept/reject flow.
- Update dispatch, active job, completion, chat, notifications.

### Phase 7: Client Web/App Updates

- Show agency badge.
- Show assigned worker via agency.
- Adjust chat labels.
- Ensure support/dispute flows link agency job correctly.

### Phase 8: Payments and Payouts

- Add agency Stripe Connect onboarding.
- Block live dispatch until required payout readiness is satisfied, or clearly mark admin-approved exceptions.
- Route payment release to agency.
- Prevent worker wallet credit for agency jobs.
- Update admin transaction reporting.
- Add agency payout reporting.
- Add agency debt/negative balance ledger for agency-caused cancellations or recovery actions.

### Phase 9: Disputes, Support, Variations

- Add agency-aware dispute/support authorization.
- Add worker evidence paths.
- Extend variation flow for agency jobs.

### Phase 10: Migration and Beta

- Keep old cleaning/waste agency flow stable.
- Add feature flag:
  - `directContractsEnabled`
  - `agencyDispatchEnabled`
  - `agencyWorkerPriceRedactionEnabled`
- Beta with one agency and one category.
- Expand after payment/dispute scenarios pass.

## 17. Migration Strategy

Do not migrate existing cleaning-admin jobs immediately.

Recommended:

1. Leave `isAgencyManaged` cleaning/waste flow untouched in phase 1.
2. Add new `fulfillmentType`.
3. New direct-contract jobs use `fulfillmentType='agency_direct_contract'`.
4. Later, decide whether cleaning/waste should become agencies under the same model.
5. Backfill only after the new agency flow is proven.

## 18. Validation Matrix

Backend tests:

- Agency application cannot receive jobs before admin approval.
- Agency cannot receive dispatch before required category documents and Stripe readiness pass.
- Agency owner can view only own agency.
- Agency manager cannot view another agency.
- Worker cannot view agency earnings.
- Worker cannot call agency finance endpoints.
- Agency manager can assign only agency members.
- Agency accepted jobs enter 24-hour assignment SLA.
- Expired unassigned agency jobs move to admin review.
- Same job cannot be accepted by both agency and individual tradie.
- Existing individual tradie jobs still work.
- Existing cleaning-admin jobs still work.
- Client cannot access agency internal chat.
- Agency worker cannot access unassigned jobs.
- Payment release sends money to agency for agency jobs.
- Worker wallet is not credited for agency jobs.
- Dispute freezes agency payment.
- Variation requires admin review before client approval.

Web checks:

- Admin agency pages permission-gated.
- Agency portal tenant scoped.
- Tooltips visible on confusing actions.
- Jobs list statuses make sense.
- Finance data hidden unless permitted.

Fixer app checks:

- Individual tradie unchanged.
- Agency owner sees manager mode.
- Agency worker sees assigned job with no price.
- Agency worker sees assigned job directly as active work, with no accept/reject step.
- Agency worker completion still works.
- Dispatch notification does not include earnings for agency worker.
- Past jobs and earnings do not leak agency job payout.

Client app checks:

- Job posting unchanged for normal categories.
- Agency job detail displays agency label.
- Chat/support/dispute links work.
- Payment amount remains visible to client.

## 19. Key Risks

- Payment bugs if `Payment.tradieId` remains required and reused for agency jobs.
- Price leakage through dispatch payloads, notifications, job detail API, past jobs, wallet, or chat metadata.
- Tenant leakage if agency authorization is added only in frontend.
- Breaking existing cleaning/waste agency flow by trying to reuse it too aggressively.
- Too many job statuses causing client/admin filters to misrepresent state.
- Dispute/support flows opening against worker instead of agency.
- Reviews and ratings being assigned to the wrong party.
- Stripe transfer failures if agency account is incomplete.

## 20. Recommended First Implementation Slice

Build this in the smallest safe vertical slice:

1. Add AgencyApplication, Agency, AgencyMember, AgencyInvite, and AgencyJobAssignment models.
2. Add hidden web agency registration intake.
3. Add platform admin application review, request-more-documents, approve/reject, and agency audit pages.
4. Add agency Stripe Connect onboarding/readiness state.
5. Add agency `/me` and agency permission middleware.
6. Add backend redaction helper and tests before any worker UI ships.
7. Add Conversation model foundation for client-agency and agency-worker separation.
8. Add agency portal shell with dashboard/settings/workers only.
9. Add worker invite and membership acceptance for existing tradies and new employees.
10. Add one manually assigned agency job flow from platform admin.
11. Add fixer app worker redacted active job view with "Received via {Agency Name}" and no accept/reject.
12. Add agency manager assign worker and 24-hour assignment SLA.
13. Add agency Stripe payout routing and per-job finance records.
14. Only then add automated dispatch to both agencies and individual tradies.

This avoids changing live dispatch/payment behavior before tenant isolation, Stripe readiness, message separation, and price redaction are proven.

## 21. Acceptance Criteria

Feature is not production-ready until all are true:

- Agencies can submit web-only applications and remain unable to receive jobs until admin approval.
- Fixes admin can create, verify, suspend, and audit agencies.
- Fixes admin can request additional agency/worker documents.
- Agency owner can manage agency profile, categories, documents, workers, and online status.
- Agency has an active Stripe Connect account before normal dispatch eligibility.
- Agency can receive and accept jobs for multiple categories.
- Jobs can dispatch safely to agencies and individual tradies at the same time, with first-valid-accept locking.
- Agency manager can assign a worker.
- Agency manager has a visible 24-hour assignment SLA after accepting a job.
- Assigned worker receives job via agency name.
- Assigned worker sees the job directly as active work and does not accept/reject the assignment.
- Assigned worker cannot see any payment/price/earnings fields from API or UI.
- Client sees agency/worker info cleanly.
- Job completion and OTP work for agency worker.
- Payment release targets agency, not worker.
- Agency finance shows per-job records for reconciliation with its own workers.
- Agency-caused cancellation records refund/debt/audit trail.
- Agency disputes/support cases are visible to agency manager and platform admin.
- Disputes freeze agency payout and treat the worker as evidence participant, not payout target.
- Reviews attach to both agency and worker.
- New `Conversation` model prevents client/agency/worker internal message leakage.
- Existing individual tradie flow is unchanged.
- Existing cleaning/waste flow is unchanged unless explicitly migrated.
