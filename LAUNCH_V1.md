# Brewprint V1 Launch Plan

**Last updated:** 5 September 2026  

**Target paid launch:** 28 September 2026  

**Closed beta:** 14 September to 27 September 2026  

**Paid launch:** 28 September 2026

---

## Product Goal

A new user must be able to:

1. Understand what Brewprint does.

2. Create an account.

3. Verify and recover their account.

4. Complete their profile once.

5. Add a coffee.

6. Upload coffee bag photos.

7. Log a brew.

8. Upload an optional brew photo.

9. Track remaining coffee.

10. Review previous brews.

11. Reuse a successful recipe with Brew Again.

12. Sign in on another device.

13. Use the Free plan indefinitely.

14. Upgrade to Brewprint Pro.

15. Have Pro access controlled by server-backed entitlements.

16. Manage or cancel a paid subscription.

17. Export or delete their data.

**Core product loop:**

`Record -> Brew -> Compare -> Improve`

---

# Current State

## Completed and verified by 5 September 2026

### Core Product

- [x] Supabase authentication

- [x] User profiles

- [x] Cross-device data sync

- [x] Email verification

- [x] Password recovery and reset

- [x] Authentication error states

- [x] First-time onboarding

- [x] Coffee Library create, edit and delete

- [x] Front and back coffee bag image support

- [x] Brew Log create, edit and delete

- [x] Optional brew photo support

- [x] Automatic and atomic coffee weight deduction

- [x] Brew History search and filtering

- [x] Full brew record view

- [x] Brew Again

- [x] Brew Again recipe prefill

- [x] Brew Again creates a separate brew record

- [x] Original brew remains unchanged

- [x] New Brew Again entry deducts coffee weight correctly

- [x] Home Dashboard

- [x] Best Brews

- [x] Brewing Trends

- [x] Coffee Usage

- [x] AnalyticsView

- [x] User data export

- [x] Brew History CSV export

- [x] Account deletion

### Mobile and UI

- [x] Brewprint Technical Editorial UI applied across core product screens

- [x] Brewprint brand assets integrated

- [x] Home, Archive, Brew, History and Profile navigation structure

- [x] Coffee Library mobile review

- [x] Coffee Library 390 px test

- [x] Add Coffee mobile form review

- [x] Edit Coffee mobile form review

- [x] Brew Log mobile review

- [x] Brew flow 390 px test

- [x] Edit Brew mobile review

- [x] Brew Again mobile review

- [x] Brew photo mobile review

- [x] Brew Save and Cancel review

- [x] iPhone safe-area header improvements

- [x] iPhone input zoom prevention

- [x] Persistent mobile form actions

- [x] History cards open the full brew record

- [x] Edit, Brew Again and Delete actions remain independent

### Security

- [x] Supabase Row Level Security enabled and reviewed

- [x] RLS verified on profiles, coffees and brew logs

- [x] Private image storage

- [x] Storage policies isolate each user's files

- [x] 5 MB image upload limit

- [x] JPEG, PNG and WebP restrictions

- [x] Authentication redirects restricted

- [x] Email confirmation enabled

- [x] Anonymous sign-in disabled

- [x] Manual account linking disabled

- [x] Minimum password rules aligned between frontend and Supabase

- [x] Secure password changes enabled

- [x] Direct trigger function access restricted

- [x] Anonymous table privileges removed

- [x] Authenticated table privileges reduced

- [x] Cross-user coffee and brew ownership references blocked

- [x] No service-role key, database password, JWT or payment secret in frontend code

- [x] Supabase Security Advisor cleared of launch-blocking errors

- [x] Cloudflare Turnstile added to authentication

- [x] CAPTCHA verified for signup

- [x] CAPTCHA verified for sign in

- [x] CAPTCHA verified for password reset

- [x] CAPTCHA verified for verification resend

- [x] CAPTCHA verified in production

- [x] Gemini API moved behind a server-side endpoint

- [x] Gemini secret removed from frontend flow

- [x] Production dependency audit reduced to 0 known npm vulnerabilities

- [x] Cross-account user-data export isolation verified

### Monetisation Foundation

- [x] Free and Pro account model decided

- [x] Brewprint Pro entitlement model created

- [x] Provider-independent billing architecture created

