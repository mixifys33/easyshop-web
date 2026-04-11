"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/store";
import useUser from "@/hooks/useUser";
import { 
  Calendar, Clock, TrendingUp, Package, Star, ShoppingCart, Heart,
  ChevronLeft, ChevronRight, Share2, Bell, Filter, Grid, List,
  Zap, Gift, Tag, Truck, Shield, ArrowLeft, Eye, Users, Percent
} from "lucide-react";

interface EventProduct {
  _id: string;
  productId: string;
  discountPct: number;
  price: number;
  rating: number;
  deliveryDays: number;
  category: string;
  brand: string;
  status: string;
  flashSlotStart?: string;
  flashSlotEnd?: string;
  inventoryLock?: boolean;
  product?: {
    id: string;
    name: string;
    images: string[];
    originalPrice: number;
    stock: number;
    seller?: { name: string; id: string };
  };
}

interface LayoutSection {
  id: string;
  type: "hero" | "flash_grid" | "product_grid" | "countdown" | "coupons" | "category_banner" | "testimonials";
  order: number;
  config?: any;
}

interface EventDetail {
  event: {
    _id: string;
    title: string;
    slug: string;
    description: string;
    type: string;
    banners: string[];
    schedule: { start: string; end: string; flashSlots?: any[] };
    analytics: { views: number; sales: number; addToCart: number; stockUsed: number };
    rules: { minDiscountPct: number; maxDeliveryDays: number; purchaseLimitPerCustomer?: number };
    layoutConfig?: { sections: LayoutSection[] };
    target?: { regions: string[]; categories: string[] };
  };
  products: EventProduct[];
  timers: { startsAt: string; endsAt: string };
  flash?: any[];
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const addToCart = useStore((state: any) => state.addToCart);
  
