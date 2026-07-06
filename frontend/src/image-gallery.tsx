import React, { useState, useRef, useCallback } from "react";

const SAMPLE_TAGS = {
  nature: ["landscape", "outdoor", "sky", "trees", "mountains", "sunset", "ocean", "forest"],
  people: ["portrait", "person", "group", "candid", "smile", "lifestyle"],
  urban: ["city", "architecture", "street", "building", "night", "lights"],
  food: ["food", "restaurant", "cooking", "meal", "cuisine", "drink"],
};

function TagBadge({ tag, onRemove }: TagBadgeProps) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: "#1e2a1e", border: "0.5px solid #3a5c3a",
      color: "#7ecb7e", fontSize: 11, padding: "3px 8px",
      borderRadius: 20, whiteSpace: "nowrap",
    }}>
      {tag}
      {onRemove && (
        <button onClick={() => onRemove(tag)} style={{
          background: "none", border: "none", cursor: "pointer",
          color: "#4a8c4a", padding: 0, fontSize: 12, lineHeight: 1,
          display: "flex", alignItems: "center",
        }}>×</button>
      )}
    </span>
  );
}

type ImageType = {
  id: number;
  name: string;
  url: string;
  tags: string[];
  loading?: boolean;
  file?: File;
  relevanceScore?: number;
};

type TagBadgeProps = { tag: string; onRemove?: (tag: string) => void };

type ImageCardProps = { image: ImageType; onRemoveTag: (id: number, tag: string) => void; onAddTag: (id: number, tag: string) => void };

type UploadZoneProps = { onFiles: (files: File[]) => void };

