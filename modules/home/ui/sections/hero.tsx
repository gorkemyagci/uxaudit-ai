import { Button } from "@/components/ui/button";
import Link from "next/link";

export const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-white -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-teal-100/30 via-transparent to-transparent -z-10" />
      
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-8 inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50/50 px-4 py-1.5 text-sm text-indigo-600">
            <span className="mr-2">✨</span>
            AI-Powered UX Analysis Tool
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Transform Your Website's
            <span className="block mt-2 bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">
              User Experience
            </span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 leading-relaxed">
            Get instant, comprehensive UX analysis of your website. Our AI-powered tool checks accessibility, 
            usability, and design best practices to help you create better user experiences.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-teal-500 hover:from-indigo-700 hover:to-teal-600 text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:scale-105" asChild>
              <Link href="/signup">Start Free Audit</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-indigo-200 text-gray-600 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-300 hover:scale-105" asChild>
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
          
          {/* Stats */}
          <div className="mt-16 flex flex-row items-center justify-center gap-10 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">1min</div>
              <div className="mt-1 text-sm text-gray-600">Average Analysis</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}; 