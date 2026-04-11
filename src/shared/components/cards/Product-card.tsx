"use client";

import { Eye, Heart, ShoppingBag, Star, Zap, GitCompare } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useStore } from "@/store";
import useUser from "@/hooks/useUser";
import ProductDetailsCard from "./product-details.card";
import useDeviceTracking from "@/hooks/useDeviceTracking";
import useLocationTracking from "@/hooks/useLocationTracking";
import { useCurrencyFormat } from "@/hooks/useCurrencyFormat";
import { useProductComparison } from "@/hooks/useProductComparison";
import { toast } from "sonner";

const ProductCard = ({ product, isEvent }: { product: any; isEvent?: boolean }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [open, setOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { user } = useUser();
  const router = useRouter();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const { formatPrice } = useCurrencyFormat();

  const cart = useStore((s) => s.cart);
  const wishlist = useStore((s) => s.wishlist);
  const wishlistIds = useStore((s) => s.wishlistIds);
  const addToCart = useStore((s) => s.addToCart);
  const addToWishlist = useStore((s) => s.addToWishlist);
  const removeFromWishlist = useStore((s) => s.removeFromWishlist);
  const removeFromCart = useStore((s) => s.removeFromCart);
  const syncWithServer = useStore((s) => s.syncWithServer);

  const isWishListed = wishlist.some((i: any) => i.id === product?.id) || wishlistIds.includes(product?.id);
  const isInCart = cart.some((i: any) => i.id === product?.id);

  // Compare
  const { addToCompare, removeFromCompare, isInCompare, canAddMore } = useProductComparison();
  const isCompared = product ? isInCompare(product.id) : false;

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product) return;
    if (isCompared) {
      removeFromCompare(product.id);
      toast.info("Removed from comparison");
    } else if (!canAddMore) {
      toast.warning("You can compare up to 4 products. Remove one first.");
    } else {
      addToCompare({
        id: product.id,
        slug: product.slug || product.id,
        title: product.title,
        image: product.images?.[0]?.url || "",
        price: product.regular_price || product.sale_price,
        salePrice: product.sale_price,
        category: product.category || "",
        brand: product.brand || "",
        ratings: product.ratings || 0,
        stock: product.stock || 0,
        shopName: product.Shop?.name || product.shops?.name || "",
        colors: product.colors || [],
        sizes: product.sizes || [],
        warranty: product.warranty || "",
      });
      toast.success("Added to comparison!");
    }
  };

  useEffect(() => {
    if (user?.id) syncWithServer(user);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (!isEvent || !product?.ending_date) return;
    const tick = () => {
      const diff = new Date(product.ending_date).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("Expired"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff / 3600000) % 24);
      const m = Math.floor((diff / 60000) % 60);
      setTimeLeft(`${d}d ${h}h ${m}m`);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [isEvent, product?.ending_date]);

  if (!product) return null;

  const discount = product?.regular_price > product?.sale_price
    ? Math.round(((product.regular_price - product.sale_price) / product.regular_price) * 100)
    : 0;

  const rating = product?.ratings ?? 0;
  const fullStars = Math.floor(rating);
  const imgSrc = !imgError && product?.images?.[0]?.url ? product.images[0].url : null;
  // Use unoptimized for non-ImageKit URLs to avoid Next.js proxy timeout errors
  const isImageKit = imgSrc?.includes('ik.imagekit.io');
  const isPlaceholder = imgSrc?.includes('example.com') || imgSrc?.includes('placeholder');
  const safeImgSrc = isPlaceholder ? null : imgSrc;

  return (
    <>
      <div className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-teal-200 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col card-hover">

        {/* Image */}
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 aspect-square">
          <Link href={`/product/${product?.slug || product?.id}`}>
            {safeImgSrc ? (
              <Image
                src={safeImgSrc}
                alt={product?.title || "Product"}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                unoptimized={!isImageKit}
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingBag className="w-12 h-12 text-gray-300" />
              </div>
            )}
          </Link>

          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {discount >= 10 && (
              <span className="flex items-center gap-0.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-md">
                <Zap className="w-2.5 h-2.5" />-{discount}%
              </span>
            )}
            {isEvent && (
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-md">
                OFFER
              </span>
            )}
            {product?.stock === 0 && (
              <span className="bg-gray-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">
                SOLD OUT
              </span>
            )}
            {product?.stock > 0 && product?.stock <= 5 && (
              <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900 text-[10px] font-black px-2 py-0.5 rounded-lg shadow-md">
                ONLY {product.stock} LEFT
              </span>
            )}
          </div>

          {/* Quick actions */}
          <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-10 opacity-0 group-hover:opacity-100 translate-x-3 group-hover:translate-x-0 transition-all duration-300">
            <button
              onClick={() => isWishListed
                ? removeFromWishlist(product.id, user, location, deviceInfo)
                : addToWishlist({ ...product, quantity: 1 }, user, location, deviceInfo)}
              className={`w-8 h-8 rounded-xl shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 ${
                isWishListed
                  ? 'bg-gradient-to-br from-rose-500 to-pink-600 text-white'
                  : 'bg-white/95 text-gray-500 hover:text-rose-500'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isWishListed ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleCompare}
              title={isCompared ? "Remove from compare" : !canAddMore ? "Compare list full (max 4)" : "Add to compare"}
              className={`w-8 h-8 rounded-xl shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 ${
                isCompared
                  ? 'bg-gradient-to-br from-purple-500 to-violet-600 text-white'
                  : !canAddMore
                  ? 'bg-white/95 text-gray-300 cursor-not-allowed'
                  : 'bg-white/95 text-gray-500 hover:text-purple-600'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setOpen(true)}
              className="w-8 h-8 rounded-xl bg-white/95 shadow-lg flex items-center justify-center text-gray-500 hover:text-teal-600 hover:scale-110 active:scale-95 transition-all duration-200"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Event timer */}
          {isEvent && timeLeft && (
            <div className="absolute bottom-2 left-2 right-2 glass-dark text-white text-[10px] font-bold text-center py-1.5 rounded-xl">
              ⏱ {timeLeft} left
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col flex-1 p-3">
          {/* Shop name */}
          {product?.Shop?.name && (
            <Link href={`/shop/${product?.Shop?.id}`}
              className="text-[10px] text-teal-600 font-bold hover:text-teal-800 truncate mb-1 uppercase tracking-wide transition-colors">
              {product.Shop.name}
            </Link>
          )}

          {/* Title */}
          <Link href={`/product/${product?.slug || product?.id}`}>
            <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug hover:text-teal-700 transition-colors mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {product?.title}
            </h3>
          </Link>

          {/* Stars */}
          {rating > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} className={`w-3 h-3 ${s <= fullStars ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'}`} />
                ))}
              </div>
              <span className="text-[10px] text-gray-400 font-medium">({rating.toFixed(1)})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between mt-auto mb-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {formatPrice(product?.sale_price)}
              </span>
              {discount > 0 && (
                <span className="text-xs text-gray-400 line-through font-medium">
                  {formatPrice(product?.regular_price)}
                </span>
              )}
            </div>
            {product?.totalSales > 0 && (
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-full">
                {product.totalSales} sold
              </span>
            )}
          </div>

          {/* Add to cart */}
          <button
            onClick={() => isInCart
              ? removeFromCart(product.id, user, location, deviceInfo)
              : addToCart({ ...product, quantity: 1 }, user, location, deviceInfo)}
            disabled={product?.stock === 0}
            className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 ${
              product?.stock === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : isInCart
                ? 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-500 hover:text-white hover:border-rose-500'
                : 'text-white shadow-md hover:shadow-lg hover:scale-[1.02]'
            }`}
            style={product?.stock !== 0 && !isInCart ? { background: "linear-gradient(135deg, #0f766e, #14b8a6)" } : {}}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            {product?.stock === 0 ? 'Out of Stock' : isInCart ? 'Remove' : 'Add to Cart'}
          </button>

          {/* Compare button */}
          <button
            onClick={handleCompare}
            disabled={!isCompared && !canAddMore}
            title={!isCompared && !canAddMore ? "Compare list full — remove a product first" : ""}
            className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95 mt-1.5 ${
              isCompared
                ? 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
                : !canAddMore
                ? 'bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed'
                : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            {isCompared ? 'Comparing ✓' : !canAddMore ? 'Compare Full (4/4)' : 'Compare'}
          </button>
        </div>
      </div>

      {open && <ProductDetailsCard data={product} setOpen={setOpen} />}
    </>
  );
};

export default ProductCard;
