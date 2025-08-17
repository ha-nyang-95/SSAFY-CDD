import { fetchPublicBlobUrl } from '../../utils/openExternal';
import Button from '../Button';

type Props = {
  imageUrl?: string;
  segmentedUrl?: string;
};

export default function ImageDownloadButtons({ imageUrl, segmentedUrl }: Props) {
  const handleDownload = async (url: string, fileName: string) => {
    try {
      const blobUrl = await fetchPublicBlobUrl(url);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.dispatchEvent(new CustomEvent('app:toast', { 
        detail: { 
          message: `${fileName} 다운로드에 실패했습니다.`, 
          type: 'error' 
        } 
      }));
    }
  };

  if (!imageUrl && !segmentedUrl) {
    return null;
  }

  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      {imageUrl && (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            const fileName = (imageUrl.split('/').pop() || 'original.jpg').split('?')[0];
            handleDownload(imageUrl, fileName);
          }}
        >
          원본 이미지 다운로드
        </Button>
      )}
      {segmentedUrl && (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            const fileName = (segmentedUrl.split('/').pop() || 'segment.jpg').split('?')[0];
            handleDownload(segmentedUrl, fileName);
          }}
        >
          세그먼트 이미지 다운로드
        </Button>
      )}
    </div>
  );
}