- [x] Paystack selected as first payment-provider direction for South African web launch

- [x] `billing_subscriptions` table created

- [x] `user_entitlements` table created

- [x] Billing migration applied to hosted Supabase

- [x] Billing tables protected with RLS

- [x] Authenticated users can only read their own billing records

- [x] Client-side INSERT, UPDATE and DELETE blocked on billing tables

- [x] Billing writes reserved for trusted server-side flows

- [x] Billing provider model supports Paystack, Stripe, Apple, Google and manual sources

- [x] Pro entitlement source model supports billing, beta and promo access

- [x] Frontend billing types created

- [x] Billing service created

- [x] Entitlement context created

- [x] Entitlement provider added to application root

- [x] Reusable `ProGate` component created

- [x] Free -> Pro -> Free entitlement test passed

- [x] Temporary beta entitlement grant test passed

- [x] Entitlement revocation test passed

- [x] Best Brews card gated for Pro

- [x] Best Brews detail view gated for Pro

- [x] Brewing Trends card gated for Pro

- [x] Brewing Trends detail view gated for Pro

- [x] Coffee Usage split into Free and Pro information

- [x] Coffee Usage detailed analysis gated for Pro

- [x] Full Analytics route protected by Pro entitlement

- [x] Free analytics access test passed

- [x] Pro analytics access test passed

- [x] Production build passes after Pro gating work

### Current Monetisation Behaviour

**Free users currently retain:**

- Account and profile
- Cloud sync
- Coffee Library
- Add, edit and delete coffee
- Front bag photo
- Unlimited brew logging
- Brew Again
- Latest 15 Brew History records in-app
- Search and filtering across the visible 15 records
- Basic Home Dashboard
- Favourite coffee information
- Basic Coffee Usage information
- Activity Summary
- Full Brew History CSV export
- Full structured user-data export
- Account deletion

**Brewprint Pro currently unlocks:**

- Full Brew History
- Full History search and filtering
- Best Brews
- Best Brews detail analysis
- Brewing Trends
- Trends detail analysis
- Full Coffee Usage analysis
- Full Analytics
- Rear-label coffee photo upload and viewing
- Brew photo upload and viewing

**Still to implement before paid launch:**

- Upgrade screen
- Pricing page
- Paystack checkout
- Payment webhook handling
- Subscription status sync
- Trusted server subscription-to-entitlement automation
- Subscription management
- Cancellation flow
- Failed payment flow
- Subscription expiry handling
- Paid-user account deletion handling

---

# Launch Priorities

**P0 = Required before launch**  

**P1 = Strongly preferred for launch**  

**P2 = Post-launch or deliberately deferred**

---

# P0 Launch Requirements

## Accounts

- [x] Supabase authentication

- [x] User profiles

- [x] Profile persistence

- [x] Cross-device account sync

- [x] Sign out

- [x] Email verification

- [x] Forgot password

- [x] Password reset

- [x] Authentication error states

- [x] Account deletion

## Coffee Library

- [x] Add coffee

- [x] Edit coffee

- [x] Delete coffee

- [x] Coffee remaining weight

- [x] Front bag photo

- [x] Back bag photo functionality

- [x] Private image storage

- [x] First-use empty state

- [x] Coffee card information hierarchy

- [x] Mobile card layout

- [x] Mobile Add Coffee form

- [x] Mobile Edit Coffee form

- [x] Mobile Save and Discard controls

- [x] Final mobile usability review

- [x] Front bag photo confirmed Free
- [x] Rear-label photo upload confirmed Pro only
- [x] Rear-label photo display confirmed Pro only
- [x] Existing rear-label media remains stored after Pro removal
- [x] Free and Pro rear-label states tested

## Brew Log

- [x] Add brew

- [x] Edit brew

- [x] Delete brew

- [x] Optional brew image functionality

- [x] Automatic coffee weight deduction

- [x] Atomic coffee weight update

- [x] Brew History

- [x] Search and filtering

- [x] First-use empty state

- [x] Brew Again

- [x] Brew Again resets new-result fields

- [x] Brew Again preserves the original brew

- [x] Brew Again deducts the new dose

- [x] Previous brew image path does not carry into the repeated brew

- [x] Full brew record opens from History card

- [x] Edit action verified

