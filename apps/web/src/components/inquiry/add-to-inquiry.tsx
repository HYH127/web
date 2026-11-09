"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addInquiryLine } from "@/lib/inquiry-store";

/**
 * 加入询盘单
 *
 * 写 localStorage 后跳到询盘单。演示态不需要登录，也不需要后端；
 * 接入真实购物车时把 addInquiryLine 换成 POST /api/cart/items 即可。
 */
export function AddToInquiry({
  slug,
  label = "加入询盘单",
  variant = "primary",
}: {
  slug: string;
  label?: string;
  variant?: "primary" | "ghost";
}) {
  const router = useRouter();
  const [added, setAdded] = useState(false);

  return (
    <Button
      type="button"
      variant={variant}
      onClick={() => {
        addInquiryLine(slug);
        setAdded(true);
        router.push("/cart");
      }}
    >
      {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
      {added ? "已加入" : label}
    </Button>
  );
}
