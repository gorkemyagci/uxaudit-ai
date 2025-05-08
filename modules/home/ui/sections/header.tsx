import Link from "next/link";

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 border-b border-indigo-100/20 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-20 items-center justify-center px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">
              UXAudit AI
            </span>
          </Link>
          <nav className="hidden md:flex gap-8">
            <Link href="#features" className="text-sm font-medium text-gray-600 transition-colors hover:text-indigo-600">
              Features
            </Link>
            <Link href="#benefits" className="text-sm font-medium text-gray-600 transition-colors hover:text-indigo-600">
              Benefits
            </Link>
            <Link href="#faq" className="text-sm font-medium text-gray-600 transition-colors hover:text-indigo-600">
              FAQ
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4 ml-auto"></div>
      </div>
    </header>
  );
}; 