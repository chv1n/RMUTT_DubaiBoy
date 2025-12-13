
"use client";

import React, { useEffect, useState } from "react";
import { ProductForm } from "@/components/products/product-form";
import { productService } from "@/services/product.service";
import { Product } from "@/types/product";
import { Spinner } from "@heroui/spinner";
import { useParams } from "next/navigation";

export default function EditProductPage() {
    const params = useParams();
    const [product, setProduct] = useState<Product | undefined>(undefined);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!params.id) return;
            try {
                const data = await productService.getById(Number(params.id));
                setProduct(data);
            } catch (error) {
                console.error("Failed to load product", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [params.id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full min-h-[400px]">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!product) {
        return <div>Product not found</div>;
    }

    return <ProductForm mode="edit" initialData={product} />;
}
