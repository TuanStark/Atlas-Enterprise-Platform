export interface JobPosting {
  id: string;
  title: string;
  department?: string;
  status: 'draft' | 'published' | 'closed';
  vacancies: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface JobApplication {
  id: string;
  jobPostingId: string;
  jobPosting?: JobPosting;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  status: 'active' | 'hired' | 'rejected' | 'withdrawn';
  stage: 'new' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
  appliedAt?: string;
  resumeUrl?: string;
}
