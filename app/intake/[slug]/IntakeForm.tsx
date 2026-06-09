"use client";

import { useRef, useState, useTransition, type ComponentType } from "react";
import { createClient } from "@/lib/supabase/client";
import { Field } from "@/components/ui/Field";
import { ChoiceGroup } from "@/components/ui/ChoiceGroup";
import {
  BoltIcon,
  CameraIcon,
  CheckIcon,
  LeafIcon,
  LockIcon,
  UserIcon,
  XIcon,
} from "@/components/icons";
import {
  HEIGHT_ESTIMATES,
  JOB_TYPES,
  STORAGE_BUCKET,
  TREE_CONDITIONS,
  TREE_COUNTS,
  TRUCK_ACCESS,
  YES_NO_UNSURE,
} from "@/lib/constants";
import { formatPhone } from "@/lib/phone";
import type { MediaKind, UploadedMedia } from "@/lib/types";
import { submitIntake } from "./actions";

type IntakeFormProps = {
  slug: string;
  companyId: string;
  companyName: string;
  canUpload: boolean;
};

type PickedFile = {
  file: File;
  url: string;
  kind: MediaKind;
};

const initialFields = {
  customer_name: "",
  customer_phone: "",
  customer_email: "",
  address: "",
  tree_count: "",
  tree_condition: "",
  height_estimate: "",
  near_power_lines: "",
  near_structures: "",
  truck_access: "",
  notes: "",
};

const inputClass =
  "w-full min-h-12 rounded-[--radius-card] border border-line bg-paper px-4 py-3 text-base text-ink placeholder:text-ink-soft/60 transition-colors focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/30";

const MAX_FILES = 15;
const MAX_FILE_MB = 50;

function kindOf(file: File): MediaKind {
  return file.type.startsWith("video") ? "video" : "photo";
}

