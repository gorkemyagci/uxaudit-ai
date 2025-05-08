import { CheckCircle2, Accessibility, Layout, Smartphone, Zap, FileText, Lightbulb } from "lucide-react";

const features = [
  {
    icon: Accessibility,
    title: "Automated Accessibility Checks",
    description: "Comprehensive WCAG compliance testing with detailed reports and recommendations."
  },
  {
    icon: Layout,
    title: "UX Best Practices Analysis",
    description: "Evaluate your site against industry standards for layout, typography, and interaction design."
  },
  {
    icon: Smartphone,
    title: "Mobile Responsiveness",
    description: "Test your website across different devices and screen sizes automatically."
  },
  {
    icon: Zap,
    title: "Performance Metrics",
    description: "Get insights on loading times, interaction delays, and overall user experience."
  },
  {
    icon: Lightbulb,
    title: "AI-Powered Recommendations",
    description: "Receive intelligent suggestions for improving your website's user experience."
  },
  {
    icon: FileText,
    title: "Detailed PDF Reports",
    description: "Download comprehensive reports with visual examples and actionable insights."
  }
];

export const Features = () => {
  return (
    <section id="features" className="py-20 bg-gradient-to-b from-white to-indigo-50/30">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50/50 px-4 py-1.5 text-sm text-indigo-600">
            <span className="mr-2">🚀</span>
            Powerful Features
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Everything You Need for Better UX
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Our AI-powered tool provides comprehensive analysis of your website's user experience
          </p>
        </div>
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative rounded-2xl border border-indigo-100 bg-white p-8 shadow-sm transition-all hover:shadow-md hover:border-indigo-200 hover:scale-105 duration-300"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
              <p className="mt-4 text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}; 