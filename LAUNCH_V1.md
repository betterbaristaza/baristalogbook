# Brewprint V1 Launch Plan

Last updated: 25 August 2026

Target paid launch: 28 September 2026

Development period: 17 August to 13 September

Closed beta: 14 September to 27 September

Paid launch: 28 September 2026

## Product Goal

A new user must be able to:

1. Understand what Brewprint does.
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

Completed and verified by 25 August 2026:

* Authentication, profiles and cross-device data sync
* Password recovery and email verification flows
* First-time onboarding
* Coffee Library create, edit and delete functions
* Front and back coffee bag image uploads
* Brew Log create, edit and delete functions
* Optional brew photo upload
* Automatic and atomic coffee weight deduction
* Brew history search and filtering
* Brew Again flow from existing History entries
* Brew Again recipe prefill with fresh result fields
* Brew Again creates a separate brew while preserving the original
* Home Dashboard implemented
* Best Brews dashboard data
* Brewing Trends dashboard data
* Coffee Usage dashboard data
* Analytics views updated
* Home summary layout improvements
* Header safe-area improvements for iPhone
* Coffee Library empty state
* Brew Log empty state
* Coffee Library card redesign
* Coffee Library mobile layout tested at 390 px
* Add Coffee and Edit Coffee form mobile redesign
* Full-screen mobile coffee form
* iPhone input zoom prevention
* Persistent mobile Save and Discard controls
* Desktop and mobile coffee form testing
* Brew Log mobile usability review
* Brew flow tested at 390 px
* Edit Brew mobile flow verified
* Brew Again mobile flow verified
* Brew photo mobile flow verified
* Brew Save and Cancel behaviour verified
* Brewprint Technical Editorial UI direction implemented across core product areas
* Brewprint brand assets integrated
* Home, Archive, Brew, History and Profile navigation structure implemented
* Brew History interaction updated to open full brew records
* Supabase security audit and database hardening
* RLS verified across all user tables
* Private image storage policies verified
* Database permissions reduced to required operations
* Cross-user coffee and brew references blocked
* Secure password changes enabled
* Frontend password validation matched to Supabase rules
* Account deletion and associated user data deletion
* Full user data export
* Structured JSON export for account, profile, coffees and brews
* Brew History CSV export retained
* Export excludes authentication tokens and temporary image URLs
* Cross-account export isolation verified
* Gemini API moved behind a server-side API endpoint
* Gemini SDK removed from the frontend request flow
* Gemini API key injection removed from the Vite browser bundle
* Frontend verified with no remaining Gemini secret references
* Cloudflare Turnstile CAPTCHA protection added to authentication
* CAPTCHA enabled in Supabase Authentication
* CAPTCHA protection verified for sign in, signup, verification resend and password reset
* Turnstile tested successfully on localhost and production
* Turnstile production hostname configured in Cloudflare
* Public Turnstile site key configured in Vercel
* Turnstile secret stored only in Supabase
* Production authentication flow verified with CAPTCHA enabled
* Production dependency security audit completed
* npm audit reduced from 8 vulnerabilities to 0 vulnerabilities
* Vite patched from 6.4.2 to 6.4.3
* React and React DOM updated to 19.2.8
* Tailwind CSS and @tailwindcss/vite updated to 4.3.3
* @types/node updated within the Node 22 compatibility line
* Production build passed after dependency updates
* Development smoke test passed after dependency updates
* Brew History cards restored to open the full brew entry on card click
* Edit, Brew Again and Delete actions verified independently after card interaction fix
* Node 24.19.0 confirmed for local development
* Major dependency migrations identified and deliberately deferred for separate testing
* Local production builds passing

Current recommended development focus:

1. Complete remaining P0 product reliability checks
2. Complete loading, error and empty-state review
3. Build the subscription and payment system
4. Complete legal, pricing and support requirements
5. Prepare closed beta and production environments
6. Complete final production testing
7. Review App.tsx responsibilities after launch-critical work

AI remains deferred for V1 unless explicitly re-enabled before launch.

## Priority Levels

P0 = Required before launch

P1 = Strongly preferred for launch

