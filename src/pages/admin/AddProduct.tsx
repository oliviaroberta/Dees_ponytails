import { useNavigate } from "react-router-dom";
import AdminShell from "@/components/admin/AdminShell";
import ProductForm from "@/components/admin/ProductForm";
import { useAdminProducts } from "@/context/AdminProductsContext";

const AddProduct = () => {
  const navigate = useNavigate();
  const { addProduct } = useAdminProducts();

  return (
    <AdminShell
      title="Add Product"
      description="Create a new product entry for the store."
    >
      <div className="mx-auto max-w-3xl">
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
          submitLabel="Save Product"
          onSubmit={(values) => {
            addProduct(values);
            navigate("/admin/products");
          }}
        />
      </div>
    </AdminShell>
  );
};

export default AddProduct;
