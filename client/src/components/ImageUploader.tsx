import { useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Upload, Image, Trash2, Copy, Check, X, ImageIcon } from 'lucide-react';

interface UploadedFile {
  filename: string;
  url: string;
  size: number;
  created: string;
  modified: string;
}

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
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Get uploaded files
  const { data: uploadedFiles = [], isLoading: filesLoading } = useQuery<UploadedFile[]>({
    queryKey: ['/api/uploads'],
    enabled: isGalleryOpen
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      return new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(progress);
          }
        });
        
        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } else {
            reject(new Error(xhr.responseText));
          }
        });
        
        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });
        
        xhr.open('POST', '/api/uploads');
        xhr.send(formData);
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
      queryClient.invalidateQueries({ queryKey: ['/api/uploads'] });
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

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (filename: string) => apiRequest(`/api/uploads/${filename}`, 'DELETE'),
    onSuccess: () => {
      toast({
        title: "تم حذف الصورة",
        description: "تم حذف الصورة بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/uploads'] });
    },
    onError: () => {
      toast({
        title: "فشل في حذف الصورة",
        description: "حدث خطأ أثناء حذف الصورة",
        variant: "destructive",
      });
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

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
      toast({
        title: "تم نسخ الرابط",
        description: "تم نسخ رابط الصورة إلى الحافظة",
      });
    } catch (error) {
      toast({
        title: "فشل في النسخ",
        description: "حدث خطأ أثناء نسخ الرابط",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 بايت';
    const k = 1024;
    const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* URL Input Field */}
      <div>
        <Label htmlFor="image-url">رابط الصورة</Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="image-url"
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder="رابط الصورة أو اختر من المعرض"
            data-testid="image-url-input"
          />
          <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" size="sm" data-testid="open-gallery">
                <ImageIcon className="w-4 h-4" />
                <span className="sr-only">فتح معرض الصور</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle>معرض الصور</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 overflow-y-auto max-h-[60vh]">
                {filesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-muted-foreground">جاري تحميل الصور...</p>
                    </div>
                  </div>
                ) : uploadedFiles.length === 0 ? (
                  <div className="text-center py-8">
                    <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">لا توجد صور محفوظة</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {uploadedFiles.map((file: UploadedFile) => (
                      <Card key={file.filename} className="overflow-hidden">
                        <div className="aspect-square relative">
                          <img
                            src={file.url}
                            alt={file.filename}
                            className="w-full h-full object-cover"
                            data-testid={`gallery-image-${file.filename}`}
                          />
                          <div className="absolute top-2 right-2 flex gap-1">
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              className="w-8 h-8 p-0"
                              onClick={() => {
                                onChange?.(file.url);
                                setIsGalleryOpen(false);
                              }}
                              data-testid={`select-image-${file.filename}`}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              className="w-8 h-8 p-0"
                              onClick={() => copyToClipboard(file.url)}
                              data-testid={`copy-url-${file.filename}`}
                            >
                              {copiedUrl === file.url ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              className="w-8 h-8 p-0"
                              onClick={() => deleteMutation.mutate(file.filename)}
                              disabled={deleteMutation.isPending}
                              data-testid={`delete-image-${file.filename}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <CardContent className="p-2">
                          <p className="text-xs text-muted-foreground truncate" title={file.filename}>
                            {file.filename}
                          </p>
                          <div className="flex justify-between items-center mt-1">
                            <Badge variant="outline" className="text-xs">
                              {formatFileSize(file.size)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(file.created)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
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