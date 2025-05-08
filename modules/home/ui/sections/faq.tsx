import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How does the UX audit work?",
    answer: "Our AI-powered tool analyzes your website by checking various UX aspects including accessibility, usability, and design best practices. It provides a comprehensive report with actionable recommendations."
  },
  {
    question: "How long does an audit take?",
    answer: "A typical audit takes just a few minutes to complete. The exact time depends on your website's size and complexity."
  },
  {
    question: "What kind of recommendations will I receive?",
    answer: "You'll receive detailed recommendations covering accessibility issues, UX best practices, mobile responsiveness, and performance optimizations. Each recommendation includes specific examples and implementation guidance."
  },
  {
    question: "Can I export the audit results?",
    answer: "Yes, you can export your audit results as a detailed PDF report that includes screenshots, specific issues, and recommendations."
  }
];

export const FAQ = () => {
  return (
    <section id="faq" className="py-20 bg-gradient-to-b from-white to-indigo-50/30">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50/50 px-4 py-1.5 text-sm text-indigo-600">
            <span className="mr-2">❓</span>
            Frequently Asked Questions
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Everything You Need to Know
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Get answers to common questions about UXAudit AI
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-3xl">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-indigo-100 rounded-xl px-6 data-[state=open]:bg-white data-[state=open]:shadow-sm transition-all duration-300 hover:scale-[1.02]"
              >
                <AccordionTrigger className="text-left text-gray-900 hover:text-indigo-600 py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}; 