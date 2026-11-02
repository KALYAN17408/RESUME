import React, { useRef } from 'react';
import type { ResumeData } from '../../types/resume.types';
import { ResumeRenderer } from '../../templates/ResumeRenderer';

interface ResumePreviewProps {
  data: ResumeData;
  zoom: number;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ data, zoom }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scale = zoom / 100;

  return (
    <div className="flex-1 bg-slate-200/70 overflow-auto p-4 sm:p-8 flex justify-center items-start min-h-[calc(100vh-60px)]">
      {/* Scaled A4 Wrapper */}
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          transition: 'transform 0.15s ease-out',
        }}
        className="w-[794px] shrink-0 my-4"
      >
        {/* Printable A4 Page with subtle elevation */}
        <div
          ref={containerRef}
          className="bg-white rounded-sm shadow-elevated border border-slate-300/80 min-h-[1123px] relative overflow-hidden"
        >
          {/* Live Template Content */}
          <ResumeRenderer data={data} />

          {/* Printable Page Footer / Metadata (Watermark-free ATS notice) */}
          <div className="absolute bottom-2 right-4 text-[9px] text-slate-300 font-mono select-none pointer-events-none">
            Page 1 of 1 • ATS Compliant Vector Stream
          </div>
        </div>
      </div>
    </div>
  );
};
