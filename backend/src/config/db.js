const { supabase } = require("./supabase");

async function connectDB() {
  const { error } = await supabase.from("users").select("id", { head: true, count: "exact" });
  if (error) throw new Error(`Supabase connection failed: ${error.message}`);
  console.log("Supabase connected");
}

async function isDbConnected() {
  const { error } = await supabase.from("users").select("id", { head: true, count: "exact" });
  return !error;
}

module.exports = connectDB;
module.exports.isDbConnected = isDbConnected;
