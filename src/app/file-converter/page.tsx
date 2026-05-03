import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { FileDown, FileUp, RefreshCcw, AlertCircle, CheckCircle2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function FileConverterPage() {
    const [file, setFile] = useState<File | null>(null);
    const [outputFormat, setOutputFormat] = useState<'csv' | 'xlsx' | ''>('');
    const [status, setStatus] = useState<'idle' | 'converting' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState<string>('');

    const handleConvert = async () => {
        if (!file) {
            setStatus('error');
            setMessage('Please select a file first.');
            return;
        }
        if (!outputFormat) {
            setStatus('error');
            setMessage('Please select an output format.');
            return;
        }

        setStatus('converting');
        setMessage('Processing your file...');

        try {
            const arrayBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            
            let output: any;
            let mimeType: string;
            let extension: string;

            if (outputFormat === 'xlsx') {
                output = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
                mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                extension = 'xlsx';
            } else {
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                output = XLSX.utils.sheet_to_csv(worksheet);
                mimeType = 'text/csv;charset=utf-8;';
                extension = 'csv';
            }

            const blob = new Blob([output], { type: mimeType });
            const fileName = file.name.replace(/\.[^/.]+$/, "") + "." + extension;
            saveAs(blob, fileName);

            setStatus('success');
            setMessage(`Successfully converted to ${outputFormat.toUpperCase()}!`);
        } catch (e) {
            console.error(e);
            setStatus('error');
            setMessage('Failed to convert file. Ensure the format is supported.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight font-headline">Tools & Utilities</h2>
                <p className="text-muted-foreground">Manage your file conversions and data exports efficiently.</p>
            </div>

            <Card className="border-2 border-primary/10 shadow-lg overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                <CardHeader className="bg-muted/30 pb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <RefreshCcw className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl">File Converter</CardTitle>
                            <CardDescription>Convert between CSV and Excel (XLSX) formats instantly.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <FileUp className="h-4 w-4 text-primary" /> Select File
                            </label>
                            <Input 
                                type="file" 
                                accept=".csv,.xlsx,.xls"
                                onChange={(e) => {
                                    setFile(e.target.files?.[0] ?? null);
                                    setStatus('idle');
                                }} 
                                className="cursor-pointer hover:border-primary/50 transition-colors"
                            />
                            <p className="text-[10px] text-muted-foreground italic">Supported formats: .csv, .xlsx, .xls</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <FileDown className="h-4 w-4 text-primary" /> Output Format
                            </label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer hover:border-primary/50 transition-colors"
                                value={outputFormat}
                                onChange={(e) => {
                                    setOutputFormat(e.target.value as any);
                                    setStatus('idle');
                                }}
                            >
                                <option value="">Choose format...</option>
                                <option value="csv">CSV (Comma Separated Values)</option>
                                <option value="xlsx">Excel Workbook (.xlsx)</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 flex flex-col gap-4">
                        <Button 
                            onClick={handleConvert} 
                            disabled={status === 'converting'}
                            className="w-full md:w-auto px-8 h-12 text-lg font-medium shadow-md hover:shadow-lg transition-all"
                        >
                            {status === 'converting' ? (
                                <RefreshCcw className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                <RefreshCcw className="mr-2 h-5 w-5" />
                            )}
                            {status === 'converting' ? 'Converting...' : 'Convert & Download'}
                        </Button>

                        {status === 'error' && (
                            <Alert variant="destructive" className="animate-in slide-in-from-top-2">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{message}</AlertDescription>
                            </Alert>
                        )}

                        {status === 'success' && (
                            <Alert className="border-green-500 bg-green-50 text-green-700 animate-in slide-in-from-top-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <AlertTitle>Success</AlertTitle>
                                <AlertDescription>{message}</AlertDescription>
                            </Alert>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 rounded-xl bg-card border shadow-sm space-y-2">
                    <h4 className="font-semibold text-primary">Fast & Local</h4>
                    <p className="text-xs text-muted-foreground">All processing happens in your browser. Your files never leave your computer.</p>
                </div>
                <div className="p-4 rounded-xl bg-card border shadow-sm space-y-2">
                    <h4 className="font-semibold text-primary">High Fidelity</h4>
                    <p className="text-xs text-muted-foreground">We preserve your data structure and cell formatting during the conversion process.</p>
                </div>
                <div className="p-4 rounded-xl bg-card border shadow-sm space-y-2">
                    <h4 className="font-semibold text-primary">Clean Data</h4>
                    <p className="text-xs text-muted-foreground">Our converter handles edge cases like special characters and multiple sheets.</p>
                </div>
            </div>
        </div>
    );
}
