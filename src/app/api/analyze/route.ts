import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";
import { parsePDF, PDFParseError } from "@/lib/parser/pdf-parser";
import { calculateScore } from "@/lib/scoring/score-engine";
import {
    extractResumeWithHarness,
    extractJobDescriptionWithHarness,
} from "@/lib/ai/extraction-harness";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MIN_JD_LENGTH = 30; // 30 characters
const MAX_JD_LENGTH = 30000; // 30,000 characters
const MIN_RESUME_TEXT_LENGTH = 20; // At least 20 chars of readable text

export async function POST(req: NextRequest) {
    try {
        // 1. Receive formData containing resume and jobDescription
        let formData: FormData;
        try {
            formData = await req.formData();
        } catch {
            return NextResponse.json(
                { success: false, message: "Invalid request payload. Expected multipart form-data." },
                { status: 400 }
            );
        }

        const resume = formData.get("resume") as File | null;
        const jobDescriptionInput = formData.get("jobDescription") as string | File | null;

        // 2. Validate resume presence
        if (!resume) {
            return NextResponse.json(
                { success: false, message: "No resume file was uploaded. Please provide a PDF or Word (.docx) resume." },
                { status: 400 }
            );
        }

        // 3. Validate resume file extension and MIME type (PDF and DOCX)
        const resumeName = (resume.name || "").toLowerCase();
        const isPdf = resume.type === "application/pdf" || resumeName.endsWith(".pdf");
        const isDocx =
            resume.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
            resumeName.endsWith(".docx");

        if (!isPdf && !isDocx) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unsupported file format. Please upload a PDF (.pdf) or Word document (.docx).",
                },
                { status: 415 }
            );
        }

        // 4. Validate resume file size (Empty and Max size)
        if (resume.size === 0) {
            return NextResponse.json(
                { success: false, message: "The uploaded resume file is empty (0 bytes). Please upload a valid document." },
                { status: 400 }
            );
        }

        if (resume.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Resume file is too large (${(resume.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is 5MB.`,
                },
                { status: 413 }
            );
        }

        // 5. Parse Resume text (PDF or DOCX) in-memory
        let cleanResumeText = "";
        let pageCount = 1;

        if (isPdf) {
            try {
                const resumePdfData = await parsePDF(resume);
                cleanResumeText = resumePdfData.text.trim();
                pageCount = resumePdfData.pageCount;
            } catch (pdfErr) {
                if (pdfErr instanceof PDFParseError) {
                    return NextResponse.json(
                        { success: false, message: pdfErr.message },
                        { status: 422 }
                    );
                }
                return NextResponse.json(
                    {
                        success: false,
                        message: "Failed to read the PDF file. It may be corrupted, encrypted, or password-protected.",
                    },
                    { status: 422 }
                );
            }
        } else if (isDocx) {
            try {
                const arrayBuffer = await resume.arrayBuffer();
                const docxBuffer = Buffer.from(arrayBuffer);
                const docxResult = await mammoth.extractRawText({ buffer: docxBuffer });
                cleanResumeText = (docxResult.value || "").trim();
            } catch {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Failed to read the Word document (.docx). The file may be corrupted or password-protected.",
                    },
                    { status: 422 }
                );
            }
        }

        // 6. Validate extracted text readability
        if (cleanResumeText.length < MIN_RESUME_TEXT_LENGTH) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "No readable text could be extracted from this document. It may be an image-only scan or empty. Please upload a file containing selectable text.",
                },
                { status: 422 }
            );
        }
        // 7. Extract & Validate Job Description
        let jdText = "";
        if (!jobDescriptionInput) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Job description is required. Please paste the job requirements to compare against.",
                },
                { status: 400 }
            );
        }

        if (typeof jobDescriptionInput === "string") {
            jdText = jobDescriptionInput;
        } else if (jobDescriptionInput instanceof File) {
            const jdFileName = (jobDescriptionInput.name || "").toLowerCase();
            if (jobDescriptionInput.size === 0) {
                return NextResponse.json(
                    { success: false, message: "The uploaded Job Description file is empty (0 bytes)." },
                    { status: 400 }
                );
            }
            if (jobDescriptionInput.size > MAX_FILE_SIZE) {
                return NextResponse.json(
                    { success: false, message: "The uploaded Job Description file exceeds the 5MB size limit." },
                    { status: 413 }
                );
            }

            if (jobDescriptionInput.type === "application/pdf" || jdFileName.endsWith(".pdf")) {
                try {
                    const jdPdfData = await parsePDF(jobDescriptionInput);
                    jdText = jdPdfData.text;
                } catch {
                    return NextResponse.json(
                        { success: false, message: "Failed to parse the Job Description PDF file. It may be corrupted." },
                        { status: 422 }
                    );
                }
            } else if (
                jobDescriptionInput.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
                jdFileName.endsWith(".docx")
            ) {
                try {
                    const arrayBuffer = await jobDescriptionInput.arrayBuffer();
                    const docxBuffer = Buffer.from(arrayBuffer);
                    const docxResult = await mammoth.extractRawText({ buffer: docxBuffer });
                    jdText = docxResult.value || "";
                } catch {
                    return NextResponse.json(
                        { success: false, message: "Failed to parse the Job Description Word document (.docx). It may be corrupted." },
                        { status: 422 }
                    );
                }
            } else if (jobDescriptionInput.type.startsWith("text/") || jdFileName.endsWith(".txt")) {
                jdText = await jobDescriptionInput.text();
            } else {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Unsupported Job Description file format. Please upload a PDF, Word document (.docx), or plain text file.",
                    },
                    { status: 415 }
                );
            }
        }

        const cleanJDText = jdText.trim();

        // 8. Validate JD content rules (empty, too short, too long)
        if (cleanJDText.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Job description is empty. Please paste the job requirements to compare against.",
                },
                { status: 400 }
            );
        }

        if (cleanJDText.length < MIN_JD_LENGTH) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Job description is too short (${cleanJDText.length} characters). Please provide at least ${MIN_JD_LENGTH} characters for a meaningful analysis.`,
                },
                { status: 400 }
            );
        }

        if (cleanJDText.length > MAX_JD_LENGTH) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Job description is unusually long (${cleanJDText.length.toLocaleString()} characters). Maximum allowed is ${MAX_JD_LENGTH.toLocaleString()} characters.`,
                },
                { status: 400 }
            );
        }

        // 9. Extract Resume & Job Description via AI Harness (parallel execution with local fallback)
        console.log("\n========================================================");
        console.log(`[POST /api/analyze] Processing new candidate analysis request...`);
        console.log(`[POST /api/analyze] Resume Size: ${resume.size}B | JD Length: ${cleanJDText.length} chars`);

        const [structuredResume, parsedJD] = await Promise.all([
            extractResumeWithHarness(cleanResumeText),
            extractJobDescriptionWithHarness(cleanJDText),
        ]);

        // 10. Calculate Match Score (Deterministic Engine)
        const matchAnalysis = calculateScore(structuredResume, parsedJD);
        console.log(
            `[POST /api/analyze] ✅ Analysis completed! Score: ${matchAnalysis.overallScore}% (${matchAnalysis.matchLevel})`
        );
        console.log("========================================================\n");

        // 11. Return unified response with Resume, JD, and Match Score Analysis
        return NextResponse.json(
            {
                success: true,
                message: "Resume and Job Description processed successfully",
                matchAnalysis,
                resume: {
                    fileInfo: {
                        name: resume.name,
                        size: resume.size,
                        type: resume.type,
                    },
                    textLength: cleanResumeText.length,
                    pageCount,
                    extractedText: cleanResumeText,
                    structuredData: structuredResume,
                },
                jobDescription: {
                    rawText: cleanJDText,
                    parsedData: parsedJD,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error processing analyze request:", error);
        return NextResponse.json(
            {
                success: false,
                message: "An unexpected error occurred while processing the request. Please try again.",
            },
            { status: 500 }
        );
    }
}

