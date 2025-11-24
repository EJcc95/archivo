import { IconCloudUpload } from '@tabler/icons-react';

interface UploadProgressModalProps {
  isOpen: boolean;
  progress: number;
  fileName?: string;
  title?: string;
  description?: string;
}

export default function UploadProgressModal({
  isOpen,
  progress,
  fileName,
  title = 'Subiendo documento',
  description = 'Por favor espere mientras se guarda el documento...'
}: UploadProgressModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 transform transition-all">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <IconCloudUpload className="h-6 w-6 text-[#032DFF]" />
          </div>
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-2">{title}</h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500 mb-4">
              {description}
            </p>
            {fileName && (
              <p className="text-xs text-gray-400 mb-4 truncate">
                {fileName}
              </p>
            )}
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
              <div 
                className="bg-[#032DFF] h-2.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-right text-gray-500 font-medium mt-1">
              {progress}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