  const [eventData, setEventData] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [currentBanner, setCurrentBanner] = useState(0);
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("discount");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    if (params.slug) fetchEventDetail();
  }, [params.slug]);

  useEffect(() => {
    if (!eventData) return;
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(eventData.timers.endsAt).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
        return;
      }

      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [eventData]);

  useEffect(() => {
    // Banner auto-rotation
    if (eventData && eventData.event.banners.length > 1) {
      const timer = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % eventData.event.banners.length);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [eventData]);

  const fetchEventDetail = async () => {
    try {
      const res = await fetch(`/api/events/slug/${params.slug}`);
      const data = await res.json();
      if (data.success) {
        setEventData(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch event", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: EventProduct) => {
    if (!product.product) return;
    
    const cartItem = {
      id: product.productId,
      name: product.product.name,
      sale_price: product.price,
      original_price: product.product.originalPrice,
      images: product.product.images,
      quantity: 1,
      discount: product.discountPct,
      eventId: eventData?.event._id,
    };
    
    addToCart(cartItem, user);
    
    // Track analytics
    fetch("/api/events/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId: eventData?.event._id, action: "add_to_cart", productId: product.productId }),
    }).catch(() => {});
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => 
      prev.includes(productId) 
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const shareEvent = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: eventData?.event.title, url });
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  // Get unique categories from products
  const categories = eventData 
    ? [...new Set(eventData.products.map((p) => p.category).filter(Boolean))]
    : [];

  // Filter and sort products
  const filteredProducts = eventData?.products
    .filter((p) => p.status === "approved")
    .filter((p) => filterCategory === "all" || p.category === filterCategory)
    .sort((a, b) => {
      if (sortBy === "discount") return b.discountPct - a.discountPct;
      if (sortBy === "price_low") return a.price - b.price;
      if (sortBy === "price_high") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return 0;
    }) || [];

  // Get layout sections (use default if not customized)
  const layoutSections: LayoutSection[] = eventData?.event.layoutConfig?.sections || [
    { id: "hero", type: "hero", order: 1 },
    { id: "countdown", type: "countdown", order: 2 },
    { id: "product_grid", type: "product_grid", order: 3 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-6">The event you're looking for doesn't exist or has ended.</p>
          <Link href="/events" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Browse All Events
          </Link>
        </div>
      </div>
    );
  }

  const { event, products } = eventData;
  const isEnded = new Date(event.schedule.end) < new Date();
  const maxDiscount = Math.max(...products.map((p) => p.discountPct), 0);

  // Render sections based on layout config
  const renderSection = (section: LayoutSection) => {
    switch (section.type) {
      case "hero":
        return (
          <div key={section.id} className="relative h-[280px] sm:h-[350px] md:h-[450px] lg:h-[500px] overflow-hidden">
            {event.banners.map((banner, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-700 ${
                  idx === currentBanner ? "opacity-100" : "opacity-0"
                }`}
              >
                <img src={banner} alt={event.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              </div>
            ))}
            
            {/* Banner Navigation */}
            {event.banners.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentBanner((prev) => (prev - 1 + event.banners.length) % event.banners.length)}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/40 transition active:scale-95"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </button>
                <button
                  onClick={() => setCurrentBanner((prev) => (prev + 1) % event.banners.length)}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/40 transition active:scale-95"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </button>
                <div className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 sm:gap-2">
                  {event.banners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentBanner(idx)}
                      className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition ${idx === currentBanner ? "bg-white w-6 sm:w-8" : "bg-white/50"}`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Event Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-10 z-10">
              <div className="container mx-auto">
                <Link href="/events" className="inline-flex items-center gap-1.5 sm:gap-2 text-white/80 hover:text-white mb-2 sm:mb-4 transition text-sm sm:text-base">
                  <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Back to Events
                </Link>
                <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-1.5 sm:mb-3 line-clamp-2">{event.title}</h1>
                <p className="text-sm sm:text-base md:text-lg text-white/90 max-w-3xl mb-3 sm:mb-6 line-clamp-2 hidden sm:block">{event.description}</p>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                  <button onClick={shareEvent} className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition text-sm sm:text-base active:scale-95">
                    <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Share
                  </button>
                  <button className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition text-sm sm:text-base active:scale-95">
                    <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Notify Me
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case "countdown":
        return (
          <div key={section.id} className={`py-4 sm:py-6 md:py-8 ${isEnded ? "bg-gray-500" : "bg-gradient-to-r from-red-500 to-orange-500"}`}>
            <div className="container mx-auto px-3 sm:px-4">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className={`p-2 sm:p-3 rounded-full ${isEnded ? "bg-white/20" : "bg-white/20 animate-pulse"}`}>
                    <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div className="text-white">
                    <p className="text-xs sm:text-sm opacity-90">{isEnded ? "Event Ended" : "Event Ends In"}</p>
                    {!isEnded && (
                      <div className="flex items-center gap-1.5 sm:gap-3 mt-1">
                        {[
                          { value: countdown.days, label: "Days" },
                          { value: countdown.hours, label: "Hrs" },
                          { value: countdown.minutes, label: "Min" },
                          { value: countdown.seconds, label: "Sec" },
                        ].map((item, idx) => (
                          <div key={idx} className="text-center">
                            <div className="bg-white/20 backdrop-blur-sm rounded-md sm:rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 min-w-[40px] sm:min-w-[60px]">
                              <span className="text-lg sm:text-2xl md:text-3xl font-bold">{String(item.value).padStart(2, "0")}</span>
                            </div>
                            <span className="text-[10px] sm:text-xs mt-0.5 sm:mt-1 block opacity-80">{item.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3 sm:gap-6 text-white text-center">
                  <div className="px-2 sm:px-4">
                    <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-lg sm:text-2xl font-bold">{event.analytics.views.toLocaleString()}</span>
                    </div>
                    <span className="text-[10px] sm:text-xs opacity-80">Views</span>
                  </div>
                  <div className="w-px h-8 sm:h-12 bg-white/30" />
                  <div className="px-2 sm:px-4">
                    <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                      <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-lg sm:text-2xl font-bold">{event.analytics.sales.toLocaleString()}</span>
                    </div>
                    <span className="text-[10px] sm:text-xs opacity-80">Sales</span>
                  </div>
                  <div className="w-px h-8 sm:h-12 bg-white/30" />
                  <div className="px-2 sm:px-4">
                    <div className="flex items-center justify-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                      <Percent className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-lg sm:text-2xl font-bold">{maxDiscount}%</span>
                    </div>
                    <span className="text-[10px] sm:text-xs opacity-80">Off</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "flash_grid":
        // Flash sale products with time slots
        const flashProducts = products.filter((p) => p.flashSlotStart && p.flashSlotEnd);
        if (flashProducts.length === 0) return null;
        
        return (
          <div key={section.id} className="bg-gradient-to-r from-red-500 to-orange-500 py-8">
            <div className="container mx-auto px-4">
              <div className="flex items-center gap-3 mb-6">
                <Zap className="w-8 h-8 text-white animate-pulse" />
                <h2 className="text-2xl font-bold text-white">Flash Deals</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {flashProducts.slice(0, 4).map((product) => (
                  <div key={product._id} className="bg-white rounded-xl p-4">
                    <div className="relative h-32 mb-3">
                      {product.product?.images?.[0] ? (
                        <img src={product.product.images[0]} alt="" className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                        -{product.discountPct}%
                      </div>
                    </div>
                    <h3 className="font-medium text-gray-900 text-sm line-clamp-1">{product.product?.name}</h3>
                    <p className="text-lg font-bold text-gray-900">UGX {product.price.toLocaleString()}</p>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full mt-2 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition"
                    >
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "product_grid":
        return (
          <div key={section.id} className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
              <div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Event Products</h2>
                <p className="text-xs sm:text-sm text-gray-600">{filteredProducts.length} products available</p>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                {categories.length > 0 && (
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                )}
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="discount">Best Discount</option>
                  <option value="price_low">Low to High</option>
                  <option value="price_high">High to Low</option>
                  <option value="rating">Best Rated</option>
                </select>

                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 active:scale-95 transition ${viewMode === "grid" ? "bg-gray-100" : "hover:bg-gray-50"}`}
                  >
                    <Grid className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 active:scale-95 transition ${viewMode === "list" ? "bg-gray-100" : "hover:bg-gray-50"}`}
                  >
                    <List className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-4 md:gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product._id}
                    className="group bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                  >
                    <div className="relative aspect-square overflow-hidden">
                      {product.product?.images?.[0] ? (
                        <img
                          src={product.product.images[0]}
                          alt={product.product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <Package className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Discount Badge */}
                      {product.discountPct > 0 && (
                        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 px-1.5 sm:px-2.5 py-0.5 sm:py-1 bg-red-500 text-white text-xs sm:text-sm font-bold rounded-md sm:rounded-lg shadow-lg">
                          -{product.discountPct}%
                        </div>
                      )}
                      
                      {/* Wishlist Button */}
                      <button
                        onClick={(e) => { e.preventDefault(); toggleWishlist(product.productId); }}
                        className={`absolute top-2 sm:top-3 right-2 sm:right-3 p-1.5 sm:p-2 rounded-full shadow-lg transition active:scale-95 ${
                          wishlist.includes(product.productId)
                            ? "bg-red-500 text-white"
                            : "bg-white text-gray-600 hover:text-red-500"
                        }`}
                      >
                        <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${wishlist.includes(product.productId) ? "fill-current" : ""}`} />
                      </button>

                      {/* Quick Add - Mobile visible */}
                      <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 bg-gradient-to-t from-black/80 to-transparent sm:opacity-0 sm:group-hover:opacity-100 transition">
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={isEnded}
                          className="w-full py-2 sm:py-2.5 bg-white text-gray-900 rounded-lg text-sm sm:text-base font-medium hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                        >
                          {isEnded ? "Ended" : "Add to Cart"}
                        </button>
                      </div>
                    </div>

                    <div className="p-2.5 sm:p-4">
                      <Link href={`/products/${product.productId}`}>
                        <h3 className="font-semibold text-gray-900 text-xs sm:text-sm line-clamp-2 hover:text-blue-600 transition mb-1.5 sm:mb-2 min-h-[32px] sm:min-h-[40px]">
                          {product.product?.name || `Product ${product.productId}`}
                        </h3>
                      </Link>

                      {/* Rating */}
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3 h-3 sm:w-4 sm:h-4 ${
                                star <= product.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] sm:text-sm text-gray-500">({product.rating})</span>
                      </div>

                      {/* Price */}
                      <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2 mb-1.5 sm:mb-2">
                        <span className="text-sm sm:text-xl font-bold text-gray-900">
                          UGX {product.price.toLocaleString()}
                        </span>
                        {product.discountPct > 0 && product.product?.originalPrice && (
                          <span className="text-[10px] sm:text-sm text-gray-500 line-through">
                            {product.product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Delivery - Hidden on mobile */}
                      <div className="hidden sm:flex items-center gap-1 text-sm text-gray-500">
                        <Truck className="w-4 h-4" />
                        <span>{product.deliveryDays} days delivery</span>
                      </div>

                      {/* Stock */}
                      {product.product?.stock !== undefined && product.product.stock < 10 && (
                        <div className="mt-1.5 sm:mt-2 text-[10px] sm:text-sm text-orange-600 font-medium">
                          Only {product.product.stock} left!
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product._id}
                    className="flex bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition group"
                  >
                    <div className="relative w-40 md:w-56 flex-shrink-0">
                      {product.product?.images?.[0] ? (
                        <img src={product.product.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <Package className="w-10 h-10 text-gray-400" />
                        </div>
                      )}
                      {product.discountPct > 0 && (
                        <div className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-sm font-bold rounded">
                          -{product.discountPct}%
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div>
                        <Link href={`/products/${product.productId}`}>
                          <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition line-clamp-2">
                            {product.product?.name}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${star <= product.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">• {product.deliveryDays} days delivery</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div>
                          <span className="text-2xl font-bold text-gray-900">UGX {product.price.toLocaleString()}</span>
                          {product.discountPct > 0 && product.product?.originalPrice && (
                            <span className="ml-2 text-sm text-gray-500 line-through">
                              UGX {product.product.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={isEnded}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isEnded ? "Event Ended" : "Add to Cart"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
                <p className="text-gray-500">Try adjusting your filters</p>
              </div>
            )}
          </div>
        );

      case "coupons":
        return (
          <div key={section.id} className="bg-gradient-to-r from-purple-500 to-indigo-500 py-8">
            <div className="container mx-auto px-4">
              <div className="flex items-center gap-3 mb-6">
                <Gift className="w-8 h-8 text-white" />
                <h2 className="text-2xl font-bold text-white">Event Coupons</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {["SAVE10", "FREESHIP", "EXTRA5"].map((code, idx) => (
                  <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border-2 border-dashed border-white/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold text-white">{code}</span>
                      <button 
                        onClick={() => { navigator.clipboard.writeText(code); alert("Copied!"); }}
                        className="px-3 py-1 bg-white text-purple-600 rounded-lg text-sm font-medium"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-white/80 text-sm">
                      {idx === 0 ? "10% off on orders above UGX 50,000" : idx === 1 ? "Free shipping on any order" : "Extra 5% off on checkout"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Render sections in order */}
      {layoutSections
        .sort((a, b) => a.order - b.order)
        .map((section) => renderSection(section))}

      {/* Event Details Footer */}
      <div className="bg-white border-t border-gray-200 py-8 sm:py-12">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg sm:rounded-xl">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-0.5 sm:mb-1">Duration</h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  {new Date(event.schedule.start).toLocaleDateString()} - {new Date(event.schedule.end).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg sm:rounded-xl">
                <Percent className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-0.5 sm:mb-1">Discount</h3>
                <p className="text-xs sm:text-sm text-gray-600">Up to {maxDiscount}% off</p>
              </div>
            </div>
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-purple-100 rounded-lg sm:rounded-xl">
                <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-0.5 sm:mb-1">Delivery</h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Within {event.rules.maxDeliveryDays} days
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-orange-100 rounded-lg sm:rounded-xl">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-0.5 sm:mb-1">Protection</h3>
                <p className="text-xs sm:text-sm text-gray-600">Full refund guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
