import { PrismaClient } from "@prisma/client";
import { createImageUploader } from "../src/lib/image-upload";

const prisma = new PrismaClient();

interface ProductData {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
}

const bonbonProducts: ProductData[] = [
  {
    id: "680811ace9d4a244216e8ca6",
    name: "Bon Espresso - 250g Whole Beans",
    description:
      "Net weight: 250g\nType: Whole Beans\nRich and punchy. Designed for espresso lovers, this blend delivers a full-bodied cup with a smooth finish and great crema.\nTaste notes: Dark chocolate, hazelnut and caramel sweet aftertaste.\nBest for: Espresso, moka pot, milk-based drinks",
    price: 14.5,
    images: ["https://imageproxy.wolt.com/assets/680811a9e20f06ebc0e36299"],
  },
  {
    id: "68081a97ac530e53bd19379b",
    name: "Fine Robusta - 250g Whole Beans",
    description:
      "Net weight: 250g\nType: Whole Beans\nA rare, fruit-forward Robusta crafted like an Arabica — notes of banana, light-medium roast, perfect for filter methods.\nTaste notes: dried bananas, chestnut, winey sweet aftertaste.\nBest for: Filter/Drip",
    price: 13.2,
    images: ["https://imageproxy.wolt.com/assets/68081b85c76fd2c964ac3f21"],
  },
  {
    id: "68081c53e9d4a2442170cd4c",
    name: "Yellow Bourbon - 250g Whole Beans",
    description:
      "Net weight: 250g\nType: Whole Beans\nSweet, bright, and floral. A specialty Arabica with balanced acidity and a honey-like finish.\nTaste notes: Soft chocolate, warm spices, ripe fruit aftertaste\nBest for: Pour-over, drip, AeroPress",
    price: 16.2,
    images: ["https://imageproxy.wolt.com/assets/68081c51c1278bfb6ce28584"],
  },
  {
    id: "68081d73e9d4a244217154f1",
    name: "Tasting Set - 3 x 250g Whole Beans",
    description:
      "Explore the full range of our premium roasts with this curated tasting set, featuring three distinct single origins:\n\n☕ Fine Robusta – A rare light-medium roast with a smooth body and unique banana notes. Crafted for pour-over and filter methods.\n☕ Bon Espresso – A rich, chocolatey blend with bold crema and balance, perfect for espresso or moka pot lovers.\n☕ Yellow Bourbon – Sweet, citrusy, and floral — this light-medium roast shines in pour-over or drip brews.\n\n✔️ 3 x 250g whole bean bags\n✔️ Roasted fresh\n\nTaste your way through our range — from bold and smooth to sweet and bright.",
    price: 43.9,
    images: ["https://imageproxy.wolt.com/assets/68081d6ec76fd2c964ac3f23"],
  },
  {
    id: "68177974070bb6369f594705",
    name: "Bon Espresso - 1kg Whole Beans",
    description:
      "Convenient pack for your office!\nNet weight: 1kg\nType: Whole Beans\nRich and punchy. Designed for espresso lovers, this blend delivers a full-bodied cup with a smooth finish and great crema.\nTaste notes: Dark chocolate, hazelnut and caramel sweet aftertaste.\nBest for: Espresso, moka pot, milk-based drinks",
    price: 52,
    images: [],
  },
  {
    id: "67f90ba01ba8c07e15748288",
    name: "Easter Mango Mousse (L)",
    description: "",
    price: 6,
    images: ["https://imageproxy.wolt.com/assets/67f90b9e5e06813d12111d8d"],
  },
  {
    id: "67f90d3ecca1e97c9baca42e",
    name: "Lemon Curd Cake (L)",
    description: "",
    price: 2.6,
    images: ["https://imageproxy.wolt.com/assets/67f90d3d5e06813d12111dd1"],
  },
  {
    id: "680b6a39a519eb16f164a304",
    name: "Matcha Basque Cheesecake & Strawberry Cream",
    description: "",
    price: 4,
    images: ["https://imageproxy.wolt.com/assets/680b6bea37ab058cca26a5bd"],
  },
  {
    id: "682ecc6d88bfdd464de9b64e",
    name: "Lemon Tiramisu (L)",
    description:
      "Our homemade tiramisu, swirled with zesty lemon curd, strikes the perfect balance—light, refreshing, and just right for summer. Not too sweet, not too sour. Available in a 250ml box.",
    price: 6,
    images: ["https://imageproxy.wolt.com/assets/682ecf547957faa8599d029a"],
  },
  {
    id: "68710da2bc1d172317f5ae75",
    name: "Earl Grey Cake Roll",
    description:
      "Earl Grey Cake Roll with luscious Earl Grey cream—completely lactose-free. Soft, fragrant, and perfect for summer.",
    price: 6.9,
    images: ["https://imageproxy.wolt.com/assets/68721b01e214fc3c7350e9ce"],
  },
  {
    id: "6878d2bb1efbd07898ea51bc",
    name: "Vanilla Burnt Cheesecake",
    description:
      "Creamy, rich vanilla cheesecake finished with a caramelized torch-burnt top for a hint of smokiness and a delicate crunch.",
    price: 7.2,
    images: ["https://imageproxy.wolt.com/assets/6879eae885456c602b665760"],
  },
  {
    id: "6878d3881efbd07898ea52ca",
    name: "Matcha Burnt Cheesecake",
    description:
      "Lactose-free cheesecake infused with matcha, finished with a caramelized burnt top.",
    price: 7.6,
    images: ["https://imageproxy.wolt.com/assets/6879eaef85456c602b665762"],
  },
  {
    id: "68710d4ebc1d172317f5ad24",
    name: "Kardemummapulla",
    description:
      "Lämmin, pehmeä kardemummapulla, voideltu ohuella kerroksella kirkasta sitruksista marmeladia — tahmea, tuoksuva ja lempeän makea",
    price: 5.4,
    images: ["https://imageproxy.wolt.com/assets/68721bfb972c2e1223ec9220"],
  },
  {
    id: "664f1e4ab79f8345b223b832",
    name: "Almond Croissant (L)",
    description: "",
    price: 4.6,
    images: [
      "https://imageproxy.wolt.com/assets/66f815243d87030c87011c1d",
      "https://imageproxy.wolt.com/assets/66fd3aab6ab10a46a4602d3d",
    ],
  },
  {
    id: "664f1e4ab79f8345b223b831",
    name: "Pistachio Croissant (L)",
    description: "",
    price: 4.8,
    images: [
      "https://imageproxy.wolt.com/assets/66f815193d87030c87011c1c",
      "https://imageproxy.wolt.com/assets/66fd3a6207aa114f2b3aecba",
    ],
  },
  {
    id: "672aa82822e9c678253e70fb",
    name: "Butter Croissant (L)",
    description:
      "Freshly-baked butter croissant with a light, flaky texture for a delightful treat anytime.",
    price: 3.9,
    images: ["https://imageproxy.wolt.com/assets/672cc8bdca474667e008b563"],
  },
  {
    id: "6687bf90583d3641946f2c24",
    name: "Matcha Cheese Roll (L)",
    description: "Matcha swirls with cream cheese for matcha lovers.",
    price: 5.9,
    images: [
      "https://imageproxy.wolt.com/assets/674cad16d972bb336cbd8641",
      "https://imageproxy.wolt.com/assets/6687bf8cbb59384d68b0ffea",
    ],
  },
  {
    id: "6674a42c195aa6694deb7bc5",
    name: "Pistachio Tiramisu (L)",
    description: "",
    price: 6.1,
    images: ["https://imageproxy.wolt.com/assets/66757d23a097e73a6e5d0bd3"],
  },
  {
    id: "664f1e4ab79f8345b223b835",
    name: "Matcha Tiramisu (L)",
    description: "",
    price: 6.5,
    images: ["https://imageproxy.wolt.com/assets/665c969bca587a012e7bba3e"],
  },
  {
    id: "664f1e4ab79f8345b223b834",
    name: "Traditional Tiramisu (L)",
    description: "",
    price: 5.9,
    images: ["https://imageproxy.wolt.com/assets/665c9689ca587a012e7bba3d"],
  },
  {
    id: "664f1e4ab79f8345b223b830",
    name: "Chocolate Cheese Roll (L)",
    description: "",
    price: 5.2,
    images: ["https://imageproxy.wolt.com/assets/665c9676ca587a012e7bba3c"],
  },
  {
    id: "664f1e4ab79f8345b223b82f",
    name: "Strawberry Cake Roll (L)",
    description: "",
    price: 5.8,
    images: ["https://imageproxy.wolt.com/assets/689aebfd9e033e41ab6f7985"],
  },
  {
    id: "66a964302a8ad425ca8c444e",
    name: "Breakfast Combo",
    description:
      "Kickstart your morning with our Breakfast Combo! Pick your favorite drink and pair it with a freshly baked pastry.✨✨🌞",
    price: 7.9,
    images: ["https://imageproxy.wolt.com/assets/672f75d366b0360b8a4ba016"],
  },
  {
    id: "6817dbb43356b42c9b776533",
    name: "Bonbon Suosikit",
    description:
      "A gentle introduction to our favorites.\nThoughtfully chosen for those who want a taste of what makes Bonbon, Bonbon.",
    price: 11.9,
    images: [],
  },
  {
    id: "66a96493eb9a98204302074d",
    name: "Lunch Combo",
    description:
      "Too busy for luncheon? We have got your back with our light Lunch Combo 😉😉. Includes one caffeinated drink, one dessert of choice and one small chicken onigiri (100g).",
    price: 11.5,
    images: [],
  },
  {
    id: "668bcfda583d3641946fb4ec",
    name: "Trio Delight Cake Rolls",
    description:
      "Customize your perfect trio with our delicious cake rolls! Choose from three delightful flavors: chocolate, strawberry, red velvet, pumpkin almond or matcha .",
    price: 14.2,
    images: ["https://imageproxy.wolt.com/assets/668bd3b7aca1946997c81368"],
  },
  {
    id: "6660843b72d75f4f9b603d4c",
    name: "Evergreen Box",
    description:
      "Includes:\n- 1x Matcha Tiramisu\n- 1x Chilled Matcha Bottle\n- 1x Pistachio Croissant\n- 1x Cup of ice",
    price: 16.2,
    images: ["https://imageproxy.wolt.com/assets/666084660b91474226d1a371"],
  },
  {
    id: "6660871192ca4d1d9ce8fe44",
    name: "Black Almondy Box",
    description:
      "Includes:\n- 1x Traditional Tiramisu\n- 1x Cold Brew Bottle(with milk or not)\n- 1x Almond Croissant\n- 1x Cup of ice",
    price: 14.8,
    images: ["https://imageproxy.wolt.com/assets/66608710bed66a33ac2e6837"],
  },
  {
    id: "6660825d441e9c60a7370f55",
    name: "Custom Dessert Box",
    description:
      "Customize your own dessert box, including:\n- 1x Tiramisu\n- 1x Pastry\n- 1x Bottled drink\n- 1x cup of ice",
    price: 16.4,
    images: ["https://imageproxy.wolt.com/assets/66609050c4f5fa302db0b90b"],
  },
  {
    id: "67cb3a78fbd0cf3e17670653",
    name: "Bon Siesta",
    description:
      "Perfect midday recharge! Enjoy your afternoon treat with our combo - 1 drink and 1 dessert of your choice - for a special discounted price.",
    price: 9.9,
    images: ["https://imageproxy.wolt.com/assets/67cecc34d505ff00db831ca2"],
  },
  {
    id: "6674a7e8ad73571ab525fe04",
    name: "Pistachio Dream Box",
    description:
      "Includes:\n- 1x Pistachio Tiramisu\n- 1x Pistachio Matcha Latte Cup\n- 1x Pistachio Croissant",
    price: 16,
    images: ["https://imageproxy.wolt.com/assets/66757d09a097e73a6e5d0bd2"],
  },
  {
    id: "67acac5444beb404a6fd59b8",
    name: "Rose Latte Duo",
    description: "Enjoy the Rose Duo – A lovely way to celebrate Valentine's.",
    price: 12.7,
    images: ["https://imageproxy.wolt.com/assets/67acac51b6b7de2eca58c342"],
  },
  {
    id: "6817e40e070bb6369f59fb32",
    name: "Latte Combo for 4",
    description: "",
    price: 23.9,
    images: [],
  },
  {
    id: "6654ee6521626369c6184842",
    name: "Salted Cream Coffee (L)",
    description:
      "A bold espresso, sweetened with condensed milk, and a top with whipped cheese and a hint of sea salt for a perfect balance of rich, creamy, and savory flavors.",
    price: 6.5,
    images: ["https://imageproxy.wolt.com/assets/674db7ba4b80e20da9346c99"],
  },
  {
    id: "674db64683af0527fd6a4e51",
    name: "Salted Cream Matcha (L)",
    description:
      "Premium ceremonial matcha latte topped with a rich salted cream. Lactose free.",
    price: 6.8,
    images: ["https://imageproxy.wolt.com/assets/674db9dbd972bb336cbd9dce"],
  },
  {
    id: "674db6f983af0527fd6a5043",
    name: "Salted Cream Cacao (L)",
    description:
      "For chocolate lovers, elevate your drink experience with rich chocolate topped with salted cream, adding a delightful cheesy twist.",
    price: 6,
    images: ["https://imageproxy.wolt.com/assets/674dbb5bd972bb336cbd9dee"],
  },
  {
    id: "6674a4897f738f555306ae85",
    name: "Pistachio Matcha Latte",
    description:
      "A creamy blend of rich pistachio and matcha green tea, lightly sweetened for a harmonious and refreshing drink.",
    price: 7,
    images: ["https://imageproxy.wolt.com/assets/6674a711df73a36cb0dbacf8"],
  },
  {
    id: "664f1e4ab79f8345b223b827",
    name: "Matcha Latte",
    description: "",
    price: 6.8,
    images: ["https://imageproxy.wolt.com/assets/665702ec55412123d459072e"],
  },
  {
    id: "66b51e9b8be7826592e7437d",
    name: "Strawberry Matcha Foam 🍓🧊",
    description: "",
    price: 7.2,
    images: ["https://imageproxy.wolt.com/assets/66b52690308a842e2ca761ff"],
  },
  {
    id: "664f1e4ab79f8345b223b81f",
    name: "Salted Caramel Latte",
    description: "",
    price: 6.6,
    images: ["https://imageproxy.wolt.com/assets/665702f20b61ae1437497c61"],
  },
  {
    id: "664f1e4ab79f8345b223b829",
    name: "Bonbon Coffee",
    description:
      "A double shot mellowed with sweet condensed milk. Small in size, strong in flavor — this little cup packs a serious kick.",
    price: 5,
    images: ["https://imageproxy.wolt.com/assets/66570257447efd43463bbf38"],
  },
  {
    id: "664f1e4ab79f8345b223b825",
    name: "Tiramisu Latte",
    description: "",
    price: 6.6,
    images: ["https://imageproxy.wolt.com/assets/6657023155412123d4590720"],
  },
  {
    id: "664f1e4ab79f8345b223b826",
    name: "Tiramisu Matcha Latte",
    description: "",
    price: 7.2,
    images: ["https://imageproxy.wolt.com/assets/665702370b61ae1437497c55"],
  },
  {
    id: "664f1e4ab79f8345b223b824",
    name: "Ame Sunset",
    description:
      "Fresh orange juice topped with espresso for a bold, citrusy kick.",
    price: 6,
    images: ["https://imageproxy.wolt.com/assets/6657023d55412123d4590721"],
  },
  {
    id: "664f1e4ab79f8345b223b82c",
    name: "Bottled Chilled Matcha",
    description: "",
    price: 7.3,
    images: [
      "https://imageproxy.wolt.com/assets/66f7de61143f620059414e57",
      "https://imageproxy.wolt.com/assets/665702270b61ae1437497c52",
    ],
  },
  {
    id: "664f1e4ab79f8345b223b82d",
    name: "Bottled Chilled Choco",
    description: "",
    price: 6.4,
    images: [
      "https://imageproxy.wolt.com/assets/66f7de913d87030c87011ae0",
      "https://imageproxy.wolt.com/assets/6657022055412123d459071d",
    ],
  },
  {
    id: "664f1e4ab79f8345b223b82b",
    name: "Bottled Cold Brew",
    description:
      "This week's cold brew is made with our Yellow Bourbon beans, offering bright ripe fruit notes and a soft chocolate finish. Enjoy it on its own, or mix with milk, water, or fruit juice for a refreshing twist.",
    price: 6.6,
    images: [
      "https://imageproxy.wolt.com/assets/66f7de4f143f620059414e56",
      "https://imageproxy.wolt.com/assets/66f7de773d87030c87011ade",
    ],
  },
  {
    id: "66b5227e8be7826592e743b3",
    name: "Bottled Strawberry Matcha",
    description: "",
    price: 7.7,
    images: [
      "https://imageproxy.wolt.com/assets/66f7de3e143f620059414e55",
      "https://imageproxy.wolt.com/assets/66f7de813d87030c87011adf",
    ],
  },
  {
    id: "67acad5d44beb404a6fd5cff",
    name: "Sesame Roll",
    description:
      "House-made black sesame roll. Lactose-free and no egg. Will be served with sesame sauce on the side.",
    price: 4.5,
    images: ["https://imageproxy.wolt.com/assets/67acad5c2c28ca1ef7f4715a"],
  },
  {
    id: "67a61ba28c358c11299b145c",
    name: "Espresso Burnt Cheesecake",
    description:
      "A rich and creamy Basque-style cheesecake with a caramelized top, infused with bold espresso. Made with cream cheese, heavy cream, eggs, sugar, espresso, and a touch of vanilla for a perfectly balanced, slightly bitter-sweet flavor.",
    price: 6,
    images: ["https://imageproxy.wolt.com/assets/67a61d7437259c46317a2386"],
  },
  {
    id: "6705a76b94457b0e3c1a521e",
    name: "Cinnamon Roll Cheese Top",
    description:
      "A classic cinnamon roll, perfectly swirled with layers of sweet cinnamon and finished with a luscious cream cheese topping for a rich, melt-in-your-mouth experience.",
    price: 3.4,
    images: [
      "https://imageproxy.wolt.com/assets/672f73bf591b80477edac470",
      "https://imageproxy.wolt.com/assets/672f73bf591b80477edac46f",
    ],
  },
  {
    id: "66f815ecd8d6fe0f7c1e8615",
    name: "Apple Pie Crumble Oat Walnut Croissant (L)",
    description:
      "Apple Pie Crumble Oat Walnut Croissant - a luxurious, buttery delight filled with rich apple pie sauce and topped with crunchy oat-walnut crumble.",
    price: 4.7,
    images: ["https://imageproxy.wolt.com/assets/66f815eb9e764e39c1b6c1ea"],
  },
  {
    id: "66f31eae06f036711a58032c",
    name: "Espresso Cheesecake",
    description: "",
    price: 4.9,
    images: [],
  },
  {
    id: "664f1e4ab79f8345b223b833",
    name: "Croissant Egg Tart (L)",
    description:
      "Crisp, buttery layers of a croissant with the silky smoothness of a traditional egg custard tart.\nThe tart contains egg and gluten, is lactose free.",
    price: 3.3,
    images: [],
  },
  {
    id: "6705b32f94457b0e3c1a52a9",
    name: "Pumpkin Almond Cheese Roll",
    description: "",
    price: 5.2,
    images: ["https://imageproxy.wolt.com/assets/67081ee60baf9542542e5437"],
  },
  {
    id: "6705b2fd94457b0e3c1a52a6",
    name: "Red Velvet Cheese Roll",
    description: "",
    price: 5.5,
    images: ["https://imageproxy.wolt.com/assets/67081eda0baf9542542e5436"],
  },
  {
    id: "66f7e620c1df0e32d89c2825",
    name: "Dirty Chai Latte",
    description:
      "A rich blend of spiced black tea and bold espresso, combined with creamy milk and infused with warm hints of cinnamon, cardamom, and ginger for a comforting, flavorful kick.",
    price: 6.5,
    images: ["https://imageproxy.wolt.com/assets/66f7ec559e764e39c1b6c111"],
  },
  {
    id: "664f1e4ab79f8345b223b81e",
    name: "Latte",
    description: "",
    price: 5.8,
    images: ["https://imageproxy.wolt.com/assets/66570206ca587a012e7bac3e"],
  },
  {
    id: "664f1e4ab79f8345b223b822",
    name: "Cappuccino",
    description: "",
    price: 5.9,
    images: ["https://imageproxy.wolt.com/assets/665702ca0b61ae1437497c5d"],
  },
  {
    id: "664f1e4ab79f8345b223b823",
    name: "Americano",
    description: "",
    price: 5,
    images: ["https://imageproxy.wolt.com/assets/665702ce0b61ae1437497c5e"],
  },
  {
    id: "664f1e4ab79f8345b223b828",
    name: "Chocolate",
    description: "",
    price: 5.6,
    images: ["https://imageproxy.wolt.com/assets/665702e055412123d459072b"],
  },
  {
    id: "664f1e4ab79f8345b223b82a",
    name: "Cold Brew with milk",
    description: "",
    price: 5,
    images: ["https://imageproxy.wolt.com/assets/66570265848a677b03641b28"],
  },
  {
    id: "6654e8ecc2006718edbedc5b",
    name: "Cold Brew Tonic",
    description: "",
    price: 5.6,
    images: ["https://imageproxy.wolt.com/assets/666097d2950ec558de6d1d4f"],
  },
  {
    id: "6654e914c2006718edbedc5c",
    name: "Cold Brew Lychee",
    description: "",
    price: 5.8,
    images: [],
  },
  {
    id: "66f7e5d227bd1c66e544e187",
    name: "Pumpkin Spice Latte",
    description:
      "A seasonal classic! Rich espresso combined with cold or steamed milk and the warm flavours of pumpkin, cinnamon, and nutmeg. Perfect for fall and winter!\nAvailable also in vegan, hot or cold",
    price: 6.4,
    images: ["https://imageproxy.wolt.com/assets/6708224aa7eb5c5d5a81510f"],
  },
];

