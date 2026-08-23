# Barista Logbook V1 Launch Plan

Last updated: 23 August 2026

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

Completed and verified by 23 August 2026:

* Authentication, profiles and cross-device data sync
* Password recovery and email verification flows
* First-time onboarding
* Coffee Library create, edit and delete functions
* Front and back coffee bag image uploads
* Brew Log create, edit and delete functions
* Optional brew photo upload
* Automatic and atomic coffee weight deduction
* Brew history search and filtering
* Brew Again flow from existing Journal entries
* Brew Again recipe prefill with fresh result fields
* Brew Again creates a separate brew while preserving the original
* Home dashboard rebuilt around real Coffee Library and Brew Log data
* Recent Brew summary with direct brew access and Brew Again
* Favourite Coffee analysis
* Best Brews analysis
* Common Approach analysis across successful brews
* Brewing Trends analysis
* Coffee Usage and estimated brews remaining
* Full Analytics with selectable time periods
* Coffee choice analytics for origins, processes, roasters and roast levels
* Brew method performance analytics
* Highest-rated method and coffee analysis with minimum sample sizes
* Sensory profile and flavour-group analytics
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
* Account deletion and associated user data deletion
* Gemini API moved behind a server-side API endpoint
* Gemini SDK removed from the frontend request flow
* Gemini API key injection removed from the Vite browser bundle
* Frontend verified with no remaining Gemini secret references
* Local production builds passing
* All previously completed changes committed and merged into main
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
* Brew Journal cards restored to open the full brew entry on card click
* Edit, Brew Again and Delete actions verified independently after card interaction fix
* Node 24.19.0 confirmed for local development
* Major dependency migrations identified and deliberately deferred for separate testing
* Home dashboard and Full Analytics production build passed
* Home dashboard mobile interaction testing passed
* BrewForm brew image path typo corrected during dashboard integration

Current recommended development focus:

1. Production-quality review and remaining P0 reliability checks
2. Mobile navigation and loading, error and empty-state review
3. Subscription system
4. Beta and production preparation
5. Separate major dependency migration review for Vite, TypeScript and Google GenAI
6. Gemini production key setup immediately before beta and production testing

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
* [x] Brew Again creates a new brew from an existing recipe
* [x] Brew Again preserves recipe inputs while resetting tasting results, sensory scores, flavour groups and brew photo
* [x] Brew Again preserves the original brew log and deducts the new dose from remaining coffee
* [x] Previous brew image path does not carry into the new brew
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
* [x] Add authentication CAPTCHA protection
* [x] Verify CAPTCHA on sign in
* [x] Verify CAPTCHA on signup
* [x] Verify CAPTCHA on password reset
* [x] Verify CAPTCHA on verification resend
* [x] Verify CAPTCHA in production
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
* [x] Complete production dependency compatibility pass
* [x] Update compatible React, Tailwind and Node type dependencies
* [x] Production build passes after dependency updates
* [x] Development smoke test passes after dependency updates
* [x] Restore full brew opening from Journal card
* [x] Verify Edit, Brew Again and Delete actions after card interaction fix
* [x] Home dashboard mobile review
* [x] Home dashboard detail-view navigation review
* [x] Full Analytics functional review
* [ ] Mobile navigation review
* [ ] PWA installation testing
* [ ] Production console error review
* [ ] Cross-browser testing
* [ ] New-account production test

## User Data

* [ ] Export user data
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

* [x] Number of brews
* [x] Average rating
* [x] Best-rated brew
* [x] Coffee consumed
* [x] Favourite brew method
* [x] Coffee origin trends
* [x] Coffee processing trends
* [x] Roaster trends
* [x] Roast-level trends
* [x] Sensory profile averages
* [x] Flavour-group frequency

## Dashboard

* [x] Current coffees
* [x] Recent brews
* [x] Brew activity by selected period
* [x] Coffee remaining
* [x] Best brews
* [x] Favourite Coffee
* [x] Brewing Trends
* [x] Coffee Usage
* [x] Estimated brews remaining
* [x] Common Approach across successful brews
* [x] Quick Log Brew action
* [x] Full Analytics access
* [x] Mobile dashboard review

## Analytics

* [x] Selectable 30-day period
* [x] Selectable 3-month period
* [x] Selectable 6-month period
* [x] Selectable 1-year period
* [x] All-time analytics
* [x] Total brew count
* [x] Unique coffees brewed
* [x] Average rating
* [x] Total dry coffee used
* [x] Median dose
* [x] Median yield
* [x] Median brew ratio
* [x] Median brew time
* [x] Median water temperature
* [x] Brew method performance
* [x] Highest-rated methods with minimum sample size
* [x] Highest-rated coffees with minimum sample size
* [x] Coffee choice analysis
* [x] Sensory analysis
* [x] Flavour-group analysis
* [x] Correlation versus causation guidance

# P2 Post-Launch

Do not work on these before V1 unless launch-critical work is complete.

