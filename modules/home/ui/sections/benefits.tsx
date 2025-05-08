import { ArrowRight, Zap, Clock, TrendingUp } from "lucide-react";

const benefits = [
  {
    icon: Zap,
    title: "Instant Analysis",
    description: "Get comprehensive UX analysis in minutes, not days. No need to wait for manual audits."
  },
  {
    icon: Clock,
    title: "Save Time & Resources",
    description: "Automate repetitive UX testing tasks and focus on implementing improvements."
  },
  {
    icon: TrendingUp,
    title: "Improve Conversion",
    description: "Identify and fix UX issues that might be affecting your conversion rates."
  }
];

export const Benefits = () => {
  return (
    <section id="benefits" className="py-20 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/30 to-white -z-10" />
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-teal-100/30 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-indigo-100/30 rounded-full blur-3xl -z-10" />
      
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50/50 px-4 py-1.5 text-sm text-indigo-600">
            <span className="mr-2">💫</span>
            Why Choose Us
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Transform Your Website's UX Today
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Experience the power of AI-driven UX analysis
          </p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group relative rounded-2xl border border-indigo-100 bg-white p-8 shadow-sm transition-all hover:shadow-md hover:border-indigo-200 hover:scale-105 duration-300"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-teal-500 text-white group-hover:from-indigo-600 group-hover:to-teal-600 transition-colors">
                <benefit.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">{benefit.title}</h3>
              <p className="mt-4 text-gray-600">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-16 text-center">
          <a
            href="/signup"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium transition-all duration-300 hover:scale-105"
          >
            Start your free audit now
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}; 