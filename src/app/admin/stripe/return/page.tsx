import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function StripeReturnPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-green-600">Setup Complete!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Your Stripe Connect account has been successfully set up. You can
            now accept payments for your restaurant.
          </p>
          <p className="text-sm text-gray-500">
            It may take a few minutes for the changes to be reflected in your
            admin panel.
          </p>
          <div className="pt-4">
            <Button asChild>
              <Link href="/admin/stripe" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Payment Setup
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
