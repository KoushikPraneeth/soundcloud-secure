import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
    onUpload: (file: File) => Promise<void>;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onUpload }) => {
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        if (!file.type.startsWith('audio/')) {
            toast({
                title: 'Invalid file type',
                description: 'Please upload an audio file.',
                variant: 'destructive',
            });
            return;
        }

        try {
            setIsUploading(true);
            setUploadProgress(0);

            // Simulate upload progress
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return prev;
                    }
                    return prev + 10;
                });
            }, 500);

            await onUpload(file);

            clearInterval(progressInterval);
            setUploadProgress(100);

            toast({
                title: 'Upload complete',
                description: `${file.name} has been uploaded successfully.`,
            });
        } catch (error) {
            toast({
                title: 'Upload failed',
                description: 'An error occurred while uploading the file.',
                variant: 'destructive',
            });
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    }, [onUpload, toast]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'audio/*': ['.mp3', '.wav', '.flac', '.m4a', '.aac'],
        },
        multiple: false,
        disabled: isUploading,
    });

    return (
        <div className="w-full max-w-md mx-auto">
            <div
                {...getRootProps()}
                className={`
                    border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                    transition-colors
                    ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
                    ${isUploading ? 'pointer-events-none opacity-50' : 'hover:border-primary hover:bg-primary/5'}
                `}
            >
                <input {...getInputProps()} />
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                {isDragActive ? (
                    <p className="text-primary">Drop the audio file here</p>
                ) : (
                    <div className="space-y-2">
                        <p className="text-muted-foreground">
                            Drag and drop an audio file here, or click to select
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Supported formats: MP3, WAV, FLAC, M4A, AAC
                        </p>
                    </div>
                )}
            </div>

            {isUploading && (
                <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Uploading...</span>
                        <span className="text-muted-foreground">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                </div>
            )}
        </div>
    );
}; 