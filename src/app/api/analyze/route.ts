import { NextRequest, NextResponse } from "next/server";
import { parsePDF } from "@/lib/parser/pdf-parser";
import { structureResume } from "@/lib/parser/resume-structurer";
import { parseJD } from "@/lib/parser/jd-parser";
import { calculateScore } from "@/lib/scoring/score-engine";

export async function POST(req: NextRequest) {
    try {
        // 1. Receive formData containing both resume and jobDescription
        const formData = await req.formData();
        const resume = formData.get("resume") as File | null;
        const jobDescriptionInput = formData.get("jobDescription") as string | File | null;

        // 2. Validate resume presence
        if (!resume) {
            return NextResponse.json(
                { success: false, message: "No resume file uploaded" },
                { status: 400 }
            );
        }

        // 3. Validate resume file type
        if (resume.type !== "application/pdf") {
            return NextResponse.json(
                { success: false, message: "Only PDF files are allowed for resume" },
                { status: 400 }
            );
        }

        // 4. Validate resume file size (Max 5MB)
        const MAX_FILE_SIZE = 5 * 1024 * 1024;
        if (resume.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { success: false, message: "File too large. Max size is 5MB" },
                { status: 400 }
            );
        }

        // 5. Parse Resume PDF text & structure resume data
        const resumePdfData = await parsePDF(resume);
        const structuredResume = structureResume(resumePdfData.text);

        // 6. Handle Job Description (could be pasted text OR an uploaded file)
        let jdText = "";
        if (jobDescriptionInput) {
            if (typeof jobDescriptionInput === "string") {
                jdText = jobDescriptionInput;
            } else if (jobDescriptionInput instanceof File) {
                if (jobDescriptionInput.type === "application/pdf") {
                    const jdPdfData = await parsePDF(jobDescriptionInput);
                    jdText = jdPdfData.text;
                } else {
                    jdText = await jobDescriptionInput.text();
                }
            }
        }

        // 7. Parse Job Description using parseJD (if JD text provided)
        const parsedJD = jdText ? parseJD(jdText) : null;

        // 8. Calculate Match Score (if parsed JD exists)
        const matchAnalysis = parsedJD
            ? calculateScore(structuredResume, parsedJD)
            : null;

        // 9. Return unified response with Resume, JD, and Match Score Analysis
        return NextResponse.json({
            success: true,
            message: "Resume and Job Description processed successfully",
            matchAnalysis: matchAnalysis,
            resume: {
                fileInfo: {
                    name: resume.name,
                    size: resume.size,
                    type: resume.type,
                },
                textLength: resumePdfData.textLength,
                pageCount: resumePdfData.pageCount,
                extractedText: resumePdfData.text,
                structuredData: structuredResume,
            },
            jobDescription: {
                rawText: jdText,
                parsedData: parsedJD,
            }
        }, { status: 200 });

    } catch (error) {
        console.error("Error processing analyze request:", error);
        return NextResponse.json(
            { success: false, message: "Failed to process the request" },
            { status: 500 }
        );
    }
}

