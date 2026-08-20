import LegalPageLayout from '@/src/components/legal/LegalPageLayout';

export const metadata = {
  title: 'Privacy Policy | EagleGlow Wushu & Fitness Center',
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      title="PRIVACY POLICY"
      lastUpdated="August 20, 2026"
      intro={`This Privacy Policy explains how EagleGlow Wushu & Fitness Center ("EagleGlow," "we," "us," or "our") collects, uses, stores, and protects information you provide when you register for or use our membership system.`}
      sections={[
        {
          heading: '1. Information We Collect',
          bullets: [
            'Identity & contact information: full name, email address, phone number, date of birth, sex.',
            'Physical information: height and weight (used for training/class placement purposes).',
            'Emergency contact information: name and phone number of your emergency contact.',
            'Health/medical notes (optional): any conditions, injuries, or health information you choose to share so instructors can train you safely.',
            'Membership history: registration type (new / currently training / returning), previous belt rank, year joined, and reason for any training gap, where applicable.',
            'Account credentials: your password, stored in encrypted/hashed form via our authentication provider (Supabase Auth) — EagleGlow staff never see your plaintext password.',
          ],
        },
        {
          heading: '2. How We Use Your Information',
          bullets: [
            'Create and manage your membership account.',
            'Verify and approve new registrations.',
            'Allow instructors to place you appropriately and train you safely, including accounting for any disclosed health notes.',
            'Contact you or your emergency contact in the event of an injury or emergency during training.',
            'Track belt progression and training history within EagleGlow.',
            'Communicate with you about your membership, classes, or account status.',
          ],
        },
        {
          heading: '3. Who Can See Your Information',
          bullets: [
            'Health/Medical Notes: shared only with instructors and admin staff who need it to keep training safe — never included in general member lists or shared with other members.',
            'General profile information (name, belt rank) may be visible to instructors and, in limited contexts (e.g., class rosters), to other members or staff for operational purposes.',
            'Emergency contact details are accessible only to instructors/admin staff, and only used to reach someone on your behalf in an emergency.',
            'We do not sell, rent, or trade your personal information to third parties.',
          ],
        },
        {
          heading: '4. How We Store & Protect Your Information',
          bullets: [
            'Data is stored in a Supabase (PostgreSQL) database with Row-Level Security (RLS) policies restricting access: members can access their own data, and administrative/instructor routes are required to view sensitive fields such as health notes.',
            'Passwords are never stored in plain text; authentication is handled by Supabase Auth.',
            'We take reasonable technical and organizational measures to protect your data, but no system can be guaranteed 100% secure.',
          ],
        },
        {
          heading: '5. Data Retention',
          paragraphs: [
            'We retain your membership information for as long as your account is active, and for a reasonable period afterward for record-keeping purposes.',
          ],
        },
        {
          heading: '6. Your Rights',
          bullets: [
            'Request a copy of the personal information we hold about you.',
            'Request correction of inaccurate information (e.g., via the name-correction request flow in your account).',
            'Request deletion of your account and associated data, subject to any legal or record-keeping requirements.',
          ],
        },
        {
          heading: '7. Changes to This Policy',
          paragraphs: [
            'We may update this Privacy Policy from time to time. Material changes will be communicated to members, and continued use of your account after changes take effect constitutes acceptance of the updated policy.',
          ],
        },
        {
          heading: '8. Contact Us',
          bullets: [
            'Email: info.eagleglow@gmail.com',
            'Phone: +251-912-052-349',
          ],
        },
      ]}
      
    />
  );
}