"use client";
import { useState, useRef } from "react";
import { ListGroup, Button } from "react-bootstrap";
import { Upload, Trash2, CheckCircle2 } from "lucide-react";

export default function DocumentUploadForm({ documents = [], onChange, selectedLegalUnit }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
  const ALLOWED_TYPES = [
    "application/pdf",
    "application/xml",           // Pour fichiers XBRL
    "application/octet-stream",  // Fallback pour formats non reconnus
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const uploadFile = async (file) => {
    if (!selectedLegalUnit) {
      alert("Veuillez d'abord sélectionner une entreprise.");
      return;
    }

    if (documents.length >= 2) {
      alert("Maximum 2 documents autorisés (ex: PDF + XBRL). Veuillez en supprimer un avant d'en ajouter un nouveau.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert("Le fichier dépasse la limite de 50 MB.");
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      alert("Format de fichier non autorisé. Formats acceptés: PDF ou XBRL uniquement");
      return;
    }

    const fileId = `${Date.now()}-${file.name}`;
    const newDocument = {
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type,
      file: file, // Stocker le File object pour upload ultérieur
    };

    onChange([...documents, newDocument]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    for (let i = 0; i < files.length; i++) {
      uploadFile(files[i]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    for (let i = 0; i < files.length; i++) {
      uploadFile(files[i]);
    }
  };

  const handleRemoveDocument = (docId) => {
    onChange(documents.filter((doc) => doc.id !== docId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR");
  };

  return (
    <div className="document-upload-form">
      <div
        className={`dropzone ${isDragActive ? "active" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="dropzone-content">
          <Upload size={40} className="dropzone-icon" />
          <h5>Déposer votre rapport RSE/ESG ici</h5>
          <p className="text-muted">ou cliquez pour sélectionner</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            style={{ display: "none" }}
            accept=".pdf,.xbrl,.xml"
          />
          <Button
            variant="light"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="mt-2"
          >
            Parcourir
          </Button>
        </div>
      </div>

      <div className="mt-3">
        <small className="text-muted d-block mb-2">
          Formats acceptés: PDF ou XBRL • Max 50 MB par fichier
        </small>
      </div>


      {/* Documents uploadés */}
      {documents.length > 0 && (
        <div className="uploaded-documents-section mt-4">
          <h6 className="mb-3">Rapport{documents.length > 1 ? "s" : ""} ({documents.length})</h6>
          <ListGroup variant="flush">
            {documents.map((doc) => (
              <ListGroup.Item key={doc.id} className="d-flex align-items-center justify-content-between py-2 border-bottom">
                <div className="d-flex align-items-center gap-2 flex-grow-1 min-width-0">
                  <CheckCircle2 size={16} className="text-success flex-shrink-0" />
                  <div className="min-width-0 flex-grow-1">
                    <div style={{ fontSize: "0.9rem", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {doc.name}
                    </div>
                    <small className="text-muted d-block">
                      {doc.uploadedAt ? `Uploadé le ${formatDate(doc.uploadedAt)}` : "Prêt à être uploadé"}
                    </small>
                  </div>
                </div>
                <Button
                  variant="link"
                  size="sm"
                  className="text-danger p-0"
                  onClick={() => handleRemoveDocument(doc.id)}
                  title="Supprimer"
                >
                  <Trash2 size={16} />
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>
      )}

      <style jsx>{`
        .dropzone {
          border: 2px dashed #dee2e6;
          border-radius: 8px;
          padding: 40px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: #f7f8fc;
        }

        .dropzone:hover {
          border-color: #6c7fdd;
          background: #f0f2ff;
        }

        .dropzone.active {
          border-color: #1e3a8a;
          background: #e8f0ff;
          box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
        }

        .dropzone-content {
          user-select: none;
        }

        .dropzone-icon {
          color: #6c7fdd;
          margin-bottom: 12px;
        }

        .dropzone h5 {
          margin: 12px 0 4px;
          color: #1e3a8a;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .min-width-0 {
          min-width: 0;
        }
      `}</style>
    </div>
  );
}

// Fonction utilitaire pour uploader les documents lors de la soumission
export async function uploadDocumentsToOVH(documents, siren) {
  if (!documents || documents.length === 0) {
    return [];
  }

  const uploadedDocs = [];

  for (const doc of documents) {
    // Si le document a déjà une URL, c'est qu'il a été uploadé
    if (doc.url) {
      uploadedDocs.push(doc);
      continue;
    }

    // Sinon, uploader le fichier
    if (!doc.file) {
      console.warn(`Document ${doc.name} n'a pas de fichier`);
      continue;
    }

    try {
      const formData = new FormData();
      formData.append("file", doc.file);
      formData.append("siren", siren);

      const response = await fetch("/api/publications/upload-document", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'upload");
      }

      const data = await response.json();

      uploadedDocs.push({
        id: doc.id,
        name: doc.name,
        size: doc.size,
        type: doc.type,
        url: data.url,
        uploadedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`Erreur upload ${doc.name}:`, error);
      throw new Error(`Impossible d'uploader ${doc.name}: ${error.message}`);
    }
  }

  return uploadedDocs;
}
