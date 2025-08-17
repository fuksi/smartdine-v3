import Link from 'next/link'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/db'

export default async function HomePage() {
  const merchants = await prisma.merchant.findMany({
    where: { isActive: true },
    include: {
      locations: {
        where: { isActive: true },
        include: {
          merchant: true
        }
      }
    }
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome to SmartDine</h1>
        <p className="text-muted-foreground">
          Choose from our partner restaurants for quick pickup orders
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {merchants.map(merchant => (
          <div key={merchant.id} className="space-y-4">
            <div className="text-lg font-semibold">{merchant.name}</div>
            {merchant.locations.map(location => (
              <Link 
                key={location.id}
                href={`/restaurant/${merchant.slug}/${location.slug}`}
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <CardTitle className="text-base mb-2">
                      {location.name}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {location.address}
                    </CardDescription>
                    {location.phone && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {location.phone}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ))}
      </div>

      {merchants.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No restaurants available at the moment.
          </p>
        </div>
      )}
    </div>
  )
}
