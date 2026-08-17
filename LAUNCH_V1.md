# Barista Logbook V1 Launch Plan

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
* [ ] Email verification flow
* [ ] Forgot password
* [ ] Password reset
* [ ] Authentication error states
* [ ] Account deletion

## Coffee Library

* [x] Add coffee
* [x] Edit coffee
* [x] Delete coffee
* [x] Coffee remaining weight
* [x] Front bag photo
* [x] Back bag photo
* [x] Private image storage
* [ ] First-use empty state
* [ ] Final mobile usability review

## Brew Log

* [x] Add brew
* [x] Edit brew
* [x] Delete brew
* [x] Optional brew image
* [x] Automatic coffee weight deduction
* [x] Brew history
* [x] Search and filtering
* [ ] Brew Again
* [ ] Final mobile usability review

## Security

* [x] Supabase Row Level Security foundation
* [x] Private user image storage
* [x] Atomic coffee weight update
* [ ] Verify RLS on all user tables
* [ ] Verify storage isolation between accounts
* [ ] Remove Gemini API key from browser
* [ ] Create server-side Gemini request flow
* [ ] Confirm no secret payment keys exist in client code

## Onboarding

* [ ] Welcome screen
* [ ] First-time profile completion
* [ ] Add first coffee
* [ ] Log first brew
* [ ] Clear first-use guidance
* [ ] Skip options where appropriate

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

* [ ] Loading states
* [ ] Error states
* [ ] Empty states
* [ ] Mobile navigation review
* [ ] Mobile form review
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

Goal: Technical foundation and launch scope.

* [x] Fix profile persistence
* [x] Lock V1 scope
* [x] Update README
* [ ] Add this launch roadmap
* [ ] Move Gemini server-side
* [ ] Test Gemini failure handling
* [ ] Review application structure
* [ ] Start reducing responsibilities in App.tsx

## Week 2, 24 to 30 August

Goal: Accounts and onboarding.

* [ ] Password recovery
* [ ] Email verification UX
* [ ] Authentication error states
* [ ] Build onboarding
* [ ] Improve first-use Coffee Library
* [ ] Improve first-use Brew Log
* [ ] Mobile usability testing

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
* [ ] Loading state checked where relevant
* [ ] Error state checked where relevant
* [ ] Database permissions checked where relevant
* [ ] No unexpected console errors
* [ ] `npm run build` passes
* [ ] Change committed
* [ ] Change pushed
* [ ] Production deployment checked where relevant
