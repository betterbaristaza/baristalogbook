
import React, { useState, useRef } from 'react';
import { CoffeeBean, RoastLevel } from '../types';

interface CoffeeBeanFormProps {
  onSave: (bean: CoffeeBean) => void;
  onCancel: () => void;
  initialData?: CoffeeBean;
}

const CoffeeBeanForm: React.FC<CoffeeBeanFormProps> = ({ onSave, onCancel, initialData }) => {
  const [formData, setFormData] = useState<Partial<CoffeeBean>>(initialData || {
    name: '',
    roaster: '',
    roasterLocation: '',
    origin: '',
    region: '',
    farm: '',
    producer: '',
    process: 'Washed',
    varietal: '',
    altitude: '',
    roastLevel: RoastLevel.LIGHT,
    roastDate: new Date().toISOString().split('T')[0],
    purchaseDate: new Date().toISOString().split('T')[0],
    totalWeight: 250,
    remainingWeight: 250,
    bagTastingNotes: [],
    personalNotes: '',
    bagImage: undefined,
    labelImage: undefined
  });

  const [tastingNoteInput, setTastingNoteInput] = useState('');
  const bagInputRef = useRef<HTMLInputElement>(null);
  const labelInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'bagImage' | 'labelImage') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [type]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTastingNote = () => {
    if (tastingNoteInput.trim()) {
      setFormData(prev => ({
        ...prev,
        bagTastingNotes: [...(prev.bagTastingNotes || []), tastingNoteInput.trim()]
      }));
      setTastingNoteInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.roaster) return;
    
    onSave({
      ...formData as CoffeeBean,
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
      remainingWeight: formData.remainingWeight || formData.totalWeight || 250
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl space-y-8 animate-in zoom-in-95 duration-300">
      <div className="flex justify-between items-center border-b border-stone-100 pb-4">
        <div>
          <h2 className="text-3xl font-bold display-font text-stone-800">New Bean Record</h2>
          <p className="text-stone-400 text-sm font-medium">Capture every detail from the label</p>
        </div>
        <button type="button" onClick={onCancel} className="p-2 bg-stone-50 rounded-full text-stone-400 hover:text-stone-800">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <div className="space-y-6">
        {/* Visual Documentation */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-800 border-l-2 border-amber-800 pl-3">Visual Documentation</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-stone-400 uppercase">Bag Shot</label>
              <div 
                onClick={() => bagInputRef.current?.click()}
                className="aspect-square bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-amber-300 transition-colors relative overflow-hidden group"
              >
                {formData.bagImage ? (
                  <>
                    <img src={formData.bagImage} alt="Bag" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <p className="text-white text-xs font-bold uppercase tracking-widest">Change Photo</p>
                    </div>
                  </>
                ) : (
                  <>
                    <svg className="w-8 h-8 text-stone-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    <p className="text-[10px] text-stone-400 font-bold uppercase">Front of Bag</p>
                  </>
                )}
                <input ref={bagInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleImageUpload(e, 'bagImage')} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-stone-400 uppercase">Label Detail</label>
              <div 
                onClick={() => labelInputRef.current?.click()}
                className="aspect-square bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-amber-300 transition-colors relative overflow-hidden group"
              >
                {formData.labelImage ? (
                  <>
                    <img src={formData.labelImage} alt="Label" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <p className="text-white text-xs font-bold uppercase tracking-widest">Change Photo</p>
                    </div>
                  </>
                ) : (
                  <>
                    <svg className="w-8 h-8 text-stone-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    <p className="text-[10px] text-stone-400 font-bold uppercase">Back / Label</p>
                  </>
                )}
                <input ref={labelInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleImageUpload(e, 'labelImage')} />
              </div>
            </div>
          </div>
        </section>

        {/* Core Identity */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-800 border-l-2 border-amber-800 pl-3">Bean Identity</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Coffee Name</label>
              <input name="name" required value={formData.name} onChange={handleChange} className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm font-bold" placeholder="e.g. Ethiopia Sidamo" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Roaster</label>
              <input name="roaster" required value={formData.roaster} onChange={handleChange} className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm font-bold" placeholder="e.g. Onyx Coffee Lab" />
            </div>
          </div>
        </section>

        {/* Terroir & Origin */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-800 border-l-2 border-amber-800 pl-3">Terroir & Origin</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Country / Origin</label>
              <input name="origin" value={formData.origin} onChange={handleChange} className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm" placeholder="e.g. Colombia" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Region</label>
              <input name="region" value={formData.region} onChange={handleChange} className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm" placeholder="e.g. Huila" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Farm / Estate</label>
              <input name="farm" value={formData.farm} onChange={handleChange} className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm" placeholder="e.g. Finca El Diviso" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Altitude (MASL)</label>
              <input name="altitude" value={formData.altitude} onChange={handleChange} className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm" placeholder="e.g. 1750 - 1900m" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Process Method</label>
              <input name="process" value={formData.process} onChange={handleChange} className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm" placeholder="e.g. Natural, Washed, Anaerobic Fermentation" />
            </div>
          </div>
        </section>

        {/* Roast Details */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-800 border-l-2 border-amber-800 pl-3">Roast & Purchase</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Roast Level</label>
              <select name="roastLevel" value={formData.roastLevel} onChange={handleChange} className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm font-bold">
                {Object.values(RoastLevel).map(level => <option key={level} value={level}>{level}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Roast Date</label>
              <input name="roastDate" type="date" value={formData.roastDate} onChange={handleChange} className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Bag Weight (g)</label>
              <input name="totalWeight" type="number" value={formData.totalWeight} onChange={handleChange} className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm font-bold" />
            </div>
          </div>
        </section>

        {/* Sensory Details */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-800 border-l-2 border-amber-800 pl-3">Sensory & Labels</h3>
          <div>
            <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Tasting Notes (on bag)</label>
            <div className="flex gap-2 mb-2">
              <input value={tastingNoteInput} onChange={e => setTastingNoteInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddTastingNote())} className="flex-1 bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm" placeholder="Add a note from the label..." />
              <button type="button" onClick={handleAddTastingNote} className="bg-stone-800 text-white px-4 rounded-xl text-sm font-bold">+</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.bagTastingNotes?.map((note, idx) => (
                <span key={idx} className="bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                  {note}
                  <button type="button" onClick={() => setFormData(p => ({...p, bagTastingNotes: p.bagTastingNotes?.filter((_, i) => i !== idx)}))}>×</button>
                </span>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Initial Impression / Notes</label>
            <textarea name="personalNotes" value={formData.personalNotes} onChange={handleChange} className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm h-24" placeholder="Any details not on the bag? Smells, price, etc." />
          </div>
        </section>
      </div>

      <div className="pt-6 border-t border-stone-100 flex gap-4">
        <button type="button" onClick={onCancel} className="flex-1 py-4 bg-stone-100 text-stone-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-stone-200 transition-all">Discard</button>
        <button type="submit" className="flex-1 py-4 bg-amber-800 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-amber-900 transition-all shadow-xl shadow-amber-900/20">Save to Library</button>
      </div>
    </form>
  );
};

export default CoffeeBeanForm;
