import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { ACTIVE_LISTING_STATUSES } from "@/lib/constants";

const BASE_URL = "https://www.bokmyhome.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [properties, locations, posts] = await Promise.all([
    prisma.property.findMany({
      where: { listingStatus: { in: ACTIVE_LISTING_STATUSES } },
      select: { slug: true, updatedAt: true },
    }),
    prisma.location.findMany({ select: { slug: true } }),
    prisma.blogPost.findMany({
      where: { publishedAt: { not: null } },
      select: { slug: true, createdAt: true },
    }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/properties",
    "/premium",
    "/sell",
    "/about",
    "/services",
    "/blog",
    "/contact",
    "/legal/privacy-policy",
    "/legal/terms",
    "/legal/disclaimer",
  ].map((path) => ({
    url: `${BASE_URL}${path}`,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  const propertyRoutes: MetadataRoute.Sitemap = properties.map((p) => ({
    url: `${BASE_URL}/properties/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const locationRoutes: MetadataRoute.Sitemap = locations.map((l) => ({
    url: `${BASE_URL}/properties/dhanbad/${l.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const blogRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.createdAt,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...propertyRoutes, ...locationRoutes, ...blogRoutes];
}
