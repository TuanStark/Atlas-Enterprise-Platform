import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { recruitmentApi } from '../api/recruitmentApi';
import type { JobPosting, JobApplication } from '../types';
import type { ApiError } from '@shared/types';

const recruitmentKeys = {
  all: ['recruitment'] as const,
  postings: () => [...recruitmentKeys.all, 'postings'] as const,
  applications: () => [...recruitmentKeys.all, 'applications'] as const,
};

export function useJobPostings() {
  return useQuery<JobPosting[], ApiError>({
    queryKey: recruitmentKeys.postings(),
    queryFn: recruitmentApi.getJobPostings,
  });
}

export function useJobApplications() {
  return useQuery<JobApplication[], ApiError>({
    queryKey: recruitmentKeys.applications(),
    queryFn: recruitmentApi.getJobApplications,
  });
}

export function useCreateJobPosting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<JobPosting>) => recruitmentApi.createJobPosting(data),
    onSuccess: () => {
      message.success('Đã đăng tin tuyển dụng mới!');
      void queryClient.invalidateQueries({ queryKey: recruitmentKeys.postings() });
    },
    onError: (error: ApiError) => {
      message.error(error.message || 'Đăng tin tuyển dụng thất bại');
    },
  });
}

export function usePublishJobPosting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => recruitmentApi.publishJobPosting(id),
    onSuccess: () => {
      message.success('Đã mở đăng tuyển công khai!');
      void queryClient.invalidateQueries({ queryKey: recruitmentKeys.postings() });
    },
    onError: (error: ApiError) => {
      message.error(error.message || 'Mở đăng tuyển thất bại');
    },
  });
}

export function useCloseJobPosting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => recruitmentApi.closeJobPosting(id),
    onSuccess: () => {
      message.success('Đã đóng tin tuyển dụng!');
      void queryClient.invalidateQueries({ queryKey: recruitmentKeys.postings() });
    },
    onError: (error: ApiError) => {
      message.error(error.message || 'Đóng tin tuyển dụng thất bại');
    },
  });
}

export function useUpdateApplicationStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) =>
      recruitmentApi.updateApplicationStage(id, stage),
    onSuccess: () => {
      message.success('Đã cập nhật vòng tuyển dụng ứng viên!');
      void queryClient.invalidateQueries({ queryKey: recruitmentKeys.applications() });
    },
    onError: (error: ApiError) => {
      message.error(error.message || 'Cập nhật vòng tuyển dụng thất bại');
    },
  });
}

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      recruitmentApi.updateApplicationStatus(id, status),
    onSuccess: () => {
      message.success('Đã cập nhật trạng thái ứng viên!');
      void queryClient.invalidateQueries({ queryKey: recruitmentKeys.applications() });
    },
    onError: (error: ApiError) => {
      message.error(error.message || 'Cập nhật trạng thái thất bại');
    },
  });
}

export function useCreateJobApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<JobApplication>) => recruitmentApi.createJobApplication(data),
    onSuccess: () => {
      message.success('Đã thêm hồ sơ ứng viên thành công!');
      void queryClient.invalidateQueries({ queryKey: recruitmentKeys.applications() });
    },
    onError: (error: ApiError) => {
      message.error(error.message || 'Thêm hồ sơ ứng viên thất bại');
    },
  });
}
