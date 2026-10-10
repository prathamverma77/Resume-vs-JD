// @ts-expect-error - pdf-parse/lib/pdf-parse.js bypasses index.parent debug bug
import pdf from "pdf-parse/lib/pdf-parse.js";

export interface PDFParseResult {
    text: string;
    pageCount: number;
    textLength: number;
}

export class PDFParseError extends Error {
    public code: "EMPTY_FILE" | "INVALID_HEADER" | "CORRUPTED_OR_LOCKED" | "PARSING_FAILED";

    constructor(message: string, code: "EMPTY_FILE" | "INVALID_HEADER" | "CORRUPTED_OR_LOCKED" | "PARSING_FAILED") {
        super(message);
        this.name = "PDFParseError";
        this.code = code;
    }
}

/**
 * Extracts text and metadata from a PDF File, Buffer, or ArrayBuffer.
 */
export async function parsePDF(input: File | Buffer | ArrayBuffer): Promise<PDFParseResult> {
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
        const extractedText = typeof pdfData?.text === "string" ? pdfData.text : "";

        return {
            text: extractedText,
            pageCount: pdfData?.numpages || 1,
            textLength: extractedText.length,
        };
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        throw new PDFParseError(
            `Unable to read the PDF. The file may be password-protected, encrypted, or corrupted (${message}).`,
            "CORRUPTED_OR_LOCKED"
        );
    }
}
