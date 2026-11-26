"use client";

import { useEffect, useRef, useState } from "react";
import type { OrderedImage, Project, ProjectCategory } from "@/lib/projects";
import { CATEGORY_LABELS, createProject, deleteProject, metricsToText, parseMetrics, updateProject } from "@/lib/projects";
import { addTag, deleteTag, subscribeTechnologies, type Tag } from "@/lib/firestore/taxonomy";
import Dropdown from "@/components/ui/Dropdown";

const TABS = ["All Portfolio", "Add Portfolio", "Technologies"] as const;
export type Tab = (typeof TABS)[number];

const STEPS = ["Project Info", "Images", "Details", "Preview"];

const CATEGORY_OPTIONS: { value: ProjectCategory; label: string }[] = (
  Object.entries(CATEGORY_LABELS) as [ProjectCategory, string][]
).map(([value, label]) => ({ value, label }));

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-center gap-3 overflow-x-auto py-2">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const state = n === step ? "active" : n < step ? "done" : "todo";
        return (
          <div key={label} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                  state === "active"
                    ? "border-gold text-gold"
                    : state === "done"
                    ? "border-gold bg-gold text-bg"
                    : "border-line text-muted"
                }`}
              >
                {state === "done" ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  n
                )}
              </span>
              <span className={`whitespace-nowrap text-xs font-medium ${state === "todo" ? "text-muted" : "text-ink"}`}>
                {label}
              </span>
            </div>
            {n < STEPS.length && <span className="h-px w-8 bg-line sm:w-14" />}
          </div>
        );
      })}
    </div>
  );
}

function TechChipPicker({
  selected,
  onToggle,
}: {
  selected: string;
  onToggle: (name: string) => void;
}) {
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    const unsub = subscribeTechnologies(setTags);
    return () => unsub?.();
  }, []);

  if (tags.length === 0) return null;

  const selectedList = selected
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {tags.map((tag) => {
        const isOn = selectedList.includes(tag.name.toLowerCase());
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => onToggle(tag.name)}
            className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
              isOn
                ? "border-gold bg-gold/15 text-gold"
                : "border-line text-muted hover:border-gold/60 hover:text-ink"
            }`}
          >
            {tag.name}
          </button>
        );
      })}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-line bg-bg px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-gold focus:outline-none";

type FormState = {
  title: string;
  category: ProjectCategory;
  technologies: string;
  client: string;
  link: string;
  description: string;
  status: "Completed" | "In Progress";
  featured: boolean;
  videoUrl: string;
  demoUrl: string;
  csChallenge: string;
  csSolution: string;
  csResult: string;
  csBefore: string;
  csAfter: string;
  /** One metric per line, "value | label" — e.g. "+212% | Organic traffic". */
  csMetrics: string;
};

const EMPTY_FORM: FormState = {
  title: "",
  category: "web",
  technologies: "",
  client: "",
  link: "",
  description: "",
  status: "Completed",
  featured: false,
  videoUrl: "",
  demoUrl: "",
  csChallenge: "",
  csSolution: "",
  csResult: "",
  csBefore: "",
  csAfter: "",
  csMetrics: "",
};

/** Turns the flat form into what projects.ts stores (case study fields folded into one object). */
function toProjectFields(f: FormState) {
  const { csChallenge, csSolution, csResult, csBefore, csAfter, csMetrics, ...rest } = f;
  const metrics = parseMetrics(csMetrics);
  const hasCaseStudy = csChallenge.trim() || csSolution.trim() || csResult.trim() || csBefore.trim() || csAfter.trim() || metrics.length > 0;
  return {
    ...rest,
    caseStudy: hasCaseStudy
      ? {
          challenge: csChallenge.trim(),
          solution: csSolution.trim(),
          result: csResult.trim(),
          // The slider needs both images, so only keep them as a pair.
          beforeImage: csBefore.trim() && csAfter.trim() ? csBefore.trim() : "",
          afterImage: csBefore.trim() && csAfter.trim() ? csAfter.trim() : "",
          metrics,
        }
      : null,
  };
}

