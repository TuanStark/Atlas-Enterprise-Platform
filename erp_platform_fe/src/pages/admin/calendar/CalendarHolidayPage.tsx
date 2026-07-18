import {
  Card, Table, Typography, Row, Col, Space, Tag, Spin, Empty,
} from 'antd';
import type { TableColumnsType } from 'antd';
import { CalendarDays, Sun } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { httpClient } from '@shared/api';

const { Title, Text } = Typography;

/** Types matching backend SystemCalendar + Holiday */
interface Holiday {
  id: string;
  calendarId?: string;
  holidayDate?: string;
  name?: string;
  recurring?: boolean;
}

interface SystemCalendar {
  id: string;
  tenantId?: string;
  code?: string;
  name?: string;
  timezone?: string;
  workDays?: Record<string, boolean>;
  holidays?: Holiday[];
}

/** API */
const calendarApi = {
  async list(): Promise<SystemCalendar[]> {
    const { data } = await httpClient.get<SystemCalendar[]>('/calendars');
    return data;
  },
};

export default function CalendarHolidayPage() {
  const { data: calendars = [], isLoading } = useQuery({
    queryKey: ['calendars'],
    queryFn: calendarApi.list,
  });

  // Flatten all holidays from all calendars
  const allHolidays = calendars.flatMap(
    (cal) => (cal.holidays || []).map((h) => ({ ...h, calendarName: cal.name || cal.code || '—' }))
  );

  const columns: TableColumnsType<Holiday & { calendarName: string }> = [
    {
      title: 'Ngày lễ',
      dataIndex: 'name',
      key: 'name',
      render: (val: string) => (
        <Space>
          <Sun size={14} style={{ color: '#fa8c16' }} />
          <Text strong style={{ fontSize: 13 }}>{val || 'Chưa đặt tên'}</Text>
        </Space>
      ),
    },
    {
      title: 'Ngày',
      dataIndex: 'holidayDate',
      key: 'holidayDate',
      width: 140,
      render: (val: string) =>
        val ? new Date(val).toLocaleDateString('vi-VN') : '—',
      sorter: (a, b) => new Date(a.holidayDate || 0).getTime() - new Date(b.holidayDate || 0).getTime(),
    },
    {
      title: 'Lịch hệ thống',
      dataIndex: 'calendarName',
      key: 'calendarName',
      width: 160,
      render: (val: string) => <Tag>{val}</Tag>,
    },
    {
      title: 'Lặp lại hàng năm',
      dataIndex: 'recurring',
      key: 'recurring',
      width: 140,
      render: (val: boolean) => (
        <Tag color={val ? 'green' : 'default'}>{val ? 'Có' : 'Không'}</Tag>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space direction="vertical" size={4}>
            <Title level={4} style={{ margin: 0 }}>
              <Space><CalendarDays size={20} /> Lịch hệ thống & Ngày lễ</Space>
            </Title>
            <Text type="secondary">Quản lý lịch làm việc, ngày nghỉ lễ và cấu hình thời gian hệ thống.</Text>
          </Space>
        </Col>
      </Row>

      {/* System Calendars Overview */}
      {isLoading ? (
        <div style={{ padding: 60, textAlign: 'center' }}><Spin /></div>
      ) : (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {calendars.map((cal) => (
              <Col xs={24} sm={12} lg={8} key={cal.id}>
                <Card
                  style={{ borderRadius: 12, borderLeft: '3px solid #1890ff' }}
                  styles={{ body: { padding: 16 } }}
                >
                  <Space direction="vertical" size={8} style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text strong>{cal.name || cal.code}</Text>
                      <Text code style={{ fontSize: 10 }}>{cal.code}</Text>
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Múi giờ: {cal.timezone || 'N/A'} · {cal.holidays?.length || 0} ngày lễ
                    </Text>
                  </Space>
                </Card>
              </Col>
            ))}
            {calendars.length === 0 && (
              <Col span={24}>
                <Card style={{ borderRadius: 12 }}>
                  <Empty description="Chưa có lịch hệ thống nào." />
                </Card>
              </Col>
            )}
          </Row>

          {/* Holidays Table */}
          <Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <Title level={5} style={{ marginBottom: 16 }}>Danh sách ngày lễ</Title>
            <Table
              columns={columns}
              dataSource={allHolidays}
              rowKey="id"
              pagination={{ pageSize: 10, showTotal: (total) => `Tổng ${total} ngày lễ` }}
              locale={{ emptyText: <Empty description="Chưa có ngày lễ nào." /> }}
            />
          </Card>
        </>
      )}
    </div>
  );
}
