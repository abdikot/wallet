import { useState, useEffect } from 'react';

export default function EnhancedLoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  
  const loadingMessages = [
    "Connecting to secure servers...",
    "Syncing your accounts...",
    "Retrieving latest transactions...",
    "Updating exchange rates...",
    "Preparing your dashboard..."
  ];
  
  const financialTips = [
    "Set aside 20% of your income for savings",
    "Track your expenses to identify spending patterns",
    "Pay off high-interest debt first",
    "Create an emergency fund covering 3-6 months of expenses",
    "Review your financial goals regularly"
  ];

  useEffect(() => {
    // Progressive loading simulation with different phases
    const timer = setTimeout(() => {
      if (progress < 100) {
        const increment = Math.random() * 3 + 1; // Random increment between 1-4
        const newProgress = Math.min(progress + increment, 100);
        setProgress(newProgress);
        
        // Update loading phase based on progress
        if (newProgress >= 20 && loadingPhase === 0) setLoadingPhase(1);
        else if (newProgress >= 40 && loadingPhase === 1) setLoadingPhase(2);
        else if (newProgress >= 60 && loadingPhase === 2) setLoadingPhase(3);
        else if (newProgress >= 80 && loadingPhase === 3) setLoadingPhase(4);
      } else {
        setFadeOut(true);
        setTimeout(() => {
          setIsVisible(false);
        }, 800);
      }
    }, 40);

    return () => clearTimeout(timer);
  }, [progress, loadingPhase]);

  useEffect(() => {
    if (progress > 10) {
      const tipTimer = setInterval(() => {
        setTipIndex((prevIndex) => (prevIndex + 1) % financialTips.length);
      }, 4000);
      
      return () => clearInterval(tipTimer);
    }
  }, [progress]);

//   Handle escape key to skip loading (for development)
//   useEffect(() => {
//     const handleKeyDown = (e) => {
//       if (e.key === 'Escape') {
//         setProgress(100);
//       }
//     };
    
//     window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, []);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-800 ios-loading-fix ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
      style={{ 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%)' 
      }}
    >
      <div className="w-full max-w-md px-6 flex flex-col items-center">
        {/* Logo with animation */}
        <div className="relative w-32 h-32 mb-6">
          <div className="absolute inset-0 app-logo-pulse animate-pulse">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="walletGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4A90E2" />
                  <stop offset="100%" stopColor="#357ABD" />
                </linearGradient>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#4A90E2" floodOpacity="0.3"/>
                </filter>
              </defs>
              
              {/* Background glow */}
              <circle cx="100" cy="100" r="80" fill="#4A90E2" opacity="0.1" />
              
              {/* Wallet base with shadow */}
              <rect x="20" y="40" width="160" height="120" rx="16" fill="url(#walletGradient)" filter="url(#shadow)" />
              
              {/* Card slot */}
              <rect x="20" y="70" width="160" height="30" fill="#3672B6" />
              
              {/* Wallet flap */}
              <path d="M20,40 Q90,25 180,40 L180,70 L20,70 Z" fill="#3672B6" />
              
              {/* Credit cards peeking out */}
              <rect x="30" y="75" width="100" height="15" rx="2" fill="#FFD700" opacity="0.8" />
              <rect x="35" y="78" width="90" height="15" rx="2" fill="#E5E5E5" opacity="0.8" />
              
              {/* Money symbol */}
              <text x="100" y="130" fontSize="60" textAnchor="middle" fontWeight="bold" fill="white">$</text>
              
              {/* Wallet shine effect */}
              <path d="M30,50 L170,50 L160,60 L40,60 Z" fill="white" opacity="0.3" />
              
              {/* Circles radiating out (animated in CSS) */}
              <circle cx="100" cy="100" r="90" fill="none" stroke="#4A90E2" strokeWidth="2" strokeDasharray="10,5" className="animate-spin-slow" />
              <circle cx="100" cy="100" r="70" fill="none" stroke="white" strokeWidth="3" strokeDasharray="8,4" opacity="0.4" />
            </svg>
          </div>
          
          {/* Small floating coins animation (would be animated with CSS) */}
          <div className="absolute top-0 right-0">
            <div className="h-6 w-6 rounded-full bg-yellow-400 border-2 border-yellow-500 shadow-md opacity-80" />
          </div>
          <div className="absolute bottom-4 left-2">
            <div className="h-8 w-8 rounded-full bg-yellow-300 border-2 border-yellow-500 shadow-md opacity-90" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-blue-600 mb-2">MyWallet</h1>
        <p className="text-blue-400 font-medium mb-8">Your Financial Partner</p>
        
        {/* Animated progress bar */}
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner mb-6">
          <div 
            className="h-full rounded-full transition-all duration-300 ease-out"
            style={{ 
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #4A90E2 0%, #357ABD 100%)',
              boxShadow: '0 0 10px rgba(74, 144, 226, 0.5)' 
            }}
          />
        </div>
        
        {/* Loading phase message */}
        <div className="h-6 mb-6">
          <p className="text-gray-600 font-medium text-center transition-all duration-300">
            {loadingMessages[loadingPhase]}
          </p>
        </div>
        
        {/* Loading dots */}
        <div className="flex space-x-2 mb-8">
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '250ms' }} />
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '500ms' }} />
        </div>
        
        {/* Financial tips section with fade transition */}
        <div className="bg-white bg-opacity-50 p-4 rounded-lg shadow-md border border-blue-100 max-w-md">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">💡 Financial Tip:</h3>
          <p className="text-sm text-gray-700">
            {financialTips[tipIndex]}
          </p>
        </div>
        
        {/* Footer note */}
        <p className="text-xs text-gray-400 mt-8">
          Press ESC to skip loading (development only)
        </p>
      </div>
    </div>
  );
}