type ImageItem =
  | { key: string; kind: "existing"; url: string }
  | { key: string; kind: "new"; file: File; previewUrl: string };

let newImageCounter = 0;

function AddPortfolioWizard({
  editingProject,
  onDone,
}: {
  editingProject: Project | null;
  onDone: () => void;
}) {
  const [step, setStep] = useState(1);
  const [dragOver, setDragOver] = useState(false);
  const [imageItems, setImageItems] = useState<ImageItem[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);
  // Set once a brand-new project has been created (even if some of its images
  // failed to upload). Lets a retry click update that same project instead of
  // creating a duplicate one.
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingProject) {
      setForm({
        title: editingProject.title,
        category: editingProject.category,
        technologies: editingProject.technologies ?? "",
        client: editingProject.client ?? "",
        link: editingProject.link ?? "",
        description: editingProject.description ?? "",
        status: editingProject.status ?? "Completed",
        featured: Boolean(editingProject.featured),
        videoUrl: editingProject.videoUrl ?? "",
        demoUrl: editingProject.demoUrl ?? "",
        csChallenge: editingProject.caseStudy?.challenge ?? "",
        csSolution: editingProject.caseStudy?.solution ?? "",
        csResult: editingProject.caseStudy?.result ?? "",
        csBefore: editingProject.caseStudy?.beforeImage ?? "",
        csAfter: editingProject.caseStudy?.afterImage ?? "",
        csMetrics: metricsToText(editingProject.caseStudy?.metrics),
      });
      setStep(1);
      setSuccess(false);
      setError(null);
      setWarning(null);
      setImageItems((editingProject.images ?? []).map((url) => ({ key: url, kind: "existing", url })));
      setRemovedImages([]);
      setCreatedProjectId(null);
    } else {
      setImageItems([]);
      setRemovedImages([]);
      setCreatedProjectId(null);
      setWarning(null);
    }
  }, [editingProject]);

  function addFiles(newFiles: File[]) {
    const items: ImageItem[] = newFiles.map((file) => ({
      key: `new-${Date.now()}-${newImageCounter++}`,
      kind: "new",
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setImageItems((prev) => [...prev, ...items]);
  }

  function removeImage(key: string) {
    setImageItems((prev) => {
      const item = prev.find((i) => i.key === key);
      if (item?.kind === "existing") setRemovedImages((r) => [...r, item.url]);
      if (item?.kind === "new") URL.revokeObjectURL(item.previewUrl);
      return prev.filter((i) => i.key !== key);
    });
  }

  function makeThumbnail(key: string) {
    setImageItems((prev) => {
      const idx = prev.findIndex((i) => i.key === key);
      if (idx <= 0) return prev;
      const copy = [...prev];
      const [item] = copy.splice(idx, 1);
      copy.unshift(item);
      return copy;
    });
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function reconcileAfterSave(urlByKey: Map<string, string>) {
    if (urlByKey.size === 0) return;
    setImageItems((prev) =>
      prev.map((item) =>
        item.kind === "new" && urlByKey.has(item.key)
          ? { key: item.key, kind: "existing", url: urlByKey.get(item.key)! }
          : item
      )
    );
  }

  async function handlePublish() {
    if (!form.title.trim()) {
      setError("Project title is required.");
      setStep(1);
      return;
    }
    setError(null);
    setWarning(null);
    setSaving(true);
    setUploadProgress(null);

    const totalNew = imageItems.filter((i) => i.kind === "new").length;
    const onProgress = (done: number, total: number) => setUploadProgress(total > 0 ? { done, total } : null);
    const targetId = editingProject?.id ?? createdProjectId;

    try {
      let urlByKey: Map<string, string>;
      let failedKeys: string[];

      if (targetId) {
        const orderedImages: OrderedImage[] = imageItems.map((item) =>
          item.kind === "existing"
            ? { type: "existing", url: item.url, key: item.key }
            : { type: "new", file: item.file, key: item.key }
        );
        const res = await updateProject(targetId, { ...toProjectFields(form), orderedImages, removedImages }, onProgress);
        urlByKey = res.urlByKey;
        failedKeys = res.failedKeys;
      } else {
        const newItems = imageItems
          .filter((i): i is Extract<ImageItem, { kind: "new" }> => i.kind === "new")
          .map((i) => ({ key: i.key, file: i.file }));
        const res = await createProject({ ...toProjectFields(form), images: newItems }, onProgress);
        setCreatedProjectId(res.id);
        urlByKey = res.urlByKey;
        failedKeys = res.failedKeys;
      }

      reconcileAfterSave(urlByKey);

      if (failedKeys.length > 0) {
        setWarning(
          `Saved — but ${failedKeys.length} of ${totalNew} image(s) didn't upload (likely a connection blip). ` +
            `They're still queued below — click "${editingProject || createdProjectId ? "Update" : "Publish"} Project" again to retry just those.`
        );
        setRemovedImages([]);
      } else {
        setSuccess(true);
        setForm(EMPTY_FORM);
        setImageItems([]);
        setRemovedImages([]);
        setCreatedProjectId(null);
        setStep(1);
        setTimeout(() => {
          setSuccess(false);
          onDone();
        }, 1200);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while saving.");
    } finally {
      setSaving(false);
      setUploadProgress(null);
    }
  }

  const dropzone = (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        addFiles(Array.from(e.dataTransfer.files ?? []));
      }}
      className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-14 text-center transition-colors ${
        dragOver ? "border-gold bg-gold/5" : "border-line"
      }`}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 text-gold">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M12 16V4M12 4l-4 4M12 4l4 4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 16v3a2 2 0 002 2h12a2 2 0 002-2v-3" strokeLinecap="round" />
        </svg>
      </span>
      <p className="text-sm font-medium text-ink">Drag &amp; drop images here</p>
      <p className="text-xs text-muted">or</p>
      <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-outline !px-4 !py-2 text-xs">
        Browse Files
      </button>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          addFiles(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />
      <p className="mt-2 text-[11px] text-muted">You can upload multiple images — no limit on how many</p>
      <p className="text-[11px] text-muted">Supported formats: JPG, PNG, WEBP</p>
      <p className="text-[11px] text-muted">Max file size: 5MB each (recommended)</p>
    </div>
  );

  const imageManagerGrid =
    imageItems.length > 0 ? (
      <div className="mt-4">
        <p className="mb-2 text-xs font-medium text-muted">
          {imageItems.length} image(s) — hover an image, use the star to set it as the thumbnail
        </p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {imageItems.map((item, i) => {
            const src = item.kind === "existing" ? item.url : item.previewUrl;
            const isThumbnail = i === 0;
            return (
              <div
                key={item.key}
                className={`group relative aspect-square overflow-hidden rounded-md border ${
                  isThumbnail ? "border-gold" : "border-line"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
                {isThumbnail && (
                  <span className="absolute left-1 top-1 rounded bg-gold px-1.5 py-0.5 text-[9px] font-semibold text-bg">
                    Thumbnail
                  </span>
                )}
                {item.kind === "new" && (
                  <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[9px] text-white">
                    New
                  </span>
                )}
                <div className="absolute right-1 top-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  {!isThumbnail && (
                    <button
                      type="button"
                      aria-label="Set as thumbnail"
                      onClick={() => makeThumbnail(item.key)}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white hover:text-gold"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </button>
                  )}
                  <button
                    type="button"
                    aria-label="Remove image"
                    onClick={() => removeImage(item.key)}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white hover:text-rose-400"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        {removedImages.length > 0 && (
          <p className="mt-2 text-[11px] text-gold">
            {removedImages.length} image(s) will be deleted when you publish.
          </p>
        )}
      </div>
    ) : null;

  return (
    <div>
      {editingProject && (
        <div className="mb-6 flex items-center justify-between rounded-md border border-gold/40 bg-gold/5 px-4 py-2 text-xs text-gold">
          Editing &quot;{editingProject.title}&quot;
          <button onClick={onDone} className="font-semibold hover:underline">
            Cancel edit
          </button>
        </div>
      )}

      <StepIndicator step={step} />

      <div className="mt-8">
        {step === 1 && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="space-y-5">
              <Field label="Project Title">
                <input
                  type="text"
                  placeholder="Enter project title"
                  className={inputClass}
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                />
              </Field>
              <Field label="Category">
                <Dropdown
                  ariaLabel="Category"
                  className={inputClass}
                  value={form.category}
                  onChange={(v) => update("category", v as ProjectCategory)}
                  options={CATEGORY_OPTIONS.map((c) => ({ value: c.value, label: c.label }))}
                />
              </Field>
              <Field label="Technologies Used">
                <input
                  type="text"
                  placeholder="e.g. HTML, CSS, React, PHP"
                  className={inputClass}
                  value={form.technologies}
                  onChange={(e) => update("technologies", e.target.value)}
                />
                <TechChipPicker
                  selected={form.technologies}
                  onToggle={(name) => {
                    const current = form.technologies
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean);
                    const exists = current.includes(name);
                    const next = exists ? current.filter((t) => t !== name) : [...current, name];
                    update("technologies", next.join(", "));
                  }}
                />
              </Field>
              <Field label="Client Name">
                <input
                  type="text"
                  placeholder="Enter client name (optional)"
                  className={inputClass}
                  value={form.client}
                  onChange={(e) => update("client", e.target.value)}
                />
              </Field>
              <Field label="Project Link">
                <input
                  type="url"
                  placeholder="https://example.com (optional)"
                  className={inputClass}
                  value={form.link}
                  onChange={(e) => update("link", e.target.value)}
                />
              </Field>
            </div>

            <div>
              <p className="mb-1.5 text-xs font-medium text-muted">Upload Project Images</p>
              {dropzone}
              {imageManagerGrid}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted">Upload Project Images</p>
            {dropzone}
            {imageManagerGrid}
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Description">
              <textarea
                rows={5}
                placeholder="Detailed project description"
                className={inputClass}
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
              />
            </Field>
            <div className="space-y-5">
              <Field label="Status">
                <Dropdown
                  ariaLabel="Status"
                  className={inputClass}
                  value={form.status}
                  onChange={(v) => update("status", v as "Completed" | "In Progress")}
                  options={[
                    { value: "Completed", label: "Completed" },
                    { value: "In Progress", label: "In Progress" },
                  ]}
                />
              </Field>
              <label className="flex items-center gap-2 text-xs text-muted">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-line accent-gold"
                  checked={form.featured}
                  onChange={(e) => update("featured", e.target.checked)}
                />
                Feature this project on the homepage
              </label>
            </div>

            <div className="space-y-5 border-t border-line pt-5 sm:col-span-2">
              <div>
                <p className="font-display text-sm font-semibold text-ink">Preview (optional)</p>
                <p className="mt-0.5 text-[11px] text-muted">Adds “Video” and “Live demo” buttons to the project card.</p>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Video URL">
                  <input
                    type="url"
                    placeholder="YouTube / Vimeo link, or a direct .mp4 link"
                    className={inputClass}
                    value={form.videoUrl}
                    onChange={(e) => update("videoUrl", e.target.value)}
                  />
                  <p className="mt-1 text-[11px] text-muted">A direct .mp4/.webm file also plays silently when someone hovers the card.</p>
                </Field>
                <Field label="Live demo URL">
                  <input
                    type="url"
                    placeholder="https://demo.example.com (defaults to Project Link)"
                    className={inputClass}
                    value={form.demoUrl}
                    onChange={(e) => update("demoUrl", e.target.value)}
                  />
                </Field>
              </div>
            </div>

            <div className="space-y-5 border-t border-line pt-5 sm:col-span-2">
              <div>
                <p className="font-display text-sm font-semibold text-ink">Case study (optional)</p>
                <p className="mt-0.5 text-[11px] text-muted">Fill in any of this to show a Results section on the project page.</p>
              </div>
              <Field label="Metrics — one per line as “value | label”">
                <textarea
                  rows={4}
                  placeholder={"+212% | Organic traffic\n3.4x | Return on ad spend\n40% | Faster checkout"}
                  className={inputClass}
                  value={form.csMetrics}
                  onChange={(e) => update("csMetrics", e.target.value)}
                />
              </Field>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <Field label="The challenge">
                  <textarea rows={4} className={inputClass} value={form.csChallenge} onChange={(e) => update("csChallenge", e.target.value)} />
                </Field>
                <Field label="Our solution">
                  <textarea rows={4} className={inputClass} value={form.csSolution} onChange={(e) => update("csSolution", e.target.value)} />
                </Field>
                <Field label="The result">
                  <textarea rows={4} className={inputClass} value={form.csResult} onChange={(e) => update("csResult", e.target.value)} />
                </Field>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Before image URL">
                  <input type="url" placeholder="https://…" className={inputClass} value={form.csBefore} onChange={(e) => update("csBefore", e.target.value)} />
                </Field>
                <Field label="After image URL">
                  <input type="url" placeholder="https://…" className={inputClass} value={form.csAfter} onChange={(e) => update("csAfter", e.target.value)} />
                </Field>
              </div>
              <p className="text-[11px] text-muted">
                Both images are needed for the before/after slider. Tip: upload them with this project (Images step), save, then copy their
                addresses from the live project page.
              </p>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="rounded-xl border border-line p-6">
            <p className="font-display text-base font-semibold text-ink">
              {form.title || "Untitled project"}
            </p>
            <p className="mt-1 text-xs text-gold">{CATEGORY_LABELS[form.category]}</p>
            {form.description && <p className="mt-3 text-xs leading-relaxed text-muted">{form.description}</p>}
            <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-muted">
              {form.client && <span>Client: {form.client}</span>}
              {form.technologies && <span>Tech: {form.technologies}</span>}
              <span>Status: {form.status}</span>
              {form.featured && <span className="text-gold">Featured</span>}
            </div>
            {uploadProgress && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-[11px] text-muted">
                  <span>Uploading images…</span>
                  <span>
                    {uploadProgress.done} / {uploadProgress.total}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full bg-gold-gradient transition-all duration-300"
                    style={{ width: `${Math.round((uploadProgress.done / uploadProgress.total) * 100)}%` }}
                  />
                </div>
              </div>
            )}
            {error && <p className="mt-3 text-xs text-rose-400">{error}</p>}
            {warning && <p className="mt-3 text-xs text-amber-400">{warning}</p>}
            {success && (
              <p className="mt-3 text-xs font-medium text-emerald-400">
                Saved! Refreshing your portfolio…
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          type="button"
          disabled={step === 1}
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          className="btn-outline disabled:cursor-not-allowed disabled:opacity-40"
        >
          Back
        </button>
        {step === STEPS.length ? (
          <button
            type="button"
            onClick={handlePublish}
            disabled={saving}
            className="btn-primary w-full justify-center disabled:opacity-60 sm:w-auto"
          >
            {saving
              ? uploadProgress
                ? `Uploading ${uploadProgress.done}/${uploadProgress.total}…`
                : "Saving…"
              : editingProject || createdProjectId
                ? "Update Project"
                : "Publish Project"}
            <span aria-hidden>→</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setStep((s) => Math.min(STEPS.length, s + 1))}
            className="btn-primary w-full justify-center sm:w-auto"
          >
            Next Step <span aria-hidden>→</span>
          </button>
        )}
      </div>
    </div>
  );
}

