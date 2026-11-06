// @ts-expect-error - pdf-parse/lib/pdf-parse.js bypasses index.parent debug bug
import pdf from "pdf-parse/lib/pdf-parse.js";

export interface PDFParseResult {
    text: string;
    pageCount: number;
    textLength: number;
}

export interface PDFParseOptions {
    maxPages?: number;
}

export class PDFParseError extends Error {
    public code: "EMPTY_FILE" | "INVALID_HEADER" | "CORRUPTED_OR_LOCKED" | "PARSING_FAILED" | "PAGE_LIMIT_EXCEEDED";

    constructor(
        message: string,
        code: "EMPTY_FILE" | "INVALID_HEADER" | "CORRUPTED_OR_LOCKED" | "PARSING_FAILED" | "PAGE_LIMIT_EXCEEDED"
    ) {
        super(message);
        this.name = "PDFParseError";
        this.code = code;
    }
}

/**
 * Extracts text and metadata from a PDF File, Buffer, or ArrayBuffer.
 */
export async function parsePDF(
    input: File | Buffer | ArrayBuffer,
    options?: PDFParseOptions
): Promise<PDFParseResult> {
    let buffer: Buffer;

    if (input instanceof File) {
        const bytes = await input.arrayBuffer();
        buffer = Buffer.from(bytes);
    } else if (input instanceof ArrayBuffer) {
        buffer = Buffer.from(input);
    } else {
        buffer = input;
    }

    if (!buffer || buffer.length === 0) {
        throw new PDFParseError("The uploaded PDF file is empty (0 bytes).", "EMPTY_FILE");
    }

    // Verify PDF magic header (%PDF-)
    const header = buffer.subarray(0, 5).toString("ascii");
    if (!header.startsWith("%PDF-")) {
        throw new PDFParseError(
            "The file does not appear to be a valid PDF document (missing '%PDF-' header signature).",
            "INVALID_HEADER"
        );
    }

    try {
        const pdfData = await pdf(buffer);
        const totalPages = pdfData?.numpages || 1;

        if (options?.maxPages && totalPages > options.maxPages) {
            throw new PDFParseError(
                `The uploaded PDF has ${totalPages} pages, exceeding the maximum allowed limit of ${options.maxPages} pages. Please upload a standard 1–4 page resume.`,
                "PAGE_LIMIT_EXCEEDED"
            );
        }

        const extractedText = typeof pdfData?.text === "string" ? pdfData.text : "";

        return {
            text: extractedText,
            pageCount: totalPages,
            textLength: extractedText.length,
        };
    } catch (err: unknown) {
        if (err instanceof PDFParseError) {
            throw err;
        }
        const message = err instanceof Error ? err.message : String(err);
        throw new PDFParseError(
            `Unable to read the PDF. The file may be password-protected, encrypted, or corrupted (${message}).`,
            "CORRUPTED_OR_LOCKED"
        );
    }
}
