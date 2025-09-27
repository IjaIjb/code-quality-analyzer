import React from "react";
import { FileText } from "lucide-react";

interface CodeInputSectionProps {
  code: string;
  isAnalyzing: boolean;
  onCodeChange: (code: string) => void;
  onAnalyzeCode: () => void;
}

const TEXTAREA_HEIGHT = "h-96";
const BUTTON_STATES = {
  disabled: "bg-slate-300 text-slate-500 cursor-not-allowed",
  enabled:
    "bg-blue-500 text-white hover:bg-blue-600 hover:-translate-y-0.5 shadow-lg shadow-blue-500/30",
} as const;

const AnalyzeButton: React.FC<{
  isAnalyzing: boolean;
  isDisabled: boolean;
  onClick: () => void;
}> = ({ isAnalyzing, isDisabled, onClick }) => {
  const buttonClass = `
        px-5 py-2 rounded-lg text-sm font-medium transition-all
        ${isDisabled ? BUTTON_STATES.disabled : BUTTON_STATES.enabled}
    `.trim();

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={buttonClass}
      aria-label={isAnalyzing ? "Analyzing code" : "Analyze code"}
    >
      {isAnalyzing ? "🔍 Analyzing..." : "🚀 Analyze Code"}
    </button>
  );
};

const CodeTextarea: React.FC<{
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}> = ({ value, onChange, disabled }) => (
  <textarea
    value={value}
    onChange={(e) => onChange(e.target.value)}
    disabled={disabled}
    className={`
            w-full ${TEXTAREA_HEIGHT} p-4 border-2 border-slate-200 rounded-lg 
            font-mono text-sm resize-none outline-none transition-colors 
            bg-slate-50 leading-relaxed focus:border-blue-400
        `
      .replace(/\s+/g, " ")
      .trim()}
    placeholder="Paste your React component code here..."
    aria-label="Code input textarea"
  />
);

const TipSection: React.FC = () => (
  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
    <span className="font-medium">💡 Tip:</span> Paste your React/TypeScript
    component code above and click "Analyze Code" to get instant feedback!
  </div>
);

const CodeInputSection: React.FC<CodeInputSectionProps> = ({
  code,
  isAnalyzing,
  onCodeChange,
  onAnalyzeCode,
}) => {
  const isButtonDisabled = isAnalyzing || !code.trim();

  return (
    <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <header className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <FileText className="w-5 h-5" aria-hidden="true" />
          Manual Code Input
        </h2>
        <AnalyzeButton
          isAnalyzing={isAnalyzing}
          isDisabled={isButtonDisabled}
          onClick={onAnalyzeCode}
        />
      </header>

      <CodeTextarea
        value={code}
        onChange={onCodeChange}
        disabled={isAnalyzing}
      />

      <TipSection />
    </section>
  );
};

export default CodeInputSection;
