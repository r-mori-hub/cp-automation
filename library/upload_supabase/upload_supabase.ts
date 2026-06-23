import { createClient } from "@supabase/supabase-js";
import {logger} from "../logger/logger"
import { Buffer } from "buffer";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function upload_supabase(fileName:string,summary:any){

 const { data, error } = await supabase
    .from("reports")
    .insert({
      customer_id: summary.customer_id,
      report_month: summary.report_month,
      pdf_path: summary.pdf_path,
      av_count: summary.av_count,
      ips_count: summary.ips_count,
      bot_count: summary.bot_count,
      infected_hosts: summary.infected_Hosts,
      traffic_gb: summary.trafficGb_gb,
      ai_summary: summary.ai_summary,
      macaddress: summary.macaddress,
      mailaddress: summary.mailaddress,
      companyname: summary.companyname,
      departmentname:  summary.departmentname,
      subject_mail:summary.subject_mail,
      sent: false

    })
    .select();
    
      
console.log("reports insert完了", JSON.stringify(data));

if (error) {
  logger.error(error, "supabaseに適切に保存されていません");
  throw error;
}

  return data;
}



