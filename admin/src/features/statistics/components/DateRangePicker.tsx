import { DatePicker, Space, Button } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import styled from 'styled-components';

const { RangePicker } = DatePicker;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

interface DateRangePickerProps {
  value: [Dayjs, Dayjs];
  onChange: (range: [Dayjs, Dayjs]) => void;
}

const PRESETS: { label: string; range: [Dayjs, Dayjs] }[] = [
  { label: 'Today', range: [dayjs().startOf('day'), dayjs().endOf('day')] },
  {
    label: 'This Week',
    range: [dayjs().startOf('week'), dayjs().endOf('day')],
  },
  {
    label: 'This Month',
    range: [dayjs().startOf('month'), dayjs().endOf('day')],
  },
  {
    label: 'This Year',
    range: [dayjs().startOf('year'), dayjs().endOf('day')],
  },
];

const DateRangePickerComponent: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
}) => {
  return (
    <Wrapper>
      <RangePicker
        value={value}
        onChange={(dates) => {
          if (dates && dates[0] && dates[1]) {
            onChange([dates[0], dates[1]]);
          }
        }}
      />
      <Space>
        {PRESETS.map((preset) => (
          <Button
            key={preset.label}
            size="small"
            onClick={() => onChange(preset.range)}
          >
            {preset.label}
          </Button>
        ))}
      </Space>
    </Wrapper>
  );
};

export default DateRangePickerComponent;
