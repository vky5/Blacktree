const categories = [
  "All",
  "AI & ML",
  "Finance",
  "Location",
  "Data",
  "Utilities",
];

interface Props {
  selected: string;
  onSelect: (category: string) => void;
}

function CategoryFilter({ selected, onSelect }: Props) {
    return (
        <div>
            <div className="text-center py-4">Categories</div>
            <div className="sticky top-6 flex flex-col gap-2 w-40">
                {categories.map((category) => (
                    <label
                        key={category}
                        className={`flex items-center gap-2 px-4 py-1 text-sm font-medium transition-all duration-200 cursor-pointer `}
                    >
                        <input
                            type="checkbox"
                            checked={selected === category}
                            onChange={() => onSelect(category)}
                            className="accent-emerald-500 w-4 h-4 border-2 border-emerald-500"
                        />
                        <span>{category}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}

export default CategoryFilter;
