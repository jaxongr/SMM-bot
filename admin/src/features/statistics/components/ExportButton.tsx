import { Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

interface ExportButtonProps {
  data: Record<string, unknown>[];
  filename: string;
}

const convertToCSV = (data: Record<string, unknown>[]): string => {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((h) => {
      const val = row[h];
      const str = String(val ?? '');
      return str.includes(',') ? `"${str}"` : str;
    }).join(','),
  );

  return [headers.join(','), ...rows].join('\n');
};

const ExportButton: React.FC<ExportButtonProps> = ({ data, filename }) => {
  const handleExport = () => {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      icon={<DownloadOutlined />}
      onClick={handleExport}
      disabled={data.length === 0}
    >
      Export CSV
    </Button>
  );
};

export default ExportButton;
