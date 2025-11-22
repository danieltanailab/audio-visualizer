import React, { useState, useEffect } from 'react';
import { Settings, X, Key, AlertCircle } from 'lucide-react';

const ApiKeySettings = ({ onKeysUpdated }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [openaiKey, setOpenaiKey] = useState('');
    const [geminiKey, setGeminiKey] = useState('');
    const [hasKeys, setHasKeys] = useState(false);

    useEffect(() => {
        // Load keys from localStorage
        const savedOpenaiKey = localStorage.getItem('openai_api_key') || '';
        const savedGeminiKey = localStorage.getItem('gemini_api_key') || '';
        setOpenaiKey(savedOpenaiKey);
        setGeminiKey(savedGeminiKey);
        setHasKeys(savedOpenaiKey && savedGeminiKey);
    }, []);

    const handleSave = () => {
        localStorage.setItem('openai_api_key', openaiKey);
        localStorage.setItem('gemini_api_key', geminiKey);
        setHasKeys(openaiKey && geminiKey);
        setIsOpen(false);
        if (onKeysUpdated) onKeysUpdated();
    };

    const maskKey = (key) => {
        if (!key) return '';
        return key.slice(0, 8) + '...' + key.slice(-4);
    };

    return (
        <>
            {/* Settings Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed top-4 right-4 p-3 rounded-full shadow-lg transition-colors ${hasKeys
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-orange-500 hover:bg-orange-600 text-white animate-pulse'
                    }`}
                title="API Settings"
            >
                <Settings className="w-5 h-5" />
            </button>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                                <Key className="w-6 h-6 text-blue-600 mr-2" />
                                <h2 className="text-xl font-bold text-slate-900">API Settings</h2>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        {/* Info Alert */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <div className="flex items-start">
                                <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                                <div className="text-sm text-blue-800">
                                    <p className="font-medium mb-1">Bring Your Own API Keys</p>
                                    <p className="text-xs">Your keys are stored locally and never sent to our servers. You only pay for your own usage.</p>
                                </div>
                            </div>
                        </div>

                        {/* OpenAI Key */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                OpenAI API Key
                            </label>
                            <input
                                type="password"
                                value={openaiKey}
                                onChange={(e) => setOpenaiKey(e.target.value)}
                                placeholder="sk-..."
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                Get yours at <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">platform.openai.com</a>
                            </p>
                        </div>

                        {/* Gemini Key */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Gemini API Key
                            </label>
                            <input
                                type="password"
                                value={geminiKey}
                                onChange={(e) => setGeminiKey(e.target.value)}
                                placeholder="AI..."
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                Get yours at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">aistudio.google.com</a>
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!openaiKey || !geminiKey}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                            >
                                Save Keys
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ApiKeySettings;
