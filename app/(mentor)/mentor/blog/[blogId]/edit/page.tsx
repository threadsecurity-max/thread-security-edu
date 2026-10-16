import { redirect } from 'next/navigation';

export default async function MentorBlogEditRedirectPage({
  params,
}: {
  params: Promise<{ blogId: string }>;
}) {
  const { blogId } = await params;
  redirect(`/mentor/blogs/${blogId}/edit`);
}
