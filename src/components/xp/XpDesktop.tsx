"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import BlogListWindow, { type PostItem } from "@/components/BlogListWindow";
import NewPostForm from "@/components/NewPostForm";
import TagsWindow from "@/components/TagsWindow";
import PostsByTagWindow from "@/components/PostsByTagWindow";
import EditPostWindow from "@/components/EditPostWindow";

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

type XpWindow = {
  id: string;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minimized: boolean;
  maximized: boolean;
  z: number;
  content?: React.ReactNode;
  kind: "welcome" | "blog" | "newPost" | "tags" | "editPost" | "postsByTag";
  keyId?: string; // uniqueness key (e.g., post id for edit)
};

type Props = {
  blogPosts?: PostItem[];
};

export default function XpDesktop({ blogPosts }: Props) {
  const [postsState, setPostsState] = useState<PostItem[]>(blogPosts ?? []);
  const [windows, setWindows] = useState<XpWindow[]>(() => {
    const id = uid();
    const welcome: XpWindow = {
      id,
      title: "Welcome to XP-Blog",
      x: 120,
      y: 80,
      w: 520,
      h: 360,
      minimized: false,
      maximized: false,
      z: 1,
      content: <WelcomeContent />,
      kind: "welcome",
    };
    const arr: XpWindow[] = [welcome];
    if (blogPosts && blogPosts.length >= 0) {
      arr.push({
        id: uid(),
        title: "Blog Posts",
        x: 220,
        y: 140,
        w: 640,
        h: 420,
        minimized: false,
        maximized: false,
        z: 2,
        content: (
          <BlogListWindow
            posts={postsState}
            onOpenNewPost={openNewPost}
            onOpenTags={openTags}
            onOpenEdit={openEditPost}
            onRefresh={refreshPosts}
          />
        ),
        kind: "blog",
      });
    }
    return arr;
  });
  const [zTop, setZTop] = useState(3);
  const [startOpen, setStartOpen] = useState(false);

  const [modal, setModal] = useState<string | null>(null);

  function focusWin(id: string) {
    setWindows((prev) => {
      const currentMax = prev.reduce((m, w) => (w.z > m ? w.z : m), 0);
      const nextZ = currentMax + 1;
      const updated = prev.map((w) => (w.id === id ? { ...w, z: nextZ } : w));
      setZTop(nextZ);
      return updated;
    });
  }

  function bringToFrontBy(kind: XpWindow["kind"], keyId?: string) {
    const found = windows.find((w) => w.kind === kind && w.keyId === keyId);
    if (found) focusWin(found.id);
  }

  function ensureOpen(kind: XpWindow["kind"], keyId: string | undefined, create: () => XpWindow) {
    const exists = windows.some((w) => w.kind === kind && w.keyId === keyId);
    if (exists) {
      bringToFrontBy(kind, keyId);
      setModal("このウィンドウは既に開いています。");
      return;
    }
    const win = create();
    const currentMax = windows.reduce((m, w) => (w.z > m ? w.z : m), 0);
    const nextZ = currentMax + 1;
    setWindows((ws) => [...ws, { ...win, z: nextZ }]);
    setZTop(nextZ);
    setStartOpen(false);
  }

  function openNotepad() {
    const id = uid();
    const note: XpWindow = {
      id,
      title: "Notepad",
      x: 200,
      y: 140,
      w: 480,
      h: 300,
      minimized: false,
      maximized: false,
      z: 0,
      content: <Notepad />,
      kind: "welcome",
    };
    const currentMax = windows.reduce((m, w) => (w.z > m ? w.z : m), 0);
    const nextZ = currentMax + 1;
    setWindows((ws) => [...ws, { ...note, z: nextZ }]);
    setZTop(nextZ);
    setStartOpen(false);
  }

  function openMyComputer() {
    const id = uid();
    const comp: XpWindow = {
      id,
      title: "My Computer",
      x: 240,
      y: 120,
      w: 560,
      h: 360,
      minimized: false,
      maximized: false,
      z: 0,
      content: <MyComputer />,
      kind: "welcome",
    };
    const currentMax = windows.reduce((m, w) => (w.z > m ? w.z : m), 0);
    const nextZ = currentMax + 1;
    setWindows((ws) => [...ws, { ...comp, z: nextZ }]);
    setZTop(nextZ);
    setStartOpen(false);
  }

  function openBlog() {
    ensureOpen("blog", undefined, () => ({
      id: uid(),
      title: "Blog Posts",
      x: 200,
      y: 100,
      w: 640,
      h: 420,
      minimized: false,
      maximized: false,
      z: zTop + 1,
      content: (
        <BlogListWindow
          posts={postsState}
          onOpenNewPost={openNewPost}
          onOpenTags={openTags}
          onOpenEdit={openEditPost}
          onRefresh={refreshPosts}
        />
      ),
      kind: "blog",
    }));
  }

  function openNewPost() {
    ensureOpen("newPost", undefined, () => ({
      id: uid(),
      title: "New Post",
      x: 260,
      y: 120,
      w: 640,
      h: 520,
      minimized: false,
      maximized: false,
      z: zTop + 1,
      content: (
        <NewPostForm
          onCreated={() => {
            refreshPosts().then(() => bringToFrontBy("blog"));
          }}
        />
      ),
      kind: "newPost",
    }));
  }

  function openTags() {
    ensureOpen("tags", undefined, () => ({
      id: uid(),
      title: "Tags",
      x: 280,
      y: 140,
      w: 560,
      h: 520,
      minimized: false,
      maximized: false,
      z: zTop + 1,
      content: <TagsWindow onOpenList={(id, name) => openPostsByTag(id)} />,
      kind: "tags",
    }));
  }

  function openEditPost(id: number) {
    ensureOpen("editPost", String(id), () => ({
      id: uid(),
      title: `Edit Post #${id}`,
      x: 220,
      y: 120,
      w: 640,
      h: 520,
      minimized: false,
      maximized: false,
      z: zTop + 1,
      content: <EditPostWindow postId={id} />,
      kind: "editPost",
      keyId: String(id),
    }));
  }

  function openPostsByTag(id: number) {
    ensureOpen("postsByTag", String(id), () => ({
      id: uid(),
      title: `Tag #${id}`,
      x: 240,
      y: 120,
      w: 640,
      h: 520,
      minimized: false,
      maximized: false,
      z: zTop + 1,
      content: <PostsByTagWindow tagId={id} />,
      kind: "postsByTag",
      keyId: String(id),
    }));
  }

  function closeWin(id: string) {
    setWindows((ws) => ws.filter((w) => w.id !== id));
  }

  function toggleMinimize(id: string) {
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, minimized: !w.minimized } : w)));
  }

  function toggleMaximize(id: string) {
    setWindows((ws) =>
      ws.map((w) => (w.id === id ? { ...w, maximized: !w.maximized, minimized: false } : w))
    );
  }

  function onTaskbarButton(id: string) {
    const w = windows.find((w) => w.id === id);
    if (!w) return;
    if (w.minimized) toggleMinimize(id);
    focusWin(id);
  }

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);
  const timeText = useMemo(
    () => now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    [now]
  );

  async function refreshPosts() {
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "取得に失敗しました");
      setPostsState(data.posts as PostItem[]);
    } catch {
      // ignore fetch errors for manual refresh
    }
  }

  useEffect(() => {
    setWindows((prev) =>
      prev.map((w) =>
        w.kind === "blog"
          ? {
              ...w,
              content: (
                <BlogListWindow
                  posts={postsState}
                  onOpenNewPost={openNewPost}
                  onOpenTags={openTags}
                  onOpenEdit={openEditPost}
                  onRefresh={refreshPosts}
                />
              ),
            }
          : w
      )
    );
  }, [postsState]);

  return (
    <div className="w-full min-h-screen" style={{ fontFamily: "Tahoma, Verdana, 'Segoe UI', sans-serif" }}>
      <div
        className="relative w-full min-h-screen overflow-hidden"
        style={{ background: "linear-gradient(180deg, #3aa0ff 0%, #2f7adf 40%, #2b8b57 100%)" }}
        onClick={() => setStartOpen(false)}
      >
        {windows
          .filter((w) => !w.minimized)
          .sort((a, b) => a.z - b.z)
          .map((w) => (
            <XpWindowComp
              key={w.id}
              w={w}
              onFocus={() => focusWin(w.id)}
              onClose={() => closeWin(w.id)}
              onMinimize={() => toggleMinimize(w.id)}
              onMaximize={() => toggleMaximize(w.id)}
              onMove={(x, y) => setWindows((ws) => ws.map((it) => (it.id === w.id ? { ...it, x, y } : it)))}
              onResize={(wpx, hpx) => setWindows((ws) => ws.map((it) => (it.id === w.id ? { ...it, w: wpx, h: hpx } : it)))}
            />
          ))}

        <div
          className="absolute left-0 right-0 bottom-0 h-12 flex items-stretch"
          style={{ background: "linear-gradient(180deg, #3b6ea5 0%, #295a9e 100%)", boxShadow: "0 -1px 0 #7fa7d9 inset, 0 -2px 0 #1f4a86 inset" }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setStartOpen((s) => !s);
            }}
            className="mx-1 my-1 px-3 rounded-sm text-sm font-bold flex items-center gap-2 shadow active:translate-y-px"
            style={{ color: "#fff", background: "linear-gradient(180deg, #5db15d 0%, #2f8a2f 100%)", boxShadow: "0 1px 0 #8dd38d inset, 0 -1px 0 #1d5f1d inset", border: "1px solid #1b5e1b" }}
          >
            <div className="grid grid-cols-2 gap-0.5">
              <span className="w-2 h-2 bg-white block" />
              <span className="w-2 h-2 bg-white block" />
              <span className="w-2 h-2 bg-white block" />
              <span className="w-2 h-2 bg-white block" />
            </div>
            Start
          </button>

          <div className="flex-1 flex items-center gap-1 overflow-x-auto px-1">
            {windows.map((w) => (
              <button
                key={w.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onTaskbarButton(w.id);
                }}
                className={`h-9 min-w-[160px] px-3 text-left text-sm truncate rounded-sm border ${w.minimized ? "opacity-80" : ""}`}
                style={{ color: "#111", background: "linear-gradient(180deg, #f0f6ff 0%, #c7dbff 60%, #a8c3f2 100%)", borderColor: "#5a7bb2", boxShadow: "0 1px 0 #ffffff inset, 0 -1px 0 #92b2e3 inset" }}
                title={w.title}
              >
                {w.title}
              </button>
            ))}
          </div>

          <div className="w-28 flex items-center justify-end pr-3 text-sm select-none" style={{ color: "#111" }}>{timeText}</div>
        </div>

        {startOpen && (
          <StartMenu
            onOpenNotepad={openNotepad}
            onOpenMyComputer={openMyComputer}
            onOpenBlog={openBlog}
            onClose={() => setStartOpen(false)}
          />
        )}

        {modal && (
          <div className="absolute inset-0 flex items-center justify-center" onClick={() => setModal(null)} style={{ zIndex: 10000 }}>
            <div className="absolute inset-0 bg-black/30" style={{ zIndex: 10000 }} />
            <div className="relative w-80 rounded-sm" style={{ zIndex: 10001, border: "1px solid #0a246a", boxShadow: "2px 2px 0 rgba(0,0,0,0.25)" }}>
              <div className="h-8 px-3 flex items-center justify-between" style={{ color: "#fff", background: "linear-gradient(180deg, #3b6ea5 0%, #2b5aa0 100%)", boxShadow: "0 1px 0 #6fa1da inset, 0 -1px 0 #183a7a inset" }}>
                <span className="font-bold text-sm">Windows XP</span>
              </div>
              <div className="p-4" style={{ background: "#ECE9D8", borderTop: "1px solid #fff", boxShadow: "inset 1px 1px 0 #ffffff, inset -1px -1px 0 #b5b1a7" }}>
                <p className="text-sm mb-4" style={{ color: "#111" }}>{modal}</p>
                <div className="text-right">
                 <button onClick={() => setModal(null)} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm">OK</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function XpWindowComp({ w, onFocus, onClose, onMinimize, onMaximize, onMove, onResize }: {
  w: XpWindow;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onMove: (x: number, y: number) => void;
  onResize: (w: number, h: number) => void;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState<{ dx: number; dy: number } | null>(null);
  const [resizing, setResizing] = useState<{ startW: number; startH: number; sx: number; sy: number } | null>(null);

  function handleMouseDown(e: React.MouseEvent) {
    e.stopPropagation();
    onFocus();
  }

  function startDrag(e: React.MouseEvent) {
    e.preventDefault();
    onFocus();
    setDrag({ dx: e.clientX - w.x, dy: e.clientY - w.y });
  }

  function startResize(e: React.MouseEvent) {
    e.preventDefault();
    onFocus();
    setResizing({ startW: w.w, startH: w.h, sx: e.clientX, sy: e.clientY });
  }

  useEffect(() => {
    function onMoveDoc(e: MouseEvent) {
      if (drag) {
        const nx = Math.max(0, e.clientX - drag.dx);
        const ny = Math.max(0, e.clientY - drag.dy);
        onMove(nx, Math.max(0, ny));
      } else if (resizing) {
        const dw = e.clientX - resizing.sx;
        const dh = e.clientY - resizing.sy;
        const nw = Math.max(280, resizing.startW + dw);
        const nh = Math.max(160, resizing.startH + dh);
        onResize(nw, nh);
      }
    }
    function onUpDoc() {
      setDrag(null);
      setResizing(null);
    }
    window.addEventListener("mousemove", onMoveDoc);
    window.addEventListener("mouseup", onUpDoc);
    return () => {
      window.removeEventListener("mousemove", onMoveDoc);
      window.removeEventListener("mouseup", onUpDoc);
    };
  }, [drag, resizing, onMove, onResize]);

  const desktopRect = {
    x: 0,
    y: 0,
    w: typeof window !== "undefined" ? window.innerWidth : 1024,
    h: typeof window !== "undefined" ? window.innerHeight - 48 : 768,
  };

  const styleWin = w.maximized
    ? { left: desktopRect.x, top: desktopRect.y, width: desktopRect.w, height: desktopRect.h }
    : { left: w.x, top: w.y, width: w.w, height: w.h };

  return (
    <div
      ref={rootRef}
      className="absolute select-none"
      style={{ ...styleWin, zIndex: w.z, border: "1px solid #0a246a", boxShadow: "2px 2px 0 rgba(0,0,0,0.25)" }}
      onMouseDown={handleMouseDown}
    >
      <div
        className="h-8 px-2 flex items-center justify-between"
        style={{ color: "#fff", background: "linear-gradient(180deg, #3b6ea5 0%, #2b5aa0 100%)", boxShadow: "0 1px 0 #6fa1da inset, 0 -1px 0 #183a7a inset", cursor: "default" }}
        onMouseDown={startDrag}
      >
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white" style={{ boxShadow: "inset 0 0 0 1px #2b5aa0" }} />
          <span className="font-bold text-sm drop-shadow">{w.title}</span>
        </div>
        <div className="flex items-center gap-1">
          <TitleButton ariaLabel="Minimize" onClick={(e) => { e.stopPropagation(); onMinimize(); }}>─</TitleButton>
          <TitleButton ariaLabel="Maximize" onClick={(e) => { e.stopPropagation(); onMaximize(); }}>▢</TitleButton>
          <TitleButton ariaLabel="Close" danger onClick={(e) => { e.stopPropagation(); onClose(); }}>✕</TitleButton>
        </div>
      </div>

      <div
        className="w-full h-[calc(100%-2rem)] p-3"
        style={{ background: "#ECE9D8", borderTop: "1px solid #fff", boxShadow: "inset 1px 1px 0 #ffffff, inset -1px -1px 0 #b5b1a7" }}
        onMouseDown={handleMouseDown}
      >
        <div className="w-full h-full overflow-auto">{w.content}</div>
      </div>

      {!w.maximized && (
        <div className="absolute right-0 bottom-0 w-4 h-4 cursor-se-resize" onMouseDown={startResize}>
          <div className="w-full h-full" style={{ background: "repeating-linear-gradient(135deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px)" }} />
        </div>
      )}
    </div>
  );
}

function TitleButton({ children, onClick, danger = false, ariaLabel }: { children: React.ReactNode; onClick: (e: React.MouseEvent) => void; danger?: boolean; ariaLabel?: string; }) {
  return (
    <button
      aria-label={ariaLabel}
      onClick={onClick}
      className="w-8 h-6 flex items-center justify-center text-sm rounded-sm"
      style={{
        color: danger ? "#fff" : "#111",
        background: danger
          ? "linear-gradient(180deg, #e35b5b 0%, #c32f2f 100%)"
          : "linear-gradient(180deg, #f7f7f7 0%, #d9d9d9 100%)",
        border: `1px solid ${danger ? "#7d1b1b" : "#6e6e6e"}`,
        boxShadow: danger
          ? "0 1px 0 #f7a1a1 inset, 0 -1px 0 #8d2323 inset"
          : "0 1px 0 #ffffff inset, 0 -1px 0 #b4b4b4 inset",
      }}
    >
      {children}
    </button>
  );
}

function WelcomeContent() {
  return (
    <div className="space-y-4 text-[13px] leading-relaxed">
      <p>Windows XP 風 Blogページです。ウィンドウのドラッグ/リサイズやタスクバー操作ができます。</p>
      <ul className="list-disc pl-5">
        <li>タイトルバーで移動</li>
        <li>右下のグリップでサイズ変更</li>
        <li>タスクバーでフォーカス/復元</li>
      </ul>
      <p className="text-xs opacity-70">本UIはオリジナルの形状とCSSで再現しています。</p>
    </div>
  );
}

function Notepad() {
  const [text, setText] = useState("Hello from Notepad!\n\nType here…");
  return (
    <textarea
      value={text}
      onChange={(e) => setText(e.target.value)}
      className="w-full h-full outline-none resize-none p-2 text-[13px]"
      style={{ fontFamily: "Consolas, 'Courier New', monospace", background: "#FFFFFF", border: "1px solid #b5b1a7", boxShadow: "inset 1px 1px 0 #e6e6e6" }}
    />
  );
}

function MyComputer() {
  const items = [
    { name: "Local Disk (C:)", type: "Drive" },
    { name: "Documents", type: "Folder" },
    { name: "Pictures", type: "Folder" },
    { name: "Control Panel", type: "System" },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-[13px]">
      {items.map((it) => (
        <div key={it.name} className="flex flex-col items-center">
          <div className="w-12 h-12" style={{ background: "linear-gradient(180deg, #fefefe 0%, #d6e6ff 100%)", border: "1px solid #8aa7d6", boxShadow: "0 1px 0 #ffffff inset, 0 -1px 0 #a3c0f2 inset" }} />
          <div className="mt-1 text-center">
            <div className="font-semibold truncate max-w-[9rem]" title={it.name}>{it.name}</div>
            <div className="text-xs opacity-70">{it.type}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function StartMenu({ onOpenNotepad, onOpenMyComputer, onOpenBlog, onClose }: { onOpenNotepad: () => void; onOpenMyComputer: () => void; onOpenBlog: () => void; onClose: () => void; }) {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  return (
    <div className="absolute left-1 bottom-12 w-80 text-[13px]" style={{ zIndex: 9999, border: "1px solid #0a246a", boxShadow: "0 2px 10px rgba(0,0,0,0.35)" }} onClick={(e) => e.stopPropagation()}>
      <div className="flex" style={{ background: "#f0f0f0" }}>
        <div className="w-8" style={{ background: "linear-gradient(180deg, #3b6ea5 0%, #2b5aa0 100%)" }} />
        <div className="flex-1 p-2">
          <MenuButton label="Blog" onClick={onOpenBlog} />
          <MenuButton label="My Computer" onClick={onOpenMyComputer} />
          <MenuButton label="Notepad" onClick={onOpenNotepad} />
          <div className="my-2 border-t border-[#b9c6dd]" />
          <MenuButton label="Run…" onClick={() => alert("Type the name of a program, folder, document, or Internet resource, and Windows will open it for you.")} />
        </div>
      </div>
      <div className="h-8 flex items-center justify-end px-2 text-xs" style={{ background: "#dfe7f6", borderTop: "1px solid #9fb4da" }}>
        <button className="px-2 py-1 border rounded-sm" style={{ borderColor: "#6e8fbe", background: "linear-gradient(180deg,#ffffff,#d9e5ff)" }} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

function MenuButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-2 px-2 py-2 rounded-sm text-left hover:bg-[#cfe0ff]" style={{ border: "1px solid transparent" }}>
      <div className="w-5 h-5 bg-white" style={{ boxShadow: "inset 0 0 0 1px #7fa2d6" }} />
      <span>{label}</span>
    </button>
  );
}