function AllPortfolioTab({
  projects,
  onEdit,
  onDelete,
}: {
  projects: Project[];
  onEdit: (p: Project) => void;
  onDelete: (p: Project) => void;
}) {
  if (projects.length === 0) {
    return <p className="py-8 text-center text-xs text-muted">No projects yet — add one from the &quot;Add Portfolio&quot; tab.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-xs">
        <thead>
          <tr className="border-b border-line text-muted">
            <th className="pb-3 pr-3 font-medium">#</th>
            <th className="pb-3 pr-3 font-medium">Project Title</th>
            <th className="pb-3 pr-3 font-medium">Category</th>
            <th className="pb-3 pr-3 font-medium">Client</th>
            <th className="pb-3 pr-3 font-medium">Status</th>
            <th className="pb-3 font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p, i) => (
            <tr key={p.id} className="border-b border-line/60 last:border-0">
              <td className="py-3 pr-3 text-muted">{i + 1}</td>
              <td className="py-3 pr-3 font-medium text-ink">{p.title}</td>
              <td className="py-3 pr-3 text-muted">{CATEGORY_LABELS[p.category]}</td>
              <td className="py-3 pr-3 text-muted">{p.client || "—"}</td>
              <td className="py-3 pr-3">
                <span
                  className={`rounded px-2 py-1 text-[10px] font-semibold ${
                    p.status === "Completed" ? "bg-emerald-500/15 text-emerald-400" : "bg-gold/15 text-gold"
                  }`}
                >
                  {p.status ?? "Completed"}
                </span>
              </td>
              <td className="py-3">
                <div className="flex items-center gap-3">
                  <button
                    aria-label="Edit"
                    onClick={() => onEdit(p)}
                    className="flex items-center gap-1 text-xs font-semibold text-gold hover:underline"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    aria-label="Delete"
                    onClick={() => onDelete(p)}
                    className="flex items-center gap-1 text-xs font-semibold text-rose-400 hover:underline"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6h16z" />
                    </svg>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TagManagerTab() {
  const kind = "technologies" as const;
  const [tags, setTags] = useState<Tag[]>([]);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeTechnologies(setTags);
    return () => unsub?.();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    setError(null);
    try {
      await addTag(kind, value.trim());
      setValue("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add.");
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteTag(kind, id);
    } catch {
      // ignore
    }
  }

  return (
    <div>
      <p className="mb-4 text-xs text-muted">
        Manage the technology tags available when adding or editing a portfolio project below.
      </p>
      <form onSubmit={handleAdd} className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="Add a new technology"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={`${inputClass} sm:flex-1`}
        />
        <button type="submit" className="btn-primary shrink-0 justify-center">
          Add
        </button>
      </form>
      {error && <p className="mb-4 text-xs text-rose-400">{error}</p>}

      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {tags.map((tag) => (
          <li
            key={tag.id}
            className="flex items-center justify-between rounded-lg border border-line px-4 py-3 text-sm text-ink"
          >
            {tag.name}
            <button aria-label="Delete" onClick={() => handleDelete(tag.id)} className="text-muted hover:text-rose-400">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6h16z" />
              </svg>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AdminManagePortfolio({
  projects,
  editingProject,
  onEdit,
  onDelete,
  onDoneEditing,
  activeTab,
  onTabChange,
}: {
  projects: Project[];
  editingProject: Project | null;
  onEdit: (p: Project) => void;
  onDelete: (p: Project) => void;
  onDoneEditing: () => void;
  activeTab: Tab;
  onTabChange: (t: Tab) => void;
}) {
  return (
    <div className="card !p-6 sm:!p-8">
      <h2 className="text-center font-display text-xl font-semibold text-ink sm:text-2xl">
        Manage <span className="text-gold">Portfolio</span>
      </h2>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2 border-b border-line pb-4">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => onTabChange(t)}
            className={`rounded-md px-4 py-2 text-xs font-semibold transition-colors ${
              activeTab === t ? "bg-gold-gradient text-bg" : "border border-line text-muted hover:text-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {activeTab === "All Portfolio" && (
          <AllPortfolioTab projects={projects} onEdit={onEdit} onDelete={onDelete} />
        )}
        {activeTab === "Add Portfolio" && (
          <AddPortfolioWizard editingProject={editingProject} onDone={onDoneEditing} />
        )}
        {activeTab === "Technologies" && <TagManagerTab />}
      </div>
    </div>
  );
}