* [ ] Experiments and structured variable testing
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
* [x] Build useful Home brewing dashboard
* [x] Add Recent Brew dashboard interaction
* [x] Add Favourite Coffee analysis
* [x] Add Best Brews analysis
* [x] Add Brewing Trends
* [x] Add Coffee Usage tracking
* [x] Add Full Analytics
* [x] Complete dashboard mobile review
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
* [x] Complete Supabase security audit and hardening
* [x] Build account deletion
* [x] Build associated user data deletion
* [x] Move Gemini server-side
* [x] Remove Gemini API key from browser
* [x] Create server-side Gemini request flow
* [x] Complete Brew Again
* [ ] Test Gemini failure handling
* [ ] Review application structure
* [ ] Start reducing responsibilities in App.tsx

### 19 August 2026, Session 3: Brew Again

* [x] Added Brew Again flow from existing Journal entries
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

### 23 August 2026, Session 6: Home Dashboard and Brewing Analytics

Goal: Turn the Home summary cards into a useful brewing dashboard based on real Coffee Library and Brew Log data.

* [x] Rebuilt Home around useful brewing summaries
* [x] Connected dashboard calculations to existing Coffee Library and Brew Log data
* [x] Added Recent Brew summary with direct access to the full brew entry
* [x] Added Brew Again access from Recent Brew
* [x] Added Favourite Coffee analysis
* [x] Added Favourite Coffee brew count and average rating
* [x] Added typical dose, yield, ratio, temperature and brew time
* [x] Added Best Recorded Brew access
* [x] Added estimated brews remaining
* [x] Added Best Brews analysis
* [x] Added Common Approach analysis across successful brews
* [x] Added View Brew and Brew Again actions from Best Brews
* [x] Added brew-frequency Trends
* [x] Added brew-method Trends
* [x] Added coffee-origin Trends
* [x] Added coffee-processing Trends
* [x] Added Coffee Usage tracking
* [x] Added total coffee remaining
* [x] Added remaining weight and percentage per coffee
* [x] Added typical dose and estimated brews remaining
* [x] Added detailed views behind Home summary cards
* [x] Added Full Analytics view
* [x] Added 30-day, 3-month, 6-month, 1-year and all-time filters
* [x] Added total brew, unique coffee, average rating and coffee-used analytics
* [x] Added median dose, yield, ratio, brew time and water-temperature analytics
* [x] Added origin, process, roaster and roast-level frequency analysis
* [x] Added brew-method performance analysis
* [x] Added highest-rated methods with minimum sample-size protection
* [x] Added highest-rated coffees with minimum sample-size protection
* [x] Added average sensory profile
* [x] Added recorded flavour-group frequency
* [x] Added guidance that brewing correlations do not prove causation
* [x] Removed Experiments card from V1 scope
* [x] Moved structured experiment tracking to potential post-launch development
* [x] Fixed BrewForm brewImagePath typo found during integration
* [x] Recent Brew interaction tested
* [x] Brew Again interaction tested
* [x] Favourite Coffee data tested
* [x] Best Brews data and actions tested
* [x] Trends calculations tested
* [x] Coffee Usage calculations tested
* [x] Home dashboard mobile layout tested
* [x] Detail-card scrolling and navigation tested
* [x] Full Analytics tested
* [x] Analytics time-range switching tested
* [x] npm run dev passed
* [x] npm run build passed

Product direction confirmed:

The dashboard should help answer:

* What have I been brewing?
* Which coffees and brew methods do I use most?
* Which recipes have produced my best results?
* What variables commonly appear in my better brews?
* Can I reuse a successful approach on another coffee?
* How are my coffee choices changing over time?
* How much coffee am I using?
* How much coffee do I have left?
* Approximately how many brews remain?

Analytics should report patterns from the user's brewing history without presenting correlation as proof that a specific variable caused a better result.

V1 decision:

Home Dashboard and Brewing Analytics are complete for the current V1 scope.

Further analytics should only be added before launch if beta testing identifies a clear user need.

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
* [ ] Test Gemini failure handling
* [x] Complete Brew Log mobile review
* [ ] Complete mobile navigation review
* [ ] Review loading states
* [ ] Review error states
* [ ] Review empty states
* [ ] Complete new-account production test
* [x] Complete production dependency security pass
* [x] Resolve all known npm vulnerabilities
* [x] Complete compatible dependency updates
* [x] Verify production build after dependency changes
* [x] Complete development smoke test after dependency changes
* [x] Restore Journal card full-entry interaction
* [ ] Review application structure
* [ ] Start reducing responsibilities in App.tsx

## Week 3, 31 August to 6 September

Goal: Retention features.

* [x] Brew Again
* [ ] Saved recipes
* [ ] Brew comparison
* [x] Coffee statistics
* [x] Dashboard improvements
* [x] Brewing analytics
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
* [x] Account deletion
* [ ] Data export
* [ ] Security review
* [ ] Full RLS test
* [ ] Full payment test
* [ ] Production environment review
* [ ] Cross-device test
* [ ] Cross-browser test
* [ ] Full new-user journey test
* [ ] Create new Gemini API key
* [ ] Add Gemini key to server-only Vercel environment
* [ ] Test Gemini server endpoint in production
* [ ] Revoke previous exposed Gemini API key

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