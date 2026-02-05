import { useState } from 'react';
import { useSetSiteLogo } from '../hooks/useSiteLogo';
import { ExternalBlob } from '../backend';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Upload, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminPanelPage() {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUploadProgress, setLogoUploadProgress] = useState<number>(0);
  
  const [generalFile, setGeneralFile] = useState<File | null>(null);
  const [generalPreview, setGeneralPreview] = useState<string | null>(null);
  const [generalUploadProgress, setGeneralUploadProgress] = useState<number>(0);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const setLogoMutation = useSetSiteLogo();

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = async () => {
    if (!logoFile) {
      toast.error('Please select a logo image');
      return;
    }

    try {
      setLogoUploadProgress(0);
      const arrayBuffer = await logoFile.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
        setLogoUploadProgress(percentage);
      });

      await setLogoMutation.mutateAsync(blob);
      
      setLogoFile(null);
      setLogoPreview(null);
      setLogoUploadProgress(0);
    } catch (error: any) {
      console.error('Logo upload error:', error);
      toast.error(error.message || 'Failed to upload logo');
    }
  };

  const handleGeneralFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be less than 10MB');
      return;
    }

    setGeneralFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setGeneralPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGeneralUpload = async () => {
    if (!generalFile) {
      toast.error('Please select an image');
      return;
    }

    try {
      setGeneralUploadProgress(0);
      setUploadedImageUrl(null);
      
      const arrayBuffer = await generalFile.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
        setGeneralUploadProgress(percentage);
      });

      // Get the direct URL for the uploaded blob
      const directUrl = blob.getDirectURL();
      setUploadedImageUrl(directUrl);
      
      toast.success('Image uploaded successfully');
      
      setGeneralFile(null);
      setGeneralPreview(null);
      setGeneralUploadProgress(0);
    } catch (error: any) {
      console.error('Image upload error:', error);
      toast.error(error.message || 'Failed to upload image');
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-purple-300">Manage site settings and upload content</p>
        </div>

        {/* Site Logo Upload */}
        <Card className="bg-black/40 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Update Site Logo
            </CardTitle>
            <CardDescription className="text-purple-300">
              Upload a new logo that will appear throughout the application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="logo-upload" className="text-purple-200">
                Select Logo Image
              </Label>
              <Input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoFileChange}
                className="mt-2 bg-black/20 border-purple-500/30 text-white"
              />
            </div>

            {logoPreview && (
              <div className="space-y-2">
                <Label className="text-purple-200">Preview</Label>
                <div className="flex items-center gap-4">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-24 h-24 object-contain rounded-lg border border-purple-500/30 bg-black/20"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-purple-300">{logoFile?.name}</p>
                    <p className="text-xs text-purple-400">
                      {logoFile && (logoFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
              </div>
            )}

            {logoUploadProgress > 0 && logoUploadProgress < 100 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-purple-300">
                  <span>Uploading...</span>
                  <span>{logoUploadProgress}%</span>
                </div>
                <div className="w-full bg-purple-950/30 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${logoUploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <Button
              onClick={handleLogoUpload}
              disabled={!logoFile || setLogoMutation.isPending}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
            >
              {setLogoMutation.isPending ? 'Uploading...' : 'Upload Logo'}
            </Button>
          </CardContent>
        </Card>

        {/* General Image Upload */}
        <Card className="bg-black/40 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Upload Image to Storage
            </CardTitle>
            <CardDescription className="text-purple-300">
              Upload any image to the backend storage and get a reference URL
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="general-upload" className="text-purple-200">
                Select Image
              </Label>
              <Input
                id="general-upload"
                type="file"
                accept="image/*"
                onChange={handleGeneralFileChange}
                className="mt-2 bg-black/20 border-purple-500/30 text-white"
              />
            </div>

            {generalPreview && (
              <div className="space-y-2">
                <Label className="text-purple-200">Preview</Label>
                <div className="flex items-center gap-4">
                  <img
                    src={generalPreview}
                    alt="Image preview"
                    className="w-24 h-24 object-contain rounded-lg border border-purple-500/30 bg-black/20"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-purple-300">{generalFile?.name}</p>
                    <p className="text-xs text-purple-400">
                      {generalFile && (generalFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
              </div>
            )}

            {generalUploadProgress > 0 && generalUploadProgress < 100 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-purple-300">
                  <span>Uploading...</span>
                  <span>{generalUploadProgress}%</span>
                </div>
                <div className="w-full bg-purple-950/30 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${generalUploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <Button
              onClick={handleGeneralUpload}
              disabled={!generalFile}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
            >
              Upload Image
            </Button>

            {uploadedImageUrl && (
              <div className="space-y-2 p-4 bg-green-950/20 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Upload Successful</span>
                </div>
                <div className="space-y-2">
                  <Label className="text-green-300">Image URL:</Label>
                  <div className="p-2 bg-black/40 rounded border border-green-500/20">
                    <code className="text-xs text-green-200 break-all">{uploadedImageUrl}</code>
                  </div>
                  <img
                    src={uploadedImageUrl}
                    alt="Uploaded"
                    className="w-full max-w-md rounded-lg border border-green-500/30"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
