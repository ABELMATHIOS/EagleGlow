import LegalPageLayout from '@/src/components/legal/LegalPageLayout';

export const metadata = {
  title: 'Terms & Conditions | EagleGlow Wushu & Fitness Center',
};

export default function TermsPage() {
  return (
    <LegalPageLayout
      title="TERMS & CONDITIONS"
      lastUpdated="August 20, 2026"
      intro={`These Terms & Conditions ("Terms") govern your registration for and use of membership services at EagleGlow Wushu & Fitness Center ("EagleGlow," "we," "us," or "our"), including the website and any related registration system. By creating an account or registering as a member, you agree to these Terms.`}
      sections={[
        {
          heading: '1. Eligibility & Registration',
          bullets: [
            'You must provide accurate, current, and complete information during registration, including your full name, contact details, date of birth, sex, height, weight, and emergency contact information.',
            'Members under 18 years of age must have registration completed or co-signed by a parent or legal guardian.',
            'All new registrations are subject to review and approval by EagleGlow instructors/administrators (e.g., Master Endale or designated staff) before account access is granted.',
          ],
        },
        {
          heading: '2. Assumption of Risk & Physical Activity',
          bullets: [
            'Wushu, martial arts training, and fitness activities carry inherent physical risk, including but not limited to sprains, strains, fractures, and other injuries.',
            'By registering, you acknowledge that you are voluntarily participating in physical training and assume all risks associated with such participation.',
            'You are responsible for disclosing relevant health conditions, injuries, or physical limitations via the registration form so instructors can take reasonable precautions; failure to disclose relevant health information is at your own risk.',
            'Instructors will use reasonable care in supervising training but are not liable for injuries arising from normal participation in martial arts and fitness activities, except where caused by gross negligence or willful misconduct on the part of EagleGlow staff.',
          ],
        },
        {
          heading: '3. Liability Waiver',
          bullets: [
            'To the fullest extent permitted by applicable law, you release EagleGlow, its instructors, staff, and affiliates from liability for injury, loss, or damage arising from your participation in classes and use of facilities, except where such injury, loss, or damage results from gross negligence or intentional misconduct.',
          ],
        },
        {
          heading: '4. Membership, Fees & Belt Progression',
          bullets: [
            'Membership fees, class schedules, and belt/rank requirements are set by EagleGlow and may be updated from time to time; members will be notified of material changes.',
            'Belt rank and prior training history submitted during registration (for "Currently Training" or "Returning" members) may be verified by instructors before being reflected in your account.',
          ],
        },
        {
          heading: '5. Code of Conduct',
          bullets: [
            'Members agree to treat instructors, staff, and fellow members with respect, follow facility rules, and comply with reasonable instructions given during training.',
            'EagleGlow reserves the right to suspend or terminate membership for conduct that endangers others, violates facility rules, or is otherwise disruptive.',
          ],
        },
        {
          heading: '6. Account Security',
          bullets: [
            'You are responsible for maintaining the confidentiality of your account password and for all activity under your account.',
            'Notify EagleGlow promptly at info.eagleglow@gmail.com if you suspect unauthorized use of your account.',
          ],
        },
        {
          heading: '7. Changes to These Terms',
          paragraphs: [
            'EagleGlow may update these Terms from time to time. Continued use of your membership after changes take effect constitutes acceptance of the revised Terms.',
          ],
        },
        {
          heading: '8. Governing Law',
          paragraphs: [
            'These Terms are governed by the laws of Ethiopia.',
          ],
        },
        {
          heading: '9. Contact',
          bullets: [
            'Email: info.eagleglow@gmail.com',
            'Phone: +251-912-052-349',
          ],
        },
      ]}
      
    />
  );
}