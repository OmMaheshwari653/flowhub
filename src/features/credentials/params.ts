import { parseAsInteger, parseAsString } from "nuqs/server";
import { PAGINATION } from "@/config/constants";

export const credentialsParams = {
  page: parseAsInteger
    .withDefault(PAGINATION.DEFAULT_PAGE)
    .withOptions({ clearOnDefault: true }),
  pageSize: parseAsInteger
    .withDefault(PAGINATION.DEFAULT_PAGE_SIZE)
    .withOptions({ clearOnDefault: true }),
  search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
};

// Schema (credentialsParams) rules tay karta hai.

// Server Loader (credentialsParamsLoader) server side se API calls ya DB fetching ke liye URL padhta hai.

// Client Hook (useCredentialsParams) browser side me user ke actions (click/type) par URL update karta hai.
