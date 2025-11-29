'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Link as LinkIcon, Upload, X, FileText, Image as ImageIcon, Trash2 } from 'lucide-react';

export type AttachmentType = 'link' | 'image' | 'document';

export interface Attachment {
    id: string;
    type: AttachmentType;
    name: string;
    url: string;
    size?: number;
}

interface AttachmentUploadProps {
    attachments: Attachment[];
    onChange: (attachments: Attachment[]) => void;
    disabled?: boolean;
}

export function AttachmentUpload({ attachments, onChange, disabled }: AttachmentUploadProps) {
    const [activeTab, setActiveTab] = useState<'link' | 'file'>('link');
    const [linkUrl, setLinkUrl] = useState('');
    const [linkName, setLinkName] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAddLink = () => {
        if (!linkUrl) return;

        const newAttachment: Attachment = {
            id: crypto.randomUUID(),
            type: 'link',
            name: linkName || linkUrl,
            url: linkUrl,
        };

        onChange([...attachments, newAttachment]);
        setLinkUrl('');
        setLinkName('');
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        const isImage = file.type.startsWith('image/');

        // Limit file size to 5MB for MVP (since we're using base64)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target?.result as string;
            const newAttachment: Attachment = {
                id: crypto.randomUUID(),
                type: isImage ? 'image' : 'document',
                name: file.name,
                url: base64,
                size: file.size,
            };

            onChange([...attachments, newAttachment]);
        };
        reader.readAsDataURL(file);

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeAttachment = (id: string) => {
        onChange(attachments.filter(a => a.id !== id));
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-4 border-b border-gray-200">
                <button
                    type="button"
                    onClick={() => setActiveTab('link')}
                    className={`pb-2 text-sm font-medium transition-colors ${activeTab === 'link'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Add Link
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('file')}
                    className={`pb-2 text-sm font-medium transition-colors ${activeTab === 'file'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Upload File
                </button>
            </div>

            {activeTab === 'link' ? (
                <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">URL</label>
                        <input
                            type="url"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            placeholder="https://..."
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            disabled={disabled}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Title (Optional)</label>
                        <input
                            type="text"
                            value={linkName}
                            onChange={(e) => setLinkName(e.target.value)}
                            placeholder="e.g. Research Doc"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            disabled={disabled}
                        />
                    </div>
                    <Button
                        type="button"
                        onClick={handleAddLink}
                        disabled={!linkUrl || disabled}
                        variant="secondary"
                        size="sm"
                        className="w-full"
                    >
                        Add Link
                    </Button>
                </div>
            ) : (
                <div className="bg-gray-50 p-6 rounded-xl border border-dashed border-gray-300 text-center">
                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx,.txt"
                        disabled={disabled}
                    />
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-600">
                        <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                        Click to upload
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                        Images, PDF, or Docs (Max 5MB)
                    </p>
                    <Button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        variant="secondary"
                        size="sm"
                        disabled={disabled}
                    >
                        Select File
                    </Button>
                </div>
            )}

            {/* Attachment List */}
            {attachments.length > 0 && (
                <div className="space-y-2 mt-4">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Attachments ({attachments.length})
                    </h4>
                    <div className="space-y-2">
                        {attachments.map((attachment) => (
                            <div
                                key={attachment.id}
                                className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm group"
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-500">
                                        {attachment.type === 'link' && <LinkIcon className="w-4 h-4" />}
                                        {attachment.type === 'image' && <ImageIcon className="w-4 h-4" />}
                                        {attachment.type === 'document' && <FileText className="w-4 h-4" />}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {attachment.name}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {attachment.type === 'link' ? attachment.url : formatBytes(attachment.size || 0)}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeAttachment(attachment.id)}
                                    className="p-1 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                    disabled={disabled}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function formatBytes(bytes: number, decimals = 0) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