export function IntakeForm({
  slug,
  companyId,
  companyName,
  canUpload,
}: IntakeFormProps) {
  const [fields, setFields] = useState(initialFields);
  const [jobTypes, setJobTypes] = useState<string[]>([]);
  const [files, setFiles] = useState<PickedFile[]>([]);
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading">("idle");
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  // When the form first rendered — used server-side to tell bots from humans.
  const loadedAtRef = useRef<number>(Date.now());

  const set = (key: keyof typeof fields) => (value: string) =>
    setFields((prev) => ({ ...prev, [key]: value }));

  // Progress: how many of the four sections have at least one answer.
  const sectionsDone =
    Number(
      Boolean(
        fields.customer_name && fields.customer_phone && fields.address,
      ),
    ) +
    Number(
      Boolean(
        jobTypes.length > 0 ||
          fields.tree_count ||
          fields.tree_condition ||
          fields.height_estimate,
      ),
    ) +
    Number(
      Boolean(
        fields.near_power_lines ||
          fields.near_structures ||
          fields.truck_access,
      ),
    ) +
    Number(files.length > 0);
  const progress = Math.round((sectionsDone / 4) * 100);

  function handleFiles(list: FileList | null) {
    if (!list) return;
    const incoming = Array.from(list);
    const tooBig = incoming.filter((f) => f.size > MAX_FILE_MB * 1024 * 1024);
    const ok = incoming.filter((f) => f.size <= MAX_FILE_MB * 1024 * 1024);

    if (tooBig.length > 0) {
      setError(
        `Some files are over ${MAX_FILE_MB}MB and were skipped. Try a shorter video.`,
      );
    }

    const picked: PickedFile[] = ok.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      kind: kindOf(file),
    }));
    setFiles((prev) => [...prev, ...picked].slice(0, MAX_FILES));
  }

  function removeFile(index: number) {
    setFiles((prev) => {
      const next = [...prev];
      const [removed] = next.splice(index, 1);
      if (removed) URL.revokeObjectURL(removed.url);
      return next;
    });
  }

  async function uploadFiles(): Promise<UploadedMedia[]> {
    if (!canUpload || files.length === 0) return [];
    const supabase = createClient();
    const uploaded: UploadedMedia[] = [];

    for (const picked of files) {
      const ext = picked.file.name.split(".").pop() ?? "bin";
      const safeExt = ext.toLowerCase().replace(/[^a-z0-9]/g, "");
      const path = `${companyId}/${crypto.randomUUID()}.${safeExt}`;
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, picked.file, {
          contentType: picked.file.type || undefined,
          upsert: false,
        });
      if (uploadError) {
        throw new Error(`Could not upload ${picked.file.name}`);
      }
      uploaded.push({ path, kind: picked.kind });
    }
    return uploaded;
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!fields.customer_name.trim()) return setError("Please enter your name.");
    if (!fields.customer_phone.trim())
      return setError("Please enter a phone number so they can reach you.");
    if (!fields.address.trim())
      return setError("Please enter the property address.");

    startTransition(async () => {
      try {
        setStatus("uploading");
        const media = await uploadFiles();
        const result = await submitIntake(
          slug,
          { ...fields, job_type: jobTypes.join(", "), media },
          honeypot,
          Date.now() - loadedAtRef.current,
        );
        if (!result.ok) {
          setError(result.error);
          setStatus("idle");
          return;
        }
        setSubmitted(true);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.",
        );
      } finally {
        setStatus("idle");
      }
    });
  }

  if (submitted) {
    return <SuccessPanel companyName={companyName} />;
  }

  const busy = isPending || status === "uploading";
  const photoCount = files.filter((f) => f.kind === "photo").length;
  const videoCount = files.filter((f) => f.kind === "video").length;

  return (
    <>
      {/* sticky progress */}
      <div className="sticky top-0 z-20 -mx-4 mb-6 bg-cream/85 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-cream-deep">
            <div
              className="h-full rounded-full bg-forest transition-[width] duration-500 ease-out"
              style={{ width: `${Math.max(progress, 4)}%` }}
            />
          </div>
          <span className="shrink-0 text-sm font-semibold text-forest-deep">
            {sectionsDone} of 4
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
        {/* Honeypot: hidden from people, tempting to bots. */}
        <input
          type="text"
          name="company_website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          className="pointer-events-none absolute left-[-9999px] h-px w-px opacity-0"
        />

        <Section title="About you" step="1" icon={UserIcon}>
          <Field label="Your name" htmlFor="customer_name" required>
            <input
              id="customer_name"
              className={inputClass}
              value={fields.customer_name}
              onChange={(e) => set("customer_name")(e.target.value)}
              autoComplete="name"
            />
          </Field>
          <Field label="Phone number" htmlFor="customer_phone" required>
            <input
              id="customer_phone"
              type="tel"
              inputMode="tel"
              className={inputClass}
              value={fields.customer_phone}
              onChange={(e) =>
                set("customer_phone")(formatPhone(e.target.value))
              }
              autoComplete="tel"
              placeholder="(662) 882-2299"
            />
          </Field>
          <Field
            label="Email"
            htmlFor="customer_email"
            hint="Optional — we'll send you a confirmation"
          >
            <input
              id="customer_email"
              type="email"
              inputMode="email"
              className={inputClass}
              value={fields.customer_email}
              onChange={(e) => set("customer_email")(e.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
            />
          </Field>
          <Field
            label="Property address"
            htmlFor="address"
            hint="Where is the tree?"
            required
          >
            <input
              id="address"
              className={inputClass}
              value={fields.address}
              onChange={(e) => set("address")(e.target.value)}
              autoComplete="street-address"
            />
          </Field>
        </Section>

        <Section title="About the tree" step="2" icon={LeafIcon}>
          <Field label="What do you need done?" hint="Select all that apply">
            <ChoiceGroup
              name="job_type"
              options={JOB_TYPES}
              multi
              value={jobTypes}
              onChange={setJobTypes}
            />
          </Field>
          <Field label="How many trees?">
            <ChoiceGroup
              name="tree_count"
              options={TREE_COUNTS}
              value={fields.tree_count}
              onChange={set("tree_count")}
            />
          </Field>
          <Field label="Is the tree alive or dead?">
            <ChoiceGroup
              name="tree_condition"
              options={TREE_CONDITIONS}
              value={fields.tree_condition}
              onChange={set("tree_condition")}
            />
          </Field>
          <Field
            label="Roughly how tall?"
            hint="A rough guess is fine — compare it to your house."
          >
            <ChoiceGroup
              name="height_estimate"
              options={HEIGHT_ESTIMATES}
              value={fields.height_estimate}
              onChange={set("height_estimate")}
            />
          </Field>
        </Section>

        <Section title="Safety & access" step="3" icon={BoltIcon}>
          <Field label="Is it near a power line?">
            <ChoiceGroup
              name="near_power_lines"
              options={YES_NO_UNSURE}
              value={fields.near_power_lines}
              onChange={set("near_power_lines")}
              flagOption="Yes"
            />
          </Field>
          <Field label="Is it near your house or a building?">
            <ChoiceGroup
              name="near_structures"
              options={YES_NO_UNSURE}
              value={fields.near_structures}
              onChange={set("near_structures")}
              flagOption="Yes"
            />
          </Field>
          <Field label="Can a truck get close to it?">
            <ChoiceGroup
              name="truck_access"
              options={TRUCK_ACCESS}
              value={fields.truck_access}
              onChange={set("truck_access")}
            />
          </Field>
          <Field
            label="Anything else we should know?"
            htmlFor="notes"
            hint="Optional"
          >
            <textarea
              id="notes"
              rows={3}
              className={`${inputClass} resize-y`}
              value={fields.notes}
              onChange={(e) => set("notes")(e.target.value)}
            />
          </Field>
        </Section>

        <Section title="Photos & video" step="4" icon={CameraIcon}>
          <p className="-mt-1 text-base text-ink-soft">
            This is the most helpful part. Add a few photos from different angles
            — and a short video if you can.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            capture="environment"
            className="sr-only"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex min-h-36 w-full cursor-pointer flex-col items-center justify-center gap-2.5 rounded-[--radius-xl2] border-2 border-dashed border-forest/35 bg-forest/[0.04] px-4 py-8 text-center transition-colors duration-200 hover:border-forest hover:bg-forest/[0.08]"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-forest/12 text-forest">
              <CameraIcon className="h-7 w-7" />
            </span>
            <span className="text-lg font-semibold text-forest-deep">
              Add photos or video
            </span>
            <span className="text-sm text-ink-soft">
              Tap to use your camera or pick from your phone
            </span>
          </button>

          {files.length > 0 && (
            <>
              <p className="text-sm font-medium text-ink-soft">
                {photoCount > 0 &&
                  `${photoCount} photo${photoCount === 1 ? "" : "s"}`}
                {photoCount > 0 && videoCount > 0 && " · "}
                {videoCount > 0 &&
                  `${videoCount} video${videoCount === 1 ? "" : "s"}`}
                {!canUpload && " (preview only — saving is off in demo mode)"}
              </p>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {files.map((picked, index) => (
                  <div
                    key={picked.url}
                    className="group relative aspect-square overflow-hidden rounded-[--radius-card] border border-line bg-cream-deep shadow-[var(--elevation-1)]"
                  >
                    {picked.kind === "video" ? (
                      <video
                        src={picked.url}
                        className="h-full w-full object-cover"
                        muted
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={picked.url}
                        alt={`Upload ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    )}
                    {picked.kind === "video" && (
                      <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white">
                        Video
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      aria-label="Remove"
                      className="absolute right-1 top-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-black/55 text-white opacity-90 transition hover:bg-black/80"
                    >
                      <XIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </Section>

        {error && (
          <div
            role="alert"
            className="rounded-[--radius-card] border border-amber-deep/40 bg-amber/15 px-4 py-3 text-base font-medium text-amber-deep"
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-1 inline-flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-[--radius-xl2] bg-forest px-6 text-lg font-semibold text-white shadow-[var(--elevation-2)] transition-all duration-200 hover:bg-forest-deep hover:shadow-[var(--elevation-3)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy
            ? status === "uploading"
              ? "Sending your photos…"
              : "Sending…"
            : "Send to my tree pro"}
        </button>
        <div className="flex flex-col items-center gap-1.5 text-center">
          <p className="flex items-center justify-center gap-1.5 text-sm text-ink-soft">
            <LockIcon className="h-3.5 w-3.5" />
            Your photos and details go only to {companyName}.
          </p>
          <p className="text-xs text-ink-soft">
            No account needed ·{" "}
            <a href="/privacy" className="underline underline-offset-2 hover:text-forest-deep">
              Privacy
            </a>{" "}
            ·{" "}
            <a href="/terms" className="underline underline-offset-2 hover:text-forest-deep">
              Terms
            </a>
          </p>
        </div>
      </form>
    </>
  );
}

function Section({
  title,
  step,
  icon: Icon,
  children,
}: {
  title: string;
  step: string;
  icon: ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[--radius-xl2] border border-line bg-paper p-5 shadow-[var(--elevation-2)] sm:p-7">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-[--radius-card] bg-forest/10 text-forest">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-forest-bright">
            Step {step}
          </p>
          <h2 className="font-display text-2xl font-semibold leading-tight text-forest-deep">
            {title}
          </h2>
        </div>
      </div>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}

function SuccessPanel({ companyName }: { companyName: string }) {
  return (
    <div className="edge-light rounded-[--radius-xl2] border border-line bg-paper p-8 text-center sm:p-12">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-forest/10 text-forest">
        <CheckIcon className="h-9 w-9" />
      </div>
      <h2 className="font-display text-3xl font-semibold text-forest-deep">
        Sent. You&apos;re all set.
      </h2>
      <p className="mx-auto mt-3 max-w-md text-lg text-ink-soft">
        {`${companyName} just got your photos and details. They'll reach out with next steps — usually a quote or a quick call.`}
      </p>
    </div>
  );
}
