import { useState } from "react";
import type { AdminProductInput } from "@/context/AdminProductsContext";
import type { ProductStatus } from "@/types/product";

export interface ProductFormValues {
  name: string;
  image: string;
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
  submitLabel,
  onSubmit,
}: {
  initialValues: ProductFormValues;
  submitLabel: string;
  onSubmit: (values: AdminProductInput) => void;
}) => {
  const [values, setValues] = useState<ProductFormValues>(initialValues);

  const update = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: values.name.trim(),
      image: values.image.trim(),
      category: values.category.trim(),
      textureStyle: values.textureStyle.trim(),
      length: values.length.trim(),
      color: values.color.trim(),
      stock: Number(values.stock),
      price: Number(values.price),
      description: values.description.trim(),
      featured: values.featured,
      status: values.status,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-border/60 bg-card/90 p-6 backdrop-blur"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Product Name" value={values.name} onChange={(value) => update("name", value)} required />
        <Field label="Category" value={values.category} onChange={(value) => update("category", value)} required />
        <Field label="Texture / Style" value={values.textureStyle} onChange={(value) => update("textureStyle", value)} required />
        <Field label="Length" value={values.length} onChange={(value) => update("length", value)} required />
        <Field label="Color" value={values.color} onChange={(value) => update("color", value)} required />
        <Field label="Image URL / Path" value={values.image} onChange={(value) => update("image", value)} required />
        <Field label="Stock" type="number" value={values.stock} onChange={(value) => update("stock", value)} required />
        <Field label="Price" type="number" value={values.price} onChange={(value) => update("price", value)} required />

        <div>
          <label className="mb-1.5 block font-body text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Stock Status
          </label>
          <select
            value={values.status}
            onChange={(e) => update("status", e.target.value as ProductStatus)}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-foreground"
          >
            <option value="inStock">In Stock</option>
            <option value="outOfStock">Out of Stock</option>
          </select>
        </div>

        <div className="flex items-center gap-3 pt-7">
          <input
            id="featured"
            type="checkbox"
            checked={values.featured}
            onChange={(e) => update("featured", e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          <label htmlFor="featured" className="font-body text-sm text-foreground">
            Mark as featured
          </label>
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
            className="w-full rounded-xl border border-border bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-foreground"
          />
        </div>
      </div>

      <button
        type="submit"
        className="rounded bg-primary px-6 py-3 font-body text-sm uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-90"
      >
        {submitLabel}
      </button>
    </form>
  );
};

const Field = ({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) => (
  <div>
    <label className="mb-1.5 block font-body text-xs uppercase tracking-[0.18em] text-muted-foreground">
      {label}
    </label>
    <input
      type={type}
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-border bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-foreground"
    />
  </div>
);

export default ProductForm;
