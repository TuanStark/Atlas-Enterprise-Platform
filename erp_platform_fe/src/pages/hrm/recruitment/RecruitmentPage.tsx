import { useState } from 'react';
import { Card, Table, Button, Tag, Typography, Tabs, Row, Col, Space, Modal, Form, Input, InputNumber, Select, Badge, Empty, Spin } from 'antd';
import type { TableColumnsType } from 'antd';
import { Plus, UserPlus, XCircle, Briefcase, Send, Play } from 'lucide-react';
import { useJobPostings, useCreateJobPosting, usePublishJobPosting, useCloseJobPosting, useJobApplications, useUpdateApplicationStage, useUpdateApplicationStatus, useCreateJobApplication } from '@features/recruitment/hooks/useRecruitment';
import type { JobPosting, JobApplication } from '@features/recruitment/types';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const postingStatusConfig: Record<string, { color: string; label: string }> = {
  draft: { color: 'orange', label: 'Nháp' },
  published: { color: 'green', label: 'Đang đăng tuyển' },
  closed: { color: 'default', label: 'Đã đóng' },
};

const stageConfig: Record<string, { color: string; label: string }> = {
  new: { color: 'blue', label: 'Mới' },
  screening: { color: 'purple', label: 'Lọc hồ sơ' },
  interview: { color: 'orange', label: 'Phỏng vấn' },
  offer: { color: 'cyan', label: 'Đề nghị' },
  hired: { color: 'green', label: 'Đã nhận việc' },
  rejected: { color: 'red', label: 'Từ chối' },
};

