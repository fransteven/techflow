import { auth } from "@/lib/auth"; // path to your better auth config
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
