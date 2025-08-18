import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function StripeRefreshPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
          </div>
          <CardTitle className="text-yellow-600">Setup Needs Refresh</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            The setup process encountered an issue and needs to be refreshed.
            Please try again.
          </p>
          <p className="text-sm text-gray-500">
            If you continue to experience issues, please contact support.
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
