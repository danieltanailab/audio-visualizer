import React from 'react';
import { Star, Zap, Target, Shield, Quote, ArrowRight, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#6366f1', '#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b'];

const IconMap = {
    star: Star,
    zap: Zap,
    target: Target,
    shield: Shield,
};

const KeyConcepts = ({ data }) => (
    <div className="mb-10">
        <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center">
            <span className="w-1 h-6 bg-indigo-500 mr-3 rounded"></span>
            {data.title}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.items.map((item, idx) => {
                const Icon = IconMap[item.icon] || Star;
                const colors = [
                    { bg: 'bg-indigo-50', icon: 'text-indigo-600', border: 'border-indigo-100' },
                    { bg: 'bg-cyan-50', icon: 'text-cyan-600', border: 'border-cyan-100' }
                ];
                const color = colors[idx % 2];

                return (
                    <div key={idx} className={`${color.bg} rounded-lg p-5 border ${color.border} hover:shadow-md transition-shadow`}>
                        <div className="flex items-start">
                            <div className={`p-2.5 rounded-lg bg-white shadow-sm mr-3 flex-shrink-0`}>
                                <Icon className={`w-5 h-5 ${color.icon}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-slate-900 mb-1.5 text-sm">{item.title}</h4>
                                <p className="text-slate-700 text-xs leading-relaxed">{item.description}</p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
);

const Process = ({ data }) => (
    <div className="mb-10">
        <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center">
            <span className="w-1 h-6 bg-cyan-500 mr-3 rounded"></span>
            {data.title}
        </h3>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-3 md:space-y-0 md:space-x-3">
            {data.steps.map((step, idx) => (
                <React.Fragment key={idx}>
                    <div className="flex-1 w-full relative">
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                            <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-br from-cyan-500 to-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md">
                                {idx + 1}
                            </div>
                            <p className="font-medium text-slate-800 text-sm leading-relaxed pt-1">{step}</p>
                        </div>
                    </div>
                    {idx < data.steps.length - 1 && (
                        <ArrowRight className="w-5 h-5 text-slate-300 transform rotate-90 md:rotate-0 flex-shrink-0 my-1 md:my-0" />
                    )}
                </React.Fragment>
            ))}
        </div>
    </div>
);

const Stats = ({ data }) => (
    <div className="mb-10">
        <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center">
            <span className="w-1 h-6 bg-purple-500 mr-3 rounded"></span>
            {data.title}
        </h3>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{
                            borderRadius: '8px',
                            border: 'none',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            fontSize: '12px'
                        }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {data.data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
);

const Comparison = ({ data }) => (
    <div className="mb-10">
        <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center">
            <span className="w-1 h-6 bg-pink-500 mr-3 rounded"></span>
            {data.title}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.items.map((item, idx) => {
                const Icon = IconMap[item.icon] || Star;
                const colors = [
                    { bg: 'bg-pink-50', icon: 'text-pink-600', border: 'border-pink-100' },
                    { bg: 'bg-indigo-50', icon: 'text-indigo-600', border: 'border-indigo-100' }
                ];
                const color = colors[idx % 2];

                return (
                    <div key={idx} className={`${color.bg} rounded-lg p-5 border ${color.border} hover:shadow-md transition-shadow`}>
                        <div className="flex items-start mb-2">
                            <div className={`p-2.5 rounded-lg bg-white shadow-sm mr-3`}>
                                <Icon className={`w-5 h-5 ${color.icon}`} />
                            </div>
                            <h4 className="font-bold text-slate-900 text-sm pt-1">{item.title}</h4>
                        </div>
                        <p className="text-slate-700 text-xs leading-relaxed ml-11">{item.description}</p>
                    </div>
                );
            })}
        </div>
    </div>
);

const QuoteSection = ({ data }) => (
    <div className="mb-10">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-8 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-4 left-4 opacity-20">
                <Quote className="w-16 h-16" />
            </div>
            <div className="relative z-10">
                <p className="text-lg md:text-xl font-serif italic leading-relaxed mb-3">"{data.text}"</p>
                <p className="font-semibold text-indigo-100 text-sm">— {data.author}</p>
            </div>
        </div>
    </div>
);

const Infographic = ({ data }) => {
    if (!data || !data.sections) return null;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-5 border-b border-green-100">
                <div className="flex items-center">
                    <div className="p-2 bg-white rounded-lg mr-3 shadow-sm">
                        <BarChart3 className="w-6 h-6 text-green-600" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">3. Visualize</h2>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {/* Main Title */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                        {data.title}
                    </h2>
                    <div className="h-1 w-20 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full"></div>
                </div>

                {/* Sections */}
                <div className="space-y-2">
                    {data.sections.map((section, idx) => {
                        switch (section.type) {
                            case 'key_concepts': return <KeyConcepts key={idx} data={section} />;
                            case 'process': return <Process key={idx} data={section} />;
                            case 'stats': return <Stats key={idx} data={section} />;
                            case 'comparison': return <Comparison key={idx} data={section} />;
                            case 'quote': return <QuoteSection key={idx} data={section} />;
                            default: return null;
                        }
                    })}
                </div>
            </div>
        </div>
    );
};

export default Infographic;
