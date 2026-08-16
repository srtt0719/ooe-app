import crypto from "node:crypto";
import { getSettings, SETTING_KEYS } from "./settings";

const TOKEN_URL = "https://auth.worksmobile.com/oauth2/v2.0/token";
const API_BASE = "https://www.worksapis.com/v1.0";

type SendResult = { ok: boolean; error?: string };

type Credentials = {
  clientId: string;
  clientSecret: string;
  serviceAccount: string;
  privateKey: string;
  botId: string;
};

// サーバーレス関数のウォーム状態の間だけ有効なトークンキャッシュ。
// コールドスタートでリセットされても、次回呼び出し時に取り直すだけなので問題ない。
let cachedToken: { token: string; expiresAt: number } | null = null;

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function buildJwt(creds: Credentials): string {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({ iss: creds.clientId, sub: creds.serviceAccount, iat: now, exp: now + 3000 }),
  );
  const unsigned = `${header}.${payload}`;
  const signature = crypto.sign("RSA-SHA256", Buffer.from(unsigned), creds.privateKey);
  return `${unsigned}.${base64url(signature)}`;
}

async function loadCredentials(): Promise<Credentials | null> {
  const s = await getSettings([
    SETTING_KEYS.lineworksClientId,
    SETTING_KEYS.lineworksClientSecret,
    SETTING_KEYS.lineworksServiceAccount,
    SETTING_KEYS.lineworksPrivateKey,
    SETTING_KEYS.lineworksBotId,
  ]);
  const clientId = s[SETTING_KEYS.lineworksClientId];
  const clientSecret = s[SETTING_KEYS.lineworksClientSecret];
  const serviceAccount = s[SETTING_KEYS.lineworksServiceAccount];
  const privateKey = s[SETTING_KEYS.lineworksPrivateKey];
  const botId = s[SETTING_KEYS.lineworksBotId];
  if (!clientId || !clientSecret || !serviceAccount || !privateKey || !botId) return null;
  return { clientId, clientSecret, serviceAccount, privateKey, botId };
}

async function getAccessToken(creds: Credentials): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) return cachedToken.token;

  const body = new URLSearchParams({
    assertion: buildJwt(creds),
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    client_id: creds.clientId,
    client_secret: creds.clientSecret,
    scope: "bot.message",
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    throw new Error(`トークン取得に失敗しました (${res.status}) ${(await res.text()).slice(0, 300)}`);
  }
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { token: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 };
  return cachedToken.token;
}

async function send(path: string, text: string): Promise<SendResult> {
  const creds = await loadCredentials();
  if (!creds) return { ok: false, error: "LINE WORKSの接続情報が未設定です" };
  try {
    const token = await getAccessToken(creds);
    const res = await fetch(`${API_BASE}/bots/${creds.botId}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: { type: "text", text } }),
    });
    if (!res.ok) {
      return { ok: false, error: `送信失敗 (${res.status}) ${(await res.text()).slice(0, 300)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "送信に失敗しました" };
  }
}

export function sendToChannel(channelId: string, text: string): Promise<SendResult> {
  return send(`/channels/${channelId}/messages`, text);
}

export function sendToUser(userId: string, text: string): Promise<SendResult> {
  return send(`/users/${userId}/messages`, text);
}
