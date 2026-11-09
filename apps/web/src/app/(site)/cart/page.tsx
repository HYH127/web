import type { Metadata } from "next";
import { Container, Section } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { InquiryCart } from "@/components/inquiry/inquiry-cart";
import { pages } from "@/lib/messages";

export const metadata: Metadata = {
  title: "询盘单",
  description: pages.cart.description,
};

export default function CartPage() {
  return (
    <>
      <PageHeader
        eyebrow={pages.cart.eyebrow}
        title={pages.cart.title}
        description={pages.cart.description}
      />
      <Section tight>
        <Container>
          <InquiryCart />
        </Container>
      </Section>
    </>
  );
}
