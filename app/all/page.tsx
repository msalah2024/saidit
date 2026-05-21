import { Suspense } from "react";
import GlobalFeed from "@/components/GlobalFeed";

export default function AllPage() {
  return (
    <div className="w-full">
      <Suspense>
        <GlobalFeed defaultSort="new" basePath="/all" />
      </Suspense>
    </div>
  );
}
