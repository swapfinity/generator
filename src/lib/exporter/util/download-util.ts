import { zipSync } from "fflate";

export const downloadAsFile = (content: BlobPart[], fileName: string, contentType: string) => {
    const blob = new Blob(content, { type: contentType });
    const url = URL.createObjectURL(blob);

    // create temporary element & trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.style.display = 'none';

    document.body.appendChild(a);
    a.click();

    // clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export const downloadBinaryAsFile = (data: Uint8Array, fileName: string, mimeType: string) => {
    downloadAsFile([data.buffer as ArrayBuffer], fileName, mimeType);
};

export const downloadAsZip = async (files: Record<string, Uint8Array>, fileName: string): Promise<void> => {
    const zipFile = zipSync(files);;
    downloadBinaryAsFile(zipFile, fileName, 'application/zip');
};