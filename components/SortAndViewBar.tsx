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
import { Dispatch, SetStateAction } from "react";

interface SortAndViewBar {
  sort: string;
  setSort: Dispatch<SetStateAction<string>>;
}

export default function SortAndViewBar({ sort, setSort }: SortAndViewBar) {
  const { view, setView } = useView();
  return (
    <div className="flex gap-2 mt-6 justify-self-center w-full max-w-4xl">
      <Select value={sort} onValueChange={setSort}>
        <SelectTrigger className="w-36" defaultValue="best">
          <SelectValue placeholder="Best" />
        </SelectTrigger>
        <SelectContent defaultChecked>
          <SelectGroup>
            <SelectLabel>Sort by</SelectLabel>
            <SelectItem value="best">
              <Rocket className="h-4 w-4 text-foreground" /> Best
            </SelectItem>
            <SelectItem value="hot">
              <Flame className="h-4 w-4 text-foreground" /> Hot
            </SelectItem>
            <SelectItem value="new">
              <Sparkles className=" h-4 w-4 text-foreground" /> New
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
      <Select value={view} onValueChange={setView}>
        <SelectTrigger className="w-34">
          <SelectValue placeholder="Card" />
        </SelectTrigger>
        <SelectContent defaultChecked>
          <SelectGroup>
            <SelectLabel>View</SelectLabel>
            <SelectItem value="Card">
              <Rows2 className="text-primary-foreground" />
              Card
            </SelectItem>
            <SelectItem value="Compact">
              <Rows3 className="text-primary-foreground" />
              Compact
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
