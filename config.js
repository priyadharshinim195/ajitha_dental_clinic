/*
  EDIT THIS FILE to connect the clinic's real details.
  Leave a value empty ("") until you have the real information.
  Nothing here is shown as real until you fill it in.
*/
window.CLINIC_CONFIG = {
  // One place for all contact details. These values feed:
  //   - WhatsApp buttons (hero, navbar, contact)  -> whatsappNumber
  //   - Call Now buttons (hero, navbar, contact)  -> phone
  //   - contact section, footer and map           -> address
  //   - Get Directions                            -> mapsUrl (or built from address)
  // Leave any value empty until the real information is available.
  // Contact details (shown in the Contact section and footer when filled in)
  address: "",          // e.g. "12 Example Road, Area, City, PIN"
  phone: "",            // e.g. "+91 00000 00000"
  email: "",            // e.g. "hello@example.com"
  hours: "",            // e.g. "Mon–Sat, 9:00 AM – 7:00 PM"

  // Google Maps link for "Get Directions" (e.g. https://maps.google.com/?q=...)
  mapsUrl: "https://maps.app.goo.gl/9bKrS4fEmxhuFK5H9?g_st=aw",

  // WhatsApp number with country code, digits only, e.g. "919876543210".
  // Powers the WhatsApp buttons (navbar, hero, contact section).
  whatsappNumber: ""
};