P2 = Post-launch or deferred work

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
* [x] Account deletion

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
* [x] Mobile Add Coffee form
* [x] Mobile Edit Coffee form
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
* [x] Brew Again creates a new brew from an existing recipe
* [x] Brew Again preserves recipe inputs while resetting tasting results, sensory scores, flavour groups and brew photo
* [x] Brew Again preserves the original brew log and deducts the new dose from remaining coffee
* [x] Previous brew image path does not carry into the new brew
* [x] Full brew record opens from History card
* [x] Edit action verified
* [x] Brew Again action verified
* [x] Delete action verified
* [x] Final mobile usability review
* [x] 390 px Brew Log test
* [x] Mobile coffee selection flow
* [x] Mobile Brew Form
* [x] Mobile Edit Brew
* [x] Mobile Brew Again
* [x] Mobile brew photo
* [x] Mobile Save and Cancel behaviour

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
* [x] Add authentication CAPTCHA protection
* [x] Verify CAPTCHA on sign in
* [x] Verify CAPTCHA on signup
* [x] Verify CAPTCHA on password reset
* [x] Verify CAPTCHA on verification resend
* [x] Verify CAPTCHA in production
* [x] Remove Gemini API key from browser
* [x] Create server-side Gemini request flow
* [x] Complete production dependency security pass
* [x] Resolve known npm vulnerabilities
* [x] Verify user-data export isolation between accounts

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
* [x] Coffee form mobile review
* [x] iPhone safe-area header fix
* [x] iPhone form input zoom prevention
* [x] Brew Log mobile review
* [x] Brew Log 390 px test
* [x] Brew capture mobile flow review
* [x] Edit Brew mobile review
* [x] Brew Again mobile review
* [x] Brew photo mobile review
* [x] Brew Save and Cancel review
* [x] Complete production dependency compatibility pass
* [x] Update compatible React, Tailwind and Node type dependencies
* [x] Production build passes after dependency updates
* [x] Development smoke test passes after dependency updates
* [x] Restore full brew opening from History card
* [x] Verify Edit, Brew Again and Delete actions after card interaction fix
* [ ] Complete mobile navigation review
* [ ] PWA installation testing
* [ ] Production console error review
* [ ] Cross-browser testing
* [ ] New-account production test

## User Data

* [x] Export user data
* [x] Export account identity
* [x] Export profile data
* [x] Export Coffee Library
* [x] Export Brew Logs
* [x] Retain Brew History CSV export
* [x] Exclude temporary signed image URLs
* [x] Exclude browser File objects
* [x] Exclude authentication tokens and secrets
* [x] Retain stable image storage paths where available
* [x] Verify export download
* [x] Verify export isolation between accounts
* [x] Delete account
* [x] Delete associated user data
* [x] Confirm deleted users lose access

## Launch Requirements

* [ ] Privacy Policy
* [ ] Terms of Service
* [ ] Support contact
* [ ] Pricing page
* [ ] Upgrade page
* [ ] Production domain review
* [ ] Beta feedback process

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

* [x] Number of brews
* [x] Average rating
* [x] Best-rated brew
* [x] Coffee usage data
* [x] Brew method trends
* [x] Coffee origin trends
* [x] Coffee process trends
* [x] Roast trends

## Dashboard

* [x] Home Dashboard
* [x] Best Brews
* [x] Brewing Trends
* [x] Coffee Usage
* [x] Quick Log Brew action
* [x] Links from dashboard into brew records
* [x] Links from dashboard into analytics
* [ ] Experiments

# P2 Post-Launch

Do not work on these before V1 unless launch-critical work is complete.

## Product Expansion

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

## Deferred AI

AI is not required for the V1 paid launch.

Before AI features are enabled:

* [ ] Create a new Gemini API key
* [ ] Add GEMINI_API_KEY as a server-only Vercel environment variable
* [ ] Test Gemini server endpoint in production
* [ ] Test Gemini failure handling
* [ ] Revoke any previously exposed Gemini API key
* [ ] Review AI feature value before enabling it for users

## Deferred Dependency Migrations

Major dependency migrations stay separate from launch-critical fixes.

