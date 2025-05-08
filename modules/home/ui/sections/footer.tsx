import Link from "next/link";
import { Github, Twitter } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">UXAudit AI</h3>
            <p className="text-sm text-muted-foreground">
              AI-powered UX analysis tool for better user experiences
            </p>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} UXAudit AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}; 