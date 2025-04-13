import { useQuery } from "@tanstack/react-query";
import { Category } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface CategoryFiltersProps {
  selectedCategory: number | null;
  onCategorySelect: (categoryId: number | null) => void;
}

export default function CategoryFilters({
  selectedCategory,
  onCategorySelect,
}: CategoryFiltersProps) {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  if (isLoading) {
    return (
      <div className="flex justify-center mb-12">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
      <Button
        key="all"
        variant={selectedCategory === null ? "default" : "outline"}
        className="rounded-full text-sm font-medium"
        onClick={() => onCategorySelect(null)}
      >
        All
      </Button>
      
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? "default" : "outline"}
          className={`rounded-full text-sm font-medium ${
            selectedCategory === category.id 
              ? "" 
              : `hover:bg-${category.colorClass}-50 hover:text-${category.colorClass}-600`
          }`}
          onClick={() => onCategorySelect(category.id)}
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
}
