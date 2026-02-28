import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Target, 
  Users, 
  Activity,
  Calendar,
  Filter,
  Download
} from 'lucide-react';
import { useWorkspaceStore } from '../../state/workspaceStore';
import { aiService, type AIInsight } from '../../services/aiService';
import './AnalyticsDashboard.css';

interface AnalyticsData {
  totalCards: number;
  completedCards: number;
  inProgressCards: number;
  todoCards: number;
  completionRate: number;
  averageTimeToComplete: number;
  productivityScore: number;
  columnDistribution: Record<string, number>;
  dailyActivity: Array<{ date: string; completed: number; created: number }>;
  insights: AIInsight[];
}

const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'overview' | 'productivity' | 'trends'>('overview');

  const workspace = useWorkspaceStore((state) => state.workspace);

  useEffect(() => {
    loadAnalytics();
  }, [workspace, timeRange]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const analyticsData = await calculateAnalytics();
      const insights = await aiService.generateInsights(workspace);
      
      setData({
        ...analyticsData,
        insights
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAnalytics = async (): Promise<Omit<AnalyticsData, 'insights'>> => {
    const allCards = workspace.pages.flatMap(page => 
      page.board.columns.flatMap(column => column.cards)
    );

    const totalCards = allCards.length;
    const completedCards = allCards.filter(card => card.status === 'done').length;
    const inProgressCards = allCards.filter(card => card.status === 'in-progress').length;
    const todoCards = allCards.filter(card => card.status === 'todo').length;
    
    const completionRate = totalCards > 0 ? completedCards / totalCards : 0;
    
    // Calculate average time to complete (mock calculation)
    const averageTimeToComplete = calculateAverageCompletionTime(allCards);
    
    // Calculate productivity score
    const productivityScore = calculateProductivityScore(completionRate, averageTimeToComplete);
    
    // Column distribution
    const columnDistribution = calculateColumnDistribution();
    
    // Daily activity (mock data for demonstration)
    const dailyActivity = generateDailyActivity(timeRange);

    return {
      totalCards,
      completedCards,
      inProgressCards,
      todoCards,
      completionRate,
      averageTimeToComplete,
      productivityScore,
      columnDistribution,
      dailyActivity
    };
  };

  const calculateAverageCompletionTime = (cards: any[]): number => {
    // In a real implementation, this would calculate actual time differences
    // For now, returning a mock value
    return 3.5; // days
  };

  const calculateProductivityScore = (completionRate: number, avgTime: number): number => {
    // Simple productivity score calculation
    const rateScore = completionRate * 100;
    const timeScore = Math.max(0, 100 - (avgTime * 10));
    return Math.round((rateScore + timeScore) / 2);
  };

  const calculateColumnDistribution = (): Record<string, number> => {
    const distribution: Record<string, number> = {};
    
    workspace.pages.forEach(page => {
      page.board.columns.forEach(column => {
        distribution[column.title] = (distribution[column.title] || 0) + column.cards.length;
      });
    });

    return distribution;
  };

  const generateDailyActivity = (range: '7d' | '30d' | '90d') => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const activity = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      activity.push({
        date: date.toISOString().split('T')[0],
        completed: Math.floor(Math.random() * 5),
        created: Math.floor(Math.random() * 8)
      });
    }

    return activity;
  };

  const exportAnalytics = () => {
    if (!data) return;

    const exportData = {
      generatedAt: new Date().toISOString(),
      timeRange,
      metrics: data,
      workspace: {
        title: workspace.title,
        pages: workspace.pages.length,
        totalCards: data.totalCards
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workspace-analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="analytics-dashboard loading">
        <div className="loading-spinner" />
        <span>Loading analytics...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="analytics-dashboard empty">
        <BarChart3 size={48} />
        <h3>No analytics data available</h3>
        <p>Start adding tasks to see your productivity insights</p>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      {/* Header */}
      <div className="analytics-header">
        <div className="header-content">
          <h2>Analytics Dashboard</h2>
          <p>Track your productivity and workflow insights</p>
        </div>
        
        <div className="header-actions">
          <div className="time-range-selector">
            <Calendar size={16} />
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
          
          <button onClick={exportAnalytics} className="export-btn">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Metric Tabs */}
      <div className="metric-tabs">
        {(['overview', 'productivity', 'trends'] as const).map(metric => (
          <button
            key={metric}
            onClick={() => setSelectedMetric(metric)}
            className={`metric-tab ${selectedMetric === metric ? 'active' : ''}`}
          >
            {metric.charAt(0).toUpperCase() + metric.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Metrics */}
      {selectedMetric === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="overview-metrics"
        >
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon">
                <Target size={24} />
              </div>
              <div className="metric-content">
                <h3>Total Tasks</h3>
                <div className="metric-value">{data.totalCards}</div>
                <div className="metric-change positive">
                  +12% from last month
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">
                <TrendingUp size={24} />
              </div>
              <div className="metric-content">
                <h3>Completion Rate</h3>
                <div className="metric-value">{Math.round(data.completionRate * 100)}%</div>
                <div className="metric-change positive">
                  +5% from last month
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">
                <Clock size={24} />
              </div>
              <div className="metric-content">
                <h3>Avg. Completion Time</h3>
                <div className="metric-value">{data.averageTimeToComplete} days</div>
                <div className="metric-change negative">
                  +0.5 days from last month
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">
                <Activity size={24} />
              </div>
              <div className="metric-content">
                <h3>Productivity Score</h3>
                <div className="metric-value">{data.productivityScore}</div>
                <div className="metric-change positive">
                  +8 points from last month
                </div>
              </div>
            </div>
          </div>

          {/* Status Distribution */}
          <div className="status-distribution">
            <h3>Task Status Distribution</h3>
            <div className="status-bars">
              <div className="status-bar">
                <div className="status-label">To Do</div>
                <div className="status-progress">
                  <div 
                    className="progress-fill todo" 
                    style={{ width: `${(data.todoCards / data.totalCards) * 100}%` }}
                  />
                </div>
                <div className="status-count">{data.todoCards}</div>
              </div>

              <div className="status-bar">
                <div className="status-label">In Progress</div>
                <div className="status-progress">
                  <div 
                    className="progress-fill in-progress" 
                    style={{ width: `${(data.inProgressCards / data.totalCards) * 100}%` }}
                  />
                </div>
                <div className="status-count">{data.inProgressCards}</div>
              </div>

              <div className="status-bar">
                <div className="status-label">Completed</div>
                <div className="status-progress">
                  <div 
                    className="progress-fill completed" 
                    style={{ width: `${(data.completedCards / data.totalCards) * 100}%` }}
                  />
                </div>
                <div className="status-count">{data.completedCards}</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* AI Insights */}
      <div className="ai-insights">
        <h3>AI-Powered Insights</h3>
        <div className="insights-grid">
          {data.insights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`insight-card ${insight.impact}`}
            >
              <div className="insight-header">
                <h4>{insight.title}</h4>
                <span className="impact-badge">{insight.impact}</span>
              </div>
              <p>{insight.description}</p>
              {insight.actionable && (
                <button className="action-btn">
                  Take Action
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
