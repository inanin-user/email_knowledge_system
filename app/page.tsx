
"use client";

import { LoginPage } from "@userin/auth-kit";
import { withBasePath } from "@/lib/basePath";

export default function Home() {
  return (
    <LoginPage
      apiUrl={withBasePath("/api/auth/login")}
      initialRedirectUrl={"/add-email-case"}
      onSuccess={(user) => {
        console.log("Auth kit login succeeded:", user.username);
      }}
    />
  );
}