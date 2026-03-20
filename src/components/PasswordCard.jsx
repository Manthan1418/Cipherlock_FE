import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Trash2, Edit, Eye, EyeOff } from 'lucide-react';
import { getCategoryStyle } from '../pages/AddPassword';

const PasswordCard = ({ item, isVisible, decryptedPassword, onToggleVisibility, onCopy, onDelete }) => {
    const cat = item.category || 'General';
    const catStyle = getCategoryStyle(cat);

    return (
        <div className="glass p-5 rounded-2xl card-hover glow-hover group relative overflow-hidden transition-all duration-300 hover:border-indigo-500/30">
            {/* Background Gradient/Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {/* Top Section: Icon & Info */}
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                    {/* Site Icon / Initial */}
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/20 group-hover:scale-105 transition-transform duration-300 border flex-shrink-0" style={{ borderColor: 'var(--border-color)', backgroundColor: catStyle.bg }}>
                        <span className="font-bold text-xl drop-shadow-md" style={{ color: catStyle.text }}>
                            {item.site.charAt(0).toUpperCase()}
                        </span>
                    </div>

                    {/* Text Details */}
                    <div className="min-w-0">
                        <h3 className="font-bold text-lg leading-tight break-words tracking-wide" style={{ color: 'var(--text-primary)' }}>
                            {item.site}
                        </h3>
                        <p className="text-sm font-medium break-all flex items-start gap-1.5 mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 flex-shrink-0 mt-1.5"></span>
                            {item.username}
                        </p>
                    </div>
                </div>

                {/* Quick Actions (Always visible) */}
                <div className="flex items-center gap-1 opacity-100 backdrop-blur-md p-1 rounded-lg border flex-shrink-0" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}>
                    <button
                        onClick={() => onCopy(item.username, 'Username')}
                        className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                        title="Copy Username"
                    >
                        <Copy className="w-4 h-4" />
                    </button>
                    <Link
                        to={`/edit/${item.id}`}
                        className="p-1.5 hover:text-indigo-400 hover:bg-white/10 rounded-md transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                        title="Edit"
                    >
                        <Edit className="w-4 h-4" />
                    </Link>
                    <button
                        onClick={() => onDelete(item.id)}
                        className="p-1.5 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Category Badge */}
            <div className="relative z-10 mb-3">
                <span
                    className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide"
                    style={{ backgroundColor: catStyle.bg, color: catStyle.text }}
                >
                    {cat}
                </span>
            </div>

            {/* Bottom Section: Password Field */}
            <div className="relative z-10">
                <div className="backdrop-blur-md rounded-xl p-1 pl-4 flex items-center justify-between border group-hover:border-indigo-500/20 transition-colors" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-input)' }}>
                    <div className="flex-1 font-mono text-sm truncate mr-3 select-none" style={{ color: 'var(--text-primary)' }}>
                        {isVisible ? (
                            <span className="font-medium tracking-wide" style={{ color: 'var(--text-primary)' }}>
                                {decryptedPassword || "Decrypting..."}
                            </span>
                        ) : (
                            <span className="tracking-widest text-lg leading-none mt-1 block" style={{ color: 'var(--text-muted)' }}>
                                ••••••••••••
                            </span>
                        )}
                    </div>

                    <div className="flex gap-1 pr-1">
                        <button
                            onClick={() => onToggleVisibility(item.id)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-all active:scale-95"
                            style={{ color: 'var(--text-muted)' }}
                            title={isVisible ? "Hide Password" : "Show Password"}
                        >
                            {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={() => onCopy(decryptedPassword, 'Password')}
                            className="p-2 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all active:scale-95"
                            style={{ color: 'var(--text-muted)' }}
                            title="Copy Password"
                            disabled={!isVisible}
                        >
                            <Copy className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Decorative glow */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-2xl group-hover:opacity-100 opacity-0 transition-all duration-500 pointer-events-none" style={{ backgroundColor: catStyle.bg }}></div>
        </div>
    );
};

export default memo(PasswordCard);
