function safeNameForSupabase(name) {
  return Utilities.base64EncodeWebSafe(
    Utilities.newBlob(String(name)).getBytes()
  );
}



// supabaseにデータをアップロード
function uploadTosupabase(file, thread) {
  try {

  const rename = renamePdfFiles(file);

  if (!rename) {
  throw new Error("renamePdfFilesでファイル名を作れませんでした");
}

  const newFileName = safeNameForSupabase(rename) + ".pdf";

  const storagePath =
  `${yyyy}_${mm}/${newFileName}`;

    const uploadUrl =
      `${SUPABASE_URL}/storage/v1/object/${SUPABASE_BUCKET}/${storagePath}`;

    const response = UrlFetchApp.fetch(uploadUrl, {
      method: 'post',
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        'Content-Type': 'application/pdf',
        'x-upsert': 'true'
      },
      payload: file.getBytes(),
      muteHttpExceptions: true
    });

    const code = response.getResponseCode();

    if (code >= 200 && code < 300) {
      thread.markRead();
      logdescribe(newFileName, 'Supabase保存成功');
    } else {
      logdescribe(
        file,
        `Supabase保存失敗: ${code} ${response.getContentText()}`
      );
    }

  } catch (e) {
    logdescribe(
      file,
      'Supabase保存失敗: ' + e.message
    );
  }
}
// supabaseにデータをアップロード
