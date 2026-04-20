import { Link, useNavigate, useParams } from "react-router-dom";
import AdminShell from "@/components/admin/AdminShell";
import ProductForm from "@/components/admin/ProductForm";
import { useAdminProducts } from "@/context/AdminProductsContext";

const EditProduct = () => {
  const navigate = useNavigate();
  const { id = "" } = useParams();
  const { getProductById, updateProduct } = useAdminProducts();
  const product = getProductById(id);

  if (!product) {
    return (
      <AdminShell title="Edit Product" description="Update the selected product details.">
        <div className="rounded-2xl border border-border/60 bg-card/90 p-8 text-center backdrop-blur">
          <h2 className="font-display text-2xl font-semibold text-foreground">Product not found</h2>
          <p className="mt-2 font-body text-sm text-muted-foreground">
            The product you are trying to edit does not exist.
          </p>
          <Link
            to="/admin/products"
            className="mt-6 inline-block rounded bg-primary px-5 py-3 font-body text-xs uppercase tracking-[0.2em] text-primary-foreground"
          >
            Back to Products
          </Link>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title="Edit Product"
      description="Update the selected product details."
    >
      <div className="mx-auto max-w-3xl">
        <ProductForm
          initialValues={{
            name: product.name,
            image: product.image,
            category: product.category,
            textureStyle: product.textureStyle,
            length: product.length,
            color: product.color,
            stock: String(product.stock),
            price: String(product.price),
            description: product.description,
            featured: product.featured,
            status: product.status,
          }}
          submitLabel="Update Product"
          onSubmit={(values) => {
            updateProduct(product.id, values);
            navigate("/admin/products");
          }}
        />
      </div>
    </AdminShell>
  );
};

export default EditProduct;