- [x] Brew Again action verified

- [x] Delete action verified

- [x] 390 px Brew Log test

- [x] Mobile coffee selection flow

- [x] Mobile Brew Form

- [x] Mobile Edit Brew

- [x] Mobile Brew Again

- [x] Mobile brew photo flow

- [x] Mobile Save and Cancel behaviour

- [x] Brew photo confirmed Pro only
- [x] Brew photo upload gated for Pro
- [x] Existing brew photo hidden from Free users
- [x] Existing brew photo remains stored after Pro removal
- [x] Free and Pro brew-photo states tested

## Brew History Monetisation

- [x] Free users can continue logging indefinitely
- [x] Free users see only their latest 15 brew records
- [x] No brew records are deleted when the Free visibility limit is reached
- [x] Search and filters for Free users cannot expose records outside the visible 15
- [x] Pro users can access full Brew History
- [x] Full user-data export remains available to Free users
- [x] Full Brew History CSV export remains available to Free users
- [x] Free -> Pro history unlock test
- [x] Pro -> Free history restriction test

## Security

- [x] Supabase RLS foundation

- [x] RLS verified on all current user tables

- [x] Private image storage

- [x] Storage isolation verified

- [x] Atomic coffee weight update

- [x] Trigger function access restricted

- [x] Anonymous and authenticated database permissions reduced

- [x] Coffee and brew ownership relationship enforced

- [x] Secure password changes enabled

- [x] Frontend password validation matches backend rules

- [x] No server secrets in client code

- [x] Authentication CAPTCHA

- [x] CAPTCHA verified in production

- [x] Gemini API key removed from browser

- [x] Server-side Gemini request flow

- [x] Dependency security pass

- [x] User-data export account isolation

- [x] Billing tables use RLS

- [x] Billing tables are read-only from authenticated frontend sessions

- [x] Pro status is determined from server-backed entitlement records

- [ ] Verify Paystack webhook signature handling

- [ ] Verify payment endpoints never trust client-provided Pro status

- [ ] Final launch security review

- [ ] Final Supabase RLS review after billing integration

## Onboarding

- [x] Welcome screen

- [x] First-time profile completion

- [x] Add first coffee

- [x] Log first brew

- [x] Clear first-use guidance

- [x] Skip options where appropriate

- [x] Onboarding completion persistence

## Commercial System

- [x] Free account model
- [x] Pro account model
- [x] Subscription database table
- [x] Entitlement database table
- [x] Provider-independent billing data model
- [x] Server-backed Pro entitlement checks
- [x] Reusable frontend feature gate
- [x] Best Brews Pro gating
- [x] Brewing Trends Pro gating
- [x] Full Coffee Usage Pro gating
- [x] Full Analytics Pro gating
- [x] Free and Pro entitlement states manually tested
- [x] Free 15-record Brew History limit
- [x] Full History restored for Pro
- [x] Rear-label photo Pro gating
- [x] Brew photo Pro gating
- [x] Final Free/Pro feature rules for the current V1 feature set
- [ ] Paystack integration
- [ ] Checkout
- [ ] Payment webhook
- [ ] Subscription status sync
- [ ] Trusted-server entitlement grant and revoke flow
- [ ] Upgrade screen
- [ ] Pricing page
- [ ] Subscription management
- [ ] Cancellation handling
- [ ] Failed payment handling
- [ ] Restore-purchase or equivalent access-refresh flow where required

## Product Quality

- [ ] Complete loading-state review

- [ ] Complete error-state review

- [ ] Complete empty-state review

- [x] Coffee Library empty state

- [x] Brew Log empty state

- [x] Coffee Library mobile review

- [x] Coffee form mobile review

- [x] iPhone safe-area header fix

- [x] iPhone form input zoom prevention

- [x] Brew Log mobile review

- [x] Brew Log 390 px test

- [x] Brew capture mobile flow review

- [x] Edit Brew mobile review

- [x] Brew Again mobile review

- [x] Brew photo mobile review

- [x] Brew Save and Cancel review

- [x] Production dependency compatibility pass

- [x] Compatible React, Tailwind and Node type updates

- [x] Production build passes after dependency updates

- [x] Development smoke test passes

- [x] Full brew opening restored from History card

- [x] Edit, Brew Again and Delete reverified

