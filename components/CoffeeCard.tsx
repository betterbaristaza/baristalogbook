
import React from 'react';
import { CoffeeBean } from '../types';

interface CoffeeCardProps {
  coffee: CoffeeBean;
  onClick: (coffee: CoffeeBean) => void;
}

const CoffeeCard: React.FC<CoffeeCardProps> = ({ coffee, onClick }) => {
  const progress = (coffee.remainingWeight / coffee.totalWeight) * 100;

  return (
    <div 
      onClick={() => onClick(coffee)}
      className="bg-white rounded-xl shadow-sm border border-stone-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-bold text-lg text-stone-800 leading-tight">{coffee.name}</h3>
          <p className="text-sm text-stone-500 font-medium uppercase tracking-wider">{coffee.roaster}</p>
        </div>
        <span className="text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded-full font-semibold">
          {coffee.roastLevel}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-2 my-3 text-xs text-stone-600">
        <div>
          <p className="text-stone-400">Origin</p>
          <p className="font-medium">{coffee.origin}</p>
        </div>
        <div>
          <p className="text-stone-400">Process</p>
          <p className="font-medium">{coffee.process}</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-[10px] text-stone-400 mb-1 uppercase tracking-widest font-bold">
          <span>Inventory</span>
          <span>{coffee.remainingWeight}g / {coffee.totalWeight}g</span>
        </div>
        <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-amber-800 h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default CoffeeCard;
