import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { OrderSuccessHandler } from "@/components/order-success-handler";

async function OrderSuccessContent({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string }>;
}) {
  const resolvedParams = await searchParams;
  const orderId = resolvedParams.order_id;

  return (
    <div className="container mx-auto px-4 py-8">
      <OrderSuccessHandler />
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-green-600">Payment Successful!</CardTitle>
          <CardDescription>
            Your order has been placed and payment has been processed.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {orderId && (
            <div>
              <p className="text-sm text-gray-600">Order ID:</p>
              <Badge variant="outline" className="font-mono">
                {orderId}
              </Badge>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              You will receive a confirmation email shortly. The restaurant will
              prepare your order and notify you when it&apos;s ready for pickup.
            </p>
          </div>

          <div className="pt-4">
            <Button asChild className="w-full">
              <Link href="/">Continue Shopping</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string }>;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderSuccessContent searchParams={searchParams} />
    </Suspense>
  );
}
