'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useToast } from '@/components/ui/Toast';
import { motion } from 'framer-motion';
import { User, Trash2, Moon, Sun, Info, Save } from 'lucide-react';

export default function SettingsPage() {
    const { showToast, ToastContainer } = useToast();

    // State
    const [hostName, setHostName] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isClearDataModalOpen, setIsClearDataModalOpen] = useState(false);
    const [isClearing, setIsClearing] = useState(false);

    // Load settings
    useEffect(() => {
        const savedName = localStorage.getItem('default_host_name');
        if (savedName) setHostName(savedName);

        // Check for dark mode preference (mock implementation for now as we don't have a global theme context yet)
        const savedTheme = localStorage.getItem('theme');
        setIsDarkMode(savedTheme === 'dark');
    }, []);

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        localStorage.setItem('default_host_name', hostName);
        showToast('Profile settings saved', 'success');
    };

    const toggleTheme = () => {
        const newTheme = !isDarkMode ? 'dark' : 'light';
        setIsDarkMode(!isDarkMode);
        localStorage.setItem('theme', newTheme);
        showToast(`Theme set to ${newTheme} mode (Reload to apply changes fully)`, 'success');
        // In a real app, this would toggle a class on the html element via a context
    };

    const handleClearData = async () => {
        setIsClearing(true);

        // Simulate a delay for better UX
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Clear all app specific keys
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('host_token_') || key.startsWith('player_id_') || key === 'default_host_name')) {
                keysToRemove.push(key);
            }
        }

        keysToRemove.forEach(key => localStorage.removeItem(key));

        setIsClearing(false);
        setIsClearDataModalOpen(false);
        setHostName('');
        showToast('All local data cleared successfully', 'success');
    };

    return (
        <AppLayout>
            {ToastContainer}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-600 mt-1">Manage your preferences and application data</p>
                </div>

                <div className="space-y-6">
                    {/* Profile Settings */}
                    <Section
                        icon={User}
                        title="Profile Settings"
                        description="Set your default information for new sessions."
                    >
                        <form onSubmit={handleSaveProfile} className="space-y-4">
                            <div className="max-w-md">
                                <Input
                                    label="Default Host Name"
                                    placeholder="e.g., Alex"
                                    value={hostName}
                                    onChange={(e) => setHostName(e.target.value)}
                                />
                                <p className="mt-1 text-sm text-gray-500">This name will be pre-filled when you create new sessions.</p>
                            </div>
                            <Button type="submit" size="sm">
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </Button>
                        </form>
                    </Section>

                    {/* Appearance */}
                    <Section
                        icon={isDarkMode ? Moon : Sun}
                        title="Appearance"
                        description="Customize how the application looks."
                    >
                        <div className="flex items-center justify-between max-w-md p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div>
                                <h4 className="font-medium text-gray-900">Dark Mode</h4>
                                <p className="text-sm text-gray-500">Switch between light and dark themes</p>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isDarkMode ? 'bg-blue-600' : 'bg-gray-200'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    </Section>

                    {/* Data Management */}
                    <Section
                        icon={Trash2}
                        title="Data Management"
                        description="Manage your local data and session history."
                        danger
                    >
                        <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                            <h4 className="font-medium text-red-800 mb-1">Clear Local Data</h4>
                            <p className="text-sm text-red-600 mb-4">
                                This will remove all saved sessions, host tokens, and preferences from this browser.
                                This action cannot be undone.
                            </p>
                            <Button
                                variant="outline"
                                className="border-red-200 text-red-700 hover:bg-red-100 hover:text-red-800 hover:border-red-300"
                                onClick={() => setIsClearDataModalOpen(true)}
                            >
                                Clear All Data
                            </Button>
                        </div>
                    </Section>

                    {/* About */}
                    <Section
                        icon={Info}
                        title="About"
                        description="Application information."
                    >
                        <div className="text-sm text-gray-600 space-y-2">
                            <p><strong>Version:</strong> 1.0.0 (Beta)</p>
                            <p><strong>Build:</strong> 2025.11.29</p>
                            <p>
                                UX Play is a suite of facilitation tools designed to help teams make better decisions faster.
                            </p>
                        </div>
                    </Section>
                </div>
            </div>

            <ConfirmModal
                isOpen={isClearDataModalOpen}
                onClose={() => setIsClearDataModalOpen(false)}
                onConfirm={handleClearData}
                title="Clear All Data?"
                message="Are you sure you want to clear all local data? You will lose access to all your active sessions unless you have the links saved elsewhere."
                confirmText="Yes, Clear Everything"
                cancelText="Cancel"
                isLoading={isClearing}
                type="danger"
            />
        </AppLayout>
    );
}

function Section({
    icon: Icon,
    title,
    description,
    children,
    danger = false
}: {
    icon: any,
    title: string,
    description: string,
    children: React.ReactNode,
    danger?: boolean
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
        >
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3 mb-1">
                    <div className={`p-2 rounded-lg ${danger ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                </div>
                <p className="text-gray-500 text-sm ml-12">{description}</p>
            </div>
            <div className="p-6 ml-12">
                {children}
            </div>
        </motion.div>
    );
}
