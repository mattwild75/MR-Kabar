import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    Check,
    ChevronRight,
    Clock,
    Download,
    File,
    FileArchive,
    FileAudio,
    FileImage,
    FileText,
    FileVideo,
    Folder,
    FolderPlus,
    FolderRoot,
    Shield,
    Trash2,
    UploadCloud,
    Users,
    X,
} from 'lucide-react';
import React, { useRef, useState } from 'react';
import { toast } from 'sonner';

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
    approvalStatus: 'pending' | 'approved' | null;
    uploaderName: string | null;
    canDelete: boolean;
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
    isAdminOrSuperAdmin: boolean;
    isShared: boolean;
    viewingUserId: number;
    viewingUserName: string;
    users: UserOption[];
    sharedFolderId: number | null;
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

    flat.forEach((folder) => {
        map.set(folder.id, { ...folder, children: [] });
    });

    flat.forEach((folder) => {
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
    if (mime.startsWith('image/')) return <FileImage className="text-primary h-5 w-5" />;
    if (mime.startsWith('video/')) return <FileVideo className="h-5 w-5 text-purple-500" />;
    if (mime.startsWith('audio/')) return <FileAudio className="h-5 w-5 text-pink-500" />;
    if (mime.includes('zip') || mime.includes('rar') || mime.includes('tar') || mime.includes('7z'))
        return <FileArchive className="h-5 w-5 text-yellow-500" />;
    if (mime.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
    if (mime.includes('text') || mime.includes('csv') || mime.includes('json')) return <FileText className="h-5 w-5 text-green-500" />;
    if (mime.includes('word')) return <FileText className="text-primary h-5 w-5" />;
    if (mime.includes('excel') || mime.includes('sheet')) return <FileText className="h-5 w-5 text-green-600" />;
    if (mime.includes('powerpoint') || mime.includes('presentation')) return <FileText className="h-5 w-5 text-orange-500" />;
    return <File className="text-muted-foreground h-5 w-5" />;
}

function isPreviewable(mime: string) {
    return mime.startsWith('image/') || mime.startsWith('text/') || mime.includes('pdf') || mime.includes('document');
}

export default function FileManager({
    folders,
    currentFolderId,
    currentFolder,
    files,
    isSuperAdmin,
    isAdminOrSuperAdmin,
    isShared,
    viewingUserId,
    viewingUserName,
    users,
    sharedFolderId,
}: Props) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [uploading, setUploading] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [deleteFolderId, setDeleteFolderId] = useState<number | null>(null);
    const [previewFile, setPreviewFile] = useState<FileNode | null>(null);
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);

    // Mode "Folder Umum" (scope=shared) dibuka utk SEMUA user, bukan cuma
    // admin/super-admin — parameter ini disisipkan ke setiap navigasi/aksi
    // supaya konteks "sedang di Folder Umum" tidak hilang saat pindah folder.
    // Admin & super-admin melihat file/folder milik user lain lewat query
    // param user_id (tidak relevan lagi saat isShared, keduanya saling
    // eksklusif); backend (ensureCanViewTargetUser) yang menegakkan admin
    // tidak bisa mengakses folder milik super-admin.
    const withUserParam = (params: Record<string, string | number | null> = {}) =>
        isShared ? { ...params, scope: 'shared' } : isAdminOrSuperAdmin ? { ...params, user_id: viewingUserId } : params;

    const visitFolder = (folderId: number | null) => {
        const params = withUserParam(folderId ? { folder_id: folderId } : {});
        const query = new URLSearchParams(params as Record<string, string>).toString();
        router.visit(`/files${query ? `?${query}` : ''}`);
    };

    const handleUserChange = (userId: string) => {
        router.visit(`/files?user_id=${userId}`);
    };

    // Node "Folder Umum" digabung ke dalam File Manager — klik selalu masuk ke
    // scope=shared pada root-nya sendiri (bukan folder_id manapun).
    const visitShared = () => {
        router.visit('/files?scope=shared');
    };

    // Node "Folder PIC" — klik selalu kembali ke folder pribadi (TANPA
    // scope=shared), meski sedang di dalam Folder Umum saat ini.
    const visitOwnRoot = () => {
        router.visit('/files');
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
        if (isShared) {
            formData.append('scope', 'shared');
        } else if (isAdminOrSuperAdmin) {
            formData.append('user_id', String(viewingUserId));
        }

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
        router.post(
            '/media',
            {
                name: newFolderName,
                parent_id: currentFolderId,
                ...(isShared ? { scope: 'shared' } : isAdminOrSuperAdmin ? { user_id: viewingUserId } : {}),
            },
            {
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
            },
        );
    };

    const renderFolderTree = (nodes: (FolderNode & { children: FolderNode[] })[], level = 0) => {
        return nodes.map((folder) => (
            <div key={folder.id} style={{ marginLeft: level * 12 }} className="mb-1">
                <div
                    className={`hover:bg-accent flex cursor-pointer items-center gap-1 rounded p-1 ${currentFolderId === folder.id ? 'bg-accent' : ''}`}
                    onClick={() => visitFolder(folder.id)}
                >
                    {folder.children.length > 0 && <ChevronRight className="text-muted-foreground h-4 w-4" />}
                    {folder.children.length === 0 && <span className="h-4 w-4"></span>}

                    <Folder className="h-4 w-4 text-yellow-500" />
                    <span className="flex-1 truncate text-sm">{folder.name}</span>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-destructive h-6 w-6"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteFolderId(folder.id);
                                }}
                            >
                                <Trash2 className="h-3 w-3" />
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
                                <AlertDialogAction onClick={confirmDeleteFolder} className="bg-red-600 hover:bg-red-700">
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
                {folder.children.length > 0 && <div className="ml-4">{renderFolderTree(folder.children, level + 1)}</div>}
            </div>
        ));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isShared ? 'Folder Umum' : 'File Manager'} />
            <div className="flex-1 space-y-4 p-4 md:p-6">
                <div className="border-border bg-card flex items-center gap-2 rounded-lg border p-3">
                    <Shield className="text-primary h-4 w-4 shrink-0" />
                    <span className="text-sm font-medium">
                        {isShared ? 'Sedang membuka: Folder Umum' : 'Sedang membuka: Folder PIC (folder pribadi Anda)'}
                    </span>
                    <span className="text-muted-foreground text-xs">
                        {isShared
                            ? 'Ruang penyimpanan bersama, terpisah dari folder pribadi Anda — semua pengguna dapat melihat dan mengunggah file di sini. Upload dari pengguna biasa menunggu persetujuan Admin/Super Admin sebelum terlihat oleh orang lain. Pilih "Folder PIC (Anda)" di panel kiri untuk kembali ke folder pribadi.'
                            : 'Folder ini hanya bisa diakses oleh Anda sendiri (dan Admin/Super Admin). Pilih "Folder Umum" di panel kiri untuk membuka ruang penyimpanan bersama.'}
                    </span>
                </div>
                {isAdminOrSuperAdmin && !isShared && (
                    <div className="border-border bg-card flex items-center gap-2 rounded-lg border p-3">
                        <Shield className="text-primary h-4 w-4 shrink-0" />
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
                        <span className="text-muted-foreground text-xs">
                            {isSuperAdmin
                                ? 'Sebagai super-admin, Anda dapat melihat dan mengelola file semua pengguna.'
                                : 'Sebagai admin, Anda dapat melihat dan mengelola file seluruh pengguna kecuali milik Super Admin.'}
                        </span>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                    {/* Sidebar Folder Tree */}
                    <div className="border-border bg-card rounded-lg border p-4 md:col-span-1">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-sm font-semibold">Folder Structure</h2>
                            <Button variant="outline" size="sm" onClick={() => setIsCreatingFolder(true)} className="gap-1">
                                <FolderPlus className="h-4 w-4" />
                                <span>New Folder</span>
                            </Button>
                        </div>

                        <div className="max-h-[calc(100vh-250px)] overflow-y-auto">
                            {sharedFolderId && (
                                <div
                                    className={`hover:bg-accent mb-2 flex cursor-pointer items-center gap-2 rounded p-2 ${isShared ? 'bg-accent' : ''}`}
                                    onClick={visitShared}
                                >
                                    <Users className="text-primary h-4 w-4" />
                                    <span className="text-sm font-medium">Folder Umum (Semua bisa akses)</span>
                                </div>
                            )}
                            <div
                                className={`hover:bg-accent mb-2 flex cursor-pointer items-center gap-2 rounded p-2 ${!isShared && !currentFolderId ? 'bg-accent' : ''}`}
                                onClick={isShared ? visitOwnRoot : () => visitFolder(null)}
                            >
                                <FolderRoot className="text-primary h-4 w-4" />
                                <span className="text-sm font-medium">{isShared ? 'Folder PIC (Anda)' : `Folder PIC — ${viewingUserName}`}</span>
                            </div>
                            {!isShared && renderFolderTree(buildFolderTree(folders ?? []))}
                        </div>
                    </div>

                    {/* Main Panel File View */}
                    <div className="space-y-4 md:col-span-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-semibold">
                                    {currentFolder ? currentFolder.name : isShared ? 'Folder Umum (Root)' : `Folder PIC — ${viewingUserName} (Root)`}
                                </h2>
                                {currentFolder && (
                                    <span className="text-muted-foreground text-sm">
                                        ({files.length} {files.length === 1 ? 'item' : 'items'})
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Input ref={fileInputRef} type="file" onChange={handleUpload} disabled={uploading} className="hidden" multiple />
                                <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="gap-2">
                                    <UploadCloud className="h-4 w-4" />
                                    {uploading ? 'Uploading...' : 'Upload'}
                                </Button>
                            </div>
                        </div>

                        <Separator />

                        {(() => {
                            const subfolders = (folders ?? []).filter((f) => f.parent_id === currentFolderId);
                            return (
                                subfolders.length > 0 && (
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {subfolders.map((folder) => (
                                            <div
                                                key={`folder-${folder.id}`}
                                                className="group border-border hover:border-primary flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors"
                                                onClick={() => visitFolder(folder.id)}
                                            >
                                                <Folder className="h-5 w-5 shrink-0 text-yellow-500" />
                                                <span className="min-w-0 flex-1 truncate font-medium">{folder.name}</span>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <button
                                                            className="text-muted-foreground hover:text-destructive p-1 opacity-0 transition-opacity group-hover:opacity-100"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setDeleteFolderId(folder.id);
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete Folder?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Folder <strong>{folder.name}</strong> and all its contents will be permanently
                                                                deleted.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={confirmDeleteFolder} className="bg-red-600 hover:bg-red-700">
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        ))}
                                    </div>
                                )
                            );
                        })()}

                        {files.length === 0 ? (
                            <div className="text-muted-foreground flex h-64 flex-col items-center justify-center">
                                <Folder className="mb-2 h-12 w-12" />
                                <p>No files in this folder</p>
                                <Button variant="ghost" size="sm" className="mt-2" onClick={() => fileInputRef.current?.click()}>
                                    Upload the first file
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {files.map((file) => (
                                    <div
                                        key={file.id}
                                        className="group border-border hover:border-primary cursor-pointer rounded-lg border p-4 transition-colors"
                                        onClick={() => (isPreviewable(file.mime_type) ? setPreviewFile(file) : null)}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex min-w-0 flex-1 items-center gap-3">
                                                {getFileIcon(file.mime_type)}
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate font-medium">{file.name}</p>
                                                    <p className="text-muted-foreground text-xs">{file.size}</p>
                                                    <p className="text-muted-foreground text-xs">{file.created_at}</p>
                                                    {file.approvalStatus === 'pending' && (
                                                        <div className="mt-1 flex items-center gap-1 text-xs text-amber-600">
                                                            <Clock className="h-3 w-3" />
                                                            <span>
                                                                Menunggu persetujuan{file.uploaderName ? ` — diunggah oleh ${file.uploaderName}` : ''}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex shrink-0 gap-1">
                                                <a
                                                    href={file.url}
                                                    download={file.name}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="text-muted-foreground hover:text-primary p-1"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </a>
                                                {file.canDelete && (
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <button
                                                                className="text-muted-foreground hover:text-destructive p-1"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
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
                                                                    onClick={() =>
                                                                        router.delete(`/files/${file.id}`, {
                                                                            preserveScroll: true,
                                                                            onSuccess: () => {
                                                                                setPreviewFile(null);
                                                                                router.reload({ only: ['files'] });
                                                                            },
                                                                        })
                                                                    }
                                                                    className="bg-red-600 hover:bg-red-700"
                                                                >
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                )}
                                            </div>
                                        </div>
                                        {isShared && isAdminOrSuperAdmin && file.approvalStatus === 'pending' && (
                                            <div className="border-border mt-3 flex gap-2 border-t pt-3">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="flex-1 gap-1 text-green-600 hover:bg-green-600/10 hover:text-green-600"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.post(
                                                            `/files/${file.id}/approve`,
                                                            {},
                                                            {
                                                                preserveScroll: true,
                                                                onSuccess: () => {
                                                                    toast.success('File disetujui');
                                                                    router.reload({ only: ['files'] });
                                                                },
                                                            },
                                                        );
                                                    }}
                                                >
                                                    <Check className="h-4 w-4" />
                                                    Setujui
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive flex-1 gap-1"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.post(
                                                            `/files/${file.id}/reject`,
                                                            {},
                                                            {
                                                                preserveScroll: true,
                                                                onSuccess: () => {
                                                                    toast.success('File ditolak');
                                                                    setPreviewFile(null);
                                                                    router.reload({ only: ['files'] });
                                                                },
                                                            },
                                                        );
                                                    }}
                                                >
                                                    <X className="h-4 w-4" />
                                                    Tolak
                                                </Button>
                                            </div>
                                        )}
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
                <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col">
                    {previewFile && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="truncate">{previewFile.name}</DialogTitle>
                            </DialogHeader>
                            <div className="flex-1 overflow-auto p-4">
                                {previewFile.mime_type.startsWith('image/') ? (
                                    <img src={previewFile.url} alt={previewFile.name} className="mx-auto max-h-[70vh] max-w-full object-contain" />
                                ) : previewFile.mime_type.includes('pdf') ? (
                                    <iframe src={previewFile.url} className="h-[70vh] w-full rounded border" title={previewFile.name} />
                                ) : previewFile.mime_type.startsWith('text/') ? (
                                    <div className="bg-muted/50 h-[70vh] overflow-auto rounded p-4">
                                        <pre className="whitespace-pre-wrap">{/* Content would be loaded here */}</pre>
                                    </div>
                                ) : (
                                    <div className="text-muted-foreground flex h-64 flex-col items-center justify-center">
                                        <File className="mb-2 h-12 w-12" />
                                        <p>Preview not available</p>
                                        <a href={previewFile.url} download={previewFile.name} className="text-primary mt-2 hover:underline">
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
