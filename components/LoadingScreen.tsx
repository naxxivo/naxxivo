import React from 'react';

const NaxStoreLogo: React.FC = () => (
  <h1 className="text-4xl font-bold tracking-tighter">
    Nax<span className="text-yellow-400">Store</span>
  </h1>
);

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col justify-center items-center z-50 animate-fade-in">
      <div className="flex flex-col items-center gap-6">
        <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
        <NaxStoreLogo />
      </div>
    </div>
  );
};

export default LoadingScreen;