async function seedBonbonCoffee() {
  console.log("🌱 Starting Bonbon Coffee seeding...");

  // Create or find merchant
  let merchant = await prisma.merchant.findUnique({
    where: { slug: "bonbon-coffee" },
  });

  if (!merchant) {
    merchant = await prisma.merchant.create({
      data: {
        name: "Bonbon Coffee",
        slug: "bonbon-coffee",
        description: "Premium coffee roastery and artisanal desserts",
        logoUrl: null,
        isActive: true,
      },
    });
    console.log("✓ Created merchant:", merchant.name);
  } else {
    console.log("✓ Merchant already exists:", merchant.name);
  }

  // Create or find location
  let location = await prisma.merchantLocation.findUnique({
    where: {
      merchantId_slug: {
        merchantId: merchant.id,
        slug: "central",
      },
    },
  });

  if (!location) {
    location = await prisma.merchantLocation.create({
      data: {
        merchantId: merchant.id,
        name: "Bonbon Coffee Central",
        slug: "central",
        address: "Helsinki, Finland",
        phone: "+358 123 456 789",
        email: "hello@bonboncoffee.fi",
        isActive: true,
      },
    });
    console.log("✓ Created location:", location.name);
  } else {
    console.log("✓ Location already exists:", location.name);
  }

  // Create opening hours
  const openingHoursData = [
    { day: 0, isOpen: true, open: "09:00", close: "18:00" }, // Sunday
    { day: 1, isOpen: true, open: "08:00", close: "19:00" }, // Monday
    { day: 2, isOpen: true, open: "08:00", close: "19:00" }, // Tuesday
    { day: 3, isOpen: true, open: "08:00", close: "19:00" }, // Wednesday
    { day: 4, isOpen: true, open: "08:00", close: "19:00" }, // Thursday
    { day: 5, isOpen: true, open: "08:00", close: "20:00" }, // Friday
    { day: 6, isOpen: true, open: "09:00", close: "20:00" }, // Saturday
  ];

  const existingHours = await prisma.openingHour.findFirst({
    where: { locationId: location.id },
  });

  if (!existingHours) {
    for (const { day, isOpen, open, close } of openingHoursData) {
      await prisma.openingHour.create({
        data: {
          locationId: location.id,
          dayOfWeek: day,
          isOpen,
          openTime: open,
          closeTime: close,
        },
      });
    }
    console.log("✓ Created opening hours");
  } else {
    console.log("✓ Opening hours already exist");
  }

  // Create admin user for testing if doesn't exist
  const existingAdmin = await prisma.adminUser.findUnique({
    where: { email: "bonbon@test.com" },
  });

  if (!existingAdmin) {
    const newAdmin = await prisma.adminUser.create({
      data: {
        email: "bonbon@test.com",
        locationId: location.id,
        isActive: true,
      },
    });
    console.log("✓ Created admin user:", newAdmin.email);
  } else {
    console.log("✓ Admin user already exists:", existingAdmin.email);
  }

  // Create local test admin user bonbon@outlook.com
  const existingLocalAdmin = await prisma.adminUser.findUnique({
    where: { email: "bonbon@outlook.com" },
  });

  if (!existingLocalAdmin) {
    const newLocalAdmin = await prisma.adminUser.create({
      data: {
        email: "bonbon@outlook.com",
        locationId: location.id,
        isActive: true,
      },
    });
    console.log("✓ Created local test admin user:", newLocalAdmin.email);
  } else {
    console.log(
      "✓ Local test admin user already exists:",
      existingLocalAdmin.email
    );
  }

  // Create menu
  let menu = await prisma.menu.findFirst({
    where: { locationId: location.id },
  });

  if (!menu) {
    menu = await prisma.menu.create({
      data: {
        locationId: location.id,
        name: "Bonbon Menu",
        isActive: true,
      },
    });
    console.log("✓ Created menu:", menu.name);
  } else {
    console.log("✓ Menu already exists:", menu.name);
  }

  // Create proper categories for Bonbon Coffee
  const categories = [
    {
      name: "Classics",
      description: "Classic coffee drinks and espresso-based beverages",
      sortOrder: 1,
      canShip: false,
    },
    {
      name: "Bonbon's Specials",
      description: "Specialty drinks and unique coffee creations",
      sortOrder: 2,
      canShip: false,
    },
    {
      name: "Snacks",
      description: "Light bites and snack items",
      sortOrder: 3,
      canShip: true,
    },
    {
      name: "Bakes",
      description: "Fresh baked goods and desserts",
      sortOrder: 4,
      canShip: true,
    },
    {
      name: "Daily Deals",
      description: "Special combo deals and packages",
      sortOrder: 5,
      canShip: true,
    },
    {
      name: "Bottled Drinks",
      description: "Ready-to-drink bottled beverages",
      sortOrder: 6,
      canShip: true,
    },
    {
      name: "Meet the Beans",
      description: "Premium coffee beans for home brewing",
      sortOrder: 7,
      canShip: true,
    },
  ];

  const createdCategories: Record<string, { id: string; name: string }> = {};

  // Create all categories first
  for (const categoryData of categories) {
    let category = await prisma.category.findFirst({
      where: { menuId: menu.id, name: categoryData.name },
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          menuId: menu.id,
          name: categoryData.name,
          description: categoryData.description,
          sortOrder: categoryData.sortOrder,
          canShip: categoryData.canShip,
          isActive: true,
        },
      });
      console.log(`✓ Created category: ${category.name}`);
    } else {
      console.log(`✓ Category already exists: ${category.name}`);
    }

    createdCategories[categoryData.name] = category;
  }

  // Function to determine category based on product name
  const getCategoryForProduct = (productName: string) => {
    const name = productName.toLowerCase();

    // Meet the Beans - Coffee beans
    if (name.includes("beans") || name.includes("tasting set")) {
      return "Meet the Beans";
    }

    // Bottled Drinks
    if (name.includes("bottled")) {
      return "Bottled Drinks";
    }

    // Daily Deals - Combo items
    if (
      name.includes("combo") ||
      name.includes("box") ||
      name.includes("anything works")
    ) {
      return "Daily Deals";
    }

    // Snacks - Small food items
    if (
      name.includes("sesame roll") ||
      name.includes("espresso burnt") ||
      name.includes("cinnamon roll") ||
      name.includes("apple pie") ||
      name.includes("espresso cheesecake") ||
      name.includes("croissant egg") ||
      name.includes("pumpkin almond") ||
      name.includes("red velvet")
    ) {
      return "Snacks";
    }

    // Bakes - Baked goods and desserts (but not tiramisu lattes)
    if (
      (name.includes("cake") ||
        name.includes("roll") ||
        name.includes("cheesecake") ||
        name.includes("tiramisu") ||
        name.includes("mousse") ||
        name.includes("croissant") ||
        name.includes("muffin") ||
        name.includes("brownie") ||
        name.includes("almond") ||
        name.includes("pistachio") ||
        name.includes("traditional") ||
        name.includes("chocolate cheese") ||
        name.includes("strawberry cake") ||
        name.includes("vanilla burnt") ||
        name.includes("matcha burnt") ||
        name.includes("matcha cheese") ||
        name.includes("earl grey") ||
        name.includes("lemon") ||
        name.includes("butter") ||
        name.includes("kardemummapulla")) &&
      !name.includes("latte")
    ) {
      // Exclude lattes
      return "Bakes";
    }

    // Bonbon's Specials - Specialty drinks with unique names
    if (
      name.includes("salted cream") ||
      name.includes("matcha latte") ||
      name.includes("pistachio") ||
      name.includes("strawberry") ||
      name.includes("caramel") ||
      name.includes("bonbon coffee") ||
      name.includes("ame sunset") ||
      name.includes("foam") ||
      name.includes("tiramisu latte")
    ) {
      return "Bonbon's Specials";
    }

    // Classics - Standard coffee drinks
    if (
      name.includes("latte") ||
      name.includes("cappuccino") ||
      name.includes("americano") ||
      name.includes("chocolate") ||
      name.includes("cold brew") ||
      name.includes("tonic") ||
      name.includes("lychee") ||
      name.includes("chai") ||
      name.includes("ice water") ||
      name.includes("cutlery") ||
      name.includes("suosikit") ||
      name.includes("siesta") ||
      name.includes("rose latte") ||
      name.includes("pumpkin spice")
    ) {
      return "Classics";
    }

    // Default category for uncategorized items
    return "Classics";
  };

  // Create single category for all products (legacy support)
  let category = await prisma.category.findFirst({
    where: { menuId: menu.id, name: "All Items" },
  });

  if (!category) {
    category = await prisma.category.create({
      data: {
        menuId: menu.id,
        name: "All Items",
        description: "Coffee, desserts, and specialty items",
        sortOrder: 99,
        isActive: false, // Hide this category
        canShip: true,
      },
    });
    console.log("✓ Created legacy category:", category.name);
  } else {
    console.log("✓ Legacy category already exists");
  }

  // Initialize image uploader
  const imageUploader = createImageUploader();
  if (!imageUploader) {
    console.log("⚠️ Image uploader not configured - will skip image uploads");
  }

  // Create products
  let successCount = 0;
  let skipCount = 0;
  let updatedCount = 0;

  for (const productData of bonbonProducts) {
    try {
      // Determine the correct category for this product
      const productCategoryName = getCategoryForProduct(productData.name);
      const productCategory = createdCategories[productCategoryName];

      if (!productCategory) {
        console.error(`Category not found for product: ${productData.name}`);
        continue;
      }

      // Check if product already exists in any category
      const existingProduct = await prisma.product.findFirst({
        where: {
          name: productData.name,
          category: {
            menuId: menu.id,
          },
        },
      });

      // Handle image upload
      let imageUrl: string | null = null;
      if (productData.images.length > 0) {
        const firstImageUrl = productData.images[0];

        if (imageUploader) {
          // Try to upload to DigitalOcean Spaces
          try {
            const fileName = imageUploader.generateFileName(
              firstImageUrl,
              productData.id
            );
            imageUrl = await imageUploader.downloadAndUploadImage(
              firstImageUrl,
              fileName
            );
          } catch (error) {
            console.warn(
              `Failed to upload image for ${productData.name}:`,
              error
            );
            // Fallback to original URL
            imageUrl = firstImageUrl;
          }
        } else {
          // Use original URL when DigitalOcean Spaces is not configured
          imageUrl = firstImageUrl;
        }
      }

      if (existingProduct) {
        // Check if product needs to be moved to correct category
        const shouldUpdateCategory =
          existingProduct.categoryId !== productCategory.id;

        // Only coffee beans products are shippable (products containing "Beans" or "Tasting Set")
        const isShippable =
          productCategory.name === "Meet the Beans" ||
          productCategory.name === "Bakes" ||
          productCategory.name === "Snacks" ||
          productCategory.name === "Daily Deals" ||
          productCategory.name === "Bottled Drinks";

        // Update product with image, shipping status, and category
        const updateData: {
          imageUrl?: string;
          canShip?: boolean;
          categoryId?: string;
        } = {};
        let needsUpdate = false;

        if (imageUrl && !existingProduct.imageUrl) {
          updateData.imageUrl = imageUrl;
          needsUpdate = true;
        }

        if (existingProduct.canShip !== isShippable) {
          updateData.canShip = isShippable;
          needsUpdate = true;
        }

        if (shouldUpdateCategory) {
          updateData.categoryId = productCategory.id;
          needsUpdate = true;
        }

        if (needsUpdate) {
          await prisma.product.update({
            where: { id: existingProduct.id },
            data: updateData,
          });
          console.log(
            `✓ Updated product: ${existingProduct.name} -> ${productCategory.name} (shippable: ${isShippable})`
          );
          updatedCount++;
        } else {
          console.log(
            `⏭️ Product "${productData.name}" already exists in correct category`
          );
          skipCount++;
        }
        continue;
      }

      // Create product
      // Determine shipping capability based on category
      const isShippable =
        productCategory.name === "Meet the Beans" ||
        productCategory.name === "Bakes" ||
        productCategory.name === "Snacks" ||
        productCategory.name === "Daily Deals" ||
        productCategory.name === "Bottled Drinks";

      const product = await prisma.product.create({
        data: {
          categoryId: productCategory.id,
          name: productData.name,
          description: productData.description || null,
          price: productData.price,
          imageUrl: imageUrl,
          isAvailable: true,
          canShip: isShippable,
          sortOrder: successCount + 1,
        },
      });

      console.log(
        `✓ Created product: ${product.name} (€${product.price}) in ${
          productCategory.name
        }${imageUrl ? " with image" : ""}`
      );
      successCount++;

      // Add a small delay when uploading to DigitalOcean to avoid overwhelming the service
      if (imageUploader && productData.images.length > 0) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error(`Failed to create product "${productData.name}":`, error);
    }
  }

  // Create product options for coffee customization
  console.log("\n📋 Creating product options...");

  // First, let's find some specific products that need options
  const matchaDrinkProduct = await prisma.product.findFirst({
    where: {
      category: { menuId: menu.id },
      name: { contains: "Matcha" },
    },
  });

  const roseDrinkProduct = await prisma.product.findFirst({
    where: {
      category: { menuId: menu.id },
      name: { contains: "Rose" },
    },
  });

  const caffeineProduct = await prisma.product.findFirst({
    where: {
      category: { menuId: menu.id },
      OR: [{ name: { contains: "Latte" } }, { name: { contains: "Coffee" } }],
    },
  });

  // Create options for Matcha drinks
  if (matchaDrinkProduct) {
    // Select Matcha drink option
    const matchaSelectionOption = await prisma.productOption.create({
      data: {
        productId: matchaDrinkProduct.id,
        name: "Select Matcha drink",
        description: "Choose your matcha variety",
        type: "RADIO",
        isRequired: true,
        sortOrder: 1,
      },
    });

    await prisma.productOptionValue.createMany({
      data: [
        {
          optionId: matchaSelectionOption.id,
          name: "Normal",
          priceModifier: 0,
          isDefault: true,
          sortOrder: 1,
        },
        {
          optionId: matchaSelectionOption.id,
          name: "Strawberry Matcha",
          priceModifier: 0.3,
          isDefault: false,
          sortOrder: 2,
        },
      ],
    });

    // Milk option for Matcha
    const matchaMilkOption = await prisma.productOption.create({
      data: {
        productId: matchaDrinkProduct.id,
        name: "Milk option for Matcha",
        description: "Choose your preferred milk",
        type: "RADIO",
        isRequired: true,
        sortOrder: 2,
      },
    });

    await prisma.productOptionValue.createMany({
      data: [
        {
          optionId: matchaMilkOption.id,
          name: "Lactose-free Milk",
          priceModifier: 0,
          isDefault: true,
          sortOrder: 1,
        },
        {
          optionId: matchaMilkOption.id,
          name: "Oat Milk",
          priceModifier: 0,
          isDefault: false,
          sortOrder: 2,
        },
      ],
    });

    console.log(`✓ Created options for ${matchaDrinkProduct.name}`);
  }

  // Create options for Rose drinks
  if (roseDrinkProduct) {
    // Rose Drink 1: Milk option
    const roseMilkOption1 = await prisma.productOption.create({
      data: {
        productId: roseDrinkProduct.id,
        name: "Rose Drink 1: Milk option",
        description: "Choose your preferred milk",
        type: "RADIO",
        isRequired: true,
        sortOrder: 1,
      },
    });

    await prisma.productOptionValue.createMany({
      data: [
        {
          optionId: roseMilkOption1.id,
          name: "Lactose-free Milk",
          priceModifier: 0,
          isDefault: true,
          sortOrder: 1,
        },
        {
          optionId: roseMilkOption1.id,
          name: "Oat Milk",
          priceModifier: 0,
          isDefault: false,
          sortOrder: 2,
        },
      ],
    });

    // Rose Drink 1: Caffeine option
    const roseCaffeineOption1 = await prisma.productOption.create({
      data: {
        productId: roseDrinkProduct.id,
        name: "Rose Drink 1: Caffeine option",
        description: "Choose your caffeine base",
        type: "RADIO",
        isRequired: true,
        sortOrder: 2,
      },
    });

    await prisma.productOptionValue.createMany({
      data: [
        {
          optionId: roseCaffeineOption1.id,
          name: "Coffee",
          priceModifier: 0,
          isDefault: true,
          sortOrder: 1,
        },
        {
          optionId: roseCaffeineOption1.id,
          name: "Matcha",
          priceModifier: 0,
          isDefault: false,
          sortOrder: 2,
        },
      ],
    });

    // Rose Drink 1: Hot or Cold
    const roseHotColdOption1 = await prisma.productOption.create({
      data: {
        productId: roseDrinkProduct.id,
        name: "Rose Drink 1: Hot or Cold?",
        description: "Choose temperature and cream options",
        type: "RADIO",
        isRequired: true,
        sortOrder: 3,
      },
    });

    await prisma.productOptionValue.createMany({
      data: [
        {
          optionId: roseHotColdOption1.id,
          name: "Hot/Warm",
          priceModifier: 0,
          isDefault: true,
          sortOrder: 1,
        },
        {
          optionId: roseHotColdOption1.id,
          name: "Hot with Salted Cream top",
          priceModifier: 0.5,
          isDefault: false,
          sortOrder: 2,
        },
        {
          optionId: roseHotColdOption1.id,
          name: "Cold",
          priceModifier: 0,
          isDefault: false,
          sortOrder: 3,
        },
        {
          optionId: roseHotColdOption1.id,
          name: "Cold with Salted Cream top",
          priceModifier: 0.5,
          isDefault: false,
          sortOrder: 4,
        },
      ],
    });

    console.log(`✓ Created options for ${roseDrinkProduct.name}`);
  }

  // Create general caffeine choice option for coffee products
  if (caffeineProduct) {
    const chooseCaffeineOption = await prisma.productOption.create({
      data: {
        productId: caffeineProduct.id,
        name: "Choose caffeine",
        description: "Select your preferred coffee style",
        type: "RADIO",
        isRequired: true,
        sortOrder: 1,
      },
    });

    await prisma.productOptionValue.createMany({
      data: [
        {
          optionId: chooseCaffeineOption.id,
          name: "Salted Caramel Latte",
          priceModifier: 0,
          isDefault: true,
          sortOrder: 1,
        },
        {
          optionId: chooseCaffeineOption.id,
          name: "Salted Cream Coffee",
          priceModifier: 0,
          isDefault: false,
          sortOrder: 2,
        },
      ],
    });

    // Choose the snack option
    const chooseSnackOption = await prisma.productOption.create({
      data: {
        productId: caffeineProduct.id,
        name: "Choose the snack",
        description: "Select a dessert to pair with your drink",
        type: "RADIO",
        isRequired: false,
        sortOrder: 2,
      },
    });

    await prisma.productOptionValue.createMany({
      data: [
        {
          optionId: chooseSnackOption.id,
          name: "Traditional Tiramisu",
          priceModifier: 0,
          isDefault: true,
          sortOrder: 1,
        },
        {
          optionId: chooseSnackOption.id,
          name: "Pistachio Tiramisu",
          priceModifier: 0,
          isDefault: false,
          sortOrder: 2,
        },
        {
          optionId: chooseSnackOption.id,
          name: "Red Velvet Cheese Roll",
          priceModifier: 0,
          isDefault: false,
          sortOrder: 3,
        },
        {
          optionId: chooseSnackOption.id,
          name: "Pistachio Croissant",
          priceModifier: 0,
          isDefault: false,
          sortOrder: 4,
        },
      ],
    });

    console.log(
      `✓ Created caffeine and snack options for ${caffeineProduct.name}`
    );
  }

  console.log(`\n🎉 Bonbon Coffee seeding completed!`);
  console.log(`✓ Created ${successCount} products`);
  console.log(`✓ Updated ${updatedCount} products with images`);
  console.log(`⏭️ Skipped ${skipCount} existing products`);
  console.log(`📍 Location: ${location.name}`);
  console.log(`🏪 Merchant: ${merchant.name}`);
}

export { seedBonbonCoffee };
