import React from 'react';
import { Popover, Tag, Typography, Space, Divider, Badge } from 'antd';
import { Clock } from 'lucide-react';
import dayjs from 'dayjs';
import type { ShiftAssignment } from '../types';

const { Text } = Typography;

interface ShiftAssignmentTagProps {
  assignment: ShiftAssignment;
  style?: React.CSSProperties;
}

export const ShiftAssignmentTag: React.FC<ShiftAssignmentTagProps> = ({
  assignment,
  style,
}) => {
  const shift = assignment.shift;
  const start = shift?.startTime ? shift.startTime.slice(0, 5) : '--:--';
  const end = shift?.endTime ? shift.endTime.slice(0, 5) : '--:--';
  const from = dayjs(assignment.effectiveFrom).format('DD/MM/YYYY');
  const to = assignment.effectiveTo ? dayjs(assignment.effectiveTo).format('DD/MM/YYYY') : 'Vô thời hạn';

  const renderShiftHoverCard = () => {
    return (
      <div style={{ width: 280, padding: '4px 0' }}>
        <Space direction="vertical" size={10} style={{ width: '100%' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space size={6}>
              <Tag color={assignment.isPrimary ? 'blue' : 'default'} style={{ fontWeight: 700, margin: 0 }}>
                {shift?.code || 'CA'}
              </Tag>
              <Text strong style={{ fontSize: 14 }}>{shift?.name || 'Ca làm việc'}</Text>
            </Space>
            <Badge status={assignment.isPrimary ? 'success' : 'default'} text={assignment.isPrimary ? 'Chính' : 'Phụ'} />
          </div>

          <Divider style={{ margin: '4px 0' }} />

          {/* Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div>
              <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Thời gian ca trực</Text>
              <Space size={4}>
                <Clock size={12} style={{ color: 'var(--color-primary)' }} />
                <Text strong style={{ fontSize: 13 }}>{start} - {end}</Text>
              </Space>
            </div>

            <div>
              <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Nghỉ giữa ca</Text>
              <Text style={{ fontSize: 12 }}>{shift?.breakMinutes || 0} phút</Text>
            </div>

            <div>
              <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Thời gian áp dụng</Text>
              <Text style={{ fontSize: 12 }}>{from} - {to}</Text>
            </div>

            {shift?.isFlexible && (
              <Tag color="cyan" style={{ width: 'fit-content', marginTop: 4 }}>Ca làm việc linh hoạt</Tag>
            )}
          </div>
        </Space>
      </div>
    );
  };

  return (
    <Popover
      content={renderShiftHoverCard()}
      placement="top"
      trigger="hover"
      mouseEnterDelay={0.2}
      mouseLeaveDelay={0.1}
    >
      <Tag
        color={assignment.isPrimary ? 'blue' : 'default'}
        style={{
          fontSize: '11px',
          width: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          margin: 0,
          padding: '0 4px',
          border: assignment.isPrimary ? '1px solid var(--color-primary-bg-hover)' : '1px solid var(--color-border)',
          cursor: 'pointer',
          ...style,
        }}
      >
        <span style={{ fontWeight: 600 }}>{shift?.code || 'Ca'}</span>
        <span style={{ fontSize: '10px', marginLeft: 4, opacity: 0.8 }}>
          ({shift?.startTime?.slice(0, 5) || '--:--'})
        </span>
      </Tag>
    </Popover>
  );
};
export default ShiftAssignmentTag;
