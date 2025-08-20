import { CustomerLogin } from "@/components/customer-login";

export default function TestAuthPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-8">
          Customer Authentication Test
        </h1>
        <CustomerLogin />
      </div>
    </div>
  );
}
