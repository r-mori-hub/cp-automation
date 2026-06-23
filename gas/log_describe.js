

// メモ帳にログを書く
function logdescribe(file,result) {

const fileName =
  `${yyyy}_${mm}log.txt`;

const folder = DriveApp.getFolderById(LOG);

const files = folder.getFilesByName(fileName);
let logFile;

if (files.hasNext()) {
  logFile = files.next();
} else {
  logFile = folder.createFile(fileName, "");
}

const currentText = logFile.getBlob().getDataAsString("UTF-8");

const now = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    'yyyy/MM/dd HH:mm:ss'
  );

  // 保存成功だけ二重ログを防ぐ
if (
  result.includes('保存成功') &&
  currentText.includes(file.getName())
) {
  return;
}

const line = `${now}\n${file.getName()} ${result}`;

logFile.setContent(currentText + '\n' + line);
}
// メモ帳にログを書く


