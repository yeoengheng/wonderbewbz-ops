import Link from "next/link";

import { SignUp } from "@clerk/nextjs";
import { Globe } from "lucide-react";

import { APP_CONFIG } from "@/config/app-config";

export default function RegisterV2() {
  return (
    <>
      <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[350px]">
        <SignUp
          appearance={{
            elements: {
              formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
              card: "shadow-none",
              headerTitle: "text-3xl font-medium",
              headerSubtitle: "text-muted-foreground text-sm",
            },
          }}
        />
      </div>

      <div className="absolute top-5 flex w-full justify-end px-10">
        <div className="text-muted-foreground text-sm">
          Already have an account?{" "}
          <Link className="text-foreground" href="login">
            Login
          </Link>
        </div>
      </div>

      <div className="absolute bottom-5 flex w-full justify-between px-10">
        <div className="text-sm">{APP_CONFIG.copyright}</div>
        <div className="flex items-center gap-1 text-sm">
          <Globe className="text-muted-foreground size-4" />
          ENG
        </div>
      </div>
    </>
  );
}
