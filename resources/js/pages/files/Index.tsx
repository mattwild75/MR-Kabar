import React, { useRef, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { type BreadcrumbItem } from '@/types';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Folder,
  FolderPlus,
  Trash2,
  UploadCloud,
  ChevronRight,
  FileText,
  FileImage,
  FileArchive,
  FileAudio,
  FileVideo,
  File,
  Download,
  FolderRoot,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FolderNode {
  id: number;
  name: string;
  parent_id: number | null;
  children: FolderNode[];
}

interface FileNode {
  id: number;
  name: string;
  mime_type: string;
  url: string;
  size: string;
  created_at: string;
}

interface UserOption {
  id: number;
  name: string;
}

interface Props {
  folders: FolderNode[];
  currentFolderId: number | null;
  currentFolder: FolderNode | null;
  files: FileNode[];
  isSuperAdmin: boolean;
  viewingUserId: number;
  viewingUserName: string;
  users: UserOption[];
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'File Management',
    href: '/files',
  },
];

function buildFolderTree(flat: FolderNode[]): (FolderNode & { children: FolderNode[] })[] {
  const map = new Map<number, FolderNode & { children: FolderNode[] }>();
  const roots: (FolderNode & { children: FolderNode[] })[] = [];

  flat.forEach(folder => {
    map.set(folder.id, { ...folder, children: [] });
  });

  flat.forEach(folder => {
    if (folder.parent_id) {
      const parent = map.get(folder.parent_id);
      if (parent) {
        parent.children.push(map.get(folder.id)!);
      }
    } else {
      roots.push(map.get(folder.id)!);
    }
  });

  return roots;
}