- [x] `App.tsx` cleaned and reformatted during monetisation integration
- [x] Navigation regression found and repaired during History-limit implementation
- [x] Media Pro gating build and functional test passed

- [ ] Remove any remaining `cdn.tailwindcss.com` production usage

- [ ] Complete mobile navigation review

- [ ] PWA installation testing

- [ ] Production console error review

- [ ] Cross-browser testing

- [ ] New-account production test

## User Data

- [x] Export user data

- [x] Export account identity

- [x] Export profile data

- [x] Export Coffee Library

- [x] Export Brew Logs

- [x] Retain Brew History CSV export
- [x] Free plan export includes records outside the 15-record in-app History limit

- [x] Exclude temporary signed image URLs

- [x] Exclude browser File objects

- [x] Exclude authentication tokens and secrets

- [x] Retain stable image storage paths where available

- [x] Verify export download

- [x] Verify export isolation between accounts

- [x] Delete account

- [x] Delete associated user data

- [x] Confirm deleted users lose access

- [ ] Verify paid subscription cancellation or cleanup when account deletion occurs

## Legal and Launch Requirements

- [ ] Final Privacy Policy approved for launch

- [ ] Privacy Policy published

- [ ] Terms of Service

- [ ] Support contact

- [ ] Pricing page

- [ ] Upgrade page

- [ ] Subscription terms and cancellation wording

- [ ] Production domain review

- [ ] Beta feedback process

---

# P1 Launch Features

## Recipes

- [ ] Save a brew as a recipe

- [ ] Saved recipe library

- [ ] Favourite recipes

- [ ] Start a new brew from a saved recipe

**Current V1 fallback:** Brew Again already covers the most important repeat-brew workflow.

## Brew Comparison

- [ ] Compare current brew to previous brew

- [ ] Compare dose

- [ ] Compare yield

- [ ] Compare time

- [ ] Compare temperature

- [ ] Compare rating

## Coffee Statistics

- [x] Number of brews

- [x] Average rating

- [x] Best-rated brew

- [x] Coffee usage data

- [x] Brew method trends

- [x] Coffee origin trends

- [x] Coffee process trends

- [x] Roast trends

## Dashboard

- [x] Home Dashboard

- [x] Best Brews

- [x] Brewing Trends

- [x] Coffee Usage

- [x] Quick Log Brew action

- [x] Dashboard links into brew records

- [x] Dashboard links into analytics

- [x] Best Brews Pro gate

- [x] Trends Pro gate

- [x] Coffee Usage Free/Pro split

- [x] Full Analytics route protection

- [ ] Experiments

---

# P2 Post-Launch

Do not work on these before V1 unless all launch-critical work is complete.

## Product Expansion

- [ ] Café accounts

- [ ] Team accounts

- [ ] Roaster accounts

- [ ] Public profiles

- [ ] Followers

- [ ] Social feed

- [ ] Community recipes

- [ ] Leaderboards

- [ ] Achievements

- [ ] Coffee marketplace

- [ ] Native iOS app

- [ ] Native Android app

- [ ] Equipment integrations

## Deferred AI

AI is not required for the V1 paid launch.

Before AI features are enabled:

- [ ] Create a new Gemini API key

- [ ] Add `GEMINI_API_KEY` as a server-only production environment variable

- [ ] Test the Gemini server endpoint in production

- [ ] Test Gemini failure handling

- [ ] Revoke any previously exposed Gemini API key

- [ ] Review AI feature value before enabling it for users

## Deferred Dependency Migrations

Major dependency migrations stay separate from launch-critical fixes.

- [ ] Review next major Vite migration

- [ ] Review next major TypeScript migration

- [ ] Review Google GenAI dependency requirements

- [ ] Run isolated compatibility tests before major upgrades

## Deferred Code Structure Work

- [ ] Reduce responsibilities in `App.tsx`

- [ ] Extract History into a dedicated screen/component

- [ ] Extract Coffee Detail into a dedicated screen/component

- [ ] Extract modal orchestration from `App.tsx`

- [ ] Review application state boundaries after V1 launch

---

# Development Schedule

## Week 1: 17 to 23 August

**Goal:** Technical foundation, launch scope and core mobile usability.

- [x] Fix profile persistence

