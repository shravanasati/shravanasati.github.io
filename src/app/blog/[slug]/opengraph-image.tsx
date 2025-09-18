import { ImageResponse } from "next/og";
import { getPost } from "@/data/blog";
import { formatDate } from "@/lib/utils";

export const runtime = "nodejs";
export const alt = "Blog Post";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);

  if (!post) {
    // Fallback for posts that don't exist
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "white",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div
            style={{
              fontSize: 48,
              fontWeight: 600,
              color: "#374151",
            }}
          >
            Post not found
          </div>
        </div>
      ),
      {
        ...size,
      }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          backgroundColor: "white",
          padding: "80px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            fontSize: 32,
            fontWeight: 500,
            color: "#6B7280",
            letterSpacing: "-0.025em",
          }}
        >
          blog _
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 600,
            color: "#111827",
            lineHeight: 1.1,
            letterSpacing: "-0.025em",
            maxWidth: "100%",
            textAlign: "left",
          }}
        >
          {post.metadata.title}
        </div>

        {/* Published Date */}
        <div
          style={{
            fontSize: 24,
            fontWeight: 400,
            color: "#6B7280",
          }}
        >
          {formatDate(post.metadata.publishedAt)}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
