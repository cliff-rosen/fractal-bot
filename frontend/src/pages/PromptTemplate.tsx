import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePromptTemplates } from '../context/PromptTemplateContext';
import SchemaEditor from '../components/common/SchemaEditor';
import { extractTokens } from '../lib/utils';
import PromptMenuBar from '../components/workflow/PromptMenuBar';
import { PromptTemplateToken, PromptTemplateCreate, PromptTemplateUpdate, PromptTemplateTest } from '../types/prompts';
import { Schema, SchemaValueType } from '../types/schema';
import FileLibrary from '../components/FileLibrary';
import Dialog from '../components/common/Dialog';
import { fileApi } from '../lib/api/fileApi';

const defaultOutputSchema: Schema = {
    type: 'string',
    is_array: false,
    description: 'Default output'
};

const PromptTemplate: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        templates,
        selectedTemplate: template,
        setSelectedTemplate,
        createTemplate,
        updateTemplate,
        testTemplate,
        refreshTemplates
    } = usePromptTemplates();

    // State
    const [name, setName] = useState(template?.name || '');
    const [description, setDescription] = useState(template?.description || '');
    const [userMessageTemplate, setUserMessageTemplate] = useState(template?.user_message_template || '');
    const [systemMessageTemplate, setSystemMessageTemplate] = useState(template?.system_message_template || '');
    const [tokens, setTokens] = useState<PromptTemplateToken[]>(template?.tokens || []);
    const [outputSchema, setOutputSchema] = useState<Schema>(template?.output_schema || defaultOutputSchema);
    const [testParameters, setTestParameters] = useState<Record<string, string>>({});
    const [testResult, setTestResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showFileSelector, setShowFileSelector] = useState(false);
    const [selectedTokenName, setSelectedTokenName] = useState<string | null>(null);
    const [fileNames, setFileNames] = useState<Record<string, string>>({});

    // Add refs for focus management
    const nameInputRef = React.useRef<HTMLInputElement>(null);
    const userMessageRef = React.useRef<HTMLTextAreaElement>(null);

    // Initialize template based on URL parameter
    useEffect(() => {
        console.log('Template ID:', id);

        if (!id) {
            console.log('No template ID, navigating to id');
            navigate(`/prompts/${id}`);
            return;
        } else {
            console.log('No template ID or id:', id);
        }

        if (!id) {
            console.log('No template ID, navigating to /prompts');
            navigate('/prompts');
            return;
        }

        // Only load if we don't have this template or it's a different one
        if (!template || (template?.template_id !== id)) {
            const loadTemplate = async () => {
                try {
                    if (id === 'new') {
                        // Initialize new template with default values
                        setSelectedTemplate(null);
                        setName('');
                        setDescription('');
                        setUserMessageTemplate('');
                        setSystemMessageTemplate('');
                        setTokens([]);
                        setOutputSchema(defaultOutputSchema);
                        setTestParameters({});
                    } else {
                        const foundTemplate = templates.find(t => t.template_id === id);
                        if (foundTemplate) {
                            setSelectedTemplate(foundTemplate);
                            setName(foundTemplate.name);
                            setDescription(foundTemplate.description || '');
                            setUserMessageTemplate(foundTemplate.user_message_template);
                            setSystemMessageTemplate(foundTemplate.system_message_template || '');
                            setTokens(foundTemplate.tokens);
                            setOutputSchema(foundTemplate.output_schema);
                            const newParams: Record<string, string> = {};
                            foundTemplate.tokens.forEach(token => {
                                newParams[token.name] = '';
                            });
                            setTestParameters(newParams);
                        } else {
                            setError('Template not found');
                            navigate('/prompts');
                        }
                    }
                } catch (err) {
                    console.error('Error loading template:', err);
                    setError('Failed to load template');
                    navigate('/prompts');
                }
            };
            loadTemplate();
        }
    }, [id, navigate, templates, template, setSelectedTemplate]);

    // Update test parameters when template text changes
    useEffect(() => {
        const userTokens = extractTokens(userMessageTemplate);
        const systemTokens = extractTokens(systemMessageTemplate || '');

        // Merge tokens, keeping only unique ones by name
        const allTokens = [...userTokens, ...systemTokens].reduce((acc, token) => {
            if (!acc.find(t => t.name === token.name)) {
                acc.push(token);
            }
            return acc;
        }, [] as PromptTemplateToken[]);

        const newParams: Record<string, string> = {};
        allTokens.forEach(token => {
            // Preserve existing values if they exist
            newParams[token.name] = testParameters[token.name] || '';
        });
        setTestParameters(newParams);
        setTokens(allTokens);
    }, [userMessageTemplate, systemMessageTemplate]);

    // Update hasUnsavedChanges when form values change
    useEffect(() => {
        if (!template) {
            setHasUnsavedChanges(
                name !== '' ||
                description !== '' ||
                userMessageTemplate !== '' ||
                systemMessageTemplate !== ''
            );
            return;
        }

        setHasUnsavedChanges(
            name !== template.name ||
            description !== template.description ||
            userMessageTemplate !== template.user_message_template ||
            systemMessageTemplate !== (template.system_message_template || '') ||
            JSON.stringify(outputSchema) !== JSON.stringify(template.output_schema)
        );
    }, [template, name, description, userMessageTemplate, systemMessageTemplate, outputSchema]);

    // Prompt user before leaving if there are unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges]);

    // Load file names for file values
    useEffect(() => {
        const loadFileNames = async () => {
            const newFileNames: Record<string, string> = {};
            for (const [tokenName, value] of Object.entries(testParameters)) {
                if (tokens.find(t => t.name === tokenName)?.type === 'file' && value) {
                    try {
                        const fileInfo = await fileApi.getFile(value);
                        newFileNames[value] = fileInfo.name;
                    } catch (err) {
                        console.error('Error loading file name:', err);
                    }
                }
            }
            setFileNames(newFileNames);
        };
        loadFileNames();
    }, [testParameters, tokens]);

    // Focus management effect
    useEffect(() => {
        if (id === 'new') {
            // Focus name input for new templates
            nameInputRef.current?.focus();
        } else if (template) {
            // Focus user message for existing templates
            userMessageRef.current?.focus();
        }
    }, [id, template]);

    const handleBack = async () => {
        if (hasUnsavedChanges) {
            const shouldSave = window.confirm('You have unsaved changes. Do you want to save before leaving?');
            if (shouldSave) {
                try {
                    await handleSave();
                    setSelectedTemplate(null);
                    navigate('/prompts');
                } catch (err) {
                    console.error('Error saving template:', err);
                    if (window.confirm('Failed to save changes. Leave anyway?')) {
                        setSelectedTemplate(null);
                        navigate('/prompts');
                    }
                }
            } else {
                setSelectedTemplate(null);
                navigate('/prompts');
            }
        } else {
            setSelectedTemplate(null);
            navigate('/prompts');
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);

            const templateData: PromptTemplateCreate | PromptTemplateUpdate = {
                name,
                description,
                user_message_template: userMessageTemplate,
                system_message_template: systemMessageTemplate,
                tokens,
                output_schema: outputSchema,
                ...(template?.template_id ? { template_id: template.template_id } : {})
            };

            if (template?.template_id && template.template_id !== 'new') {
                const updatedTemplate = await updateTemplate(template.template_id, templateData as PromptTemplateUpdate);
                setSelectedTemplate(updatedTemplate);
            } else {
                const newTemplate = await createTemplate(templateData as PromptTemplateCreate);
                setSelectedTemplate(newTemplate);
                navigate(`/prompt/${newTemplate.template_id}`);
            }
            await refreshTemplates();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save template');
        } finally {
            setSaving(false);
        }
    };

    const handleTest = async () => {
        setTesting(true);
        setTestResult(null);
        try {
            setError(null);
            const testData: PromptTemplateTest = {
                user_message_template: userMessageTemplate,
                system_message_template: systemMessageTemplate,
                tokens,
                parameters: testParameters,
                output_schema: outputSchema
            };
            const result = await testTemplate(template?.template_id || '', testData);
            setTestResult(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to test template');
        } finally {
            setTesting(false);
        }
    };

    if (!id) return null;

    return (
        <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
            <PromptMenuBar
                name={name}
                isSaving={saving}
                isTesting={testing}
                hasUnsavedChanges={hasUnsavedChanges}
                onSave={handleSave}
                onTest={handleTest}
                onBack={handleBack}
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Basic Info Section */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Template Name
                            </label>
                            <input
                                ref={nameInputRef}
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                                placeholder="Enter template name"
                            />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Description
                            </label>
                            <input
                                type="text"
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                                placeholder="Enter template description"
                            />
                        </div>
                    </div>

                    {/* Message Templates Section */}
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="userMessage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                User Message Template
                            </label>
                            <textarea
                                ref={userMessageRef}
                                id="userMessage"
                                value={userMessageTemplate}
                                onChange={(e) => setUserMessageTemplate(e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white font-mono text-sm"
                                placeholder="Enter user message template"
                            />
                        </div>
                        <div>
                            <label htmlFor="systemMessage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                System Message Template (Optional)
                            </label>
                            <textarea
                                id="systemMessage"
                                value={systemMessageTemplate}
                                onChange={(e) => setSystemMessageTemplate(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white font-mono text-sm"
                                placeholder="Enter system message template"
                            />
                        </div>
                    </div>

                    {/* Output Schema Section */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Output Schema
                        </label>
                        <div className="border border-gray-300 dark:border-gray-600 rounded-md shadow-sm">
                            <SchemaEditor
                                schema={outputSchema}
                                onChange={setOutputSchema}
                            />
                        </div>
                    </div>

                    {/* Test Section */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Test Template</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {tokens.map((token) => (
                                <div key={token.name}>
                                    <label htmlFor={token.name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        {token.name}
                                    </label>
                                    {token.type === 'file' ? (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                id={token.name}
                                                value={testParameters[token.name] || ''}
                                                readOnly
                                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-800 dark:text-white"
                                                placeholder="Select a file"
                                            />
                                            <button
                                                onClick={() => {
                                                    setSelectedTokenName(token.name);
                                                    setShowFileSelector(true);
                                                }}
                                                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                Select
                                            </button>
                                        </div>
                                    ) : (
                                        <input
                                            type="text"
                                            id={token.name}
                                            value={testParameters[token.name] || ''}
                                            onChange={(e) => setTestParameters({ ...testParameters, [token.name]: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                                            placeholder={`Enter ${token.name}`}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                        {testResult && (
                            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                                <pre className="text-sm font-mono text-gray-900 dark:text-white whitespace-pre-wrap">
                                    {JSON.stringify(testResult, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* File Selector Dialog */}
            {showFileSelector && (
                <Dialog
                    isOpen={showFileSelector}
                    onClose={() => setShowFileSelector(false)}
                    title="Select File"
                >
                    <FileLibrary
                        onFileSelect={(fileId) => {
                            if (selectedTokenName) {
                                setTestParameters({ ...testParameters, [selectedTokenName]: fileId });
                            }
                            setShowFileSelector(false);
                        }}
                    />
                </Dialog>
            )}
        </div>
    );
};

export default PromptTemplate; 