* [ ] Review next major Vite migration
* [ ] Review next major TypeScript migration
* [ ] Review Google GenAI dependency requirements
* [ ] Run isolated compatibility testing before major upgrades

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
* [x] Improve Add Coffee mobile form
* [x] Improve Edit Coffee mobile form
* [x] Add mobile form safe-area spacing
* [x] Prevent iPhone input zoom
* [x] Complete Coffee Library mobile review
* [x] Complete Brew Log mobile review
* [x] Complete Supabase security audit and hardening
* [x] Build account deletion
* [x] Build associated user data deletion
* [x] Move Gemini server-side
* [x] Remove Gemini API key from browser
* [x] Create server-side Gemini request flow
* [x] Complete Brew Again
* [x] Build Home Dashboard
* [x] Build Best Brews dashboard view
* [x] Build Brewing Trends dashboard view
* [x] Build Coffee Usage dashboard view
* [x] Update Analytics
* [ ] Review application structure
* [ ] Start reducing responsibilities in App.tsx

### 19 August 2026, Session 3: Brew Again

* [x] Added Brew Again flow from existing History entries
* [x] Existing recipe parameters prefill into the new brew
* [x] Tasting results reset for the new brew
* [x] Sensory scores reset for the new brew
* [x] Flavour groups reset for the new brew
* [x] Brew photo resets for the new brew
* [x] Previous brew image path does not carry into the new log
* [x] Previous brew remains unchanged
* [x] New brew saves as a separate log with a new ID and timestamp
* [x] Coffee remaining weight deducts correctly for the repeated brew
* [x] Production build passed

### 23 August 2026, Session 5: Home Dashboard and Brewing Analytics

* [x] Added HomeDashboard component
* [x] Added Best Brews
* [x] Added Brewing Trends
* [x] Added Coffee Usage
* [x] Added method-share and brewing-variable information
* [x] Added origin, process and roast trend information
* [x] Connected dashboard actions to existing Brew Log flows
* [x] Updated AnalyticsView
* [x] Updated BrewForm where required
* [x] Updated App.tsx integration
* [x] Experiments deliberately deferred
* [x] Development test passed
* [x] Production build passed
* [x] Mobile review passed

## Week 2, 24 to 30 August

Goal: Complete remaining P0 product quality, security and mobile requirements.

* [x] Build account deletion
* [x] Build associated user data deletion
* [x] Verify RLS on all user tables
* [x] Verify storage isolation between accounts
* [x] Complete Supabase security hardening
* [x] Remove Gemini API key from browser
* [x] Create server-side Gemini request flow
* [x] Add authentication CAPTCHA protection
* [x] Complete Brew Log mobile review
* [x] Complete 390 px Brew Log test
* [x] Verify mobile coffee selection flow
* [x] Verify mobile Brew Form
* [x] Verify mobile Edit Brew
* [x] Verify mobile Brew Again
* [x] Verify mobile brew photo
* [x] Verify mobile Save and Cancel behaviour
* [x] Complete production dependency security pass
* [x] Resolve all known npm vulnerabilities
* [x] Complete compatible dependency updates
* [x] Verify production build after dependency changes
* [x] Complete development smoke test after dependency changes
* [x] Restore History card full-entry interaction
* [x] Implement Brewprint Technical Editorial UI across core screens
* [x] Implement Brewprint navigation structure
* [x] Complete user data export
* [x] Add Export User Data to Profile
* [x] Verify user export contents
* [x] Verify user export does not expose authentication data
* [x] Verify cross-account export isolation
* [ ] Complete mobile navigation review
* [ ] Review loading states
* [ ] Review error states
* [ ] Review empty states
* [ ] Complete new-account production test
* [ ] Review application structure
* [ ] Start reducing responsibilities in App.tsx

### 24 August 2026: Brewprint V1 UI/UX Implementation Pass

* [x] Applied Brewprint Technical Editorial visual system to core application areas
* [x] Integrated Brewprint branding
* [x] Updated Home presentation
* [x] Updated Archive presentation
* [x] Updated coffee record interactions
* [x] Updated Brew Log presentation
* [x] Updated History presentation
* [x] Updated Analytics presentation
* [x] Updated navigation
* [x] Restored full Brew History card opening
* [x] Preserved Edit, Brew Again and Delete actions
* [x] Production build passed
* [x] Functional tests passed

### 25 August 2026: Brew Log Mobile Usability Verification

