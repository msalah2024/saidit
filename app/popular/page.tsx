import { Suspense } from "react";
import GlobalFeed from "@/components/GlobalFeed";

export default function PopularPage() {
  return (
    <div className="w-full">
      <Suspense>
        <GlobalFeed defaultSort="hot" basePath="/popular" />
      </Suspense>
    </div>
  );
}
