"use client";

import { useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { Field } from "@/components/ui/Field";
import { ChoiceGroup } from "@/components/ui/ChoiceGroup";
import {
  HEIGHT_ESTIMATES,
  JOB_TYPES,
  STORAGE_BUCKET,
  TREE_CONDITIONS,
  TREE_COUNTS,
  TRUCK_ACCESS,
  YES_NO_UNSURE,
} from "@/lib/constants";
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
  job_type: "",
  tree_count: "",
  tree_condition: "",
  height_estimate: "",
  near_power_lines: "",
  near_structures: "",
  truck_access: "",
  notes: "",
};

const inputClass =
  "w-full min-h-12 rounded-[--radius-card] border border-line bg-paper px-4 py-3 text-base text-ink placeholder:text-ink-soft/60 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/30";

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
  const [files, setFiles] = useState<PickedFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading">("idle");
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = (key: keyof typeof fields) => (value: string) =>
    setFields((prev) => ({ ...prev, [key]: value }));

  function handleFiles(list: FileList | null) {
    if (!list) return;
    const picked: PickedFile[] = Array.from(list).map((file) => ({
      file,
      url: URL.createObjectURL(file),
      kind: kindOf(file),
    }));
    setFiles((prev) => [...prev, ...picked].slice(0, 30));
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
        const result = await submitIntake(slug, { ...fields, media });
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-7" noValidate>
      <Section title="About you" step="1">
        <Field label="Your name" htmlFor="customer_name" required>
          <input
            id="customer_name"
            className={inputClass}
            value={fields.customer_name}
            onChange={(e) => set("customer_name")(e.target.value)}
            autoComplete="name"
          />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Phone number" htmlFor="customer_phone" required>
            <input
              id="customer_phone"
              type="tel"
              inputMode="tel"
              className={inputClass}
              value={fields.customer_phone}
              onChange={(e) => set("customer_phone")(e.target.value)}
              autoComplete="tel"
            />
          </Field>
          <Field label="Email" htmlFor="customer_email" hint="Optional">
            <input
              id="customer_email"
              type="email"
              inputMode="email"
              className={inputClass}
              value={fields.customer_email}
              onChange={(e) => set("customer_email")(e.target.value)}
              autoComplete="email"
            />
          </Field>
        </div>
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

      <Section title="About the tree" step="2">
        <Field label="What do you need done?">
          <ChoiceGroup
            name="job_type"
            options={JOB_TYPES}
            value={fields.job_type}
            onChange={set("job_type")}
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

      <Section title="Safety & access" step="3">
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
        <Field label="Anything else we should know?" htmlFor="notes" hint="Optional">
          <textarea
            id="notes"
            rows={3}
            className={`${inputClass} resize-y`}
            value={fields.notes}
            onChange={(e) => set("notes")(e.target.value)}
          />
        </Field>
      </Section>

      <Section title="Photos & video" step="4">
        <p className="-mt-1 text-base text-ink-soft">
          This is the most helpful part. Add a few photos from different angles —
          and a short video if you can.
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
          className="flex min-h-32 w-full flex-col items-center justify-center gap-2 rounded-[--radius-xl2] border-2 border-dashed border-forest/40 bg-paper px-4 py-8 text-center transition-colors hover:border-forest hover:bg-cream-deep"
        >
          <CameraIcon />
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
              {photoCount > 0 && `${photoCount} photo${photoCount === 1 ? "" : "s"}`}
              {photoCount > 0 && videoCount > 0 && " · "}
              {videoCount > 0 && `${videoCount} video${videoCount === 1 ? "" : "s"}`}
              {!canUpload && " (preview only — saving is off in demo mode)"}
            </p>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {files.map((picked, index) => (
                <div
                  key={picked.url}
                  className="group relative aspect-square overflow-hidden rounded-[--radius-card] border border-line bg-cream-deep"
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
                    className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white opacity-90 transition hover:bg-black/80"
                  >
                    ×
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
        className="mt-1 inline-flex min-h-14 items-center justify-center rounded-[--radius-xl2] bg-forest px-6 text-lg font-semibold text-white shadow-[var(--shadow-card)] transition hover:bg-forest-deep disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy
          ? status === "uploading"
            ? "Sending your photos…"
            : "Sending…"
          : "Send to my tree pro"}
      </button>
      <p className="text-center text-sm text-ink-soft">
        Goes straight to {companyName}. No account needed.
      </p>
    </form>
  );
}

function Section({
  title,
  step,
  children,
}: {
  title: string;
  step: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[--radius-xl2] border border-line bg-cream/60 p-5 sm:p-7">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-sm font-bold text-white">
          {step}
        </span>
        <h2 className="font-display text-2xl font-semibold text-forest-deep">
          {title}
        </h2>
      </div>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}

function SuccessPanel({ companyName }: { companyName: string }) {
  return (
    <div className="rounded-[--radius-xl2] border border-line bg-paper p-8 text-center sm:p-12">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-forest/10">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="m5 13 4 4L19 7"
            stroke="var(--forest)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
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

function CameraIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1l.8-1.4A1.5 1.5 0 0 1 9.6 4h4.8a1.5 1.5 0 0 1 1.3.6L16.5 6h1A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-8Z"
        stroke="var(--forest)"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="12.5" r="3.2" stroke="var(--forest)" strokeWidth="1.6" />
    </svg>
  );
}
