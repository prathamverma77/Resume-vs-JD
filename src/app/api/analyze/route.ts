import {NextRequest,NextResponse} from "next/server";


// Route: POST /api/analyze
//it should be form data type not json
export async function POST(req:NextRequest,res:NextResponse){
    const formData = await req.formData();
    const type = "application/pdf";

    const resume = formData.get("resume");
    
    try{
        return NextResponse.json({success:true,message:"form data received successfully"},{status:200});
    }
    catch(error){
        return NextResponse.json({success:false,message:error},{status:500});
    }     
    
}    


