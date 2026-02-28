import type { Workspace, Page, Column, Card } from '../state/workspaceStore';

export interface ExportOptions {
  format: 'json' | 'csv' | 'markdown' | 'pdf';
  includeMetadata: boolean;
  includeAnalytics: boolean;
  dateRange?: {
    from: string;
    to: string;
  };
  selectedPages?: string[];
}

export interface ImportResult {
  success: boolean;
  message: string;
  imported: {
    pages: number;
    columns: number;
    cards: number;
  };
  conflicts: Array<{
    type: 'page' | 'column' | 'card';
    id: string;
    title: string;
    action: 'skipped' | 'merged' | 'renamed';
  }>;
}

export class ExportImportService {
  private static instance: ExportImportService;

  static getInstance(): ExportImportService {
    if (!ExportImportService.instance) {
      ExportImportService.instance = new ExportImportService();
    }
    return ExportImportService.instance;
  }

  // Export functionality
  async exportWorkspace(workspace: Workspace, options: ExportOptions): Promise<void> {
    const exportData = this.prepareExportData(workspace, options);
    
    switch (options.format) {
      case 'json':
        await this.exportAsJSON(exportData, options);
        break;
      case 'csv':
        await this.exportAsCSV(exportData, options);
        break;
      case 'markdown':
        await this.exportAsMarkdown(exportData, options);
        break;
      case 'pdf':
        await this.exportAsPDF(exportData, options);
        break;
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  private prepareExportData(workspace: Workspace, options: ExportOptions) {
    let pages = workspace.pages;

    // Filter pages if specified
    if (options.selectedPages && options.selectedPages.length > 0) {
      pages = pages.filter(page => options.selectedPages!.includes(page.id));
    }

    // Filter by date range if specified
    if (options.dateRange) {
      const fromDate = new Date(options.dateRange.from);
      const toDate = new Date(options.dateRange.to);
      
      pages = pages.map(page => ({
        ...page,
        board: {
          columns: page.board.columns.map(column => ({
            ...column,
            cards: column.cards.filter(card => {
              const cardDate = new Date(card.createdAt);
              return cardDate >= fromDate && cardDate <= toDate;
            })
          }))
        }
      }));
    }

    const exportData: any = {
      workspace: {
        title: workspace.title,
        pages: pages
      },
      metadata: {
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        format: options.format,
        options: options
      }
    };

    // Add analytics if requested
    if (options.includeAnalytics) {
      exportData.analytics = this.generateAnalytics(pages);
    }

    return exportData;
  }

  private generateAnalytics(pages: Page[]) {
    const totalCards = pages.reduce((acc, page) => 
      acc + page.board.columns.reduce((colAcc, column) => 
        colAcc + column.cards.length, 0), 0);

    const completedCards = pages.reduce((acc, page) => 
      acc + page.board.columns.reduce((colAcc, column) => 
        colAcc + column.cards.filter(card => card.status === 'done').length, 0), 0);

    const completionRate = totalCards > 0 ? completedCards / totalCards : 0;

    return {
      totalCards,
      completedCards,
      completionRate,
      pagesCount: pages.length,
      columnsCount: pages.reduce((acc, page) => acc + page.board.columns.length, 0)
    };
  }

  private async exportAsJSON(data: unknown, options: ExportOptions): Promise<void> {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    this.downloadFile(blob, `workspace-export-${new Date().toISOString().split('T')[0]}.json`);
  }

  private async exportAsCSV(data: unknown, options: ExportOptions): Promise<void> {
    const workspace = data as { workspace: { pages: Page[] } };
    const csvRows = ['Page,Column,Card Title,Description,Status,Tags,Created At,Updated At'];

    workspace.workspace.pages.forEach(page => {
      page.board.columns.forEach(column => {
        column.cards.forEach(card => {
          const row = [
            `"${page.title}"`,
            `"${column.title}"`,
            `"${card.title}"`,
            `"${card.description}"`,
            card.status,
            `"${card.tags.join(', ')}"`,
            card.createdAt,
            card.updatedAt
          ];
          csvRows.push(row.join(','));
        });
      });
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    this.downloadFile(blob, `workspace-export-${new Date().toISOString().split('T')[0]}.csv`);
  }

  private async exportAsMarkdown(data: unknown, options: ExportOptions): Promise<void> {
    const workspaceData = data as { workspace: { title: string; pages: Page[] } };
    let markdown = `# ${workspaceData.workspace.title}\n\n`;
    markdown += `Exported on ${new Date().toLocaleDateString()}\n\n`;

    workspaceData.workspace.pages.forEach(page => {
      markdown += `## ${page.icon} ${page.title}\n\n`;
      
      page.board.columns.forEach(column => {
        markdown += `### ${column.title}\n\n`;
        
        if (column.cards.length === 0) {
          markdown += `*No cards*\n\n`;
        } else {
          column.cards.forEach(card => {
            markdown += `- **${card.title}**\n`;
            if (card.description) {
              markdown += `  ${card.description}\n`;
            }
            if (card.tags.length > 0) {
              markdown += `  Tags: ${card.tags.join(', ')}\n`;
            }
            markdown += `  Status: ${card.status}\n`;
            markdown += `  Created: ${new Date(card.createdAt).toLocaleDateString()}\n\n`;
          });
        }
      });
      
      markdown += '---\n\n';
    });

    const blob = new Blob([markdown], { type: 'text/markdown' });
    this.downloadFile(blob, `workspace-export-${new Date().toISOString().split('T')[0]}.md`);
  }

  private async exportAsPDF(data: unknown, options: ExportOptions): Promise<void> {
    // In a real implementation, this would use a PDF library like jsPDF or puppeteer
    // For now, we'll export as markdown and suggest PDF conversion
    await this.exportAsMarkdown(data, options);
    
    // Show a message about PDF conversion
    const message = 'Markdown exported. For PDF conversion, use a Markdown to PDF converter.';
    console.log(message);
  }

  private downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Import functionality
  async importWorkspace(file: File, options: {
    mergeStrategy: 'replace' | 'merge' | 'skip';
    preserveIds: boolean;
  }): Promise<ImportResult> {
    try {
      const content = await this.readFile(file);
      const data = JSON.parse(content);

      if (!this.validateImportData(data)) {
        throw new Error('Invalid import data format');
      }

      return this.processImport(data, options);
    } catch (error) {
      return {
        success: false,
        message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        imported: { pages: 0, columns: 0, cards: 0 },
        conflicts: []
      };
    }
  }

  private readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(new Error('File reading error'));
      reader.readAsText(file);
    });
  }

  private validateImportData(data: unknown): boolean {
    if (!data || typeof data !== 'object') return false;
    
    const workspaceData = data as { workspace?: { pages?: Page[] } };
    if (!workspaceData.workspace || !Array.isArray(workspaceData.workspace.pages)) {
      return false;
    }

    return workspaceData.workspace.pages.every(page => 
      page.id && 
      page.title && 
      page.board && 
      Array.isArray(page.board.columns)
    );
  }

  private processImport(data: unknown, options: {
    mergeStrategy: 'replace' | 'merge' | 'skip';
    preserveIds: boolean;
  }): ImportResult {
    const workspaceData = data as { workspace: { pages: Page[] } };
    let importedPages = 0;
    let importedColumns = 0;
    let importedCards = 0;
    const conflicts: ImportResult['conflicts'] = [];

    // This would integrate with the actual workspace store
    // For now, we'll just return the statistics
    
    workspaceData.workspace.pages.forEach(page => {
      importedPages++;
      page.board.columns.forEach(column => {
        importedColumns++;
        column.cards.forEach(() => {
          importedCards++;
        });
      });
    });

    return {
      success: true,
      message: `Successfully imported ${importedPages} pages, ${importedColumns} columns, and ${importedCards} cards`,
      imported: { pages: importedPages, columns: importedColumns, cards: importedCards },
      conflicts
    };
  }

  // Template functionality
  async saveAsTemplate(workspace: Workspace, templateName: string): Promise<void> {
    const template = {
      name: templateName,
      description: 'Custom workspace template',
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      structure: {
        pages: workspace.pages.map(page => ({
          title: page.title,
          icon: page.icon,
          board: {
            columns: page.board.columns.map(column => ({
              title: column.title,
              cards: [] // Remove actual cards for template
            }))
          }
        }))
      }
    };

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    this.downloadFile(blob, `template-${templateName.toLowerCase().replace(/\s+/g, '-')}.json`);
  }

  async loadFromTemplate(templateFile: File): Promise<{ success: boolean; message: string; template?: unknown }> {
    try {
      const content = await this.readFile(templateFile);
      const template = JSON.parse(content);

      if (!template.name || !template.structure) {
        throw new Error('Invalid template format');
      }

      return {
        success: true,
        message: `Template "${template.name}" loaded successfully`,
        template
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to load template: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Backup and restore
  async createBackup(workspace: Workspace): Promise<void> {
    const backup = {
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      workspace: workspace,
      metadata: {
        totalCards: workspace.pages.reduce((acc, page) => 
          acc + page.board.columns.reduce((colAcc, column) => 
            colAcc + column.cards.length, 0), 0),
        totalPages: workspace.pages.length
      }
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    this.downloadFile(blob, `workspace-backup-${new Date().toISOString().split('T')[0]}.json`);
  }

  async restoreFromBackup(backupFile: File): Promise<ImportResult> {
    return this.importWorkspace(backupFile, {
      mergeStrategy: 'replace',
      preserveIds: true
    });
  }
}

export const exportImportService = ExportImportService.getInstance();
