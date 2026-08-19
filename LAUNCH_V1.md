# Barista Logbook V1 Launch Plan

Last updated: 19 August 2026

Target paid launch: 28 September 2026

Development period: 17 August to 13 September  
Closed beta: 14 September to 27 September  
Paid launch: 28 September 2026

## Product Goal

A new user must be able to:

1. Understand what Barista Logbook does.
2. Create an account.
3. Complete their profile once.
4. Add a coffee.
5. Upload coffee bag photos.
6. Log a brew.
7. Upload an optional brew photo.
8. Track remaining coffee.
9. Review previous brews.
10. Reuse a successful recipe.
11. Sign in on another device.
12. Recover their account.
13. Upgrade to Pro.
14. Manage their subscription.
15. Export or delete their data.

Core product loop:

Record → Brew → Compare → Improve

## Current Development Status

Completed and verified by 19 August 2026:

* Authentication, profiles and cross-device data sync
* Password recovery and email verification flows
* First-time onboarding
* Coffee Library create, edit and delete functions
* Front and back coffee bag image uploads
* Brew Log create, edit and delete functions
* Optional brew photo upload
* Automatic and atomic coffee weight deduction
* Brew history search and filtering
* Home summary layout improvements
* Header safe-area improvements for iPhone
* Coffee Library empty state
* Brew Log empty state
* Coffee Library card redesign
* Coffee Library mobile layout tested at 390 px
* Add Bean and Edit Bean form mobile redesign
* Full-screen mobile bean form
* iPhone input zoom prevention
* Persistent mobile Save and Discard controls
* Desktop and mobile bean form testing
* Brew Log mobile usability review
* Supabase security audit and database hardening
* RLS verified across all user tables
* Private image storage policies verified
* Database permissions reduced to required operations
* Cross-user coffee and brew references blocked
* Secure password changes enabled
* Frontend password validation matched to Supabase rules
* Local production builds passing
* All completed changes committed and merged into main
* Gemini API moved behind a server-side API endpoint
* Gemini SDK removed from the frontend request flow
* Gemini API key injection removed from the Vite browser bundle
* Frontend verified with no remaining Gemini secret references

Current recommended development focus:

1. Brew Again
2. Account deletion and user data deletion
3. Mobile navigation and product quality review
4. Subscription system
5. Beta and production preparation

## Priority Levels

P0 = Required before launch  
P1 = Strongly preferred for launch  
P2 = Post-launch

# P0 Launch Requirements

## Accounts

* [x] Supabase authentication
* [x] User profiles
* [x] Profile persistence
* [x] Cross-device account sync
* [x] Sign out
* [x] Email verification flow
* [x] Forgot password
* [x] Password reset
* [x] Authentication error states
* [ ] Account deletion

## Coffee Library

* [x] Add coffee
* [x] Edit coffee
* [x] Delete coffee
* [x] Coffee remaining weight
* [x] Front bag photo
* [x] Back bag photo
* [x] Private image storage
* [x] First-use empty state
* [x] Coffee card information hierarchy
* [x] Mobile card layout
* [x] Mobile Add Bean form
* [x] Mobile Edit Bean form
* [x] Mobile Save and Discard controls
* [x] Final mobile usability review

## Brew Log

* [x] Add brew
* [x] Edit brew
* [x] Delete brew
* [x] Optional brew image
* [x] Automatic coffee weight deduction
* [x] Atomic coffee weight update
* [x] Brew history
* [x] Search and filtering
* [x] First-use empty state
* [ ] Brew Again
* [x] Final mobile usability review

## Security

* [x] Supabase Row Level Security foundation
* [x] Verify RLS on all user tables
* [x] Private user image storage
* [x] Verify storage isolation between accounts
* [x] Atomic coffee weight update
* [x] Restrict direct trigger function access
* [x] Reduce anonymous and authenticated database privileges
* [x] Enforce matching ownership between brew logs and coffees
* [x] Enable secure password changes
* [x] Match frontend password validation to Supabase rules
* [x] Confirm no service-role, database or payment secrets exist in client code
* [ ] Add authentication CAPTCHA protection
* [x] Remove Gemini API key from browser
* [x] Create server-side Gemini request flow

## Onboarding

* [x] Welcome screen
* [x] First-time profile completion
* [x] Add first coffee
* [x] Log first brew
* [x] Clear first-use guidance
* [x] Skip options where appropriate
* [x] Onboarding completion persistence

## Commercial System

* [ ] Free account level
* [ ] Pro account level
* [ ] Subscription database table
* [ ] Payment provider integration
* [ ] Checkout
* [ ] Payment webhook
* [ ] Subscription status sync
* [ ] Upgrade screen
* [ ] Subscription management
* [ ] Cancellation handling
* [ ] Failed payment handling
* [ ] Free account limits

## Product Quality

* [ ] Complete loading-state review
* [ ] Complete error-state review
* [ ] Complete empty-state review
* [x] Coffee Library empty state
* [x] Brew Log empty state
* [x] Coffee Library mobile review
* [x] Bean form mobile review
* [x] iPhone safe-area header fix
* [x] iPhone form input zoom prevention
* [x] Brew Log mobile review
* [ ] Mobile navigation review
* [ ] PWA installation testing
* [ ] Production console error review
* [ ] Cross-browser testing
* [ ] New-account production test

## User Data

* [ ] Export user data
* [ ] Delete account
* [ ] Delete associated user data
* [ ] Confirm deleted users lose access

