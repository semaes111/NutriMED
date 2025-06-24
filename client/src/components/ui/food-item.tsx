import { Check, X } from "lucide-react";

interface FoodItemProps {
  name: string;
  quantity?: string;
  isAllowed: boolean;
  notes?: string;
}

export function FoodItem({ name, quantity, isAllowed, notes }: FoodItemProps) {
  return (
    <div className={`flex items-center justify-between p-2 rounded-lg ${
      isAllowed ? 'bg-green-50' : 'bg-red-50'
    }`}>
      <div className="flex-1">
        <span className="text-sm text-gray-700">{name}</span>
        {quantity && (
          <span className="text-xs text-gray-500 ml-2">({quantity})</span>
        )}
        {notes && (
          <p className="text-xs text-gray-500 mt-1">{notes}</p>
        )}
      </div>
      {isAllowed ? (
        <Check className="text-green-500" size={16} />
      ) : (
        <X className="text-red-500" size={16} />
      )}
    </div>
  );
}
