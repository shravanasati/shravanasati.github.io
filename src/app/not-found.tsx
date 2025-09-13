import BlurFade from "@/components/magicui/blur-fade";
import BlurFadeText from "@/components/magicui/blur-fade-text";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const BLUR_FADE_DELAY = 0.04;

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[80vh] space-y-8 text-center px-4">
      <div className="space-y-6">
        <BlurFade delay={BLUR_FADE_DELAY}>
          <div className="text-8xl sm:text-9xl font-bold text-muted-foreground/20">
            404
          </div>
        </BlurFade>

        <div className="space-y-3 flex flex-col items-center">
          <BlurFadeText
            delay={BLUR_FADE_DELAY * 2}
            className="text-3xl sm:text-4xl font-bold tracking-tight"
            text="Page Not Found"
          />

          <BlurFade delay={BLUR_FADE_DELAY * 3}>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Looks like you've ventured into uncharted territory. The page you're looking for doesn't exist.
            </p>
          </BlurFade>
        </div>

        <BlurFade delay={BLUR_FADE_DELAY * 4}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button asChild size="lg">
              <Link href="/">
                Back to Home
              </Link>
            </Button>

            <Button variant="outline" asChild size="lg">
              <Link href="/blog">
                Browse Blog
              </Link>
            </Button>
          </div>
        </BlurFade>
      </div>

      <BlurFade delay={BLUR_FADE_DELAY * 5}>
        <div className="text-sm text-muted-foreground mt-8">
          Lost? Try navigating back or exploring my latest work.
        </div>
      </BlurFade>
    </main>
  );
}