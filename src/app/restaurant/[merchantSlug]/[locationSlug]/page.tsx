import { notFound } from 'next/navigation'
import { ProductCard } from '@/components/product-card'
import { prisma } from '@/lib/db'

interface RestaurantPageProps {
  params: Promise<{
    merchantSlug: string
    locationSlug: string
  }>
}

export default async function RestaurantPage({ params }: RestaurantPageProps) {
  const { merchantSlug, locationSlug } = await params

  const location = await prisma.merchantLocation.findFirst({
    where: {
      slug: locationSlug,
      merchant: {
        slug: merchantSlug,
        isActive: true
      },
      isActive: true
    },
    include: {
      merchant: true,
      menu: {
        include: {
          categories: {
            where: { isActive: true },
            include: {
              products: {
                where: { isAvailable: true },
                include: {
                  options: {
                    include: {
                      optionValues: {
                        orderBy: { sortOrder: 'asc' }
                      }
                    },
                    orderBy: { sortOrder: 'asc' }
                  }
                },
                orderBy: { sortOrder: 'asc' }
              }
            },
            orderBy: { sortOrder: 'asc' }
          }
        }
      }
    }
  })

  if (!location || !location.menu) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {location.merchant.name} - {location.name}
          </h1>
          <p className="text-muted-foreground">{location.address}</p>
          {location.phone && (
            <p className="text-muted-foreground">{location.phone}</p>
          )}
        </div>

        <div className="space-y-8">
          {location.menu.categories.map(category => (
            <section key={category.id}>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">{category.name}</h2>
                {category.description && (
                  <p className="text-muted-foreground">{category.description}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.products.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    locationId={location.id}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        {location.menu.categories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              This restaurant doesn&apos;t have any menu items available at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