function ImageCard({ image, onRemoveTag, onAddTag }: ImageCardProps) {
  const [addingTag, setAddingTag] = useState<boolean>(false);
  const [newTag, setNewTag] = useState<string>("");
  const [expanded, setExpanded] = useState<boolean>(false);

  const handleAddTag = () => {
    if (newTag.trim()) {
      onAddTag(image.id, newTag.trim().toLowerCase());
      setNewTag("");
      setAddingTag(false);
    }
  };

  return (
    <div style={{
      background: "#0f1a0f", border: "0.5px solid #2a3d2a",
      borderRadius: 12, overflow: "hidden",
      display: "flex", flexDirection: "column",
      transition: "border-color 0.2s",
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "#4a7c4a"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "#2a3d2a"}
    >
      <div style={{ position: "relative", paddingBottom: "66%", background: "#0a120a" }}>
        <img src={image.url} alt={image.name} style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          objectFit: "cover",
        }} />
        {image.loading && (
          <div style={{
            position: "absolute", inset: 0, display: "flex",
            flexDirection: "column", alignItems: "center", justifyContent: "center",
            background: "rgba(10,18,10,0.85)", gap: 10,
          }}>
            <div style={{
              width: 28, height: 28, border: "2px solid #2a3d2a",
              borderTop: "2px solid #7ecb7e", borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }} />
            <span style={{ color: "#4a8c4a", fontSize: 12 }}>Generating tags...</span>
          </div>
        )}
        {image.relevanceScore !== undefined && (
          <div style={{
            position: "absolute", top: 8, right: 8,
            background: "rgba(10,18,10,0.9)", border: "0.5px solid #3a5c3a",
            borderRadius: 20, padding: "3px 10px",
            color: "#7ecb7e", fontSize: 11, fontWeight: 500,
          }}>
            {Math.round(image.relevanceScore * 100)}% match
          </div>
        )}
      </div>

      <div style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "#c8e6c8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {image.name}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {(expanded ? image.tags : image.tags.slice(0, 6)).map(tag => (
            <TagBadge key={tag} tag={tag} onRemove={(t) => onRemoveTag(image.id, t)} />
          ))}
          {!expanded && image.tags.length > 6 && (
            <button onClick={() => setExpanded(true)} style={{
              background: "none", border: "0.5px solid #2a3d2a", cursor: "pointer",
              color: "#4a8c4a", fontSize: 11, padding: "3px 8px", borderRadius: 20,
            }}>+{image.tags.length - 6} more</button>
          )}
          {expanded && (
            <button onClick={() => setExpanded(false)} style={{
              background: "none", border: "0.5px solid #2a3d2a", cursor: "pointer",
              color: "#4a8c4a", fontSize: 11, padding: "3px 8px", borderRadius: 20,
            }}>less</button>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {addingTag ? (
            <>
              <input
                autoFocus value={newTag} onChange={e => setNewTag(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleAddTag(); if (e.key === "Escape") setAddingTag(false); }}
                placeholder="tag name..." style={{
                  flex: 1, background: "#0a120a", border: "0.5px solid #3a5c3a",
                  borderRadius: 6, padding: "4px 8px", color: "#c8e6c8", fontSize: 12,
                  outline: "none",
                }}
              />
              <button onClick={handleAddTag} style={{
                background: "#1e2a1e", border: "0.5px solid #3a5c3a",
                color: "#7ecb7e", fontSize: 12, padding: "4px 10px",
                borderRadius: 6, cursor: "pointer",
              }}>Add</button>
              <button onClick={() => setAddingTag(false)} style={{
                background: "none", border: "none", color: "#4a8c4a",
                fontSize: 12, padding: "4px 6px", cursor: "pointer",
              }}>Cancel</button>
            </>
          ) : (
            <button onClick={() => setAddingTag(true)} style={{
              background: "none", border: "0.5px dashed #2a3d2a",
              color: "#4a8c4a", fontSize: 11, padding: "3px 10px",
              borderRadius: 20, cursor: "pointer", width: "100%",
              transition: "border-color 0.15s, color 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#4a7c4a"; e.currentTarget.style.color = "#7ecb7e"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#2a3d2a"; e.currentTarget.style.color = "#4a8c4a"; }}
            >+ add tag</button>
          )}
        </div>
      </div>
    </div>
  );
}

function UploadZone({ onFiles }: UploadZoneProps) {
  const [dragging, setDragging] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f): f is File => f.type.startsWith("image/"));
    if (files.length) onFiles(files);
  }, [onFiles]);

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      style={{
        border: `1.5px dashed ${dragging ? "#7ecb7e" : "#2a3d2a"}`,
        borderRadius: 14, padding: "40px 20px", textAlign: "center",
        cursor: "pointer", background: dragging ? "#0f1a0f" : "transparent",
        transition: "all 0.2s",
      }}
    >
      <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.5 }}>⬆</div>
      <p style={{ margin: 0, color: "#7ecb7e", fontSize: 15, fontWeight: 500 }}>
        Drop images here
      </p>
      <p style={{ margin: "6px 0 0", color: "#4a6c4a", fontSize: 13 }}>
        or click to browse — JPG, PNG, WebP, GIF
      </p>
      <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: "none" }}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => { const files = e.target.files ? Array.from(e.target.files) : []; if (files.length) onFiles(files); if (e.target) e.target.value = ""; }}
      />
    </div>
  );
}