* [x] Journal list reviewed on mobile
* [x] Brew capture coffee selection reviewed
* [x] Brew Form reviewed
* [x] Edit Brew reviewed
* [x] Brew Again reviewed
* [x] Brew photo behaviour reviewed
* [x] Save behaviour reviewed
* [x] Cancel behaviour reviewed
* [x] Touch controls reviewed
* [x] 390 px layout tested
* [x] Mobile session accepted as passed

### 25 August 2026, Session 8: User Data Export

* [x] Preserved existing Brew History CSV export
* [x] Added full account data export from Profile
* [x] Added Export User Data action to Profile Data section
* [x] Export includes account identity
* [x] Export includes profile
* [x] Export includes Coffee Library
* [x] Export includes Brew Logs
* [x] Export uses structured JSON
* [x] Added schema version
* [x] Added export timestamp
* [x] Temporary signed image URLs excluded
* [x] Browser File objects excluded
* [x] Authentication tokens and secrets excluded
* [x] Stable image storage paths retained where available
* [x] Export download tested successfully
* [x] Account A export tested
* [x] Account B export tested
* [x] Cross-account data isolation verified
* [x] Account IDs verified against the authenticated user
* [x] Production build passed

## Week 3, 31 August to 6 September

Goal: Retention features and remaining product refinement.

* [x] Brew Again
* [ ] Saved recipes
* [ ] Brew comparison
* [x] Coffee statistics
* [x] Dashboard improvements
* [x] Search and filtering improvements
* [ ] Final decision on which P1 features remain in launch scope

## Week 4, 7 to 13 September

Goal: Payments and commercial system.

* [ ] Subscription database
* [ ] Free and Pro account logic
* [ ] Payment provider test environment
* [ ] Checkout
* [ ] Webhooks
* [ ] Subscription status sync
* [ ] Subscription management
* [ ] Failed payment testing
* [ ] Cancellation testing
* [ ] Free account limit testing
* [ ] Upgrade screen
* [ ] Pricing page

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
* [ ] Subscription problems
* [ ] Export or account-control problems

Development priority:

Fix problems before adding new features.

## Week 6, 21 to 27 September

Goal: Production readiness.

* [ ] Privacy Policy
* [ ] Terms
* [ ] Support contact
* [x] Account deletion
* [x] Data export
* [ ] Final security review
* [ ] Final RLS test
* [ ] Full payment test
* [ ] Production environment review
* [ ] Cross-device test
* [ ] Cross-browser test
* [ ] PWA installation test
* [ ] Production console review
* [ ] Full new-user journey test
* [ ] Full subscription journey test
* [ ] Full cancellation test
* [ ] Full failed-payment test
* [ ] Confirm beta feedback has been reviewed
* [ ] Confirm no launch-blocking bugs remain

AI production setup is not required unless AI is intentionally enabled for V1.

## 28 September

* [ ] Launch Brewprint V1
* [ ] Enable paid Pro subscriptions
* [ ] Confirm production payments
* [ ] Confirm production account creation
* [ ] Confirm production account deletion
* [ ] Confirm production data export
* [ ] Begin tracking real customer behaviour

# Definition of Done

Every development task must meet these requirements:

* [ ] Feature works locally
* [ ] Mobile behaviour checked
* [ ] Desktop behaviour checked where relevant
* [ ] Loading state checked where relevant
* [ ] Error state checked where relevant
* [ ] Database permissions checked where relevant
* [ ] User isolation checked where relevant
* [ ] No unexpected console errors
* [ ] `npm run build` passes
* [ ] Change committed
* [ ] Change pushed
* [ ] Production deployment checked where relevant

# Launch Gate

Brewprint V1 is ready for paid launch when:

* [ ] All P0 product functionality is complete
* [ ] All P0 security requirements are complete
* [ ] User data export and deletion are complete
* [ ] Free and Pro account logic is complete
* [ ] Payments work in production
* [ ] Subscription status sync works
* [ ] Cancellation works
* [ ] Failed payments are handled
* [ ] Privacy Policy is published
* [ ] Terms of Service are published
* [ ] Support contact is published
* [ ] Pricing and Upgrade screens are live
* [ ] Closed beta is complete
* [ ] Production mobile testing passes
* [ ] Cross-browser testing passes
* [ ] Full new-user production journey passes
* [ ] No known launch-blocking security issues remain
* [ ] No known launch-blocking bugs remain
