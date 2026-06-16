import { useMemo } from 'react';

export function useFilteredData(data, filters) {
  return useMemo(() => {
    if (!data.length) return [];
    return data.filter(row => {
      if (filters.dateFrom && row.submitted_date < filters.dateFrom) return false;
      if (filters.dateTo && row.submitted_date > filters.dateTo) return false;
      if (filters.claimType && row.claim_type !== filters.claimType) return false;
      if (filters.insurer && row.insurer !== filters.insurer) return false;
      if (filters.country && row.country !== filters.country) return false;
      if (filters.status && row.status !== filters.status) return false;
      return true;
    });
  }, [data, filters]);
}
