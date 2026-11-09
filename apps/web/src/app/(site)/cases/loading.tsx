import { Container } from "@/components/ui/container";
import { CardGridSkeleton, Skeleton } from "@/components/ui/states";
import { states } from "@/lib/messages";

export default function CasesLoading() {
  return (
    <div className="pt-32 md:pt-40" role="status" aria-live="polite">
      <Container>
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-6 h-12 w-2/3" />
        <Skeleton className="mt-4 h-4 w-1/2" />
        <div className="mt-16">
          <CardGridSkeleton count={6} />
        </div>
        <span className="sr-only">{states.loading}</span>
      </Container>
    </div>
  );
}
