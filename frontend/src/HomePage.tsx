import React, { useEffect, useState } from "react";
import SearchBar from "./components/SearchBar";
import "./css/HomePage.css";

type UploadedImage = {
  id: number;
  src: string;
  name: string;
  title: string;
  description: string;
  tags: string[];
};

function HomePage() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingImageId, setEditingImageId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    file: null as File | null,
    title: '',
    description: '',
    tags: [] as string[]
  });
  const [currentTag, setCurrentTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const API_BASE = 'http://localhost:8080/api/images';

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      setLoadError(null);

      try {
        const response = await fetch(API_BASE);
        if (!response.ok) {
          throw new Error(`Failed to fetch images: ${response.status}`);
        }

        const data: Array<{ id: number; url: string; title: string; description: string; tags: string[] }> = await response.json();
        setImages(
          data.map((image) => ({
            id: image.id,
            src: image.url,
            name: '',
            title: image.title,
            description: image.description,
            tags: image.tags || [],
          }))
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error loading images:', error);
        setLoadError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  useEffect(() => {
    return () => {
      images.forEach((image) => URL.revokeObjectURL(image.src));
    };
  }, [images]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file && !editingImageId) return; // file required for new uploads

    setIsSubmitting(true);
    try {
      if (editingImageId) {
        const updateResponse = await fetch(`${API_BASE}/${editingImageId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            tags: formData.tags,
          }),
        });

        if (!updateResponse.ok) {
          const errorBody = await updateResponse.text();
          throw new Error(`Failed to update image (${updateResponse.status}): ${errorBody || 'No error details'}`);
        }

        const updatedImage = await updateResponse.json();
        setImages((current) =>
          current.map((img) =>
            img.id === editingImageId
              ? {
                  ...img,
                  title: updatedImage.title ?? formData.title,
                  description: updatedImage.description ?? formData.description,
                  tags: updatedImage.tags ?? formData.tags,
                }
              : img
          )
        );
      } else {
        // Get pre-signed upload URL from backend
        const uploadUrlResponse = await fetch(`${API_BASE}/upload-url`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: formData.file!.name,
            fileType: formData.file!.type,
          }),
        });

        const { uploadUrl, key: s3Key, url } = await uploadUrlResponse.json();

        // Upload file directly to S3 using the pre-signed URL
        console.log('[S3 Upload] uploadUrl:', uploadUrl);
        console.log('[S3 Upload] file type:', formData.file!.type);
        console.log('[S3 Upload] file name:', formData.file!.name);
        const s3UploadResponse = await fetch(uploadUrl, {
          method: 'PUT',
          body: formData.file,
        });
        console.log('[S3 Upload] S3 response status:', s3UploadResponse.status);
        if (!s3UploadResponse.ok) { 
          const errorText = await s3UploadResponse.text();
          console.error('[S3 Upload] Failed to upload file to S3:', errorText);
          throw new Error(`S3 upload failed (${s3UploadResponse.status}): ${errorText || 'No error details'}`);
        }

        // Save image metadata to backend
        const saveResponse = await fetch(`${API_BASE}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url,
            s3Key,
            tags: formData.tags,
            description: formData.description,
            title: formData.title,
          }),
        });

        if (!saveResponse.ok) {
          const errorBody = await saveResponse.text();
          throw new Error(`Failed to save image metadata (${saveResponse.status}): ${errorBody || 'No error details'}`);
        }

        const createdImage = await saveResponse.json();

        const newImage: UploadedImage = {
          id: createdImage.id,
          src: createdImage.url,
          name: formData.file!.name,
          title: createdImage.title ?? formData.title,
          description: createdImage.description ?? formData.description,
          tags: createdImage.tags ?? formData.tags,
        };

        setImages((current) => [...current, newImage]);
      }

      setFormData({ file: null, title: '', description: '', tags: [] });
      setCurrentTag('');
      setIsModalOpen(false);
      setEditingImageId(null);
    } catch (error) {
      console.error('[Upload Error] Full error:', error);
      const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
      alert(`Upload failed: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeImage = async (id: number) => {
    try {
      const deleteResponse = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
      });

      if (!deleteResponse.ok) {
        const errorBody = await deleteResponse.text();
        throw new Error(`Failed to delete image (${deleteResponse.status}): ${errorBody || 'No error details'}`);
      }

      setImages((current) => {
        const target = current.find((item) => item.id === id);
        if (target) URL.revokeObjectURL(target.src);
        return current.filter((item) => item.id !== id);
      });
    } catch (error) {
      console.error('[Delete Error] Full error:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete image');
    }
  };

  const editImage = (id: number) => {
    const image = images.find((img) => img.id === id);
    if (image) {
      setFormData({
        file: null, // file can't be edited
        title: image.title,
        description: image.description,
        tags: image.tags,
      });
      setEditingImageId(id);
      setIsModalOpen(true);
    }
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, currentTag.trim()] });
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) });
  };

  return (
    <div>
      <div className="navBar">
        <div>logo</div>
        <div>{images.length} photos uploaded</div>
      </div>

      <div style={{ textAlign: 'center', margin: '24px' }}>
        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            padding: '12px 24px',
            backgroundColor: '#0099ff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          Upload Image
        </button>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => { setIsModalOpen(false); setEditingImageId(null); setFormData({ file: null, title: '', description: '', tags: [] }); setCurrentTag(''); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingImageId ? 'Edit Image' : 'Upload New Image'}</h2>
            <form onSubmit={handleSubmit}>
              {!editingImageId && (
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                  required
                />
              )}
              <input
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
              <div className="tagInputContainer">
                <input
                  type="text"
                  placeholder="Add a tag"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <button type="button" onClick={addTag} className="addTagBtn">Add Tag</button>
              </div>
              {formData.tags.length > 0 && (
                <div className="tagsDisplay">
                  {formData.tags.map((tag, index) => (
                    <div key={index} className="tagDiv">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="removeTagBtn">×</button>
                    </div>
                  ))}
                </div>
              )}
              <button 
                type="submit" 
                disabled={isSubmitting}
                style={{
                  opacity: isSubmitting ? 0.6 : 1,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                }}
              >
                {isSubmitting ? 'Processing...' : (editingImageId ? 'Update' : 'Submit')}
              </button>
            </form>
          </div>
        </div>
      )}

      <SearchBar />

      {loading && (
        <div className="loadingState" style={{ textAlign: 'center', margin: '16px', color: '#444' }}>
          Loading images...
        </div>
      )}

      {loadError && !loading && (
        <div className="errorState" style={{ textAlign: 'center', margin: '16px', color: '#c53030' }}>
          Unable to load images: {loadError}
        </div>
      )}

      {!loading && !loadError && images.length === 0 && (
        <div className="emptyState" style={{ textAlign: 'center', margin: '16px', color: '#555' }}>
          No uploaded images yet. Use the button above to add one.
        </div>
      )}

      {images.length > 0 && (
        <div className="imageGrid" aria-live="polite">
          {images.map((image) => (
            <div key={image.id} className="imageCard">
              <img src={image.src} alt={image.title} className="imageThumb" />
              <div className="imageActions">
                <button
                  aria-label={`Edit ${image.title}`}
                  className="imageEdit"
                  onClick={() => editImage(image.id)}
                  type="button"
                >
                  ✏️
                </button>
                <button
                  aria-label={`Remove ${image.title}`}
                  className="imageRemove"
                  onClick={() => removeImage(image.id)}
                  type="button"
                >
                  ✕
                </button>
              </div>
              <p className="imageTitle">{image.title}</p>
              <p className="imageDesc">{image.description}</p>
              {image.tags.length > 0 && (
                <div className="imageTags">
                  {image.tags.map((tag, index) => (
                    <span key={index} className="tagDiv">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HomePage;