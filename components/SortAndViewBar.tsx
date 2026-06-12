"use client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowUp,
  ChartBarIncreasing,
  Flame,
  Rocket,
  Rows2,
  Rows3,
  Sparkles,
} from "lucide-react";
import { useView } from "@/app/context/ViewContext";
import { useState, useEffect } from "react";
import { useRouter } from "nextjs-toploader/app";

interface SortAndViewBarProps {
  currentSort: string;
  basePath?: string;
}

export default function SortAndViewBar({ currentSort, basePath }: SortAndViewBarProps) {
  const { view, setView } = useView();
  const router = useRouter();
  const [sort, setSort] = useState(currentSort);

  useEffect(() => {
    setSort(currentSort);
  }, [currentSort]);

  const handleChange = (value: string) => {
    setSort(value);

    if (basePath !== undefined) {
      const defaultSorts: Record<string, string> = { "/popular": "hot", "/all": "new" };
      if (defaultSorts[basePath] === value) {
        router.push(basePath);
      } else {
        router.push(`${basePath}?sort=${value}`);
      }
    } else if (value === "best") {
      router.push("/");
    } else {
      router.push(`/${value}`);
    }
  };

  return (
    <div
      className={`flex gap-2 mt-6 justify-self-center w-full ${
        view === "Card" ? "max-w-4xl" : ""
      }`}
    >
      {/* SORT SELECT */}
      <Select value={sort} onValueChange={handleChange}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Best" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Sort by</SelectLabel>

            <SelectItem value="best">
              <Rocket className="h-4 w-4 text-foreground" /> Best
            </SelectItem>
            <SelectItem value="hot">
              <Flame className="h-4 w-4 text-foreground" /> Hot
            </SelectItem>
            <SelectItem value="new">
              <Sparkles className="h-4 w-4 text-foreground" /> New
            </SelectItem>
            <SelectItem value="top">
              <ArrowUp className="h-4 w-4 text-foreground" /> Top
            </SelectItem>
            <SelectItem value="rising">
              <ChartBarIncreasing className="h-4 w-4 text-foreground" /> Rising
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* VIEW SELECT */}
      <Select value={view} onValueChange={setView}>
        <SelectTrigger className="w-34">
          <SelectValue placeholder="Card" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>View</SelectLabel>
            <SelectItem value="Card">
              <Rows2 className="text-primary-foreground" /> Card
            </SelectItem>
            <SelectItem value="Compact">
              <Rows3 className="text-primary-foreground" /> Compact
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
