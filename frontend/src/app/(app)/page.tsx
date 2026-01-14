import { DEFAULT_LOGIN_REDIRECT } from "@/lib/routes";
import { redirect } from "next/navigation";

export default function Page() {
  redirect(DEFAULT_LOGIN_REDIRECT);
}
