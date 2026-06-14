"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { Bounce, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <body className="min-h-full flex bg-background text-foreground">
      {!isLoginPage && <Sidebar />}

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-x-hidden">
        {!isLoginPage && (
          <>
            {/* Mobile Top Bar */}
            <div className="h-16 lg:hidden border-b border-border bg-background/80 backdrop-blur-md fixed top-0 w-full z-40 no-print flex items-center px-4">
              <span className="ml-12 font-bold tracking-tight text-xs uppercase opacity-70">Shahin Traders</span>
            </div>
            <div className="h-16 lg:hidden no-print" />
          </>
        )}
        
        <div className={isLoginPage ? "" : "max-w-[1600px] mx-auto"}>
          {children}
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick={false}
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            transition={Bounce}
          />
        </div>
      </main>
    </body>
  );
}
