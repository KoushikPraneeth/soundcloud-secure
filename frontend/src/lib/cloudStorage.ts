import { api } from "./axiosConfig";

export interface CloudStorageFile {
    id: string;
    name: string;
    mimeType: string;
    size: number;
    webViewLink: string;
    downloadUrl: string;
    provider: "GOOGLE_DRIVE";
}

export const cloudStorageApi = {
    // Initialize Google Drive connection
    getGoogleAuthUrl: async (): Promise<string> => {
        const response = await api.get<string>("/oauth2/google/authorize");
        return response.data;
    },

    // Check if Google Drive is connected
    checkGoogleConnection: async (): Promise<boolean> => {
        const response = await api.get<boolean>("/oauth2/google/status");
        return response.data;
    },

    // Disconnect Google Drive
    disconnectGoogle: async () => {
        await api.get("/oauth2/google/revoke");
    },

    // List files from cloud storage
    listFiles: async (): Promise<CloudStorageFile[]> => {
        const response = await api.get<CloudStorageFile[]>("/storage/files");
        return response.data;
    },

    // Upload a file
    uploadFile: async (file: File): Promise<CloudStorageFile> => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await api.post<CloudStorageFile>("/storage/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },

    // Delete a file
    deleteFile: async (fileId: string): Promise<void> => {
        await api.delete(`/storage/files/${fileId}`);
    },

    // Get download URL for a file
    getDownloadUrl: (fileId: string): string => {
        return `/storage/download/${fileId}`;
    }
};
