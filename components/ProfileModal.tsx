
import React, { useState } from 'react';
import { UserProfile, BrewMethod } from '../types';
import { Icons } from '../constants';

interface ProfileModalProps {
  initialData?: UserProfile;
  onSave: (profile: UserProfile) => void;
  onCancel?: () => void;
  isFirstLaunch?: boolean;
}

const ROLES = [
  'Home Brewer',
  'Barista',
  'Trainer',
  'Roaster',
  'Coffee Enthusiast'
];

const ProfileModal: React.FC<ProfileModalProps> = ({ initialData, onSave, onCancel, isFirstLaunch }) => {
  const [formData, setFormData] = useState<UserProfile>(initialData || {
    name: '',
    role: 'Home Brewer',
    defaultMethod: 'all',
    defaultGrinder: '',
    defaultBrewer: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSave(formData);
  };

  return (
    <div className="bg-white rounded-[3rem] w-full max-w-md p-10 shadow-2xl animate-in zoom-in-95 duration-300">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-2xl font-black text-stone-800 display-font">
            {isFirstLaunch ? 'Create Profile' : 'Edit Profile'}
          </h3>
          <p className="text-xs text-stone-400 font-medium">
            Personalize your logbook experience.
          </p>
        </div>
        {!isFirstLaunch && onCancel && (
          <button 
            onClick={onCancel} 
            className="p-2 bg-stone-50 rounded-full text-stone-400 hover:text-stone-800 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Display Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. James Hoffmann"
            className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-4 px-6 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-amber-800/5 focus:border-amber-800/20 transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Your Role</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-4 px-6 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-amber-800/5 focus:border-amber-800/20 transition-all"
          >
            {ROLES.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Default Brew Method</label>
          <select
            value={formData.defaultMethod}
            onChange={(e) => setFormData({ ...formData, defaultMethod: e.target.value })}
            className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-4 px-6 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-amber-800/5 focus:border-amber-800/20 transition-all"
          >
            <option value="all">Not Specified</option>
            {Object.values(BrewMethod).map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Default Grinder</label>
          <input
            type="text"
            value={formData.defaultGrinder}
            onChange={(e) => setFormData({ ...formData, defaultGrinder: e.target.value })}
            placeholder="e.g. Comandante C40"
            className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-4 px-6 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-amber-800/5 focus:border-amber-800/20 transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Default Machine / Brewer</label>
          <input
            type="text"
            value={formData.defaultBrewer}
            onChange={(e) => setFormData({ ...formData, defaultBrewer: e.target.value })}
            placeholder="e.g. Decent DE1+ or V60"
            className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-4 px-6 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-amber-800/5 focus:border-amber-800/20 transition-all"
          />
        </div>

        <div className="pt-4 space-y-4">
          <button
            type="submit"
            className="w-full bg-amber-800 text-white py-5 rounded-3xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-amber-900/20 active:scale-95 transition-all"
          >
            {isFirstLaunch ? 'Start Brewing' : 'Save Profile'}
          </button>
          
          <div className="flex items-center gap-2 justify-center py-2 px-4 bg-stone-50 rounded-xl border border-stone-100">
            <Icons.Info className="w-3.5 h-3.5 text-stone-400" />
            <p className="text-[9px] text-stone-400 font-bold uppercase tracking-tight">
              All data is stored locally on this device.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfileModal;
