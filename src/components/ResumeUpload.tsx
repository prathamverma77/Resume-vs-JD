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
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 md:p-6 transition-colors shadow-2xs">
      <div className="flex items-center justify-between mb-3.5">
        <label className="text-sm font-semibold text-zinc-950 dark:text-white">
          Resume Document
        </label>
        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          Max 5MB
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
          className={`group flex-1 min-h-[250px] md:min-h-[270px] border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            isDragging
              ? "border-blue-600 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-950/40"
              : "border-zinc-300 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-400 bg-white dark:bg-zinc-900 hover:bg-blue-50/20 dark:hover:bg-blue-950/20"
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3.5 transition-colors group-hover:scale-105">
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
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
          </div>
          <p className="text-sm md:text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
            <span className="text-blue-600 dark:text-blue-400 underline underline-offset-2 font-semibold">
              Click to upload
            </span>{" "}
            or drag and drop
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-normal">
            Selectable text PDF files only
          </p>
        </div>
      ) : (
        /* Selected File Card */
        <div className="flex-1 min-h-[250px] md:min-h-[270px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5 overflow-hidden">
              <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
                <svg
                  className="w-5 h-5"
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
                  className="text-sm md:text-base font-semibold text-zinc-950 dark:text-white truncate"
                  title={file.name}
                >
                  {file.name}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5 font-medium">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="text-zinc-500 hover:text-red-600 dark:hover:text-red-400 p-1.5 rounded transition-colors cursor-pointer"
              title="Remove file"
            >
              <svg
                className="w-5 h-5"
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

          <div className="pt-3.5 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-sm">
            <span className="inline-flex items-center gap-1.5 text-blue-800 dark:text-blue-300 text-sm font-medium bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 px-2.5 py-1 rounded">
              <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
              Ready to match
            </span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors cursor-pointer"
            >
              Replace
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
