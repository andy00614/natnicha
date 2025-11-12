"use client";

/**
 * TodoFilter 组件
 * 筛选 Todos (All / Active / Completed)
 */

import { Button } from "@/components/ui/button";

export type FilterType = "all" | "active" | "completed";

interface TodoFilterProps {
    currentFilter: FilterType;
    onFilterChange: (filter: FilterType) => void;
    activeCount: number;
}

export function TodoFilter({
    currentFilter,
    onFilterChange,
    activeCount,
}: TodoFilterProps) {
    const filters: { value: FilterType; label: string }[] = [
        { value: "all", label: "All" },
        { value: "active", label: "Active" },
        { value: "completed", label: "Completed" },
    ];

    return (
        <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-2">
            <div className="flex gap-1">
                {filters.map((filter) => (
                    <Button
                        key={filter.value}
                        variant={
                            currentFilter === filter.value ? "default" : "ghost"
                        }
                        size="sm"
                        onClick={() => onFilterChange(filter.value)}
                    >
                        {filter.label}
                    </Button>
                ))}
            </div>

            <p className="px-3 text-sm text-muted-foreground">
                {activeCount} {activeCount === 1 ? "item" : "items"} left
            </p>
        </div>
    );
}
