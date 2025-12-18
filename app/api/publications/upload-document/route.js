import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

/**
 * API pour uploader des rapports liés à une publication
 * Stocke les fichiers dans OVH S3 à: /sinese/publications/rapports/[siren]/[filename]
 */
export async function POST(request) {
  // Vérifier l'authentification
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Non autorisé. Veuillez vous connecter." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const siren = formData.get("siren");

    if (!file || !siren) {
      return NextResponse.json(
        { error: "Fichier et SIREN sont requis" },
        { status: 400 }
      );
    }

    // Vérifier les variables d'environnement
    if (!process.env.OS_USERNAME || !process.env.OS_PASSWORD) {
      console.error("❌ Credentials OVH manquants");
      return NextResponse.json(
        { error: "Configuration OVH manquante" },
        { status: 500 }
      );
    }

    // Initialiser le client S3 OVH
    const s3Client = new S3Client({
      region: process.env.OS_REGION_NAME || "gra",
      endpoint: process.env.OS_AUTH_URL || "https://s3.gra.cloud.ovh.net",
      credentials: {
        accessKeyId: process.env.OS_USERNAME,
        secretAccessKey: process.env.OS_PASSWORD,
      },
    });

    // Convertir le fichier en buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Générer une clé unique: sinese/publications/rapports/[siren]/[timestamp]-[filename]
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `sinese/publications/rapports/${siren}/${timestamp}-${sanitizedFileName}`;

    // Uploader vers OVH S3
    const command = new PutObjectCommand({
      Bucket: process.env.OVH_BUCKET_NAME || "sinese-storage",
      Key: key,
      Body: buffer,
      ContentType: file.type,
      ACL: "public-read", // Rendre le fichier accessible publiquement
      Metadata: {
        "original-filename": file.name,
        "siren": siren,
        "upload-date": new Date().toISOString(),
      },
    });

    await s3Client.send(command);

    // Générer l'URL publique du fichier
    const baseUrl = (process.env.OVH_PUBLIC_URL || `https://${process.env.OVH_BUCKET_NAME}.s3.${process.env.OS_REGION_NAME}.cloud.ovh.net`).replace(/\/$/, '');
    const publicUrl = `${baseUrl}/${key}`;

    console.log(`✅ Document uploadé: ${key}`);

    return NextResponse.json(
      {
        success: true,
        message: "Document uploadé avec succès",
        url: publicUrl,
        key: key,
        fileName: file.name,
        size: file.size,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Erreur upload document:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erreur lors de l'upload du document",
      },
      { status: 500 }
    );
  }
}
