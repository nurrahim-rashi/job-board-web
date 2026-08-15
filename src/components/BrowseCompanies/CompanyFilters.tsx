import { Search } from "../site/Icons";
type Sort = "az" | "za";
type Props = {
  query: string;
  city: string;
  sort: Sort;
  cities: string[];
  onQueryChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onSortChange: (value: Sort) => void;
};
export function CompanyFilters({
  query,
  city,
  sort,
  cities,
  onQueryChange,
  onCityChange,
  onSortChange,
}: Props) {
  return (
    <section className="company-filters">
      <div>
        <label>
          <Search />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Company name"
          />
        </label>
        <select
          value={city}
          onChange={(event) => onCityChange(event.target.value)}
        >
          <option value="all">All locations</option>
          {cities.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(event) => onSortChange(event.target.value as Sort)}
        >
          <option value="az">Name A–Z</option>
          <option value="za">Name Z–A</option>
        </select>
      </div>
    </section>
  );
}
