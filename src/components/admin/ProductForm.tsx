import { useEffect, useMemo, useState } from "react";
import type { AdminProductInput } from "@/context/AdminProductsContext";
import { useAdminProducts } from "@/context/AdminProductsContext";
import {
  getCloudinaryVideoWidgetSetupMessage,
  isCloudinaryVideoWidgetConfigured,
  isValidCloudinaryVideoUrl,
  openCloudinaryVideoWidget,
} from "@/lib/cloudinary-widget";
import {
  getProductStatusLabel,
  isStorefrontVisibleStatus,
  type ProductStatus,
} from "@/types/product";

export interface ProductFormValues {
  name: string;
  image: string;
  video: string;
  category: string;
  textureStyle: string;
  length: string;
  color: string;
  stock: string;
  price: string;
  description: string;
  featured: boolean;
  status: ProductStatus;
}

const ProductForm = ({
  initialValues,
  currentProductId,
  submitLabel,
  onSubmit,
}: {
  initialValues: ProductFormValues;
  currentProductId?: string;
  submitLabel: string;
  onSubmit: (
    values: AdminProductInput,
    imageFile: File | null,
  ) => void | Promise<void>;
}) => {
  const { products } = useAdminProducts();
  const [values, setValues] = useState<ProductFormValues>(initialValues);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [showManualVideoUrl, setShowManualVideoUrl] = useState(false);
  const categoryOptions = useMemo(
    () =>
      Array.from(
        new Set(
          products
            .map((product) => product.category.trim())
            .filter(Boolean),
        ),
      ).sort((left, right) => left.localeCompare(right)),
    [products],
  );
  const featuredProductCount = useMemo(
    () =>
      products.filter((product) => product.featured && product.id !== currentProductId).length,
    [currentProductId, products],
  );
  const featuredLimitReached = featuredProductCount >= 3;
  const canBeFeatured = isStorefrontVisibleStatus(values.status);
  const videoWidgetSetupMessage = getCloudinaryVideoWidgetSetupMessage();

  const update = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [imageFile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedVideo = values.video.trim();

    if (trimmedVideo && !isValidCloudinaryVideoUrl(trimmedVideo)) {
      setVideoError("Enter a valid Cloudinary video URL or upload through the widget.");
      return;
    }

    setVideoError(null);
    void onSubmit({
      name: values.name.trim(),
      image: values.image.trim(),
      video: trimmedVideo || null,
      category: values.category.trim(),
      textureStyle: values.textureStyle.trim(),
      length: values.length.trim(),
      color: values.color.trim(),
      stock: Number(values.stock),
      price: Number(values.price),
      description: values.description.trim(),
      featured: values.featured,
      status: values.status,
    }, imageFile);
  };

  const previewImage = useMemo(
    () => previewUrl || values.image.trim(),
    [previewUrl, values.image],
  );
  const previewVideo = useMemo(() => values.video.trim(), [values.video]);

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        <section className="rounded-[1.75rem] border border-border/60 bg-card/90 p-6 backdrop-blur">
          <h2 className="font-display text-2xl font-semibold text-foreground">Basic Information</h2>
          <p className="mt-1 font-body text-sm text-muted-foreground">
            Enter the main product details customers will see first.
          </p>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <Field label="Product Name" value={values.name} onChange={(value) => update("name", value)} required />
            <Field
              label="Category"
              value={values.category}
              onChange={(value) => update("category", value)}
              hint="Optional. Leave blank and the system will match an existing category from the product name if it finds one."
              listId="product-category-options"
            />
            <Field label="Texture / Style" value={values.textureStyle} onChange={(value) => update("textureStyle", value)} required />
            <div className="md:col-span-2">
              <label className="mb-1.5 block font-body text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Product Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const nextFile = event.target.files?.[0] ?? null;
                  setImageFile(nextFile);
                }}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:font-body file:text-xs file:uppercase file:tracking-[0.18em] file:text-primary-foreground focus:border-foreground"
              />
              <p className="mt-1.5 font-body text-xs text-muted-foreground">
                Upload an image from your device. {values.image ? "Leave blank to keep the current image." : "Required for new products."}
              </p>
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block font-body text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Product Video (Optional)
              </label>
              <div className="space-y-3 rounded-2xl border border-border/60 bg-background/60 p-4">
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={async () => {
                      setVideoError(null);
                      if (!isCloudinaryVideoWidgetConfigured()) {
                        setVideoError(
                          videoWidgetSetupMessage ||
                            "Video upload setup is incomplete. Add the Cloudinary widget environment variables and try again.",
                        );
                        return;
                      }
                      setIsUploadingVideo(true);
                      try {
                        const nextUrl = await openCloudinaryVideoWidget();
                        update("video", nextUrl);
                      } catch (error) {
                        if (error instanceof Error && error.message === "Video upload was cancelled") {
                          setVideoError(null);
                          return;
                        }
                        setVideoError(
                          error instanceof Error ? error.message : "Video upload failed",
                        );
                      } finally {
                        setIsUploadingVideo(false);
                      }
                    }}
                    disabled={isUploadingVideo}
                    className="rounded-full border border-border bg-card px-4 py-2 font-body text-xs uppercase tracking-[0.18em] text-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isUploadingVideo ? "Uploading Video..." : "Upload Product Video"}
                  </button>
                  {values.video ? (
                    <button
                      type="button"
                      onClick={() => {
                        update("video", "");
                        setVideoError(null);
                      }}
                      className="rounded-full border border-destructive/30 bg-destructive/10 px-4 py-2 font-body text-xs uppercase tracking-[0.18em] text-destructive transition-opacity hover:opacity-80"
                    >
                      Remove Video
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setShowManualVideoUrl((current) => !current)}
                    className="rounded-full border border-border bg-background px-4 py-2 font-body text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {showManualVideoUrl
                      ? "Hide Manual URL"
                      : "Advanced: Paste Video URL Manually"}
                  </button>
                </div>
                <p className="font-body text-xs text-muted-foreground">
                  {isCloudinaryVideoWidgetConfigured()
                    ? "Click Upload Product Video, choose a video, and we will save the Cloudinary video link automatically."
                    : videoWidgetSetupMessage}
                </p>
                {showManualVideoUrl ? (
                  <div>
                    <label className="mb-1.5 block font-body text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Paste Video URL Instead
                    </label>
                    <input
                      type="url"
                      value={values.video}
                      placeholder="https://res.cloudinary.com/..."
                      onChange={(event) => {
                        update("video", event.target.value);
                        setVideoError(
                          event.target.value.trim() && !isValidCloudinaryVideoUrl(event.target.value)
                            ? "Enter a valid Cloudinary video URL."
                            : null,
                        );
                      }}
                      className="w-full rounded-2xl border border-border bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-foreground"
                    />
                    <p className="mt-1.5 font-body text-xs text-muted-foreground">
                      Use this only if you already have a Cloudinary video URL and need a manual backup.
                    </p>
                  </div>
                ) : null}
                {videoError ? (
                  <p className="font-body text-xs text-destructive">{videoError}</p>
                ) : null}
              </div>
            </div>
          </div>
          {categoryOptions.length > 0 ? (
            <datalist id="product-category-options">
              {categoryOptions.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
          ) : null}
        </section>

        <section className="rounded-[1.75rem] border border-border/60 bg-card/90 p-6 backdrop-blur">
          <h2 className="font-display text-2xl font-semibold text-foreground">Options & Pricing</h2>
          <p className="mt-1 font-body text-sm text-muted-foreground">
            Add lengths, colours, stock count, and price. You can use comma-separated values for multiple options.
          </p>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <Field label="Length" value={values.length} onChange={(value) => update("length", value)} required hint='Example: 18", 22", 26"' />
            <Field label="Color" value={values.color} onChange={(value) => update("color", value)} required hint="Example: Natural Black, Brown" />
            <Field label="Stock" type="number" value={values.stock} onChange={(value) => update("stock", value)} required />
            <Field label="Base Price (GHS)" type="number" value={values.price} onChange={(value) => update("price", value)} required />
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-border/60 bg-card/90 p-6 backdrop-blur">
          <h2 className="font-display text-2xl font-semibold text-foreground">Status & Description</h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block font-body text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Stock Status
              </label>
              <select
                value={values.status}
                onChange={(e) => update("status", e.target.value as ProductStatus)}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-foreground"
              >
                <option value="inStock">In Stock</option>
                <option value="outOfStock">Out of Stock</option>
                <option value="archived">Archived</option>
                <option value="draft">Draft</option>
              </select>
              <p className="mt-1.5 font-body text-xs text-muted-foreground">
                Archived and Draft products stay in your catalog but are hidden from the storefront.
              </p>
            </div>

            <div className="flex items-center rounded-2xl border border-border/60 bg-background/60 px-4 py-4">
              <input
                id="featured"
                type="checkbox"
                checked={values.featured}
                disabled={!canBeFeatured || (featuredLimitReached && !values.featured)}
                onChange={(e) => update("featured", e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              <div className="ml-3">
                <label htmlFor="featured" className="font-body text-sm text-foreground">
                  Mark this product as featured
                </label>
                <p className="mt-1 font-body text-xs text-muted-foreground">
                  {!canBeFeatured
                    ? "Only In Stock or Out of Stock products can be featured publicly."
                    : featuredLimitReached && !values.featured
                    ? "You already have 3 featured products on the homepage."
                    : `${Math.max(3 - featuredProductCount, 0)} of 3 featured slots available.`}
                </p>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block font-body text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Description
              </label>
              <textarea
                required
                rows={5}
                value={values.description}
                onChange={(e) => update("description", e.target.value)}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-foreground"
              />
            </div>
          </div>
        </section>
      </div>

      <div className="space-y-6">
        <section className="rounded-[1.75rem] border border-border/60 bg-card/90 p-6 backdrop-blur xl:sticky xl:top-28">
          <h2 className="font-display text-2xl font-semibold text-foreground">Preview</h2>
          <p className="mt-1 font-body text-sm text-muted-foreground">
            Quick check before you save the product.
          </p>

          <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-border/60 bg-background/70">
            {previewImage ? (
              <img src={previewImage} alt={values.name || "Product preview"} className="aspect-[4/5] w-full object-cover" />
            ) : (
              <div className="flex aspect-[4/5] items-center justify-center px-6 text-center font-body text-sm text-muted-foreground">
                Product image preview will appear here.
              </div>
            )}
          </div>
          <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-border/60 bg-background/70">
            {previewVideo ? (
              <video
                src={previewVideo}
                controls
                muted
                playsInline
                className="aspect-video w-full object-cover"
              />
            ) : (
              <div className="flex aspect-video items-center justify-center px-6 text-center font-body text-sm text-muted-foreground">
                Optional product video preview will appear here.
              </div>
            )}
          </div>

          <div className="mt-5 space-y-3">
            <div>
              <p className="font-display text-xl font-semibold text-foreground">
                {values.name || "Product name"}
              </p>
              <p className="mt-1 font-body text-sm text-muted-foreground">
                {values.textureStyle || "Texture"} | {values.length || "Length"} | {values.color || "Color"}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-border px-3 py-1 font-body text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {values.category || "Auto-detect"}
              </span>
              <span
                className={`rounded-full px-3 py-1 font-body text-[11px] uppercase tracking-[0.18em] ${
                  values.status === "inStock"
                    ? "bg-primary text-primary-foreground"
                    : values.status === "outOfStock"
                      ? "bg-secondary text-foreground"
                      : "border border-border bg-background text-muted-foreground"
                }`}
              >
                {getProductStatusLabel(values.status)}
              </span>
              {values.featured ? (
                <span className="rounded-full bg-accent px-3 py-1 font-body text-[11px] uppercase tracking-[0.18em] text-accent-foreground">
                  Featured
                </span>
              ) : null}
            </div>

            <div className="rounded-2xl border border-border/60 bg-background/60 p-4">
              <p className="font-body text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Base Price (GHS)
              </p>
              <p className="mt-2 font-display text-3xl font-semibold text-foreground">
                GHS {values.price || "0"}
              </p>
              <p className="mt-2 font-body text-sm text-muted-foreground">
                Stock: {values.stock || "0"}
              </p>
            </div>
            {imageFile ? (
              <p className="font-body text-xs text-muted-foreground">
                Selected file: {imageFile.name}
              </p>
            ) : null}
            {values.video ? (
              <p className="font-body text-xs text-muted-foreground">
                Video URL ready to save.
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            className="mt-6 w-full rounded-full bg-primary px-6 py-3.5 font-body text-sm uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-90"
          >
            {submitLabel}
          </button>
        </section>
      </div>
    </form>
  );
};

const Field = ({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  className = "",
  hint,
  listId,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  className?: string;
  hint?: string;
  listId?: string;
}) => (
  <div className={className}>
    <label className="mb-1.5 block font-body text-xs uppercase tracking-[0.18em] text-muted-foreground">
      {label}
    </label>
    <input
      type={type}
      required={required}
      value={value}
      list={listId}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-2xl border border-border bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-foreground"
    />
    {hint ? <p className="mt-1.5 font-body text-xs text-muted-foreground">{hint}</p> : null}
  </div>
);

export default ProductForm;
