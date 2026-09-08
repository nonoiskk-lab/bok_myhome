import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Blog — Property Buying Guides & Market Insights",
  description: "Home loan tips, resale property guides and local Dhanbad real estate market insights from BOK MyHome.",
};

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { publishedAt: { not: null } },
    include: { category: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="container-page py-12">
      <h1 className="font-serif text-3xl text-navy-950">The BOK MyHome Blog</h1>
      <p className="mt-2 max-w-xl text-slate-600">
        Buying guides, home loan basics and local market insights for Dhanbad.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group rounded-2xl border border-navy-950/8 bg-white p-6 transition-shadow hover:shadow-md"
          >
            {post.category && (
              <span className="text-xs font-bold uppercase tracking-wide text-gold-600">{post.category.name}</span>
            )}
            <h2 className="mt-2 font-semibold text-navy-950 group-hover:text-gold-600">{post.title}</h2>
            <p className="mt-2 line-clamp-3 text-sm text-slate-600">{post.excerpt}</p>
            <p className="mt-3 text-xs text-slate-400">
              {post.author} · {post.publishedAt?.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
