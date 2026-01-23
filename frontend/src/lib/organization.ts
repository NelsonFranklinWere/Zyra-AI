import apiClient from './api-client';

export interface Organization {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  members?: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  }>;
  _count?: {
    members: number;
    products: number;
    rules: number;
    conversations: number;
  };
}

export interface CreateOrgInput {
  name: string;
}

export interface AddMemberInput {
  name: string;
  email: string;
  role?: 'ADMIN' | 'STAFF';
}

export async function createOrganization(data: CreateOrgInput): Promise<Organization> {
  const response = await apiClient.post<{ success: boolean; data: Organization }>('/api/org/create', data);
  return response.data.data;
}

export async function getOrganization(): Promise<Organization> {
  const response = await apiClient.get<{ success: boolean; data: Organization }>('/api/org/info');
  return response.data.data;
}

export async function addMember(data: AddMemberInput): Promise<void> {
  await apiClient.post('/api/org/add-member', data);
}

