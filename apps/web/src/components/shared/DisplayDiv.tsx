import React from 'react';

function DisplayDiv({ text }: { text: string }) {
  return (
    <div className="bg-emerald-100 text-emerald-600 font-semibold px-4 py-1 rounded-full inline-block text-sm">
      {text}
    </div>
  );
}

export default DisplayDiv;
