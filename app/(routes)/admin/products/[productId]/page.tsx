import prismadb from "@/lib/prismadb";
import type { Image, Product } from "@prisma/client";
import { ProductForm } from "./components/product-form";

export interface FormattedProduct extends Omit<Product, "priceHT" | "priceTTC"> {
  priceHT: number;
  priceTTC: number;
}

const ProductPage = async ({ params }: { params: { productId: string } }) => {
  const product = await prismadb.product.findUnique({
    where: {
      id: params.productId,
    },
    include: {
      images: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  const categories = await prismadb.category.findMany();

  // const accessibleImages = await Promise.all(
  //   (product?.images || []).filter(Boolean).map(async (image) => {
  //     const check = await checkIfUrlAccessible(image.url);
  //     if (check) {
  //       return image;
  //     }
  //   })
  // );
  const formattedProduct: (FormattedProduct & { images: Image[] }) | null = product
    ? {
        ...product,
        // images: accessibleImages.filter(
        //   (image) => image !== undefined
        // ) as Image[],
        priceHT: Number.parseFloat(String(product.priceHT)),
        priceTTC: Number.parseFloat(String(product.priceHT)),
      }
    : null;

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductForm categories={categories} initialData={formattedProduct} />
      </div>
    </div>
  );
};

export default ProductPage;
