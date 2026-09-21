"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { OUTLETS, DEFAULT_OUTLET, OutletConfig, getOutletById } from "@/lib/outlets";

interface OutletContextType {
  activeOutlet: OutletConfig;
  setOutlet: (outletId: string) => void;
  outlets: OutletConfig[];
}

const OutletContext = createContext<OutletContextType>({
  activeOutlet: DEFAULT_OUTLET,
  setOutlet: () => {},
  outlets: OUTLETS,
});

export function OutletProvider({
  children,
  initialOutletId,
}: {
  children: React.ReactNode;
  initialOutletId?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeOutletId, setActiveOutletId] = useState<string>(
    initialOutletId || DEFAULT_OUTLET.id
  );

  // Sync if route belongs specifically to an outlet
  useEffect(() => {
    if (pathname.startsWith("/oreta")) {
      setActiveOutletId("oreta-world");
    } else if (pathname.startsWith("/rns")) {
      setActiveOutletId("rns-world");
    } else if (pathname.startsWith("/symphony")) {
      setActiveOutletId("symphony-world");
    } else if (
      pathname.startsWith("/hygiene") ||
      pathname.startsWith("/glass") ||
      pathname.startsWith("/fridge") ||
      pathname.startsWith("/kitchen") ||
      pathname.startsWith("/production") ||
      pathname.startsWith("/puff-room") ||
      pathname.startsWith("/cake-room")
    ) {
      setActiveOutletId("bakery");
    }
  }, [pathname]);

  const setOutlet = (outletId: string) => {
    setActiveOutletId(outletId);
    document.cookie = `pnr_outlet=${outletId}; path=/; max-age=31536000; SameSite=Lax`;

    // When on dashboard, refresh with new query param
    if (pathname === "/dashboard" || pathname === "/") {
      router.push(`/dashboard?outlet=${outletId}`);
    } else if (pathname.startsWith("/admin")) {
      router.refresh();
    } else {
      // If we are currently on an outlet-specific sheet and changing to a different outlet, navigate to dashboard
      const targetOutlet = getOutletById(outletId);
      if (targetOutlet && targetOutlet.sheets.length > 0) {
        router.push(targetOutlet.sheets[0].route);
      } else {
        router.push(`/dashboard?outlet=${outletId}`);
      }
    }
  };

  const activeOutlet = getOutletById(activeOutletId);

  return (
    <OutletContext.Provider value={{ activeOutlet, setOutlet, outlets: OUTLETS }}>
      {children}
    </OutletContext.Provider>
  );
}

export function useOutlet() {
  return useContext(OutletContext);
}
