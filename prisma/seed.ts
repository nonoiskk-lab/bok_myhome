import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { AMENITIES_LIST } from "../src/lib/constants";
import { slugify } from "../src/lib/format";

const prisma = new PrismaClient();

const LOCALITIES: Array<{ locality: string; pincode: string; description: string }> = [
  { locality: "Hirapur", pincode: "826001", description: "A well-connected residential pocket close to Dhanbad's main market and railway station." },
  { locality: "Bank More", pincode: "826001", description: "Dhanbad's commercial heart — shops, offices and high-footfall retail frontage." },
  { locality: "Saraidhela", pincode: "828127", description: "A fast-growing residential belt popular with families and first-time buyers." },
  { locality: "Hirak Road", pincode: "826001", description: "Established locality with a mix of independent houses and mid-rise apartments." },
  { locality: "Digwadih", pincode: "826001", description: "Quiet, greener suburb with plotted developments and independent villas." },
  { locality: "Kenduadih", pincode: "826004", description: "Emerging area with new-launch apartment projects and good road connectivity." },
];

const PROPERTY_TEMPLATES = [
  {
    title: "3 BHK Resale Flat in Hirapur",
    propertyType: "FLAT",
    transactionType: "RESALE",
    status: "RESALE",
    price: 5800000,
    bedrooms: 3,
    bathrooms: 2,
    builtupArea: 1450,
    carpetArea: 1250,
    floor: 4,
    totalFloors: 8,
    propertyAge: 6,
    facing: "EAST",
    furnishing: "SEMI_FURNISHED",
    parking: 1,
    image: "prop-1.svg",
    featured: true,
    verified: true,
    locality: "Hirapur",
    description:
      "A bright, well-ventilated 3 BHK on the 4th floor with an east-facing balcony overlooking a landscaped courtyard. Recently repainted, modular kitchen fitted, close to schools and the main market.",
  },
  {
    title: "2 BHK Ready-to-Move Apartment in Saraidhela",
    propertyType: "APARTMENT",
    transactionType: "BUY",
    status: "READY_TO_MOVE",
    price: 3450000,
    bedrooms: 2,
    bathrooms: 2,
    builtupArea: 980,
    carpetArea: 850,
    floor: 2,
    totalFloors: 5,
    propertyAge: 1,
    facing: "NORTH",
    furnishing: "UNFURNISHED",
    parking: 1,
    image: "prop-7.svg",
    featured: true,
    verified: true,
    locality: "Saraidhela",
    description:
      "Brand-new 2 BHK in a gated community with 24x7 security, power backup and a children's play area. Immediate possession, clear title, home-loan approved project.",
  },
  {
    title: "4 BHK Premium Villa in Digwadih",
    propertyType: "VILLA",
    transactionType: "BUY",
    status: "READY_TO_MOVE",
    price: 18500000,
    bedrooms: 4,
    bathrooms: 4,
    builtupArea: 3200,
    carpetArea: 2800,
    floor: 0,
    totalFloors: 2,
    propertyAge: 2,
    facing: "NORTH_EAST",
    furnishing: "FURNISHED",
    parking: 3,
    image: "prop-8.svg",
    featured: true,
    premium: true,
    verified: true,
    locality: "Digwadih",
    description:
      "An architect-designed independent villa on a 4,500 sq.ft plot with private garden, home theatre room and a dedicated staff quarter. Premium fittings throughout.",
  },
  {
    title: "Independent House for Sale in Hirak Road",
    propertyType: "HOUSE",
    transactionType: "RESALE",
    status: "RESALE",
    price: 7200000,
    bedrooms: 3,
    bathrooms: 3,
    builtupArea: 1800,
    carpetArea: 1600,
    floor: 0,
    totalFloors: 2,
    propertyAge: 12,
    facing: "SOUTH",
    furnishing: "SEMI_FURNISHED",
    parking: 2,
    image: "prop-3.svg",
    verified: true,
    locality: "Hirak Road",
    description:
      "Corner-plot independent house with an additional terrace floor, separate entrance for the ground floor and mature fruit trees in the backyard.",
  },
  {
    title: "Residential Plot in Digwadih Extension",
    propertyType: "PLOT",
    transactionType: "BUY",
    status: "READY_TO_MOVE",
    price: 2100000,
    builtupArea: 2000,
    facing: "EAST",
    parking: 0,
    image: "prop-4.svg",
    verified: true,
    locality: "Digwadih",
    description:
      "Clear-titled residential plot in an approved layout with wide approach road, electricity connection on-site and boundary wall on three sides.",
  },
  {
    title: "Commercial Shop Space in Bank More",
    propertyType: "SHOP",
    transactionType: "BUY",
    status: "READY_TO_MOVE",
    price: 9500000,
    builtupArea: 650,
    floor: 0,
    totalFloors: 3,
    facing: "WEST",
    parking: 0,
    image: "prop-5.svg",
    featured: true,
    verified: true,
    locality: "Bank More",
    description:
      "High-footfall ground-floor shop on the main Bank More stretch, ideal for retail or a bank branch. Wide frontage and existing shutter/signage infrastructure.",
  },
  {
    title: "Furnished Office Space in Bank More",
    propertyType: "OFFICE",
    transactionType: "RENT",
    status: "READY_TO_MOVE",
    price: 45000,
    builtupArea: 1200,
    floor: 3,
    totalFloors: 6,
    furnishing: "FURNISHED",
    facing: "NORTH",
    parking: 2,
    image: "prop-6.svg",
    verified: true,
    locality: "Bank More",
    description:
      "Fully furnished 1,200 sq.ft office with 4 cabins, a conference room and a reception area. Elevator access, backup power and ample visitor parking.",
  },
  {
    title: "2 BHK Flat for Rent in Kenduadih",
    propertyType: "FLAT",
    transactionType: "RENT",
    status: "READY_TO_MOVE",
    price: 12000,
    bedrooms: 2,
    bathrooms: 2,
    builtupArea: 900,
    floor: 1,
    totalFloors: 4,
    furnishing: "SEMI_FURNISHED",
    facing: "EAST",
    parking: 1,
    image: "prop-7.svg",
    verified: true,
    locality: "Kenduadih",
    description:
      "Well-maintained 2 BHK close to Kenduadih market with reliable water supply, covered parking and a friendly resident community.",
  },
  {
    title: "New Launch 3 BHK Apartment in Kenduadih",
    propertyType: "APARTMENT",
    transactionType: "BUY",
    status: "NEW_LAUNCH",
    price: 6200000,
    bedrooms: 3,
    bathrooms: 3,
    builtupArea: 1550,
    carpetArea: 1320,
    floor: 6,
    totalFloors: 12,
    facing: "NORTH_EAST",
    furnishing: "UNFURNISHED",
    parking: 1,
    image: "prop-1.svg",
    featured: true,
    premium: true,
    verified: true,
    locality: "Kenduadih",
    description:
      "A new-launch high-rise with clubhouse, swimming pool and landscaped gardens. Flexible payment plan, RERA registered, possession in 18 months.",
  },
  {
    title: "1 BHK Compact Flat in Hirapur",
    propertyType: "FLAT",
    transactionType: "RESALE",
    status: "RESALE",
    price: 1950000,
    bedrooms: 1,
    bathrooms: 1,
    builtupArea: 520,
    floor: 3,
    totalFloors: 4,
    propertyAge: 8,
    facing: "SOUTH",
    furnishing: "UNFURNISHED",
    parking: 0,
    image: "prop-9.svg",
    verified: true,
    locality: "Hirapur",
    description:
      "Compact, budget-friendly 1 BHK ideal for a small family or investment rental. Walking distance to Hirapur market and bus stand.",
  },
  {
    title: "Agricultural Land near Saraidhela Bypass",
    propertyType: "LAND",
    transactionType: "BUY",
    status: "READY_TO_MOVE",
    price: 3500000,
    builtupArea: 43560,
    facing: "NORTH",
    parking: 0,
    image: "prop-11.svg",
    locality: "Saraidhela",
    description:
      "One-acre agricultural land along the Saraidhela bypass with direct road frontage — suitable for future development subject to local approvals.",
  },
  {
    title: "5 BHK Luxury Villa in Digwadih",
    propertyType: "VILLA",
    transactionType: "BUY",
    status: "READY_TO_MOVE",
    price: 29500000,
    bedrooms: 5,
    bathrooms: 5,
    builtupArea: 4600,
    carpetArea: 4000,
    totalFloors: 3,
    propertyAge: 1,
    facing: "EAST",
    furnishing: "FURNISHED",
    parking: 4,
    image: "prop-2.svg",
    premium: true,
    verified: true,
    locality: "Digwadih",
    description:
      "An expansive 5 BHK luxury villa with a private lawn, rooftop terrace lounge and imported fittings — one of Dhanbad's most exclusive private residences.",
  },
];

