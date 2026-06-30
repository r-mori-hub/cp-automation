//  google driveにつなぐためのもの
 const LOG='1q41lwzs1Ron1oLLPwQkD8Svf5eDWVeK_';
 const GOOGLEDRIVE_FOLDER = '1RpDPvjujSevCbnJDYgXjjOQkXc8ul-Xj';
//  google driveに保存するもの

// supabaseにつなぐためのもの
 const props = PropertiesService.getScriptProperties();
 const SUPABASE_URL = props.getProperty('SUPABASE_URL');
 const SUPABASE_SERVICE_ROLE_KEY = props.getProperty('SUPABASE_SERVICE_ROLE_KEY');
 const SUPABASE_BUCKET = props.getProperty('SUPABASE_BUCKET');
 // supabaseに保存するもの

