
import React, { useState } from 'react';

const GRINDER_DATA = {
  "Hand Grinders": [
    {
      name: "Comandante C40 MK4",
      espresso: "5 - 10 clicks",
      aeropress: "12 - 15 clicks",
      pourover: "20 - 25 clicks",
      frenchpress: "28 - 32 clicks",
      description: "Industry standard for hand grinders. Precise steps of ~30 microns per click."
    },
    {
      name: "Timemore Chestnut C2/C3",
      espresso: "Not Recommended",
      aeropress: "13 - 16 clicks",
      pourover: "18 - 24 clicks",
      frenchpress: "24+ clicks",
      description: "Great budget option. Consistent for medium to coarse grinds."
    },
    {
      name: "1Zpresso J-Max",
      espresso: "100 - 150 clicks",
      aeropress: "250 - 300 clicks",
      pourover: "350 - 420 clicks",
      frenchpress: "450+ clicks",
      description: "Extremely fine adjustment (8.8 microns per click), ideal for espresso."
    }
  ],
  "Tabletop Grinders": [
    {
      name: "Niche Zero",
      espresso: "10 - 20",
      aeropress: "25 - 35",
      pourover: "40 - 50",
      frenchpress: "50+",
      description: "Zero retention single-dose grinder. Stepless adjustment."
    },
    {
      name: "Fellow Ode Gen 2",
      espresso: "Not Supported",
      aeropress: "2 - 4",
      pourover: "3 - 6",
      frenchpress: "7 - 9",
      description: "Brew-focused grinder with large 64mm flat burrs. Outstanding clarity."
    },
    {
      name: "Baratza Encore",
      espresso: "Not Recommended",
      aeropress: "10 - 15",
      pourover: "18 - 24",
      frenchpress: "28 - 32",
      description: "The classic entry-level electric grinder for home brewing."
    }
  ]
};

const GrindReference: React.FC = () => {
  const [selectedGrinder, setSelectedGrinder] = useState(GRINDER_DATA["Hand Grinders"][0]);

  return (
    <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-amber-100 rounded-2xl text-amber-800">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M2 12h20"/><circle cx="12" cy="12" r="10"/></svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-stone-800">Grind Size Reference</h2>
          <p className="text-xs text-stone-500">Based on HonestCoffeeGuide settings</p>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Select Grinder</label>
        <select 
          className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 font-bold text-stone-700 outline-none focus:ring-2 focus:ring-amber-500"
          onChange={(e) => {
            const val = e.target.value;
            const all = [...GRINDER_DATA["Hand Grinders"], ...GRINDER_DATA["Tabletop Grinders"]];
            const found = all.find(g => g.name === val);
            if (found) setSelectedGrinder(found);
          }}
          value={selectedGrinder.name}
        >
          <optgroup label="Hand Grinders">
            {GRINDER_DATA["Hand Grinders"].map(g => <option key={g.name} value={g.name}>{g.name}</option>)}
          </optgroup>
          <optgroup label="Tabletop Grinders">
            {GRINDER_DATA["Tabletop Grinders"].map(g => <option key={g.name} value={g.name}>{g.name}</option>)}
          </optgroup>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
          <p className="text-[10px] font-bold text-stone-400 uppercase mb-1">Espresso</p>
          <p className="font-black text-amber-900">{selectedGrinder.espresso}</p>
        </div>
        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
          <p className="text-[10px] font-bold text-stone-400 uppercase mb-1">AeroPress</p>
          <p className="font-black text-amber-900">{selectedGrinder.aeropress}</p>
        </div>
        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
          <p className="text-[10px] font-bold text-stone-400 uppercase mb-1">Pour Over</p>
          <p className="font-black text-amber-900">{selectedGrinder.pourover}</p>
        </div>
        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
          <p className="text-[10px] font-bold text-stone-400 uppercase mb-1">French Press</p>
          <p className="font-black text-amber-900">{selectedGrinder.frenchpress}</p>
        </div>
      </div>

      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 italic text-stone-600 text-sm">
        {selectedGrinder.description}
      </div>
    </div>
  );
};

export default GrindReference;
