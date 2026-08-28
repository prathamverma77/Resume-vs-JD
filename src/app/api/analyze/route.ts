import {NextRequest,NextResponse} from "next/server";
import { parsePDF } from "@/lib/parser/pdf-parser";
import { structureResume } from "@/lib/parser/resume-structurer";

export async function POST(req:NextRequest,res:NextResponse){
    
    try{
        // 1 Receive the pdf
        const formData = await req.formData();
        const resume = formData.get("resume") as File | null;
        
        // 2 Validating if the file exists
        if(!resume){
            return NextResponse.json(
                {
                    message: "no file uploaded"
                },
                {
                    status:400
                }
            );
        }

        // 3 Validate if it's a pdf
        if(resume.type !== "application/pdf"){
            return NextResponse.json(
                {success:false, message:"only PDF files are allowed"},
                {status: 400}
            );
        }
        

        // 4 Validate the file size  
        const MAX_FILE_SIZE = 5*1024*1024;
        if(resume.size > MAX_FILE_SIZE){
            return NextResponse.json(
                {success:false, message:"File too large. Max size is 5MB"},
                {status:400}
            )
        }

        // 5 Extract text from PDF using helper
        const pdfData = await parsePDF(resume);

        // 6 Structure the extracted resume text (skills, etc.)
        const structuredData = structureResume(pdfData.text);

        // 7 Return success with extracted text and structured data
        return NextResponse.json({
            success:true,
            message:"pdf proccessed successfully",
            fileInfo: {
                name: resume.name,
                size: resume.size,
                type: resume.type,
            },
            extractedText: pdfData.text,
            textLength: pdfData.textLength,
            pageCount: pdfData.pageCount,
            structuredData: structuredData,
        },{status:200});
    } catch (error){
        console.error("error processing pdf", error);
        return NextResponse.json(
            {success: false, message:"failed to process the pdf"},
            {status: 500}
        );  
    }
}

