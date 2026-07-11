import { useState } from 'react';
import type { Checklist } from '../../types/content';
import './interactive.css';

export default function ChecklistViewer({ checklist }: { checklist: Checklist }) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const totalCount = checklist.items.length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <div className="checklist-container">
      <div className="checklist-header">
        <h4 className="checklist-title">Checklist: {checklist.title}</h4>
        <div className="checklist-progress">{completedCount} / {totalCount}</div>
      </div>
      
      <div className="checklist-progress-bar">
        <div className="checklist-progress-fill" style={{ width: `${progressPercent}%` }}></div>
      </div>

      <div className="checklist-items">
        {checklist.items.map(item => {
          const isChecked = !!checkedItems[item.id];
          return (
            <label key={item.id} className={`checklist-item ${isChecked ? 'checked' : ''}`}>
              <input 
                type="checkbox" 
                checked={isChecked} 
                onChange={() => toggle(item.id)} 
              />
              <span className="checklist-desc">{item.description}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
