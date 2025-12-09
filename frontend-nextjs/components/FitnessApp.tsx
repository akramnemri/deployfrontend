'use client';

import React, { useState } from 'react';
import ModelResults from './ModelResults';
import DynamicWeeklyPlan from './DynamicWeeklyPlan';

const FitnessApp: React.FC = () => {
  const [activeView, setActiveView] = useState<'models' | 'plan'>('models');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Fitness ML Dashboard</h1>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveView('models')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === 'models'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                Model Analysis
              </button>
              <button
                onClick={() => setActiveView('plan')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === 'plan'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                Weekly Plan
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {activeView === 'models' && <ModelResults />}
        {activeView === 'plan' && <DynamicWeeklyPlan />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">
              <strong>Fitness ML Project</strong> - Comparing Linear Regression, Random Forest, Gradient Boosting, and SVM
            </p>
            <p className="text-sm">
              Built with React, TypeScript, and advanced ML algorithms for optimal fitness predictions
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FitnessApp;