export default function App() {
  const [images, setImages] = useState<ImageType[]>([]);
  const [query, setQuery] = useState<string>("");
  const [searching, setSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<number[] | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const nextId = useRef<number>(1);

  // ─── Stub: replace with real Claude Vision API call ──────────────────────────
  async function generateTags(_imageBase64: string, _mimeType: string): Promise<string[]> {
    // TODO: POST to your backend endpoint, e.g.:
    // const res = await fetch("/api/tag-image", {
    //   method: "POST",
    //   body: JSON.stringify({ image: imageBase64, mimeType }),
    // });
    // const { tags } = await res.json();
    // return tags;

    // Simulated response for frontend demo:
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
    const allTags = Object.values(SAMPLE_TAGS).flat();
    const shuffled = allTags.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5 + Math.floor(Math.random() * 5));
  }

  // ─── Stub: replace with real semantic search API call ───────────────────────
  async function semanticSearch(query: string, imgs: ImageType[]): Promise<{ id: number; score: number }[]> {
    // TODO: POST to your backend endpoint, e.g.:
    // const res = await fetch("/api/search", {
    //   method: "POST",
    //   body: JSON.stringify({ query, images: images.map(i => ({ id: i.id, tags: i.tags })) }),
    // });
    // const { results } = await res.json();  // [{ id, score }]
    // return results;

    // Simulated semantic search for frontend demo:
    await new Promise(r => setTimeout(r, 800));
    const q = query.toLowerCase();
    return imgs.map((img: ImageType) => {
      const score = img.tags.reduce((acc: number, tag: string) => {
        if (tag.includes(q) || q.includes(tag)) return acc + 0.9;
        return acc + (Math.random() > 0.7 ? 0.2 : 0);
      }, 0) / Math.max(img.tags.length, 1);
      return { id: img.id, score: Math.min(score, 1) };
    }).sort((a, b) => b.score - a.score);
  }

  const handleFiles = async (files: File[]) => {
    const newImages: ImageType[] = files.map(file => ({
      id: nextId.current++,
      name: file.name,
      url: URL.createObjectURL(file),
      tags: [],
      loading: true,
      file,
    }));
    setImages(prev => [...newImages, ...prev]);

    for (const img of newImages) {
      const reader = new FileReader();
      reader.onload = async (e: ProgressEvent<FileReader>) => {
        const result = e.target?.result;
        if (typeof result === "string") {
          const base64 = result.split(",")[1] || "";
          const tags = await generateTags(base64, img.file?.type ?? "");
          setImages(prev => prev.map(i => i.id === img.id ? { ...i, tags, loading: false } : i));
        }
      };
      if (img.file) reader.readAsDataURL(img.file);
    }
  };

  const handleSearch = async () => {
    if (!query.trim() || images.length === 0) return;
    setSearching(true);
    setSearchResults(null);
    const results = await semanticSearch(query.trim(), images.filter(i => !i.loading) as ImageType[]);
    const resultMap = Object.fromEntries(results.map(r => [r.id, r.score]));
    setImages(prev => prev.map(i => ({ ...i, relevanceScore: resultMap[i.id] })));
    setSearchResults(results.filter(r => r.score > 0.15).map(r => r.id));
    setSearching(false);
  };

  const clearSearch = () => {
    setQuery("");
    setSearchResults(null);
    setImages(prev => prev.map(i => { const { relevanceScore, ...rest } = i; return rest; }));
  };

  const removeTag = (imageId: number, tag: string) => {
    setImages(prev => prev.map(i => i.id === imageId ? { ...i, tags: i.tags.filter(t => t !== tag) } : i));
  };

  const addTag = (imageId: number, tag: string) => {
    setImages(prev => prev.map(i => i.id === imageId && !i.tags.includes(tag) ? { ...i, tags: [...i.tags, tag] } : i));
  };

  const allTags = [...new Set(images.flatMap(i => i.tags))].sort();

  let displayedImages = images;
  if (searchResults) {
    const resultSet = new Set(searchResults);
    displayedImages = images.filter(i => resultSet.has(i.id))
      .sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0));
  } else if (activeFilter !== "all") {
    displayedImages = images.filter(i => i.tags.includes(activeFilter));
  }

  return (
    <div style={{ minHeight: "100vh", background: "#060d06", color: "#c8e6c8", fontFamily: "'DM Mono', 'Fira Mono', monospace" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #060d06; } ::-webkit-scrollbar-thumb { background: #2a3d2a; border-radius: 3px; }
        input::placeholder { color: #2a4a2a; }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: "0.5px solid #1a2a1a", padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#7ecb7e", boxShadow: "0 0 8px #7ecb7e44" }} />
          <span style={{ fontSize: 16, fontWeight: 500, letterSpacing: "0.05em", color: "#a0d4a0" }}>FOLIO</span>
          <span style={{ fontSize: 11, color: "#2a4a2a", letterSpacing: "0.1em" }}>AI IMAGE GALLERY</span>
        </div>
        <span style={{ fontSize: 12, color: "#2a4a2a" }}>
          {images.length} image{images.length !== 1 ? "s" : ""}
          {searchResults && ` · ${searchResults.length} results`}
        </span>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

        {/* Upload Zone */}
        <UploadZone onFiles={handleFiles} />

        {/* Search Bar */}
        <div style={{ margin: "28px 0 20px", display: "flex", gap: 10 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#2a4a2a", fontSize: 15, pointerEvents: "none" }}>⌕</span>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSearch(); if (e.key === "Escape") clearSearch(); }}
              placeholder="Search images semantically — try 'warm sunset' or 'people outdoors'..."
              style={{
                width: "100%", background: "#0a120a", border: "0.5px solid #2a3d2a",
                borderRadius: 10, padding: "12px 14px 12px 38px", color: "#c8e6c8",
                fontSize: 14, outline: "none",
              }}
              onFocus={e => e.target.style.borderColor = "#4a7c4a"}
              onBlur={e => e.target.style.borderColor = "#2a3d2a"}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={searching || !query.trim() || images.length === 0}
            style={{
              background: searching ? "#0f1a0f" : "#1a2e1a", border: "0.5px solid #3a5c3a",
              color: searching ? "#4a6c4a" : "#7ecb7e", padding: "12px 22px",
              borderRadius: 10, cursor: searching ? "not-allowed" : "pointer",
              fontSize: 13, fontFamily: "inherit", whiteSpace: "nowrap",
              transition: "all 0.15s",
            }}
          >
            {searching ? "Searching..." : "AI Search"}
          </button>
          {searchResults && (
            <button onClick={clearSearch} style={{
              background: "none", border: "0.5px solid #2a3d2a", color: "#4a8c4a",
              padding: "12px 16px", borderRadius: 10, cursor: "pointer",
              fontSize: 13, fontFamily: "inherit",
            }}>Clear</button>
          )}
        </div>

        {/* Tag Filter Bar */}
        {allTags.length > 0 && !searchResults && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 24 }}>
            <button
              onClick={() => setActiveFilter("all")}
              style={{
                background: activeFilter === "all" ? "#1e2a1e" : "none",
                border: `0.5px solid ${activeFilter === "all" ? "#3a5c3a" : "#1a2a1a"}`,
                color: activeFilter === "all" ? "#7ecb7e" : "#4a6c4a",
                fontSize: 11, padding: "4px 12px", borderRadius: 20, cursor: "pointer",
                fontFamily: "inherit",
              }}
            >all</button>
            {allTags.map(tag => (
              <button key={tag} onClick={() => setActiveFilter(activeFilter === tag ? "all" : tag)} style={{
                background: activeFilter === tag ? "#1e2a1e" : "none",
                border: `0.5px solid ${activeFilter === tag ? "#3a5c3a" : "#1a2a1a"}`,
                color: activeFilter === tag ? "#7ecb7e" : "#4a6c4a",
                fontSize: 11, padding: "4px 12px", borderRadius: 20, cursor: "pointer",
                fontFamily: "inherit", transition: "all 0.15s",
              }}>
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Status Messages */}
        {images.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#2a4a2a" }}>
            <p style={{ fontSize: 15, margin: 0 }}>Upload images to get started</p>
            <p style={{ fontSize: 12, margin: "8px 0 0" }}>AI will auto-generate searchable tags for each one</p>
          </div>
        )}

        {searchResults && searchResults.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#4a6c4a" }}>
            <p style={{ fontSize: 14, margin: 0 }}>No matching images found for "{query}"</p>
            <button onClick={clearSearch} style={{ marginTop: 12, background: "none", border: "none", color: "#7ecb7e", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>Clear search</button>
          </div>
        )}

        {/* Image Grid */}
        {displayedImages.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 16,
          }}>
            {displayedImages.map(img => (
              <ImageCard key={img.id} image={img} onRemoveTag={removeTag} onAddTag={addTag} />
            ))}
          </div>
        )}

        {/* Backend Integration Note */}
        <div style={{
          marginTop: 48, padding: "16px 20px",
          background: "#0a120a", border: "0.5px solid #1a2a1a",
          borderRadius: 10, borderLeft: "2px solid #3a5c3a",
        }}>
          <p style={{ margin: 0, fontSize: 12, color: "#4a6c4a", lineHeight: 1.7 }}>
            <span style={{ color: "#7ecb7e" }}>Backend hooks ready.</span>{" "}
            Replace <code style={{ color: "#a0d4a0", background: "#0f1a0f", padding: "1px 5px", borderRadius: 4 }}>generateTags()</code> and{" "}
            <code style={{ color: "#a0d4a0", background: "#0f1a0f", padding: "1px 5px", borderRadius: 4 }}>semanticSearch()</code> in the source with your API calls.
            Both functions are clearly marked with <code style={{ color: "#a0d4a0", background: "#0f1a0f", padding: "1px 5px", borderRadius: 4 }}>// TODO</code> comments.
          </p>
        </div>
      </div>
    </div>
  );
}