function getFileIcon(mime: string) {
  if (mime.startsWith('image/')) return <FileImage className="w-5 h-5 text-primary" />;
  if (mime.startsWith('video/')) return <FileVideo className="w-5 h-5 text-purple-500" />;
  if (mime.startsWith('audio/')) return <FileAudio className="w-5 h-5 text-pink-500" />;
  if (mime.includes('zip') || mime.includes('rar') || mime.includes('tar') || mime.includes('7z'))
    return <FileArchive className="w-5 h-5 text-yellow-500" />;
  if (mime.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
  if (mime.includes('text') || mime.includes('csv') || mime.includes('json'))
    return <FileText className="w-5 h-5 text-green-500" />;
  if (mime.includes('word')) return <FileText className="w-5 h-5 text-primary" />;
  if (mime.includes('excel') || mime.includes('sheet'))
    return <FileText className="w-5 h-5 text-green-600" />;
  if (mime.includes('powerpoint') || mime.includes('presentation'))
    return <FileText className="w-5 h-5 text-orange-500" />;
  return <File className="h-5 w-5 text-muted-foreground" />;
}

function isPreviewable(mime: string) {
  return (
    mime.startsWith('image/') ||
    mime.startsWith('text/') ||
    mime.includes('pdf') ||
    mime.includes('document')
  );
}

export default function FileManager({
  folders,
  currentFolderId,
  currentFolder,
  files,
  isSuperAdmin,
  viewingUserId,
  viewingUserName,
  users,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [deleteFolderId, setDeleteFolderId] = useState<number | null>(null);
  const [previewFile, setPreviewFile] = useState<FileNode | null>(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  // Super-admin melihat file/folder milik user lain lewat query param
  // user_id; parameter ini disisipkan ke setiap navigasi/aksi supaya
  // konteks "sedang melihat sebagai siapa" tidak hilang saat pindah folder.
  const withUserParam = (params: Record<string, string | number | null> = {}) =>
    isSuperAdmin ? { ...params, user_id: viewingUserId } : params;

  const visitFolder = (folderId: number | null) => {
    const params = withUserParam(folderId ? { folder_id: folderId } : {});
    const query = new URLSearchParams(params as Record<string, string>).toString();
    router.visit(`/files${query ? `?${query}` : ''}`);
  };

  const handleUserChange = (userId: string) => {
    router.visit(`/files?user_id=${userId}`);
  };

  const confirmDeleteFolder = () => {
    if (!deleteFolderId) return;

    const deletingCurrent = deleteFolderId === currentFolderId;

    router.delete(`/media/${deleteFolderId}`, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Folder deleted successfully');
        setDeleteFolderId(null);

        if (deletingCurrent) {
          visitFolder(null);
        } else {
          router.reload({ only: ['folders'] });
        }
      },
      onError: () => toast.error('Failed to delete folder'),
    });
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files[]', files[i]);
    }
    if (currentFolderId) formData.append('folder_id', currentFolderId.toString());
    if (isSuperAdmin) formData.append('user_id', String(viewingUserId));

    setUploading(true);
    router.post('/files', formData, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        toast.success('File uploaded successfully');
        if (fileInputRef.current) fileInputRef.current.value = '';
        router.reload({ only: ['files'] });
      },
      onError: () => toast.error('Failed to upload file'),
      onFinish: () => setUploading(false),
    });
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      toast.error('Folder name cannot be empty');
      return;
    }

    setIsCreatingFolder(true);
    router.post('/media', {
      name: newFolderName,
      parent_id: currentFolderId,
      ...(isSuperAdmin ? { user_id: viewingUserId } : {}),
    }, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Folder created successfully');
        setNewFolderName('');
        setIsCreatingFolder(false);
        router.reload({ only: ['folders'] });
      },
      onError: () => {
        toast.error('Failed to create folder');
        setIsCreatingFolder(false);
      },
    });
  };

  const renderFolderTree = (nodes: (FolderNode & { children: FolderNode[] })[], level = 0) => {
    return nodes.map((folder) => (
      <div key={folder.id} style={{ marginLeft: level * 12 }} className="mb-1">
        <div
          className={`flex items-center gap-1 cursor-pointer rounded p-1 hover:bg-accent ${currentFolderId === folder.id ? 'bg-accent' : ''}`}
          onClick={() => visitFolder(folder.id)}
        >
          {folder.children.length > 0 && (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          {folder.children.length === 0 && (
            <span className="w-4 h-4"></span>
          )}

          <Folder className="w-4 h-4 text-yellow-500" />
          <span className="text-sm truncate flex-1">{folder.name}</span>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteFolderId(folder.id);
                }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Folder?</AlertDialogTitle>
                <AlertDialogDescription>
                  Folder <strong>{folder.name}</strong> and all its contents will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDeleteFolder}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        {folder.children.length > 0 && (
          <div className="ml-4">
            {renderFolderTree(folder.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="File Manager" />
      <div className="flex-1 space-y-4 p-4 md:p-6">
        {isSuperAdmin && (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-3">
            <Shield className="h-4 w-4 shrink-0 text-primary" />
            <span className="text-sm font-medium">Melihat file milik:</span>
            <Select value={String(viewingUserId)} onValueChange={handleUserChange}>
              <SelectTrigger className="w-[220px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.id} value={String(u.id)}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">
              Sebagai super-admin, Anda dapat melihat dan mengelola file semua pengguna.
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {/* Sidebar Folder Tree */}
        <div className="md:col-span-1 rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Folder Structure</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreatingFolder(true)}
              className="gap-1"
            >
              <FolderPlus className="w-4 h-4" />
              <span>New Folder</span>
            </Button>
          </div>

          <div className="overflow-y-auto max-h-[calc(100vh-250px)]">
            <div
              className={`mb-2 flex cursor-pointer items-center gap-2 rounded p-2 hover:bg-accent ${!currentFolderId ? 'bg-accent' : ''}`}
              onClick={() => visitFolder(null)}
            >
              <FolderRoot className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{viewingUserName} (Root)</span>
            </div>
            {renderFolderTree(buildFolderTree(folders ?? []))}
          </div>
        </div>

        {/* Main Panel File View */}
        <div className="md:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">
                {currentFolder ? currentFolder.name : `${viewingUserName} (Root)`}
              </h2>
              {currentFolder && (
                <span className="text-sm text-muted-foreground">
                  ({files.length} {files.length === 1 ? 'item' : 'items'})
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Input
                ref={fileInputRef}
                type="file"
                onChange={handleUpload}
                disabled={uploading}
                className="hidden"
                multiple
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="gap-2"
              >
                <UploadCloud className="w-4 h-4" />
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </div>

          <Separator />

          {files.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
              <Folder className="w-12 h-12 mb-2" />
              <p>No files in this folder</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => fileInputRef.current?.click()}
              >
                Upload the first file
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="group cursor-pointer rounded-lg border border-border p-4 transition-colors hover:border-primary"
                  onClick={() => isPreviewable(file.mime_type) ? setPreviewFile(file) : null}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.mime_type)}
                      <div className="overflow-hidden">
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{file.size}</p>
                        <p className="text-xs text-muted-foreground">{file.created_at}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a
                        href={file.url}
                        download={file.name}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 text-muted-foreground hover:text-primary"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            className="p-1 text-muted-foreground hover:text-destructive"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete File?</AlertDialogTitle>
                            <AlertDialogDescription>
                              File <strong>{file.name}</strong> will be permanently deleted.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => router.delete(`/files/${file.id}`, {
                                preserveScroll: true,
                                onSuccess: () => {
                                  setPreviewFile(null);
                                  router.reload({ only: ['files'] });
                                },
                              })}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Create Folder Dialog */}
      <Dialog open={isCreatingFolder} onOpenChange={setIsCreatingFolder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreatingFolder(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* File Preview Dialog */}
      <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          {previewFile && (
            <>
              <DialogHeader>
                <DialogTitle className="truncate">{previewFile.name}</DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-auto p-4">
                {previewFile.mime_type.startsWith('image/') ? (
                  <img
                    src={previewFile.url}
                    alt={previewFile.name}
                    className="max-w-full max-h-[70vh] mx-auto object-contain"
                  />
                ) : previewFile.mime_type.includes('pdf') ? (
                  <iframe
                    src={previewFile.url}
                    className="w-full h-[70vh] border rounded"
                    title={previewFile.name}
                  />
                ) : previewFile.mime_type.startsWith('text/') ? (
                  <div className="h-[70vh] overflow-auto rounded bg-muted/50 p-4">
                    <pre className="whitespace-pre-wrap">{/* Content would be loaded here */}</pre>
                  </div>
                ) : (
                  <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
                    <File className="w-12 h-12 mb-2" />
                    <p>Preview not available</p>
                    <a
                      href={previewFile.url}
                      download={previewFile.name}
                      className="mt-2 text-primary hover:underline"
                    >
                      Download file
                    </a>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
