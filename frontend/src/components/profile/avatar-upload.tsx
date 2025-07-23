'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Camera, Loader2, X, UserCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface AvatarUploadProps {
  currentAvatar?: string;
  userName?: string;
  onAvatarChange: (avatarUrl: string) => void;
  isLoading?: boolean;
}

export function AvatarUpload({ currentAvatar, userName, onAvatarChange, isLoading }: AvatarUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file hình ảnh');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước file không được vượt quá 5MB');
      return;
    }

    setError('');
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!previewUrl) return;

    setUploading(true);
    setError('');

    try {
      // For now, we'll use the preview URL as the avatar
      // In a real app, you would upload to a cloud service like Cloudinary, AWS S3, etc.
      onAvatarChange(previewUrl);
      setIsOpen(false);
      setPreviewUrl(null);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải lên ảnh');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (!avatarUrl.trim()) {
      setError('Vui lòng nhập URL hình ảnh');
      return;
    }

    // Basic URL validation
    try {
      new URL(avatarUrl);
      onAvatarChange(avatarUrl);
      setIsOpen(false);
      setAvatarUrl('');
      setError('');
    } catch {
      setError('URL không hợp lệ');
    }
  };

  const handleRemoveAvatar = () => {
    onAvatarChange(''); // Vẫn truyền empty string để backend biết xóa avatar
    setIsOpen(false);
    setPreviewUrl(null);
    setAvatarUrl('');
  };

  const resetDialog = () => {
    setPreviewUrl(null);
    setAvatarUrl('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <Avatar className="h-24 w-24">
        <AvatarImage
          src={currentAvatar && currentAvatar.trim() ? currentAvatar : undefined}
          alt={userName || 'User'}
        />
        <AvatarFallback className="bg-primary text-primary-foreground text-lg">
          {userName ? getInitials(userName) : <UserCircle className="h-8 w-8" />}
        </AvatarFallback>
      </Avatar>

      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) resetDialog();
      }}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" disabled={isLoading}>
            <Camera className="h-4 w-4 mr-2" />
            Thay đổi ảnh
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Thay đổi ảnh đại diện</DialogTitle>
            <DialogDescription>
              Tải lên ảnh mới hoặc nhập URL hình ảnh
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Preview */}
            {previewUrl && (
              <div className="flex justify-center">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={previewUrl} alt="Preview" />
                    <AvatarFallback>Preview</AvatarFallback>
                  </Avatar>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6"
                    onClick={() => setPreviewUrl(null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}

            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="avatar-file">Tải lên từ máy tính</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="avatar-file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  ref={fileInputRef}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Chấp nhận: JPG, PNG, GIF. Tối đa 5MB.
              </p>
            </div>

            {/* URL Input */}
            <div className="space-y-2">
              <Label htmlFor="avatar-url">Hoặc nhập URL hình ảnh</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="avatar-url"
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={handleUrlSubmit}
                  disabled={!avatarUrl.trim()}
                >
                  Áp dụng
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter className="flex justify-between">
            <div>
              {currentAvatar && currentAvatar.trim() && (
                <Button variant="destructive" onClick={handleRemoveAvatar}>
                  Xóa ảnh
                </Button>
              )}
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Hủy
              </Button>
              {previewUrl && (
                <Button onClick={handleUpload} disabled={uploading}>
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang tải...
                    </>
                  ) : (
                    'Cập nhật'
                  )}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
