import { PAGINATION } from "@/config/constants";
import { useEffect, useState } from "react";

interface UseEntitySearchProps<
  T extends {
    search: string;
    page: number;
  },
> {
  params: T;
  setParams: (params: T) => void;
  debounceMs?: number;
}

export function useEntitySearch<T extends { search: string; page: number }>({
  params,
  setParams,
  debounceMs = 500,
}: UseEntitySearchProps<T>) {
  const [localSearch, setLocalSearch] = useState(params.search);

  useEffect(() => {
    if (localSearch == "" && params.search == "") {
      setParams({
        ...params,
        page: PAGINATION.DEFAULT_PAGE,
        search: "",
      });
      return;
    }
    const timer = setTimeout(() => {
      if (localSearch !== params.search) {
        setParams({
          ...params,
          page: PAGINATION.DEFAULT_PAGE,
          search: localSearch,
        });
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localSearch, params.search, debounceMs]);

  useEffect(() => {
    setLocalSearch(params.search);
  }, [params.search]);
  return {
    searchValue: localSearch,
    onSearchChange: setLocalSearch,
  };
}

// User Types: Client component mein input field ki value change hoti hai. useEntitySearch ka localSearch state update hota hai. Browser URL aur Server abhi idle hain.

// Debounce Triggers: 500ms baad, useEntitySearch ka useEffect trigger hota hai.

// URL Mutation: Woh effect useCredentialsParams ke dwara provide kiye gaye setter ko invoke karta hai. URL query string modify ho jati hai (e.g., ?search=xyz&page=1).

// Shallow Routing: nuqs under the hook Next.js router ka use karke ek naya route push/replace karta hai.

// Server Side Fetch: Next.js ka Server Component naye URL ke saath re-render hota hai. credentialsParamsLoader naye raw params parse karta hai aur database se filtered data fetch karta hai.