- [x] Lock V1 scope

- [x] Update README

- [x] Add launch roadmap

- [x] Complete password recovery

- [x] Complete email verification UX

- [x] Complete authentication error states

- [x] Build onboarding

- [x] Fix onboarding completion persistence

- [x] Improve Home summary layout

- [x] Fix iPhone header safe area

- [x] Improve first-use Coffee Library

- [x] Improve first-use Brew Log

- [x] Redesign Coffee Library card

- [x] Test Coffee Library at 390 px

- [x] Improve Add Coffee mobile form

- [x] Improve Edit Coffee mobile form

- [x] Prevent iPhone input zoom

- [x] Complete Coffee Library mobile review

- [x] Complete Brew Log mobile review

- [x] Complete Supabase security audit and hardening

- [x] Build account deletion

- [x] Build associated user data deletion

- [x] Move Gemini server-side

- [x] Remove Gemini API key from browser

- [x] Complete Brew Again

- [x] Build Home Dashboard

- [x] Build Best Brews

- [x] Build Brewing Trends

- [x] Build Coffee Usage

- [x] Update Analytics

### 19 August 2026: Session 3, Brew Again

- [x] Added Brew Again from existing History entries

- [x] Recipe parameters prefill into the new brew

- [x] New-result fields reset

- [x] Previous brew remains unchanged

- [x] New brew receives a new ID and timestamp

- [x] Coffee remaining weight deducts correctly

- [x] Production build passed

### 23 August 2026: Session 5, Home Dashboard and Brewing Analytics

- [x] Added HomeDashboard

- [x] Added Best Brews

- [x] Added Brewing Trends

- [x] Added Coffee Usage

- [x] Added method-share and brewing-variable information

- [x] Added origin, process and roast trend information

- [x] Connected dashboard actions to Brew Log flows

- [x] Updated AnalyticsView

- [x] Updated BrewForm where required

- [x] Updated App integration

- [x] Experiments deliberately deferred

- [x] Development test passed

- [x] Production build passed

- [x] Mobile review passed

---

## Week 2: 24 to 30 August

**Goal:** Complete remaining product quality, security and mobile requirements.

- [x] Account deletion

- [x] Associated user data deletion

- [x] Verify RLS on user tables

- [x] Verify storage isolation

- [x] Complete Supabase security hardening

- [x] Remove Gemini key from browser

- [x] Create server-side Gemini flow

- [x] Add authentication CAPTCHA

- [x] Complete Brew Log mobile review

- [x] Complete 390 px Brew Log test

- [x] Verify mobile coffee selection

- [x] Verify mobile Brew Form

- [x] Verify mobile Edit Brew

- [x] Verify mobile Brew Again

- [x] Verify mobile brew photo

- [x] Verify mobile Save and Cancel

- [x] Complete dependency security pass

- [x] Resolve known npm vulnerabilities

- [x] Complete compatible dependency updates

- [x] Verify production build

- [x] Complete development smoke test

- [x] Restore History card full-entry interaction

- [x] Implement Brewprint Technical Editorial UI

- [x] Implement Brewprint navigation structure

- [x] Complete user data export

- [x] Verify export contents

- [x] Verify export isolation

- [ ] Complete mobile navigation review

- [ ] Review all loading states

- [ ] Review all error states

- [ ] Review all empty states

- [ ] Complete new-account production test

### 24 August 2026: Brewprint V1 UI/UX Pass

- [x] Applied Brewprint Technical Editorial visual system

- [x] Integrated Brewprint branding

- [x] Updated Home presentation

- [x] Updated Archive presentation

- [x] Updated coffee record interactions

- [x] Updated Brew Log presentation

- [x] Updated History presentation

- [x] Updated Analytics presentation

- [x] Updated navigation

- [x] Restored full Brew History card opening

- [x] Preserved Edit, Brew Again and Delete

- [x] Production build passed

- [x] Functional tests passed

### 25 August 2026: Brew Log Mobile Usability Verification

- [x] Journal list reviewed

- [x] Brew capture selection reviewed

- [x] Brew Form reviewed

- [x] Edit Brew reviewed

- [x] Brew Again reviewed

- [x] Brew photo behaviour reviewed

- [x] Save and Cancel reviewed

- [x] Touch controls reviewed

