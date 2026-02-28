import type { Card, Column, Page, Workspace } from '../state/workspaceStore';

export interface AISuggestion {
  type: 'title' | 'description' | 'tags' | 'category' | 'priority';
  suggestion: string;
  confidence: number;
  reasoning?: string;
}

export interface AIInsight {
  type: 'productivity' | 'workflow' | 'collaboration' | 'trends';
  title: string;
  description: string;
  actionable: boolean;
  impact: 'low' | 'medium' | 'high';
}

export class AIService {
  private static instance: AIService;
  private cache = new Map<string, unknown>();

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  // Smart suggestions for card titles and descriptions
  async generateSuggestions(context: {
    pageTitle: string;
    columnTitle: string;
    existingCards: Card[];
    partialInput?: string;
  }): Promise<AISuggestion[]> {
    const cacheKey = JSON.stringify(context);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey) as AISuggestion[];
    }

    const suggestions: AISuggestion[] = [];

    // Generate title suggestions
    if (!context.partialInput || context.partialInput.length < 3) {
      suggestions.push(
        {
          type: 'title',
          suggestion: `Complete ${context.columnTitle.toLowerCase()} task`,
          confidence: 0.8,
          reasoning: 'Based on column context'
        },
        {
          type: 'title',
          suggestion: `Review project requirements`,
          confidence: 0.7,
          reasoning: 'Common task pattern'
        }
      );
    }

    // Generate tag suggestions
    const tagSuggestions = this.generateTagSuggestions(context.existingCards);
    suggestions.push(...tagSuggestions);

    this.cache.set(cacheKey, suggestions);
    return suggestions;
  }

  // Auto-categorization based on content
  async categorizeCard(card: Partial<Card>, context: {
    page: Page;
    column: Column;
  }): Promise<{
    suggestedTags: string[];
    suggestedStatus: 'todo' | 'in-progress' | 'done';
    suggestedPriority: 'low' | 'medium' | 'high';
    confidence: number;
  }> {
    const title = card.title?.toLowerCase() || '';
    const description = card.description?.toLowerCase() || '';
    const content = `${title} ${description}`;

    // Priority detection
    const priorityKeywords = {
      high: ['urgent', 'critical', 'asap', 'emergency', 'important', 'priority'],
      medium: ['soon', 'next', 'upcoming', 'scheduled', 'planned'],
      low: ['later', 'eventually', 'someday', 'maybe', 'consider']
    };

    let suggestedPriority: 'low' | 'medium' | 'high' = 'medium';
    let priorityConfidence = 0;

    for (const [priority, keywords] of Object.entries(priorityKeywords)) {
      const matches = keywords.filter(keyword => content.includes(keyword));
      if (matches.length > 0) {
        suggestedPriority = priority as 'low' | 'medium' | 'high';
        priorityConfidence = matches.length / keywords.length;
        break;
      }
    }

    // Status detection
    const statusKeywords = {
      'done': ['completed', 'finished', 'done', 'resolved', 'closed'],
      'in-progress': ['working', 'progress', 'currently', 'started', 'active'],
      'todo': ['todo', 'need', 'should', 'will', 'plan']
    };

    let suggestedStatus: 'todo' | 'in-progress' | 'done' = 'todo';
    for (const [status, keywords] of Object.entries(statusKeywords)) {
      if (keywords.some(keyword => content.includes(keyword))) {
        suggestedStatus = status as 'todo' | 'in-progress' | 'done';
        break;
      }
    }

    // Tag generation
    const suggestedTags = this.generateSmartTags(content);

    return {
      suggestedTags,
      suggestedStatus,
      suggestedPriority,
      confidence: Math.max(priorityConfidence, 0.5)
    };
  }

  // Generate insights about workspace productivity
  async generateInsights(workspace: Workspace): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];

    // Analyze card completion rates
    const totalCards = workspace.pages.reduce((acc: number, page: Page) => 
      acc + page.board.columns.reduce((colAcc: number, col: Column) => 
        colAcc + col.cards.length, 0), 0);

    const completedCards = workspace.pages.reduce((acc: number, page: Page) => 
      acc + page.board.columns.reduce((colAcc: number, col: Column) => 
        colAcc + col.cards.filter(card => card.status === 'done').length, 0), 0);

    const completionRate = totalCards > 0 ? completedCards / totalCards : 0;

    if (completionRate < 0.3) {
      insights.push({
        type: 'productivity',
        title: 'Low completion rate detected',
        description: `Only ${(completionRate * 100).toFixed(1)}% of tasks are completed. Consider breaking down large tasks or reviewing priorities.`,
        actionable: true,
        impact: 'high'
      });
    }

    // Analyze column distribution
    const columnAnalysis = this.analyzeColumnDistribution(workspace);
    if (columnAnalysis.unbalanced) {
      insights.push({
        type: 'workflow',
        title: 'Unbalanced workflow detected',
        description: 'Tasks seem to be stuck in certain columns. Consider reviewing your workflow process.',
        actionable: true,
        impact: 'medium'
      });
    }

    return insights;
  }

  private generateTagSuggestions(cards: Card[]): AISuggestion[] {
    const existingTags = cards.flatMap(card => card.tags);
    const tagFrequency: Record<string, number> = {};
    
    existingTags.forEach(tag => {
      tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
    });

    const commonTags = Object.entries(tagFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([tag]) => tag);

    return commonTags.map(tag => ({
      type: 'tags' as const,
      suggestion: tag,
      confidence: tagFrequency[tag] / cards.length,
      reasoning: 'Frequently used tag'
    }));
  }

  private generateSmartTags(content: string): string[] {
    const tags = new Set<string>();
    
    // Technology tags
    const techKeywords = ['react', 'typescript', 'javascript', 'css', 'html', 'api', 'database', 'frontend', 'backend'];
    techKeywords.forEach(tech => {
      if (content.includes(tech)) tags.add(tech);
    });

    // Task type tags
    const taskTypes = ['bug', 'feature', 'enhancement', 'documentation', 'testing', 'review'];
    taskTypes.forEach(type => {
      if (content.includes(type)) tags.add(type);
    });

    // Priority tags
    if (content.includes('urgent') || content.includes('critical')) tags.add('urgent');
    if (content.includes('review')) tags.add('review-needed');

    return Array.from(tags);
  }

  private analyzeColumnDistribution(workspace: Workspace): { unbalanced: boolean; details: { avgCardsPerColumn: number; columnSizes: number[][] } } {
    // Simple analysis - in real implementation would be more sophisticated
    const columnSizes = workspace.pages.map((page: Page) => 
      page.board.columns.map((col: Column) => col.cards.length)
    );

    const avgCardsPerColumn = columnSizes.flat().reduce((a: number, b: number) => a + b, 0) / 
                              columnSizes.flat().length;

    const unbalanced = columnSizes.flat().some((size: number) => 
      Math.abs(size - avgCardsPerColumn) > avgCardsPerColumn * 0.5
    );

    return { unbalanced, details: { avgCardsPerColumn, columnSizes } };
  }
}

export const aiService = AIService.getInstance();
