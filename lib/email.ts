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

  await resend.emails.send({
    from,
    to: args.to,
    subject,
    html: buildHtml(args),
    replyTo: args.payload.customer_email || undefined,
  });
}
