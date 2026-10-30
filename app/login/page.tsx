import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { LogIn, Sparkles } from "lucide-react";

import { signInWithGoogle } from "@/app/login/actions";
import { ThemeToggle } from "@/components/theme-toggle";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser } from "@/lib/dal";

export const metadata = {
  title: "Sign in",
};

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <main className="relative grid min-h-svh place-items-center px-4 py-16">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm space-y-6">
        <div className="flex items-center justify-center gap-3">
          <span className="paper-brand-mark grid size-10 place-items-center">
            <Sparkles className="size-4" />
          </span>
          <div>
            <p className="font-serif text-lg font-semibold leading-none">P2Q</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Prompt to quiz
            </p>
          </div>
        </div>

        <Suspense fallback={<LoginCardSkeleton />}>
          <LoginContent searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function LoginContent({
  searchParams,
}: Pick<PageProps<"/login">, "searchParams">) {
  await connection();

  const [user, params] = await Promise.all([getCurrentUser(), searchParams]);

  if (user) {
    redirect("/dashboard");
  }

  return (
    <Card>
      <CardHeader>
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          Welcome back
        </p>
        <CardTitle className="text-xl">Sign in to P2Q</CardTitle>
        <CardDescription>
          Use your Google account to keep your quizzes and attempts private.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {params.error ? (
          <Alert variant="destructive">
            <AlertDescription>
              We could not complete sign-in. Please try again.
            </AlertDescription>
          </Alert>
        ) : null}

        <form action={signInWithGoogle}>
          <Button type="submit" className="w-full">
            <LogIn />
            Continue with Google
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function LoginCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <span className="h-3 w-24 animate-pulse rounded bg-muted" />
        <span className="mt-2 h-6 w-40 animate-pulse rounded bg-muted" />
        <span className="mt-2 h-4 w-full animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <span className="block h-8 w-full animate-pulse rounded-sm bg-muted" />
      </CardContent>
    </Card>
  );
}