## Launch Requirements

* [ ] Privacy Policy
* [ ] Terms of Service
* [ ] Support contact
* [ ] Pricing page
* [ ] Upgrade page
* [ ] Production domain review
* [ ] Beta feedback process
* [ ] Create new Gemini API key before enabling AI features
* [ ] Add GEMINI_API_KEY as a server-only Vercel environment variable
* [ ] Test Gemini server endpoint in production
* [ ] Revoke previous exposed Gemini API key

# P1 Launch Features

## Recipes

* [ ] Save a brew as recipe
* [ ] Saved recipe library
* [ ] Favourite recipes
* [ ] Start new brew from saved recipe

## Brew Comparison

* [ ] Compare current brew to previous brew
* [ ] Compare dose
* [ ] Compare yield
* [ ] Compare time
* [ ] Compare temperature
* [ ] Compare rating

## Coffee Statistics

* [ ] Number of brews
* [ ] Average rating
* [ ] Best-rated brew
* [ ] Coffee consumed
* [ ] Favourite brew method

## Dashboard

* [ ] Current coffees
* [ ] Recent brews
* [ ] Brews this week
* [ ] Coffee remaining
* [ ] Best recent brew
* [ ] Quick Log Brew action
* [ ] Quick Add Coffee action

# P2 Post-Launch

Do not work on these before V1 unless launch-critical work is complete.

* [ ] Café accounts
* [ ] Team accounts
* [ ] Roaster accounts
* [ ] Public profiles
* [ ] Followers
* [ ] Social feed
* [ ] Community recipes
* [ ] Leaderboards
* [ ] Achievements
* [ ] Coffee marketplace
* [ ] Native iOS app
* [ ] Native Android app
* [ ] Equipment integrations

# Development Schedule

## Week 1, 17 to 23 August

Goal: Technical foundation, launch scope and core mobile usability.

* [x] Fix profile persistence
* [x] Lock V1 scope
* [x] Update README
* [x] Add this launch roadmap
* [x] Complete password recovery
* [x] Complete email verification UX
* [x] Complete authentication error states
* [x] Build onboarding
* [x] Fix onboarding completion persistence
* [x] Improve Home summary layout
* [x] Fix iPhone header safe area
* [x] Improve first-use Coffee Library
* [x] Improve first-use Brew Log
* [x] Redesign Coffee Library card
* [x] Test Coffee Library card at 390 px
* [x] Improve Add Bean mobile form
* [x] Improve Edit Bean mobile form
* [x] Add mobile form safe-area spacing
* [x] Prevent iPhone input zoom
* [x] Complete Coffee Library mobile review
* [x] Complete Brew Log mobile review
* [ ] Move Gemini server-side
* [ ] Test Gemini failure handling
* [ ] Review application structure
* [ ] Start reducing responsibilities in App.tsx

## Week 2, 24 to 30 August

Goal: Complete P0 account, security and mobile requirements.

* [ ] Build account deletion
* [ ] Build associated user data deletion
* [x] Verify RLS on all user tables
* [x] Verify storage isolation between accounts
* [x] Complete Supabase security hardening
* [ ] Remove Gemini API key from browser
* [ ] Create server-side Gemini request flow
* [ ] Test Gemini failure handling
* [x] Complete Brew Log mobile review
* [ ] Complete mobile navigation review
* [ ] Review loading states
* [ ] Review error states
* [ ] Review empty states
* [ ] Complete new-account production test

## Week 3, 31 August to 6 September

Goal: Retention features.

* [ ] Brew Again
* [ ] Saved recipes
* [ ] Brew comparison
* [ ] Coffee statistics
* [ ] Dashboard improvements
* [ ] Search improvements

## Week 4, 7 to 13 September

Goal: Payments.

* [ ] Subscription database
* [ ] Free and Pro account logic
* [ ] Payment provider test environment
* [ ] Checkout
* [ ] Webhooks
* [ ] Subscription management
* [ ] Failed payment testing
* [ ] Cancellation testing

## Week 5, 14 to 20 September

Goal: Closed beta.

Target: 10 to 20 users.

Track:

* [ ] Signup completion
* [ ] First coffee created
* [ ] First brew created
* [ ] Return usage
* [ ] Confusing screens
* [ ] Bugs
* [ ] Feature requests
* [ ] Mobile problems

Development priority:

Fix problems before adding new features.

## Week 6, 21 to 27 September

Goal: Production readiness.

* [ ] Privacy Policy
* [ ] Terms
* [ ] Support contact
* [ ] Account deletion
* [ ] Data export
* [ ] Security review
* [ ] Full RLS test
* [ ] Full payment test
* [ ] Production environment review
* [ ] Cross-device test
* [ ] Cross-browser test
* [ ] Full new-user journey test

## 28 September

* [ ] Launch Barista Logbook V1
* [ ] Enable paid Pro subscriptions
* [ ] Begin tracking real customer behaviour

# Definition of Done

Every development task must meet these requirements:

* [ ] Feature works locally
* [ ] Mobile behaviour checked
* [ ] Desktop behaviour checked where relevant
* [ ] Loading state checked where relevant
* [ ] Error state checked where relevant
* [ ] Database permissions checked where relevant
* [ ] No unexpected console errors
* [ ] `npm run build` passes
* [ ] Change committed
* [ ] Change pushed
* [ ] Production deployment checked where relevant