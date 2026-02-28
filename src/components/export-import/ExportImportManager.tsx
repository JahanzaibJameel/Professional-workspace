import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  Upload, 
  FileText, 
  Database, 
  FileSpreadsheet,
  BookOpen,
  Settings,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';
import { useWorkspaceStore } from '../../state/workspaceStore';
import { exportImportService, type ExportOptions, type ImportResult } from '../../services/exportImportService';
import './ExportImportManager.css';

const ExportImportManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'templates'>('export');
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'json',
    includeMetadata: true,
    includeAnalytics: true,
    dateRange: null,
    selectedPages: []
  });
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const workspace = useWorkspaceStore((state) => state.workspace);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportImportService.exportWorkspace(workspace, exportOptions);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const result = await exportImportService.importWorkspace(file, {
        mergeStrategy: 'merge',
        preserveIds: false
      });
      setImportResult(result);
    } catch (error) {
      console.error('Import failed:', error);
      setImportResult({
        success: false,
        message: 'Import failed. Please check the file format.',
        imported: { pages: 0, columns: 0, cards: 0 },
        conflicts: []
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const saveAsTemplate = async () => {
    const templateName = prompt('Enter template name:');
    if (!templateName) return;

    try {
      await exportImportService.saveAsTemplate(workspace, templateName);
    } catch (error) {
      console.error('Template save failed:', error);
    }
  };

  const createBackup = async () => {
    try {
      await exportImportService.createBackup(workspace);
    } catch (error) {
      console.error('Backup creation failed:', error);
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'json': return <Database size={20} />;
      case 'csv': return <FileSpreadsheet size={20} />;
      case 'markdown': return <FileText size={20} />;
      case 'pdf': return <FileText size={20} />;
      default: return <FileText size={20} />;
    }
  };

  const getFormatDescription = (format: string) => {
    switch (format) {
      case 'json': return 'Complete workspace data with all metadata';
      case 'csv': return 'Tabular format for spreadsheet applications';
      case 'markdown': return 'Human-readable documentation format';
      case 'pdf': return 'Formatted document for sharing';
      default: return '';
    }
  };

  return (
    <div className="export-import-manager">
      <div className="manager-header">
        <h2>Data Management</h2>
        <p>Export, import, and manage your workspace data</p>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        {(['export', 'import', 'templates'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`tab-button ${activeTab === tab ? 'active' : ''}`}
          >
            {tab === 'export' && <Download size={16} />}
            {tab === 'import' && <Upload size={16} />}
            {tab === 'templates' && <BookOpen size={16} />}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Export Tab */}
      {activeTab === 'export' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="tab-content"
        >
          <div className="export-section">
            <h3>Export Options</h3>
            
            {/* Format Selection */}
            <div className="format-selection">
              <label className="section-label">Export Format</label>
              <div className="format-grid">
                {(['json', 'csv', 'markdown', 'pdf'] as const).map(format => (
                  <button
                    key={format}
                    onClick={() => setExportOptions(prev => ({ ...prev, format }))}
                    className={`format-option ${exportOptions.format === format ? 'active' : ''}`}
                  >
                    <div className="format-icon">
                      {getFormatIcon(format)}
                    </div>
                    <div className="format-info">
                      <div className="format-name">{format.toUpperCase()}</div>
                      <div className="format-description">{getFormatDescription(format)}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Export Options */}
            <div className="export-options">
              <label className="section-label">Options</label>
              <div className="options-grid">
                <label className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeMetadata}
                    onChange={(e) => setExportOptions(prev => ({ 
                      ...prev, 
                      includeMetadata: e.target.checked 
                    }))}
                  />
                  <span>Include metadata and timestamps</span>
                </label>
                
                <label className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeAnalytics}
                    onChange={(e) => setExportOptions(prev => ({ 
                      ...prev, 
                      includeAnalytics: e.target.checked 
                    }))}
                  />
                  <span>Include analytics summary</span>
                </label>
              </div>
            </div>

            {/* Date Range */}
            <div className="date-range-section">
              <label className="section-label">Date Range (Optional)</label>
              <div className="date-inputs">
                <input
                  type="date"
                  value={exportOptions.dateRange?.from || ''}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    dateRange: {
                      from: e.target.value,
                      to: prev.dateRange?.to || ''
                    }
                  }))}
                  className="date-input"
                />
                <span>to</span>
                <input
                  type="date"
                  value={exportOptions.dateRange?.to || ''}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    dateRange: {
                      from: prev.dateRange?.from || '',
                      to: e.target.value
                    }
                  }))}
                  className="date-input"
                />
              </div>
            </div>

            {/* Export Actions */}
            <div className="export-actions">
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="export-button primary"
              >
                <Download size={16} />
                {isExporting ? 'Exporting...' : 'Export Workspace'}
              </button>
              
              <button
                onClick={createBackup}
                className="export-button secondary"
              >
                <Database size={16} />
                Create Backup
              </button>
              
              <button
                onClick={saveAsTemplate}
                className="export-button secondary"
              >
                <BookOpen size={16} />
                Save as Template
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Import Tab */}
      {activeTab === 'import' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="tab-content"
        >
          <div className="import-section">
            <h3>Import Workspace</h3>
            
            <div className="import-area">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.csv,.md"
                onChange={handleImport}
                className="file-input"
              />
              
              <div className="import-dropzone" onClick={() => fileInputRef.current?.click()}>
                <Upload size={48} />
                <h4>Drop file here or click to browse</h4>
                <p>Supported formats: JSON, CSV, Markdown</p>
              </div>
            </div>

            {/* Import Result */}
            <AnimatePresence>
              {importResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`import-result ${importResult.success ? 'success' : 'error'}`}
                >
                  <div className="result-header">
                    {importResult.success ? (
                      <CheckCircle size={20} />
                    ) : (
                      <AlertCircle size={20} />
                    )}
                    <span>{importResult.success ? 'Import Successful' : 'Import Failed'}</span>
                  </div>
                  
                  <div className="result-message">
                    {importResult.message}
                  </div>
                  
                  {importResult.success && (
                    <div className="result-stats">
                      <div className="stat">
                        <span className="stat-value">{importResult.imported.pages}</span>
                        <span className="stat-label">Pages</span>
                      </div>
                      <div className="stat">
                        <span className="stat-value">{importResult.imported.columns}</span>
                        <span className="stat-label">Columns</span>
                      </div>
                      <div className="stat">
                        <span className="stat-value">{importResult.imported.cards}</span>
                        <span className="stat-label">Cards</span>
                      </div>
                    </div>
                  )}
                  
                  {importResult.conflicts.length > 0 && (
                    <div className="conflicts">
                      <h5>Conflicts</h5>
                      {importResult.conflicts.map((conflict, index) => (
                        <div key={index} className="conflict-item">
                          <span className="conflict-type">{conflict.type}</span>
                          <span className="conflict-title">{conflict.title}</span>
                          <span className="conflict-action">{conflict.action}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <button
                    onClick={() => setImportResult(null)}
                    className="dismiss-result"
                  >
                    <X size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {isImporting && (
              <div className="import-progress">
                <div className="progress-spinner" />
                <span>Importing workspace...</span>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="tab-content"
        >
          <div className="templates-section">
            <h3>Workspace Templates</h3>
            
            <div className="templates-grid">
              <div className="template-card">
                <div className="template-icon">
                  <BookOpen size={32} />
                </div>
                <h4>Kanban Board</h4>
                <p>Classic kanban setup with To Do, In Progress, and Done columns</p>
                <button className="template-button">Use Template</button>
              </div>
              
              <div className="template-card">
                <div className="template-icon">
                  <Settings size={32} />
                </div>
                <h4>Project Management</h4>
                <p>Comprehensive project tracking with multiple stages and assignees</p>
                <button className="template-button">Use Template</button>
              </div>
              
              <div className="template-card">
                <div className="template-icon">
                  <FileText size={32} />
                </div>
                <h4>Content Creation</h4>
                <p>Workflow for writers and content creators with review stages</p>
                <button className="template-button">Use Template</button>
              </div>
            </div>
            
            <div className="template-actions">
              <button
                onClick={saveAsTemplate}
                className="template-button primary"
              >
                <BookOpen size={16} />
                Save Current as Template
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ExportImportManager;
