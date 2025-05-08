import { Header } from "@/modules/home/ui/sections/header";
import { Hero } from "@/modules/home/ui/sections/hero";
import { Features } from "@/modules/home/ui/sections/features";
import { Benefits } from "@/modules/home/ui/sections/benefits";
import { FAQ } from "@/modules/home/ui/sections/faq";
import { Footer } from "@/modules/home/ui/sections/footer";
import { URLForm } from "@/modules/home/ui/sections/url-form";

const LandingView = () => {
    return (
        <div className="relative min-h-screen w-full">
            <Header />
            <main className="w-full">
                <Hero />
                <URLForm />
                <Features />
                <Benefits />
                <FAQ />
            </main>
            <Footer />
        </div>
    );
};

export default LandingView;
