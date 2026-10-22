import app from "./src/app.js";
import { env } from "@/config/env.js";
import { startBot } from "@/bot/index.js";

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`Health-check server running on port ${PORT}`);
});

// Exit if the bot cannot start (e.g. wrong token), so the host shows a failed
// deploy instead of a "live" server that answers nothing.
startBot().catch((error) => {
  console.log("Error starting bot: ", error);
  process.exit(1);
});
