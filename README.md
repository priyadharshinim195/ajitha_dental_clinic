# Ajitha Dental Clinic — Website

Open `index.html` in a browser, or upload the whole folder to any web host.

## Files
- `index.html` — all sections
- `styles.css` — brown and gold theme, layout, responsive rules, hover effects
- `script.js` — hero frame animation, navigation, case-study dialog, testimonials, contact links
- `testimonials.js` — testimonial data; replace marked placeholders only with patient-approved details
- `config.js` — **the only file you need to edit** for contact details
- `frames/` — 300 hero JPG frames, frame_001.jpg to frame_300.jpg, 1280×720 (hero section only). Frames fill the hero viewport with proportional center cropping when its aspect ratio differs from 16:9.
- `images/` — service, case study, gallery and appointment photos

## Sections (in order)
Hero → About → Services (8 cards) → Case Studies → Why Choose Us → Connect (WhatsApp and Call Now) → Testimonials → Gallery → Contact → Footer

## Contact setup (config.js)
Fill in these values. Leave a value empty until the real information is available. Empty values keep the links disabled, so no fake number is ever shown.
- `whatsappNumber`: digits only with country code, e.g. `919876543210`. Powers every WhatsApp button (hero, navbar icon, Connect section). Opens a chat in a new tab with a friendly message.
- `phone`: e.g. `+91 98765 43210`. Powers every Call Now button and the phone number in the contact section. Opens the phone dialer on mobile.
- `address`: full address. Shows the map in the Contact section and builds the Get Directions link.
- `mapsUrl`: optional Google Maps link for Get Directions. Used instead of the address link when filled in.

The appointment booking form has been removed. Patients contact the clinic through WhatsApp or by calling.

## Replacing placeholders
- Photos: put files in `images/` with the names listed below. Replacing a file with the same name changes the photo.
- Case studies: the three cards and their dialogs are illustrative scenarios, not verified patient cases. Replace their content only with clinic-verified information; do not make unsupported outcome claims.
- Testimonials: edit `testimonials.js`. Sample feedback is visibly marked and is not presented as authentic patient feedback. Replace it only with approved names and exact quotes; add ratings only when supported by an authentic review.
- Social links: add them to the footer when the clinic provides them.

## Image names
- service-general-dentistry.jpg, service-teeth-cleaning.jpg, service-cosmetic-dentistry.jpg, service-teeth-whitening.jpg, service-root-canal.jpg, service-dental-implants.jpg, service-orthodontic-treatment.jpg, service-preventive-care.jpg (800 px wide, 4:3)
- case-01.jpg, case-02.jpg, case-03.jpg (photo area only)
- gallery-01.jpg to gallery-06.jpg
- book-clinic-01.jpg (Connect section photo)
- `gallery-01.jpg` is also used for the About section photo

## Colour theme (chocolate and gold)
All colours are defined once in the `:root` block at the top of `styles.css`:
- `--black` #24150F primary background · `--charcoal` #3A2418 secondary brown · `--card` #2B190F card background
- `--gold` #D9A441 main gold · `--gold-soft` #FFD77A bright gold glow · `--champagne` #F5DDA0 headings on dark
- `--ivory` #FFE8AE text on dark · `--cream` #F8EBDD light sections · `--text` #3A2114 text on light
Sections use a premium brown-and-gold rhythm, with dark About, Services and Testimonials treatments balanced by light content sections.

## Service-card layout and animations
- The eight service cards use a responsive grid: four columns on desktop and two on tablets and phones.
- Reveal on scroll: cards and About feature cards fade up with staggered timing (script.js, section 8).
- Shimmer: a soft gold light travels around each card border (CSS).
- Hover (mouse only): cards lift, the border brightens and the glow strengthens; images zoom and "Learn More" arrows move right.
- Reduced motion: reveal, shimmer and sweep animations are switched off.


## Hero and gallery layout (reference design)
- The uploaded 16:9 hero frames cover the full viewport; wider or taller screens crop proportionally from the centered frame without stretching.
- Hero title and content start centered over the frames and fade away after 4.5 seconds; the transparent navigation and its contact actions remain available.
- Case-study cards open their matching accessible detail dialog, with Escape and Back controls.
- Testimonials use a touch-friendly, manually scrollable row of sample cards. The cards are not duplicated or automatically looped, and no placeholder rating is displayed.
- Gallery: editorial layout on desktop (one large feature image with mixed-size supporting images); a clean two-column grid on phones. Hover shows a subtle dark overlay and a gold arrow badge.
- The contact map card is hidden until the clinic address is set in config.js. Get Directions stays available.
