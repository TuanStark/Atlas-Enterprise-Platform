export interface PerformanceCycle {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'completed';
  createdAt?: string;
  updatedAt?: string;
}

export interface PerformanceGoal {
  id: string;
  employeeId: string;
  title: string;
  description?: string;
  weight: number;
  targetValue: number;
  currentValue: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  createdAt?: string;
}
