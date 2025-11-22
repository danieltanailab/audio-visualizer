import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

const SummaryCard = ({ summary }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(summary);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // Parse the markdown summary into sections
    const parseSummary = (text) => {
        const sections = [];
        const lines = text.split('\n');
        let currentSection = null;

        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith('## ')) {
                if (currentSection) sections.push(currentSection);
                currentSection = {
                    title: trimmed.replace('## ', ''),
                    content: []
                };
            } else if (trimmed.startsWith('- ') && currentSection) {
                currentSection.content.push(trimmed.replace('- ', ''));
            } else if (trimmed && currentSection && !trimmed.startsWith('##')) {
                currentSection.content.push(trimmed);
            }
        });

        if (currentSection) sections.push(currentSection);
        return sections;
    };

    const sections = parseSummary(summary);
    const previewLength = 250;
    const needsExpansion = summary.length > previewLength;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-purple-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="p-2 bg-white rounded-lg mr-3 shadow-sm">
                            <Sparkles className="w-6 h-6 text-purple-600" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">2. Summarize</h2>
                    </div>
                    <button
                        onClick={handleCopy}
                        className="flex items-center px-3 py-1.5 bg-white hover:bg-purple-50 text-purple-600 rounded-lg text-sm font-medium transition-colors shadow-sm border border-purple-100"
                        title="Copy to clipboard"
                    >
                        {copied ? (
                            <>
                                <Check className="w-4 h-4 mr-1.5" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4 mr-1.5" />
                                Copy
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {sections.length > 0 ? (
                    <div className="space-y-6">
                        {sections.map((section, idx) => {
                            // Only show first section if collapsed
                            if (!isExpanded && idx > 0) return null;

                            return (
                                <div key={idx} className={!isExpanded && idx === 0 ? 'relative' : ''}>
                                    <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center">
                                        <span className="w-1 h-6 bg-purple-500 mr-3 rounded"></span>
                                        {section.title}
                                    </h3>

                                    <div className="ml-4 space-y-2">
                                        {section.content.map((item, itemIdx) => {
                                            // Check if this is a bullet point or paragraph
                                            const isBullet = item.length < 200;

                                            return (
                                                <div key={itemIdx} className="flex items-start">
                                                    {isBullet && (
                                                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                                    )}
                                                    <p className={`text-slate-700 leading-relaxed ${isBullet ? 'text-sm' : 'text-base mb-2'}`}>
                                                        {item}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Fade overlay when collapsed */}
                                    {!isExpanded && idx === 0 && needsExpansion && (
                                        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    // Fallback for non-structured summary
                    <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {isExpanded ? summary : `${summary.slice(0, previewLength)}${needsExpansion ? '...' : ''}`}
                    </div>
                )}

                {/* Expand/Collapse Button */}
                {needsExpansion && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="mt-4 flex items-center text-purple-600 hover:text-purple-800 font-medium text-sm focus:outline-none transition-colors"
                    >
                        {isExpanded ? (
                            <>
                                <ChevronUp className="w-4 h-4 mr-1" />
                                See Less
                            </>
                        ) : (
                            <>
                                <ChevronDown className="w-4 h-4 mr-1" />
                                See More
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

export default SummaryCard;
