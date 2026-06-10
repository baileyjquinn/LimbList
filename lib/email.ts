import { Resend } from "resend";
import { APP_URL, emailConfigured } from "@/lib/env";
import type { IntakePayload } from "@/lib/types";

const FLAG = "Yes";

type SendArgs = {
  to: string;
  companyName: string;
  submissionId: string;
  payload: IntakePayload;
};

function row(label: string, value: string | null | undefined): string {
  if (!value) return "";
  return `
    <tr>
      <td style="padding:6px 16px 6px 0;color:#6b6256;font-size:14px;vertical-align:top;white-space:nowrap;">${label}</td>
      <td style="padding:6px 0;color:#2a2620;font-size:15px;font-weight:600;">${escapeHtml(
        value,
      )}</td>
    </tr>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHtml({ companyName, submissionId, payload }: SendArgs): string {
  const flags: string[] = [];
  if (payload.near_power_lines === FLAG) flags.push("⚡ Near a power line");
  if (payload.near_structures === FLAG) flags.push("🏠 Near a house / building");

  const photoCount = payload.media.filter((m) => m.kind === "photo").length;
  const videoCount = payload.media.filter((m) => m.kind === "video").length;
  const mediaBits = [
    photoCount ? `${photoCount} photo${photoCount === 1 ? "" : "s"}` : "",
    videoCount ? `${videoCount} video${videoCount === 1 ? "" : "s"}` : "",
  ]
    .filter(Boolean)
    .join(" + ");

  const detailUrl = `${APP_URL}/dashboard/${submissionId}`;

  const flagBlock = flags.length
    ? `<div style="margin:0 0 20px;padding:14px 18px;background:#fbf0dd;border:1px solid #e7c98c;border-radius:12px;">
         <div style="font-size:13px;text-transform:uppercase;letter-spacing:.04em;color:#a9762a;font-weight:700;margin-bottom:6px;">Heads up</div>
         <div style="font-size:16px;color:#5c4a23;font-weight:600;">${flags.join(
           " &nbsp;·&nbsp; ",
         )}</div>
       </div>`
    : "";

  return `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#f6f3ea;padding:28px 16px;">
    <div style="max-width:560px;margin:0 auto;background:#fffdf8;border:1px solid #e7e2d4;border-radius:18px;overflow:hidden;">
      <div style="padding:22px 28px;background:#1f3d2f;color:#f6f3ea;">
        <div style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;opacity:.75;">LimbList · New job request</div>
        <div style="font-size:22px;font-weight:700;margin-top:4px;">${escapeHtml(
          payload.customer_name,
        )}</div>
        <div style="font-size:15px;opacity:.85;margin-top:2px;">${escapeHtml(
          payload.job_type || "Job type not specified",
        )}</div>
      </div>
      <div style="padding:24px 28px;">
        ${flagBlock}
        <table style="border-collapse:collapse;width:100%;">
          ${row("Phone", payload.customer_phone)}
          ${row("Email", payload.customer_email)}
          ${row("Address", payload.address)}
          ${row("Trees", payload.tree_count)}
          ${row("Condition", payload.tree_condition)}
          ${row("Height", payload.height_estimate)}
          ${row("Power line", payload.near_power_lines)}
          ${row("Near building", payload.near_structures)}
          ${row("Truck access", payload.truck_access)}
          ${row("Media", mediaBits || "None")}
          ${row("Notes", payload.notes)}
        </table>
        <a href="${detailUrl}" style="display:inline-block;margin-top:24px;background:#1f3d2f;color:#fffdf8;text-decoration:none;font-weight:600;font-size:16px;padding:13px 22px;border-radius:12px;">
          View photos &amp; full details →
        </a>
        <div style="margin-top:18px;font-size:13px;color:#8a8170;">
          Sent by LimbList for ${escapeHtml(companyName)}.
        </div>
      </div>
    </div>
  </div>`;
}

/**
 * Sends the submission summary to the tree company. No-ops in demo mode
 * (RESEND_API_KEY unset) so the flow still completes without email configured.
 */
export async function sendSubmissionEmail(args: SendArgs): Promise<void> {
  if (!emailConfigured) return;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.RESEND_FROM ?? "LimbList <onboarding@resend.dev>";

  const subject = `New tree job: ${args.payload.customer_name}${
    args.payload.job_type ? ` — ${args.payload.job_type}` : ""
  }`;

  const { data, error } = await resend.emails.send({
    from,
    to: args.to,
    subject,
    html: buildHtml(args),
    replyTo: args.payload.customer_email || undefined,
  });

  if (error) {
    // Resend returns errors in the response rather than throwing.
    throw new Error(
      `Resend send failed: ${error.message ?? JSON.stringify(error)}`,
    );
  }

  console.log(`[email] notification sent (id: ${data?.id ?? "?"})`);
}

type CustomerArgs = {
  to: string;
  companyName: string;
  customerName: string;
};

function buildCustomerHtml({ companyName, customerName }: CustomerArgs): string {
  const firstName = customerName.split(" ")[0] || "there";
  return `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#f6f3ea;padding:28px 16px;">
    <div style="max-width:520px;margin:0 auto;background:#fffdf8;border:1px solid #e7e2d4;border-radius:18px;overflow:hidden;">
      <div style="padding:22px 28px;background:#1f3d2f;color:#f6f3ea;">
        <div style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;opacity:.75;">LimbList</div>
        <div style="font-size:21px;font-weight:700;margin-top:4px;">Request received ✓</div>
      </div>
      <div style="padding:24px 28px;color:#2a2620;font-size:16px;line-height:1.55;">
        <p style="margin:0 0 14px;">Hi ${escapeHtml(firstName)},</p>
        <p style="margin:0 0 14px;">
          Thanks — your photos and details were sent to
          <strong>${escapeHtml(companyName)}</strong>. They have everything they
          need to look at your tree job.
        </p>
        <p style="margin:0 0 14px;">
          They'll reach out with next steps, usually a quote or a quick call.
          No need to do anything else.
        </p>
        <p style="margin:18px 0 0;color:#8a8170;font-size:13px;">
          Sent on behalf of ${escapeHtml(companyName)} via LimbList.
        </p>
      </div>
    </div>
  </div>`;
}

/**
 * Confirmation email to the homeowner. Best-effort and silent on failure.
 * NOTE: until a custom domain is verified in Resend, the default sender can
 * only deliver to the Resend account owner, so this won't reach real
 * customers yet — it's wired and ready for when the domain is verified.
 */
export async function sendCustomerConfirmationEmail(
  args: CustomerArgs,
): Promise<void> {
  if (!emailConfigured || !args.to) return;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.RESEND_FROM ?? "LimbList <onboarding@resend.dev>";

  const { error } = await resend.emails.send({
    from,
    to: args.to,
    subject: `We got your request — ${args.companyName}`,
    html: buildCustomerHtml(args),
  });

  if (error) {
    throw new Error(
      `Resend customer send failed: ${error.message ?? JSON.stringify(error)}`,
    );
  }
}

type WelcomeArgs = {
  to: string;
  companyName: string;
  intakeUrl: string;
};

function buildWelcomeHtml({ companyName, intakeUrl }: WelcomeArgs): string {
  return `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#f6f3ea;padding:28px 16px;">
    <div style="max-width:540px;margin:0 auto;background:#fffdf8;border:1px solid #e7e2d4;border-radius:18px;overflow:hidden;">
      <div style="padding:22px 28px;background:#1f3d2f;color:#f6f3ea;">
        <div style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;opacity:.75;">LimbList</div>
        <div style="font-size:22px;font-weight:700;margin-top:4px;">You're all set, ${escapeHtml(
          companyName,
        )} 🌲</div>
      </div>
      <div style="padding:24px 28px;color:#2a2620;font-size:16px;line-height:1.55;">
        <p style="margin:0 0 14px;">Here's the one thing that matters — your personal intake link:</p>
        <p style="margin:0 0 18px;">
          <a href="${intakeUrl}" style="color:#1f3d2f;font-weight:700;font-size:17px;">${escapeHtml(
            intakeUrl,
          )}</a>
        </p>
        <p style="margin:0 0 14px;">
          Text or email it to your next customer who wants a quote. They send
          photos, a short video, and the details that matter — power lines,
          access, condition — and it lands in your inbox and dashboard.
        </p>
        <p style="margin:0 0 6px;font-weight:600;">Two minutes to first value:</p>
        <ol style="margin:0 0 18px;padding-left:20px;color:#4a4438;">
          <li style="margin-bottom:4px;">Copy your link above.</li>
          <li style="margin-bottom:4px;">Send it to one customer (or test it on yourself).</li>
          <li>Watch the photos roll into your dashboard.</li>
        </ol>
        <a href="${intakeUrl}" style="display:inline-block;background:#1f3d2f;color:#fffdf8;text-decoration:none;font-weight:600;font-size:16px;padding:13px 22px;border-radius:12px;">
          Open my intake form →
        </a>
        <p style="margin:20px 0 0;color:#8a8170;font-size:13px;">
          You're on a free trial — no card needed. Reply to this email if you
          get stuck; a real person reads it.
        </p>
      </div>
    </div>
  </div>`;
}

/**
 * Welcome email sent right after signup. Best-effort: never blocks or fails
 * the signup flow if email is unconfigured or Resend errors.
 */
export async function sendWelcomeEmail(args: WelcomeArgs): Promise<void> {
  if (!emailConfigured || !args.to) return;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.RESEND_FROM ?? "LimbList <onboarding@resend.dev>";

  const { error } = await resend.emails.send({
    from,
    to: args.to,
    subject: "Welcome to LimbList — here's your intake link",
    html: buildWelcomeHtml(args),
  });

  if (error) {
    throw new Error(
      `Resend welcome send failed: ${error.message ?? JSON.stringify(error)}`,
    );
  }
}
