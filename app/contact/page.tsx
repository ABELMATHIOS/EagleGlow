import type { Metadata } from 'next';
import ContactHero from '@/src/components/contact/ContactHero';
import ContactMain from '@/src/components/contact/ContactMain';
import ContactSocials from '@/src/components/contact/ContactSocials';

export const metadata: Metadata = {
  title: 'Contact Us | EagleGlow',
  description: 'Get in touch with EagleGlow — visit our Bole or Yerer branches, call, or email us. Find our address, phone, and opening hours.',
  openGraph: {
    title: 'Contact Us | EagleGlow',
    description: 'Visit our Bole or Yerer branches, call, or email us.',
  },
};

export default function ContactPage() {
  return (
    <>
      <ContactHero />
      <ContactMain />
      <ContactSocials />
    </>
  );
}