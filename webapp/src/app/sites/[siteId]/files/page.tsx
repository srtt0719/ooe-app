import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { fmtDate } from "@/lib/format";
import { extBadgeClass, extOf } from "@/lib/fileCategory";
import { AppHeader } from "@/components/AppHeader";
import { UploadArea } from "./UploadArea";
import { FileMemoField } from "./FileMemoField";
import { uploadFiles, updateFileMemo } from "./actions";

export default async function SiteFilesPage({
  params,
  searchParams,
}: {
  params: Promise<{ siteId: string }>;
  searchParams: Promise<{ q?: string; sort?: string }>;
}) {
  const { siteId: siteIdStr } = await params;
  const siteId = Number(siteIdStr);
  const { q, sort } = await searchParams;
  const query = (q ?? "").trim();
  const nameSort = sort !== "new";

  const site = await prisma.site.findUnique({ where: { siteId } });
  if (!site || site.isDeleted) notFound();

  const files = await prisma.file.findMany({
    where: {
      siteId,
      ...(query
        ? {
            OR: [
              { fileName: { contains: query, mode: "insensitive" } },
              { memo: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: nameSort ? { fileName: "asc" } : { uploadedAt: "desc" },
  });

  const drawings = files.filter((f) => f.category === "図面");
  const photos = files
    .filter((f) => f.category === "写真")
    .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
  const others = files.filter((f) => f.category === "その他");

  const boundUpload = uploadFiles.bind(null, siteId);

  return (
    <div>
      <AppHeader title="資料" subtitle={site.siteName} backHref={`/sites/${site.siteId}`} />
      <div className="wrap">
        <UploadArea uploadAction={boundUpload} />

        <form>
          <input
            className="search"
            name="q"
            defaultValue={query}
            placeholder="ファイル名・メモで検索"
          />
        </form>

        <div className="sorter">
          <a href={`?${new URLSearchParams({ ...(query ? { q: query } : {}) }).toString()}`} className={nameSort ? "on" : undefined}>
            名前順
          </a>
          <a
            href={`?${new URLSearchParams({ ...(query ? { q: query } : {}), sort: "new" }).toString()}`}
            className={!nameSort ? "on" : undefined}
          >
            新しい順
          </a>
        </div>

        {files.length === 0 && (
          <p className="sub" style={{ marginTop: 16 }}>
            {query ? "該当するファイルがありません。" : "まだファイルがありません。"}
          </p>
        )}

        {drawings.length > 0 && (
          <>
            <div className="eyebrow">
              図面 <span className="count">{drawings.length}</span>
            </div>
            <div className="card">
              {drawings.map((f) => (
                <FileRow key={f.fileId} file={f} siteId={siteId} />
              ))}
            </div>
          </>
        )}

        {photos.length > 0 && (
          <>
            <div className="eyebrow">
              写真 <span className="count">{photos.length}</span>
            </div>
            <div className="card">
              <div className="thumbs">
                {photos.map((f) => (
                  <a
                    key={f.fileId}
                    className="thumb"
                    style={{ backgroundImage: `url(/api/files/${f.fileId})` }}
                    data-d={fmtDate(f.uploadedAt)}
                    href={`/api/files/${f.fileId}`}
                    target="_blank"
                    rel="noreferrer"
                  />
                ))}
              </div>
              {photos.map((f) => (
                <div key={f.fileId} style={{ marginTop: 8 }}>
                  <div className="fname">{f.fileName}</div>
                  <FileMemoField memo={f.memo} action={updateFileMemo.bind(null, f.fileId, siteId)} />
                </div>
              ))}
            </div>
          </>
        )}

        {others.length > 0 && (
          <>
            <div className="eyebrow">その他</div>
            <div className="card">
              {others.map((f) => (
                <FileRow key={f.fileId} file={f} siteId={siteId} />
              ))}
            </div>
          </>
        )}

        <div className="note">
          貼るときに種類は選びません。拡張子から自動で仕分けます。
          <br />
          ファイルごとの一行メモが、後から探すときに一番効きます。
        </div>
      </div>
    </div>
  );
}

function FileRow({
  file,
  siteId,
}: {
  file: { fileId: number; fileName: string | null; memo: string | null };
  siteId: number;
}) {
  const name = file.fileName ?? "";
  return (
    <div className="file">
      <div className={`ext ${extBadgeClass(name)}`}>{extOf(name).toUpperCase() || "?"}</div>
      <div className="fmeta">
        <div className="fname">{name}</div>
        <FileMemoField memo={file.memo} action={updateFileMemo.bind(null, file.fileId, siteId)} />
      </div>
      <a className="btn ghost" href={`/api/files/${file.fileId}`} target="_blank" rel="noreferrer">
        開く
      </a>
    </div>
  );
}
