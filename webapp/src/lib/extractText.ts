import iconv from "iconv-lite";
import pdfParse from "pdf-parse";

// 日本語のDXFは(古いAutoCADの既定である)Shift-JISで保存されていることが多い。
// UTF-8として妥当なバイト列でなければShift-JISとして読み直す。
function decodeDxfBuffer(buf: Buffer): string {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buf);
  } catch {
    return iconv.decode(buf, "shift_jis");
  }
}

// MTEXTの\U+XXXXユニコードエスケープ、\Pの改行を実際の文字に戻す
function unescapeMtext(s: string): string {
  return s
    .replace(/\\U\+([0-9A-Fa-f]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\\P/g, "\n");
}

// DXF(ASCII形式)はグループコードと値が交互に並ぶテキスト形式。
// グループコード1(TEXT/ATTRIB本文、MTEXT先頭行)と3(MTEXT続き)の値を集める。
// 仕様書5-6: 図面枠内の文字列(図番・現場名・材質・板厚)の抽出が目的。
export function extractDxfText(buf: Buffer): string | null {
  const raw = decodeDxfBuffer(buf);
  const lines = raw.split(/\r\n|\r|\n/);
  const texts: string[] = [];

  for (let i = 0; i < lines.length - 1; i++) {
    const code = lines[i].trim();
    if (code === "1" || code === "3") {
      const value = unescapeMtext(lines[i + 1].trim());
      if (value) texts.push(value);
    }
  }

  const joined = texts.join("\n").trim();
  return joined || null;
}

export async function extractPdfText(buf: Buffer): Promise<string | null> {
  try {
    const data = await pdfParse(buf);
    const text = (data.text ?? "").trim();
    return text || null;
  } catch (e) {
    console.error("PDF text extraction failed", e);
    return null;
  }
}
