import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  await auth.api.signOut({
    headers: await headers(),
  });

  return NextResponse.redirect(new URL("/sign-in", request.url));
}
