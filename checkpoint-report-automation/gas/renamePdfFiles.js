// スプレッドシートを読み込む、スプレッドシートから読み込んでファイル名をmacアドレスに変更する
function renamePdfFiles(file) {

  const sheet = SpreadsheetApp
  // 下記のフォルダーIDは本番では変更する
  .openById("1ml16XGrQ5L_fCzkbKIq23hhUC_8NuGzCznjpF8YgNqw")
  .getSheetByName("シート1");

  if (!sheet) {
  throw new Error("シートが見つかりません");
}
  const data = sheet.getDataRange().getValues();
  
  for (let i=0;i<data.length;i++){
  const rename=data[i][12].replace(/:/g, "");//::を消している
  
    if(file.getName().includes(rename)){

      const email=String(data[i][8]).trim();
      const companyname = String(data[i][4]).trim();
      const macaddress=String(rename).trim();

      const newFileName= macaddress+"_asdfgh"+companyname+"lkjhg_"+email+".pdf"
      
      return newFileName
    }
  }

}
// スプレッドシートを読み込む