import { useState } from 'react';
import { Upload, message, Typography, Progress } from 'antd';
import { UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react';
import { httpClient } from '@shared/api';
import type { UploadProps } from 'antd';

const { Text } = Typography;

interface FileUploadProps {
  accept?: string;
  maxSize?: number; // in MB
  onUploadSuccess?: (fileId: string, fileUrl: string, fileName: string) => void;
  onUploadError?: (error: any) => void;
  showPreview?: boolean;
}

export function FileUpload({
  accept,
  maxSize = 10,
  onUploadSuccess,
  onUploadError,
  showPreview = true,
}: FileUploadProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadedFile, setUploadedFile] = useState<{ id: string; name: string; url: string } | null>(null);

  const customRequest: UploadProps['customRequest'] = async ({ file, onSuccess, onError, onProgress }) => {
    const rawFile = file as File;

    // Validate size
    if (rawFile.size > maxSize * 1024 * 1024) {
      const errorMsg = `Dung lượng tệp vượt quá giới hạn cho phép (${maxSize}MB)`;
      message.error(errorMsg);
      setStatus('error');
      if (onUploadError) onUploadError(new Error(errorMsg));
      if (onError) onError(new Error(errorMsg));
      return;
    }

    setStatus('uploading');
    setProgress(0);

    const formData = new FormData();
    formData.append('file', rawFile);

    try {
      const response = await httpClient.post<any>('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setProgress(percent);
          if (onProgress) onProgress({ percent });
        },
      });

      const fileData = response.data;
      const fileUrl = `/api/v1/files/${fileData.id}/view`;

      setStatus('success');
      setUploadedFile({
        id: fileData.id,
        name: fileData.fileName || rawFile.name,
        url: fileUrl,
      });

      if (onUploadSuccess) {
        onUploadSuccess(fileData.id, fileUrl, fileData.fileName || rawFile.name);
      }
      if (onSuccess) onSuccess(fileData);
    } catch (error: any) {
      setStatus('error');
      const errorMsg = error.response?.data?.message || error.message || 'Lỗi khi tải tệp lên';
      message.error(errorMsg);
      if (onUploadError) onUploadError(error);
      if (onError) onError(error);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <Upload.Dragger
        accept={accept}
        customRequest={customRequest}
        showUploadList={false}
        disabled={status === 'uploading'}
        style={{
          borderRadius: 12,
          padding: '24px 16px',
          background: 'rgba(0,0,0,0.01)',
          border: '1px dashed rgba(0,0,0,0.15)',
        }}
      >
        <div className="flex flex-col items-center justify-center text-center">
          {status === 'idle' && (
            <>
              <UploadCloud size={40} className="text-text-tertiary mb-3 opacity-60" />
              <Text strong style={{ fontSize: 14 }}>Kéo thả tệp tin hoặc nhấn để chọn</Text>
              <Text type="secondary" style={{ fontSize: 12, marginTop: 4 }}>
                Hỗ trợ tải lên mọi định dạng tệp (Tối đa {maxSize}MB)
              </Text>
            </>
          )}

          {status === 'uploading' && (
            <div style={{ width: '100%', padding: '0 20px' }}>
              <Progress percent={progress} status="active" strokeColor="var(--color-primary)" />
              <Text type="secondary" style={{ fontSize: 12, marginTop: 8, display: 'block' }}>
                Đang tải tệp lên máy chủ... ({progress}%)
              </Text>
            </div>
          )}

          {status === 'success' && uploadedFile && (
            <div className="flex flex-col items-center">
              <CheckCircle2 size={36} className="text-green-500 mb-2" />
              <Text strong style={{ fontSize: 13.5 }} className="text-green-600">
                Tải lên thành công!
              </Text>
              <Text type="secondary" style={{ fontSize: 12, marginTop: 4 }} ellipsis className="max-w-[280px]">
                {uploadedFile.name}
              </Text>
              {showPreview && uploadedFile.name.match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
                <div style={{ marginTop: 12, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <img
                    src={`${uploadedFile.url}?t=${Date.now()}`}
                    alt="Preview"
                    style={{ maxHeight: 100, objectFit: 'contain' }}
                  />
                </div>
              )}
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center">
              <AlertCircle size={36} className="text-red-500 mb-2" />
              <Text strong style={{ fontSize: 13.5 }} className="text-red-600">
                Tải lên thất bại!
              </Text>
              <Text type="secondary" style={{ fontSize: 12, marginTop: 4 }}>
                Vui lòng thử lại bằng tệp tin hợp lệ.
              </Text>
            </div>
          )}
        </div>
      </Upload.Dragger>
    </div>
  );
}
export default FileUpload;
