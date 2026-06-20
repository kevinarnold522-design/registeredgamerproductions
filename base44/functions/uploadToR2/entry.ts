import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

function decodeDataUrl(dataUrl) {
  const text = String(dataUrl || '');
  const base64 = text.includes(',') ? text.split(',')[1] : text;
  if (!base64) throw new Error('Missing file data');
  const binary = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
  if (binary.byteLength > MAX_UPLOAD_BYTES) throw new Error('File upload limit is 25MB');
  return binary;
}

function safeFileName(fileName) {
  const clean = String(fileName || 'upload').replace(/[^a-zA-Z0-9._-]/g, '-');
  return clean || `upload-${Date.now()}`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { fileName, contentType, dataUrl } = body;

    if (!fileName || !dataUrl) {
      return Response.json({ error: 'Missing file data' }, { status: 400 });
    }

    const binary = decodeDataUrl(dataUrl);
    const file = new File([binary], safeFileName(fileName), {
      type: contentType || 'application/octet-stream',
      lastModified: Date.now(),
    });

    const result = await base44.asServiceRole.integrations.Core.UploadFile({ file });
    const fileUrl = result?.file_url || result?.url;
    if (!fileUrl) {
      console.error('Base44 upload returned no file URL', result);
      return Response.json({ error: 'Upload returned no URL' }, { status: 502 });
    }

    return Response.json({ file_url: fileUrl, source: 'base44-function' });
  } catch (error) {
    console.error('uploadToR2 platform upload error', error?.message || error);
    return Response.json({ error: error?.message || 'Upload failed' }, { status: 500 });
  }
});