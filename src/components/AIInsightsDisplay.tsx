'use client';

import { AIInsight } from '@/lib/aiInsights';

interface AIInsightsDisplayProps {
  insights: AIInsight[];
}

export default function AIInsightsDisplay({ insights }: AIInsightsDisplayProps) {
  if (insights.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="glass-panel p-8 text-center animate-fade-in-up">
          <div className="text-white/60 mb-6">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-3">No AI Insights Available</h3>
          <p className="text-white/70">Add a business description to get personalized AI recommendations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="glass-panel p-8 animate-fade-in-up">
        <div className="flex items-center mb-8">
          <div className="flex-shrink-0">
            <svg className="h-8 w-8 text-electric-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="ml-4 text-2xl font-bold text-white tracking-tight">AI Strategy Insights</h3>
        </div>

        <div className="space-y-6">
          {insights.map((insight, index) => (
            <div
              key={index}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <InsightCard insight={insight} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InsightCard({ insight }: { insight: AIInsight }) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-white/10 text-white/80 border-white/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'cost_comparison':
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'risk_assessment':
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'optimization':
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'recommendation':
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'cost_comparison': return 'Cost Analysis';
      case 'risk_assessment': return 'Risk Assessment';
      case 'optimization': return 'Optimization';
      case 'recommendation': return 'Recommendation';
      default: return 'Insight';
    }
  };

  return (
    <div className={`border rounded-xl p-6 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${getPriorityColor(insight.priority)} group`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="flex-shrink-0 mr-4 transition-transform duration-300 group-hover:scale-110">
            {getTypeIcon(insight.type)}
          </div>
          <div>
            <h4 className="font-bold text-lg text-white mb-2">{insight.title}</h4>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-electric-lime">
                {getTypeName(insight.type)}
              </span>
              <span className="text-sm text-white/70">
                Priority: {insight.priority.charAt(0).toUpperCase() + insight.priority.slice(1)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center text-sm text-white/80">
          <span className="mr-3">Confidence:</span>
          <div className="flex items-center">
            <div className="w-16 bg-white/20 rounded-full h-2 mr-3 overflow-hidden">
              <div 
                className="bg-electric-lime h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${insight.confidenceScore * 100}%` }}
              />
            </div>
            <span className="font-semibold text-electric-lime">
              {Math.round(insight.confidenceScore * 100)}%
            </span>
          </div>
        </div>
      </div>

      <p className="text-lg leading-relaxed mb-4 text-white/90">{insight.message}</p>

      {insight.actionable && (
        <div className="flex items-center text-sm font-medium text-electric-lime">
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Actionable Insight
        </div>
      )}
    </div>
  );
} 