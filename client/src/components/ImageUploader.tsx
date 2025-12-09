import { useState, useRef, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Upload } from 'lucide-react';

interface ImageUploaderProps {
  value?: string;
  onChange?: (url: string) => void;
  preview?: boolean;
  accept?: string;
  maxSize?: number;
  className?: string;
}

export default function ImageUploader({ 
  value = '', 
  onChange, 
  preview = true, 
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB
  className = ''
}: ImageUploaderProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Upload mutation using Object Storage for permanent storage
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      // Step 1: Get presigned upload URL from server
      const urlResponse = await fetch('/api/objects/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!urlResponse.ok) {
        throw new Error('Failed to get upload URL');
      }
      
      const { uploadURL } = await urlResponse.json();
      
      // Step 2: Upload file directly to Object Storage
      return new Promise<{ url: string; originalName: string }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(progress);
          }
        });
        
        xhr.addEventListener('load', () => {
          if (xhr.status === 200 || xhr.status === 201) {
            // Extract object path from upload URL
            const url = new URL(uploadURL);
            const pathParts = url.pathname.split('/');
            const objectId = pathParts[pathParts.length - 1];
            resolve({
              url: `/objects/uploads/${objectId}`,
              originalName: file.name
            });
          } else {
            reject(new Error('Upload failed'));
          }
        });
        
        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });
        
        xhr.open('PUT', uploadURL);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });
    },
    onSuccess: (data) => {
      toast({
        title: "تم رفع الصورة بنجاح",
        description: `تم رفع ${data.originalName}`,
      });
      
      if (onChange) {
        onChange(data.url);
      }
      
      setUploadProgress(0);
      setPreviewUrl(null);
    },
    onError: (error: any) => {
      toast({
        title: "فشل في رفع الصورة",
        description: error.message || "حدث خطأ أثناء رفع الصورة",
        variant: "destructive",
      });
      setUploadProgress(0);
      setPreviewUrl(null);
    }
  });


  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "نوع ملف غير صحيح",
        description: "يرجى اختيار ملف صورة",
        variant: "destructive",
      });
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      toast({
        title: "حجم الملف كبير جداً",
        description: `الحد الأقصى لحجم الملف هو ${(maxSize / 1024 / 1024).toFixed(1)} ميجابايت`,
        variant: "destructive",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    uploadMutation.mutate(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };



  return (
    <div className={`space-y-4 ${className}`}>
      {/* URL Input Field */}
      <div>
        <Label htmlFor="image-url">رابط الصورة</Label>
        <Input
          id="image-url"
          value={value}
          onChange={(e) => {
            console.log("ImageUploader onChange called with:", e.target.value);
            onChange?.(e.target.value);
          }}
          placeholder="أدخل رابط الصورة"
          data-testid="image-url-input"
          className="mt-1"
        />
      </div>

      {/* Upload Area */}
      <Card className={`border-2 border-dashed transition-colors ${
        isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
      }`}>
        <CardContent className="p-6">
          <div
            className="text-center space-y-4"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {uploadMutation.isPending ? (
              <div className="space-y-4">
                <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">جاري رفع الصورة...</p>
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-xs text-muted-foreground">{uploadProgress}%</p>
                </div>
              </div>
            ) : previewUrl ? (
              <div className="space-y-4">
                <div className="w-32 h-32 mx-auto rounded-lg overflow-hidden border">
                  <img
                    src={previewUrl}
                    alt="معاينة"
                    className="w-full h-full object-cover"
                    data-testid="upload-preview"
                  />
                </div>
                <p className="text-sm text-muted-foreground">جاري الرفع...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    اسحب وأفلت الصور هنا أو انقر للاختيار
                  </p>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG, WEBP أو GIF (حد أقصى {(maxSize / 1024 / 1024).toFixed(1)} ميجابايت)
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="upload-button"
                >
                  <Upload className="w-4 h-4 ml-2" />
                  اختيار صورة
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {preview && value && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">معاينة الصورة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full max-w-xs mx-auto">
              <img
                src={value}
                alt="معاينة الصورة المحددة"
                className="w-full h-auto rounded-lg border"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
                data-testid="image-preview"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
        data-testid="file-input"
      />
    </div>
  );
}