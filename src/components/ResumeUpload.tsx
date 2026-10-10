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

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const isPdf =
        droppedFile.type === "application/pdf" ||
        droppedFile.name.toLowerCase().endsWith(".pdf");

      if (isPdf) {
        onFileChange(droppedFile);
        onError?.(null);
      } else {
        onError?.("Only PDF files are supported. Please upload a valid .pdf file.");
      }
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const isPdf =
        selectedFile.type === "application/pdf" ||
        selectedFile.name.toLowerCase().endsWith(".pdf");

      if (isPdf) {
        onFileChange(selectedFile);
        onError?.(null);
      } else {
        onError?.("Only PDF files are supported. Please upload a valid .pdf file.");
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
    <div className="flex flex-col h-full bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center justify-center">
            1
          </span>
          <label className="text-sm font-bold text-slate-900 tracking-tight">
            Step 1: Upload Resume
          </label>
        </div>
        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
          .PDF Only
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {!file ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`group flex-1 min-h-[250px] md:min-h-[290px] border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? "border-blue-600 bg-blue-50/70 scale-[1.01] shadow-inner"
              : "border-slate-300/90 hover:border-blue-500 hover:bg-slate-50/70"
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-3.5 group-hover:scale-110 transition-transform duration-200 shadow-2xs">
            <svg
              className="w-7 h-7 stroke-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.75"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
            Drag and drop your resume file
          </p>
          <p className="text-xs text-slate-500 mb-3">
            or{" "}
            <span className="text-blue-600 font-semibold underline underline-offset-2">
              browse computer
            </span>
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-100/80 px-2.5 py-1 rounded-full font-medium">
            <span>Max file size: 5MB</span>
          </div>
        </div>
      ) : (
        /* Selected File Preview Card */
        <div className="flex-1 min-h-[250px] md:min-h-[290px] bg-slate-50/80 border border-slate-200/90 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5 overflow-hidden">
              <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
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
                  className="text-sm font-bold text-slate-900 truncate max-w-[190px] md:max-w-[210px]"
                  title={file.name}
                >
                  {file.name}
                </p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer"
              title="Remove file"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="mt-4 pt-3.5 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
              <svg
                className="w-3.5 h-3.5 text-emerald-600 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
              Ready for analysis
            </span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-600 hover:text-blue-800 font-semibold hover:underline cursor-pointer"
            >
              Replace file
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
