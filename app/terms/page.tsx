import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { CONTACT_EMAIL, LEGAL_UPDATED } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of Service — LimbList",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated={LEGAL_UPDATED}>
      <p>
        These terms govern your use of LimbList. By using the service, you agree
        to them. If you don&apos;t agree, please don&apos;t use LimbList.
      </p>

      <h2>What LimbList does</h2>
      <p>
        LimbList is a tool that lets tree service companies collect job requests,
        photos, and details from their customers. We provide the software; we are
        not a party to any agreement, quote, or work between a homeowner and a
        tree company, and we don&apos;t perform tree work ourselves.
      </p>

      <h2>Accounts (tree companies)</h2>
      <ul>
        <li>You&apos;re responsible for the activity under your account.</li>
        <li>
          Keep your password secure and provide accurate company information.
        </li>
        <li>
          You&apos;re responsible for how you handle the customer information you
          collect, including following applicable laws.
        </li>
      </ul>

      <h2>Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Submit unlawful, abusive, or fraudulent content</li>
        <li>Upload content you don&apos;t have the right to share</li>
        <li>
          Attempt to disrupt, overload, or gain unauthorized access to the
          service
        </li>
        <li>Use the service to send spam or harass others</li>
      </ul>
      <p>
        We may suspend or remove access and content that violates these terms.
      </p>

      <h2>Your content</h2>
      <p>
        You keep ownership of the content you submit. You grant us a limited
        license to store and process it solely to operate the service and deliver
        requests to the relevant tree company.
      </p>

      <h2>Service availability</h2>
      <p>
        We work to keep LimbList running but provide it &quot;as is&quot; without
        warranties of any kind. We don&apos;t guarantee it will be uninterrupted
        or error-free.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, LimbList is not liable for
        indirect, incidental, or consequential damages, or for any disputes,
        quotes, or work arranged between homeowners and tree companies.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms. Continued use after a change means you accept
        the updated terms. We&apos;ll update the date above when we make changes.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms? Email{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </LegalPage>
  );
}
