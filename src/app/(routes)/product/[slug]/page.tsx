import React from "react"
import { Metadata } from "next"
import ProductDetails from "../../../../shared/modules/product/product-details"

async function fetchProductDetails(slug: string) {
  // Use internal server URL for SSR, fallback to public URL
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://127.0.0.1:8080";
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(
      `${baseUrl}/api/products?slug=${slug}`,
      { 
        cache: "no-store",
        signal: controller.signal,
      }
    );
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error("Failed to fetch product:", response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    // API returns array; find by slug
    const products = data.products || [];
    return products.find((p: any) => p.slug === slug) || null;
  } catch (error: any) {
    // Log more details about the error
    if (error.name === 'AbortError') {
      console.error("Request timed out fetching product details");
    } else if (error.cause?.code === 'ECONNREFUSED') {
      console.error("Connection refused - is the API server running at", baseUrl, "?");
    } else {
      console.error("Error fetching product details:", error.message || error);
    }
    return null;
  }
}

async function fetchSimilarProducts(category: string, currentProductId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://127.0.0.1:8080";
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(
      `${baseUrl}/api/products?category=${encodeURIComponent(category)}&limit=12`,
      { 
        cache: "no-store",
        signal: controller.signal,
      }
    );
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const products = data.products || [];

    // Filter by same category, excluding current product
    let similar = products.filter(
      (p: any) => p.category === category && p.id !== currentProductId
    );

    // If not enough products in same category, add other products
    if (similar.length < 5) {
      const otherProducts = products.filter(
        (p: any) => p.id !== currentProductId && !similar.some((s: any) => s.id === p.id)
      );
      similar = [...similar, ...otherProducts].slice(0, 10);
    }

    return similar.slice(0, 10);
  } catch (error: any) {
    console.error("Error fetching similar products:", error.message || error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductDetails(slug);

  return {
    title: `${product?.title || "Product"} | Easy-Shop Marketplace`,
    description:
      product?.description ||
      "Discover high quality products and services on E-Shop Marketplace.",
    openGraph: {
      title: product?.title,
      description: product?.description || "",
      images: [product?.images?.[0]?.url || "/default-image.jpg"],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product?.title,
      description: product?.description || "",
      images: [product?.images?.[0]?.url || "/default-image.jpg"],
    },
  };
}

const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const productDetails = await fetchProductDetails(slug);

  // Fetch similar products based on category
  const similarProducts = productDetails
    ? await fetchSimilarProducts(productDetails.category, productDetails.id)
    : [];

  return (
    <ProductDetails
      productDetails={productDetails}
      similarProducts={similarProducts}
    />
  );
};

export default Page