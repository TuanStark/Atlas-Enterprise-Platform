import { httpClient } from '@shared/api';
import type {
  Organization,
  OrganizationUnit,
  OrganizationUnitType,
  CreateOrganizationUnitDto,
  UpdateOrganizationUnitDto,
  MoveOrganizationUnitDto,
} from '../types';

export const orgApi = {
  async getOrganizations(): Promise<Organization[]> {
    const { data } = await httpClient.get<Organization[]>('/organizations');
    return data;
  },

  async getOrgUnitTree(orgId: string): Promise<OrganizationUnit[]> {
    const { data } = await httpClient.get<OrganizationUnit[]>(`/organizations/${orgId}/units/tree`);
    return data;
  },

  async getUnitTypes(): Promise<OrganizationUnitType[]> {
    const { data } = await httpClient.get<OrganizationUnitType[]>('/organization-unit-types');
    return data;
  },

  async createOrgUnit(orgId: string, payload: CreateOrganizationUnitDto): Promise<string> {
    const { data } = await httpClient.post<string>(`/organizations/${orgId}/units`, payload);
    return data;
  },

  async updateOrgUnit(orgId: string, unitId: string, payload: UpdateOrganizationUnitDto): Promise<void> {
    await httpClient.patch(`/organizations/${orgId}/units/${unitId}`, payload);
  },

  async deleteOrgUnit(orgId: string, unitId: string): Promise<void> {
    await httpClient.delete(`/organizations/${orgId}/units/${unitId}`);
  },

  async moveOrgUnit(orgId: string, unitId: string, payload: MoveOrganizationUnitDto): Promise<void> {
    await httpClient.post(`/organizations/${orgId}/units/${unitId}/move`, payload);
  },
};
