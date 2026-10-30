"use client";

import React, { useState, useRef, ChangeEvent, DragEvent } from "react";

interface ResumeUploadProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  onError?: (error: string | null) => void;
}

export default function ResumeUpload({
  file,
  onFileChange,
  onError,
}: ResumeUploadProps) {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const isSupportedFile = (f: File) => {
    const name = f.name.toLowerCase();
    const isPdf = f.type === "application/pdf" || name.endsWith(".pdf");
    const isDocx =
      f.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      name.endsWith(".docx");
    return isPdf || isDocx;
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (isSupportedFile(droppedFile)) {
        onFileChange(droppedFile);
        onError?.(null);
      } else {
        onError?.("Only PDF and Word (.docx) files are supported. Please upload a valid .pdf or .docx resume.");
      }
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (isSupportedFile(selectedFile)) {
        onFileChange(selectedFile);
        onError?.(null);
      } else {
        onError?.("Only PDF and Word (.docx) files are supported. Please upload a valid .pdf or .docx resume.");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileChange(null);
    onError?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1B1C1A] border border-[#EAE4DC] dark:border-[#2F302C] rounded-2xl p-6 shadow-xs transition-colors">
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-medium text-[#141514] dark:text-[#F4F2EE]">
          Resume (PDF or DOCX)
        </label>
        <span className="text-[11px] text-[#82847E] dark:text-[#72736C]">
          Max 5MB
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {!file ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex-1 min-h-[340px] sm:min-h-[380px] border border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
            isDragging
              ? "border-[#141514] dark:border-[#F4F2EE] bg-[#FAF7F2] dark:bg-[#222320]"
              : "border-[#EAE4DC] dark:border-[#2F302C] hover:border-[#141514] dark:hover:border-[#F4F2EE] bg-[#FAF7F2]/60 dark:bg-[#161715]"
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#1B1C1A] border border-[#EAE4DC] dark:border-[#2F302C] flex items-center justify-center text-[#5C5E58] dark:text-[#9E9F97] mb-4 shadow-2xs">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.75"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-[#141514] dark:text-[#F4F2EE] mb-1.5">
            <span className="underline underline-offset-2 hover:text-black dark:hover:text-white">
              Select PDF or DOCX file
            </span>{" "}
            or drag and drop here
          </p>
          <p className="text-xs text-[#82847E] dark:text-[#72736C]">
            PDF or Word documents up to 5MB
          </p>
        </div>
      ) : (
        /* Selected File Clean State */
        <div className="flex-1 min-h-[340px] sm:min-h-[380px] bg-[#FAF7F2] dark:bg-[#161715] border border-[#EAE4DC] dark:border-[#2F302C] rounded-xl p-6 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#1B1C1A] border border-[#EAE4DC] dark:border-[#2F302C] text-[#141514] dark:text-[#F4F2EE] flex items-center justify-center shrink-0 shadow-2xs">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.75"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
              </div>
              <div className="overflow-hidden">
                <p
                  className="text-xs font-medium text-[#141514] dark:text-[#F4F2EE] truncate"
                  title={file.name}
                >
                  {file.name}
                </p>
                <p className="text-[11px] text-[#5C5E58] dark:text-[#9E9F97] font-mono mt-0.5">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemoveFile}
              className="text-[#82847E] hover:text-[#B83232] p-1.5 rounded transition-colors cursor-pointer"
              title="Remove file"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="pt-3 border-t border-[#EAE4DC] dark:border-[#2F302C] flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1.5 text-[#1B663E] dark:text-[#35A36A] font-medium text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1B663E] dark:bg-[#35A36A]" />
              Ready for analysis
            </span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-medium text-[#141514] hover:text-black dark:text-[#F4F2EE] dark:hover:text-white transition-colors cursor-pointer"
            >
              Replace file
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
