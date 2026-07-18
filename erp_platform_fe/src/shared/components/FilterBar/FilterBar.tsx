import React from 'react';
import { Card, Row, Col, Input, Select, DatePicker, Typography } from 'antd';

const { Text } = Typography;
const { RangePicker } = DatePicker;

export interface FilterBarField {
  key: string;
  type: 'text' | 'select' | 'date' | 'date-range' | 'custom';
  label?: string;
  placeholder?: string;
  options?: { label: string; value: any }[]; // For select type
  loading?: boolean; // For select search loading
  showSearch?: boolean; // For select search support
  renderCustom?: () => React.ReactNode; // For custom type rendering
  span?: number; // Column span (out of 24) on medium+ screens. Defaults to dynamic.
}

export interface FilterBarProps {
  /** Controlled values matching key of fields */
  values: Record<string, any>;
  /** Callback fired when any value changes */
  onChange: (key: string, value: any) => void;
  /** Field configurations */
  fields: FilterBarField[];
  /** Elements to show on the right of the row (e.g. Export buttons, profiles, etc.) */
  extra?: React.ReactNode;
  /** Custom card properties */
  cardStyle?: React.CSSProperties;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  values,
  onChange,
  fields,
  extra,
  cardStyle,
}) => {
  return (
    <Card
      style={{
        borderRadius: 12,
        marginBottom: 20,
        boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
        ...cardStyle,
      }}
      styles={{ body: { padding: '16px 24px' } }}
    >
      <Row align="middle" gutter={[16, 16]} style={{ width: '100%' }}>
        {/* Left Side: Dynamic fields */}
        <Col flex="1 1 auto">
          <Row gutter={[16, 12]} align="middle">
            {fields.map((field) => {
              const span = field.span || Math.max(4, Math.floor(24 / fields.length));
              const val = values[field.key];

              return (
                <Col xs={24} sm={12} md={span} key={field.key}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {field.label && (
                      <Text strong style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                        {field.label}
                      </Text>
                    )}
                    
                    {field.type === 'text' && (
                      <Input
                        placeholder={field.placeholder}
                        value={val || ''}
                        onChange={(e) => onChange(field.key, e.target.value)}
                        style={{ width: '100%' }}
                      />
                    )}

                    {field.type === 'select' && (
                      <Select
                        showSearch={field.showSearch}
                        placeholder={field.placeholder}
                        loading={field.loading}
                        value={val}
                        onChange={(v) => onChange(field.key, v)}
                        options={field.options}
                        filterOption={
                          field.showSearch
                            ? (input, option) =>
                                String(option?.label ?? '')
                                  .toLowerCase()
                                  .includes(input.toLowerCase())
                            : undefined
                        }
                        style={{ width: '100%' }}
                      />
                    )}

                    {field.type === 'date' && (
                      <DatePicker
                        placeholder={field.placeholder}
                        value={val}
                        onChange={(date) => onChange(field.key, date)}
                        format="DD/MM/YYYY"
                        style={{ width: '100%' }}
                      />
                    )}

                    {field.type === 'date-range' && (
                      <RangePicker
                        placeholder={
                          field.placeholder ? [field.placeholder, field.placeholder] : undefined
                        }
                        value={val}
                        onChange={(dates) => onChange(field.key, dates)}
                        format="DD/MM/YYYY"
                        style={{ width: '100%' }}
                      />
                    )}

                    {field.type === 'custom' && field.renderCustom && field.renderCustom()}
                  </div>
                </Col>
              );
            })}
          </Row>
        </Col>

        {/* Right Side: Extra actions */}
        {extra && (
          <Col xs={24} md="auto" style={{ display: 'flex', justifyContent: 'flex-end', marginLeft: 'auto' }}>
            {extra}
          </Col>
        )}
      </Row>
    </Card>
  );
};
