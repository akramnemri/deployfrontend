'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface RegressionResult {
  algorithm: string;
  mse: number;
  rmse: number;
  mae: number;
  r2: number;
  type: 'calories' | 'weight';
}

interface ClassificationResult {
  algorithm: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  type: 'recommendation';
}

type ModelResult = RegressionResult | ClassificationResult;

interface AlgorithmComparisonReg {
  name: string;
  calories_r2: number;
  weight_r2: number;
  calories_rmse: number;
  weight_rmse: number;
}

interface AlgorithmComparisonClass {
  name: string;
  f1: number;
  accuracy: number;
}

const ModelResults: React.FC = () => {
  const [results, setResults] = useState<ModelResult[]>([]);
  const [comparisonDataReg, setComparisonDataReg] = useState<AlgorithmComparisonReg[]>([]);
  const [comparisonDataClass, setComparisonDataClass] = useState<AlgorithmComparisonClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'comparison' | 'calories' | 'weight' | 'recommendation'>('comparison');

  useEffect(() => {
    // In real app, fetch from backend
    // Mock data
    const mockResults: ModelResult[] = [
      // Calories
      { algorithm: 'Linear Regression', mse: 1250.5, rmse: 35.36, mae: 28.45, r2: 0.8234, type: 'calories' },
      { algorithm: 'Gradient Boosting', mse: 980.2, rmse: 31.31, mae: 24.12, r2: 0.8615, type: 'calories' },
      { algorithm: 'Random Forest', mse: 1050.8, rmse: 32.42, mae: 25.67, r2: 0.8517, type: 'calories' },
      { algorithm: 'SVM', mse: 1180.3, rmse: 34.36, mae: 27.89, r2: 0.8332, type: 'calories' },
      
      // Weight
      { algorithm: 'Linear Regression', mse: 2.45, rmse: 1.56, mae: 1.23, r2: 0.7567, type: 'weight' },
      { algorithm: 'Gradient Boosting', mse: 1.89, rmse: 1.37, mae: 1.08, r2: 0.8123, type: 'weight' },
      { algorithm: 'Random Forest', mse: 2.12, rmse: 1.45, mae: 1.15, r2: 0.7894, type: 'weight' },
      { algorithm: 'SVM', mse: 2.34, rmse: 1.53, mae: 1.21, r2: 0.7678, type: 'weight' },
      
      // Recommendation
      { algorithm: 'Logistic Regression', accuracy: 0.75, precision: 0.74, recall: 0.75, f1: 0.74, type: 'recommendation' },
      { algorithm: 'SVM', accuracy: 0.82, precision: 0.81, recall: 0.82, f1: 0.81, type: 'recommendation' },
      { algorithm: 'Gradient Boosting', accuracy: 0.88, precision: 0.87, recall: 0.88, f1: 0.87, type: 'recommendation' },
      { algorithm: 'Random Forest', accuracy: 0.86, precision: 0.85, recall: 0.86, f1: 0.85, type: 'recommendation' },
    ];

    const mockComparisonReg: AlgorithmComparisonReg[] = [
      { name: 'Linear Regression', calories_r2: 0.8234, weight_r2: 0.7567, calories_rmse: 35.36, weight_rmse: 1.56 },
      { name: 'Gradient Boosting', calories_r2: 0.8615, weight_r2: 0.8123, calories_rmse: 31.31, weight_rmse: 1.37 },
      { name: 'Random Forest', calories_r2: 0.8517, weight_r2: 0.7894, calories_rmse: 32.42, weight_rmse: 1.45 },
      { name: 'SVM', calories_r2: 0.8332, weight_r2: 0.7678, calories_rmse: 34.36, weight_rmse: 1.53 },
    ];

    const mockComparisonClass: AlgorithmComparisonClass[] = [
      { name: 'Logistic Regression', f1: 0.74, accuracy: 0.75 },
      { name: 'SVM', f1: 0.81, accuracy: 0.82 },
      { name: 'Gradient Boosting', f1: 0.87, accuracy: 0.88 },
      { name: 'Random Forest', f1: 0.85, accuracy: 0.86 },
    ];

    setTimeout(() => {
      setResults(mockResults);
      setComparisonDataReg(mockComparisonReg);
      setComparisonDataClass(mockComparisonClass);
      setLoading(false);
    }, 1000);
  }, []);

  const getBestAlgorithm = (type: 'calories' | 'weight' | 'recommendation') => {
    const filtered = results.filter((r): r is RegressionResult | ClassificationResult => r.type === type);
    if (type === 'recommendation') {
      return (filtered as ClassificationResult[]).reduce((best, current) => 
        current.f1 > best.f1 ? current : best
      );
    } else {
      return (filtered as RegressionResult[]).reduce((best, current) => 
        current.r2 > best.r2 ? current : best
      );
    }
  };

  const getOverallBest = () => {
    return {
      calories: getBestAlgorithm('calories') as RegressionResult,
      weight: getBestAlgorithm('weight') as RegressionResult,
      recommendation: getBestAlgorithm('recommendation') as ClassificationResult
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading model comparison results...</p>
        </div>
      </div>
    );
  }

  const bestModels = getOverallBest();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ML Model Performance Analysis
          </h1>
          <p className="text-xl text-gray-600">
            Comprehensive comparison of algorithms for fitness prediction and recommendations
          </p>
        </div>

        {/* Best Models Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🏆 Best Performing Models</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-blue-900 mb-3">Calories Prediction</h3>
              <div className="space-y-2">
                <p className="text-blue-800">
                  <span className="font-semibold">Algorithm:</span> {bestModels.calories.algorithm}
                </p>
                <p className="text-blue-800">
                  <span className="font-semibold">R² Score:</span> {bestModels.calories.r2.toFixed(4)}
                </p>
                <p className="text-blue-800">
                  <span className="font-semibold">RMSE:</span> {bestModels.calories.rmse.toFixed(2)}
                </p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-green-900 mb-3">Weight Prediction</h3>
              <div className="space-y-2">
                <p className="text-green-800">
                  <span className="font-semibold">Algorithm:</span> {bestModels.weight.algorithm}
                </p>
                <p className="text-green-800">
                  <span className="font-semibold">R² Score:</span> {bestModels.weight.r2.toFixed(4)}
                </p>
                <p className="text-green-800">
                  <span className="font-semibold">RMSE:</span> {bestModels.weight.rmse.toFixed(2)}
                </p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-purple-900 mb-3">Workout Recommendation</h3>
              <div className="space-y-2">
                <p className="text-purple-800">
                  <span className="font-semibold">Algorithm:</span> {bestModels.recommendation.algorithm}
                </p>
                <p className="text-purple-800">
                  <span className="font-semibold">F1 Score:</span> {bestModels.recommendation.f1.toFixed(4)}
                </p>
                <p className="text-purple-800">
                  <span className="font-semibold">Accuracy:</span> {bestModels.recommendation.accuracy.toFixed(4)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('comparison')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'comparison'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overall Comparison
              </button>
              <button
                onClick={() => setActiveTab('calories')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'calories'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Calories Models
              </button>
              <button
                onClick={() => setActiveTab('weight')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'weight'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Weight Models
              </button>
              <button
                onClick={() => setActiveTab('recommendation')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'recommendation'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Recommendation Models
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'comparison' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Algorithm Performance Comparison</h3>
                
                {/* Regression R² Score */}
                <div className="mb-8">
                  <h4 className="text-lg font-medium text-gray-800 mb-4">Regression R² Score Comparison</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={comparisonDataReg}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 1]} />
                      <Tooltip formatter={(value: number) => [value.toFixed(4), 'R² Score']} />
                      <Legend />
                      <Bar dataKey="calories_r2" fill="#3B82F6" name="Calories" />
                      <Bar dataKey="weight_r2" fill="#10B981" name="Weight" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Regression RMSE */}
                <div className="mb-8">
                  <h4 className="text-lg font-medium text-gray-800 mb-4">Regression RMSE Comparison</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={comparisonDataReg}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => [value.toFixed(2), 'RMSE']} />
                      <Legend />
                      <Bar dataKey="calories_rmse" fill="#EF4444" name="Calories RMSE" />
                      <Bar dataKey="weight_rmse" fill="#F59E0B" name="Weight RMSE" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Classification F1 and Accuracy */}
                <div className="mb-8">
                  <h4 className="text-lg font-medium text-gray-800 mb-4">Classification Performance (Recommendation)</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={comparisonDataClass}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 1]} />
                      <Tooltip formatter={(value: number) => [value.toFixed(4), 'Score']} />
                      <Legend />
                      <Bar dataKey="f1" fill="#8B5CF6" name="F1 Score" />
                      <Bar dataKey="accuracy" fill="#EC4899" name="Accuracy" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Regression Summary Table */}
                <div className="overflow-x-auto mb-8">
                  <h4 className="text-lg font-medium text-gray-800 mb-4">Regression Performance Summary</h4>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Algorithm</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Calories R²</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight R²</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg R²</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recommendation</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {comparisonDataReg.map((algo, index) => {
                        const avgR2 = (algo.calories_r2 + algo.weight_r2) / 2;
                        const isBest = avgR2 === Math.max(...comparisonDataReg.map(d => (d.calories_r2 + d.weight_r2) / 2));
                        return (
                          <tr key={index} className={isBest ? 'bg-green-50' : ''}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {algo.name}{isBest && <span className="ml-2 text-green-600">🏆</span>}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{algo.calories_r2.toFixed(4)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{algo.weight_r2.toFixed(4)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{avgR2.toFixed(4)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{isBest ? 'Recommended' : 'Alternative'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Classification Summary Table */}
                <div className="overflow-x-auto">
                  <h4 className="text-lg font-medium text-gray-800 mb-4">Classification Performance Summary</h4>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Algorithm</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accuracy</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precision</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recall</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">F1 Score</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recommendation</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {results.filter((r): r is ClassificationResult => r.type === 'recommendation').map((algo, index) => {
                        const isBest = algo.f1 === Math.max(...(results.filter(r => r.type === 'recommendation') as ClassificationResult[]).map(d => d.f1));
                        return (
                          <tr key={index} className={isBest ? 'bg-green-50' : ''}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {algo.algorithm}{isBest && <span className="ml-2 text-green-600">🏆</span>}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{algo.accuracy.toFixed(4)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{algo.precision.toFixed(4)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{algo.recall.toFixed(4)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{algo.f1.toFixed(4)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{isBest ? 'Recommended' : 'Alternative'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'calories' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Calories Prediction Models</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  {results.filter((r): r is RegressionResult => r.type === 'calories').map((result, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">{result.algorithm}</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-500">R² Score</p>
                          <p className="text-2xl font-bold text-blue-600">{result.r2.toFixed(4)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500">RMSE</p>
                          <p className="text-2xl font-bold text-red-600">{result.rmse.toFixed(2)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500">MAE</p>
                          <p className="text-2xl font-bold text-orange-600">{result.mae.toFixed(2)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500">MSE</p>
                          <p className="text-2xl font-bold text-purple-600">{result.mse.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'weight' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Weight Prediction Models</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  {results.filter((r): r is RegressionResult => r.type === 'weight').map((result, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">{result.algorithm}</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-500">R² Score</p>
                          <p className="text-2xl font-bold text-blue-600">{result.r2.toFixed(4)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500">RMSE</p>
                          <p className="text-2xl font-bold text-red-600">{result.rmse.toFixed(2)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500">MAE</p>
                          <p className="text-2xl font-bold text-orange-600">{result.mae.toFixed(2)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500">MSE</p>
                          <p className="text-2xl font-bold text-purple-600">{result.mse.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'recommendation' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Workout Recommendation Models</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  {results.filter((r): r is ClassificationResult => r.type === 'recommendation').map((result, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">{result.algorithm}</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Accuracy</p>
                          <p className="text-2xl font-bold text-blue-600">{result.accuracy.toFixed(4)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Precision</p>
                          <p className="text-2xl font-bold text-green-600">{result.precision.toFixed(4)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Recall</p>
                          <p className="text-2xl font-bold text-orange-600">{result.recall.toFixed(4)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500">F1 Score</p>
                          <p className="text-2xl font-bold text-purple-600">{result.f1.toFixed(4)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Analysis & Recommendations */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Analysis & Recommendations</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Regression Key Findings</h3>
              <ul className="space-y-2 text-blue-800">
                <li>• <strong>Gradient Boosting</strong> shows the best overall performance</li>
                <li>• <strong>Random Forest</strong> provides good balance of accuracy and interpretability</li>
                <li>• <strong>Linear Regression</strong> performs well for baseline</li>
                <li>• <strong>SVM</strong> competitive but may require more computational resources</li>
              </ul>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-purple-900 mb-3">Classification Key Findings</h3>
              <ul className="space-y-2 text-purple-800">
                <li>• <strong>Gradient Boosting</strong> achieves highest F1 score</li>
                <li>• <strong>Random Forest</strong> close second with good balance</li>
                <li>• <strong>SVM</strong> performs well on balanced datasets</li>
                <li>• <strong>Logistic Regression</strong> good for interpretability</li>
              </ul>
            </div>
            
            <div className="bg-green-50 rounded-lg p-6 md:col-span-2">
              <h3 className="text-lg font-semibold text-green-900 mb-3">Implementation Recommendations</h3>
              <ul className="space-y-2 text-green-800">
                <li>• Use <strong>Gradient Boosting</strong> for production predictions and recommendations</li>
                <li>• Implement ensemble of top models for improved robustness</li>
                <li>• Monitor performance with real user data and retrain periodically</li>
                <li>• Use <strong>Linear Regression/Logistic</strong> for quick prototypes</li>
                <li>• Conduct A/B testing to validate model improvements</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelResults;