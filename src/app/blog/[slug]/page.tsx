import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { ButtonLink } from "@/components/ui/Button";

async function getPost(slug: string) {
  return prisma.blogPost.findUnique({ where: { slug }, include: { category: true } });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: post.metaTitle ?? post.title,
    description: post.metaDescription ?? post.excerpt,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <article className="container-page max-w-3xl py-12">
      <nav className="mb-4 text-xs text-slate-500">
        <Link href="/blog">Blog</Link> / <span className="text-navy-950">{post.title}</span>
      </nav>
      {post.category && (
        <span className="text-xs font-bold uppercase tracking-wide text-gold-600">{post.category.name}</span>
      )}
      <h1 className="mt-2 font-serif text-3xl text-navy-950 sm:text-4xl">{post.title}</h1>
      <p className="mt-2 text-xs text-slate-400">
        {post.author} ·{" "}
        {post.publishedAt?.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
      </p>

      <div className="prose prose-slate mt-8 max-w-none text-slate-700">
        {post.content.split("\n\n").map((para, i) => (
          <p key={i} className="mb-4 leading-relaxed">
            {para}
          </p>
        ))}
      </div>

      <div className="mt-10 rounded-2xl bg-navy-950 p-6 text-center">
        <p className="font-serif text-lg text-cream-50">Have questions about buying or selling in Dhanbad?</p>
        <div className="mt-4 flex justify-center gap-3">
          <ButtonLink href="/properties" variant="secondary">
            Browse Properties
          </ButtonLink>
          <ButtonLink href="/contact" variant="outline" className="border-cream-50/30 text-cream-50 hover:border-cream-50">
            Talk to an Expert
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
