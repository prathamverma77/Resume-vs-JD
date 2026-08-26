import {NextRequest,NextResponse} from "next/server";
// @ts-expect-error - pdf-parse/lib/pdf-parse.js bypasses index.parent debug bug
import pdf from "pdf-parse/lib/pdf-parse.js";


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

        // 5 Read file and convert to Buffer
        const bytes = await resume.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // 6 Extract text from PDF
        const pdfData = await pdf(buffer);
        const extractedText = pdfData.text;

        // 7 Return success with extracted text
        return NextResponse.json({
            success:true,
            message:"pdf proccessed successfully",
            fileInfo: {
                name: resume.name,
                size: resume.size,
                type: resume.type,
            },
            extractedText: extractedText,
            textLength: extractedText.length,
            pageCount: pdfData.numpages,
        },{status:200});
    } catch (error){
        console.error("error processing pdf", error);
        return NextResponse.json(
            {success: false, message:"failed to process the pdf"},
            {status: 500}
        );  
    }
}

