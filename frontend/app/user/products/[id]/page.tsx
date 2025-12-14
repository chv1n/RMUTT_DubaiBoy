"use client";

import React, { use } from "react";
import { ProductDetail } from "@/components/products/product-detail";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    return <ProductDetail id={resolvedParams.id} />;
}
