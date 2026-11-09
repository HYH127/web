import type { Metadata } from "next";
import { Container, Section } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { pages } from "@/lib/messages";

export const metadata: Metadata = {
  title: "提交询盘",
  description: pages.checkout.description,
};

export default function CheckoutPage() {
  return (
    <>
      <PageHeader
        eyebrow={pages.checkout.eyebrow}
        title={pages.checkout.title}
        description={pages.checkout.description}
      />
      <Section tight>
        <Container>
          <CheckoutForm />
        </Container>
      </Section>
    </>
  );
}
