import LedgerApp from "./ledger-app";
import { getChatGPTUser } from "./chatgpt-auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getChatGPTUser();
  return <LedgerApp displayName={user?.displayName ?? "本地用户"} />;
}