- [x] 390 px layout tested

- [x] Mobile session accepted as passed

### 25 August 2026: Session 8, User Data Export

- [x] Preserved Brew History CSV export

- [x] Added full account data export from Profile

- [x] Export includes account identity

- [x] Export includes profile

- [x] Export includes Coffee Library

- [x] Export includes Brew Logs

- [x] Export uses structured JSON

- [x] Added schema version and export timestamp

- [x] Temporary signed image URLs excluded

- [x] Browser File objects excluded

- [x] Authentication tokens and secrets excluded

- [x] Stable image storage paths retained where available

- [x] Export download tested

- [x] Cross-account isolation tested

- [x] Production build passed

---

## Week 3: 31 August to 6 September

**Goal:** Complete monetisation architecture and feature-access rules before payments.

- [x] Decide Free and Pro product model

- [x] Decide Pro monthly plan identifier

- [x] Decide Pro annual plan identifier

- [x] Create provider-independent billing architecture

- [x] Create billing subscription table

- [x] Create entitlement table

- [x] Apply billing schema to Supabase

- [x] Enable and verify billing RLS

- [x] Restrict frontend billing writes

- [x] Add frontend billing types

- [x] Add billing service

- [x] Add EntitlementContext

- [x] Add EntitlementProvider

- [x] Add reusable ProGate

- [x] Test Free -> Pro -> Free entitlement changes

- [x] Gate Best Brews

- [x] Gate Best Brews detail view

- [x] Gate Brewing Trends

- [x] Gate Trends detail view

- [x] Split Coffee Usage between Free and Pro

- [x] Gate detailed Coffee Usage

- [x] Protect Full Analytics route

- [x] Verify Free Analytics state

- [x] Verify Pro Analytics state

- [x] Clean and reformat `App.tsx` after integration

- [x] Production build passes

- [x] Implement Free 15-brew History visibility rule

- [x] Verify History search cannot bypass the Free limit

- [x] Confirm front bag photo remains Free

- [x] Gate rear-label photo for Pro

- [x] Gate brew photo for Pro

- [x] Test Free and Pro media states

### 2 September 2026: Monetisation Data Architecture

- [x] Initial migration version preserved without rewriting migration history

- [x] Added actual billing architecture in a new migration

- [x] Created `billing_subscriptions`

- [x] Created `user_entitlements`

- [x] Added provider and plan constraints

- [x] Added subscription lifecycle statuses

- [x] Added entitlement lifecycle fields

- [x] Added indexes and uniqueness constraints

- [x] Added updated-at triggers

- [x] Enabled RLS

- [x] Added authenticated read-own-record policies

- [x] Removed client billing writes

- [x] Hosted Supabase migration verified

### 5 September 2026: Pro Entitlements and Feature Gating

- [x] Added frontend billing types

- [x] Added billing service

- [x] Added EntitlementContext

- [x] Added EntitlementProvider

- [x] Added ProGate

- [x] Tested Free -> Pro -> Free access state

- [x] Best Brews gated and tested

- [x] Best Brews detail protected

- [x] Trends gated and tested

- [x] Trends detail protected

- [x] Coffee Usage Free/Pro split implemented

- [x] Coffee Usage detail protected

- [x] Full Analytics protected at route/render level

- [x] Free analytics access test passed

- [x] Pro analytics access test passed

- [x] Production build passed

- [x] Free Brew History limited to latest 15 records

- [x] Hidden History records remain stored

- [x] Search and filters limited to visible Free History

- [x] Full CSV export remains available on Free

- [x] Full JSON export remains available on Free

- [x] Free -> Pro full-History test passed

- [x] Pro -> Free History restriction test passed

- [x] Front bag photo confirmed Free

- [x] Rear-label upload gated for Pro in CoffeeBeanForm

- [x] Rear-label upload also guarded in App save flow

- [x] Rear-label display gated for Pro in Coffee Detail

- [x] Brew photo upload gated for Pro in BrewForm

- [x] Brew photo upload also guarded in App save flow

- [x] Brew photo display gated for Pro in Brew Detail

- [x] Existing protected media remains stored after Pro removal

- [x] Free and Pro photo behaviour tested

- [x] Production build passed after media gating

---

## Week 4: 7 to 13 September

