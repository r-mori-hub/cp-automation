const today = new Date();
const yyyy = today.getFullYear();
const mm = String(
  today.getMonth() + 1
)

   // 選ばれたpdfファイルをひとつずつ要素に分けて抽出
function pdf_detecter() {
    const threads = GmailApp.search(
  'from:it-ops@pc2525.com has:attachment is:unread'
   );

  threads.forEach(thread => {
    thread.getMessages().forEach(message => {
      message.getAttachments().forEach(file => {
       
    if (/^monthly_report_.+\.pdf$/i.test(file.getName())) {
       uploadTosupabase(file,thread);
      
}
      });
    });

  });
  }
 // 選ばれたpdfファイルをひとつずつ要素に分けて抽出







