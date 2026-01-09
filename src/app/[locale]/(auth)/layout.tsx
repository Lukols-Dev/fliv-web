import type { ReactNode } from "react";
import Image from "next/image";
import { LanguageToggle } from "@/components/custom/language-toggle";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative container flex-1 shrink-0 items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      {/* Left side */}
      <div className="text-primary relative hidden h-full flex-col overflow-hidden p-10 lg:flex ">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="/images/truck.jpg"
            alt="Truck background"
            fill
            priority
            className="object-cover object-center"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center justify-center lg:h-screen lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center gap-6 sm:w-[350px]">
          <div className="absolute top-4 right-4 md:top-8 md:right-8">
            <LanguageToggle />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
