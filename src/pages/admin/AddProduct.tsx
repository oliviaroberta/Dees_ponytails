import { useNavigate } from "react-router-dom";
import { useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import ProductForm from "@/components/admin/ProductForm";
import { useAdminProducts } from "@/context/AdminProductsContext";

const AddProduct = () => {
  const navigate = useNavigate();
  const { addProduct, uploadProductImage } = useAdminProducts();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <AdminShell
      title="Add Product"
      description="Create a new product entry for the store."
    >
      <div className="mx-auto max-w-3xl">
        {error ? (
          <div className="mb-4 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 font-body text-sm text-destructive">
            {error}
          </div>
        ) : null}
        <ProductForm
          initialValues={{
            name: "",
            image: "",
            category: "Ponytail Extension",
            textureStyle: "",
            length: "",
            color: "Natural Black",
            stock: "",
            price: "",
            description: "",
            featured: false,
            status: "inStock",
          }}
          currentProductId={undefined}
          submitLabel={isSubmitting ? "Saving..." : "Save Product"}
          onSubmit={async (values, imageFile) => {
            setError(null);
            setIsSubmitting(true);
            try {
              if (!imageFile) {
                throw new Error("Product image is required");
              }

              const imageUrl = await uploadProductImage(imageFile);
              await addProduct({
                ...values,
                image: imageUrl,
              });
              navigate("/admin/products");
            } catch (submitError) {
              setError(submitError instanceof Error ? submitError.message : "Failed to save product");
            } finally {
              setIsSubmitting(false);
            }
          }}
        />
      </div>
    </AdminShell>
  );
};

export default AddProduct;
