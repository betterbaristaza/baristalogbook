
import React from 'react';
import { CoffeeBean } from '../types';
import { Icons } from '../constants';

interface CoffeeCardProps {
  coffee: CoffeeBean;
  onClick: (coffee: CoffeeBean) => void;
  onEdit: (coffee: CoffeeBean) => void;
  onDelete: (coffee: CoffeeBean) => void;
}

const CoffeeCard: React.FC<CoffeeCardProps> = ({ coffee, onClick, onEdit, onDelete }) => {
  const progress = (coffee.remainingWeight / coffee.totalWeight) * 100;

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(coffee);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(coffee);
  };

  return (
    <div 
      onClick={() => onClick(coffee)}
      className="bg-white rounded-xl shadow-sm border border-stone-200 p-4 cursor-pointer hover:shadow-md transition-shadow relative group"
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-bold text-lg text-stone-800 leading-tight">{coffee.name}</h3>
          <p className="text-sm text-stone-500 font-medium uppercase tracking-wider">{coffee.roaster}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded-full font-semibold">
            {coffee.roastLevel}
          </span>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={handleEdit}
              className="p-1.5 bg-stone-50 text-stone-400 hover:text-amber-800 rounded-lg border border-stone-100 hover:border-amber-200 transition-all shadow-sm"
              title="Edit Bean"
            >
              <Icons.Edit className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={handleDelete}
              className="p-1.5 bg-rose-50 text-rose-300 hover:text-rose-600 rounded-lg border border-rose-100 hover:border-rose-200 transition-all shadow-sm"
              title="Delete Bean"
            >
              <Icons.Trash className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
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
