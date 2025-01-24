import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';

export default function FeaturedPosts({ posts }) {
  return (
    <section className="py-12 bg-background">
      <div className="container px-4 md:px-6">
        <h2 className="text-3xl font-bold tracking-tighter mb-8">Featured Posts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.slice(0, 6).map((post) => (
            <Link key={post._id} href={`/posts/${post.slug}`}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader className="p-0">
                  <div className="relative w-full h-48">
                    <Image
                      src={post?.imageUrl}
                      alt={post?.title || "Post image"}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="mb-2 line-clamp-1">{post?.title}</CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {post?.content?.replace(/<\/?[^>]+(>|$)/g, "")}
                  </p>
                  <div className="flex items-center mt-4 space-x-2">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden">
                      <Image
                        src={post?.createdBy?.profilePicture}
                        alt={post?.createdBy?.displayName || "Author"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{post?.createdBy?.displayName}</p>
                      <p className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
