import React, { useEffect, useRef, useState } from "react";
import SearchBar from "./components/SearchBar";
import "./css/HomePage.css";

type UploadedImage = {
  id: number;
  src: string;
  name: string;
};

function HomePage() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      images.forEach((image) => URL.revokeObjectURL(image.src));
    };
  }, [images]);

  const updateImages = (files: FileList | null) => {
    if (!files) return;

    const accepted = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .map((file, idx) => ({
        id: Date.now() + idx,
        src: URL.createObjectURL(file),
        name: file.name,
      }));

    if (accepted.length) {
      setImages((current) => [...current, ...accepted]);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    updateImages(event.dataTransfer.files);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateImages(event.target.files);
    event.target.value = ""; // reset to allow re-selecting same file
  };

  const removeImage = (id: number) => {
    setImages((current) => {
      const target = current.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.src);
      return current.filter((item) => item.id !== id);
    });
  };

  return (
    <div>
      <div className="navBar">
        <div>logo</div>
        <div>{images.length} photos uploaded</div>
      </div>

      <div
        className={`uploadContainer ${dragActive ? "active" : ""}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          className="hiddenFileInput"
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          multiple
          onChange={handleFileChange}
        />
        <div>
          logo
          <h1>Drop images here</h1>
          <p>or click to browse - JPG, PNG, GIF, WEBP</p>
        </div>
      </div>

      <SearchBar />

      {images.length > 0 && (
        <div className="imageGrid" aria-live="polite">
          {images.map((image) => (
            <div key={image.id} className="imageCard">
              <img src={image.src} alt={image.name} className="imageThumb" />
              <button
                aria-label={`Remove ${image.name}`}
                className="imageRemove"
                onClick={() => removeImage(image.id)}
                type="button"
              >
                ✕
              </button>
              <p className="imageName">{image.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HomePage;