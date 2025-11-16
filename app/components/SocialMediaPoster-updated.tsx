"use client";

import React, { useEffect, useState } from "react";
import { ImageIcon, Video, X, CheckCircle2, AlertCircle, Loader } from "lucide-react";

interface MediaFile {
    id: string;
    name: string;
    type: string;
    url: string;
}

interface Post {
    id: number;
    content: string;
    platforms: string[];
    media: number;
    timestamp: string;
}

interface SelectedPlatforms {
    instagram: boolean;
    twitter: boolean;
    tiktok: boolean;
    facebook: boolean;
    linkedin: boolean;
}

const platforms = [
    {
        id: "instagram",
        name: "Instagram",
        color: "bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500",
        limit: 2200,
    },
    { id: "twitter", name: "Twitter/X", color: "bg-black", limit: 280 },
    {
        id: "tiktok",
        name: "TikTok",
        color: "bg-gradient-to-br from-black via-gray-900 to-pink-600",
        limit: 2200,
    },
    { id: "facebook", name: "Facebook", color: "bg-blue-600", limit: 63206 },
    { id: "linkedin", name: "LinkedIn", color: "bg-blue-700", limit: 3000 },
] as const;

export default function SocialMediaPoster() {
    const [postContent, setPostContent] = useState("");
    const [selectedPlatforms, setSelectedPlatforms] = useState<SelectedPlatforms>({
        instagram: false,
        twitter: false,
        tiktok: false,
        facebook: false,
        linkedin: false,
    });
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
    const [charCount, setCharCount] = useState(0);
    const [posts, setPosts] = useState<Post[]>([]);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [twitterConnected, setTwitterConnected] = useState<boolean | null>(null);
    const [instagramConnected, setInstagramConnected] = useState<boolean | null>(null);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [authenticatingPlatform, setAuthenticatingPlatform] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isPosting, setIsPosting] = useState(false);

    // Check connection status on mount and when window regains focus
    useEffect(() => {
        const checkConnectionStatus = async () => {
            try {
                const [twitterRes, instagramRes] = await Promise.all([
                    fetch('/api/auth/twitter/status'),
                    fetch('/api/auth/instagram/status'),
                ]);
                const twitterData = await twitterRes.json();
                const instagramData = await instagramRes.json();
                setTwitterConnected(Boolean(twitterData?.connected));
                setInstagramConnected(Boolean(instagramData?.connected));
                setError(null);
            } catch (err) {
                console.error('Failed to fetch connection status', err);
                setTwitterConnected(false);
                setInstagramConnected(false);
            }
        };

        checkConnectionStatus();

        // Check status when user returns to the tab (after OAuth flow)
        const handleFocus = () => {
            checkConnectionStatus();
        };

        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    const handlePlatformToggle = (platformId: string) => {
        // Check connection before allowing selection
        if (platformId === 'twitter' && !twitterConnected) {
            setError("Please connect your Twitter account first");
            return;
        }
        if (platformId === 'instagram' && !instagramConnected) {
            setError("Please connect your Instagram account first");
            return;
        }
        
        setSelectedPlatforms((prev) => ({
            ...prev,
            [platformId]: !prev[platformId as keyof SelectedPlatforms],
        }));
        setError(null);
    };

    const handleConnectPlatform = async (platform: 'twitter' | 'instagram') => {
        setIsAuthenticating(true);
        setAuthenticatingPlatform(platform);
        setError(null);
        
        try {
            const width = 500;
            const height = 600;
            const left = window.screenX + (window.outerWidth - width) / 2;
            const top = window.screenY + (window.outerHeight - height) / 2;
            
            const authUrl = platform === 'twitter' 
                ? '/api/auth/twitter' 
                : '/api/auth/instagram';
            
            const authWindow = window.open(
                authUrl,
                `${platform} Auth`,
                `width=${width},height=${height},left=${left},top=${top}`
            );

            if (!authWindow) {
                setError(`Please allow pop-ups to connect ${platform}`);
                setIsAuthenticating(false);
                setAuthenticatingPlatform(null);
                return;
            }

            // Check if user completed auth every 1 second
            const checkAuthInterval = setInterval(async () => {
                if (authWindow.closed) {
                    clearInterval(checkAuthInterval);
                    setIsAuthenticating(false);
                    setAuthenticatingPlatform(null);
                    
                    // Verify connection after auth window closes
                    try {
                        const statusUrl = platform === 'twitter'
                            ? '/api/auth/twitter/status'
                            : '/api/auth/instagram/status';
                        const res = await fetch(statusUrl);
                        const data = await res.json();
                        if (data?.connected) {
                            if (platform === 'twitter') {
                                setTwitterConnected(true);
                            } else {
                                setInstagramConnected(true);
                            }
                            const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
                            setSuccessMessage(`${platformName} account connected successfully!`);
                            setShowSuccess(true);
                            setTimeout(() => setShowSuccess(false), 3000);
                        }
                    } catch (err) {
                        console.error('Failed to verify connection', err);
                    }
                }
            }, 1000);
        } catch (err) {
            console.error(`Error connecting ${platform}:`, err);
            setError(`Failed to initiate ${platform} connection`);
            setIsAuthenticating(false);
            setAuthenticatingPlatform(null);
        }
    };

    const handleDisconnectPlatform = async (platform: 'twitter' | 'instagram') => {
        try {
            const logoutUrl = platform === 'twitter'
                ? '/api/auth/twitter/logout'
                : '/api/auth/instagram/logout';
            
            await fetch(logoutUrl, { method: 'POST' });
            
            if (platform === 'twitter') {
                setTwitterConnected(false);
            } else {
                setInstagramConnected(false);
            }
            
            setSelectedPlatforms((prev) => ({
                ...prev,
                [platform]: false,
            }));
            const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
            setSuccessMessage(`${platformName} account disconnected`);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (err) {
            console.error(`Error disconnecting ${platform}:`, err);
            setError(`Failed to disconnect ${platform} account`);
        }
    };

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        setPostContent(text);
        setCharCount(text.length);
    };

    const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const newMedia: MediaFile[] = files.map((file: File) => ({
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            type: file.type,
            url: URL.createObjectURL(file),
        }));
        setMediaFiles((prev) => [...prev, ...newMedia]);
    };

    const removeMedia = (id: string) => {
        setMediaFiles((prev) => prev.filter((file) => file.id !== id));
    };

    const handlePost = async () => {
        const chosen = Object.keys(selectedPlatforms).filter(
            (key) => selectedPlatforms[key as keyof SelectedPlatforms]
        );

        if (chosen.length === 0) {
            setError("Please select at least one platform");
            return;
        }

        if (!postContent.trim() && mediaFiles.length === 0) {
            setError("Please add content or media to your post");
            return;
        }

        setIsPosting(true);
        setError(null);

        try {
            // Post to Twitter
            if (selectedPlatforms.twitter) {
                const res = await fetch('/api/auth/twitter/post', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        content: postContent,
                        mediaUrls: mediaFiles.map((m) => m.url),
                    }),
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'Failed to post to Twitter');
                }
                console.log('Twitter post successful');
            }

            // Post to Instagram
            if (selectedPlatforms.instagram) {
                const res = await fetch('/api/auth/instagram/post', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        content: postContent,
                        mediaUrls: mediaFiles.map((m) => m.url),
                    }),
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'Failed to post to Instagram');
                }
                console.log('Instagram post successful');
            }

            const newPost: Post = {
                id: Date.now(),
                content: postContent,
                platforms: chosen,
                media: mediaFiles.length,
                timestamp: new Date().toISOString(),
            };

            setPosts((prev) => [newPost, ...prev]);

            // Reset form
            setPostContent("");
            setCharCount(0);
            setMediaFiles([]);
            setSelectedPlatforms({
                instagram: false,
                twitter: false,
                tiktok: false,
                facebook: false,
                linkedin: false,
            });

            setSuccessMessage("Post published successfully!");
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to post';
            console.error('Post failed:', err);
            setError(message);
        } finally {
            setIsPosting(false);
        }
    };

    const getCharLimitWarning = () => {
        const selected = Object.keys(selectedPlatforms).filter(
            (key) => selectedPlatforms[key as keyof SelectedPlatforms]
        );
        if (selected.length === 0) return null;

        const limits = selected.map((id) => {
            const platform = platforms.find((p) => p.id === id);
            return {
                name: platform?.name || "",
                limit: platform?.limit || 0,
            };
        });

        const minLimit = Math.min(...limits.map((l) => l.limit));
        const platform = limits.find((l) => l.limit === minLimit);

        if (charCount > minLimit && platform) {
            return (
                <div className="text-red-500 text-sm mt-1">
                    Exceeds {platform.name} limit ({minLimit} characters)
                </div>
            );
        }
        return null;
    };

    const renderConnectionStatus = (platform: 'twitter' | 'instagram', isConnected: boolean | null) => {
        const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
        const bgColor = platform === 'twitter' ? 'bg-black' : 'bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500';
        
        return (
            <div className="flex items-center gap-2">
                {isConnected !== null && (
                    <>
                        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span className="text-sm text-gray-600">
                            {isConnected ? `${platformName} Connected` : `${platformName} Disconnected`}
                        </span>
                    </>
                )}
                {isConnected === null && (
                    <Loader className="w-4 h-4 animate-spin text-gray-400" />
                )}
                {isConnected ? (
                    <button
                        onClick={() => handleDisconnectPlatform(platform)}
                        className="ml-2 text-sm px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                        Disconnect
                    </button>
                ) : (
                    <button
                        onClick={() => handleConnectPlatform(platform)}
                        disabled={isAuthenticating}
                        className={`ml-2 text-sm px-3 py-1 ${bgColor} text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-1`}
                    >
                        {authenticatingPlatform === platform && isAuthenticating ? (
                            <>
                                <Loader className="w-3 h-3 animate-spin" />
                                Connecting...
                            </>
                        ) : (
                            `Connect ${platformName}`
                        )}
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Social Media Hub
                    </h1>
                    <p className="text-gray-600">
                        Post to multiple platforms at once
                    </p>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                        <AlertCircle className="text-red-600" size={24} />
                        <span className="text-red-800 font-medium">
                            {error}
                        </span>
                    </div>
                )}

                {/* Success Banner */}
                {showSuccess && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                        <CheckCircle2 className="text-green-600" size={24} />
                        <span className="text-green-800 font-medium">
                            {successMessage || "Post scheduled successfully!"}
                        </span>
                    </div>
                )}

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                        <h2 className="text-xl font-semibold text-gray-800">
                            Create Post
                        </h2>
                        
                        {/* Connection Status */}
                        <div className="flex flex-col gap-2 w-full md:w-auto">
                            {renderConnectionStatus('twitter', twitterConnected)}
                            {renderConnectionStatus('instagram', instagramConnected)}
                        </div>
                    </div>

                    {/* Platform Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Select Platforms
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {platforms.map((platform) => (
                                <button
                                    key={platform.id}
                                    type="button"
                                    onClick={() => handlePlatformToggle(platform.id)}
                                    className={`relative p-4 rounded-xl transition-all focus:outline-none ${selectedPlatforms[
                                            platform.id as keyof SelectedPlatforms
                                        ]
                                            ? `${platform.color} text-white shadow-lg scale-105`
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        }`}
                                >
                                    <div className="font-semibold text-sm">
                                        {platform.name}
                                    </div>
                                    {selectedPlatforms[
                                        platform.id as keyof SelectedPlatforms
                                    ] && (
                                            <div className="absolute top-2 right-2">
                                                <CheckCircle2 size={16} />
                                            </div>
                                        )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Post Content */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Post Content
                        </label>
                        <textarea
                            value={postContent}
                            onChange={handleContentChange}
                            placeholder="What's on your mind?"
                            className="w-full h-32 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none focus:outline-none"
                        />
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-sm text-gray-500">
                                {charCount} characters
                            </span>
                            {getCharLimitWarning()}
                        </div>
                    </div>

                    {/* Media Upload */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Media
                        </label>
                        <div className="flex gap-2 mb-4">
                            <label className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors focus:outline-none">
                                <ImageIcon size={20} />
                                <span className="text-sm font-medium">Add Photo</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleMediaUpload}
                                    className="hidden"
                                />
                            </label>

                            <label className="cursor-pointer bg-purple-50 hover:bg-purple-100 text-purple-600 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors focus:outline-none">
                                <Video size={20} />
                                <span className="text-sm font-medium">Add Video</span>
                                <input
                                    type="file"
                                    accept="video/*"
                                    multiple
                                    onChange={handleMediaUpload}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        {/* Media Preview */}
                        {mediaFiles.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {mediaFiles.map((file) => (
                                    <div key={file.id} className="relative group">
                                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                            {file.type.startsWith("image/") ? (
                                                <img
                                                    src={file.url}
                                                    alt={file.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Video
                                                        size={40}
                                                        className="text-gray-400"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeMedia(file.id)}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Post Button */}
                    <button
                        type="button"
                        onClick={handlePost}
                        disabled={isPosting}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isPosting ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin" />
                                Publishing...
                            </>
                        ) : (
                            'Post to Selected Platforms'
                        )}
                    </button>
                </div>

                {/* Posted Items */}
                {posts.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">
                            Recent Posts
                        </h2>
                        <div className="space-y-4">
                            {posts.map((post) => (
                                <div
                                    key={post.id}
                                    className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                                >
                                    <p className="text-gray-800 mb-3 whitespace-pre-wrap">
                                        {post.content}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {post.platforms.map((platformId) => {
                                            const platform = platforms.find(
                                                (p) => p.id === platformId
                                            );
                                            return platform ? (
                                                <span
                                                    key={platformId}
                                                    className={`text-xs px-3 py-1 rounded-full text-white ${platform.color}`}
                                                >
                                                    {platform.name}
                                                </span>
                                            ) : null;
                                        })}
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <span>
                                            {new Date(post.timestamp).toLocaleString()}
                                        </span>
                                        {post.media > 0 && (
                                            <span>{post.media} media file(s)</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
