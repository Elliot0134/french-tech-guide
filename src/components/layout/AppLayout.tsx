import { ReactNode } from "react";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b py-4">
        <div className="container flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <img 
              src="/src/assets/french-tech-logo.png" 
              alt="French Tech Logo" 
              className="h-10 w-auto" 
            />
            <span className="font-semibold text-lg hidden sm:inline-block">
              Audit French Tech
            </span>
          </a>
        </div>
      </header>

      <main className="flex-1 py-6 md:py-12">
        <div className="container">
          {children}
        </div>
      </main>

      <footer className="border-t py-6 bg-secondary/50">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} La French Tech. Tous droits réservés.</p>
          <p className="mt-1">
            Plateforme d'audit pour les startups et projets entrepreneuriaux.
          </p>
        </div>
      </footer>
    </div>
  );
}