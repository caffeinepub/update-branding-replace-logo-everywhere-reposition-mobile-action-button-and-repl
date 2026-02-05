import { useState } from 'react';
import { useUploadAvatar } from '../hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function AvatarPicker() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const uploadAvatar = useUploadAvatar();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Please select a valid image (JPG, PNG, or WebP)');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size must be less than 5MB');
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const avatarBlob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      await uploadAvatar.mutateAsync(avatarBlob);
      setUploadProgress(0);
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      setUploadProgress(0);
    }
  };

  return (
    <div className="mt-4">
      <input
        type="file"
        id="avatar-upload"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="w-full bg-purple-900/20 rounded-full h-2 mb-2">
          <div
            className="bg-gradient-to-r from-purple-600 to-purple-700 h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      <Button
        type="button"
        onClick={() => document.getElementById('avatar-upload')?.click()}
        disabled={uploadAvatar.isPending}
        variant="outline"
        size="sm"
        className="border-purple-500/30 text-purple-300 hover:bg-purple-900/30 hover:text-white"
      >
        <Upload className="w-4 h-4 mr-2" />
        {uploadAvatar.isPending ? 'Uploading...' : 'Change Avatar'}
      </Button>
    </div>
  );
}
