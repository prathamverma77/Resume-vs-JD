// @ts-expect-error - pdf-parse/lib/pdf-parse.js bypasses index.parent debug bug
import pdf from "pdf-parse/lib/pdf-parse.js";

export interface PDFParseResult {
    text: string;
    pageCount: number;
    textLength: number;
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

    const pdfData = await pdf(buffer);

    return {
        text: pdfData.text,
        pageCount: pdfData.numpages,
        textLength: pdfData.text.length,
    };
}