async function main() {
  console.log("Seeding database...");

  const passwordHash = await bcrypt.hash("Admin@123", 10);
  await prisma.user.upsert({
    where: { email: "admin@bokmyhome.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@bokmyhome.com",
      phone: "9000000001",
      passwordHash,
      role: "SUPER_ADMIN",
    },
  });

  const agentUser = await prisma.user.upsert({
    where: { email: "agent@bokmyhome.com" },
    update: {},
    create: {
      name: "Rohit Kumar",
      email: "agent@bokmyhome.com",
      phone: "9000000002",
      passwordHash: await bcrypt.hash("Agent@123", 10),
      role: "AGENT",
    },
  });

  const agent = await prisma.agent.upsert({
    where: { userId: agentUser.id },
    update: {},
    create: {
      userId: agentUser.id,
      designation: "Senior Property Consultant",
      bio: "8+ years helping families buy, sell and rent property across Dhanbad.",
      active: true,
    },
  });

  const amenities = await Promise.all(
    AMENITIES_LIST.map((name) =>
      prisma.amenity.upsert({ where: { name }, update: {}, create: { name } })
    )
  );

  const locations = await Promise.all(
    LOCALITIES.map((loc) =>
      prisma.location.upsert({
        where: { slug: slugify(loc.locality) },
        update: {},
        create: {
          city: "Dhanbad",
          locality: loc.locality,
          pincode: loc.pincode,
          slug: slugify(loc.locality),
          description: loc.description,
        },
      })
    )
  );
  const locationByName = Object.fromEntries(locations.map((l) => [l.locality, l]));

  await prisma.property.deleteMany();

  let counter = 10001;
  for (const tpl of PROPERTY_TEMPLATES) {
    const location = locationByName[tpl.locality];
    const humanId = `BOK-${counter++}`;
    const slug = `${slugify(tpl.title)}-${humanId.toLowerCase()}`;
    const pricePerSqft = tpl.builtupArea ? Math.round(tpl.price / tpl.builtupArea) : null;

    const property = await prisma.property.create({
      data: {
        propertyId: humanId,
        slug,
        title: tpl.title,
        description: tpl.description,
        propertyType: tpl.propertyType,
        transactionType: tpl.transactionType,
        status: tpl.status,
        listingStatus: "PUBLISHED",
        featured: Boolean(tpl.featured),
        premium: Boolean(tpl.premium),
        verified: Boolean(tpl.verified),
        price: tpl.price,
        priceNegotiable: tpl.transactionType !== "RENT",
        pricePerSqft: pricePerSqft ?? undefined,
        bedrooms: tpl.bedrooms,
        bathrooms: tpl.bathrooms,
        builtupArea: tpl.builtupArea,
        carpetArea: tpl.carpetArea,
        floor: tpl.floor,
        totalFloors: tpl.totalFloors,
        propertyAge: tpl.propertyAge,
        facing: tpl.facing,
        furnishing: tpl.furnishing,
        parking: tpl.parking,
        ownership: "Freehold",
        addressLine: `${tpl.locality}, Dhanbad`,
        locationId: location.id,
        agentId: agent.id,
        views: Math.floor(Math.random() * 400) + 20,
        enquiries: Math.floor(Math.random() * 30),
        images: {
          create: [
            { url: `/images/properties/${tpl.image}`, isCover: true, sortOrder: 0, alt: tpl.title },
            { url: `/images/properties/prop-1.svg`, sortOrder: 1, alt: `${tpl.title} - living room` },
            { url: `/images/properties/prop-6.svg`, sortOrder: 2, alt: `${tpl.title} - interior` },
          ],
        },
        amenities: {
          create: amenities
            .filter(() => Math.random() > 0.4)
            .slice(0, 8)
            .map((a) => ({ amenityId: a.id })),
        },
      },
    });
    console.log(`Created ${property.propertyId}: ${property.title}`);
  }

  const categories = await Promise.all(
    [
      "Property Buying Guide",
      "Home Loan",
      "Real Estate Investment",
      "Resale Property",
      "Local Property Market",
    ].map((name) =>
      prisma.category.upsert({
        where: { slug: slugify(name) },
        update: {},
        create: { name, slug: slugify(name) },
      })
    )
  );

  const posts = [
    {
      title: "5 Things to Check Before Buying a Resale Flat in Dhanbad",
      category: "Resale Property",
      excerpt:
        "Buying resale saves time and often money — but only if you verify the right documents and physical condition first.",
      content:
        "Buying a resale flat can be a smart shortcut to a ready-to-move home, but it comes with its own checklist. Start with the title deed and encumbrance certificate to confirm clear ownership. Physically inspect plumbing, electrical wiring and any seepage — repairs are your cost once you sign. Confirm outstanding society dues, property tax and NOC from the housing society if applicable. Finally, get a fair market valuation independent of the seller's asking price before you negotiate.",
    },
    {
      title: "Home Loan Basics: What First-Time Buyers in Dhanbad Should Know",
      category: "Home Loan",
      excerpt: "A plain-language walkthrough of eligibility, down payment and EMI planning for your first home loan.",
      content:
        "Most lenders finance 75-90% of a property's value, so plan for the remaining down payment well in advance. Your EMI eligibility depends on income, existing obligations and tenure — use an EMI calculator early to set a realistic budget rather than falling in love with a property first. Keep your credit score healthy and your paperwork (income proof, ITRs, bank statements) ready to speed up approval.",
    },
    {
      title: "Is Dhanbad a Good Market for Real Estate Investment Right Now?",
      category: "Real Estate Investment",
      excerpt: "A look at what's driving demand in localities like Saraidhela, Hirapur and Bank More.",
      content:
        "Dhanbad's real estate market has benefited from steady infrastructure investment and its role as a regional commercial hub. Localities like Saraidhela have seen a wave of new apartment launches aimed at young families, while Bank More continues to command premium commercial rents. As with any market, returns are not guaranteed — buyers should evaluate connectivity, upcoming development plans and rental demand in the specific locality rather than the city as a whole.",
    },
    {
      title: "A First-Time Buyer's Guide to Choosing the Right Locality",
      category: "Property Buying Guide",
      excerpt: "Price per sq.ft is only one part of the decision — here's what else matters.",
      content:
        "Beyond price, weigh commute time to work, proximity to schools and hospitals, and the general trajectory of the neighbourhood. Visit at different times of day to gauge traffic and noise. Talk to existing residents where possible. A slightly higher budget in a well-connected locality often holds its value better over time than the cheapest option in an underserved one.",
    },
  ];

  for (const post of posts) {
    const category = categories.find((c) => c.name === post.category);
    await prisma.blogPost.upsert({
      where: { slug: slugify(post.title) },
      update: {},
      create: {
        title: post.title,
        slug: slugify(post.title),
        excerpt: post.excerpt,
        content: post.content,
        author: "BOK MyHome Editorial",
        metaTitle: post.title,
        metaDescription: post.excerpt,
        publishedAt: new Date(),
        categoryId: category?.id,
      },
    });
  }

  console.log("Seed complete.");
  console.log(`Admin login: admin@bokmyhome.com / Admin@123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
