import { useEffect, useMemo, useState } from "react";
import type { AdminProductInput } from "@/context/AdminProductsContext";
import { useAdminProducts } from "@/context/AdminProductsContext";
import type { ProductStatus } from "@/types/product";

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
    videoFile: File | null,
  ) => void | Promise<void>;
}) => {
  const { products } = useAdminProducts();
  const [values, setValues] = useState<ProductFormValues>(initialValues);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>("");
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

  useEffect(() => {
    if (!videoFile) {
      setVideoPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(videoFile);
    setVideoPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [videoFile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void onSubmit({
      name: values.name.trim(),
      image: values.image.trim(),
      video: values.video.trim() || null,
      category: values.category.trim(),
      textureStyle: values.textureStyle.trim(),
      length: values.length.trim(),
      color: values.color.trim(),
      stock: Number(values.stock),
      price: Number(values.price),
      description: values.description.trim(),
      featured: values.featured,
      status: values.status,
    }, imageFile, videoFile);
  };

  const previewImage = useMemo(
    () => previewUrl || values.image.trim(),
    [previewUrl, values.image],
  );
  const previewVideo = useMemo(
    () => videoPreviewUrl || values.video.trim(),
    [videoPreviewUrl, values.video],
  );

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
                Product Video
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={(event) => {
                  const nextFile = event.target.files?.[0] ?? null;
                  setVideoFile(nextFile);
                }}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:font-body file:text-xs file:uppercase file:tracking-[0.18em] file:text-primary-foreground focus:border-foreground"
              />
              <p className="mt-1.5 font-body text-xs text-muted-foreground">
                Optional. Upload a short product video for the product details page.
                {values.video ? " Leave blank to keep the current video." : ""}
              </p>
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
              </select>
            </div>

            <div className="flex items-center rounded-2xl border border-border/60 bg-background/60 px-4 py-4">
              <input
                id="featured"
                type="checkbox"
                checked={values.featured}
                disabled={featuredLimitReached && !values.featured}
                onChange={(e) => update("featured", e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              <div className="ml-3">
                <label htmlFor="featured" className="font-body text-sm text-foreground">
                  Mark this product as featured
                </label>
                <p className="mt-1 font-body text-xs text-muted-foreground">
                  {featuredLimitReached && !values.featured
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
                    : "bg-secondary text-foreground"
                }`}
              >
                {values.status === "inStock" ? "In Stock" : "Out of Stock"}
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
            {videoFile ? (
              <p className="font-body text-xs text-muted-foreground">
                Selected video: {videoFile.name}
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
