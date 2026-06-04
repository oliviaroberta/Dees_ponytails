import { useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { GalleryItem } from "@/types/gallery";
import PaginationControls from "@/components/PaginationControls";

const GALLERY_ITEMS_PER_PAGE = 6;

const AdminGallery = () => {
  const { accessToken } = useAuth();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [form, setForm] = useState({
    customerName: "",
    caption: "",
    isPublished: true,
    sortOrder: "0",
  });

  const loadItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiRequest<{ items: GalleryItem[] }>("/gallery?published=all");
      setItems(response.items);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load gallery");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadItems();
  }, []);
  const totalPages = Math.max(1, Math.ceil(items.length / GALLERY_ITEMS_PER_PAGE));
  const paginatedItems = useMemo(
    () =>
      items.slice(
        (currentPage - 1) * GALLERY_ITEMS_PER_PAGE,
        currentPage * GALLERY_ITEMS_PER_PAGE,
      ),
    [currentPage, items],
  );

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const uploadMedia = async (selectedFile: File) => {
    if (!accessToken) {
      throw new Error("Admin authentication is required");
    }

    const isVideo = selectedFile.type.startsWith("video/");
    const formData = new FormData();
    formData.append(isVideo ? "video" : "image", selectedFile);

    const response = await apiRequest<{ imageUrl?: string; videoUrl?: string }>(
      isVideo ? "/uploads/product-video" : "/uploads/product-image",
      {
        method: "POST",
        token: accessToken,
        body: formData,
      },
    );

    const mediaUrl = response.videoUrl || response.imageUrl || "";

    return {
      mediaType: isVideo ? ("VIDEO" as const) : ("IMAGE" as const),
      mediaUrl,
    };
  };

  return (
    <AdminShell
      title="Gallery"
      description="Upload client photos and videos for the public gallery page."
    >
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[1.75rem] border border-border/60 bg-card/90 p-6 backdrop-blur">
          <h2 className="font-display text-2xl font-semibold text-foreground">Upload Gallery Item</h2>
          <p className="mt-1 font-body text-sm text-muted-foreground">
            Add client photos or videos received through WhatsApp.
          </p>

          {error ? (
            <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 font-body text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <form
            className="mt-5 space-y-5"
            onSubmit={async (event) => {
              event.preventDefault();
              setError(null);
              setIsSubmitting(true);

              try {
                if (!file) {
                  throw new Error("Please choose a photo or video first");
                }

                const uploaded = await uploadMedia(file);
                const response = await apiRequest<{ item: GalleryItem }>("/gallery", {
                  method: "POST",
                  token: accessToken,
                  body: JSON.stringify({
                    mediaType: uploaded.mediaType,
                    mediaUrl: uploaded.mediaUrl,
                    customerName: form.customerName,
                    caption: form.caption,
                    isPublished: form.isPublished,
                    sortOrder: Number(form.sortOrder) || 0,
                  }),
                });

                setItems((current) => [response.item, ...current]);
                setFile(null);
                setForm({
                  customerName: "",
                  caption: "",
                  isPublished: true,
                  sortOrder: "0",
                });
              } catch (submitError) {
                setError(
                  submitError instanceof Error ? submitError.message : "Failed to create gallery item",
                );
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            <div>
              <label className="mb-1.5 block font-body text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Photo or Video
              </label>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-xs file:uppercase file:tracking-[0.18em] file:text-primary-foreground focus:border-foreground"
              />
            </div>

            <Field
              label="Client Name"
              value={form.customerName}
              onChange={(value) => setForm((current) => ({ ...current, customerName: value }))}
            />
            <Field
              label="Caption"
              value={form.caption}
              onChange={(value) => setForm((current) => ({ ...current, caption: value }))}
            />
            <Field
              label="Sort Order"
              type="number"
              value={form.sortOrder}
              onChange={(value) => setForm((current) => ({ ...current, sortOrder: value }))}
            />

            <label className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/60 px-4 py-4">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(event) =>
                  setForm((current) => ({ ...current, isPublished: event.target.checked }))
                }
                className="h-4 w-4 rounded border-border"
              />
              <span className="font-body text-sm text-foreground">Publish immediately</span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-primary px-6 py-3.5 font-body text-sm uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {isSubmitting ? "Uploading..." : "Add to Gallery"}
            </button>
          </form>

          <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-border/60 bg-background/70">
            {previewUrl ? (
              file?.type.startsWith("video/") ? (
                <video src={previewUrl} controls className="aspect-video w-full object-cover" />
              ) : (
                <img src={previewUrl} alt="Gallery preview" className="aspect-[4/5] w-full object-cover" />
              )
            ) : (
              <div className="flex aspect-[4/5] items-center justify-center px-6 text-center font-body text-sm text-muted-foreground">
                Select a photo or video to preview it before publishing.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-border/60 bg-card/90 p-6 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground">Published Gallery</h2>
              <p className="mt-1 font-body text-sm text-muted-foreground">
                Manage what visitors see on the gallery page.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void loadItems()}
              className="rounded-full border border-border bg-background/70 px-4 py-2 font-body text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
            >
              Refresh
            </button>
          </div>

          <div className="mt-5 space-y-4">
            {isLoading ? (
              <div className="rounded-2xl border border-border/60 bg-background/60 p-6 text-center">
                <p className="font-body text-sm text-muted-foreground">Loading gallery items...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-2xl border border-border/60 bg-background/60 p-6 text-center">
                <p className="font-body text-sm text-muted-foreground">No gallery items yet.</p>
              </div>
            ) : (
              <>
              {paginatedItems.map((item) => (
                <article
                  key={item.id}
                  className="grid gap-4 rounded-2xl border border-border/60 bg-background/60 p-4 md:grid-cols-[150px_minmax(0,1fr)]"
                >
                  <div className="overflow-hidden rounded-2xl bg-secondary/30">
                    {item.mediaType === "VIDEO" ? (
                      <video src={item.mediaUrl} controls className="aspect-square w-full object-cover" />
                    ) : (
                      <img
                        src={item.mediaUrl}
                        alt={item.caption || item.customerName || "Gallery item"}
                        className="aspect-square w-full object-cover"
                      />
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-border px-3 py-1 font-body text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        {item.mediaType === "VIDEO" ? "Video" : "Photo"}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 font-body text-[11px] uppercase tracking-[0.18em] ${
                          item.isPublished
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-foreground"
                        }`}
                      >
                        {item.isPublished ? "Published" : "Hidden"}
                      </span>
                    </div>

                    <div>
                      <p className="font-display text-xl font-semibold text-foreground">
                        {item.customerName || "Dees_ponytails Client"}
                      </p>
                      {item.caption ? (
                        <p className="mt-1 font-body text-sm leading-relaxed text-muted-foreground">
                          {item.caption}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={async () => {
                          const response = await apiRequest<{ item: GalleryItem }>(`/gallery/${item.id}`, {
                            method: "PATCH",
                            token: accessToken,
                            body: JSON.stringify({ isPublished: !item.isPublished }),
                          });
                          setItems((current) =>
                            current.map((entry) => (entry.id === item.id ? response.item : entry)),
                          );
                        }}
                        className="rounded-full border border-border bg-background px-4 py-2 font-body text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {item.isPublished ? "Hide" : "Publish"}
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await apiRequest(`/gallery/${item.id}`, {
                            method: "DELETE",
                            token: accessToken,
                          });
                          setItems((current) => current.filter((entry) => entry.id !== item.id));
                        }}
                        className="rounded-full border border-destructive/30 bg-destructive/10 px-4 py-2 font-body text-xs uppercase tracking-[0.18em] text-destructive transition-opacity hover:opacity-80"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
              </>
            )}
          </div>
          {items.length > 0 ? (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={GALLERY_ITEMS_PER_PAGE}
              totalItems={items.length}
              itemLabel="gallery item"
              onPageChange={setCurrentPage}
            />
          ) : null}
        </section>
      </div>
    </AdminShell>
  );
};

const Field = ({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) => (
  <div>
    <label className="mb-1.5 block font-body text-xs uppercase tracking-[0.18em] text-muted-foreground">
      {label}
    </label>
    {label === "Caption" ? (
      <textarea
        rows={4}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-border bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-foreground"
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-border bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-foreground"
      />
    )}
  </div>
);

export default AdminGallery;