**Goal:** Complete payments, account limits and commercial screens.

### Required

- [x] Implement Free 15-brew History visibility limit

- [x] Test full History access for Pro

- [x] Confirm final photo feature rules

- [x] Front bag photo remains Free

- [x] Rear-label photo is Pro only

- [x] Brew photo is Pro only

- [ ] Create Paystack server integration

- [ ] Create checkout flow

- [ ] Create and verify payment webhook

- [ ] Map Paystack subscription state to `billing_subscriptions`

- [ ] Issue and revoke `brewprint_pro` entitlements from trusted server code

- [ ] Create upgrade screen

- [ ] Create pricing page

- [ ] Create subscription management flow

- [ ] Create cancellation flow

- [ ] Handle failed payments

- [ ] Test subscription expiry

- [ ] Test cancellation at period end

- [ ] Test Free -> Pro payment flow

- [ ] Test Pro -> Free cancellation flow

- [ ] Verify account deletion handling for paying users

### Product Quality Before Beta

- [ ] Complete loading-state review

- [ ] Complete error-state review

- [ ] Complete empty-state review

- [ ] Remove remaining Tailwind CDN production usage if present

- [ ] Complete mobile navigation review

- [ ] Production console error review

- [ ] New-account production test

---

## Week 5: 14 to 20 September

**Goal:** Closed beta.

**Target:** 10 to 20 users.

Track:

- [ ] Signup completion

- [ ] Email verification completion

- [ ] First coffee created

- [ ] First brew created

- [ ] Return usage

- [ ] Brew Again usage

- [ ] Confusing screens

- [ ] Bugs

- [ ] Feature requests

- [ ] Mobile problems

- [ ] Free limit confusion

- [ ] Upgrade conversion issues

- [ ] Subscription problems

- [ ] Export problems

- [ ] Account deletion problems

**Development rule:** Fix beta problems before adding new features.

---

## Week 6: 21 to 27 September

**Goal:** Production readiness.

- [ ] Final Privacy Policy

- [ ] Publish Privacy Policy

- [ ] Terms of Service

- [ ] Support contact

- [x] Account deletion

- [x] Data export

- [ ] Final security review

- [ ] Final RLS test

- [ ] Final billing RLS test

- [ ] Full Paystack payment test

- [ ] Production webhook test

- [ ] Production entitlement-grant test

- [ ] Production entitlement-revocation test

- [ ] Production environment review

- [ ] Cross-device test

- [ ] Cross-browser test

- [ ] PWA installation test

- [ ] Production console review

- [ ] Full new-user journey test

- [ ] Full Free user journey test

- [ ] Full Pro subscription journey test

- [ ] Full cancellation test

- [ ] Full failed-payment test

- [ ] Full account-deletion test for a paid user

- [ ] Confirm beta feedback reviewed

- [ ] Confirm no launch-blocking bugs remain

AI production setup is not required unless AI is intentionally re-enabled for V1.

---

## 28 September 2026: Launch

- [ ] Launch Brewprint V1

- [ ] Enable paid Pro subscriptions

- [ ] Confirm production payments

- [ ] Confirm production webhooks

- [ ] Confirm Pro entitlement grants

- [ ] Confirm production account creation

- [ ] Confirm production account deletion

- [ ] Confirm production data export

- [ ] Confirm Free limits work correctly

- [ ] Begin monitoring real customer behaviour and failures

---

# Free and Pro V1 Feature Matrix

| Feature | Free | Pro | Status |
|---|---:|---:|---|
| Account and profile | Yes | Yes | Complete |
| Cloud sync | Yes | Yes | Complete |
| Coffee Library | Yes | Yes | Complete |
| Add/edit/delete coffee | Yes | Yes | Complete |
| Front bag photo | Yes | Yes | Complete |
| Rear-label photo | No | Yes | Complete |
| Log brews indefinitely | Yes | Yes | Complete |
| Brew Again | Yes | Yes | Complete |
| Brew History | Latest 15 | Full | Complete |
| Search/filter History | Visible 15 only | Full | Complete |
| Basic Home Dashboard | Yes | Yes | Complete |
| Favourite coffee | Yes | Yes | Complete |
| Basic Coffee Usage | Yes | Yes | Complete |
| Best Brews | No | Yes | Complete |
| Brewing Trends | No | Yes | Complete |
| Full Coffee Usage | No | Yes | Complete |
| Full Analytics | No | Yes | Complete |
| Brew photo | No | Yes | Complete |
| User data export | Yes | Yes | Complete |
| Full Brew History CSV export | Yes | Yes | Complete |
| Account deletion | Yes | Yes | Complete |
| Upgrade and checkout | N/A | Yes | Pending |
| Subscription management | N/A | Yes | Pending |

