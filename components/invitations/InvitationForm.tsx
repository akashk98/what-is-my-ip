"use client";

import { useMemo, useState } from "react";
import type { EventType, InvitationPayload, InvitationTheme } from "@/services/invitations";
import { getEventTypes } from "@/services/invitations";
import { eventTileData, themeOptions } from "./template-data";
import InvitationTemplate from "./InvitationTemplate";
import { DEFAULT_PHOTO_PLACEHOLDER, DEFAULT_QR_PLACEHOLDER, getDefaultInvitationValues } from "./defaultInvitationData";
import { isValidImageFileType, MAX_INVITATION_IMAGE_SIZE } from "@/utils/validators";

interface InvitationFormProps {
  apiPath?: string;
  method?: "POST" | "PUT";
  initialValues?: Partial<InvitationPayload>;
  submitLabel?: string;
}

export default function InvitationForm({
  apiPath = "/api/invitations",
  method = "POST",
  initialValues = {},
  submitLabel = "Create invitation",
}: InvitationFormProps) {
  const initialType = (initialValues.eventType ?? "Birthday") as EventType;
  const [values, setValues] = useState<InvitationPayload>(() => ({
    ...getDefaultInvitationValues(initialType),
    ...initialValues,
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ inviteUrl: string; editUrl: string } | null>(null);

  const eventTypes = getEventTypes();

  const eventDetails = useMemo(() => {
    return eventTileData.find((item) => item.type === values.eventType);
  }, [values.eventType]);

  function updateField<Key extends keyof InvitationPayload>(field: Key, value: InvitationPayload[Key]) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
    setFormError(null);
    setResult(null);
  }

  function selectEventType(eventType: EventType) {
    const typeDefaults = getDefaultInvitationValues(eventType);
    setValues((current) => ({
      ...typeDefaults,
      ...current,
      eventType,
    }));
    setErrors({});
    setFormError(null);
    setResult(null);
  }

  function validateFile(file: File) {
    if (file.size > MAX_INVITATION_IMAGE_SIZE) {
      return "File size must be 5MB or less.";
    }
    if (!isValidImageFileType(file.name, file.type)) {
      return "Only JPG, PNG, JPEG and WEBP files are accepted.";
    }
    return "";
  }

  function handleFileChange(field: "photoDataUrl" | "qrCodeDataUrl", file?: File) {
    if (!file) return;
    const fileError = validateFile(file);
    if (fileError) {
      setErrors((current) => ({ ...current, [field]: fileError }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const resultUrl = reader.result as string;
      updateField(field, resultUrl);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch(apiPath, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload = await response.json();

      if (!response.ok) {
        if (payload?.errors) {
          setErrors(payload.errors);
        }
        if (payload?.code === "capacity_full") {
          setFormError("We are currently at maximum capacity. Please try again after some invitations expire.");
        } else {
          setFormError(payload?.message ?? "Unable to save invitation. Please try again.");
        }
        setIsLoading(false);
        return;
      }

      const origin = window.location.origin;
      setResult({
        inviteUrl: `${origin}/invite/${payload.slug}`,
        editUrl: `${origin}/edit/${payload.editToken}`,
      });
      setErrors({});
      setFormError(null);
    } catch (error) {
      setFormError("Unable to reach server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.95fr]">
      <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
        <div className="space-y-4">
          <div className="rounded-3xl bg-slate-50 p-5">
            <h1 className="text-2xl font-semibold text-slate-900">Create digital invitation</h1>
            <p className="mt-2 text-sm text-slate-600">Choose an event type, theme, upload your photo and QR code, then publish a shareable invitation page.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {eventTypes.map((eventType) => (
              <button
                type="button"
                key={eventType}
                onClick={() => selectEventType(eventType)}
                className={`rounded-3xl border px-5 py-4 text-left transition ${values.eventType === eventType ? "border-emerald-500 bg-emerald-50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"}`}
              >
                <div className="text-sm font-semibold text-slate-900">{eventType}</div>
                <div className="mt-1 text-sm text-slate-600">{eventTileData.find((item) => item.type === eventType)?.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Event Title
            <input
              type="text"
              value={values.title}
              onChange={(event) => updateField("title", event.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
            {errors.title ? <p className="text-xs text-rose-600">{errors.title}</p> : null}
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Your Name
            <input
              type="text"
              value={values.name}
              onChange={(event) => updateField("name", event.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
            {errors.name ? <p className="text-xs text-rose-600">{errors.name}</p> : null}
          </label>
        </div>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          Message
          <textarea
            value={values.message}
            onChange={(event) => updateField("message", event.target.value)}
            rows={4}
            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
          {errors.message ? <p className="text-xs text-rose-600">{errors.message}</p> : null}
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Date
            <input
              type="date"
              value={values.date}
              onChange={(event) => updateField("date", event.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
            {errors.date ? <p className="text-xs text-rose-600">{errors.date}</p> : null}
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Time
            <input
              type="time"
              value={values.time}
              onChange={(event) => updateField("time", event.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
            {errors.time ? <p className="text-xs text-rose-600">{errors.time}</p> : null}
          </label>
        </div>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          Venue
          <input
            type="text"
            value={values.venue}
            onChange={(event) => updateField("venue", event.target.value)}
            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
          {errors.venue ? <p className="text-xs text-rose-600">{errors.venue}</p> : null}
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          Google Maps URL
          <input
            type="url"
            value={values.mapsUrl}
            onChange={(event) => updateField("mapsUrl", event.target.value)}
            placeholder="https://maps.app.goo.gl/..."
            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
          {errors.mapsUrl ? <p className="text-xs text-rose-600">{errors.mapsUrl}</p> : null}
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          Contact Number
          <input
            type="tel"
            value={values.contactNumber}
            onChange={(event) => updateField("contactNumber", event.target.value)}
            placeholder="+1234567890"
            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
          {errors.contactNumber ? <p className="text-xs text-rose-600">{errors.contactNumber}</p> : null}
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Upload one Photo
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => handleFileChange("photoDataUrl", event.target.files?.[0])}
              className="w-full text-sm text-slate-600"
            />
            {errors.photoDataUrl ? <p className="text-xs text-rose-600">{errors.photoDataUrl}</p> : null}
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Upload QR Code Image
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => handleFileChange("qrCodeDataUrl", event.target.files?.[0])}
              className="w-full text-sm text-slate-600"
            />
            {errors.qrCodeDataUrl ? <p className="text-xs text-rose-600">{errors.qrCodeDataUrl}</p> : null}
          </label>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="mb-3 text-sm font-semibold text-slate-900">Theme selection</div>
          <div className="grid gap-3 sm:grid-cols-2">
            {themeOptions.map((option) => (
              <button
                type="button"
                key={option.value}
                onClick={() => updateField("theme", option.value)}
                className={`rounded-3xl border px-4 py-4 text-left transition ${values.theme === option.value ? `${option.accent} border-current shadow-sm` : "border-slate-200 bg-white hover:border-slate-300"}`}
              >
                <div className="font-semibold">{option.label}</div>
                <div className="mt-1 text-sm text-slate-600">{option.value}</div>
              </button>
            ))}
          </div>
          {errors.theme ? <p className="mt-3 text-xs text-rose-600">{errors.theme}</p> : null}
        </div>

        {formError ? <div className="rounded-3xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</div> : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-3xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Saving..." : submitLabel}
          </button>
          {result ? (
            <div className="space-y-2 text-sm text-slate-700">
              <div>
                Invitation live at <a className="font-semibold text-emerald-600" href={result.inviteUrl}>{result.inviteUrl}</a>
              </div>
              <div>
                Edit link <a className="font-semibold text-slate-950" href={result.editUrl}>{result.editUrl}</a>
              </div>
            </div>
          ) : null}
        </div>
      </form>

      <div className="space-y-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100">
          <div className="text-sm font-semibold text-slate-900">Preview</div>
          <div className="mt-4">
            <InvitationTemplate
              eventType={values.eventType}
              name={values.name || "Host Name"}
              title={values.title || "Event Title"}
              message={values.message || "Your invitation message will appear here."}
              date={values.date || "Date"}
              time={values.time || "Time"}
              venue={values.venue || "Venue"}
              mapsUrl={values.mapsUrl}
              contactNumber={values.contactNumber || "Contact"}
              photoDataUrl={values.photoDataUrl}
              qrCodeDataUrl={values.qrCodeDataUrl}
              theme={values.theme}
            />
          </div>
        </div>

        {eventDetails ? (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-semibold text-slate-900">What this invitation feels like</div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{eventDetails.subtitle} — {eventDetails.description}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
