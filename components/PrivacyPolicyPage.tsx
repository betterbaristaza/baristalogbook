import React from 'react';

import {
  BrewprintMark,
  BrewprintWordmark,
} from './BrewprintBrand';

const PrivacyPolicyPage: React.FC = () => {
  const handleBack = () => {
    window.location.href = '/';
  };

  return (
    <div className="bp-page min-h-screen">
      <div className="bp-grid min-h-screen">
        <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
          <header className="mb-8 flex items-center justify-between border-b border-[var(--bp-line)] pb-4">
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-3"
              aria-label="Return to Brewprint"
            >
              <BrewprintMark className="h-9 w-9" />

              <BrewprintWordmark className="h-[16px] w-auto" />
            </button>

            <span className="bp-code text-[var(--bp-muted)]">
              LEGAL / PRIVACY
            </span>
          </header>

          <main className="border border-[var(--bp-line)] bg-[var(--bp-paper)]">
            <section className="border-b border-[var(--bp-line)] p-5 sm:p-8">
              <p className="bp-index">
                LEGAL.01 / PRIVACY
              </p>

              <h1 className="bp-heading mt-3 text-3xl text-[var(--bp-blue)] sm:text-4xl">
                Privacy Policy
              </h1>

              <p className="bp-code mt-3 text-[var(--bp-muted)]">
                Effective 26 August 2026
              </p>

              <p className="mt-6 max-w-2xl text-sm leading-7 text-[var(--bp-muted)]">
                This Privacy Policy explains how Brewprint
                collects, uses, stores, shares and protects
                personal information when you use the
                Brewprint service.
              </p>
            </section>

            <div className="space-y-10 p-5 sm:p-8">
              <LegalSection
                number="01"
                title="Who operates Brewprint"
              >
                <p>
                  Brewprint is operated by Dorian
                  Labuschagne, a natural person carrying
                  on business in the Republic of South
                  Africa under the trading name
                  Brewprint.
                </p>

                <p>
                  Brewprint is currently a trading name
                  and is not a separate incorporated
                  legal entity.
                </p>

                <p>
                  In this Privacy Policy, “Brewprint”,
                  “we”, “us” and “our” refer to Dorian
                  Labuschagne trading as Brewprint.
                </p>

                <p>
                  For purposes of the Protection of
                  Personal Information Act 4 of 2013,
                  referred to as POPIA, Dorian
                  Labuschagne trading as Brewprint is
                  the responsible party where Brewprint
                  determines the purpose and means of
                  processing personal information.
                </p>

                <p>
                  Where the EU General Data Protection
                  Regulation, UK GDPR or similar
                  legislation applies, Dorian
                  Labuschagne trading as Brewprint
                  generally acts as the controller of
                  the personal information described
                  in this Privacy Policy.
                </p>
              </LegalSection>

              <LegalSection
                number="02"
                title="Scope"
              >
                <p>
                  This Privacy Policy applies to the
                  Brewprint website, web application,
                  mobile application if released,
                  accounts, Coffee Library, Brew Logs,
                  uploaded images, support functions,
                  account management, data exports,
                  security systems and related services
                  controlled by Brewprint.
                </p>

                <p>
                  It applies regardless of where you
                  access Brewprint, subject to
                  mandatory local law.
                </p>
              </LegalSection>

              <LegalSection
                number="03"
                title="Information we collect"
              >
                <p>
                  Depending on how you use Brewprint,
                  we may collect or process:
                </p>

                <LegalList
                  items={[
                    'Email address and account identifiers.',
                    'Authentication, verification, login and account recovery information.',
                    'Profile information such as your display name and coffee-related role.',
                    'Coffee Library information including coffee name, roaster, origin, producer, variety, processing method, roast information, bag size, remaining quantity, notes and photographs.',
                    'Brew Log information including brew method, dose, water quantity, yield, time, temperature, grinder, grind setting, recipe variables, ratings, tasting notes, brew notes and photographs.',
                    'Files and images that you choose to upload.',
                    'Device, browser, network, IP address, session, request and security information.',
                    'Support messages and information you send to us.',
                    'Subscription and transaction information if paid services are introduced.',
                  ]}
                />
              </LegalSection>

              <LegalSection
                number="04"
                title="Sensitive information"
              >
                <p>
                  Brewprint is not designed to require
                  sensitive personal information.
                </p>

                <p>
                  Please do not use Brewprint to store
                  unrelated health information,
                  government identification numbers,
                  banking credentials, biometric
                  information, political or religious
                  beliefs, sexual information,
                  criminal information, trade union
                  membership or other unrelated
                  sensitive personal information.
                </p>
              </LegalSection>

              <LegalSection
                number="05"
                title="How we collect information"
              >
                <p>
                  We may receive information directly
                  from you, automatically from your
                  browser or device, through
                  authentication systems, through our
                  infrastructure and security
                  providers, and through communications
                  you send to Brewprint.
                </p>
              </LegalSection>

              <LegalSection
                number="06"
                title="Why we process information"
              >
                <LegalList
                  items={[
                    'Create and maintain user accounts.',
                    'Authenticate and verify users.',
                    'Provide account recovery.',
                    'Operate the Coffee Library.',
                    'Create and store Brew Logs.',
                    'Track coffee quantities and usage.',
                    'Store optional coffee and brew images.',
                    'Synchronise information across devices.',
                    'Display brew history and allow recipes to be reused.',
                    'Provide user data exports.',
                    'Process account deletion.',
                    'Provide customer support.',
                    'Protect Brewprint against fraud, bots, abuse and security threats.',
                    'Diagnose faults and maintain service reliability.',
                    'Comply with legal obligations.',
                    'Establish, exercise or defend legal rights.',
                    'Enforce the Brewprint Terms of Service.',
                    'Administer paid subscriptions if introduced.',
                    'Send required transactional and security communications.',
                    'Send marketing where legally permitted.',
                    'Measure and improve the service where legally permitted.',
                  ]}
                />
              </LegalSection>

              <LegalSection
                number="07"
                title="Lawful grounds"
              >
                <p>
                  Where POPIA applies, Brewprint
                  processes personal information where
                  a lawful justification exists under
                  POPIA.
                </p>

                <p>
                  These grounds may include your
                  consent, performance of a contract,
                  compliance with law, protection of
                  your legitimate interests, or the
                  legitimate interests of Brewprint or
                  another person where permitted by
                  law.
                </p>

                <p>
                  Where GDPR or UK GDPR applies, our
                  primary lawful bases may include
                  contractual necessity, legitimate
                  interests, legal obligations and
                  consent.
                </p>

                <p>
                  Where we rely on consent, you may
                  withdraw that consent. Withdrawal
                  does not make previous lawful
                  processing unlawful.
                </p>
              </LegalSection>

              <LegalSection
                number="08"
                title="Required and optional information"
              >
                <p>
                  Certain information is required for
                  Brewprint to operate. For example,
                  an email address is generally
                  required to create and maintain a
                  registered account.
                </p>

                <p>
                  Most coffee details, tasting
                  information, brew notes and images
                  are voluntary.
                </p>
              </LegalSection>

              <LegalSection
                number="09"
                title="User content"
              >
                <p>
                  You control the coffee records, brew
                  information, photographs, notes and
                  other content you submit.
                </p>

                <p>
                  You should only upload content you
                  own or have the legal right to use.
                  You should not submit another
                  person's personal or confidential
                  information unless you have a lawful
                  basis to do so.
                </p>
              </LegalSection>

              <LegalSection
                number="10"
                title="Cookies and local storage"
              >
                <p>
                  Brewprint may use cookies, browser
                  storage, authentication tokens,
                  session storage or similar
                  technologies required to keep you
                  signed in, maintain application
                  state, protect your account and
                  provide requested functionality.
                </p>

                <p>
                  If optional analytics, advertising
                  or similar technologies are
                  introduced and consent is required,
                  Brewprint will request that consent
                  before activating the relevant
                  processing.
                </p>
              </LegalSection>

              <LegalSection
                number="11"
                title="Service providers"
              >
                <p>
                  Brewprint currently uses third-party
                  infrastructure providers necessary
                  to operate the service.
                </p>

                <h3 className="bp-heading pt-2 text-base text-[var(--bp-blue)]">
                  Supabase
                </h3>

                <p>
                  Supabase is used for services that
                  may include authentication,
                  databases, account management and
                  file storage.
                </p>

                <h3 className="bp-heading pt-2 text-base text-[var(--bp-blue)]">
                  Vercel
                </h3>

                <p>
                  Vercel is used to host and deliver
                  parts of the Brewprint application
                  and may process technical
                  information necessary to receive and
                  serve application requests.
                </p>

                <h3 className="bp-heading pt-2 text-base text-[var(--bp-blue)]">
                  Cloudflare
                </h3>

                <p>
                  Cloudflare Turnstile is used for
                  security and anti-bot protection and
                  may process browser, device, network
                  and interaction signals necessary
                  for that security function.
                </p>

                <p>
                  Additional providers may be
                  introduced as Brewprint develops.
                  This Privacy Policy will be updated
                  where a material change affects the
                  processing of personal information.
                </p>
              </LegalSection>

              <LegalSection
                number="12"
                title="Contractors, including Fika (Pty) Ltd"
              >
                <p>
                  Brewprint may engage independent
                  contractors, including Fika (Pty)
                  Ltd, for specific services.
                </p>

                <p>
                  Fika (Pty) Ltd does not become the
                  legal operator or owner of Brewprint
                  merely because it provides services
                  to Brewprint.
                </p>

                <p>
                  Where a contractor processes
                  Brewprint personal information only
                  on Brewprint's instructions and
                  behalf, the contractor will act as
                  an operator or processor to the
                  extent required by applicable law.
                </p>

                <p>
                  Contractors who receive access to
                  personal information must be given
                  only the access reasonably necessary
                  for the contracted service and must
                  be subject to appropriate
                  confidentiality, security and data
                  processing obligations where
                  required.
                </p>
              </LegalSection>

              <LegalSection
                number="13"
                title="Sale and advertising"
              >
                <p>
                  Brewprint does not currently sell
                  users' personal information for
                  money.
                </p>

                <p>
                  Brewprint does not currently share
                  personal information for third-party
                  cross-context behavioural
                  advertising and does not operate a
                  third-party targeted advertising
                  network.
                </p>

                <p>
                  If these practices change, we will
                  provide the notices and choices
                  required by applicable law.
                </p>
              </LegalSection>

              <LegalSection
                number="14"
                title="International processing"
              >
                <p>
                  Brewprint is operated from South
                  Africa, but some infrastructure
                  providers and their subprocessors
                  operate internationally.
                </p>

                <p>
                  Your information may therefore be
                  transferred to, stored in, accessed
                  from or processed in countries other
                  than South Africa or your country of
                  residence.
                </p>

                <p>
                  We do not represent that all
                  Brewprint information is stored
                  exclusively in South Africa.
                </p>
              </LegalSection>

              <LegalSection
                number="15"
                title="South African international transfers"
              >
                <p>
                  Where POPIA applies, Brewprint will
                  transfer personal information
                  outside South Africa only where
                  permitted by POPIA.
                </p>

                <p>
                  Depending on the circumstances, this
                  may include transfers protected by
                  applicable law, binding agreements,
                  adequate safeguards, your consent,
                  contractual necessity or another
                  lawful exception.
                </p>
              </LegalSection>

              <LegalSection
                number="16"
                title="European and UK transfers"
              >
                <p>
                  Where GDPR or UK GDPR international
                  transfer restrictions apply,
                  Brewprint will use an appropriate
                  lawful transfer mechanism where
                  required.
                </p>

                <p>
                  These mechanisms may include
                  adequacy decisions, Standard
                  Contractual Clauses, UK transfer
                  provisions or another legally
                  recognised safeguard.
                </p>
              </LegalSection>

              <LegalSection
                number="17"
                title="Retention"
              >
                <p>
                  Brewprint retains personal
                  information only for as long as
                  reasonably necessary for the
                  relevant purpose and applicable
                  legal requirements.
                </p>

                <p>
                  Account information, Coffee Library
                  records, Brew Logs and uploaded
                  content may generally be retained
                  while your account is active.
                </p>

                <p>
                  After deletion, some information may
                  temporarily remain in restricted
                  backups, security records or
                  provider systems until ordinary
                  deletion or backup rotation occurs.
                </p>

                <p>
                  Certain records may be retained for
                  legal compliance, security, fraud
                  prevention, accounting, dispute
                  resolution or legal claims.
                </p>
              </LegalSection>

              <LegalSection
                number="18"
                title="Security"
              >
                <p>
                  Brewprint uses reasonable technical
                  and organisational safeguards
                  appropriate to the nature of the
                  service.
                </p>

                <LegalList
                  items={[
                    'Authentication and email verification.',
                    'Access controls.',
                    'Row-level database security.',
                    'Private file storage.',
                    'User-specific storage restrictions.',
                    'File size and file type restrictions.',
                    'Server-side secret handling.',
                    'Restricted database permissions.',
                    'Account ownership controls.',
                    'Anti-bot protection.',
                    'Application and infrastructure security measures.',
                  ]}
                />

                <p>
                  No internet-connected service can
                  guarantee absolute security.
                </p>
              </LegalSection>

              <LegalSection
                number="19"
                title="Security incidents"
              >
                <p>
                  If Brewprint reasonably believes
                  personal information has been
                  accessed or acquired by an
                  unauthorised person, we will
                  investigate, take reasonable
                  containment measures and make
                  notifications required by applicable
                  law.
                </p>

                <p>
                  Where POPIA requires notification,
                  the South African Information
                  Regulator and affected users will be
                  notified in accordance with the
                  applicable requirements.
                </p>
              </LegalSection>

              <LegalSection
                number="20"
                title="Data export"
              >
                <p>
                  Brewprint provides or may provide
                  account export functionality.
                </p>

                <p>
                  Exports may contain profile
                  information, Coffee Library records
                  and Brew Log records.
                </p>

                <p>
                  Technical, security, legal and
                  internal records may be excluded
                  where applicable law does not
                  require their disclosure.
                </p>
              </LegalSection>

              <LegalSection
                number="21"
                title="Account deletion"
              >
                <p>
                  You may request deletion of your
                  Brewprint account using the
                  available account controls or by
                  contacting Brewprint.
                </p>

                <p>
                  Account deletion may permanently
                  remove your profile, Coffee Library
                  records, Brew Logs and uploaded
                  images.
                </p>

                <p>
                  Information that Brewprint is
                  legally required or permitted to
                  retain may remain after deletion.
                </p>
              </LegalSection>

              <LegalSection
                number="22"
                title="Your privacy rights"
              >
                <p>
                  Depending on the law that applies,
                  you may have rights to:
                </p>

                <LegalList
                  items={[
                    'Know whether Brewprint processes your personal information.',
                    'Access your personal information.',
                    'Correct inaccurate or incomplete information.',
                    'Request deletion where applicable.',
                    'Object to certain processing.',
                    'Request restriction of certain processing.',
                    'Withdraw consent where processing relies on consent.',
                    'Receive certain information in a portable format.',
                    'Object to direct marketing.',
                    'Opt out of qualifying sales, sharing or targeted advertising.',
                    'Exercise applicable rights concerning automated decision-making.',
                    'Lodge a complaint with a competent privacy regulator.',
                  ]}
                />

                <p>
                  Some rights are subject to legal
                  exceptions. Brewprint may take
                  reasonable steps to verify your
                  identity before processing a
                  privacy request.
                </p>
              </LegalSection>

              <LegalSection
                number="23"
                title="South Africa and POPIA"
              >
                <p>
                  Dorian Labuschagne trading as
                  Brewprint is the responsible party
                  for Brewprint where POPIA applies.
                </p>

                <p>
                  Brewprint seeks to process personal
                  information in accordance with
                  POPIA's conditions for lawful
                  processing, including
                  accountability, processing
                  limitation, purpose specification,
                  further processing limitation,
                  information quality, openness,
                  security safeguards and data
                  subject participation.
                </p>

                <p>
                  South African users may have rights
                  including access, correction,
                  deletion, objection, withdrawal of
                  consent where applicable and the
                  right to complain to the
                  Information Regulator.
                </p>
              </LegalSection>

              <LegalSection
                number="24"
                title="Information Officer"
              >
                <p>
                  Dorian Labuschagne is the
                  Information Officer for Brewprint
                  unless another person is lawfully
                  appointed or designated.
                </p>

                <p>
                  The Information Officer will perform
                  the functions required by POPIA and
                  the Promotion of Access to
                  Information Act 2 of 2000, referred
                  to as PAIA.
                </p>
              </LegalSection>

              <LegalSection
                number="25"
                title="PAIA"
              >
                <p>
                  Dorian Labuschagne carrying on
                  business as Brewprint is a private
                  body for purposes of PAIA to the
                  extent provided by that Act.
                </p>

                <p>
                  Brewprint will maintain and make
                  available PAIA documentation where
                  required by applicable law.
                </p>
              </LegalSection>

              <LegalSection
                number="26"
                title="European Economic Area"
              >
                <p>
                  This section applies only where the
                  GDPR applies to Brewprint's
                  processing.
                </p>

                <p>
                  Users may have rights including
                  access, rectification, erasure,
                  restriction, data portability,
                  objection, withdrawal of consent
                  and rights concerning certain
                  automated decisions.
                </p>

                <p>
                  Brewprint is operated from South
                  Africa and is not currently
                  established in the European Union.
                </p>

                <p>
                  If Brewprint becomes legally
                  required to appoint an EU
                  representative under Article 27 of
                  the GDPR and no applicable exemption
                  is available, Brewprint will appoint
                  a representative and publish the
                  relevant details.
                </p>
              </LegalSection>

              <LegalSection
                number="27"
                title="United Kingdom"
              >
                <p>
                  Where UK GDPR applies, users may
                  have rights including access,
                  correction, erasure, restriction,
                  portability, objection, withdrawal
                  of consent and rights concerning
                  certain automated decisions.
                </p>

                <p>
                  Brewprint is not currently
                  established in the United Kingdom.
                </p>

                <p>
                  If Brewprint becomes legally
                  required to appoint a UK
                  representative and no applicable
                  exemption applies, Brewprint will
                  appoint one and publish its contact
                  details.
                </p>
              </LegalSection>

              <LegalSection
                number="28"
                title="United States"
              >
                <p>
                  Privacy laws in the United States
                  differ between states and may apply
                  based on factors such as revenue,
                  processing volume and the nature of
                  Brewprint's processing activities.
                </p>

                <p>
                  Where an applicable US state law
                  grants users privacy rights,
                  Brewprint will honour those rights
                  as required by that law.
                </p>

                <p>
                  These rights may include access,
                  correction, deletion, portability,
                  opt-outs relating to qualifying
                  sales or sharing, targeted
                  advertising, certain profiling and
                  appeals.
                </p>
              </LegalSection>

              <LegalSection
                number="29"
                title="California"
              >
                <p>
                  Where California privacy legislation
                  applies to Brewprint, California
                  residents may exercise the rights
                  provided by that legislation.
                </p>

                <p>
                  Brewprint currently does not sell
                  personal information for money or
                  share personal information for
                  third-party cross-context
                  behavioural advertising.
                </p>

                <p>
                  Brewprint will not unlawfully
                  discriminate against a person for
                  exercising an applicable California
                  privacy right.
                </p>
              </LegalSection>

              <LegalSection
                number="30"
                title="Age requirement"
              >
                <p>
                  Brewprint is intended for users aged
                  18 years or older.
                </p>

                <p>
                  Brewprint does not knowingly seek to
                  collect personal information from
                  children in circumstances where
                  that processing would be unlawful.
                </p>

                <p>
                  If we discover that personal
                  information relating to a child has
                  been collected unlawfully, we will
                  take reasonable steps to address or
                  delete that information.
                </p>
              </LegalSection>

              <LegalSection
                number="31"
                title="Direct marketing"
              >
                <p>
                  Brewprint may send necessary account
                  and service communications,
                  including verification, recovery,
                  security, subscription and legal
                  notices.
                </p>

                <p>
                  Optional marketing will only be sent
                  where permitted by applicable law.
                  Where consent is required, consent
                  will be obtained.
                </p>

                <p>
                  Users will be given an appropriate
                  way to stop optional marketing where
                  required.
                </p>
              </LegalSection>

              <LegalSection
                number="32"
                title="Analytics"
              >
                <p>
                  If optional analytics tools are
                  introduced, Brewprint will assess
                  the information collected, purpose,
                  lawful basis, retention,
                  international transfers, contractual
                  protections and whether consent is
                  required.
                </p>

                <p>
                  Where consent is legally required,
                  non-essential analytics will not be
                  activated until the required consent
                  has been obtained.
                </p>
              </LegalSection>

              <LegalSection
                number="33"
                title="Artificial intelligence"
              >
                <p>
                  Brewprint does not currently rely on
                  an external AI provider as a
                  necessary part of the core
                  processing described in this
                  Privacy Policy.
                </p>

                <p>
                  If Brewprint introduces an AI
                  feature that transfers user content
                  or personal information to an
                  external AI provider, this Privacy
                  Policy will be updated to disclose
                  the relevant provider, purpose,
                  information transferred, retention,
                  international transfer position and
                  user choices where required.
                </p>
              </LegalSection>

              <LegalSection
                number="34"
                title="Automated decisions"
              >
                <p>
                  Brewprint does not currently use
                  solely automated processing to make
                  decisions about users that produce
                  legal or similarly significant
                  effects.
                </p>

                <p>
                  Automated security systems may be
                  used for bot detection, account
                  security, fraud prevention and
                  abuse prevention.
                </p>
              </LegalSection>

              <LegalSection
                number="35"
                title="Legal disclosures"
              >
                <p>
                  Brewprint may disclose personal
                  information where reasonably
                  necessary to comply with applicable
                  law, a valid court order, a lawful
                  regulatory request, investigate
                  fraud or security incidents, protect
                  users or Brewprint, or establish,
                  exercise or defend legal claims.
                </p>
              </LegalSection>

              <LegalSection
                number="36"
                title="Business transfers"
              >
                <p>
                  If Brewprint is incorporated, sold,
                  transferred, merged, reorganised or
                  moved into another legal entity,
                  personal information may form part
                  of that business transfer subject
                  to applicable privacy law.
                </p>

                <p>
                  If the responsible party changes,
                  Brewprint will update this Privacy
                  Policy and provide any notice
                  required by law.
                </p>
              </LegalSection>

              <LegalSection
                number="37"
                title="Changes to this policy"
              >
                <p>
                  Brewprint may update this Privacy
                  Policy when the service, providers,
                  business structure, processing
                  activities or applicable law
                  changes.
                </p>

                <p>
                  Material changes may be communicated
                  through Brewprint, email, the
                  Brewprint website or another
                  appropriate method.
                </p>

                <p>
                  Where consent is legally required
                  for new processing, simply updating
                  this Privacy Policy will not replace
                  the requirement to obtain consent.
                </p>
              </LegalSection>

              <LegalSection
                number="38"
                title="Mandatory local law"
              >
                <p>
                  Brewprint is operated from South
                  Africa and South African privacy law
                  forms the primary basis of
                  Brewprint's privacy governance.
                </p>

                <p>
                  This does not exclude mandatory
                  privacy legislation that applies in
                  another jurisdiction.
                </p>

                <p>
                  Nothing in this Privacy Policy is
                  intended to waive a right or remove
                  an obligation that cannot legally
                  be waived or excluded.
                </p>
              </LegalSection>

              <LegalSection
                number="39"
                title="Contact Brewprint"
              >
                <p>
                  Privacy, data access, correction,
                  objection and deletion requests
                  should be directed to Brewprint.
                </p>

                <div className="mt-4 border border-[var(--bp-line)] bg-[var(--bp-paper-light)] p-4">
                  <p className="bp-code text-[var(--bp-blue)]">
                    Dorian Labuschagne
                  </p>

                  <p className="bp-code mt-1 text-[var(--bp-blue)]">
                    Trading as Brewprint
                  </p>

                  <p className="bp-code mt-1 text-[var(--bp-muted)]">
                    South Africa
                  </p>

                  <p className="bp-code mt-4 text-[var(--bp-muted)]">
                    Privacy email: TO BE ADDED
                  </p>

                  <p className="bp-code mt-1 text-[var(--bp-muted)]">
                    Support email: TO BE ADDED
                  </p>

                  <p className="bp-code mt-1 text-[var(--bp-muted)]">
                    Business/service address: TO BE ADDED
                  </p>
                </div>
              </LegalSection>

              <LegalSection
                number="40"
                title="Complaints"
              >
                <p>
                  If you believe Brewprint has handled
                  your personal information
                  incorrectly, you may contact
                  Brewprint so that the matter can be
                  investigated.
                </p>

                <p>
                  You retain any right to complain
                  directly to the South African
                  Information Regulator or another
                  competent privacy authority.
                </p>
              </LegalSection>

              <div className="border-t border-[var(--bp-line)] pt-6">
                <p className="bp-code text-[var(--bp-muted)]">
                  BREWPRINT / PRIVACY POLICY / VERSION 1.0
                </p>
              </div>
            </div>
          </main>

          <footer className="mt-6 flex flex-col gap-3 border-t border-[var(--bp-line)] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="bp-label min-h-11 text-left text-[var(--bp-blue)]"
            >
              ← Return to Brewprint
            </button>

            <p className="bp-code text-[var(--bp-muted)]">
              © 2026 BREWPRINT
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

interface LegalSectionProps {
  number: string;
  title: string;
  children: React.ReactNode;
}

const LegalSection: React.FC<
  LegalSectionProps
> = ({
  number,
  title,
  children,
}) => (
  <section>
    <div className="mb-4 border-b border-[var(--bp-line)] pb-3">
      <p className="bp-index">
        PRIV.{number}
      </p>

      <h2 className="bp-heading mt-1 text-xl text-[var(--bp-blue)]">
        {title}
      </h2>
    </div>

    <div className="space-y-4 text-sm leading-7 text-[var(--bp-muted)]">
      {children}
    </div>
  </section>
);

interface LegalListProps {
  items: string[];
}

const LegalList: React.FC<
  LegalListProps
> = ({ items }) => (
  <ul className="space-y-2 pl-5">
    {items.map(item => (
      <li
        key={item}
        className="list-disc pl-1"
      >
        {item}
      </li>
    ))}
  </ul>
);

export default PrivacyPolicyPage;