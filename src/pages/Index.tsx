import Layout from "@/components/layout/Layout";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import CTABanner from "@/components/landing/CTABanner";

const Index = () => {
  return (
    <Layout>
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <CTABanner />
    </Layout>
  );
};

export default Index;
