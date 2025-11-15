
import React, { useState } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { AVATAR_KEYS } from './AvatarDisplay';
import AvatarDisplay from './AvatarDisplay';
import { SparklesIcon } from './icons';

interface ProfileModalProps {
  currentAvatar: string | null;
  onSave: (newAvatar: string) => void;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ currentAvatar, onSave, onClose }) => {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(currentAvatar);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description for your avatar.');
      return;
    }
    setError(null);
    setIsGenerating(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const fullPrompt = `A fun, cute, simple cartoon avatar of ${prompt}. Vector style, vibrant colors, on a plain background, circular portrait.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: fullPrompt }] },
        config: {
          responseModalities: [Modality.IMAGE],
        },
      });

      const firstPart = response.candidates?.[0]?.content?.parts?.[0];
      if (firstPart && firstPart.inlineData) {
        const base64Image = firstPart.inlineData.data;
        const imageUrl = `data:${firstPart.inlineData.mimeType};base64,${base64Image}`;
        setSelectedAvatar(imageUrl);
      } else {
        throw new Error('No image was generated. Please try a different prompt.');
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during image generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if(selectedAvatar) {
        onSave(selectedAvatar);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-slate-50 rounded-2xl shadow-xl p-6 w-full max-w-lg relative" onClick={e => e.stopPropagation()}>
        <h2 className="text-3xl font-bold mb-6 text-slate-800 text-center">Customize Your Avatar</h2>
        
        <div className="flex justify-center mb-6">
            <AvatarDisplay avatar={selectedAvatar} sizeClass="w-32 h-32" />
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-slate-600">Choose a character</h3>
          <div className="grid grid-cols-4 gap-4">
            {AVATAR_KEYS.map(key => (
              <button key={key} onClick={() => setSelectedAvatar(key)} className={`p-2 rounded-full transition-all duration-200 ${selectedAvatar === key ? 'ring-4 ring-sky-400' : 'ring-2 ring-transparent hover:ring-sky-200'}`}>
                <AvatarDisplay avatar={key} sizeClass="w-full h-full" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 text-slate-600 flex items-center gap-2">
            <SparklesIcon className="w-6 h-6 text-fuchsia-500"/>
            Or create one with AI!
          </h3>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="e.g., a smiling pizza slice"
              className="flex-grow p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-fuchsia-400 focus:outline-none"
              disabled={isGenerating}
            />
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-fuchsia-500 text-white font-bold p-3 rounded-lg hover:bg-fuchsia-600 transition-colors disabled:bg-fuchsia-300 disabled:cursor-wait flex items-center justify-center"
            >
              {isGenerating ? 'Generating...' : 'Generate'}
            </button>
          </div>
           {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
        
        <div className="mt-8 flex justify-end gap-3">
            <button onClick={onClose} className="py-2 px-6 rounded-lg font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors">Cancel</button>
            <button onClick={handleSave} className="py-2 px-6 rounded-lg font-semibold bg-sky-500 text-white hover:bg-sky-600 transition-colors">Save</button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
