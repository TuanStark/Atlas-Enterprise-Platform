import { useQuery } from '@tanstack/react-query';
import { httpClient } from '@shared/api';
import { useAuthStore } from '@features/auth/store/authStore';

export interface TenantData {
  id: string;
  code: string;
  name: string;
  status: string;
  logoFileId?: string;
  legalName?: string;
  taxCode?: string;
  email?: string;
  phone?: string;
  timezone?: string;
  locale?: string;
  currency?: string;
}


export function useActiveTenant() {
  const tenantId = useAuthStore((s) => s.user?.tenantId);

  return useQuery<TenantData>({
    queryKey: ['active-tenant', tenantId],
    queryFn: async () => {
      const { data } = await httpClient.get<any>(`/tenants/${tenantId}`);
      return data;
    },
    enabled: !!tenantId,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: true,
  });
}
