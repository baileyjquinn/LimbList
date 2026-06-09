import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { CONTACT_EMAIL, LEGAL_UPDATED } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy — LimbList",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated={LEGAL_UPDATED}>
      <p>
        LimbList (&quot;we&quot;, &quot;us&quot;) provides a tool that lets tree
        service companies collect job details and photos from their customers.
        This policy explains what we collect and how we use it. We&apos;ve kept
        it plain.
      </p>

      <h2>What we collect</h2>
      <p>When a homeowner submits a tree job request, we collect:</p>
      <ul>
        <li>Contact details you enter — name, phone number, and email</li>
        <li>The property address for the job</li>
        <li>
          Job details — tree type, condition, height estimate, proximity to
          power lines and buildings, access notes, and anything you add
        </li>
        <li>Photos and videos you choose to upload</li>
        <li>
          Basic technical data needed to run the service and prevent abuse (for
          example, a one-way hashed form of your IP address — we do not store
          your raw IP)
        </li>
      </ul>
      <p>
        For tree companies with an account, we also store your name, email, and
        company details.
      </p>

      <h2>How we use it</h2>
      <ul>
        <li>
          To deliver your request to the specific tree company whose intake link
          you used
        </li>
        <li>To let that company review your request and contact you</li>
        <li>To send you a confirmation that your request was received</li>
        <li>To operate, secure, and improve the service</li>
      </ul>

      <h2>Who we share it with</h2>
      <p>
        Your request is shared <strong>only</strong> with the tree company whose
        link you used. We do not sell your information or share it with
        advertisers. We use a small number of trusted service providers to run
        LimbList:
      </p>
      <ul>
        <li>
          <strong>Supabase</strong> — database, file storage, and authentication
        </li>
        <li>
          <strong>Resend</strong> — sending notification and confirmation emails
        </li>
        <li>
          <strong>Vercel</strong> — hosting the application
        </li>
      </ul>
      <p>
        These providers process data on our behalf and are not permitted to use
        it for their own purposes.
      </p>

      <h2>How long we keep it</h2>
      <p>
        We keep submissions for as long as the tree company needs them to handle
        the job, or until they delete the request. Tree companies can delete a
        request and its photos at any time from their dashboard.
      </p>

      <h2>Your choices</h2>
      <p>
        You can ask us to access or delete your information by emailing{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. You can also ask
        the tree company you submitted to, since they control your request.
      </p>

      <h2>Children</h2>
      <p>
        LimbList is intended for adults arranging tree work and is not directed
        to children under 13.
      </p>

      <h2>Changes</h2>
      <p>
        We may update this policy from time to time. We&apos;ll change the
        &quot;last updated&quot; date above when we do.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about privacy? Email{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </LegalPage>
  );
}
