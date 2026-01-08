import React, { useState } from 'react';
import { Layout } from './components/ui/Layout';
import { StepUpload, StepTemplate, StepMapping, StepPreview, StepGenerate } from './components/Steps';
import { AppStep, ContactRow, MappingState, GeneratedEmail } from './types';
import { downloadCSV } from './utils/csvHelper';

const App: React.FC = () => {
  // App Flow State
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD);

  // Data State
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvData, setCsvData] = useState<ContactRow[]>([]);
  const [template, setTemplate] = useState<string>("");
  const [mapping, setMapping] = useState<MappingState>({});

  const handleGenerationFinish = (results: GeneratedEmail[][]) => {
    // Automatically download CSV on finish
    downloadCSV(csvData, results, `outbound-ai-results-${Date.now()}.csv`);
  };

  return (
    <Layout currentStep={step}>
      {step === AppStep.UPLOAD && (
        <StepUpload 
          onDataLoaded={(headers, data) => {
            setCsvHeaders(headers);
            setCsvData(data);
          }}
          next={() => setStep(AppStep.TEMPLATE)}
        />
      )}

      {step === AppStep.TEMPLATE && (
        <StepTemplate 
          template={template}
          setTemplate={setTemplate}
          next={() => setStep(AppStep.MAPPING)}
          back={() => setStep(AppStep.UPLOAD)}
        />
      )}

      {step === AppStep.MAPPING && (
        <StepMapping 
          headers={csvHeaders}
          template={template}
          mapping={mapping}
          setMapping={setMapping}
          next={() => setStep(AppStep.PREVIEW)}
          back={() => setStep(AppStep.TEMPLATE)}
        />
      )}

      {step === AppStep.PREVIEW && (
        <StepPreview
          apiKey={process.env.GEMINI_API_KEY || ""}
          template={template}
          mapping={mapping}
          data={csvData}
          next={() => setStep(AppStep.GENERATE)}
          back={() => setStep(AppStep.MAPPING)}
        />
      )}

      {step === AppStep.GENERATE && (
        <StepGenerate
          template={template}
          mapping={mapping}
          data={csvData}
          back={() => setStep(AppStep.PREVIEW)}
          onFinish={handleGenerationFinish}
        />
      )}
    </Layout>
  );
};

export default App;