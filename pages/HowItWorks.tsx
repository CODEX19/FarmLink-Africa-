
import React from 'react';
import { Icons } from '../constants';

interface HowItWorksProps {
  onBack: () => void;
  onSignUp: () => void;
}

const HowItWorks: React.FC<HowItWorksProps> = ({ onBack, onSignUp }) => {
  const steps = [
    {
      number: '01',
      title: 'Create Your Profile',
      description: 'Register as a farmer or a buyer. It only takes 2 minutes to set up your digital identity.',
      Icon: Icons.Users,
      color: 'bg-blue-50',
      iconColor: 'text-blue-500'
    },
    {
      number: '02',
      title: 'List Your Produce',
      description: 'Take a photo of your harvest, set your price, and list it on our regional marketplace.',
      Icon: Icons.Wheat,
      color: 'bg-emerald-50',
      iconColor: 'text-emerald-500'
    },
    {
      number: '03',
      title: 'Connect with Logistics',
      description: 'Book a verified truck from our fleet to pick up your goods directly from your farm gate.',
      Icon: Icons.Truck,
      color: 'bg-amber-50',
      iconColor: 'text-amber-500'
    },
    {
      number: '04',
      title: 'Get Paid Securely',
      description: 'Receive payments directly into your FarmLink wallet. Withdraw to bank or mobile money anytime.',
      Icon: Icons.Wallet,
      color: 'bg-purple-50',
      iconColor: 'text-purple-500'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={onBack} 
          className="mb-8 flex items-center gap-2 text-slate-500 font-bold hover:text-emerald-600 transition-colors"
        >
          <Icons.ChevronLeft className="w-5 h-5" />
          Back to Home
        </button>

        <div className="text-center mb-16">
          <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">How FarmLink Works</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium">
            We've simplified the journey from seed to sale. Follow these four simple steps to grow your agricultural business.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {steps.map((step) => (
            <div key={step.number} className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex gap-6 items-start hover:shadow-xl transition-all group">
              <div className={`w-20 h-20 rounded-3xl flex-shrink-0 flex items-center justify-center transition-transform group-hover:scale-110 duration-500 ${step.color}`}>
                <step.Icon className={`w-12 h-12 ${step.iconColor}`} />
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase mb-1 block">Phase {step.number}</span>
                <h3 className="text-xl font-black text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm font-medium">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#4d7c0f] rounded-[3rem] p-16 text-center text-white relative overflow-hidden shadow-2xl shadow-[#4d7c0f]/20">
          <div className="relative z-10">
            <h3 className="text-4xl font-black mb-6">Ready to start farming smarter?</h3>
            <p className="text-emerald-100 mb-10 max-w-md mx-auto text-lg font-medium">Join over 10,000 farmers across Africa who are using FarmLink to reach more customers.</p>
            <button 
              onClick={onSignUp}
              className="px-12 py-5 bg-white text-[#4d7c0f] font-black rounded-2xl hover:bg-emerald-50 transition-all shadow-2xl active:scale-95"
            >
              Get Started for Free
            </button>
          </div>
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