# Commercial Decisions

## Plans

### Brewprint Free

**Price:** R0

Purpose:

- Allow users to build a real brew habit without forcing payment to keep logging.

- Keep core coffee and brewing records useful.

- Give Free users meaningful recent History while preserving all of their data.
- Create a clear reason to upgrade through full History, deeper analysis and richer media documentation.

**Free in-app History limit:** latest 15 brew records.

### Brewprint Pro Monthly

**Working price:** R59/month

Plan code:

`pro_monthly`

### Brewprint Pro Annual

**Working price:** R499/year

Plan code:

`pro_annual`

## Payment Provider Direction

Initial South African web launch direction:

`Paystack`

The internal billing model must remain independent of Paystack so future payment sources can issue the same `brewprint_pro` entitlement.

Supported provider identifiers in the current architecture:

- `paystack`

- `stripe`

- `apple`

- `google`

- `manual`

## Current Pro Feature Definition

Brewprint Pro currently includes:

- Full Brew History
- Full History search and filtering
- Best Brews
- Best Brews detail
- Brewing Trends
- Trends detail
- Full Coffee Usage analysis
- Full Analytics
- Rear-label coffee photos
- Brew photos
- Future comparison and experiment features where added

---

# Definition of Done

Every development task must meet the relevant requirements below:

- [ ] Feature works locally

- [ ] Free state tested where monetisation applies

- [ ] Pro state tested where monetisation applies

- [ ] Mobile behaviour checked

- [ ] Desktop behaviour checked where relevant

- [ ] Loading state checked where relevant

- [ ] Error state checked where relevant

- [ ] Database permissions checked where relevant

- [ ] User isolation checked where relevant

- [ ] No unexpected console errors

- [ ] `npm run build` passes

- [ ] `git diff --check` passes

- [ ] Change committed

- [ ] Change pushed

- [ ] Production deployment checked where relevant

---

# Launch Gate

Brewprint V1 is ready for paid launch when:

- [ ] All P0 product functionality is complete

- [ ] All P0 security requirements are complete

- [x] User data export is complete

- [x] Account deletion is complete

- [x] Free and Pro entitlement foundation is complete

- [x] Core Pro analytics gates are complete

- [x] Free Brew History limit is complete

- [x] Final Free/Pro photo rules are complete

- [x] Rear-label photo Pro gate is complete

- [x] Brew photo Pro gate is complete

- [ ] Paystack checkout works in production

- [ ] Webhook processing works in production

- [ ] Subscription status sync works

- [ ] Entitlement grants and revocations work from trusted server code

- [ ] Cancellation works

- [ ] Failed payments are handled

- [ ] Privacy Policy is published

- [ ] Terms of Service are published

- [ ] Support contact is published

- [ ] Pricing screen is live

- [ ] Upgrade screen is live

- [ ] Closed beta is complete

- [ ] Production mobile testing passes

- [ ] Cross-browser testing passes

- [ ] PWA installation testing passes

- [ ] Full new-user production journey passes

- [ ] Full Free user journey passes

- [ ] Full Pro subscription journey passes

- [ ] No known launch-blocking security issues remain

- [ ] No known launch-blocking bugs remain

---

# Immediate Next Tasks

The next launch work should be completed in this order:

1. Build the Paystack server-side integration.
2. Create the Paystack checkout flow.
3. Create and verify webhook signature handling.
4. Map Paystack subscription state to `billing_subscriptions`.
5. Grant and revoke `brewprint_pro` entitlements from trusted server code only.
6. Build the Upgrade and Pricing screens.
7. Build subscription management and cancellation.
8. Add failed-payment, expiry and cancellation-at-period-end handling.
9. Test the complete Free -> Pro -> Free payment lifecycle.
10. Complete the remaining production quality checks before closed beta.
