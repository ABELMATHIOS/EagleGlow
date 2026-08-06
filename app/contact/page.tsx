'use client';

import ContactHero from '@/src/components/contact/ContactHero';
import ContactMain from '@/src/components/contact/ContactMain';
import ContactSocials from '@/src/components/contact/ContactSocials';

export default function ContactPage() {
  return (
    <>
      <ContactHero />
      <ContactMain />
      <ContactSocials />
    </>
  );
}