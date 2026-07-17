import { httpClient } from '@shared/api';
import type { JobPosting, JobApplication } from '../types';

export const recruitmentApi = {
  // Job Postings
  async getJobPostings(): Promise<JobPosting[]> {
    const { data } = await httpClient.get<JobPosting[]>('/job-postings');
    return data;
  },

  async createJobPosting(payload: Partial<JobPosting>): Promise<JobPosting> {
    const { data } = await httpClient.post<JobPosting>('/job-postings', payload);
    return data;
  },

  async updateJobPosting(id: string, payload: Partial<JobPosting>): Promise<JobPosting> {
    const { data } = await httpClient.patch<JobPosting>(`/job-postings/${id}`, payload);
    return data;
  },

  async publishJobPosting(id: string): Promise<void> {
    await httpClient.post(`/job-postings/${id}/publish`);
  },

  async closeJobPosting(id: string): Promise<void> {
    await httpClient.post(`/job-postings/${id}/close`);
  },

  // Job Applications
  async getJobApplications(): Promise<JobApplication[]> {
    const { data } = await httpClient.get<JobApplication[]>('/job-applications');
    return data;
  },

  async createJobApplication(payload: Partial<JobApplication>): Promise<JobApplication> {
    const { data } = await httpClient.post<JobApplication>('/job-applications', payload);
    return data;
  },

  async updateApplicationStatus(id: string, status: string): Promise<void> {
    await httpClient.patch(`/job-applications/${id}/status`, { status });
  },

  async updateApplicationStage(id: string, stage: string): Promise<void> {
    await httpClient.patch(`/job-applications/${id}/stage`, { stage });
  },
};
