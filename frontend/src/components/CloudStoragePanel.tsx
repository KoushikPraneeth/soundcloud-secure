import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { cloudStorageApi, type CloudStorageFile } from "@/lib/cloudStorage";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Trash2 } from "lucide-react";

export const CloudStoragePanel = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [files, setFiles] = useState<CloudStorageFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkConnection();
    if (isConnected) {
      loadFiles();
    }
  }, [isConnected]);

  const checkConnection = async () => {
    try {
      const connected = await cloudStorageApi.checkGoogleConnection();
      setIsConnected(connected);
    } catch (error) {
      console.error("Failed to check connection:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFiles = async () => {
    try {
      const files = await cloudStorageApi.listFiles();
      setFiles(files);
    } catch (error) {
      console.error("Failed to load files:", error);
      toast({
        title: "Error",
        description: "Failed to load files",
        variant: "destructive",
      });
    }
  };

  const handleConnect = async () => {
    try {
      const authUrl = await cloudStorageApi.getGoogleAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error("Failed to get auth URL:", error);
      toast({
        title: "Error",
        description: "Failed to connect to Google Drive",
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = async () => {
    try {
      await cloudStorageApi.disconnectGoogle();
      setIsConnected(false);
      setFiles([]);
      toast({
        title: "Success",
        description: "Disconnected from Google Drive",
      });
    } catch (error) {
      console.error("Failed to disconnect:", error);
      toast({
        title: "Error",
        description: "Failed to disconnect from Google Drive",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await cloudStorageApi.uploadFile(file);
      await loadFiles();
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
    } catch (error) {
      console.error("Failed to upload file:", error);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      await cloudStorageApi.deleteFile(fileId);
      await loadFiles();
      toast({
        title: "Success",
        description: "File deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete file:", error);
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Cloud Storage</h2>
          {isConnected ? (
            <Button variant="destructive" onClick={handleDisconnect}>
              Disconnect Google Drive
            </Button>
          ) : (
            <Button onClick={handleConnect}>Connect Google Drive</Button>
          )}
        </div>

        {isConnected && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileUpload}
                accept="audio/*"
              />
              <Button
                onClick={() => document.getElementById("file-upload")?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Music
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 bg-secondary rounded-lg"
                >
                  <div>
                    <h3 className="font-medium">{file.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <a
                        href={cloudStorageApi.getDownloadUrl(file.id)}
                        download={file.name}
                      >
                        Download
                      </a>
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(file.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {files.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No files uploaded yet
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