export default function RecruitmentPage() {
  const [activeTab, setActiveTab] = useState('1');
  const [isPostingModalOpen, setIsPostingModalOpen] = useState(false);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [postingForm] = Form.useForm();
  const [appForm] = Form.useForm();

  // Queries & Mutations
  const { data: postings = [], isLoading: isLoadingPostings } = useJobPostings();
  const { data: applications = [], isLoading: isLoadingApps } = useJobApplications();

  const createPostingMutation = useCreateJobPosting();
  const publishPostingMutation = usePublishJobPosting();
  const closePostingMutation = useCloseJobPosting();

  const createAppMutation = useCreateJobApplication();
  const updateStageMutation = useUpdateApplicationStage();
  const updateStatusMutation = useUpdateApplicationStatus();

  // Form Handlers
  const handleCreatePosting = (values: any) => {
    createPostingMutation.mutate(
      { ...values, status: 'draft' },
      {
        onSuccess: () => {
          setIsPostingModalOpen(false);
          postingForm.resetFields();
        },
      }
    );
  };

  const handleCreateApplication = (values: any) => {
    createAppMutation.mutate(
      { ...values, stage: 'new', status: 'active' },
      {
        onSuccess: () => {
          setIsAppModalOpen(false);
          appForm.resetFields();
        },
      }
    );
  };

  // Columns Definitions
  const postingColumns: TableColumnsType<JobPosting> = [
    {
      title: 'Vị trí tuyển dụng',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <Text strong style={{ fontSize: 13 }}>{text}</Text>
          {record.department && <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>{record.department}</Text>}
        </div>
      ),
    },
    {
      title: 'Số lượng tuyển',
      dataIndex: 'vacancies',
      key: 'vacancies',
      width: 120,
      align: 'center',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status) => {
        const conf = postingStatusConfig[status] || { color: 'default', label: status };
        return <Tag color={conf.color}>{conf.label}</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space size={8}>
          {record.status === 'draft' && (
            <Button
              type="primary"
              size="small"
              icon={<Send size={12} />}
              onClick={() => publishPostingMutation.mutate(record.id)}
            >
              Đăng tuyển
            </Button>
          )}
          {record.status === 'published' && (
            <Button
              danger
              size="small"
              icon={<XCircle size={12} />}
              onClick={() => closePostingMutation.mutate(record.id)}
            >
              Đóng tuyển
            </Button>
          )}
          {record.status === 'closed' && (
            <Button
              size="small"
              icon={<Play size={12} />}
              onClick={() => publishPostingMutation.mutate(record.id)}
            >
              Mở lại
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const appColumns: TableColumnsType<JobApplication> = [
    {
      title: 'Ứng viên',
      dataIndex: 'candidateName',
      key: 'candidateName',
      render: (text, record) => (
        <div>
          <Text strong style={{ fontSize: 13 }}>{text}</Text>
          <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>{record.candidateEmail} {record.candidatePhone && `| ${record.candidatePhone}`}</Text>
        </div>
      ),
    },
    {
      title: 'Vị trí ứng tuyển',
      key: 'jobPosting',
      render: (_, record) => {
        const post = postings.find(p => p.id === record.jobPostingId);
        return <Text>{post ? post.title : `Vị trí ID: ${record.jobPostingId.slice(0, 8)}`}</Text>;
      },
    },
    {
      title: 'Vòng tuyển dụng',
      dataIndex: 'stage',
      key: 'stage',
      width: 160,
      render: (stage, record) => (
        <Select
          value={stage}
          size="small"
          style={{ width: 130 }}
          onChange={(newStage) => updateStageMutation.mutate({ id: record.id, stage: newStage })}
        >
          {Object.entries(stageConfig).map(([key, val]) => (
            <Select.Option key={key} value={key}>
              <Badge color={val.color} text={val.label} />
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Trạng thái hồ sơ',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status, record) => (
        <Select
          value={status}
          size="small"
          style={{ width: 120 }}
          onChange={(newStatus) => updateStatusMutation.mutate({ id: record.id, status: newStatus })}
        >
          <Select.Option value="active">Đang xử lý</Select.Option>
          <Select.Option value="hired">Đã tuyển dụng</Select.Option>
          <Select.Option value="rejected">Bị từ chối</Select.Option>
          <Select.Option value="withdrawn">Ứng viên rút lui</Select.Option>
        </Select>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space direction="vertical" size={4}>
            <Title level={4} style={{ margin: 0 }}>Hồ sơ & Tin Tuyển dụng</Title>
            <Text type="secondary">Đăng tin tuyển dụng và quản lý vòng xét duyệt của các ứng viên.</Text>
          </Space>
        </Col>
        <Col>
          <Space>
            {activeTab === '1' ? (
              <Button
                type="primary"
                icon={<Plus size={16} />}
                onClick={() => setIsPostingModalOpen(true)}
                style={{ borderRadius: 6 }}
              >
                Tạo tin tuyển dụng
              </Button>
            ) : (
              <Button
                type="primary"
                icon={<UserPlus size={16} />}
                onClick={() => setIsAppModalOpen(true)}
                style={{ borderRadius: 6 }}
              >
                Nhận hồ sơ ứng viên
              </Button>
            )}
          </Space>
        </Col>
      </Row>

      <Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ marginTop: -12 }}>
          <TabPane
            tab={
              <Space>
                <Briefcase size={16} />
                <span>Bản tin tuyển dụng ({postings.length})</span>
              </Space>
            }
            key="1"
          >
            {isLoadingPostings ? (
              <div style={{ padding: 40, textAlign: 'center' }}><Spin /></div>
            ) : postings.length > 0 ? (
              <Table<JobPosting>
                columns={postingColumns}
                dataSource={postings}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            ) : (
              <Empty description="Chưa có tin tuyển dụng nào được tạo." />
            )}
          </TabPane>

          <TabPane
            tab={
              <Space>
                <UserPlus size={16} />
                <span>Danh sách Ứng viên ({applications.length})</span>
              </Space>
            }
            key="2"
          >
            {isLoadingApps ? (
              <div style={{ padding: 40, textAlign: 'center' }}><Spin /></div>
            ) : applications.length > 0 ? (
              <Table<JobApplication>
                columns={appColumns}
                dataSource={applications}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            ) : (
              <Empty description="Chưa nhận được hồ sơ ứng viên nào." />
            )}
          </TabPane>
        </Tabs>
      </Card>

      {/* Modal: Create Job Posting */}
      <Modal
        title="Tạo tin tuyển dụng mới"
        open={isPostingModalOpen}
        onCancel={() => setIsPostingModalOpen(false)}
        footer={null}
      >
        <Form form={postingForm} layout="vertical" onFinish={handleCreatePosting} style={{ marginTop: 16 }}>
          <Form.Item
            name="title"
            label="Tiêu đề tin / Vị trí"
            rules={[{ required: true, message: 'Vui lòng nhập vị trí tuyển dụng' }]}
          >
            <Input placeholder="Ví dụ: Lập trình viên React Senior" />
          </Form.Item>
          <Form.Item
            name="department"
            label="Phòng ban"
            rules={[{ required: true, message: 'Vui lòng nhập tên phòng ban' }]}
          >
            <Input placeholder="Ví dụ: Phát triển Phần mềm" />
          </Form.Item>
          <Form.Item
            name="vacancies"
            label="Số lượng tuyển dụng"
            rules={[{ required: true, message: 'Vui lòng chọn số lượng cần tuyển' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="Số lượng vị trí cần tuyển" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô tả công việc"
          >
            <Input.TextArea rows={4} placeholder="Nhập JD (Job Description) chi tiết cho vị trí tuyển dụng..." />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsPostingModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={createPostingMutation.isPending}>Tạo mới</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal: Create Job Application */}
      <Modal
        title="Thêm hồ sơ ứng viên"
        open={isAppModalOpen}
        onCancel={() => setIsAppModalOpen(false)}
        footer={null}
      >
        <Form form={appForm} layout="vertical" onFinish={handleCreateApplication} style={{ marginTop: 16 }}>
          <Form.Item
            name="jobPostingId"
            label="Áp dụng cho tin tuyển dụng"
            rules={[{ required: true, message: 'Vui lòng chọn tin tuyển dụng ứng tuyển' }]}
          >
            <Select placeholder="Chọn vị trí ứng tuyển">
              {postings.map(post => (
                <Select.Option key={post.id} value={post.id}>
                  {post.title} ({post.department})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="candidateName"
            label="Họ và tên ứng viên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên ứng viên' }]}
          >
            <Input placeholder="Ví dụ: Nguyễn Văn B" />
          </Form.Item>
          <Form.Item
            name="candidateEmail"
            label="Email liên hệ"
            rules={[{ required: true, type: 'email', message: 'Vui lòng nhập đúng định dạng email' }]}
          >
            <Input placeholder="Ví dụ: candidate@gmail.com" />
          </Form.Item>
          <Form.Item
            name="candidatePhone"
            label="Số điện thoại"
          >
            <Input placeholder="Ví dụ: 0987654321" />
          </Form.Item>
          <Form.Item
            name="resumeUrl"
            label="Link CV / Resume"
          >
            <Input placeholder="Ví dụ: https://drive.google.com/..." />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsAppModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={createAppMutation.isPending}>Thêm hồ sơ</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
