import React from 'react';

interface CircularProgressProps {
  isVisible: boolean;
  message?: string;
  progress?: number; // 0-100
  showProgress?: boolean;
}

const CircularProgress: React.FC<CircularProgressProps> = ({ 
  isVisible, 
  message, 
  progress = 0,
  showProgress = false 
}) => {
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 min-w-[320px]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <svg className="animate-spin" viewBox="0 0 50 50">
              <circle
                className="text-gray-200"
                strokeWidth="4"
                stroke="currentColor"
                fill="none"
                r="20"
                cx="25"
                cy="25"
              />
              <circle
                className="text-blue-600"
                strokeWidth="4"
                strokeDasharray="80, 200"
                strokeDashoffset="0"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                r="20"
                cx="25"
                cy="25"
              />
            </svg>
          </div>
          
          {message && <span className="text-lg text-gray-700 font-medium">{message}</span>}
          
          {showProgress && (
            <div className="w-full space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Progreso</span>
                <span className="text-blue-600 font-semibold">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-linear-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CircularProgress;
