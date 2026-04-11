"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  MapPin, Package, Truck, CheckCircle, Clock, ArrowLeft,
  Phone, MessageCircle, Navigation, Copy, QrCode, RefreshCw
} from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import toast from "react-hot-toast";

interface TrackingData {
  orderId: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  timeline: {
    status: string;
    title: string;
    description: string;
    timestamp: string | null;
    completed: boolean;
  }[];
  shipping: {
    address: {
      fullName?: string;
      street?: string;
      apartment?: string;
      city?: string;
      region?: string;
      phone?: string;
    } | null;
    trackingNumber: string | null;
    carrier: string | null;
    deliveryLocation: { lat: number; lng: number } | null;
  };
  liveTracking: {
    driverLocation: { lat: number; lng: number } | null;
    estimatedArrival: string | null;
    isLive: boolean;
  } | null;
  verification: {
    code: string;
    qrData: string;
    sellerConfirmed: boolean;
    userConfirmed: boolean;
  } | null;
  timestamps: {
    ordered: string;
    paid: string | null;
    delivered: string | null;
  };
}

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [showQR, setShowQR] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["order-tracking", orderId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/${orderId}/tracking`);
      return res.data.tracking as TrackingData;
    },
    refetchInterval: 30000, // Refetch every 30s for live tracking
  });

  const copyVerificationCode = () => {
    if (data?.verification?.code) {
      navigator.clipboard.writeText(data.verification.code);
      toast.success("Verification code copied!");
    }
  };

  const getStatusIcon = (status: string, completed: boolean) => {
    if (completed) {
      return <CheckCircle className="w-6 h-6 text-green-500" />;
    }
    switch (status) {
      case "Pending":
        return <Clock className="w-6 h-6 text-gray-400" />;
      case "Processing":
        return <Package className="w-6 h-6 text-blue-500" />;
      case "Shipped":
      case "OutForDelivery":
        return <Truck className="w-6 h-6 text-orange-500" />;
      case "Delivered":
      case "Completed":
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      default:
        return <Clock className="w-6 h-6 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Package className="w-16 h-16 text-gray-300 mb-4" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h1>
        <Link href="/orders" className="text-blue-600 hover:underline">
          View All Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/orders" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1">
              <h1 className="font-bold text-gray-900">Track Order</h1>
              <p className="text-sm text-gray-500">#{data.orderNumber}</p>
            </div>
            <button
              onClick={() => refetch()}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <RefreshCw className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Live Tracking Map */}
        {data.liveTracking?.isLive && data.shipping.deliveryLocation && (
          <div className="bg-white rounded-2xl border overflow-hidden">
            <div className="p-4 border-b bg-orange-50">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
                <span className="font-medium text-orange-700">Live Tracking</span>
              </div>
              {data.liveTracking.estimatedArrival && (
                <p className="text-sm text-orange-600 mt-1">
                  Estimated arrival: {new Date(data.liveTracking.estimatedArrival).toLocaleTimeString()}
                </p>
              )}
            </div>
            
            {/* Map Placeholder - In production, integrate with Google Maps or Mapbox */}
            <div className="relative h-64 bg-gray-100">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Navigation className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Driver is on the way
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Map integration required for live view
                  </p>
                </div>
              </div>
              
              {/* Driver marker simulation */}
              {data.liveTracking.driverLocation && (
                <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <Truck className="w-5 h-5 text-white" />
                  </div>
                </div>
              )}
              
              {/* Destination marker */}
              <div className="absolute bottom-1/4 right-1/3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            <div className="p-4 flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Phone className="w-4 h-4" />
                Call Driver
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50">
                <MessageCircle className="w-4 h-4" />
                Message
              </button>
            </div>
          </div>
        )}

        {/* Status Timeline */}
        <div className="bg-white rounded-2xl border p-6">
          <h2 className="font-bold text-gray-900 mb-6">Order Status</h2>
          
          <div className="relative">
            {data.timeline.map((step, index) => (
              <div key={step.status} className="flex gap-4 pb-8 last:pb-0">
                {/* Line */}
                {index < data.timeline.length - 1 && (
                  <div
                    className={`absolute left-[11px] top-8 w-0.5 h-[calc(100%-2rem)] ${
                      step.completed ? "bg-green-500" : "bg-gray-200"
                    }`}
                    style={{ top: `${index * 80 + 32}px`, height: "48px" }}
                  />
                )}
                
                {/* Icon */}
                <div className="relative z-10 flex-shrink-0">
                  {getStatusIcon(step.status, step.completed)}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-medium ${step.completed ? "text-gray-900" : "text-gray-400"}`}>
                      {step.title}
                    </h3>
                    {step.timestamp && (
                      <span className="text-xs text-gray-400">
                        {new Date(step.timestamp).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${step.completed ? "text-gray-600" : "text-gray-400"}`}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Verification */}
        {data.verification && (
          <div className="bg-white rounded-2xl border p-6">
            <h2 className="font-bold text-gray-900 mb-4">Delivery Verification</h2>
            <p className="text-sm text-gray-600 mb-4">
              Share this code with the delivery person to confirm receipt
            </p>
            
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">Verification Code</p>
                <p className="text-2xl font-mono font-bold text-gray-900 tracking-wider">
                  {data.verification.code}
                </p>
              </div>
              
              <div className="flex flex-col gap-2">
                <button
                  onClick={copyVerificationCode}
                  className="p-3 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  <Copy className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={() => setShowQR(!showQR)}
                  className="p-3 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  <QrCode className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {showQR && (
              <div className="mt-4 p-4 bg-white border rounded-xl text-center">
                <div className="w-32 h-32 bg-gray-100 mx-auto flex items-center justify-center">
                  <QrCode className="w-16 h-16 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  QR Code for verification
                </p>
              </div>
            )}

            <div className="mt-4 flex gap-4">
              <div className={`flex-1 p-3 rounded-lg text-center ${
                data.verification.sellerConfirmed ? "bg-green-50" : "bg-gray-50"
              }`}>
                <p className="text-xs text-gray-500">Seller</p>
                <p className={`font-medium ${
                  data.verification.sellerConfirmed ? "text-green-600" : "text-gray-400"
                }`}>
                  {data.verification.sellerConfirmed ? "Confirmed" : "Pending"}
                </p>
              </div>
              <div className={`flex-1 p-3 rounded-lg text-center ${
                data.verification.userConfirmed ? "bg-green-50" : "bg-gray-50"
              }`}>
                <p className="text-xs text-gray-500">You</p>
                <p className={`font-medium ${
                  data.verification.userConfirmed ? "text-green-600" : "text-gray-400"
                }`}>
                  {data.verification.userConfirmed ? "Confirmed" : "Pending"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Shipping Address */}
        <div className="bg-white rounded-2xl border p-6">
          <h2 className="font-bold text-gray-900 mb-4">Delivery Address</h2>
          
          {data.shipping.address && (
            <div className="flex gap-3">
              <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">
                  {data.shipping.address.fullName}
                </p>
                <p className="text-sm text-gray-600">
                  {data.shipping.address.street}
                  {data.shipping.address.apartment && `, ${data.shipping.address.apartment}`}
                </p>
                <p className="text-sm text-gray-600">
                  {data.shipping.address.city}, {data.shipping.address.region}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {data.shipping.address.phone}
                </p>
              </div>
            </div>
          )}

          {data.shipping.trackingNumber && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Tracking Number</p>
                  <p className="font-mono text-sm">{data.shipping.trackingNumber}</p>
                </div>
                {data.shipping.carrier && (
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                    {data.shipping.carrier}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
