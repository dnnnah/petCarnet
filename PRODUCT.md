# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary user is a concerned pet owner with one or more pets. They return daily or weekly to
consult a pet's vaccine schedule, medical record, identity card, and the contact details they would
need to recover the animal. The session is short, often one-handed, and frequently motivated by
worry rather than routine administration.

Other audiences present in the product, not independently interviewed: shelters publishing adoptable
animals, and the adopters who browse them.

## Product Purpose

PetCarnet is the durable identity and care record for a pet. It holds the vaccine and medical
history, the physical and digital carnet, official documents, and the contact details that make the
animal recoverable. It also covers the two moments the paper record cannot: finding a lost animal,
and rehoming one.

Success means a worried owner can answer "who do I call" and "is the vaccine current" in seconds,
can put a complete, legible record in a stranger's hands, and can move a pet from lost to adopted
without rebuilding anything.

## Positioning

A neighboring pet app would have to give up one of these to copy the product honestly:

- **A printable official record.** The expediente and the carnet are designed to be printed and
  physically handed to a stranger, not only read on a screen. Print fidelity is a product feature,
  not a fallback.
- **A public loss alert.** Losing a pet produces a shareable public page with photo and contact
  details, generated from the pet's existing record rather than composed from scratch under stress.
- **A covered cycle, not one task.** Loss, recovery, and adoption are the same record moving through
  different states, so nothing is re-entered between them.
- **Private by default.** Nothing is published without explicit consent. A generic pet profile
  account broadcasts identity details by default; PetCarnet publishes per-item and on request.

## Operating Context

The product is used in the field as often as at a desk: a phone held one-handed, sometimes on a poor
connection, often while anxious. The printing path is used at a clinic, a shelter, or a police
station, sometimes on whatever printer is available. Vaccination records are read by third parties,
so legibility and completeness matter more than on-screen polish.

The application is a PWA-capable web app; it is installed to a home screen and launched like a native
one, but it is not a native codebase.

## Capabilities and Constraints

Confirmed capabilities: pet profiles with medical and vaccine history; a printable digital carnet
with a scannable code; an official expediente; stored documents with categorization; a public
health status; a loss alert with an image and contact block; recovery discovery; and a shelter
adoption catalog.

Durable constraints, all confirmed:

- **Print and PDF export are hard requirements.** Print layouts are part of the product. Visual
  ambition yields to them wherever they conflict.
- **Mobile-first on slow data.** The experience must hold up on a poor connection, so payload weight
  and first-load cost are product concerns, not only engineering ones.
- **Spanish only, Mexican Spanish.** No English copy, no dialect drift.

Status semantics, terminology, routes, and the identity/QR resolution model are established in the
codebase and must be preserved by any future work.

Undecided: whether adoption submissions are ever sent to a server. Today the adoption request is
stored only in the visitor's browser, and the adoption and shelter content is prototype data.

## Brand Commitments

The name is PetCarnet. All product copy is Spanish (es-MX) and the tone is plain, warm, and calm —
this copy addresses an anxious owner and must never read as alarmist or as a growth funnel.

## Evidence on Hand

Eleven real pet profiles are validated by `npm run validate:data`; adoption and shelter content is
prototype data. The adoption view discloses this to visitors in-product, and that disclosure is a
confirmed fact rather than a placeholder. Placeholder contact data is shared across eight profiles
and is flagged by the validator as needing verification before production.

There are no customer testimonials, usage metrics, press, pricing, or licensing commitments in the
repository. Future work must not invent them.

## Product Principles

1. **Print is the product.** If a change looks better on screen but prints worse, it is wrong.
2. **Anxiety is the baseline state.** Optimize for the worried owner; never manufacture urgency to
   increase engagement.
3. **Nothing is public without consent.** Publishing is a per-item, explicit act.
4. **Reuse the record.** Every flow reads from the pet's existing data, so an owner never re-enters
   what the product already knows.
5. **Design for a bad connection and one hand.** Mobile on slow data is the design target, not a
   responsive afterthought.

## Accessibility & Inclusion

The product is used in stressful, outdoor, and one-handed situations, often by someone distressed,
so legible type, generous touch targets, and full keyboard support are functional requirements
rather than polish. Print output must remain legible in black and white and for readers with low
vision. Focus order and landmarks must be usable without a pointer.
