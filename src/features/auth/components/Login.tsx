"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import Image from "next/image";
import { Loader2Icon } from "lucide-react";

const loginSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type loginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const router = useRouter();

  const form = useForm<loginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  /*
   * Kaunsa action chal raha hai ye track karte hain. react-hook-form ka
   * isSubmitting sirf email wale form ko cover karta hai, social buttons ko
   * nahi - isliye click karne pe screen "jam" lagti thi. Success pe hum ise
   * reset nahi karte, kyunki uske baad redirect hona hai.
   */
  const [pending, setPending] = useState<
    "credentials" | "github" | "google" | null
  >(null);

  const signInGithub = async () => {
    setPending("github");
    await authClient.signIn.social(
      {
        provider: "github",
      },
      {
        onSuccess: () => {
          router.push("/");
        },
        onError: (ctx) => {
          setPending(null);
          toast.error(ctx.error.message || "Something went wrong");
        },
      },
    );
  };

  const signInGoogle = async () => {
    setPending("google");
    await authClient.signIn.social(
      {
        provider: "google",
      },
      {
        onSuccess: () => {
          router.push("/");
        },
        onError: (ctx) => {
          setPending(null);
          toast.error(ctx.error.message || "Something went wrong");
        },
      },
    );
  };

  const onSubmit = async (values: loginFormValues) => {
    setPending("credentials");
    // Handle login logic here
    await authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
        callbackURL: "/",
      },
      {
        onSuccess: () => {
          router.push("/");
        },
        onError: (ctx: any) => {
          setPending(null);
          toast.error(ctx.error.message);
        },
      },
    );
  };

  const isPending = pending !== null || form.formState.isSubmitting;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Login to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-6">
                <div className="flex flex-col gap-4">
                  <Button
                    onClick={signInGithub}
                    variant="outline"
                    className="w-full"
                    type="button"
                    disabled={isPending}
                  >
                    {pending === "github" ? (
                      <Loader2Icon className="size-5 animate-spin" />
                    ) : (
                      <Image
                        alt="GitHub"
                        src="/logos/github.svg"
                        width={20}
                        height={20}
                      />
                    )}
                    Continue with GitHub
                  </Button>
                  <Button
                    onClick={signInGoogle}
                    variant="outline"
                    className="w-full"
                    type="button"
                    disabled={isPending}
                  >
                    {pending === "google" ? (
                      <Loader2Icon className="size-5 animate-spin" />
                    ) : (
                      <Image
                        alt="Google"
                        src="/logos/google.svg"
                        width={20}
                        height={20}
                      />
                    )}
                    Continue with Google
                  </Button>
                </div>
                <div className="grid gap-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="m@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="*********"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isPending}>
                    {pending === "credentials" && (
                      <Loader2Icon className="size-4 animate-spin" />
                    )}
                    {pending === "credentials" ? "Logging in..." : "Login"}
                  </Button>
                </div>
                <div className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link href="/signup" className="underline underline-offset-4">
                    Sign up
                  </Link>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
